"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Activity } from "@/lib/types"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ActivityFormProps {
  activity?: Omit<Activity, "userId">
  onSubmit: (activity: Omit<Activity, "id" | "userId">) => void
}

export function ActivityForm({ activity, onSubmit }: ActivityFormProps) {
  const [name, setName] = useState(activity?.name || "")
  const [duration, setDuration] = useState(activity?.duration?.toString() || "")
  const [calories, setCalories] = useState(activity?.calories?.toString() || "")
  const [date, setDate] = useState<Date>(activity?.date || new Date())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSubmit({
      name,
      duration: Number.parseInt(duration),
      calories: Number.parseInt(calories),
      date,
    })

    if (!activity) {
      setName("")
      setDuration("")
      setCalories("")
      setDate(new Date())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Activity Name</Label>
        <Input
          id="name"
          placeholder="e.g., Running, Cycling, Yoga"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          min="1"
          placeholder="30"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="calories">Calories Burned</Label>
        <Input
          id="calories"
          type="number"
          min="1"
          placeholder="250"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
          </PopoverContent>
        </Popover>
      </div>
      <Button type="submit" className="w-full">
        {activity ? "Update Activity" : "Add Activity"}
      </Button>
    </form>
  )
}

