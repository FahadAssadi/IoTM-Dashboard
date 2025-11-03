using System.Text.Json.Serialization;

namespace IoTM.Dtos.HealthPoints
{
    public class BloodPressurePointDto : HealthPointDto
    {
        [JsonPropertyName("sys")] // for Blood Pressure
        public int Systolic { get; set; }
        [JsonPropertyName("dia")] // for Blood Pressure
        public int Diastolic { get; set; }
    }
}