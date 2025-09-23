using IoTM.Config;
using IoTM.Models.HealthSegments;
using Microsoft.Extensions.Options;

namespace IoTM.Services.HealthConnect;

public class SpO2Service(IOptions<HealthThresholds> options)
{
    private readonly SpO2Thresholds _thresholds = options.Value.SpO2;

    private void CategoriseSegment(HealthSegmentSpO2 healthSegmentSpO2)
    {
        // Categorisation based on value
        GenericCategory? outputCategory = _thresholds.Categories.FirstOrDefault(c => healthSegmentSpO2.AverageSpO2 >= c.Min && healthSegmentSpO2.AverageSpO2 <= c.Max);
        // Categorisation basd on deviation
        GenericCategory? deviationCategory = _thresholds.DeviationCategories.FirstOrDefault(c => healthSegmentSpO2.StandardDeviation >= c.Min && healthSegmentSpO2.StandardDeviation <= c.Max);
        // Compare priorities only if both categories exist
        if (deviationCategory is not null)
        {
            if (outputCategory is null || deviationCategory.Priority < outputCategory.Priority)
            {
                outputCategory = deviationCategory;
            }
        }
        healthSegmentSpO2.Category = outputCategory?.Name ?? "Unclassified";
        return;
    }

    private HealthSegmentSpO2 CreateSegmentEntity(List<PointDto> points, Guid userId)
    {
        // Extract non-null percentages
        var nonNullPercentages = points
            .Select(p => p.Percentage)
            .Where(p => p.HasValue)
            .Select(p => p.Value)
            .ToList();

        if (nonNullPercentages.Count != 0)
        {
            double average = nonNullPercentages.Average();
            // Standard deviation calculation
            double stdDev = Math.Sqrt(nonNullPercentages
                .Average(b => Math.Pow(b - average, 2)));
            // Create entity
            HealthSegmentSpO2 healthSegmentSpO2 = new()
            {
                UserId = userId,
                Start = points.First().Time,
                End = points.Last().Time,
                Points = points.Count,
                AverageSpO2 = Math.Round(average, 2),
                StandardDeviation = Math.Round(stdDev, 2)
            };
            // Categorize segment
            CategoriseSegment(healthSegmentSpO2);
            return healthSegmentSpO2;
        }
        else
        {
            throw new InvalidOperationException("Cannot create segment: no valid (non-null) percentage values found.");
        }
    }

    private static List<PointDto> HandleRecentSegment(List<PointDto> points, HealthSegmentSpO2? recentSegment, List<HealthSegmentSpO2> segments)
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

    private bool IsBelowStdDevThreshold(List<PointDto> segment)
    {
        var percentage = segment.Select(p => p.Percentage).Where(b => b.HasValue).Select(b => b.Value).ToList();
        double avg = percentage.Average();
        double stdDev = Math.Sqrt(percentage.Average(b => Math.Pow(b - avg, 2)));

        return stdDev < _thresholds.StdDevThreshold;
    }

    public List<HealthSegmentSpO2> SegmentData(List<PointDto> points, Guid userId, HealthSegmentSpO2? recentSegment)
    {
        var sortedPoints = points.OrderBy(p => p.Time).ToList();
        List<HealthSegmentSpO2> segments = [];

        sortedPoints = HandleRecentSegment(sortedPoints, recentSegment, segments);

        if (sortedPoints.Count == 0)
            return segments;

        int segmentStartIndex = 0;
        int segmentEndIndex = segmentStartIndex;

        while (segmentEndIndex < sortedPoints.Count)
        {
            var testSegment = sortedPoints.GetRange(segmentStartIndex, segmentEndIndex - segmentStartIndex + 1);
            var duration = testSegment.Last().Time - testSegment.First().Time;

            if (duration < TimeSpan.FromHours(_thresholds.MinSegmentDuration))
            {   // increase length of segment
                segmentEndIndex++;
                continue;
            }

            if (duration > TimeSpan.FromHours(_thresholds.MaxSegmentDuration))
            {   // End Segment
                var longSegment = sortedPoints.GetRange(segmentStartIndex, segmentEndIndex - segmentStartIndex);
                segments.Add(CreateSegmentEntity(longSegment, userId));
                segmentStartIndex = segmentEndIndex;
                continue;
            }

            if (IsBelowStdDevThreshold(testSegment))
            {   // Increase Length of segment
                segmentEndIndex++;
                continue;
            }
            // End Segment
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