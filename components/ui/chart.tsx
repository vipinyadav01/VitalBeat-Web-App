import type React from "react"
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

interface ChartContainerProps {
  data: any[]
  xAxisKey: string
  yAxisKey: string
  secondaryYAxisKey?: string
  children: React.ReactNode
}

export function ChartContainer({ data, xAxisKey, yAxisKey, secondaryYAxisKey, children }: ChartContainerProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis yAxisId="left" />
        {secondaryYAxisKey && <YAxis yAxisId="right" orientation="right" />}
        {children}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: any[]
  label?: string
}

export function ChartTooltipContent({ active, payload, label }: ChartTooltipContentProps) {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-card rounded-md border">
        <p className="font-bold">{`${label}`}</p>
        {payload.map((item, index) => (
          <p key={index} className="text-sm text-muted-foreground">{`${item.name}: ${item.value}`}</p>
        ))}
      </div>
    )
  }

  return null
}

export const ChartTooltip = ({ children }: { children?: React.ReactNode }) => {
  return <Tooltip content={children ? children : <ChartTooltipContent />} />
}

export { Line, RechartsLineChart as LineChart, XAxis, YAxis }

