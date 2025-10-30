using System.Text.Json.Serialization;

namespace IoTM.Dtos.HealthPoints
{
    public class SpO2PointDto : HealthPointDto
    {
        [JsonPropertyName("percentage")]
        public int Percentage { get; set; }
    }
}