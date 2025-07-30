using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

public class WeatherForecast
{
    [Key]
    [JsonPropertyName("date_time")]
    public DateTime date_time { get; set; }

    [JsonPropertyName("temperature_celsius")]
    public int temperature_celsius { get; set; }

    [JsonPropertyName("summary")]
    public string? summary { get; set; }
}
