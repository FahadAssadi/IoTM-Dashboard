using System.Text.Json.Serialization;

namespace IoTM.Dtos.HealthPoints
{
    public abstract class HealthPointDto
    {
        [JsonPropertyName("time")]
        public DateTime Time { get; set; }
    }
}