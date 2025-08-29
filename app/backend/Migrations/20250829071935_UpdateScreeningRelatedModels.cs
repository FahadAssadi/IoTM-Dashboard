using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IoTM.Migrations
{
    /// <inheritdoc />
    public partial class UpdateScreeningRelatedModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_status_due",
                table: "user_screenings");

            migrationBuilder.DropIndex(
                name: "idx_user_due_date",
                table: "user_screenings");

            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "user_screenings");

            migrationBuilder.RenameColumn(
                name: "ScheduledDate",
                table: "user_screenings",
                newName: "LastScheduledDate");

            migrationBuilder.AddColumn<int>(
                name: "PregnancyStatus",
                table: "user_medical_profiles",
                type: "integer",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "PregnancyApplicable",
                table: "FrequencyRule",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.CreateIndex(
                name: "IX_user_screenings_UserId",
                table: "user_screenings",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_user_screenings_UserId",
                table: "user_screenings");

            migrationBuilder.DropColumn(
                name: "PregnancyStatus",
                table: "user_medical_profiles");

            migrationBuilder.RenameColumn(
                name: "LastScheduledDate",
                table: "user_screenings",
                newName: "ScheduledDate");

            migrationBuilder.AddColumn<DateOnly>(
                name: "DueDate",
                table: "user_screenings",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AlterColumn<int>(
                name: "PregnancyApplicable",
                table: "FrequencyRule",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "idx_status_due",
                table: "user_screenings",
                columns: new[] { "Status", "DueDate" });

            migrationBuilder.CreateIndex(
                name: "idx_user_due_date",
                table: "user_screenings",
                columns: new[] { "UserId", "DueDate" });
        }
    }
}
