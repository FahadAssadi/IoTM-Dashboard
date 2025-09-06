using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace IoTM.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NewsArticles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Source = table.Column<string>(type: "text", nullable: false),
                    Author = table.Column<string>(type: "text", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Url = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    Category = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NewsArticles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "screening_guidelines",
                columns: table => new
                {
                    GuidelineId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    ScreeningType = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DefaultFrequencyMonths = table.Column<int>(type: "integer", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    MinAge = table.Column<int>(type: "integer", nullable: true),
                    MaxAge = table.Column<int>(type: "integer", nullable: true),
                    SexApplicable = table.Column<string>(type: "text", nullable: false),
                    PregnancyApplicable = table.Column<int>(type: "integer", nullable: false),
                    ConditionsRequired = table.Column<string>(type: "text", nullable: true),
                    ConditionsExcluded = table.Column<string>(type: "text", nullable: true),
                    RiskFactors = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: false),
                    ImportanceLevel = table.Column<string>(type: "text", nullable: false),
                    SourceOrganisation = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CountrySpecific = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    LastUpdated = table.Column<DateOnly>(type: "date", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Cost = table.Column<string>(type: "text", nullable: true),
                    Delivery = table.Column<string>(type: "text", nullable: true),
                    Link = table.Column<string>(type: "text", nullable: true),
                    IsRecurring = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_screening_guidelines", x => x.GuidelineId);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DateOfBirth = table.Column<DateOnly>(type: "date", nullable: true),
                    Sex = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CountryCode = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    Timezone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "FrequencyRule",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GuidelineId = table.Column<Guid>(type: "uuid", nullable: false),
                    MinAge = table.Column<int>(type: "integer", nullable: true),
                    MaxAge = table.Column<int>(type: "integer", nullable: true),
                    SexApplicable = table.Column<int>(type: "integer", nullable: true),
                    PregnancyApplicable = table.Column<int>(type: "integer", nullable: true),
                    FrequencyMonths = table.Column<int>(type: "integer", nullable: false),
                    Condition = table.Column<string>(type: "text", nullable: true),
                    ScreeningGuidelineGuidelineId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FrequencyRule", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FrequencyRule_screening_guidelines_ScreeningGuidelineGuidel~",
                        column: x => x.ScreeningGuidelineGuidelineId,
                        principalTable: "screening_guidelines",
                        principalColumn: "GuidelineId");
                });

            migrationBuilder.CreateTable(
                name: "allergies",
                columns: table => new
                {
                    AllergyId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Allergen = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AllergyType = table.Column<string>(type: "text", nullable: false),
                    Reaction = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    Severity = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_allergies", x => x.AllergyId);
                    table.ForeignKey(
                        name: "FK_allergies_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "connected_devices",
                columns: table => new
                {
                    DeviceId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeviceType = table.Column<string>(type: "text", nullable: false),
                    DeviceName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DeviceIdentifier = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApiTokenEncrypted = table.Column<string>(type: "text", nullable: true),
                    LastSync = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SyncFrequencyMinutes = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_connected_devices", x => x.DeviceId);
                    table.ForeignKey(
                        name: "FK_connected_devices_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "family_history",
                columns: table => new
                {
                    HistoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Relationship = table.Column<string>(type: "text", nullable: false),
                    ConditionName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AgeAtDiagnosis = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_family_history", x => x.HistoryId);
                    table.ForeignKey(
                        name: "FK_family_history_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "medical_conditions",
                columns: table => new
                {
                    ConditionId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ConditionName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ConditionCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    DiagnosedDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Severity = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_medical_conditions", x => x.ConditionId);
                    table.ForeignKey(
                        name: "FK_medical_conditions_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "medications",
                columns: table => new
                {
                    MedicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    MedicationName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Dosage = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Frequency = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: true),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    PrescribingDoctor = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Reason = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_medications", x => x.MedicationId);
                    table.ForeignKey(
                        name: "FK_medications_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_medical_profiles",
                columns: table => new
                {
                    ProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    HeightCm = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    WeightKg = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    BloodType = table.Column<string>(type: "text", nullable: true),
                    SmokingStatus = table.Column<string>(type: "text", nullable: false),
                    AlcoholFrequency = table.Column<string>(type: "text", nullable: false),
                    ActivityLevel = table.Column<string>(type: "text", nullable: false),
                    PregnancyStatus = table.Column<int>(type: "integer", nullable: true),
                    Occupation = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EmergencyContactName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EmergencyContactPhone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    PrimaryDoctorName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PrimaryDoctorPhone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    InsuranceProvider = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    InsuranceNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_medical_profiles", x => x.ProfileId);
                    table.ForeignKey(
                        name: "FK_user_medical_profiles_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_screenings",
                columns: table => new
                {
                    ScreeningId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    GuidelineId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CompletedDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ProviderName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ProviderPhone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Results = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    NextDueDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ReminderSent = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_screenings", x => x.ScreeningId);
                    table.ForeignKey(
                        name: "FK_user_screenings_screening_guidelines_GuidelineId",
                        column: x => x.GuidelineId,
                        principalTable: "screening_guidelines",
                        principalColumn: "GuidelineId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_screenings_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "health_metrics",
                columns: table => new
                {
                    MetricId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeviceId = table.Column<Guid>(type: "uuid", nullable: true),
                    MetricType = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<decimal>(type: "numeric(10,4)", nullable: false),
                    Unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    RecordedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataQuality = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_health_metrics", x => x.MetricId);
                    table.ForeignKey(
                        name: "FK_health_metrics_connected_devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "connected_devices",
                        principalColumn: "DeviceId");
                    table.ForeignKey(
                        name: "FK_health_metrics_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ScheduledScreenings",
                columns: table => new
                {
                    ScheduledScreeningId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScreeningId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduledDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScheduledScreenings", x => x.ScheduledScreeningId);
                    table.ForeignKey(
                        name: "FK_ScheduledScreenings_user_screenings_ScreeningId",
                        column: x => x.ScreeningId,
                        principalTable: "user_screenings",
                        principalColumn: "ScreeningId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "health_alerts",
                columns: table => new
                {
                    AlertId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AlertType = table.Column<string>(type: "text", nullable: false),
                    Severity = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    TriggeredByMetricId = table.Column<Guid>(type: "uuid", nullable: true),
                    TriggeredByScreeningId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    IsDismissed = table.Column<bool>(type: "boolean", nullable: false),
                    ActionTaken = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_health_alerts", x => x.AlertId);
                    table.ForeignKey(
                        name: "FK_health_alerts_health_metrics_TriggeredByMetricId",
                        column: x => x.TriggeredByMetricId,
                        principalTable: "health_metrics",
                        principalColumn: "MetricId");
                    table.ForeignKey(
                        name: "FK_health_alerts_user_screenings_TriggeredByScreeningId",
                        column: x => x.TriggeredByScreeningId,
                        principalTable: "user_screenings",
                        principalColumn: "ScreeningId");
                    table.ForeignKey(
                        name: "FK_health_alerts_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_allergies_UserId",
                table: "allergies",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_connected_devices_UserId",
                table: "connected_devices",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_family_history_UserId",
                table: "family_history",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_FrequencyRule_ScreeningGuidelineGuidelineId",
                table: "FrequencyRule",
                column: "ScreeningGuidelineGuidelineId");

            migrationBuilder.CreateIndex(
                name: "idx_severity_created",
                table: "health_alerts",
                columns: new[] { "Severity", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "idx_user_unread",
                table: "health_alerts",
                columns: new[] { "UserId", "IsRead" });

            migrationBuilder.CreateIndex(
                name: "IX_health_alerts_TriggeredByMetricId",
                table: "health_alerts",
                column: "TriggeredByMetricId");

            migrationBuilder.CreateIndex(
                name: "IX_health_alerts_TriggeredByScreeningId",
                table: "health_alerts",
                column: "TriggeredByScreeningId");

            migrationBuilder.CreateIndex(
                name: "idx_recorded_at",
                table: "health_metrics",
                column: "RecordedAt");

            migrationBuilder.CreateIndex(
                name: "idx_user_metric_time",
                table: "health_metrics",
                columns: new[] { "UserId", "MetricType", "RecordedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_health_metrics_DeviceId",
                table: "health_metrics",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_medical_conditions_UserId",
                table: "medical_conditions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_medications_UserId",
                table: "medications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledScreenings_ScreeningId",
                table: "ScheduledScreenings",
                column: "ScreeningId");

            migrationBuilder.CreateIndex(
                name: "IX_user_medical_profiles_UserId",
                table: "user_medical_profiles",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_screenings_GuidelineId",
                table: "user_screenings",
                column: "GuidelineId");

            migrationBuilder.CreateIndex(
                name: "IX_user_screenings_UserId",
                table: "user_screenings",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "allergies");

            migrationBuilder.DropTable(
                name: "family_history");

            migrationBuilder.DropTable(
                name: "FrequencyRule");

            migrationBuilder.DropTable(
                name: "health_alerts");

            migrationBuilder.DropTable(
                name: "medical_conditions");

            migrationBuilder.DropTable(
                name: "medications");

            migrationBuilder.DropTable(
                name: "NewsArticles");

            migrationBuilder.DropTable(
                name: "ScheduledScreenings");

            migrationBuilder.DropTable(
                name: "user_medical_profiles");

            migrationBuilder.DropTable(
                name: "health_metrics");

            migrationBuilder.DropTable(
                name: "user_screenings");

            migrationBuilder.DropTable(
                name: "connected_devices");

            migrationBuilder.DropTable(
                name: "screening_guidelines");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
