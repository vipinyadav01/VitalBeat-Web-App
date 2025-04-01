"use client"

import type { Activity } from "@/lib/types"
import { format, subDays, eachDayOfInterval } from "date-fns"
import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent, Line, XAxis, YAxis } from "@/components/ui/chart"

interface ActivityChartProps {
  activities: Activity[]
}

export function ActivityChart({ activities }: ActivityChartProps) {
  // Get the last 7 days
  const today = new Date()
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  })

  // Prepare data for the chart
  const chartData = last7Days.map((day) => {
    // Filter activities for this day
    const dayActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.date)
      return (
        activityDate.getDate() === day.getDate() &&
        activityDate.getMonth() === day.getMonth() &&
        activityDate.getFullYear() === day.getFullYear()
      )
    })

    // Calculate total calories and duration for this day
    const totalCalories = dayActivities.reduce((sum, activity) => sum + activity.calories, 0)
    const totalDuration = dayActivities.reduce((sum, activity) => sum + activity.duration, 0)

    return {
      date: format(day, "MMM dd"),
      calories: totalCalories,
      duration: totalDuration,
    }
  })

  return (
    <div className="w-full h-[300px]">
      <ChartContainer data={chartData} xAxisKey="date" yAxisKey="calories" secondaryYAxisKey="duration">
        <Chart>
          <XAxis />
          <YAxis />
          <Line dataKey="calories" name="Calories" stroke="#ef4444" strokeWidth={2} />
          <Line dataKey="duration" name="Duration (min)" stroke="#3b82f6" strokeWidth={2} />
          <ChartTooltip>
            <ChartTooltipContent />
          </ChartTooltip>
        </Chart>
      </ChartContainer>
    </div>
  )
}

