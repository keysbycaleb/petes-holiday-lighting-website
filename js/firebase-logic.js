// --- Initialize Firebase ---
// The firebaseConfig object is loaded from js/config.js
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const submissionsCollection = db.collection('submissions');

// --- PUBLIC-FACING FUNCTIONS ---

/**
 * Saves a new form submission to the 'submissions' collection in Firestore.
 * @param {object} submissionData - The data object from the contact form.
 * @returns {Promise<void>}
 */
async function saveSubmission(submissionData) {
    try {
        const dataWithTimestamp = {
            ...submissionData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        await submissionsCollection.add(dataWithTimestamp);
        console.log("Submission successfully saved to Firestore.");
    } catch (error) {
        console.error("Error saving submission: ", error);
        throw new Error("Could not save submission. Please try again later.");
    }
}


// --- ADMIN DASHBOARD FUNCTIONS ---

/**
 * Signs in an admin user with email and password.
 * @param {string} email - The admin's email.
 * @param {string} password - The admin's password.
 * @returns {Promise<firebase.auth.UserCredential>}
 */
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

/**
 * Signs out the currently logged-in admin user.
 * @returns {Promise<void>}
 */
async function logoutAdmin() {
    try {
        await auth.signOut();
        console.log("Admin logged out successfully.");
    } catch (error) {
        console.error("Error during admin logout: ", error);
        throw new Error("Logout failed. Please try again.");
    }
}

/**
 * Fetches all documents from the 'submissions' collection, ordered by timestamp.
 * @returns {Promise<Array<object>>} An array of submission objects.
 */
async function getSubmissions() {
    try {
        const snapshot = await submissionsCollection.orderBy('timestamp', 'desc').get();
        if (snapshot.empty) {
            console.log("No submissions found.");
            return [];
        }

        const submissions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        return submissions;

    } catch (error) {
        console.error("Error fetching submissions: ", error);
        throw new Error("Failed to load submissions. You may not have permission to view this data.");
    }
}

/**
 * Listens for changes in the authentication state (login/logout).
 * @param {function} callback - A function to call when the auth state changes.
 */
function onAuthChanged(callback) {
    return auth.onAuthStateChanged(callback);
}
