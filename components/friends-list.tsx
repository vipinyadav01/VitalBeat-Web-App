"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
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
  getDocs,
  getDoc,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { 
  Check, 
  Search, 
  UserPlus, 
  X, 
  Users, 
  UserCog, 
  Send, 
  Calendar, 
  Award, 
  Clock, 
  Dumbbell,
  Target,
  Flame,
} from "lucide-react"
import debounce from "lodash/debounce"

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

interface FriendConnection {
  id: string
  userId: string
  friendId: string
  status: string
  createdAt: Date
}

interface UserProfile {
  id: string
  email: string
  username: string
  displayName: string
  photoURL?: string
}

interface UserGoals {
  workoutsCompleted: number
  workoutsTarget: number
  streakDays: number
  joinedDate: Timestamp
  caloriesBurned: number
  minutesActive: number
  lastWorkout?: Timestamp
}

interface FriendWithData {
  connection: FriendConnection
  profile?: UserProfile
  goals?: UserGoals
}

interface FriendsListProps {
  userId: string
}

export function FriendsList({ userId }: FriendsListProps) {
  const [friends, setFriends] = useState<FriendWithData[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendWithData[]>([])
  const [sentRequests, setSentRequests] = useState<FriendWithData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [recentlyActive, setRecentlyActive] = useState<FriendWithData[]>([])
  const { toast } = useToast()

  const fetchUserData = async (userId: string): Promise<{ profile?: UserProfile, goals?: UserGoals }> => {
    try {
      const [profileDoc, goalsDoc] = await Promise.all([
        getDoc(doc(db, "userProfiles", userId)),
        getDoc(doc(db, "userGoals", userId))
      ])

      return {
        profile: profileDoc.exists() ? { id: profileDoc.id, ...profileDoc.data() } as UserProfile : undefined,
        goals: goalsDoc.exists() ? goalsDoc.data() as UserGoals : undefined
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      return {}
    }
  }

  useEffect(() => {
    const fetchFriends = async () => {
      const friendsQuery = query(
        collection(db, "friendConnections"),
        where("status", "==", "accepted"),
        where("userId", "==", userId)
      )

      const reverseFriendsQuery = query(
        collection(db, "friendConnections"),
        where("status", "==", "accepted"),
        where("friendId", "==", userId)
      )

      const unsubscribeFriends = onSnapshot(friendsQuery, async (snapshot) => {
        const friendsList: FriendWithData[] = []

        // Fetch forward connections
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data()
          const connection: FriendConnection = {
            id: docSnap.id,
            userId: data.userId,
            friendId: data.friendId,
            status: data.status,
            createdAt: data.createdAt.toDate(),
          }
          const userData = await fetchUserData(data.friendId)
          friendsList.push({ connection, ...userData })
        }

        // Fetch reverse connections
        const reverseSnapshot = await getDocs(reverseFriendsQuery)
        for (const docSnap of reverseSnapshot.docs) {
          const data = docSnap.data()
          const connection: FriendConnection = {
            id: docSnap.id,
            userId: data.userId,
            friendId: data.friendId,
            status: data.status,
            createdAt: data.createdAt.toDate(),
          }
          const userData = await fetchUserData(data.userId)
          if (!friendsList.some(f => f.connection.friendId === data.userId)) {
            friendsList.push({ connection, ...userData })
          }
        }

        setFriends(friendsList)

        // Recently active based on last workout
        const activeList = friendsList
          .filter(friend => friend.goals?.lastWorkout)
          .sort((a, b) => 
            (b.goals?.lastWorkout?.toMillis() || 0) - (a.goals?.lastWorkout?.toMillis() || 0)
          )
          .slice(0, 5)
        setRecentlyActive(activeList)
        setLoading(false)
      })

      const pendingQuery = query(
        collection(db, "friendConnections"),
        where("status", "==", "pending"),
        where("friendId", "==", userId)
      )

      const unsubscribePending = onSnapshot(pendingQuery, async (snapshot) => {
        const pendingList: FriendWithData[] = []
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data()
          const connection: FriendConnection = {
            id: docSnap.id,
            userId: data.userId,
            friendId: data.friendId,
            status: data.status,
            createdAt: data.createdAt.toDate(),
          }
          const userData = await fetchUserData(data.userId)
          pendingList.push({ connection, ...userData })
        }
        setPendingRequests(pendingList)
      })

      const sentQuery = query(
        collection(db, "friendConnections"),
        where("status", "==", "pending"),
        where("userId", "==", userId)
      )

      const unsubscribeSent = onSnapshot(sentQuery, async (snapshot) => {
        const sentList: FriendWithData[] = []
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data()
          const connection: FriendConnection = {
            id: docSnap.id,
            userId: data.userId,
            friendId: data.friendId,
            status: data.status,
            createdAt: data.createdAt.toDate(),
          }
          const userData = await fetchUserData(data.friendId)
          sentList.push({ connection, ...userData })
        }
        setSentRequests(sentList)
      })

      return () => {
        unsubscribeFriends()
        unsubscribePending()
        unsubscribeSent()
      }
    }

    fetchFriends()
  }, [userId])

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (!term.trim()) return

      setSearching(true)
      setSearchResults([])

      try {
        const usernameQuery = query(
          collection(db, "userProfiles"),
          where("username", ">=", term.toLowerCase()),
          where("username", "<=", term.toLowerCase() + "\uf8ff"),
          limit(10)
        )

        const displayNameQuery = query(
          collection(db, "userProfiles"),
          where("displayName", ">=", term),
          where("displayName", "<=", term + "\uf8ff"),
          limit(10)
        )

        const [usernameSnapshot, displayNameSnapshot] = await Promise.all([
          getDocs(usernameQuery),
          getDocs(displayNameQuery)
        ])

        const results = new Map<string, UserProfile>()
        usernameSnapshot.forEach(docSnap => {
          if (docSnap.id !== userId) {
            results.set(docSnap.id, { id: docSnap.id, ...docSnap.data() } as UserProfile)
          }
        })
        displayNameSnapshot.forEach(docSnap => {
          if (docSnap.id !== userId && !results.has(docSnap.id)) {
            results.set(docSnap.id, { id: docSnap.id, ...docSnap.data() } as UserProfile)
          }
        })

        setSearchResults(Array.from(results.values()))
      } catch (error) {
        console.error("Error searching users:", error)
        toast({ title: "Error", description: "Failed to search users", variant: "destructive" })
      } finally {
        setSearching(false)
      }
    }, 300),
    [userId]
  )

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    debouncedSearch(term)
  }

  const sendFriendRequest = async (friendId: string) => {
    try {
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(query(collection(db, "friendConnections"), where("userId", "==", userId), where("friendId", "==", friendId))),
        getDocs(query(collection(db, "friendConnections"), where("userId", "==", friendId), where("friendId", "==", userId)))
      ])

      if (!snapshot1.empty || !snapshot2.empty) {
        toast({ title: "Connection exists", description: "You already have a connection with this user." })
        return
      }

      await addDoc(collection(db, "friendConnections"), {
        userId,
        friendId,
        status: "pending",
        createdAt: new Date(),
      })

      await addDoc(collection(db, "notifications"), {
        userId: friendId,
        title: "New Friend Request",
        message: "You have received a new friend request.",
        type: "friend",
        read: false,
        createdAt: new Date(),
        actionLink: "/friends",
      })

      toast({ title: "Request sent", description: "Friend request has been sent successfully." })
      setSearchTerm("")
      setSearchResults([])
    } catch (error) {
      console.error("Error sending friend request:", error)
      toast({ title: "Error", description: "Failed to send friend request", variant: "destructive" })
    }
  }

  const acceptFriendRequest = async (connectionId: string) => {
    try {
      const connectionRef = doc(db, "friendConnections", connectionId)
      const connectionDoc = await getDoc(connectionRef)
      if (connectionDoc.exists()) {
        const data = connectionDoc.data()
        await updateDoc(connectionRef, { status: "accepted" })
        await addDoc(collection(db, "notifications"), {
          userId: data.userId,
          title: "Friend Request Accepted",
          message: "Your friend request has been accepted.",
          type: "friend",
          read: false,
          createdAt: new Date(),
          actionLink: "/friends",
        })
        toast({ title: "Request accepted", description: "You are now friends!" })
      }
    } catch (error) {
      console.error("Error accepting friend request:", error)
      toast({ title: "Error", description: "Failed to accept friend request", variant: "destructive" })
    }
  }

  const rejectFriendRequest = async (connectionId: string) => {
    try {
      await deleteDoc(doc(db, "friendConnections", connectionId))
      toast({ title: "Request rejected", description: "Friend request has been rejected." })
    } catch (error) {
      console.error("Error rejecting friend request:", error)
      toast({ title: "Error", description: "Failed to reject friend request", variant: "destructive" })
    }
  }

  const removeFriend = async (connectionId: string) => {
    try {
      await deleteDoc(doc(db, "friendConnections", connectionId))
      toast({ title: "Friend removed", description: "Friend has been removed from your list." })
    } catch (error) {
      console.error("Error removing friend:", error)
      toast({ title: "Error", description: "Failed to remove friend", variant: "destructive" })
    }
  }

  const daysSince = (date: Date | Timestamp | undefined) => {
    if (!date) return 0
    const dateObj = date instanceof Timestamp ? date.toDate() : date
    const diffTime = Math.abs(new Date().getTime() - dateObj.getTime())
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return 'N/A'
    return timestamp.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <Card className="w-full mx-auto bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_12px_48px_rgba(0,0,0,0.18)] sm:mx-4 lg:mx-auto">
      <CardHeader className="bg-black text-white p-6 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Users className="h-7 w-7 opacity-80 transition-opacity group-hover:opacity-100" />
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Friends</h2>
              <p className="text-white/70 text-sm font-light">Your fitness community</p>
            </div>
          </div>
          {recentlyActive.length > 0 && (
            <div className="mt-2">
              <h3 className="text-sm font-medium text-white/80 mb-4">Recently Active</h3>
              <div className="grid grid-flow-col auto-cols-max gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
                {recentlyActive.map((friend) => (
                  <TooltipProvider key={friend.profile?.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center group cursor-pointer">
                          <div className="relative">
                            <Avatar className="h-16 w-16 border-2 border-white/20 transition-all duration-300 group-hover:border-white/40 group-hover:scale-105">
                              <AvatarImage src={friend.profile?.photoURL} className="object-cover" />
                              <AvatarFallback className="bg-white/10 text-white backdrop-blur-sm">
                                {friend.profile?.username?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <Badge 
                              variant="secondary" 
                              className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs px-2"
                            >
                              {friend.goals?.minutesActive || 0}m
                            </Badge>
                          </div>
                          <span className="text-sm text-white/80 mt-4 font-medium max-w-20 truncate text-center">
                            {friend.profile?.displayName?.split(' ')[0]}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black/90 backdrop-blur-lg border border-white/10">
                        <div className="p-4 space-y-2">
                          <p className="font-medium text-white">{friend.profile?.displayName}</p>
                          <div className="space-y-1.5 text-white/70">
                            <p className="text-xs flex items-center gap-2">
                              <Dumbbell className="h-3.5 w-3.5" /> {friend.goals?.workoutsCompleted || 0} workouts
                            </p>
                            <p className="text-xs flex items-center gap-2">
                              <Flame className="h-3.5 w-3.5" /> {friend.goals?.caloriesBurned || 0} calories
                            </p>
                            <p className="text-xs flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5" /> Last active: {formatDate(friend.goals?.lastWorkout)}
                            </p>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-300" />
              <Input
                placeholder="Search by username or name"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-14 pr-20 h-14 text-lg rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-gray-100 
                  focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 
                  placeholder:text-gray-400 shadow-lg shadow-purple-500/5
                  transition-all duration-300 ease-in-out
                  hover:bg-white hover:shadow-purple-500/10
                  dark:bg-gray-900/90 dark:border-gray-800 dark:placeholder:text-gray-500"
              />
              <Button
                onClick={() => debouncedSearch(searchTerm)}
                disabled={searching}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 px-4
                  bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700
                  text-white font-medium rounded-xl shadow-lg shadow-purple-500/20
                  transform transition-all duration-300 ease-out
                  hover:scale-105 hover:shadow-purple-500/30
                  active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
              >
                {searching ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 
              transform transition-all duration-300 hover:shadow-3xl hover:scale-[1.01]
              animate-in fade-in-50 slide-in-from-top-5">
              <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-xl">
                  <Search className="h-5 w-5 text-purple-600" />
                </div>
                Results ({searchResults.length})
              </h3>
              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-xl 
                      bg-gradient-to-br from-white to-purple-50/50
                      hover:from-purple-50/50 hover:to-white
                      transition-all duration-300 border border-purple-100/30
                      hover:border-purple-200 hover:shadow-lg group"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 ring-4 ring-purple-100 group-hover:ring-purple-200 
                        transition-all duration-300 transform group-hover:scale-105">
                        <AvatarImage src={user.photoURL} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold">
                          {user.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-semibold text-lg text-gray-900 group-hover:text-purple-700 transition-colors">
                          {user.displayName}
                        </p>
                        <p className="text-sm text-gray-500 group-hover:text-purple-500 transition-colors">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="lg"
                      className="bg-purple-600 hover:bg-purple-700 rounded-xl text-white 
                        shadow-lg shadow-purple-200 hover:shadow-purple-300
                        transition-all duration-300 transform hover:scale-105
                        px-6 py-2 font-medium"
                      onClick={() => sendFriendRequest(user.id)}
                    >
                      <UserPlus className="h-5 w-5 mr-2" />
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Tabs defaultValue="friends" className="mt-6">
            <TabsList className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black/5 backdrop-blur-lg p-3 rounded-2xl border border-black/10 hover:bg-black/10 transition-all duration-300">
              {["friends", "pending", "sent"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                    text-black/60 hover:text-black
                    data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_32px_rgba(0,0,0,0.12)]
                    data-[state=active]:text-black data-[state=active]:scale-105
                    transition-all duration-300 ease-out"
                >
                  {tab === "friends" && <Users className="h-4 w-4" />}
                  {tab === "pending" && <UserCog className="h-4 w-4" />}
                  {tab === "sent" && <Send className="h-4 w-4" />}
                  <span className="font-medium">
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </span>
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-black/5 text-sm">
                    {tab === "friends" ? friends.length : tab === "pending" ? pendingRequests.length : sentRequests.length}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="friends" className="mt-6">
              {loading ? (
                <div className="text-center py-12 bg-black/5 rounded-xl">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mx-auto mb-4"></div>
                  <p className="text-black/60">Loading friends...</p>
                </div>
              ) : !friends.length ? (
                <div className="text-center py-12 bg-black/5 rounded-xl hover:bg-black/10 transition-all">
                  <Users className="h-16 w-16 mx-auto text-black/30 mb-3 animate-pulse" />
                  <p className="text-black/60">No friends yet. Start connecting!</p>
                  <Button
                    onClick={() => setSearchTerm("")}
                    variant="outline"
                    className="mt-4 border-black hover:bg-black hover:text-white transition-all duration-300"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Find Friends
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {friends.map((friend) => (
                    <div
                      key={friend.connection.id}
                      className="rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-black/10 overflow-hidden group"
                    >
                      <div className="flex items-center justify-between p-6 hover:bg-black/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 ring-2 ring-black/10 group-hover:ring-black/30 transition-all">
                            <AvatarImage src={friend.profile?.photoURL} />
                            <AvatarFallback className="bg-black text-white">
                              {friend.profile?.username?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-xl text-black">{friend.profile?.displayName}</p>
                            <p className="text-sm text-black/60">@{friend.profile?.username}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full border-black/20 hover:bg-black hover:text-white transition-all duration-300"
                          onClick={() => removeFriend(friend.connection.id)}
                        >
                          Remove
                        </Button>
                      </div>
                      {friend.goals && (
                        <div className="p-6 bg-black/5 grid grid-cols-2 gap-6">
                          <div className="space-y-3 group/stat hover:bg-white rounded-lg p-3 transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-black gap-2">
                                <Dumbbell className="h-5 w-5" />
                                <span className="font-medium">Workouts</span>
                              </div>
                              <span className="text-2xl font-bold">{friend.goals.workoutsCompleted || 0}</span>
                            </div>
                            <Progress
                              value={Math.min(100, ((friend.goals.workoutsCompleted || 0) / (friend.goals.workoutsTarget || 50)) * 100)}
                              className="h-2 bg-black/10 [&>div]:bg-black"
                            />
                          </div>
                          <div className="space-y-3 group/stat hover:bg-white rounded-lg p-3 transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-black gap-2">
                                <Target className="h-5 w-5" />
                                <span className="font-medium">Streak</span>
                              </div>
                              <span className="text-2xl font-bold">{friend.goals.streakDays || 0}</span>
                            </div>
                            <Progress
                              value={Math.min(100, (friend.goals.streakDays || 0) * 3.33)}
                              className="h-2 bg-black/10 [&>div]:bg-black"
                            />
                          </div>
                          <div className="space-y-3 group/stat hover:bg-white rounded-lg p-3 transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-black gap-2">
                                <Flame className="h-5 w-5" />
                                <span className="font-medium">Calories</span>
                              </div>
                              <span className="text-2xl font-bold">{friend.goals.caloriesBurned || 0}</span>
                            </div>
                            <Progress
                              value={Math.min(100, (friend.goals.caloriesBurned || 0) / 2000 * 100)}
                              className="h-2 bg-black/10 [&>div]:bg-black"
                            />
                          </div>
                          <div className="space-y-3 group/stat hover:bg-white rounded-lg p-3 transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-black gap-2">
                                <Clock className="h-5 w-5" />
                                <span className="font-medium">Active</span>
                              </div>
                              <span className="text-2xl font-bold">{friend.goals.minutesActive || 0}</span>
                            </div>
                            <Progress
                              value={Math.min(100, (friend.goals.minutesActive || 0) / 150 * 100)}
                              className="h-2 bg-black/10 [&>div]:bg-black"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              {!pendingRequests.length ? (
                <div className="text-center py-12 bg-gray-50/80 rounded-xl">
                  <UserCog className="h-16 w-16 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-600">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.connection.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-gray-100/50"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-11 w-11 ring-2 ring-purple-200/50">
                          <AvatarImage src={request.profile?.photoURL} />
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {request.profile?.username?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-800">{request.profile?.displayName}</p>
                          <p className="text-sm text-gray-500">@{request.profile?.username}</p>
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {daysSince(request.connection.createdAt)} days ago
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          className="h-9 w-9 bg-green-500 hover:bg-green-600 rounded-full shadow-md transition-all hover:shadow-lg"
                          onClick={() => acceptFriendRequest(request.connection.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          className="h-9 w-9 bg-red-500 hover:bg-red-600 rounded-full shadow-md transition-all hover:shadow-lg"
                          onClick={() => rejectFriendRequest(request.connection.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sent" className="mt-6">
              {!sentRequests.length ? (
                <div className="text-center py-12 bg-gray-50/80 rounded-xl">
                  <Send className="h-16 w-16 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-600">No sent requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <div
                      key={request.connection.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-gray-100/50"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-11 w-11 ring-2 ring-purple-200/50">
                          <AvatarImage src={request.profile?.photoURL} />
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {request.profile?.username?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-800">{request.profile?.displayName}</p>
                          <p className="text-sm text-gray-500">@{request.profile?.username}</p>
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {daysSince(request.connection.createdAt)} days ago
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
                        onClick={() => rejectFriendRequest(request.connection.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}