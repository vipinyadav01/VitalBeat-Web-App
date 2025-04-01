"use client"

import { useState } from "react"
import { format } from "date-fns"
import type { Activity } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pencil, Trash2 } from "lucide-react"
import { ActivityForm } from "./activity-form"

interface ActivityListProps {
  activities: Activity[]
  onDelete: (id: string) => void
  onUpdate: (activity: Activity) => void
}

export function ActivityList({ activities, onDelete, onUpdate }: ActivityListProps) {
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity)
    setIsDialogOpen(true)
  }

  const handleUpdate = (updatedActivity: Omit<Activity, "id" | "userId">) => {
    if (editingActivity) {
      onUpdate({
        ...updatedActivity,
        id: editingActivity.id,
        userId: editingActivity.userId,
      })
      setIsDialogOpen(false)
      setEditingActivity(null)
    }
  }

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>
          {editingActivity && <ActivityForm activity={editingActivity} onSubmit={handleUpdate} />}
        </DialogContent>
      </Dialog>

      {activities.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No activities recorded yet. Add your first workout!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Duration (min)</TableHead>
                <TableHead>Calories</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.name}</TableCell>
                  <TableCell>{activity.duration}</TableCell>
                  <TableCell>{activity.calories}</TableCell>
                  <TableCell>{format(activity.date, "PPP")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(activity)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(activity.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

