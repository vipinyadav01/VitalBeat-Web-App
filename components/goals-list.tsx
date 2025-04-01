"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { FitnessGoal } from "@/lib/types"
import { initializeApp } from "firebase/app"
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { format, isPast } from "date-fns"
import { CheckCircle, Clock, Target, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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

interface GoalsListProps {
  userId: string
}

export function GoalsList({ userId }: GoalsListProps) {
  const [goals, setGoals] = useState<FitnessGoal[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "fitnessGoals"), where("userId", "==", userId))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsList: FitnessGoal[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        goalsList.push({
          id: doc.id,
          userId: data.userId,
          title: data.title,
          targetValue: data.targetValue,
          currentValue: data.currentValue,
          type: data.type,
          deadline: data.deadline.toDate(),
          startDate: data.startDate.toDate(),
          completed: data.completed,
        })
      })

      setGoals(goalsList)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  const updateGoalProgress = async (goalId: string, newValue: number) => {
    try {
      const goalRef = doc(db, "fitnessGoals", goalId)
      await updateDoc(goalRef, { currentValue: newValue })

      toast({
        title: "Progress updated",
        description: "Your goal progress has been updated.",
      })
    } catch (error) {
      console.error("Error updating goal progress:", error)
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      })
    }
  }

  const markGoalComplete = async (goalId: string) => {
    try {
      const goalRef = doc(db, "fitnessGoals", goalId)
      await updateDoc(goalRef, { completed: true })

      toast({
        title: "Goal completed",
        description: "Congratulations on achieving your goal!",
      })
    } catch (error) {
      console.error("Error marking goal as complete:", error)
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteGoal = async (goalId: string) => {
    try {
      await deleteDoc(doc(db, "fitnessGoals", goalId))

      toast({
        title: "Goal deleted",
        description: "Your goal has been deleted.",
      })
    } catch (error) {
      console.error("Error deleting goal:", error)
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
          <CardDescription>Loading your fitness goals...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
          <CardDescription>Track your fitness journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              You haven't set any goals yet. Create your first goal to start tracking your progress!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Goals</CardTitle>
        <CardDescription>Track your fitness journey</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = Math.min(100, (goal.currentValue / goal.targetValue) * 100)
            const isOverdue = isPast(goal.deadline) && !goal.completed

            return (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      {goal.title}
                      {goal.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {isOverdue && <Clock className="h-4 w-4 text-red-500" />}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {goal.type === "weight"
                        ? "Target weight: "
                        : goal.type === "calories"
                          ? "Target calories: "
                          : goal.type === "duration"
                            ? "Target duration: "
                            : "Target frequency: "}
                      {goal.targetValue}
                      {goal.type === "weight"
                        ? " kg"
                        : goal.type === "calories"
                          ? " kcal"
                          : goal.type === "duration"
                            ? " min"
                            : " workouts/week"}
                    </p>
                    <p className="text-xs text-muted-foreground">Due by {format(goal.deadline, "PPP")}</p>
                  </div>
                  <div className="flex gap-2">
                    {!goal.completed && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => markGoalComplete(goal.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this goal? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteGoal(goal.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Progress: {goal.currentValue} / {goal.targetValue}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  {!goal.completed && (
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateGoalProgress(goal.id, Math.max(0, goal.currentValue - 1))}
                      >
                        -
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateGoalProgress(goal.id, goal.currentValue + 1)}
                      >
                        +
                      </Button>
                      <Target className="h-4 w-4 ml-auto text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

