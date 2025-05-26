const functions = require('firebase-functions');
const mailchimp = require('@mailchimp/mailchimp_marketing');
const admin = require('firebase-admin');
try {
  admin.initializeApp();
  console.log('Firebase Admin SDK initialized.');
} catch (e) {
  console.error('Firebase Admin SDK initialization error:', e);
  // If it's already initialized, that's okay.
  if (e.code !== 'app/duplicate-app') {
    throw e;
  }
}

// --- Mailchimp Configuration ---
// IMPORTANT: Set these values in your Firebase environment
// Run the following commands in your terminal, replacing placeholders:
// firebase functions:config:set mailchimp.api_key="YOUR_MAILCHIMP_API_KEY"
// firebase functions:config:set mailchimp.server_prefix="YOUR_MAILCHIMP_SERVER_PREFIX"
// firebase functions:config:set mailchimp.audience_id="YOUR_MAILCHIMP_AUDIENCE_ID"

const mailchimpConfig = functions.config().mailchimp;

if (mailchimpConfig && mailchimpConfig.api_key && mailchimpConfig.server_prefix) {
  mailchimp.setConfig({
    apiKey: mailchimpConfig.api_key,
    server: mailchimpConfig.server_prefix,
  });
  console.log('Mailchimp SDK configured.');
} else {
  console.error(
    'Mailchimp API Key or Server Prefix is not set in Firebase Functions config.' +
    ' Please set them using `firebase functions:config:set mailchimp.api_key=YOUR_KEY mailchimp.server_prefix=YOUR_PREFIX`' +
    ' and ensure mailchimp.audience_id is also set for subscribeToNewsletter function.'
  );
}

const verifyAdmin = async (context) => {
  if (!context.auth) {
    console.log('Admin verification failed: No authentication context.');
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required. You must be logged in to call this function.');
  }
  
  const uid = context.auth.uid;
  try {
    // Option 1: Check for custom claims (preferred if you set them)
    // const userRecord = await admin.auth().getUser(uid);
    // if (userRecord.customClaims && userRecord.customClaims.admin === true) {
    //   console.log(`Admin verification successful for UID: ${uid} (custom claim)`);
    //   return true;
    // }

    // Option 2: Check Firestore for an admin role (as per issue description)
    // Make sure your Firestore collection is 'users' and field is 'role'
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (userDoc.exists && userDoc.data().role === 'admin') {
      console.log(`Admin verification successful for UID: ${uid} (Firestore role)`);
      return true;
    }
    
    console.log(`Admin verification failed for UID: ${uid}. User is not an admin.`);
    throw new functions.https.HttpsError('permission-denied', 'Admin access required. You do not have permission to perform this action.');

  } catch (error) {
    console.error(`Error during admin verification for UID: ${uid}:`, error);
    if (error instanceof functions.https.HttpsError) {
      throw error; // Re-throw HttpsError directly
    }
    throw new functions.https.HttpsError('internal', 'Error verifying admin status.');
  }
};

exports.subscribeToNewsletter = functions.https.onCall(async (data, context) => {
  const { email, firstName = '' } = data;

  // Validate email
  if (!email || !email.includes('@')) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid email required');
  }

  // Ensure Mailchimp config is loaded
  if (!mailchimpConfig || !mailchimpConfig.api_key || !mailchimpConfig.server_prefix || !mailchimpConfig.audience_id) {
    console.error('Mailchimp configuration is incomplete. Make sure API key, server prefix, and audience ID are set.');
    throw new functions.https.HttpsError('internal', 'Mailchimp configuration error. Please contact support.');
  }
  
  // Ensure Mailchimp SDK is configured (it should be if the above check passed)
  if (!mailchimp.lists) {
     console.error('Mailchimp SDK not properly configured. lists object is undefined.');
     throw new functions.https.HttpsError('internal', 'Mailchimp SDK error.');
  }

  try {
    const response = await mailchimp.lists.addListMember(
      mailchimpConfig.audience_id,
      {
        email_address: email,
        status: 'pending', // Use 'pending' for double opt-in
        merge_fields: {
          FNAME: firstName || '' // Ensure FNAME is always present, even if empty
        }
      }
    );

    console.log('Mailchimp addListMember response:', response);
    return { 
      success: true, 
      message: 'Subscription successful! Please check your email to confirm your subscription.' 
    };

  } catch (error) {
    console.error('Mailchimp API Error:', error);
    // Check if the error is a Mailchimp API error object
    if (error.response && error.response.body) {
        // Mailchimp often returns errors with a status and title
        // For "Member Exists" error, Mailchimp API returns a 400 status
        // and the title field in the body will be "Member Exists"
        if (error.response.body.title === 'Member Exists') {
            return { 
                success: false, 
                message: 'This email is already subscribed.' 
            };
        }
        // For other Mailchimp specific errors
        const errorDetail = error.response.body.detail || 'Subscription failed due to an API error.';
        throw new functions.https.HttpsError('internal', errorDetail);
    }
    // For generic errors (network issues, etc.)
    throw new functions.https.HttpsError('internal', 'Subscription failed. Please try again.');
  }
});

exports.getMailchimpStats = functions.https.onCall(async (data, context) => {
  // Verify admin authentication first
  await verifyAdmin(context); // This will throw an error if not admin

  // Ensure Mailchimp config is loaded
  if (!mailchimpConfig || !mailchimpConfig.api_key || !mailchimpConfig.server_prefix || !mailchimpConfig.audience_id) {
    console.error('Mailchimp configuration is incomplete for getMailchimpStats.');
    throw new functions.https.HttpsError('internal', 'Mailchimp configuration error.');
  }
  
  // Ensure Mailchimp SDK is configured
  if (!mailchimp.lists) {
     console.error('Mailchimp SDK not properly configured for getMailchimpStats.');
     throw new functions.https.HttpsError('internal', 'Mailchimp SDK error.');
  }

  try {
    // Note: The issue description asks for 'getMailchimpStats' to return 
    // member_count and recent_signups. The mailchimp.lists.getList method
    // provides stats like member_count, avg_sub_rate, etc.
    // "Recent signups" isn't a direct field from this endpoint.
    // We will return what's available.
    const response = await mailchimp.lists.getList(
      mailchimpConfig.audience_id
    );

    console.log('Mailchimp getList response:', response);
    return {
      success: true,
      member_count: response.stats.member_count,
      total_contacts: response.stats.total_contacts, // Mailchimp API v3 uses this
      unsubscribe_count: response.stats.unsubscribe_count,
      cleaned_count: response.stats.cleaned_count,
      campaign_count: response.campaign_count,
      avg_sub_rate: response.stats.avg_sub_rate, // Example of other available stats
      avg_unsub_rate: response.stats.avg_unsub_rate, // Example of other available stats
      // 'recent_signups' is not directly available from this Mailchimp endpoint.
      // To get recent signups, one would typically query list members sorted by signup date.
      message: "Stats fetched successfully."
    };
  } catch (error) {
    console.error('Failed to get Mailchimp stats:', error);
    if (error.response && error.response.body) {
        const errorDetail = error.response.body.detail || 'Failed to retrieve statistics due to an API error.';
        throw new functions.https.HttpsError('internal', errorDetail);
    }
    throw new functions.https.HttpsError('internal', 'Failed to retrieve statistics.');
  }
});
