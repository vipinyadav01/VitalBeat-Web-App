"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { WorkoutReminder, WorkoutCategory } from "@/lib/types"
import { initializeApp } from "firebase/app"
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { CalendarIcon, Clock, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface WorkoutRemindersProps {
  userId: string
}

export function WorkoutReminders({ userId }: WorkoutRemindersProps) {
  const [reminders, setReminders] = useState<WorkoutReminder[]>([])
  const [categories, setCategories] = useState<WorkoutCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date())
  const [repeat, setRepeat] = useState<"none" | "daily" | "weekly" | "monthly">("none")
  const [category, setCategory] = useState<string>("")
  const [enabled, setEnabled] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Fetch workout categories
    const categoriesQuery = query(collection(db, "workoutCategories"))

    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
      const categoriesList: WorkoutCategory[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        categoriesList.push({
          id: doc.id,
          name: data.name,
          icon: data.icon,
          color: data.color,
        })
      })

      setCategories(categoriesList)
    })

    // Fetch reminders
    const remindersQuery = query(collection(db, "workoutReminders"), where("userId", "==", userId))

    const unsubscribeReminders = onSnapshot(remindersQuery, (snapshot) => {
      const remindersList: WorkoutReminder[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        remindersList.push({
          id: doc.id,
          userId: data.userId,
          title: data.title,
          description: data.description,
          scheduledFor: data.scheduledFor.toDate(),
          repeat: data.repeat,
          category: data.category,
          enabled: data.enabled,
        })
      })

      setReminders(remindersList)
      setLoading(false)
    })

    return () => {
      unsubscribeCategories()
      unsubscribeReminders()
    }
  }, [userId])

  const addReminder = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const newReminder: Omit<WorkoutReminder, "id"> = {
        userId,
        title,
        description,
        scheduledFor: scheduledDate,
        repeat,
        category: category || undefined,
        enabled,
      }

      await addDoc(collection(db, "workoutReminders"), newReminder)

      // Reset form
      setTitle("")
      setDescription("")
      setScheduledDate(new Date())
      setRepeat("none")
      setCategory("")
      setEnabled(true)

      toast({
        title: "Reminder added",
        description: "Your workout reminder has been scheduled.",
      })
    } catch (error) {
      console.error("Error adding reminder:", error)
      toast({
        title: "Error",
        description: "Failed to add reminder. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleReminder = async (id: string, enabled: boolean) => {
    try {
      const reminderRef = doc(db, "workoutReminders", id)
      await updateDoc(reminderRef, { enabled })

      toast({
        title: enabled ? "Reminder enabled" : "Reminder disabled",
        description: enabled ? "Your reminder is now active." : "Your reminder has been disabled.",
      })
    } catch (error) {
      console.error("Error toggling reminder:", error)
      toast({
        title: "Error",
        description: "Failed to update reminder. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteReminder = async (id: string) => {
    try {
      await deleteDoc(doc(db, "workoutReminders", id))

      toast({
        title: "Reminder deleted",
        description: "Your workout reminder has been deleted.",
      })
    } catch (error) {
      console.error("Error deleting reminder:", error)
      toast({
        title: "Error",
        description: "Failed to delete reminder. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Reminders</CardTitle>
        <CardDescription>Schedule reminders for your workouts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <form onSubmit={addReminder} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Reminder Title</Label>
              <Input
                id="title"
                placeholder="e.g., Morning Run, Gym Session"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add details about your workout"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={(date) => date && setScheduledDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repeat">Repeat</Label>
                <Select
                  value={repeat}
                  onValueChange={(value: "none" | "daily" | "weekly" | "monthly") => setRepeat(value)}
                >
                  <SelectTrigger id="repeat">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Don't repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-6">
                <Label htmlFor="enabled" className="cursor-pointer">
                  Enable Reminder
                </Label>
                <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Add Reminder
            </Button>
          </form>

          <div className="space-y-4">
            <h3 className="font-medium">Your Reminders</h3>

            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : reminders.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">You don't have any reminders yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reminders.map((reminder) => {
                  const category = categories.find((c) => c.id === reminder.category)

                  return (
                    <div key={reminder.id} className={cn("border rounded-lg p-3", !reminder.enabled && "opacity-60")}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{reminder.title}</h4>
                          {reminder.description && (
                            <p className="text-sm text-muted-foreground">{reminder.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {format(reminder.scheduledFor, "PPP")}
                              {reminder.repeat !== "none" && ` (${reminder.repeat})`}
                            </span>
                          </div>
                          {category && (
                            <div
                              className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs"
                              style={{ backgroundColor: category.color, color: "white" }}
                            >
                              {category.name}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={reminder.enabled}
                            onCheckedChange={(checked) => toggleReminder(reminder.id, checked)}
                            size="sm"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteReminder(reminder.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

