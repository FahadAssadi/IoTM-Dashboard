using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IoTM.Migrations
{
    /// <inheritdoc />
    public partial class AddScheduledScreening : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastScheduledDate",
                table: "user_screenings");

            migrationBuilder.RenameColumn(
                name: "isRecurring",
                table: "screening_guidelines",
                newName: "IsRecurring");

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

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledScreenings_ScreeningId",
                table: "ScheduledScreenings",
                column: "ScreeningId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ScheduledScreenings");

            migrationBuilder.RenameColumn(
                name: "IsRecurring",
                table: "screening_guidelines",
                newName: "isRecurring");

            migrationBuilder.AddColumn<DateOnly>(
                name: "LastScheduledDate",
                table: "user_screenings",
                type: "date",
                nullable: true);
        }
    }
}
