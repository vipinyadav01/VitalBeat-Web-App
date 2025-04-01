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
import { Trash2, Plus, Search } from "lucide-react"
import { HexColorPicker } from "react-colorful"
import { cn } from "@/lib/utils"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  const [filteredCategories, setFilteredCategories] = useState<WorkoutCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("dumbbell")
  const [selectedColor, setSelectedColor] = useState("#3b82f6")
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
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
      setFilteredCategories(categoriesList)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCategories(categories)
    } else {
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredCategories(filtered)
    }
  }, [searchQuery, categories])

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
      <div 
        className="flex items-center justify-center h-10 w-10 rounded-full transition-transform hover:scale-105" 
        style={{ backgroundColor: color }}
      >
        <span className="text-white text-sm font-medium">{iconName.charAt(0).toUpperCase()}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <Card className="w-full h-full shadow-md">
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
    <Card className="w-full h-full shadow-md border-0">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 pb-2">
        <div>
          <CardTitle className="text-2xl font-bold">Workout Categories</CardTitle>
          <CardDescription className="text-muted-foreground">Organize your fitness activities</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search categories..."
              className="pl-8 w-full md:w-[200px] focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1">
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Add Category</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
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
                          className="focus-visible:ring-1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category-icon">Icon</Label>
                        <Select value={selectedIcon} onValueChange={setSelectedIcon}>
                          <SelectTrigger id="category-icon" className="focus-visible:ring-1">
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
                            className="h-10 w-10 rounded-md cursor-pointer border transition-colors hover:opacity-90"
                            style={{ backgroundColor: selectedColor }}
                            onClick={() => setShowColorPicker(!showColorPicker)}
                          />
                          <Input
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className="font-mono focus-visible:ring-1"
                          />
                        </div>
                        {showColorPicker && (
                          <div className="mt-2 p-2 border rounded-md">
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Create a new workout category</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No categories found</h3>
            {searchQuery ? (
              <p className="text-muted-foreground mt-1">Try a different search term or clear the search.</p>
            ) : (
              <p className="text-muted-foreground mt-1 max-w-md">
                No categories yet. Add your first workout category by clicking the button above!
              </p>
            )}
            {searchQuery && (
              <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <div 
                key={category.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getIconComponent(category.icon, category.color)}
                  <span className="font-medium truncate" title={category.name}>
                    {category.name}
                  </span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete category</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}