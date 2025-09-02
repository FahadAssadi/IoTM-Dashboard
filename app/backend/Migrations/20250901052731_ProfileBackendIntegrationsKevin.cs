using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IoTM.Migrations
{
    /// <inheritdoc />
    public partial class ProfileBackendIntegrationsKevin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "users",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");
        }
    }
}
