// SleepService.cs
using IoTM.Dtos.HealthPoints;
using IoTM.Models;
using IoTM.Models.HealthSegments;

namespace IoTM.Services.HealthConnect
{
    public class SleepService()
    {
        private static HealthSegmentSleep CreateSegmentEntity(SleepSegmentDto point, Guid userId)
        {
            HealthSegmentSleep healthSegmentSleep = new()
            {
                UserId = userId,
                Start = point.Start,
                End = point.End,
                Category = point.StageName
            };
            return healthSegmentSleep;
        }

        private static List<SleepSegmentDto> HandleRecentSegment(List<SleepSegmentDto> points, HealthSegmentSleep? recentSegment, List<HealthSegmentSleep> segments)
        {
            if (recentSegment == null)
                return points;

            // Remove points that end before the recent segment starts
            var filteredPoints = points.Where(p => p.End >= recentSegment.Start).ToList();

            if (filteredPoints.Count == 0)
                return [];

            // TODO: Make sure this works properly
            // If recent segment starts before new points start, keep it and exclude overlaps
            if (recentSegment.Start < filteredPoints.First().Start)
            {
                segments.Add(recentSegment);
                filteredPoints = filteredPoints.Where(p => p.End > recentSegment.Start).ToList();
            }

            return filteredPoints;
        }

        public List<HealthSegmentSleep> SegmentData(List<SleepSegmentDto> points, Guid userId, HealthSegmentSleep? recentSegment)
        {
            var sortedPoints = points.OrderBy(p => p.Start).ToList();
            List<HealthSegmentSleep> segments = [];

            sortedPoints = HandleRecentSegment(sortedPoints, recentSegment, segments);
            if (sortedPoints.Count == 0)
                return segments;

            for (int i = 0; i < sortedPoints.Count; i++)
            {
                segments.Add(CreateSegmentEntity(sortedPoints[i], userId));
            }
            return segments;
        }
    }
}