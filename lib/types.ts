export interface Activity {
  id: string
  name: string
  duration: number
  calories: number
  date: Date
  userId: string
  category: string
}

export interface UserProfile {
  id: string
  displayName: string
  photoURL: string
  bio: string
  height?: number
  weight?: number
  age?: number
  gender?: string
}

export interface FitnessGoal {
  id: string
  userId: string
  title: string
  targetValue: number
  currentValue: number
  type: "weight" | "calories" | "duration" | "frequency"
  deadline: Date
  startDate: Date
  completed: boolean
}

export interface WorkoutCategory {
  id: string
  name: string
  icon: string
  color: string
}

export interface FriendConnection {
  id: string
  userId: string
  friendId: string
  status: "pending" | "accepted" | "rejected"
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "reminder" | "goal" | "friend" | "system"
  read: boolean
  createdAt: Date
  actionLink?: string
}

export interface WorkoutReminder {
  id: string
  userId: string
  title: string
  description?: string
  scheduledFor: Date
  repeat: "daily" | "weekly" | "monthly" | "none"
  category?: string
  enabled: boolean
}

