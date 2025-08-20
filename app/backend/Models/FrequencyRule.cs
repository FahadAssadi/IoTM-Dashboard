namespace IoTM.Models
{
    public class FrequencyRule
    {
        public int Id { get; set; }
        public Guid GuidelineId { get; set; }
        public int? MinAge { get; set; }
        public int? MaxAge { get; set; }
        public SexApplicable? SexApplicable { get; set; }
        public bool PregnancyApplicable { get; set; } //TODO: enum? not applicable, is applicable, has new born
        public int FrequencyMonths { get; set; }
        public string? Condition { get; set; } // e.g. "smoker", "family history"
    }
}