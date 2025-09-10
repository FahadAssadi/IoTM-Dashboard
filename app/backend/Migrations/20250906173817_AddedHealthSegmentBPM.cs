using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IoTM.Migrations
{
    /// <inheritdoc />
    public partial class AddedHealthSegmentBPM : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HealthSegmentBPMs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Start = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    End = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Points = table.Column<int>(type: "integer", nullable: false),
                    AverageBpm = table.Column<double>(type: "double precision", nullable: true),
                    StandardDeviation = table.Column<double>(type: "double precision", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthSegmentBPMs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HealthSegmentBPMs_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HealthSegmentBPMs_UserId",
                table: "HealthSegmentBPMs",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HealthSegmentBPMs");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IoTM.Migrations
{
    /// <inheritdoc />
    public partial class AddedHealthSegmentBPM : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HealthSegmentBPMs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Start = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    End = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Points = table.Column<int>(type: "integer", nullable: false),
                    AverageBpm = table.Column<double>(type: "double precision", nullable: true),
                    StandardDeviation = table.Column<double>(type: "double precision", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthSegmentBPMs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HealthSegmentBPMs_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HealthSegmentBPMs_UserId",
                table: "HealthSegmentBPMs",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HealthSegmentBPMs");
        }
    }
}
