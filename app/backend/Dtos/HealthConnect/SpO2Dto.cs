using System.Text.Json.Serialization;
using IoTM.Dtos.HealthPoints;

namespace IoTM.Dtos.HealthConnect
{
    public class SpO2Dto : HealthDataDto
    {
        [JsonPropertyName("points")]
        public required List<SpO2PointDto> Points { get; set; }
    }
}