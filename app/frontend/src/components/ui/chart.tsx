import {
    Area,
    AreaChart as RechartsAreaChart,
    Bar,
    BarChart as RechartsBarChart,
    CartesianGrid,
    Line,
    LineChart as RechartsLineChart,
    Tooltip,
    XAxis,
    YAxis,
  } from "recharts"
  
  interface ChartProps {
    data: any[]
    categories: string[]
    index: string
    colors: string[]
    valueFormatter?: (value: any, category?: string) => string
    showAnimation?: boolean
    showLegend?: boolean
    showXAxis?: boolean
    showYAxis?: boolean
    showGridLines?: boolean
    className?: string
    yAxisWidth?: number
    layout?: "horizontal" | "vertical" | "stacked"
  }
  
  export function LineChart({
    data,
    categories,
    index,
    colors,
    valueFormatter,
    showAnimation,
    showLegend,
    className,
    showXAxis = true,
    showGridLines = true,
    yAxisWidth = 40,
  }: ChartProps) {
    return (
      <RechartsLineChart data={data} className={className}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={showGridLines ? 1 : 0} />
        <XAxis
          dataKey={index}
          tick={{ fontSize: 12 }}
          stroke="#888888"
          style={{ display: showXAxis ? "block" : "none" }}
        />
        <YAxis tick={{ fontSize: 12 }} stroke="#888888" width={yAxisWidth} />
        <Tooltip
          formatter={(value, name) => {
            if (valueFormatter) {
              return [valueFormatter(value, name), name]
            }
            return [value, name]
          }}
        />
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsLineChart>
    )
  }
  
  export function BarChart({
    data,
    categories,
    index,
    colors,
    valueFormatter,
    showAnimation,
    showLegend,
    className,
    layout = "horizontal",
  }: ChartProps) {
    return (
      <RechartsBarChart data={data} className={className} layout={layout}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis />
        <Tooltip
          formatter={(value, name) => {
            if (valueFormatter) {
              return [valueFormatter(value, name), name]
            }
            return [value, name]
          }}
        />
        {categories.map((category, i) => (
          <Bar key={category} dataKey={category} fill={colors[i % colors.length]} />
        ))}
      </RechartsBarChart>
    )
  }
  
  export function AreaChart({
    data,
    categories,
    index,
    colors,
    valueFormatter,
    showAnimation,
    showLegend,
    className,
  }: ChartProps) {
    return (
      <RechartsAreaChart data={data} className={className}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis />
        <Tooltip
          formatter={(value, name) => {
            if (valueFormatter) {
              return [valueFormatter(value, name), name]
            }
            return [value, name]
          }}
        />
        {categories.map((category, i) => (
          <Area
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length]}
            fill={colors[i % colors.length]}
            fillOpacity={0.3}
          />
        ))}
      </RechartsAreaChart>
    )
  }