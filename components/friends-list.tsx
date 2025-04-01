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
    <Card className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-xl shadow-2xl border-0 rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 animate-pulse" />
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Friends</h2>
              <p className="text-white/80 text-sm">Your fitness community</p>
            </div>
          </div>
          {recentlyActive.length > 0 && (
            <div className="mt-2">
              <h3 className="text-sm font-medium text-white/90 mb-2">Active Friends</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {recentlyActive.map((friend) => (
                  <TooltipProvider key={friend.profile?.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center transition-transform hover:scale-105">
                          <Avatar className="h-14 w-14 border-2 border-white/50 shadow-lg">
                            <AvatarImage src={friend.profile?.photoURL} />
                            <AvatarFallback className="bg-indigo-700 text-white">
                              {friend.profile?.username?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-white mt-1 max-w-16 truncate">
                            {friend.profile?.displayName?.split(' ')[0]}
                          </span>
                          <Badge variant="secondary" className="mt-1 bg-purple-400/30 text-white border-purple-300/50">
                            {friend.goals?.minutesActive || 0}m
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 text-white border-gray-800">
                        <div className="p-3 space-y-1">
                          <p className="font-semibold">{friend.profile?.displayName}</p>
                          <p className="text-xs flex items-center gap-1">
                            <Dumbbell className="h-3 w-3" /> {friend.goals?.workoutsCompleted || 0} workouts
                          </p>
                          <p className="text-xs flex items-center gap-1">
                            <Flame className="h-3 w-3" /> {friend.goals?.caloriesBurned || 0} cal
                          </p>
                          <p className="text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Last: {formatDate(friend.goals?.lastWorkout)}
                          </p>
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
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by username or name"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-white/80 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            />
            <Button
              onClick={() => debouncedSearch(searchTerm)}
              disabled={searching}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              {searching ? (
                <span className="animate-spin">⌀</span>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-100/50 animate-in fade-in-50">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Search className="h-4 w-4 text-purple-500" />
                Results ({searchResults.length})
              </h3>
              <div className="space-y-3">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50/80 transition-all border border-gray-100/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 ring-2 ring-purple-200/50">
                        <AvatarImage src={user.photoURL} />
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          {user.username?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-800">{user.displayName}</p>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 rounded-lg text-white shadow-md transition-all hover:shadow-lg"
                      onClick={() => sendFriendRequest(user.id)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Tabs defaultValue="friends" className="mt-6">
            <TabsList className="grid grid-cols-3 gap-2 bg-gray-100/80 backdrop-blur-sm p-2 rounded-xl border border-gray-200/50">
              {["friends", "pending", "sent"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-600 transition-all"
                >
                  {tab === "friends" && <Users className="h-4 w-4 mr-2" />}
                  {tab === "pending" && <UserCog className="h-4 w-4 mr-2" />}
                  {tab === "sent" && <Send className="h-4 w-4 mr-2" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} (
                  {tab === "friends" ? friends.length : tab === "pending" ? pendingRequests.length : sentRequests.length})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="friends" className="mt-6">
              {loading ? (
                <div className="text-center py-12 bg-gray-50/80 rounded-xl">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading friends...</p>
                </div>
              ) : !friends.length ? (
                <div className="text-center py-12 bg-gray-50/80 rounded-xl">
                  <Users className="h-16 w-16 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-600">No friends yet. Start connecting!</p>
                  <Button
                    onClick={() => setSearchTerm("")}
                    variant="outline"
                    className="mt-4 border-purple-200 text-purple-600 hover:bg-purple-50 transition-all"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Find Friends
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <div
                      key={friend.connection.id}
                      className="rounded-xl bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-gray-100/50 overflow-hidden animate-in fade-in-25"
                    >
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 ring-2 ring-purple-200/50">
                            <AvatarImage src={friend.profile?.photoURL} />
                            <AvatarFallback className="bg-purple-100 text-purple-600">
                              {friend.profile?.username?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-800 text-lg">{friend.profile?.displayName}</p>
                            <p className="text-sm text-gray-500">@{friend.profile?.username}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
                          onClick={() => removeFriend(friend.connection.id)}
                        >
                          Remove
                        </Button>
                      </div>
                      {friend.goals && (
                        <div className="px-4 pb-4 pt-2 bg-gray-50/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center text-purple-600 mb-1">
                              <Dumbbell className="h-4 w-4 mr-1" />
                              <span className="text-xs font-medium">Workouts</span>
                            </div>
                            <div className="flex items-baseline">
                              <span className="text-xl font-bold text-gray-800">{friend.goals.workoutsCompleted || 0}</span>
                              <span className="text-xs text-gray-500 ml-1">/{friend.goals.workoutsTarget || 50}</span>
                            </div>
                            <Progress
                              value={Math.min(100, ((friend.goals.workoutsCompleted || 0) / (friend.goals.workoutsTarget || 50)) * 100)}
                              className="h-1 w-full mt-1 bg-gray-200 [&>div]:bg-purple-500"
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="flex items-center text-indigo-600 mb-1">
                              <Target className="h-4 w-4 mr-1" />
                              <span className="text-xs font-medium">Streak</span>
                            </div>
                            <div className="flex items-baseline">
                              <span className="text-xl font-bold text-gray-800">{friend.goals.streakDays || 0}</span>
                              <span className="text-xs text-gray-500 ml-1">days</span>
                            </div>
                            <Progress
                              value={Math.min(100, (friend.goals.streakDays || 0) * 3.33)}
                              className="h-1 w-full mt-1 bg-gray-200 [&>div]:bg-indigo-500"
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="flex items-center text-orange-600 mb-1">
                              <Flame className="h-4 w-4 mr-1" />
                              <span className="text-xs font-medium">Calories</span>
                            </div>
                            <div className="flex items-baseline">
                              <span className="text-xl font-bold text-gray-800">{friend.goals.caloriesBurned || 0}</span>
                              <span className="text-xs text-gray-500 ml-1">cal</span>
                            </div>
                            <Progress
                              value={Math.min(100, (friend.goals.caloriesBurned || 0) / 2000 * 100)}
                              className="h-1 w-full mt-1 bg-gray-200 [&>div]:bg-orange-500"
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="flex items-center text-green-600 mb-1">
                              <Clock className="h-4 w-4 mr-1" />
                              <span className="text-xs font-medium">Active</span>
                            </div>
                            <div className="flex items-baseline">
                              <span className="text-xl font-bold text-gray-800">{friend.goals.minutesActive || 0}</span>
                              <span className="text-xs text-gray-500 ml-1">min</span>
                            </div>
                            <Progress
                              value={Math.min(100, (friend.goals.minutesActive || 0) / 150 * 100)}
                              className="h-1 w-full mt-1 bg-gray-200 [&>div]:bg-green-500"
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