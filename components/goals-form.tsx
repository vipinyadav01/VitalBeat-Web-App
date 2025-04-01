"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { FitnessGoal } from "@/lib/types"
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

interface GoalsFormProps {
  userId: string
  onGoalAdded: () => void
}

export function GoalsForm({ userId, onGoalAdded }: GoalsFormProps) {
  const [title, setTitle] = useState("")
  const [targetValue, setTargetValue] = useState("")
  const [type, setType] = useState<"weight" | "calories" | "duration" | "frequency">("weight")
  const [deadline, setDeadline] = useState<Date>(new Date())
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newGoal: Omit<FitnessGoal, "id"> = {
        userId,
        title,
        targetValue: Number.parseFloat(targetValue),
        currentValue: 0,
        type,
        deadline,
        startDate: new Date(),
        completed: false,
      }

      await addDoc(collection(db, "fitnessGoals"), newGoal)

      // Reset form
      setTitle("")
      setTargetValue("")
      setType("weight")
      setDeadline(new Date())

      toast({
        title: "Goal added",
        description: "Your fitness goal has been added successfully.",
      })

      onGoalAdded()
    } catch (error) {
      console.error("Error adding goal:", error)
      toast({
        title: "Error",
        description: "Failed to add goal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set a New Goal</CardTitle>
        <CardDescription>Define your fitness targets</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              placeholder="e.g., Lose weight, Run a marathon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Goal Type</Label>
              <Select
                value={type}
                onValueChange={(value: "weight" | "calories" | "duration" | "frequency") => setType(value)}
                required
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select goal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="calories">Calories</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="frequency">Frequency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetValue">Target Value</Label>
              <Input
                id="targetValue"
                type="number"
                placeholder={
                  type === "weight"
                    ? "Target weight in kg"
                    : type === "calories"
                      ? "Target calories to burn"
                      : type === "duration"
                        ? "Target minutes"
                        : "Target workouts per week"
                }
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={(date) => date && setDeadline(date)}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Goal"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

