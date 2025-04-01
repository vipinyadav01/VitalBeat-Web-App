"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { initializeApp } from "firebase/app"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { getFirestore, collection, query, where, onSnapshot, orderBy, updateDoc, doc } from "firebase/firestore"
import type { Notification } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

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

type NotificationsContextType = {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
})

export const useNotifications = () => useContext(NotificationsContext)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Subscribe to notifications
        const q = query(collection(db, "notifications"), where("userId", "==", user.uid), orderBy("createdAt", "desc"))

        const unsubscribeNotifications = onSnapshot(q, (snapshot) => {
          const notificationsList: Notification[] = []

          snapshot.forEach((doc) => {
            const data = doc.data()
            notificationsList.push({
              id: doc.id,
              userId: data.userId,
              title: data.title,
              message: data.message,
              type: data.type,
              read: data.read,
              createdAt: data.createdAt.toDate(),
              actionLink: data.actionLink,
            })
          })

          setNotifications(notificationsList)
          setUnreadCount(notificationsList.filter((n) => !n.read).length)

          // Show toast for new notifications
          const newNotifications = snapshot
            .docChanges()
            .filter((change) => change.type === "added" && !change.doc.data().read)

          if (newNotifications.length > 0 && document.visibilityState === "visible") {
            const latestNotification = newNotifications[0].doc.data()
            toast({
              title: latestNotification.title,
              description: latestNotification.message,
            })
          }
        })

        return () => unsubscribeNotifications()
      }
    })

    return () => unsubscribeAuth()
  }, [toast])

  const markAsRead = async (id: string) => {
    try {
      const notificationRef = doc(db, "notifications", id)
      await updateDoc(notificationRef, { read: true })
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const promises = notifications
        .filter((n) => !n.read)
        .map((n) => {
          const notificationRef = doc(db, "notifications", n.id)
          return updateDoc(notificationRef, { read: true })
        })

      await Promise.all(promises)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationsContext.Provider>
  )
}

