"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { initializeApp } from "firebase/app"
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { getFirestore, doc, setDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const googleProvider = new GoogleAuthProvider()

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update auth profile with username
      await updateProfile(user, { displayName: username })

      // Create user profile in Firestore
      await setDoc(doc(db, "userProfiles", user.uid), {
        email: email,
        username: username,
        displayName: username,
        createdAt: new Date(),
      })

      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    try {
      await signInWithPopup(auth, googleProvider)
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-lg border border-gray-100">
        <CardHeader className="text-center space-y-2 pt-8 pb-4">
          <h1 className="text-3xl font-bold text-black">
            FitTrack
          </h1>
          <p className="text-gray-500 text-sm">Your fitness journey starts here</p>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 mb-8 border-b border-gray-200">
              <TabsTrigger
                value="login"
                className="pb-2 text-sm font-medium data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="pb-2 text-sm font-medium data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleEmailSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 text-xs font-medium uppercase tracking-wide">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 rounded-none border-t-0 border-r-0 border-l-0 border-b border-gray-300 focus:border-black focus:ring-0 px-0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password" className="text-gray-700 text-xs font-medium uppercase tracking-wide">Password</Label>
                    <Link href="#" className="text-xs text-gray-500 hover:text-black">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 rounded-none border-t-0 border-r-0 border-l-0 border-b border-gray-300 focus:border-black focus:ring-0 px-0"
                    required
                  />
                </div>
                {error && <p className="text-xs text-red-500 border border-red-200 p-2">{error}</p>}
                <Button type="submit" className="w-full h-10 rounded-none bg-black hover:bg-gray-900 text-white">
                  Sign In
                </Button>
                <div className="relative flex items-center justify-center my-4">
                  <div className="absolute border-t border-gray-200 w-full"></div>
                  <span className="relative bg-white px-2 text-xs text-gray-500">OR</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  className="w-full h-10 rounded-none border-gray-300 text-black hover:bg-gray-50"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 50 50"
                  >
                    <path d="M 25.996094 48 C 13.3125 48 2.992188 37.683594 2.992188 25 C 2.992188 12.316406 13.3125 2 25.996094 2 C 31.742188 2 37.242188 4.128906 41.488281 7.996094 L 42.261719 8.703125 L 34.675781 16.289063 L 33.972656 15.6875 C 31.746094 13.78125 28.914063 12.730469 25.996094 12.730469 C 19.230469 12.730469 13.722656 18.234375 13.722656 25 C 13.722656 31.765625 19.230469 37.269531 25.996094 37.269531 C 30.875 37.269531 34.730469 34.777344 36.546875 30.53125 L 24.996094 30.53125 L 24.996094 20.175781 L 47.546875 20.207031 L 47.714844 21 C 48.890625 26.582031 47.949219 34.792969 43.183594 40.667969 C 39.238281 45.53125 33.457031 48 25.996094 48 Z"></path>
                  </svg>
                  Continue with Google
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleEmailSignUp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700 text-xs font-medium uppercase tracking-wide">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="yourusername"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-10 rounded-none border-t-0 border-r-0 border-l-0 border-b border-gray-300 focus:border-black focus:ring-0 px-0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 text-xs font-medium uppercase tracking-wide">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 rounded-none border-t-0 border-r-0 border-l-0 border-b border-gray-300 focus:border-black focus:ring-0 px-0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 text-xs font-medium uppercase tracking-wide">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 rounded-none border-t-0 border-r-0 border-l-0 border-b border-gray-300 focus:border-black focus:ring-0 px-0"
                    required
                  />
                </div>
                {error && <p className="text-xs text-red-500 border border-red-200 p-2">{error}</p>}
                <Button type="submit" className="w-full h-10 rounded-none bg-black hover:bg-gray-900 text-white">
                  Create Account
                </Button>
                <div className="relative flex items-center justify-center my-4">
                  <div className="absolute border-t border-gray-200 w-full"></div>
                  <span className="relative bg-white px-2 text-xs text-gray-500">OR</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  className="w-full h-10 rounded-none border-gray-300 text-black hover:bg-gray-50 flex items-center justify-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 50 50"
                  >
                    <path d="M 25.996094 48 C 13.3125 48 2.992188 37.683594 2.992188 25 C 2.992188 12.316406 13.3125 2 25.996094 2 C 31.742188 2 37.242188 4.128906 41.488281 7.996094 L 42.261719 8.703125 L 34.675781 16.289063 L 33.972656 15.6875 C 31.746094 13.78125 28.914063 12.730469 25.996094 12.730469 C 19.230469 12.730469 13.722656 18.234375 13.722656 25 C 13.722656 31.765625 19.230469 37.269531 25.996094 37.269531 C 30.875 37.269531 34.730469 34.777344 36.546875 30.53125 L 24.996094 30.53125 L 24.996094 20.175781 L 47.546875 20.207031 L 47.714844 21 C 48.890625 26.582031 47.949219 34.792969 43.183594 40.667969 C 39.238281 45.53125 33.457031 48 25.996094 48 Z"></path>
                  </svg>
                  Continue with Google
                </Button>

              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}