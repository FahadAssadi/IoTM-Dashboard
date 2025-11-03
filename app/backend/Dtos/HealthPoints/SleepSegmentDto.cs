using System.Text.Json.Serialization;

namespace IoTM.Dtos.HealthPoints
{
    public class SleepSegmentDto : HealthSegmentDto
    {
        [JsonPropertyName("stageName")]
        public string StageName { get; set; } = "undefined";

        [JsonPropertyName("stage")]
        public int Stage { get; set; }
    }
}