// This file contains the client-side calls to Google Apps Script functions

// Load batches for dropdowns
function loadBatches(callback) {
    google.script.run.withSuccessHandler(callback)
        .withFailureHandler(function(error) {
            console.error('Error loading batches:', error);
        }).getBatches();
}

// Load all members for table view
function loadAllMembers(callback) {
    google.script.run.withSuccessHandler(callback)
        .withFailureHandler(function(error) {
            console.error('Error loading members:', error);
        }).getAllMembers();
}

// Add other Google Apps Script client-side functions as needed