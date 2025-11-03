using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IoTM.Migrations
{
    /// <inheritdoc />
    public partial class AddHealthSegmentSummary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HealthSegmentSummarys",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Start = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    End = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Points = table.Column<int>(type: "integer", nullable: false),
                    AverageBpm = table.Column<double>(type: "double precision", nullable: true),
                    BpmStandardDeviation = table.Column<double>(type: "double precision", nullable: true),
                    AverageSpO2 = table.Column<double>(type: "double precision", nullable: true),
                    SpO2StandardDeviation = table.Column<double>(type: "double precision", nullable: true),
                    AverageSystolic = table.Column<double>(type: "double precision", nullable: true),
                    AverageDiastolic = table.Column<double>(type: "double precision", nullable: true),
                    BloodPressureStandardDeviation = table.Column<double>(type: "double precision", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthSegmentSummarys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HealthSegmentSummarys_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HealthSegmentSummarys_UserId",
                table: "HealthSegmentSummarys",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HealthSegmentSummarys");
        }
    }
}
