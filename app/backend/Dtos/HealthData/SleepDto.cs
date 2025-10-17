using System.Text.Json.Serialization;
using IoTM.Dtos.HealthPoints;

namespace IoTM.Dtos.HealthData
{
    public class SleepDto : HealthDataDto
    {
        [JsonPropertyName("points")]
        public required List<SleepSegmentDto> Points { get; set; }
    }
}