import { initializeApp, type FirebaseApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth, signInWithPopup, signOut, type Auth } from 'firebase/auth'

let app: FirebaseApp | null = null
let auth: Auth | null = null

function firebaseReady() {
  return Boolean(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID)
}

function getFirebaseAuth() {
  if (!firebaseReady()) {
    throw new Error('Google sign-in is not configured. Add VITE_FIREBASE_API_KEY to Frontend/.env')
  }
  if (!app) {
    app = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    })
    auth = getAuth(app)
  }
  if (!auth) throw new Error('Google sign-in failed to start')
  return auth
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider())
  return result.user.getIdToken()
}

export async function signOutGoogle() {
  if (!auth && !firebaseReady()) return
  try {
    await signOut(getFirebaseAuth())
  } catch {
    // local logout still proceeds
  }
}
