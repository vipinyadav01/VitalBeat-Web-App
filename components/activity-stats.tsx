"use client"

import type { Activity } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityIcon, Flame, Clock, Calendar } from "lucide-react"
import { startOfWeek, isWithinInterval } from "date-fns"

interface ActivityStatsProps {
  activities: Activity[]
}

export function ActivityStats({ activities }: ActivityStatsProps) {
  // Calculate total activities
  const totalActivities = activities.length

  // Calculate total calories burned
  const totalCalories = activities.reduce((sum, activity) => sum + activity.calories, 0)

  // Calculate total duration in minutes
  const totalDuration = activities.reduce((sum, activity) => sum + activity.duration, 0)

  // Calculate activities this week
  const today = new Date()
  const weekStart = startOfWeek(today)
  const activitiesThisWeek = activities.filter((activity) =>
    isWithinInterval(new Date(activity.date), {
      start: weekStart,
      end: today,
    }),
  ).length

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
          <ActivityIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalActivities}</div>
          <p className="text-xs text-muted-foreground">Workouts logged</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCalories}</div>
          <p className="text-xs text-muted-foreground">Total calories</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDuration} min</div>
          <p className="text-xs text-muted-foreground">Minutes of exercise</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activitiesThisWeek}</div>
          <p className="text-xs text-muted-foreground">Workouts this week</p>
        </CardContent>
      </Card>
    </>
  )
}

