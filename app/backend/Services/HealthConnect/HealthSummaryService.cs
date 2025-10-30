using IoTM.Data;
using IoTM.Models.HealthSegments;
using Microsoft.EntityFrameworkCore;

namespace IoTM.Services.HealthConnect
{
    public class HealthSummaryService
    {
        public async Task GenerateBlankHealthSummarys(ApplicationDbContext context, DateTime earliestDate, Guid userId)
        {
        // Define the latest date - Midnight today
        var todayMidnight = DateTime.Today;
        // Get all existing summaries for this user
            var existingSummaries = await context.HealthSegmentSummarys
            .Where(s => s.UserId == userId)
            .ToListAsync();
        // Loop through each day from earliest (or 30 days prior) → today
        var currentStart = earliestDate.Date > todayMidnight.AddDays(-30) ? earliestDate.Date : todayMidnight.AddDays(-30) ;
        while (currentStart < todayMidnight)
        {
            var nextEnd = currentStart.AddDays(1);
            // Check if a summary for this exact day already exists
            bool exists = existingSummaries.Any(s =>
                s.Start == currentStart && s.End == nextEnd);
            // If not, create a new blank summary
            if (!exists)
            {
                var newSummary = new HealthSegmentSummary
                {
                    UserId = userId,
                    Start = currentStart,
                    End = nextEnd,
                    AverageSpO2 = null,
                    AverageBpm = null,
                    AverageSystolic = null,
                    AverageDiastolic = null
                };
                context.HealthSegmentSummarys.Add(newSummary);
            }
            currentStart = nextEnd;
        }
        await context.SaveChangesAsync();
        }
    }
}