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
            optionsBuilder.UseNpgsql("Host=localhost;Database=dummy;Username=dummy;Password=dummy");

            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}
