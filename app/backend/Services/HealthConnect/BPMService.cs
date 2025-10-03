using IoTM.Config;
using IoTM.Dtos.HealthPoints;
using IoTM.Models.HealthSegments;
using Microsoft.Extensions.Options;

namespace IoTM.Services.HealthConnect;

public class BPMService
{
    private readonly BPMThresholds _thresholds;
    public BPMService(IOptions<HealthThresholds> options)
    {
        // this grabs the configured thresholds
        _thresholds = options.Value.BPM;
    }

    private void CategoriseSegment(HealthSegmentBPM healthSegmentBPM)
    {
        // Categorisation based on value
        GenericCategory? outputCategory = _thresholds.Categories.FirstOrDefault(c => healthSegmentBPM.AverageBpm >= c.Min && healthSegmentBPM.AverageBpm <= c.Max);
        // Categorisation basd on deviation
        GenericCategory? deviationCategory = _thresholds.DeviationCategories.FirstOrDefault(c => healthSegmentBPM.StandardDeviation >= c.Min && healthSegmentBPM.StandardDeviation <= c.Max);
        // Compare priorities only if both categories exist
        if (deviationCategory is not null)
        {
            if (outputCategory is null || deviationCategory.Priority < outputCategory.Priority)
            {
                outputCategory = deviationCategory;
            }
        }
        healthSegmentBPM.Category = outputCategory?.Name ?? "Unclassified";
        return;
    }

    private HealthSegmentBPM CreateSegmentEntity(List<BPMPointDto> points, Guid userId)
    {
        double average = points.Average(p => p.Bpm);
        // Standard deviation calculation
        double stdDev = Math.Sqrt(
            points.Average(p => Math.Pow(p.Bpm - average, 2))
        );
        // Create entity
        HealthSegmentBPM healthSegmentBPM = new()
        {
            UserId = userId,
            Start = points.First().Time,
            End = points.Last().Time,
            Points = points.Count,
            AverageBpm = Math.Round(average, 2),
            StandardDeviation = Math.Round(stdDev, 2)
        };
        // Categorize segment
        CategoriseSegment(healthSegmentBPM);
        return healthSegmentBPM;
    }

    private static List<BPMPointDto> HandleRecentSegment(List<BPMPointDto> points, HealthSegmentBPM? recentSegment, List<HealthSegmentBPM> segments)
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

    private bool IsBelowStdDevThreshold(List<BPMPointDto> segment)
    {
        var bpms = segment.Select(p => p.Bpm).ToList();
        double avg = bpms.Average();
        double stdDev = Math.Sqrt(bpms.Average(b => Math.Pow(b - avg, 2)));

        return stdDev < _thresholds.StdDevThreshold;
    }

    public List<HealthSegmentBPM> SegmentData(List<BPMPointDto> points, Guid userId, HealthSegmentBPM? recentSegment)
    {
        var sortedPoints = points.OrderBy(p => p.Time).ToList();
        List<HealthSegmentBPM> segments = [];

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