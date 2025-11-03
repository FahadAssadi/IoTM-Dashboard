using System.Text.Json.Serialization;
using IoTM.Dtos.HealthPoints;

namespace IoTM.Dtos.HealthConnect
{
    public class SleepDto : HealthDataDto
    {
        [JsonPropertyName("points")]
        public required List<SleepSegmentDto> Points { get; set; }
    }
}