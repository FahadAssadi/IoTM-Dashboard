using IoTM.Data;
using Microsoft.EntityFrameworkCore;

namespace IoTM.Tests.TestUtils;

public static class DbContextFactory
{
    public static ApplicationDbContext CreateInMemory(string? name = null)
    {
        var dbName = name ?? $"IoTM_Test_{Guid.NewGuid()}";
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(dbName)
            .EnableSensitiveDataLogging()
            .Options;
        var ctx = new ApplicationDbContext(options);
        return ctx;
    }
}
