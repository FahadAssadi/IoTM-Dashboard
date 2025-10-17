using System.Text.Json.Serialization;
using IoTM.Dtos.HealthPoints;

namespace IoTM.Dtos.HealthData
{
    public class SpO2Dto : HealthDataDto
    {
        [JsonPropertyName("points")]
        public required List<SpO2PointDto> Points { get; set; }
    }
}