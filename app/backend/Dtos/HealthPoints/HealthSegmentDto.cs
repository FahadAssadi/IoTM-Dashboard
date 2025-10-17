using System.Text.Json.Serialization;

namespace IoTM.Dtos.HealthPoints
{
    public abstract class HealthSegmentDto
    {
        [JsonPropertyName("start")]
        public DateTime Start { get; set; }

        [JsonPropertyName("end")]
        public DateTime End { get; set; }

    }
}