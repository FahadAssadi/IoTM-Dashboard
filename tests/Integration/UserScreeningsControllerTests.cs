using System.Net;
using System.Text.Json;
using IoTM.Dtos;
using IoTM.Data;
using IoTM.Models;
using Microsoft.Extensions.DependencyInjection;
using FluentAssertions;
using Xunit;

namespace IoTM.Tests.Integration;

public class UserScreeningsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public UserScreeningsControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetUserScreenings_Should_Return_OK()
    {
        var client = _factory.CreateClient();
        var userId = Guid.NewGuid();
        var response = await client.GetAsync($"/api/UserScreenings?page=1&pageSize=4&userId={userId}");
        if (response.StatusCode != HttpStatusCode.OK)
        {
            var body = await response.Content.ReadAsStringAsync();
            throw new Xunit.Sdk.XunitException($"Expected 200 OK but got {(int)response.StatusCode} {response.StatusCode}. Body: {body}");
        }
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ScheduleScreening_Duplicate_For_Same_Date_Should_Not_Create_Additional_Item()
    {
        // Arrange
        var client = _factory.CreateClient();
        var userId = Guid.NewGuid();
        var guidelineId = Guid.NewGuid();
        var date = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(5));

        // Seed a guideline so projection in GetScheduledScreenings works (it includes Guideline)
        using (var scope = _factory.Services.CreateScope())
        {
            var ctx = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            ctx.ScreeningGuidelines.Add(new ScreeningGuideline
            {
                GuidelineId = guidelineId,
                Name = "Duplicate Integration Test Guideline",
                ScreeningType = "general",
                DefaultFrequencyMonths = 12,
                Category = ScreeningCategory.screening,
                Description = "Test guideline",
                SourceOrganisation = "org",
                LastUpdated = DateOnly.FromDateTime(DateTime.UtcNow),
                IsRecurring = true,
                IsActive = true
            });
            await ctx.SaveChangesAsync();
        }

        // Create the first schedule directly via the app services to avoid any binding/serialization issues
        using (var scope2 = _factory.Services.CreateScope())
        {
            var ctx2 = scope2.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var service = scope2.ServiceProvider.GetRequiredService<IoTM.Services.IUserScreeningsService>();
            var ok = await service.ScheduleScreening(userId, guidelineId, date);
            ok.Should().BeTrue();
        }

        // Check after first schedule there is exactly one via the API
        var scheduledResp1 = await client.GetAsync($"/api/UserScreenings/scheduled?userId={userId}");
        scheduledResp1.StatusCode.Should().Be(HttpStatusCode.OK);
        var scheduledJson1 = await scheduledResp1.Content.ReadAsStringAsync();
        var items1 = JsonSerializer.Deserialize<List<ScheduledScreeningDto>>(scheduledJson1, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        items1.Should().NotBeNull();
        items1!.Count(i => i.IsActive == true).Should().Be(1);

        // Second schedule for the same guideline and date should return 409 (conflict)
        var second = await client.PostAsync($"/api/UserScreenings/schedule?userId={userId}&guidelineId={guidelineId}&scheduledDate={date:yyyy-MM-dd}", content: null);
        second.StatusCode.Should().Be(HttpStatusCode.Conflict);

        // Verify only one scheduled item exists via GET /scheduled
        var scheduledResp2 = await client.GetAsync($"/api/UserScreenings/scheduled?userId={userId}");
        scheduledResp2.StatusCode.Should().Be(HttpStatusCode.OK);
        var scheduledJson2 = await scheduledResp2.Content.ReadAsStringAsync();
        var items2 = JsonSerializer.Deserialize<List<ScheduledScreeningDto>>(scheduledJson2, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        items2.Should().NotBeNull();
        items2!.Count(i => i.IsActive == true).Should().Be(1);
    }
}
