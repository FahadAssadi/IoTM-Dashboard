using IoTM.Config;
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

    public List<HealthSegmentBPM> SegmentData(List<PointDto> points,  Guid userId, HealthSegmentBPM? recentSegment)
    {
        var sortedPoints = points.OrderBy(p => p.Time).ToList(); // Order Segments
        List<HealthSegmentBPM> segments = []; // Initialise Output Segment List
        if (recentSegment != null)
        {   // If there is most recent segment, remove overlapping points prior to the most recent segment
            sortedPoints = sortedPoints.Where(p => p.Time >= recentSegment.Start).ToList();
            // If the segment starts before the points start
            if (recentSegment.Start < sortedPoints.First().Time)
            {   // Keep the most recent segment and discard the points that overlap with the most recent segment
                segments.Add(recentSegment);
                sortedPoints = sortedPoints.Where(p => p.Time > recentSegment.End).ToList();
            }
            // else: Discard the most recent segment and use new data points to recalculate it
            // Segment has already been dropped from the DB
        }
        int start = 0;
        int end = start;
        while (end < sortedPoints.Count - 1)
        {
            // Console.WriteLine($"Start index: {start}, End: {end}, Index Between: {end - start + 1}");
            var currentSegment = sortedPoints.GetRange(start, end - start + 1);
            var duration = currentSegment.Last().Time - currentSegment.First().Time;
            // Make it larger if it belows threshold length
            if (duration < TimeSpan.FromHours(_thresholds.MinSegmentDuration))
            {
                end++;
                continue;
            }
            if (duration > TimeSpan.FromHours(_thresholds.MaxSegmentDuration))
            {   // Create Segment if its too long
                var longSegment = sortedPoints.GetRange(start, end - start);
                segments.Add(CreateSegmentEntity(longSegment, userId));
                // Reposition Partitions
                start = end;
                continue;
            }
            // If it's larger then check the stdev
            var bpms = currentSegment.Select(p => p.Bpm).ToList();
            double average = bpms.Average();
            double stdDev = Math.Sqrt(bpms.Average(b => Math.Pow(b - average, 2)));
            //  if stDev is less than threshold, then continue
            if (stdDev < _thresholds.StdDevThreshold)
            {
                end++;
                continue;
            }
            // Otherwise We will create a segement from this
            var segment = sortedPoints.GetRange(start, end - start);
            segments.Add(CreateSegmentEntity(segment, userId));
            // Reposition Partitions
            start = end;
        }
        // Then if we finish with the an incomplete final segment,
        // Add a segment from the final start to the last dataPoint
        if (start < sortedPoints.Count)
        {
            var segment = sortedPoints.GetRange(start, sortedPoints.Count - start);
            segments.Add(CreateSegmentEntity(segment, userId));
        }
        return segments;
    }

    private HealthSegmentBPM CreateSegmentEntity(List<PointDto> points, Guid userId)
    {
        var bpms = points.Select(p => p.Bpm).ToList();
        double average = bpms.Average();
        double stdDev = Math.Sqrt(bpms.Average(b => Math.Pow(b - average, 2)));
        HealthSegmentBPM healthSegmentBPM = new HealthSegmentBPM
        {
            UserId = userId,
            Start = points.First().Time,
            End = points.Last().Time,
            Points = points.Count,
            AverageBpm = Math.Round(average, 2),
            StandardDeviation = Math.Round(stdDev, 2)
        };
        // Adds category
        CategoriseSegment(healthSegmentBPM);
        // returns
        return healthSegmentBPM;
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
}