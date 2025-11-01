using System.Net;
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
        var response = await client.GetAsync("/api/UserScreenings?page=1&pageSize=4");
        if (response.StatusCode != HttpStatusCode.OK)
        {
            var body = await response.Content.ReadAsStringAsync();
            throw new Xunit.Sdk.XunitException($"Expected 200 OK but got {(int)response.StatusCode} {response.StatusCode}. Body: {body}");
        }
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
