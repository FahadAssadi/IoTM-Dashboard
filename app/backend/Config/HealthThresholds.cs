namespace IoTM.Config
{
    public class HealthThresholds
    {
        public required GeneralThresholds General { get; set; }
        public required BloodPressureThresholds BloodPressure { get; set; }
    }

    public class GeneralThresholds
    {
        public required List<HeartRateCategory> HeartRateCategories { get; set; }
    }

    public class BloodPressureThresholds
    {
        public required List<BloodPressureCategory> Categories { get; set; }
        public required List<DeviationCategory> InnerDeviation { get; set; }
        public required List<DeviationCategory> OuterDeviation { get; set; }
    }

    public class HeartRateCategory
    {
        public required string Name { get; set; }
        public int Min { get; set; }
        public int Max { get; set; }
    }

    public class BloodPressureCategory
    {
        public required string Name { get; set; }
        public int SystolicMin { get; set; }
        public int SystolicMax { get; set; }
        public int DiastolicMin { get; set; }
        public int DiastolicMax { get; set; }
    }

    public class DeviationCategory
    {
        public required string Name { get; set; }
        public double? Min { get; set; }  // nullable so we can omit for "Low"
        public double? Max { get; set; }  // nullable so we can omit for "High"
    }
}
