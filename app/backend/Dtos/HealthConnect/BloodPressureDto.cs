using System.Text.Json.Serialization;
using IoTM.Dtos.HealthPoints;

namespace IoTM.Dtos.HealthConnect
{
    public class BloodPressureDto : HealthDataDto
    {
        [JsonPropertyName("points")]
        public required List<BloodPressurePointDto> Points { get; set; }
    }
}