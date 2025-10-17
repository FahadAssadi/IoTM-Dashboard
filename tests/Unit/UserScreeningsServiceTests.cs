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
        var service = CreateService(ctx);

        var result = await service.GetHiddenScreeningsForUserAsync(userId);

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

        var service = CreateService(ctx);
        var scheduledDate = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(14));

        // Act
        await service.ScheduleScreening(userId, guideline.GuidelineId, scheduledDate);

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

        var service = CreateService(ctx);

        // Act: page 2, pageSize 4 => items 5–8 of the 10 visible
        var (items, total) = await service.GetVisibleScreeningsForUserPagedAsync(userId, page: 2, pageSize: 4);

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

        var service = CreateService(ctx);
        var date = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(7));

    var first = await service.ScheduleScreening(userId, guideline.GuidelineId, date);
    var second = await service.ScheduleScreening(userId, guideline.GuidelineId, date);

    first.Should().BeTrue();
    second.Should().BeFalse();

        var userScreening = ctx.UserScreenings.Single(us => us.UserId == userId && us.GuidelineId == guideline.GuidelineId);
        var scheduled = ctx.ScheduledScreenings.Where(ss => ss.ScreeningId == userScreening.ScreeningId && ss.IsActive).ToList();
        scheduled.Should().HaveCount(1);
        scheduled[0].ScheduledDate.Should().Be(date);
    }

    [Fact]
    public async Task CancelScheduledScreening_Should_Remove_Active_Scheduled_Item()
    {
        // Arrange
        using var ctx = DbContextFactory.CreateInMemory();
        var userId = Guid.NewGuid();
        var guideline = new ScreeningGuideline
        {
            GuidelineId = Guid.NewGuid(),
            Name = "Cancel Test",
            ScreeningType = "type",
            DefaultFrequencyMonths = 12,
            Category = ScreeningCategory.screening,
            Description = "desc",
            SourceOrganisation = "org",
            LastUpdated = DateOnly.FromDateTime(DateTime.UtcNow),
            IsRecurring = true // recurring to exercise status revert path
        };
        ctx.ScreeningGuidelines.Add(guideline);

        var userScreening = new UserScreening
        {
            ScreeningId = Guid.NewGuid(),
            UserId = userId,
            GuidelineId = guideline.GuidelineId,
            Status = ScreeningStatus.scheduled,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        ctx.UserScreenings.Add(userScreening);

        var scheduled = new ScheduledScreening
        {
            ScheduledScreeningId = Guid.NewGuid(),
            ScreeningId = userScreening.ScreeningId,
            ScheduledDate = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(3)),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        ctx.ScheduledScreenings.Add(scheduled);
        await ctx.SaveChangesAsync();

        var service = CreateService(ctx);

        // Act
        await service.CancelScheduledScreening(scheduled.ScheduledScreeningId);

        // Assert: scheduled entry is removed
        var stillThere = await ctx.ScheduledScreenings
            .AnyAsync(ss => ss.ScheduledScreeningId == scheduled.ScheduledScreeningId);
        stillThere.Should().BeFalse();

        // And the parent user screening remains
        var parentExists = await ctx.UserScreenings.AnyAsync(us => us.ScreeningId == userScreening.ScreeningId);
        parentExists.Should().BeTrue();

        // Since guideline is recurring and item was active, status should revert to pending
        var refreshed = await ctx.UserScreenings.FirstAsync(us => us.ScreeningId == userScreening.ScreeningId);
        refreshed.Status.Should().Be(ScreeningStatus.pending);
    }

    [Fact]
    public async Task ArchiveScheduledScreening_Should_Set_Inactive_And_Exclude_From_GetScheduled()
    {
        // Arrange
        using var ctx = DbContextFactory.CreateInMemory();
        var userId = Guid.NewGuid();
        var guideline = new ScreeningGuideline
        {
            GuidelineId = Guid.NewGuid(),
            Name = "Archive Test",
            ScreeningType = "type",
            DefaultFrequencyMonths = 12,
            Category = ScreeningCategory.screening,
            Description = "desc",
            SourceOrganisation = "org",
            LastUpdated = DateOnly.FromDateTime(DateTime.UtcNow),
            IsRecurring = true
        };
        ctx.ScreeningGuidelines.Add(guideline);

        var userScreening = new UserScreening
        {
            ScreeningId = Guid.NewGuid(),
            UserId = userId,
            GuidelineId = guideline.GuidelineId,
            Status = ScreeningStatus.scheduled,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        ctx.UserScreenings.Add(userScreening);

        var scheduled = new ScheduledScreening
        {
            ScheduledScreeningId = Guid.NewGuid(),
            ScreeningId = userScreening.ScreeningId,
            ScheduledDate = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(10)),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        ctx.ScheduledScreenings.Add(scheduled);
        await ctx.SaveChangesAsync();

        var service = CreateService(ctx);

        // Act
        await service.ArchiveScheduledScreening(scheduled.ScheduledScreeningId);

        // Assert: archived flag (IsActive) is false
        var archived = await ctx.ScheduledScreenings.FirstAsync(ss => ss.ScheduledScreeningId == scheduled.ScheduledScreeningId);
        archived.IsActive.Should().BeFalse();

        // And it should not be returned by GetScheduledScreenings
        var scheduledNow = await service.GetScheduledScreenings(userId);
        scheduledNow.Any(ss => ss.ScheduledScreeningId == scheduled.ScheduledScreeningId).Should().BeFalse();
    }

    [Fact]
    public async Task Hide_Then_Unhide_Should_Toggle_Status_And_Reflect_In_Hidden_List()
    {
        // Arrange
        using var ctx = DbContextFactory.CreateInMemory();
        var userId = Guid.NewGuid();
        var guideline = new ScreeningGuideline
        {
            GuidelineId = Guid.NewGuid(),
            Name = "Hide/Unhide Test",
            ScreeningType = "type",
            DefaultFrequencyMonths = 12,
            Category = ScreeningCategory.screening,
            Description = "desc",
            SourceOrganisation = "org",
            LastUpdated = DateOnly.FromDateTime(DateTime.UtcNow),
            IsRecurring = true
        };
        ctx.ScreeningGuidelines.Add(guideline);

        var userScreening = new UserScreening
        {
            ScreeningId = Guid.NewGuid(),
            UserId = userId,
            GuidelineId = guideline.GuidelineId,
            Status = ScreeningStatus.pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        ctx.UserScreenings.Add(userScreening);
        await ctx.SaveChangesAsync();

        var service = CreateService(ctx);

        // Act: Hide
        await service.HideScreening(userId, guideline.GuidelineId);

        // Assert: status is skipped and appears in hidden list
        var afterHide = await ctx.UserScreenings.FirstAsync(us => us.ScreeningId == userScreening.ScreeningId);
        afterHide.Status.Should().Be(ScreeningStatus.skipped);
        var hiddenList = await service.GetHiddenScreeningsForUserAsync(userId);
        hiddenList.Select(x => x.ScreeningId).Should().Contain(userScreening.ScreeningId);

        // Act: Unhide
        await service.UnhideScreening(userId, guideline.GuidelineId);

        // Assert: status back to pending and no longer in hidden list
        var afterUnhide = await ctx.UserScreenings.FirstAsync(us => us.ScreeningId == userScreening.ScreeningId);
        afterUnhide.Status.Should().Be(ScreeningStatus.pending);
        var hiddenListAfter = await service.GetHiddenScreeningsForUserAsync(userId);
        hiddenListAfter.Select(x => x.ScreeningId).Should().NotContain(userScreening.ScreeningId);
    }

    [Fact]
    public async Task GetNewScreeningsForUserAsync_Should_Add_Smoker_Guideline_When_Recommended()
    {
        // Arrange
        var (ctx, conn) = SqliteDbContextFactory.CreateInMemory();
        await using var _ = conn; // ensure connection disposed after test
        var userId = Guid.NewGuid();

        // Smoker-specific guideline with ConditionsRequired targeting current/former smokers
        var smokerGuideline = new ScreeningGuideline
        {
            GuidelineId = Guid.NewGuid(),
            Name = "Smoker Lung Screening",
            ScreeningType = "lung_cancer",
            DefaultFrequencyMonths = 12,
            Category = ScreeningCategory.screening,
            Description = "Recommended for current or former smokers",
            SourceOrganisation = "org",
            LastUpdated = DateOnly.FromDateTime(DateTime.UtcNow),
            IsRecurring = true,
            IsActive = true,
            ConditionsRequired = "{\"All\":[{\"Factor\":\"SmokingStatus\",\"Operator\":\"In\",\"Values\":[\"current_smoker\",\"former_smoker\"]}],\"Any\":[]}"
        };
    ctx.ScreeningGuidelines.Add(smokerGuideline);
    // Seed the user to satisfy FK when adding UserScreenings
        ctx.Users.Add(new User { UserId = userId, FirstName = "Test", LastName = "User" });
    await ctx.SaveChangesAsync();

        // Mock guideline service to recommend the smoker guideline for this user (simulating updated profile)
        var logger = new Mock<ILogger<UserScreeningsService>>().Object;
        var guidelineSvc = new Mock<IScreeningGuidelineService>(MockBehavior.Strict);
        guidelineSvc
            .Setup(g => g.GetRecommendedScreeningGuidelines(userId))
            .ReturnsAsync(new System.Collections.Generic.List<ScreeningGuideline> { smokerGuideline });
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

    var service = new UserScreeningsService(ctx, (ILogger<UserScreeningsService>)logger, guidelineSvc.Object);

        // Act
        var added = await service.GetNewScreeningsForUserAsync(userId);

        // Assert: one new screening created for the smoker guideline
        added.Should().ContainSingle();
        added[0].UserId.Should().Be(userId);
        added[0].GuidelineId.Should().Be(smokerGuideline.GuidelineId);
        added[0].Status.Should().Be(ScreeningStatus.pending);

        // And it exists in the database
        var exists = await ctx.UserScreenings.AnyAsync(us => us.UserId == userId && us.GuidelineId == smokerGuideline.GuidelineId);
        exists.Should().BeTrue();

        // Calling again should add nothing new (idempotent for already existing screening)
        var second = await service.GetNewScreeningsForUserAsync(userId);
        second.Should().BeEmpty();

        // Verify the recommendation method was called
        guidelineSvc.Verify(g => g.GetRecommendedScreeningGuidelines(userId), Times.AtLeastOnce());
    }
}

public class ScreeningGuidelineServiceCriteriaTests
{
    private static ScreeningGuidelineService CreateService(ApplicationDbContext ctx)
    {
        var logger = new Mock<ILogger<ScreeningGuidelineService>>().Object;
        return new ScreeningGuidelineService(ctx, (ILogger<ScreeningGuidelineService>)logger);
    }

    private static ScreeningGuideline CreateGeneralGuideline()
    {
        return new ScreeningGuideline
        {
            GuidelineId = Guid.NewGuid(),
            Name = "Yearly Health Check",
            ScreeningType = "General",
            DefaultFrequencyMonths = 12,
            Category = ScreeningCategory.checkup,
            Description = "Comprehensive health check to monitor overall wellbeing.",
            SourceOrganisation = "org",
            LastUpdated = DateOnly.Parse("2025-08-25"),
            IsRecurring = true,
            IsActive = true,
            ConditionsRequired = null,
            Cost = "Usually covered by Medicare or private insurance",
            Delivery = "General practitioner",
            Link = null,
            SexApplicable = SexApplicable.both,
            PregnancyApplicable = PregnancyApplicable.any
        };
    }

    [Fact]
    public async Task GetRecommendedScreeningGuidelines_Should_Return_When_Age_Meets_Criteria()
    {
        // Arrange: SQLite for transaction/relational behavior
        var (ctx, conn) = SqliteDbContextFactory.CreateInMemory();
        await using var _ = conn;
        var userId = Guid.NewGuid();

        // User age 55 (DOB 55 years ago)
        var dob55 = DateOnly.FromDateTime(DateTime.Today.AddYears(-55));
        ctx.Users.Add(new User { UserId = userId, FirstName = "Test", LastName = "User", DateOfBirth = dob55, Sex = Sex.male });

        // Guideline requiring Age >= 50 via ConditionsRequired JSON
        var ageSpecific = new ScreeningGuideline
        {
            GuidelineId = Guid.NewGuid(),
            Name = "Age 50+ Screening",
            ScreeningType = "age_based",
            DefaultFrequencyMonths = 12,
            Category = ScreeningCategory.screening,
            Description = "Eligible when age >= 50",
            SourceOrganisation = "org",
            LastUpdated = DateOnly.FromDateTime(DateTime.UtcNow),
            IsRecurring = true,
            IsActive = true,
            ConditionsRequired = "{\"All\":[{\"Factor\":\"Age\",\"Operator\":\"GreaterOrEqual\",\"Min\":50}],\"Any\":[]}"
        };
        var general = CreateGeneralGuideline();
        ctx.ScreeningGuidelines.AddRange(ageSpecific, general);
        await ctx.SaveChangesAsync();

        var service = CreateService(ctx);

        // Act
        var result = await service.GetRecommendedScreeningGuidelines(userId);

        // Assert
        result.Select(g => g.GuidelineId).Should().Contain(ageSpecific.GuidelineId);
        result.Select(g => g.GuidelineId).Should().Contain(general.GuidelineId);
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetRecommendedScreeningGuidelines_Should_Exclude_When_Age_Does_Not_Meet_Criteria()
    {
        // Arrange
        var (ctx, conn) = SqliteDbContextFactory.CreateInMemory();
        await using var _ = conn;
        var userId = Guid.NewGuid();

        // User age 40 (DOB 40 years ago)
        var dob40 = DateOnly.FromDateTime(DateTime.Today.AddYears(-40));
        ctx.Users.Add(new User { UserId = userId, FirstName = "Test", LastName = "User", DateOfBirth = dob40, Sex = Sex.female });

        // Same guideline requiring Age >= 50
        var ageSpecific = new ScreeningGuideline
        {
            GuidelineId = Guid.NewGuid(),
            Name = "Age 50+ Screening",
            ScreeningType = "age_based",
            DefaultFrequencyMonths = 12,
            Category = ScreeningCategory.screening,
            Description = "Eligible when age >= 50",
            SourceOrganisation = "org",
            LastUpdated = DateOnly.FromDateTime(DateTime.UtcNow),
            IsRecurring = true,
            IsActive = true,
            ConditionsRequired = "{\"All\":[{\"Factor\":\"Age\",\"Operator\":\"GreaterOrEqual\",\"Min\":50}],\"Any\":[]}"
        };
        var general = CreateGeneralGuideline();
        ctx.ScreeningGuidelines.AddRange(ageSpecific, general);
        await ctx.SaveChangesAsync();

        var service = CreateService(ctx);

        // Act
        var result = await service.GetRecommendedScreeningGuidelines(userId);

        // Assert
        result.Select(g => g.GuidelineId).Should().NotContain(ageSpecific.GuidelineId);
        result.Select(g => g.GuidelineId).Should().Contain(general.GuidelineId);
        result.Should().ContainSingle();
    }

    [Fact]
    public async Task GetRecommendedScreeningGuidelines_Should_Exclude_Pregnancy_Guideline_When_User_Not_Pregnant()
    {
        // Arrange: Use SQLite provider
        var (ctx, conn) = SqliteDbContextFactory.CreateInMemory();
        await using var _ = conn;
        var userId = Guid.NewGuid();

        // Seed user with default medical profile: PregnancyStatus defaults to not_pregnant
        ctx.Users.Add(new User { UserId = userId, FirstName = "Test", LastName = "User", Sex = Sex.female });
        ctx.UserMedicalProfiles.Add(new UserMedicalProfile { UserId = userId });

        // Guideline requiring PregnancyStatus == pregnant
        var pregnancyGuideline = new ScreeningGuideline
        {
            GuidelineId = Guid.NewGuid(),
            Name = "Pregnancy-specific Check",
            ScreeningType = "prenatal",
            DefaultFrequencyMonths = 1,
            Category = ScreeningCategory.checkup,
            Description = "Applicable only when pregnant",
            SourceOrganisation = "org",
            LastUpdated = DateOnly.FromDateTime(DateTime.UtcNow),
            IsRecurring = true,
            IsActive = true,
            PregnancyApplicable = PregnancyApplicable.pregnant,
            ConditionsRequired = "{\"All\":[{\"Factor\":\"PregnancyStatus\",\"Operator\":\"Equals\",\"Values\":[\"pregnant\"]}],\"Any\":[]}"
        };
        var general = CreateGeneralGuideline();
        ctx.ScreeningGuidelines.AddRange(pregnancyGuideline, general);
        await ctx.SaveChangesAsync();

        var service = CreateService(ctx);

        // Act
        var result = await service.GetRecommendedScreeningGuidelines(userId);

        // Assert: pregnancy-only guideline excluded; general included
        result.Select(g => g.GuidelineId).Should().NotContain(pregnancyGuideline.GuidelineId);
        result.Select(g => g.GuidelineId).Should().Contain(general.GuidelineId);
        result.Should().ContainSingle();
    }

    [Fact]
    public async Task GetRecommendedScreeningGuidelines_Should_Return_Postpartum_Guideline_And_General_When_User_Postpartum()
    {
        // Arrange
        var (ctx, conn) = SqliteDbContextFactory.CreateInMemory();
        await using var _ = conn;
        var userId = Guid.NewGuid();

        // User is postpartum
        ctx.Users.Add(new User { UserId = userId, FirstName = "Test", LastName = "User", Sex = Sex.female });
        ctx.UserMedicalProfiles.Add(new UserMedicalProfile { UserId = userId, PregnancyStatus = PregnancyStatus.postpartum });

        // Postpartum-specific guideline, representative of "people with newborns"
        var postpartumGuideline = new ScreeningGuideline
        {
            GuidelineId = Guid.NewGuid(),
            Name = "Newborn bloodspot screening",
            ScreeningType = "Newborn",
            DefaultFrequencyMonths = 0,
            Category = ScreeningCategory.screening,
            Description = "Healthcare providers offer bloodspot screening for all babies born in Australia.",
            SourceOrganisation = "org",
            LastUpdated = DateOnly.Parse("2025-09-10"),
            IsRecurring = false,
            IsActive = true,
            PregnancyApplicable = PregnancyApplicable.postpartum,
            ConditionsRequired = null
        };

        var general = CreateGeneralGuideline(); // PregnancyApplicable.any
        ctx.ScreeningGuidelines.AddRange(postpartumGuideline, general);
        await ctx.SaveChangesAsync();

        var service = CreateService(ctx);

        // Act
        var result = await service.GetRecommendedScreeningGuidelines(userId);

        // Assert: both postpartum-specific and general are recommended
        result.Select(g => g.GuidelineId).Should().Contain(postpartumGuideline.GuidelineId);
        result.Select(g => g.GuidelineId).Should().Contain(general.GuidelineId);
    }

    [Fact]
    public async Task GetRecommendedScreeningGuidelines_Should_Return_Pregnancy_Guideline_And_General_When_User_Pregnant()
    {
        // Arrange
        var (ctx, conn) = SqliteDbContextFactory.CreateInMemory();
        await using var _ = conn;
        var userId = Guid.NewGuid();

        // User is pregnant
        ctx.Users.Add(new User { UserId = userId, FirstName = "Test", LastName = "User", Sex = Sex.female });
        ctx.UserMedicalProfiles.Add(new UserMedicalProfile { UserId = userId, PregnancyStatus = PregnancyStatus.pregnant });

        var pregnancyGuideline = new ScreeningGuideline
        {
            GuidelineId = Guid.NewGuid(),
            Name = "Prenatal Check",
            ScreeningType = "prenatal",
            DefaultFrequencyMonths = 1,
            Category = ScreeningCategory.checkup,
            Description = "Guideline applicable during pregnancy",
            SourceOrganisation = "org",
            LastUpdated = DateOnly.FromDateTime(DateTime.UtcNow),
            IsRecurring = true,
            IsActive = true,
            PregnancyApplicable = PregnancyApplicable.pregnant,
            ConditionsRequired = "{\"All\":[{\"Factor\":\"PregnancyStatus\",\"Operator\":\"Equals\",\"Values\":[\"pregnant\"]}],\"Any\":[]}"
        };
        var general = CreateGeneralGuideline();
        ctx.ScreeningGuidelines.AddRange(pregnancyGuideline, general);
        await ctx.SaveChangesAsync();

        var service = CreateService(ctx);

        // Act
        var result = await service.GetRecommendedScreeningGuidelines(userId);

        // Assert: both specific and general returned
        result.Select(g => g.GuidelineId).Should().Contain(pregnancyGuideline.GuidelineId);
        result.Select(g => g.GuidelineId).Should().Contain(general.GuidelineId);
    }

    [Fact]
    public async Task GetRecommendedScreeningGuidelines_Should_Exclude_Smoker_Guideline_When_User_Never_Smoked()
    {
        // Arrange
        var (ctx, conn) = SqliteDbContextFactory.CreateInMemory();
        await using var _ = conn;
        var userId = Guid.NewGuid();

        // User never smoked
        ctx.Users.Add(new User { UserId = userId, FirstName = "Test", LastName = "User", Sex = Sex.male });
        ctx.UserMedicalProfiles.Add(new UserMedicalProfile { UserId = userId, SmokingStatus = SmokingStatus.never });

        // Smoker guideline recommended for current/former smokers
        var smokerGuideline = new ScreeningGuideline
        {
            GuidelineId = Guid.NewGuid(),
            Name = "Lung Cancer Screening",
            ScreeningType = "lung_cancer",
            DefaultFrequencyMonths = 12,
            Category = ScreeningCategory.screening,
            Description = "Recommended for current or former smokers",
            SourceOrganisation = "org",
            LastUpdated = DateOnly.FromDateTime(DateTime.UtcNow),
            IsRecurring = true,
            IsActive = true,
            PregnancyApplicable = PregnancyApplicable.any,
            ConditionsRequired = "{\"All\":[{\"Factor\":\"SmokingStatus\",\"Operator\":\"In\",\"Values\":[\"current\",\"former\"]}],\"Any\":[]}"
        };
        var general = CreateGeneralGuideline();
        ctx.ScreeningGuidelines.AddRange(smokerGuideline, general);
        await ctx.SaveChangesAsync();

        var service = CreateService(ctx);

        // Act
        var result = await service.GetRecommendedScreeningGuidelines(userId);

        // Assert: smoker guideline excluded; general included
        result.Select(g => g.GuidelineId).Should().NotContain(smokerGuideline.GuidelineId);
        result.Select(g => g.GuidelineId).Should().Contain(general.GuidelineId);
        result.Should().ContainSingle();
    }

    [Fact]
    public async Task GetRecommendedScreeningGuidelines_Should_Return_Smoker_Guideline_And_General_When_User_Current_Smoker()
    {
        // Arrange
        var (ctx, conn) = SqliteDbContextFactory.CreateInMemory();
        await using var _ = conn;
        var userId = Guid.NewGuid();

        // User is current smoker
        ctx.Users.Add(new User { UserId = userId, FirstName = "Test", LastName = "User", Sex = Sex.male });
        ctx.UserMedicalProfiles.Add(new UserMedicalProfile { UserId = userId, SmokingStatus = SmokingStatus.current });

        var smokerGuideline = new ScreeningGuideline
        {
            GuidelineId = Guid.NewGuid(),
            Name = "Lung Cancer Screening",
            ScreeningType = "lung_cancer",
            DefaultFrequencyMonths = 12,
            Category = ScreeningCategory.screening,
            Description = "Recommended for current or former smokers",
            SourceOrganisation = "org",
            LastUpdated = DateOnly.FromDateTime(DateTime.UtcNow),
            IsRecurring = true,
            IsActive = true,
            PregnancyApplicable = PregnancyApplicable.any,
            ConditionsRequired = "{\"All\":[{\"Factor\":\"SmokingStatus\",\"Operator\":\"In\",\"Values\":[\"current\",\"former\"]}],\"Any\":[]}"
        };
        var general = CreateGeneralGuideline();
        ctx.ScreeningGuidelines.AddRange(smokerGuideline, general);
        await ctx.SaveChangesAsync();

        var service = CreateService(ctx);

        // Act
        var result = await service.GetRecommendedScreeningGuidelines(userId);

        // Assert: both returned
        result.Select(g => g.GuidelineId).Should().Contain(smokerGuideline.GuidelineId);
        result.Select(g => g.GuidelineId).Should().Contain(general.GuidelineId);
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetRecommendedScreeningGuidelines_Should_Return_Smoker_Guideline_And_General_When_User_Former_Smoker()
    {
        // Arrange
        var (ctx, conn) = SqliteDbContextFactory.CreateInMemory();
        await using var _ = conn;
        var userId = Guid.NewGuid();

        // User is former smoker
        ctx.Users.Add(new User { UserId = userId, FirstName = "Test", LastName = "User", Sex = Sex.female });
        ctx.UserMedicalProfiles.Add(new UserMedicalProfile { UserId = userId, SmokingStatus = SmokingStatus.former });

        var smokerGuideline = new ScreeningGuideline
        {
            GuidelineId = Guid.NewGuid(),
            Name = "Lung Cancer Screening",
            ScreeningType = "lung_cancer",
            DefaultFrequencyMonths = 12,
            Category = ScreeningCategory.screening,
            Description = "Recommended for current or former smokers",
            SourceOrganisation = "org",
            LastUpdated = DateOnly.FromDateTime(DateTime.UtcNow),
            IsRecurring = true,
            IsActive = true,
            PregnancyApplicable = PregnancyApplicable.any,
            ConditionsRequired = "{\"All\":[{\"Factor\":\"SmokingStatus\",\"Operator\":\"In\",\"Values\":[\"current\",\"former\"]}],\"Any\":[]}"
        };
        var general = CreateGeneralGuideline();
        ctx.ScreeningGuidelines.AddRange(smokerGuideline, general);
        await ctx.SaveChangesAsync();

        var service = CreateService(ctx);

        // Act
        var result = await service.GetRecommendedScreeningGuidelines(userId);

        // Assert: both returned
        result.Select(g => g.GuidelineId).Should().Contain(smokerGuideline.GuidelineId);
        result.Select(g => g.GuidelineId).Should().Contain(general.GuidelineId);
        result.Should().HaveCount(2);
    }
}
