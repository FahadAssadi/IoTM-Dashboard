using System.Text.Json.Serialization;

namespace IoTM.Dtos.HealthPoints
{
    public class BPMPointDto : HealthPointDto
    {
        [JsonPropertyName("bpm")]
        public int Bpm { get; set; }
    }
}