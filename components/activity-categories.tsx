"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { WorkoutCategory } from "@/lib/types"
import { initializeApp } from "firebase/app"
import { getFirestore, collection, query, onSnapshot, addDoc, doc, deleteDoc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { Trash2 } from "lucide-react"
import { HexColorPicker } from "react-colorful"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

// Available icons
const availableIcons = [
  "dumbbell",
  "running",
  "bicycle",
  "swimming",
  "yoga",
  "hiking",
  "basketball",
  "tennis",
  "soccer",
  "golf",
  "boxing",
  "rowing",
]

export function ActivityCategories() {
  const [categories, setCategories] = useState<WorkoutCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("dumbbell")
  const [selectedColor, setSelectedColor] = useState("#3b82f6")
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "workoutCategories"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
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
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const addCategory = async () => {
    if (!newCategory.trim()) return

    try {
      await addDoc(collection(db, "workoutCategories"), {
        name: newCategory,
        icon: selectedIcon,
        color: selectedColor,
      })

      setNewCategory("")
      setSelectedIcon("dumbbell")
      setSelectedColor("#3b82f6")
      setIsDialogOpen(false)

      toast({
        title: "Category added",
        description: "New workout category has been added.",
      })
    } catch (error) {
      console.error("Error adding category:", error)
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, "workoutCategories", id))

      toast({
        title: "Category deleted",
        description: "Workout category has been deleted.",
      })
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getIconComponent = (iconName: string, color: string) => {
    return (
      <div className="flex items-center justify-center h-8 w-8 rounded-full" style={{ backgroundColor: color }}>
        <span className="text-white text-sm">{iconName.charAt(0).toUpperCase()}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workout Categories</CardTitle>
          <CardDescription>Loading categories...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Workout Categories</CardTitle>
          <CardDescription>Organize your fitness activities</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Workout Category</DialogTitle>
              <DialogDescription>Create a new category to organize your workouts.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  placeholder="e.g., Running, Weightlifting"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-icon">Icon</Label>
                <Select value={selectedIcon} onValueChange={setSelectedIcon}>
                  <SelectTrigger id="category-icon">
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIcons.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon.charAt(0).toUpperCase() + icon.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="h-10 w-10 rounded-md cursor-pointer border"
                    style={{ backgroundColor: selectedColor }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  />
                  <Input
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="font-mono"
                  />
                </div>
                {showColorPicker && (
                  <div className="mt-2">
                    <HexColorPicker color={selectedColor} onChange={setSelectedColor} />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addCategory}>Add Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No categories yet. Add your first workout category!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getIconComponent(category.icon, category.color)}
                  <span>{category.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteCategory(category.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

