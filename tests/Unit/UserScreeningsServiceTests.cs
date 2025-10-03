using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using IoTM.Data;
using IoTM.Models;
using IoTM.Services;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using IoTM.Tests.TestUtils;

namespace IoTM.Tests.Unit;

public class UserScreeningsServiceTests
{
    private static IUserScreeningsService CreateService(ApplicationDbContext ctx)
    {
        var logger = new Mock<ILogger<UserScreeningsService>>().Object;
        var guidelineSvc = new Mock<IScreeningGuidelineService>(MockBehavior.Strict);
        guidelineSvc.Setup(g => g.MapToDto(It.IsAny<ScreeningGuideline>()))
            .Returns<ScreeningGuideline>(g => new IoTM.Dtos.ScreeningGuidelineDto
            {
                Id = g.GuidelineId,
                Name = g.Name,
                ScreeningType = g.ScreeningType,
                RecommendedFrequency = $"{g.DefaultFrequencyMonths} months",
                Category = g.Category,
                Description = g.Description,
                IsRecurring = g.IsRecurring
            });
        return new UserScreeningsService(ctx, (ILogger<UserScreeningsService>)logger, guidelineSvc.Object);
    }

    [Fact]
    public async Task GetHiddenScreeningsForUserAsync_Should_Return_Only_Skipped()
    {
        using var ctx = DbContextFactory.CreateInMemory();
        var userId = Guid.NewGuid();
        var guideline = new ScreeningGuideline
        {
            GuidelineId = Guid.NewGuid(),
            Name = "Test",
            ScreeningType = "Type",
            DefaultFrequencyMonths = 12,
            Category = ScreeningCategory.screening,
            Description = "desc",
            SourceOrganisation = "org",
            LastUpdated = DateOnly.FromDateTime(DateTime.UtcNow),
            IsRecurring = true
        };
        ctx.ScreeningGuidelines.Add(guideline);
        ctx.UserScreenings.AddRange(
            new UserScreening { UserId = userId, GuidelineId = guideline.GuidelineId, Status = ScreeningStatus.skipped },
            new UserScreening { UserId = userId, GuidelineId = guideline.GuidelineId, Status = ScreeningStatus.pending }
        );
        await ctx.SaveChangesAsync();
        var sut = CreateService(ctx);

        var result = await sut.GetHiddenScreeningsForUserAsync(userId);

        result.Should().HaveCount(1);
        result.First().Status.Should().Be(ScreeningStatus.skipped);
    }

    [Fact]
    public async Task ScheduleScreening_Should_Create_Scheduled_And_Link_Guideline_Set_Status_Scheduled()
    {
        // Arrange
        using var ctx = DbContextFactory.CreateInMemory();
        var userId = Guid.NewGuid();
        var guideline = new ScreeningGuideline
        {
            GuidelineId = Guid.NewGuid(),
            Name = "Annual Checkup",
            ScreeningType = "general",
            DefaultFrequencyMonths = 12,
            Category = ScreeningCategory.checkup,
            Description = "General annual health check",
            SourceOrganisation = "org",
            LastUpdated = DateOnly.FromDateTime(DateTime.UtcNow),
            IsRecurring = false
        };
        ctx.ScreeningGuidelines.Add(guideline);
        await ctx.SaveChangesAsync();

        var sut = CreateService(ctx);
        var scheduledDate = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(14));

        // Act
        await sut.ScheduleScreening(userId, guideline.GuidelineId, scheduledDate);

        // Assert
        var userScreening = ctx.UserScreenings.Single(us => us.UserId == userId && us.GuidelineId == guideline.GuidelineId);
        userScreening.Status.Should().Be(ScreeningStatus.scheduled);

        var scheduled = ctx.ScheduledScreenings.Single(ss => ss.ScreeningId == userScreening.ScreeningId);
        scheduled.ScheduledDate.Should().Be(scheduledDate);
        scheduled.IsActive.Should().BeTrue();
        scheduled.UserScreening.GuidelineId.Should().Be(guideline.GuidelineId);
    }
}
