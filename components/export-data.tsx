"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Activity } from "@/lib/types"
import { Download, FileSpreadsheet, FileText, Database } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

interface ExportDataProps {
  activities: Activity[]
}

export function ExportData({ activities }: ExportDataProps) {
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  const exportToCSV = () => {
    setExporting(true)

    try {
      // Create CSV content
      const headers = ["Name", "Duration (min)", "Calories", "Date", "Category"]
      const rows = activities.map((activity) => [
        activity.name,
        activity.duration.toString(),
        activity.calories.toString(),
        format(activity.date, "yyyy-MM-dd"),
        activity.category || "",
      ])

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `vitalbeat-activities-${format(new Date(), "yyyy-MM-dd")}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export successful",
        description: "Your fitness data has been exported as CSV.",
      })
    } catch (error) {
      console.error("Error exporting to CSV:", error)
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const exportToPDF = () => {
    setExporting(true)

    try {
      // In a real app, you would use a library like jsPDF to generate a PDF
      // For this example, we'll just show a toast

      toast({
        title: "PDF export",
        description: "PDF export would be implemented with a library like jsPDF.",
      })
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Export Your Data
        </CardTitle>
        <CardDescription className="text-white/80">Download your fitness data in different formats</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-gray-600 mb-6">
          Export your workout history to keep a backup or analyze your data in other applications.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Card className="border border-gray-200 hover:border-purple-200 transition-colors shadow-sm hover:shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <FileSpreadsheet className="h-5 w-5 text-purple-600" />
                CSV Export
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-gray-600">
                Export your data as a CSV file that can be opened in Excel or Google Sheets.
              </p>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                variant="outline"
                className="w-full border-purple-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-colors"
                onClick={exportToCSV}
                disabled={exporting || activities.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border border-gray-200 hover:border-purple-200 transition-colors shadow-sm hover:shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <FileText className="h-5 w-5 text-purple-600" />
                PDF Export
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-gray-600">
                Export your data as a PDF document with formatted tables and charts.
              </p>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                variant="outline"
                className="w-full border-purple-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-colors"
                onClick={exportToPDF}
                disabled={exporting || activities.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export to PDF
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {activities.length === 0 && (
          <div className="text-center py-6 mt-6 bg-gray-50 rounded-lg">
            <Database className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No activity data available to export</p>
            <p className="text-gray-400 text-sm">Add some activities to enable export functionality</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}