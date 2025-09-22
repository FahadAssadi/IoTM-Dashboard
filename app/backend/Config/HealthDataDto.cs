using System.Text.Json.Serialization;

namespace IoTM.Config
{
    public class HealthDataDto
    {
        [JsonPropertyName("range")]
        public required RangeDto Range { get; set; }

        [JsonPropertyName("points")]
        public required List<PointDto> Points { get; set; }
    }
}