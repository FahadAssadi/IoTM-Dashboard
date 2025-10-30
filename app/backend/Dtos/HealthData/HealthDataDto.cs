using System.Text.Json.Serialization;
using IoTM.Dtos.HealthPoints;

namespace IoTM.Dtos.HealthData
{
    public abstract class HealthDataDto
    {
        [JsonPropertyName("range")]
        public required RangeDto Range { get; set; }

        // [JsonPropertyName("points")]
        // public required List<HealthPointDto> Points { get; set; }
    }
}