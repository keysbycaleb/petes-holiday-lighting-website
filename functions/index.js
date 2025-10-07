/* eslint-disable padded-blocks */
/* eslint-disable no-trailing-spaces */
/* eslint-disable indent */
/* eslint-disable max-len */
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {setGlobalOptions} = require("firebase-functions/v2");
const logger = require("firebase-functions/logger");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");

// --- Initialize Firebase Admin ---
admin.initializeApp();
const db = admin.firestore();

// --- Nodemailer Configuration ---
const gmailEmail = process.env.GMAIL_EMAIL;
const gmailPassword = process.env.GMAIL_PASSWORD;

// Set the region for all functions
setGlobalOptions({region: "us-central1"});

// Initialize Nodemailer transport
const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

/**
 * Dynamically sends an email notification based on the formId of a new submission.
 */
exports.sendEmailOnSubmission = onDocumentCreated("submissions/{submissionId}", async (event) => {
    const submissionData = event.data.data();
    if (!submissionData || !submissionData.formId) {
        logger.error("Submission is missing data or formId.", {submissionId: event.params.submissionId});
        return;
    }

    const formId = submissionData.formId;

    try {
        const formDoc = await db.collection("forms").doc(formId).get();

        if (!formDoc.exists) {
            logger.error(`No form configuration found for formId: ${formId}`);
            return;
        }

        const formConfig = formDoc.data();
        const recipients = formConfig.recipientEmails;

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            logger.error(`No recipientEmails configured for formId: ${formId}`);
            return;
        }
        
        const dataFields = Object.entries(submissionData)
            .filter(([key]) => !["formId", "timestamp"].includes(key))
            .map(([key, value]) => `<p><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}</p>`)
            .join("");

        // Link to your admin dashboard
        const adminDashboardLink = "https://lightitupwithpete.com/admin.html";

        const mailOptions = {
            from: `"${formConfig.formName || "Website Form"}" <${gmailEmail}>`,
            to: recipients.join(", "),
            subject: `New Submission from ${formConfig.formName || formId}`,
            html: `<h1>New Form Submission</h1>
                   ${dataFields}
                   <hr>
                   <p><a href="${adminDashboardLink}" style="font-size: 16px; font-weight: bold;">Click here to view all submissions in the Admin Dashboard.</a></p>
                   <p><em>This email was sent automatically.</em></p>`,
        };

        await mailTransport.sendMail(mailOptions);
        logger.info(`New submission email sent for formId '${formId}' to: ${recipients.join(", ")}`);

    } catch (error) {
        logger.error("Error processing submission email:", {
            error: error.message,
            formId: formId,
            submissionId: event.params.submissionId,
        });
    }
});
