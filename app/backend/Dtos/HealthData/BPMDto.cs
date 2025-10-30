using System.Text.Json.Serialization;
using IoTM.Dtos.HealthPoints;

namespace IoTM.Dtos.HealthData
{
    public class BPMDto : HealthDataDto
    {
        [JsonPropertyName("points")]
        public required List<BPMPointDto> Points { get; set; }
    }
}