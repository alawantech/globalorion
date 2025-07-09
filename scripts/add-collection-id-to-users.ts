import { getDocs, collection, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { nanoid } from "nanoid"

async function addCollectionIdToUsers() {
  const usersSnap = await getDocs(collection(db, "users"))
  for (const userDoc of usersSnap.docs) {
    const data = userDoc.data()
    if (!data.collectionId) {
      await updateDoc(doc(db, "users", userDoc.id), {
        collectionId: nanoid(10)
      })
      console.log(`Added collectionId to user ${data.userId}`)
    }
  }
  console.log("Done updating users.")
}

// Run only if script is executed directly (not imported)
if (require.main === module) {
  addCollectionIdToUsers().catch(console.error)
}
