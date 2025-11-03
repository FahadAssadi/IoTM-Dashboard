using System.Text.Json.Serialization;
using IoTM.Dtos.HealthPoints;

namespace IoTM.Dtos.HealthConnect
{
    public class BPMDto : HealthDataDto
    {
        [JsonPropertyName("points")]
        public required List<BPMPointDto> Points { get; set; }
    }
}