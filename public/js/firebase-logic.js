// --- Initialize Firebase ---
// The firebaseConfig object is loaded from js/config.js
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
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
