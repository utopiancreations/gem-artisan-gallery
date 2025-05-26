// functions/src/index.js

// This main index.js file will re-export all functions defined in other files.
// This helps in organizing functions into different modules.

// Import and re-export functions from mailchimp.js
const mailchimpFunctions = require('./mailchimp');
exports.subscribeToNewsletter = mailchimpFunctions.subscribeToNewsletter;
exports.getMailchimpStats = mailchimpFunctions.getMailchimpStats;

// If you have other function files, you can add them here in a similar way.
// For example:
// const otherFunctions = require('./other');
// exports.anotherFunction = otherFunctions.anotherFunction;
