using System;
using IoTM.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace IoTM.Tests.TestUtils;

public static class SqliteDbContextFactory
{
    public static (ApplicationDbContext Ctx, SqliteConnection Connection) CreateInMemory()
    {
        var conn = new SqliteConnection("DataSource=:memory:");
        conn.Open();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(conn)
            .EnableSensitiveDataLogging()
            .Options;

        var ctx = new ApplicationDbContext(options);
        ctx.Database.EnsureCreated();
        return (ctx, conn);
    }
}
