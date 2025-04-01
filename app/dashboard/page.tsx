"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { initializeApp } from "firebase/app"
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore"
import { ActivityForm } from "@/components/activity-form"
import { ActivityList } from "@/components/activity-list"
import { ActivityStats } from "@/components/activity-stats"
import { ActivityChart } from "@/components/activity-chart"
import { UserProfileForm } from "@/components/user-profile-form"
import { GoalsList } from "@/components/goals-list"
import { GoalsForm } from "@/components/goals-form"
import { ActivityCategories } from "@/components/activity-categories"
import { FriendsList } from "@/components/friends-list"
import { WorkoutReminders } from "@/components/workout-reminders"
import { ExportData } from "@/components/export-data"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { 
  LogOut, 
  Menu, 
  X, 
  ChevronRight, 
  User, 
  Target, 
  BarChart3, 
  Users, 
  Bell, 
  Download, 
  Hash, 
  Plus,
  Home,
  ListFilter
} from "lucide-react"
import type { Activity } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"

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
const auth = getAuth(app)
const db = getFirestore(app)

export default function DashboardPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedTab, setSelectedTab] = useState("dashboard")
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        fetchActivities(user.uid)
      } else {
        router.push("/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const fetchActivities = async (userId: string) => {
    try {
      const q = query(collection(db, "activities"), where("userId", "==", userId), orderBy("date", "desc"))

      const querySnapshot = await getDocs(q)
      const activitiesList: Activity[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        activitiesList.push({
          id: doc.id,
          name: data.name,
          duration: data.duration,
          calories: data.calories,
          date: data.date.toDate(),
          userId: data.userId,
          category: data.category || "",
        })
      })

      setActivities(activitiesList)
    } catch (error) {
      console.error("Error fetching activities:", error)
    }
  }

  const addActivity = async (activity: Omit<Activity, "id" | "userId">) => {
    try {
      const docRef = await addDoc(collection(db, "activities"), {
        ...activity,
        userId: user.uid,
        date: new Date(activity.date),
      })

      fetchActivities(user.uid)
    } catch (error) {
      console.error("Error adding activity:", error)
    }
  }

  const updateActivity = async (activity: Activity) => {
    try {
      const activityRef = doc(db, "activities", activity.id)
      await updateDoc(activityRef, {
        name: activity.name,
        duration: activity.duration,
        calories: activity.calories,
        date: new Date(activity.date),
        category: activity.category,
      })

      fetchActivities(user.uid)
    } catch (error) {
      console.error("Error updating activity:", error)
    }
  }

  const deleteActivity = async (id: string) => {
    try {
      await deleteDoc(doc(db, "activities", id))
      fetchActivities(user.uid)
    } catch (error) {
      console.error("Error deleting activity:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading your fitness journey...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/30 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground rounded-lg p-1.5">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">VitalBeat</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationsDropdown />
            <ThemeToggle />
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[280px] sm:w-[350px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={user?.email?.charAt(0) || "User"} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user?.email?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{user?.email}</p>
                        <Badge variant="outline" className="text-xs font-normal px-1">
                          Active Member
                        </Badge>
                      </div>
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <X className="h-4 w-4" />
                        </Button>
                      </SheetClose>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-auto py-2">
                    <nav className="grid gap-0.5 px-2">
                      <SheetClose asChild>
                        <Button variant={selectedTab === "dashboard" ? "secondary" : "ghost"} 
                          className="justify-start h-11" 
                          onClick={() => setSelectedTab("dashboard")}
                        >
                          <Home className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Button variant={selectedTab === "profile" ? "secondary" : "ghost"} 
                          className="justify-start h-11" 
                          onClick={() => setSelectedTab("profile")}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Button>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Button variant={selectedTab === "goals" ? "secondary" : "ghost"} 
                          className="justify-start h-11" 
                          onClick={() => setSelectedTab("goals")}
                        >
                          <Target className="mr-2 h-4 w-4" />
                          Goals
                        </Button>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Button variant={selectedTab === "categories" ? "secondary" : "ghost"} 
                          className="justify-start h-11" 
                          onClick={() => setSelectedTab("categories")}
                        >
                          <Hash className="mr-2 h-4 w-4" />
                          Categories
                        </Button>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Button variant={selectedTab === "friends" ? "secondary" : "ghost"} 
                          className="justify-start h-11" 
                          onClick={() => setSelectedTab("friends")}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Friends
                        </Button>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Button variant={selectedTab === "reminders" ? "secondary" : "ghost"} 
                          className="justify-start h-11" 
                          onClick={() => setSelectedTab("reminders")}
                        >
                          <Bell className="mr-2 h-4 w-4" />
                          Reminders
                        </Button>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Button variant={selectedTab === "export" ? "secondary" : "ghost"} 
                          className="justify-start h-11" 
                          onClick={() => setSelectedTab("export")}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export Data
                        </Button>
                      </SheetClose>
                    </nav>
                  </div>
                  
                  <div className="p-4 border-t">
                    <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="hidden md:flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user?.email?.charAt(0) || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.email?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block">
                <p className="text-sm font-medium leading-none">{user?.email}</p>
                <p className="text-xs text-muted-foreground mt-1">Active Member</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        <aside className="hidden md:flex flex-col w-64 border-r border-border/30 sticky top-16 h-[calc(100vh-4rem)] bg-background">
          <div className="p-4">
            <nav className="grid gap-1">
              <Button 
                variant={selectedTab === "dashboard" ? "secondary" : "ghost"} 
                className="justify-start h-11" 
                onClick={() => setSelectedTab("dashboard")}
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              
              <Button 
                variant={selectedTab === "profile" ? "secondary" : "ghost"} 
                className="justify-start h-11" 
                onClick={() => setSelectedTab("profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              
              <Button 
                variant={selectedTab === "goals" ? "secondary" : "ghost"} 
                className="justify-start h-11" 
                onClick={() => setSelectedTab("goals")}
              >
                <Target className="mr-2 h-4 w-4" />
                Goals
              </Button>
              
              <Button 
                variant={selectedTab === "categories" ? "secondary" : "ghost"} 
                className="justify-start h-11" 
                onClick={() => setSelectedTab("categories")}
              >
                <Hash className="mr-2 h-4 w-4" />
                Categories
              </Button>
              
              <Button 
                variant={selectedTab === "friends" ? "secondary" : "ghost"} 
                className="justify-start h-11" 
                onClick={() => setSelectedTab("friends")}
              >
                <Users className="mr-2 h-4 w-4" />
                Friends
              </Button>
              
              <Button 
                variant={selectedTab === "reminders" ? "secondary" : "ghost"} 
                className="justify-start h-11" 
                onClick={() => setSelectedTab("reminders")}
              >
                <Bell className="mr-2 h-4 w-4" />
                Reminders
              </Button>
              
              <Button 
                variant={selectedTab === "export" ? "secondary" : "ghost"} 
                className="justify-start h-11" 
                onClick={() => setSelectedTab("export")}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </nav>
          </div>
          
          <div className="mt-auto p-4 border-t border-border/30">
            <Card className="bg-primary/5 border-primary/10">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium">Premium Upgrade</p>
                  <p className="text-xs text-muted-foreground">Unlock advanced analytics and features</p>
                  <Button size="sm" className="mt-2 w-full">
                    Upgrade
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
        
        <main className="flex-1 container py-6 px-4">
          {selectedTab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                  <p className="text-muted-foreground mt-1">Welcome back to your fitness journey</p>
                </div>
                
                <Button className="md:w-auto w-full" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Add Activity
                </Button>
              </div>
              
              <div className="grid gap-6 md:grid-cols-4">
                <ActivityStats activities={activities} />
              </div>
              
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-border/30 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold">Activity Chart</CardTitle>
                        <CardDescription>Progress visualization</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <ListFilter className="h-4 w-4" />
                        Filter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ActivityChart activities={activities} />
                  </CardContent>
                </Card>
                
                <Card className="border-border/30 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Add Activity</CardTitle>
                    <CardDescription>Log your workout</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ActivityForm onSubmit={addActivity} />
                  </CardContent>
                </Card>
              </div>
              
              <Card className="border-border/30 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">Activity History</CardTitle>
                      <CardDescription>Past activities</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 gap-1">
                        Export
                        <Download className="h-3 w-3 ml-1" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 gap-1">
                        Filter
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ActivityList activities={activities} onDelete={deleteActivity} onUpdate={updateActivity} />
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
                <p className="text-muted-foreground mt-1">Manage your personal information</p>
              </div>
              
              <Card className="border-border/30 shadow-sm max-w-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Your Profile</CardTitle>
                  <CardDescription>Manage your account information</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserProfileForm userId={user.uid} />
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === "goals" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Goals</h2>
                <p className="text-muted-foreground mt-1">Set and track your fitness targets</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border/30 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Create Goal</CardTitle>
                    <CardDescription>Set new fitness goals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GoalsForm userId={user.uid} onGoalAdded={() => {}} />
                  </CardContent>
                </Card>
                
                <Card className="border-border/30 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Your Goals</CardTitle>
                    <CardDescription>Track your progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GoalsList userId={user.uid} />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {selectedTab === "categories" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
                <p className="text-muted-foreground mt-1">Organize your workouts</p>
              </div>
              
              <Card className="border-border/30 shadow-sm max-w-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Activity Categories</CardTitle>
                  <CardDescription>Organize your workouts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityCategories />
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === "friends" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Friends</h2>
                <p className="text-muted-foreground mt-1">Connect with workout buddies</p>
              </div>
              
              <Card className="border-border/30 shadow-sm max-w-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Friends</CardTitle>
                  <CardDescription>Connect with others</CardDescription>
                </CardHeader>
                <CardContent>
                  <FriendsList userId={user.uid} />
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === "reminders" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Reminders</h2>
                <p className="text-muted-foreground mt-1">Never miss a workout</p>
              </div>
              
              <Card className="border-border/30 shadow-sm max-w-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Workout Reminders</CardTitle>
                  <CardDescription>Schedule your routines</CardDescription>
                </CardHeader>
                <CardContent>
                  <WorkoutReminders userId={user.uid} />
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === "export" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Export Data</h2>
                <p className="text-muted-foreground mt-1">Download your fitness records</p>
              </div>
              
              <Card className="border-border/30 shadow-sm max-w-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Export Data</CardTitle>
                  <CardDescription>Download your fitness data</CardDescription>
                </CardHeader>
                <CardContent>
                  <ExportData activities={activities} />
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
      
      <footer className="py-6 px-4 border-t border-border/30 bg-background/80 backdrop-blur-sm">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary rounded-lg p-1.5">
              <BarChart3 className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium">VitalBeat</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Button variant="link" size="sm" className="text-xs text-muted-foreground">Privacy Policy</Button>
            <Button variant="link" size="sm" className="text-xs text-muted-foreground">Terms of Service</Button>
            <Button variant="link" size="sm" className="text-xs text-muted-foreground">Help Center</Button>
          </div>
          
          <p className="text-xs text-muted-foreground">© 2025 VitalBeat. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}