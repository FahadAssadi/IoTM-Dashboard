namespace IoTM.Config
{
    public class HealthThresholds
    {
        public required BPMThresholds BPM { get; set; }
        public required BloodPressureThresholds BloodPressure { get; set; }
        public required SpO2Thresholds SpO2 { get; set; }
    }

    public class BloodPressureThresholds
    {
        public required List<BloodPressureCategory> Categories { get; set; }
        // public required List<GenericCategory> InnerDeviation { get; set; }
        // public required List<GenericCategory> OuterDeviation { get; set; }
        public required List<GenericCategory> DeviationCategories { get; set; }
        public required double MinSegmentDuration { get; set; }
        public required double MaxSegmentDuration { get; set; }
        public required double StdDevThreshold { get; set; }
    }

    public class BPMThresholds
    {
        public required List<GenericCategory> Categories { get; set; }
        public required List<GenericCategory> DeviationCategories { get; set; }
        public required double MinSegmentDuration { get; set; }
        public required double MaxSegmentDuration { get; set; }
        public required double StdDevThreshold { get; set; }
    }

    public class SpO2Thresholds
    {
        public required List<GenericCategory> Categories { get; set; }
        public required List<GenericCategory> DeviationCategories { get; set; }
        public required double MinSegmentDuration { get; set; }
        public required double MaxSegmentDuration { get; set; }
        public required double StdDevThreshold { get; set; }
    }

    public class BloodPressureCategory
    {
        public required string Name { get; set; }
        public double Priority { get; set; } = 10;
        public int SystolicMin { get; set; }
        public int SystolicMax { get; set; }
        public int DiastolicMin { get; set; }
        public int DiastolicMax { get; set; }
    }

    public class GenericCategory
    {
        public required string Name { get; set; }
        public double Priority { get; set;} = 10; // Default Priority of 10
        public double Min { get; set; }
        public double Max { get; set; }
    }
}
