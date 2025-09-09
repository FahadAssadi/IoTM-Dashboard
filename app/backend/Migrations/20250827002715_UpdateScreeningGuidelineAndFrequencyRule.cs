using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace IoTM.Migrations
{
    /// <inheritdoc />
    public partial class UpdateScreeningGuidelineAndFrequencyRule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FrequencyMonths",
                table: "screening_guidelines",
                newName: "PregnancyApplicable");

            migrationBuilder.AddColumn<string>(
                name: "Cost",
                table: "screening_guidelines",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DefaultFrequencyMonths",
                table: "screening_guidelines",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Delivery",
                table: "screening_guidelines",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Link",
                table: "screening_guidelines",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "screening_guidelines",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "isRecurring",
                table: "screening_guidelines",
                type: "boolean",
                nullable: false,
                defaultValue: false);

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
                    PregnancyApplicable = table.Column<int>(type: "integer", nullable: false),
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

            migrationBuilder.CreateIndex(
                name: "IX_FrequencyRule_ScreeningGuidelineGuidelineId",
                table: "FrequencyRule",
                column: "ScreeningGuidelineGuidelineId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FrequencyRule");

            migrationBuilder.DropColumn(
                name: "Cost",
                table: "screening_guidelines");

            migrationBuilder.DropColumn(
                name: "DefaultFrequencyMonths",
                table: "screening_guidelines");

            migrationBuilder.DropColumn(
                name: "Delivery",
                table: "screening_guidelines");

            migrationBuilder.DropColumn(
                name: "Link",
                table: "screening_guidelines");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "screening_guidelines");

            migrationBuilder.DropColumn(
                name: "isRecurring",
                table: "screening_guidelines");

            migrationBuilder.RenameColumn(
                name: "PregnancyApplicable",
                table: "screening_guidelines",
                newName: "FrequencyMonths");
        }
    }
}
