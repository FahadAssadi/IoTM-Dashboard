using Microsoft.EntityFrameworkCore;
using IoTM.Models;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace IoTM.Data 
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<UserMedicalProfile> UserMedicalProfiles { get; set; }
        public DbSet<MedicalCondition> MedicalConditions { get; set; }
        public DbSet<FamilyHistory> FamilyHistories { get; set; }
        public DbSet<Medication> Medications { get; set; }
        public DbSet<Allergy> Allergies { get; set; }
        public DbSet<ConnectedDevice> ConnectedDevices { get; set; }
        public DbSet<HealthMetric> HealthMetrics { get; set; }
        public DbSet<ScheduledScreening> ScheduledScreenings { get; set; }
        public DbSet<ScreeningGuideline> ScreeningGuidelines { get; set; }
        public DbSet<UserScreening> UserScreenings { get; set; }
        public DbSet<HealthAlert> HealthAlerts { get; set; }
        public DbSet<HealthSegmentBPM> HealthSegmentBPMs { get; set; }
        public DbSet<LifestyleFactor> LifestyleFactors { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure all C# enums to be stored as strings in the database
            modelBuilder.Entity<User>().Property(u => u.Sex).HasConversion<string>();
            modelBuilder.Entity<UserMedicalProfile>().Property(p => p.BloodType).HasConversion<string>();
            modelBuilder.Entity<UserMedicalProfile>().Property(p => p.SmokingStatus).HasConversion<string>();
            modelBuilder.Entity<UserMedicalProfile>().Property(p => p.AlcoholFrequency).HasConversion<string>();
            modelBuilder.Entity<UserMedicalProfile>().Property(p => p.ActivityLevel).HasConversion<string>();
            modelBuilder.Entity<MedicalCondition>().Property(c => c.Severity).HasConversion<string>();
            modelBuilder.Entity<MedicalCondition>().Property(c => c.Status).HasConversion<string>();
            modelBuilder.Entity<FamilyHistory>().Property(h => h.Relationship).HasConversion<string>();
            modelBuilder.Entity<Medication>().Property(m => m.Status).HasConversion<string>();
            modelBuilder.Entity<Allergy>().Property(a => a.AllergyType).HasConversion<string>();
            modelBuilder.Entity<Allergy>().Property(a => a.Severity).HasConversion<string>();
            modelBuilder.Entity<ConnectedDevice>().Property(d => d.DeviceType).HasConversion<string>();
            modelBuilder.Entity<HealthMetric>().Property(m => m.MetricType).HasConversion<string>();
            modelBuilder.Entity<HealthMetric>().Property(m => m.DataQuality).HasConversion<string>();
            modelBuilder.Entity<ScreeningGuideline>().Property(g => g.Category).HasConversion<string>();
            modelBuilder.Entity<ScreeningGuideline>().Property(g => g.SexApplicable).HasConversion<string>();
            modelBuilder.Entity<ScreeningGuideline>().Property(g => g.ImportanceLevel).HasConversion<string>();
            modelBuilder.Entity<UserScreening>().Property(s => s.Status).HasConversion<string>();
            modelBuilder.Entity<HealthAlert>().Property(a => a.AlertType).HasConversion<string>();
            modelBuilder.Entity<HealthAlert>().Property(a => a.Severity).HasConversion<string>();

            // Configure CriteriaGroup typed properties to be stored as JSON text
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
            };

            var criteriaConverter = new ValueConverter<CriteriaGroup?, string?>(
                v => v == null ? null : JsonSerializer.Serialize(v, jsonOptions),
                v => string.IsNullOrWhiteSpace(v) ? null : JsonSerializer.Deserialize<CriteriaGroup>(v!, jsonOptions)
            );

            var criteriaComparer = new ValueComparer<CriteriaGroup?>(
                (l, r) => JsonSerializer.Serialize(l, jsonOptions) == JsonSerializer.Serialize(r, jsonOptions),
                v => v == null ? 0 : JsonSerializer.Serialize(v, jsonOptions).GetHashCode(),
                v => v == null ? null : JsonSerializer.Deserialize<CriteriaGroup>(JsonSerializer.Serialize(v, jsonOptions), jsonOptions)
            );

            modelBuilder.Entity<ScreeningGuideline>()
                .Property(g => g.ConditionsRequired)
                .HasConversion(criteriaConverter)
                .Metadata.SetValueComparer(criteriaComparer);

            modelBuilder.Entity<ScreeningGuideline>()
                .Property(g => g.ConditionsExcluded)
                .HasConversion(criteriaConverter)
                .Metadata.SetValueComparer(criteriaComparer);
        }
    }
}