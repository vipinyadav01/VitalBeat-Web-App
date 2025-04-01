"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Camera } from "lucide-react"
import type { UserProfile } from "@/lib/types"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

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

// Cloudinary upload preset (create this in your Cloudinary dashboard)
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'profile_uploads';
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';

interface UserProfileFormProps {
  userId: string
  onProfileUpdate?: () => void
}

export function UserProfileForm({ userId, onProfileUpdate }: UserProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile>({
    id: userId,
    displayName: "",
    photoURL: "",
    bio: "",
    height: undefined,
    weight: undefined,
    age: undefined,
    gender: undefined,
  })
  const [loading, setLoading] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("personal")
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileDoc = await getDoc(doc(db, "userProfiles", userId))
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as UserProfile)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }

    fetchProfile()
  }, [userId])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPhotoFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotoPreview(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`)
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percentComplete)
        }
      }
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          resolve(response.secure_url)
        } else {
          reject(new Error('Upload failed'))
        }
      }
      
      xhr.onerror = () => {
        reject(new Error('Upload failed'))
      }
      
      xhr.send(formData)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let photoURL = profile.photoURL

      // Upload photo to Cloudinary if changed
      if (photoFile) {
        photoURL = await uploadToCloudinary(photoFile)
      }

      // Update profile
      const updatedProfile = {
        ...profile,
        photoURL,
      }

      await setDoc(doc(db, "userProfiles", userId), updatedProfile)

      setProfile(updatedProfile)
      setPhotoFile(null)
      setUploadProgress(0)

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      if (onProfileUpdate) {
        onProfileUpdate()
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b pb-8">
        <div className="flex flex-col items-center sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Your Profile</CardTitle>
            <CardDescription className="mt-1">Customize how others see you</CardDescription>
          </div>
          <div className="mt-4 sm:mt-0 relative group">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md transition-transform group-hover:scale-105">
              <AvatarImage src={photoPreview || profile.photoURL} alt={profile.displayName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
                {profile.displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => document.getElementById("photo-upload")?.click()}
            >
              <Camera className="text-white h-8 w-8" />
            </div>
            <Input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="physical">Physical Details</TabsTrigger>
            </TabsList>
          </div>
          
          <CardContent className="pt-6">
            <TabsContent value="personal" className="space-y-4 mt-0">
              <div>
                <Label htmlFor="displayName" className="text-sm font-medium">Display Name</Label>
                <Input
                  id="displayName"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  className="mt-1"
                  placeholder="How you want to be known"
                />
              </div>
              
              <div>
                <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  className="mt-1 resize-none"
                  placeholder="Tell us a bit about yourself..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {profile.bio?.length || 0}/250 characters
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="physical" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="height" className="text-sm font-medium">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height || ""}
                    onChange={(e) => setProfile({ ...profile, height: Number.parseInt(e.target.value) || undefined })}
                    className="mt-1"
                    placeholder="Your height in cm"
                  />
                </div>
                <div>
                  <Label htmlFor="weight" className="text-sm font-medium">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profile.weight || ""}
                    onChange={(e) => setProfile({ ...profile, weight: Number.parseInt(e.target.value) || undefined })}
                    className="mt-1"
                    placeholder="Your weight in kg"
                  />
                </div>
                <div>
                  <Label htmlFor="age" className="text-sm font-medium">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age || ""}
                    onChange={(e) => setProfile({ ...profile, age: Number.parseInt(e.target.value) || undefined })}
                    className="mt-1"
                    placeholder="Your age"
                  />
                </div>
                <div>
                  <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                  <Select 
                    value={profile.gender || ""} 
                    onValueChange={(value) => setProfile({ ...profile, gender: value })}
                  >
                    <SelectTrigger id="gender" className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
        
        <Separator />
        
        <CardFooter className="flex justify-between py-4">
          <Button variant="outline" type="button" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[120px]">
            {loading ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}