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
using Microsoft.EntityFrameworkCore;

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

    [Fact]
    public async Task GetVisibleScreeningsForUserPagedAsync_Should_Return_Correct_Page_And_Total()
    {
        // Arrange
        using var ctx = DbContextFactory.CreateInMemory();
        var userId = Guid.NewGuid();

        // Create 1 guideline reused across screenings
        var guideline = new ScreeningGuideline
        {
            GuidelineId = Guid.NewGuid(),
            Name = "Test Guideline",
            ScreeningType = "type",
            DefaultFrequencyMonths = 12,
            Category = ScreeningCategory.screening,
            Description = "desc",
            SourceOrganisation = "org",
            LastUpdated = DateOnly.FromDateTime(DateTime.UtcNow),
            IsRecurring = true
        };
        ctx.ScreeningGuidelines.Add(guideline);

        // 12 total screenings, but make 10 visible (exclude skipped/completed)
        for (int i = 0; i < 12; i++)
        {
            var status = ScreeningStatus.pending; // visible by default
            if (i >= 10)
            {
                status = i == 10 ? ScreeningStatus.skipped : ScreeningStatus.completed; // not visible
            }

            ctx.UserScreenings.Add(new UserScreening
            {
                ScreeningId = Guid.NewGuid(),
                UserId = userId,
                GuidelineId = guideline.GuidelineId,
                Status = status,
                CreatedAt = DateTime.UtcNow.AddMinutes(i),
                UpdatedAt = DateTime.UtcNow.AddMinutes(i)
            });
        }
        await ctx.SaveChangesAsync();

        var sut = CreateService(ctx);

        // Act: page 2, pageSize 4 => items 5–8 of the 10 visible
        var (items, total) = await sut.GetVisibleScreeningsForUserPagedAsync(userId, page: 2, pageSize: 4);

        // Assert
        total.Should().Be(10);
        items.Should().HaveCount(4);
        // Confirm deterministic ordering: the service orders by Guideline.Name then takes page slice.
        // Since all share the same guideline, ordering falls back to insertion order from EF (which is deterministic here by CreatedAt).
        // We'll verify these are the 5th–8th visible items (indices 4..7 of the visible set).

        var allVisible = await ctx.UserScreenings
            .Include(us => us.Guideline)
            .Where(us => us.UserId == userId && us.Status != ScreeningStatus.skipped && us.Status != ScreeningStatus.completed)
            .OrderBy(us => us.Guideline.Name)
            .ToListAsync();

        var expectedSlice = allVisible.Skip(4).Take(4).Select(us => us.ScreeningId).ToList();
        var actualSlice = items.Select(us => us.ScreeningId).ToList();
        actualSlice.Should().BeEquivalentTo(expectedSlice, opts => opts.WithStrictOrdering());
    }

    [Fact]
    public async Task ScheduleScreening_Should_Be_Idempotent_For_Duplicate_Date()
    {
        using var ctx = DbContextFactory.CreateInMemory();
        var userId = Guid.NewGuid();
        var guideline = new ScreeningGuideline
        {
            GuidelineId = Guid.NewGuid(),
            Name = "Duplicate Test",
            ScreeningType = "type",
            DefaultFrequencyMonths = 12,
            Category = ScreeningCategory.screening,
            Description = "desc",
            SourceOrganisation = "org",
            LastUpdated = DateOnly.FromDateTime(DateTime.UtcNow),
            IsRecurring = true
        };
        ctx.ScreeningGuidelines.Add(guideline);
        await ctx.SaveChangesAsync();

        var sut = CreateService(ctx);
        var date = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(7));

    var first = await sut.ScheduleScreening(userId, guideline.GuidelineId, date);
    var second = await sut.ScheduleScreening(userId, guideline.GuidelineId, date);

    first.Should().BeTrue();
    second.Should().BeFalse();

        var userScreening = ctx.UserScreenings.Single(us => us.UserId == userId && us.GuidelineId == guideline.GuidelineId);
        var scheduled = ctx.ScheduledScreenings.Where(ss => ss.ScreeningId == userScreening.ScreeningId && ss.IsActive).ToList();
        scheduled.Should().HaveCount(1);
        scheduled[0].ScheduledDate.Should().Be(date);
    }
}
