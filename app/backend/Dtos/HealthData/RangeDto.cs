using System.Text.Json.Serialization;

namespace IoTM.Dtos.HealthData
{
    public class RangeDto
{
    [JsonPropertyName("start")]
    public DateTime Start { get; set; }

    [JsonPropertyName("end")]
    public DateTime End { get; set; }
}

}