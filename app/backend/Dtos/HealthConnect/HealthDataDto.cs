using System.Text.Json.Serialization;
using IoTM.Dtos.HealthPoints;

namespace IoTM.Dtos.HealthConnect
{
    /// <summary>
    /// Parent Class data structure used for HealthConnect data input 
    /// </summary>
    public abstract class HealthDataDto
    {
        [JsonPropertyName("range")]
        public required RangeDto Range { get; set; }
    }
}