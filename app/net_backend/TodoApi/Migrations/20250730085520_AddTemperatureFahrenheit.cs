using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoApi.Migrations
{
    /// <inheritdoc />
    public partial class AddTemperatureFahrenheit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Summary",
                table: "WeatherForecasts",
                newName: "summary");

            migrationBuilder.RenameColumn(
                name: "TemperatureCelsius",
                table: "WeatherForecasts",
                newName: "temperature_celsius");

            migrationBuilder.RenameColumn(
                name: "DateTime",
                table: "WeatherForecasts",
                newName: "date_time");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "summary",
                table: "WeatherForecasts",
                newName: "Summary");

            migrationBuilder.RenameColumn(
                name: "temperature_celsius",
                table: "WeatherForecasts",
                newName: "TemperatureCelsius");

            migrationBuilder.RenameColumn(
                name: "date_time",
                table: "WeatherForecasts",
                newName: "DateTime");
        }
    }
}
