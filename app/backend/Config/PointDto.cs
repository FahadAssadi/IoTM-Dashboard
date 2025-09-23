using System.Text.Json.Serialization;

namespace IoTM.Config
{
    public class PointDto
    {
        [JsonPropertyName("time")]
        public DateTime Time { get; set; }

        [JsonPropertyName("bpm")]
        public int? Bpm { get; set; }

        [JsonPropertyName("percentage")] // for SpO2
        public int? Percentage { get; set; }
    }
}