using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using IoTM.Data;

namespace IoTM.Data
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            
            // Use a dummy connection string for migrations
            // This won't be used in production, only for generating migrations
            optionsBuilder.UseNpgsql("Host=aws-0-ap-southeast-1.pooler.supabase.com;Port=5432;Username=postgres.vetwwtmxcdiotjxhdeza;Password=teamkevin12345;Database=postgres;SSL Mode=Require;Trust Server Certificate=true");

            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}
