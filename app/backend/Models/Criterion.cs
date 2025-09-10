using System.Text.Json.Serialization;

namespace IoTM.Models
{
    // What user attribute to check
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum LifestyleFactor
    {
        SmokingStatus,
        AlcoholFrequency,
        ActivityLevel,
        Age,
        Sex,
        PregnancyStatus
    }

    // How to compare
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ComparisonOperator
    {
        Equals,
        NotEquals,
        In,
        NotIn,
        GreaterOrEqual,
        LessOrEqual,
        Between,
        Exists,
        NotExists
    }

    // Single rule about one factor
    public class Criterion
    {
        public LifestyleFactor Factor { get; set; }
        public ComparisonOperator Operator { get; set; }

        // For categorical comparisons (Equals/In/NotEquals/NotIn)
        public List<string>? Values { get; set; }

        // For numeric/range comparisons (GreaterOrEqual/LessOrEqual/Between)
        public double? Min { get; set; }
        public double? Max { get; set; }
    }

    // Group of criteria with AND/OR semantics
    public class CriteriaGroup
    {
        // All must be true (AND)
        public List<Criterion> All { get; set; } = new();

        // At least one must be true (OR)
        public List<Criterion> Any { get; set; } = new();
    }
}