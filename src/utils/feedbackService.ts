/**
 * Minimal anonymous feedback storage.
 *
 * Uses Firebase Firestore, loaded lazily (only when someone actually opens
 * the Feedback page) so it never affects the bundle size or behavior of the
 * rest of the app. Configuration comes entirely from Vite env vars — see
 * .env.example. If those vars are not set, submitFeedback() throws a clear
 * error that the Feedback page displays instead of crashing.
 *
 * No name, email, or account is collected or required — consistent with
 * the rest of AUREVA's no-login, anonymous-by-default design.
 */

export interface FeedbackPayload {
  message: string
  moduleContext?: string // e.g. 'breast-cancer', 'pcos', 'menopause', or 'general'
  language: 'en' | 'ta' | 'hi'
}

function isFirebaseConfigured() {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID &&
      import.meta.env.VITE_FIREBASE_APP_ID
  )
}

export function feedbackBackendConfigured() {
  return isFirebaseConfigured()
}

let firestoreDbPromise: Promise<import('firebase/firestore').Firestore> | null = null

async function getDb() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Feedback backend is not configured. Add VITE_FIREBASE_* values to your .env file — see .env.example.'
    )
  }
  if (!firestoreDbPromise) {
    firestoreDbPromise = (async () => {
      const { initializeApp } = await import('firebase/app')
      const { getFirestore } = await import('firebase/firestore')
      const app = initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      })
      return getFirestore(app)
    })()
  }
  return firestoreDbPromise
}

/**
 * Writes one anonymous feedback document to the `feedback` collection.
 * Throws on failure — the caller (Feedback page) is responsible for
 * showing a friendly error state.
 */
export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  const db = await getDb()
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
  await addDoc(collection(db, 'feedback'), {
    message: payload.message.slice(0, 2000),
    moduleContext: payload.moduleContext ?? 'general',
    language: payload.language,
    createdAt: serverTimestamp()
  })
}
