using IoTM.Config;
using IoTM.Models.HealthSegments;
using Microsoft.Extensions.Options;
using IoTM.Dtos.HealthPoints;
using IoTM.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.TagHelpers;

namespace IoTM.Services.HealthConnect;

public class BloodPressureService(IOptions<HealthThresholds> options)
{
    private readonly BloodPressureThresholds _thresholds = options.Value.BloodPressure;
    public async Task<List<HealthSegmentSummary>> UpdateHealthSummary(ApplicationDbContext context, List<HealthSegmentBloodPressure> healthSegmentBloodPressures, Guid userId)
    {
        var earliestDate = healthSegmentBloodPressures.Min(s => s.Start);
        // Update Existing Health Segments
        var healthSummaryService = new HealthSummaryService();
        await healthSummaryService.GenerateBlankHealthSummarys(context, earliestDate, userId);
        // Retrieve and filter HealthSegments
        var healthSummarySegments = await context.HealthSegmentSummarys.ToListAsync();
        var filteredSegments = healthSummarySegments
            .Where(s => s.UserId == userId) // Sort by userId
            .Where(s => s.End > earliestDate) // All values preceeding the earlist segment date
            .OrderBy(s => s.End) // Ordered
            .ToList();
        // For each health summary segment, find all segments that overlap with it
        foreach (var summary in healthSummarySegments)
        {
            // Get all segments where the time ranges overlap
            var overlappingSegments = healthSegmentBloodPressures
                .Where(s => s.Start <= summary.End && s.End >= summary.Start)
                .ToList();
            if (overlappingSegments.Count != 0)
            {
                // Calculate average of the overlapping segment averages
                summary.AverageSystolic = overlappingSegments.Average(s => s.AverageSystolic);
                summary.AverageDiastolic = overlappingSegments.Average(s => s.AverageDiastolic);
                summary.BloodPressureStandardDeviation = (overlappingSegments.Average(s => s.AverageSystolic) + overlappingSegments.Average(s => s.AverageSystolic)) / 2;
            }
        }
        await context.SaveChangesAsync();
        return filteredSegments;
    }

    private void CategoriseSegment(HealthSegmentBloodPressure healthSegmentBloodPressure)
    {
        // Categorisation based on value
        BloodPressureCategory? systolicCategory = _thresholds.Categories.FirstOrDefault(c => healthSegmentBloodPressure.AverageSystolic >= c.SystolicMin && healthSegmentBloodPressure.AverageSystolic <= c.SystolicMax);
        BloodPressureCategory? diastolicCategory = _thresholds.Categories.FirstOrDefault(c => healthSegmentBloodPressure.AverageDiastolic >= c.DiastolicMin && healthSegmentBloodPressure.AverageDiastolic <= c.DiastolicMax);
        // Categorisation basd on deviation
        GenericCategory? systolicDeviationCategory = _thresholds.DeviationCategories.FirstOrDefault(c => healthSegmentBloodPressure.SystolicStandardDeviation >= c.Min && healthSegmentBloodPressure.SystolicStandardDeviation <= c.Max);
        GenericCategory? diastolicDeviationCategory = _thresholds.DeviationCategories.FirstOrDefault(c => healthSegmentBloodPressure.DiastolicStandardDeviation >= c.Min && healthSegmentBloodPressure.DiastolicStandardDeviation <= c.Max);
        // Compare categories and priorities is unfinished ~
        // TODO: Compare the categories and return a more indepth category - may require the setup of an interface
        healthSegmentBloodPressure.Category = "Systolic Category - " + systolicCategory?.Name ?? "Unclassified (FIX THIS)";
        return;
    }

    private HealthSegmentBloodPressure CreateSegmentEntity(List<BloodPressurePointDto> points, Guid userId)
    {
        double averageSystolic = points.Average(p => p.Systolic);
        double averageDiastolic = points.Average(p => p.Diastolic);
        // Standard deviation calculation
        double stdDevSystolic = Math.Sqrt(
            points.Average(p => Math.Pow(p.Systolic - averageSystolic, 2))
        );
        double stdDevDiastolic = Math.Sqrt(
            points.Average(p => Math.Pow(p.Diastolic - averageDiastolic, 2))
        );
        // Create entity
        HealthSegmentBloodPressure healthSegmentBloodPressure = new()
        {
            UserId = userId,
            Start = points.First().Time,
            End = points.Last().Time,
            Points = points.Count,
            AverageDiastolic = Math.Round(averageDiastolic, 2),
            AverageSystolic = Math.Round(averageSystolic, 2),
            SystolicStandardDeviation = Math.Round(stdDevSystolic, 2),
            DiastolicStandardDeviation = Math.Round(stdDevDiastolic, 2)
        };
        // Categorize segment
        CategoriseSegment(healthSegmentBloodPressure);
        return healthSegmentBloodPressure;
    }

    private static List<BloodPressurePointDto> HandleRecentSegment(List<BloodPressurePointDto> points, HealthSegmentBloodPressure? recentSegment, List<HealthSegmentBloodPressure> segments)
    {
        if (recentSegment == null)
            return points;

        // Remove points before the recent segment start
        var filteredPoints = points.Where(p => p.Time >= recentSegment.Start).ToList();

        if (filteredPoints.Count == 0)
            return [];

        // If recent segment starts before new points start, keep it and exclude overlaps
        if (recentSegment.Start < filteredPoints.First().Time)
        {
            segments.Add(recentSegment);
            filteredPoints = filteredPoints.Where(p => p.Time > recentSegment.End).ToList();
        }

        return filteredPoints;
    }

    private bool IsBelowStdDevThreshold(List<BloodPressurePointDto> segment)
    {
        var systolicValues = segment.Select(p => p.Systolic).ToList();
        double avg = systolicValues.Average();
        double stdDev = Math.Sqrt(systolicValues.Average(b => Math.Pow(b - avg, 2)));

        return stdDev < _thresholds.StdDevThreshold;
    }

    public List<HealthSegmentBloodPressure> SegmentData(List<BloodPressurePointDto> points, Guid userId, HealthSegmentBloodPressure? recentSegment)
    {
        var sortedPoints = points.OrderBy(p => p.Time).ToList();
        List<HealthSegmentBloodPressure> segments = [];

        sortedPoints = HandleRecentSegment(sortedPoints, recentSegment, segments);

        if (sortedPoints.Count == 0)
            return segments;

        int segmentStartIndex = 0;
        int segmentEndIndex = segmentStartIndex;

        while (segmentEndIndex < sortedPoints.Count)
        {
            var currentSegment = sortedPoints.GetRange(segmentStartIndex, segmentEndIndex - segmentStartIndex + 1);
            var duration = currentSegment.Last().Time - currentSegment.First().Time;

            if (duration < TimeSpan.FromHours(_thresholds.MinSegmentDuration))
            {
                segmentEndIndex++;
                continue;
            }

            if (duration > TimeSpan.FromHours(_thresholds.MaxSegmentDuration))
            {
                var longSegment = sortedPoints.GetRange(segmentStartIndex, segmentEndIndex - segmentStartIndex);
                segments.Add(CreateSegmentEntity(longSegment, userId));
                segmentStartIndex = segmentEndIndex;
                continue;
            }

            if (IsBelowStdDevThreshold(currentSegment))
            {
                segmentEndIndex++;
                continue;
            }

            var segment = sortedPoints.GetRange(segmentStartIndex, segmentEndIndex - segmentStartIndex);
            segments.Add(CreateSegmentEntity(segment, userId));
            segmentStartIndex = segmentEndIndex;
        }
        // Add final segment if needed
        if (segmentStartIndex < sortedPoints.Count)
        {
            var finalSegment = sortedPoints.GetRange(segmentStartIndex, sortedPoints.Count - segmentStartIndex);
            segments.Add(CreateSegmentEntity(finalSegment, userId));
        }

        return segments;
    }
}