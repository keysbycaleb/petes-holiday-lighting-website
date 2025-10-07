// --- Initialize Firebase ---
// The firebaseConfig object is loaded from js/config.js
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const submissionsCollection = db.collection('submissions');
const archivedSubmissionsCollection = db.collection('archived-submissions');

// --- ADMIN DASHBOARD FUNCTIONS ---

async function loginAdmin(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log("Admin logged in successfully:", userCredential.user.email);
        return userCredential;
    } catch (error) {
        console.error("Error during admin login: ", error);
        throw new Error("Login failed. Please check your credentials.");
    }
}

async function logoutAdmin() {
    try {
        await auth.signOut();
        console.log("Admin logged out successfully.");
    } catch (error) {
        console.error("Error during admin logout: ", error);
        throw new Error("Logout failed. Please try again.");
    }
}

async function getSubmissions(fromArchive = false) {
    const collection = fromArchive ? archivedSubmissionsCollection : submissionsCollection;
    try {
        const snapshot = await collection.orderBy('timestamp', 'desc').get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching submissions: ", error);
        throw new Error("Failed to load submissions.");
    }
}

function onAuthChanged(callback) {
    return auth.onAuthStateChanged(callback);
}

// **NEW** Functions for Archiving and Deleting

async function archiveSubmission(submissionId) {
    const docRef = submissionsCollection.doc(submissionId);
    const doc = await docRef.get();
    if (!doc.exists) throw new Error("Document to archive not found.");
    
    await archivedSubmissionsCollection.doc(submissionId).set(doc.data());
    await docRef.delete();
}

async function restoreSubmission(submissionId) {
    const docRef = archivedSubmissionsCollection.doc(submissionId);
    const doc = await docRef.get();
    if (!doc.exists) throw new Error("Document to restore not found.");
    
    await submissionsCollection.doc(submissionId).set(doc.data());
    await docRef.delete();
}

async function deleteSubmission(submissionId, fromArchive = false) {
    const collection = fromArchive ? archivedSubmissionsCollection : submissionsCollection;
    if (confirm('Are you sure you want to permanently delete this submission? This cannot be undone.')) {
        await collection.doc(submissionId).delete();
    } else {
        throw new Error("Deletion cancelled.");
    }
}
