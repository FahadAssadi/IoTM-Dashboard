import { Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card"
import { useEffect, useState } from "react"
import { loadBPM, BPMDataPoint } from "./activity-components/load-bpm-data";
import { HeartRateDetailedChart } from "./activity-components/heart-rate-chart";

export default function HealthInsightsActivityTab () {
  const [bpmData, setBpmData ] = useState<BPMDataPoint[]>([]);
  useEffect(() => {
    async function fetchData() {
      const data = await loadBPM();
      setBpmData(data);
    }
    fetchData();
  }, []);

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Average Heart Rate</CardTitle>
                <CardDescription>Heart rate information</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <HeartRateDetailedChart bpmData={bpmData}/>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Tracking</CardTitle>
                <CardDescription>Steps, distance, and active minutes</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <HeartRateDetailedChart bpmData={bpmData}/>
              </CardContent>
            </Card>
          </div>
    )
}
