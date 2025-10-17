import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react";

// TODO: FIX THIS PROPERLY
type VitalCardProps = {
  title: string;
  value: number | string;
  unit?: string;
  status: "normal" | "good" | "warning" | "alert" | string;
  change?: string;
  icon?: ReactNode;
};

export function VitalCard({ title, value, unit, status, change, icon }: VitalCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-teal-700"
      case "good":
        return "text-emerald-700"
      case "warning":
        return "text-amber-700"
      case "alert":
        return "text-red-700"
      default:
        return "text-teal-700"
    }
  }
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-800">{title}</CardTitle>
          {icon}
        </div>

        <div className="flex items-end gap-1">
          <p className="text-3xl font-bold text-slate-900">{value} </p>
          <p className="text-sm text-slate-600 mb-1">{unit}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          <span className={getStatusColor(status)}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
          {" · "}
          <span className="text-slate-600">{change} from yesterday</span>
        </p>
      </CardContent>
    </Card>
  )
}