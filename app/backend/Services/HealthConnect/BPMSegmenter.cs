using IoTM.Config;
using IoTM.Models;
using Microsoft.Extensions.Options;

namespace IoTM.Services.HealthConnect;

public class BPMSegmenter
{
    private readonly BPMThresholds _thresholds;
    public BPMSegmenter(IOptions<HealthThresholds> options)
    {
        // this grabs the configured thresholds
        _thresholds = options.Value.BPM;
    }

    public List<HealthSegmentBPM> SegmentData(List<PointDto> points, Guid userId)
    {
        var sortedPoints = points.OrderBy(p => p.Time).ToList();
        List<HealthSegmentBPM> segments = new();
        int start = 0;
        int end = start;
        while (end < sortedPoints.Count - 1)
        // Start->end is set, but we are checking start->end+1
        // The if's check if we can make the segment bigger
        {
            Console.WriteLine($"Start index: {start}, End: {end}, Index Between: {end - start + 1}");
            var currentSegment = sortedPoints.GetRange(start, end - start + 1);
            var duration = currentSegment.Last().Time - currentSegment.First().Time;

            // If its shorter than 3 hours, make it larger
            if (duration < TimeSpan.FromHours(_thresholds.MinSegmentDuration))
            {
                end++;
                continue;
            }
            if (duration > TimeSpan.FromHours(_thresholds.MaxSegmentDuration))
            {
                // We will create a segement from this
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
            //  if stDev exceeds is less than threshold, then continue
            if (stdDev < _thresholds.StdDevThreshold)
            {
                end++;
                continue;
            }
            // We will create a segement from this
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

        return new HealthSegmentBPM
        {
            UserId = userId,
            Start = points.First().Time,
            End = points.Last().Time,
            Points = points.Count,
            AverageBpm = Math.Round(average, 2),
            StandardDeviation = Math.Round(stdDev, 2)
            // DurationHours is automatically calculated
        };
    }
}