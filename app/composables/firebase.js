import { initializeApp } from "firebase/app"
import { getMessaging, getToken } from "firebase/messaging"

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  messagingSenderId: "...",
  appId: "..."
}

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

export const getFCMToken = async () => {
  return await getToken(messaging, {
    vapidKey: "YOUR_PUBLIC_KEY"
  })
}
