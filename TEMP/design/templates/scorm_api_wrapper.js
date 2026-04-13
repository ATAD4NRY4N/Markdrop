/*******************************************************************************
**
** Filename: scorm_api_wrapper.js
** Version: 1.0
**
** Description: This file provides a robust SCORM 1.2 API Wrapper. It handles
**              finding the API, initializing, terminating, setting/getting
**              values, and basic error handling. It automatically initializes
**              on load and terminates on unload.
**
** Author: Based on common SCORM wrapper patterns (e.g., Pipwerks)
**
*******************************************************************************/

(function(window) {

    "use strict";

    var scorm = {}; // Public API
    scorm.version = "1.2";
    scorm.connectionActive = false;
    scorm.completionStatus = null; // Can be 'completed', 'incomplete', 'not attempted', 'unknown'
    scorm.debug = true; // Set to false to turn off console logging

    var API = null; // Reference to the SCORM API object
    var findAPITries = 0;
    var maxTries = 500; // How many times to try finding the API

    // --- Private Functions --- //

    function log(msg) {
        if (scorm.debug && window.console && window.console.log) {
            console.log("SCORM Wrapper: " + msg);
        }
    }

    function findAPI(win) {
        log("Searching for API in window: " + win.location.href);
        while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
            findAPITries++;
            if (findAPITries > maxTries) {
                log("Error: Max tries reached (" + maxTries + ") finding API.");
                return null;
            }
            win = win.parent;
            log("Checking parent window: " + win.location.href);
        }
        // Check if the API object found has the expected LMSInitialize function
        if (win.API && typeof win.API.LMSInitialize === 'function') {
             return win.API;
        } else {
             if (win.parent === win) { // Reached top-level window
                 log("Reached top window, API not found or invalid.");
             }
             return null; // API object not found or doesn't look like a SCORM API
        }
    }

    function getAPI() {
        if (API) return API; // Return cached API if already found

        log("Attempting to find SCORM API...");
        findAPITries = 0; // Reset tries for each attempt
        var theAPI = findAPI(window);

        if ((theAPI == null) && (window.opener != null) && (typeof(window.opener) != "undefined")) {
            log("API not found in current window chain, checking opener...");
            findAPITries = 0; // Reset tries
            theAPI = findAPI(window.opener);
        }

        if (theAPI == null) {
            // Changed from ERROR to INFO for graceful fallback
            log("SCORM API not found. Content will run in non-SCORM mode.");
        } else {
            API = theAPI;
            log("SCORM 1.2 API Found.");
        }
        return theAPI;
    }

    function init() {
        if (scorm.connectionActive) {
            log("Initialization skipped: Connection already active.");
            return true;
        }
        // Try to find API if not already found
        // getAPI() will log if it's not found
        if (!getAPI()) {
             log("Initialization skipped: SCORM API not available.");
            return false; // No API found
        }

        log("Initializing connection (LMSInitialize)..." );
        var result = API.LMSInitialize(""); // SCORM 1.2 uses an empty string

        if (String(result) === "true") {
            scorm.connectionActive = true;
            log("Initialization successful. SCORM mode active.");

            // Get initial completion status
            scorm.completionStatus = scorm.get("cmi.core.lesson_status");
            log("Initial lesson_status from LMS: " + scorm.completionStatus);

            // Per SCORM 1.2 spec, if the status is 'not attempted', the SCO should set it to 'incomplete'
            if (scorm.completionStatus === "not attempted") {
                log("Setting lesson_status to 'incomplete' as initial status was 'not attempted'.");
                if (!scorm.set("cmi.core.lesson_status", "incomplete")) {
                     log("Warning: Failed to set initial status to 'incomplete'.");
                } else {
                    scorm.completionStatus = "incomplete"; // Update local cache
                    // It's generally recommended to commit this initial change
                    if (!scorm.save()) {
                         log("Warning: Failed to commit initial 'incomplete' status.");
                    }
                }
            }
            return true;
        } else {
            log("Initialization failed. Error: " + getLastErrorDetail());
            return false;
        }
    }

    function terminate() {
        if (!scorm.connectionActive) {
            log("Termination skipped: Connection not active.");
            return true;
        }
        log("Terminating connection (LMSFinish)..." );
        // Ensure data is saved before finishing - LMSFinish behavior can vary otherwise
        scorm.save();

        var result = API.LMSFinish(""); // SCORM 1.2 uses an empty string

        if (String(result) === "true") {
            scorm.connectionActive = false;
            log("Termination successful.");
            // API = null; // Don't nullify API here, might prevent re-init if needed? Or maybe it's safer to nullify? Let's keep it for now.
            return true;
        } else {
            log("Termination failed. Error: " + getLastErrorDetail());
            return false;
        }
    }

    function getLastError() {
         if (!API) return "-1"; // Return a non-zero code if API is not available
         return API.LMSGetLastError();
    }

    function getLastErrorDetail() {
        if (!API) return "SCORM API not available.";
        var code = getLastError();
        var message = "No Error";
        var diagnostic = "No Error";
        // Only call error functions if an error code was returned
        if (code !== "0") {
             message = API.LMSGetErrorString(code) || "Unknown Error";
             diagnostic = API.LMSGetDiagnostic(code) || "No Diagnostic Available";
        }
        return "Code: " + code + "\nMessage: " + message + "\nDiagnostic: " + diagnostic;
    }

    // --- Public API --- //

    scorm.init = init;
    scorm.terminate = terminate;

    scorm.get = function(param) {
        if (!scorm.connectionActive) {
            log("GET failed: Connection not active. Parameter: " + param);
            return null;
        }
        log("Getting value for: " + param);
        var value = API.LMSGetValue(param);
        var errCode = getLastError(); // Check error *after* the call

        // Handle non-standard null return with error code 0 (seen in Thought Industries/Rustici)
        // Treat it like an uninitialized value (similar to SCORM 1.2's "" with error 403)
        if (value === null && errCode === "0") {
            log("Value received for " + param + ": null (with error code 0). Treating as uninitialized.");
            // Return empty string to mimic standard behavior for uninitialized data model elements
            // This allows downstream logic (like checking status === 'not attempted') to potentially work
            // Or, we can handle null directly in the init function.
            // Let's return null for now and handle it in init.
            return null;
        }

        // Per SCORM 1.2, LMSGetValue returns an empty string "" and sets error code 403 (Data Model Element Value Not Initialized)
        // if the element hasn't been set yet. This is NOT a fatal error for many elements.
        // Other errors (like 401 Not Initialized, 402 Invalid Argument, 404 Data Model Element Does Not Exist, 405 Invalid Set Value) are more serious.
        if (errCode !== "0" && errCode !== "403") {
             log("GET failed for " + param + ". Error: " + getLastErrorDetail());
             return null; // Return null for actual errors
        }
        // Log the value even if error is 403 (value will be "")
        log("Value received for " + param + ": '" + value + "' (Error code: " + errCode + ")");
        return value;
    };

    scorm.set = function(param, value) {
        if (!scorm.connectionActive) {
            log("SET failed: Connection not active. Parameter: " + param);
            return false;
        }
        log("Setting value for: " + param + " to: " + value);
        var result = API.LMSSetValue(param, value);
        var errCode = getLastError(); // Check error *after* the call

        // Corrected logic: Fail only if result is NOT "true" OR if errCode is NOT "0"
        if (String(result) !== "true" || errCode !== "0") {
            log("SET failed for " + param + ". Result: " + result + ", Error: " + getLastErrorDetail());
            return false;
        }
        // If we reach here, it was successful
        log("SET successful for " + param + ".");
        if (param === "cmi.core.lesson_status") {
            scorm.completionStatus = value;
        }
        return true;
    };

    scorm.save = function() {
        if (!scorm.connectionActive) {
            log("SAVE failed: Connection not active.");
            return false;
        }
        log("Committing data (LMSCommit)..." );
        var result = API.LMSCommit("");
        var errCode = getLastError(); // Check error *after* the call

        // Corrected logic: Fail only if result is NOT "true" OR if errCode is NOT "0"
        if (String(result) !== "true" || errCode !== "0") {
            log("SAVE (Commit) failed. Result: " + result + ", Error: " + getLastErrorDetail());
            return false;
        }
        // If we reach here, it was successful
        log("SAVE (Commit) successful.");
        return true;
    };

    // --- Auto-init and Terminate --- //

    // Attempt to initialize as soon as the script loads and the API might be ready.
    // This relies on the LMS making the API available promptly.
    // If initialization fails here, content should ideally have a button or mechanism
    // to retry initialization later.
    scorm.init();

    // Ensure termination on page unload
    window.addEventListener("beforeunload", function(event) {
        // Standard way to ensure unload happens, though not guaranteed
        log("beforeunload event triggered. Terminating SCORM connection.");
        scorm.terminate();
        // Some browsers require a return value here, though it's often ignored
        // delete event['returnValue']; // Try to prevent confirmation dialog
    });

     // Fallback for older browsers or different unload scenarios
    window.addEventListener("unload", function() {
        log("unload event triggered. Ensuring SCORM connection is terminated.");
        scorm.terminate(); // Call again just in case beforeunload didn't fire or finish
    });

    // Expose the SCORM object to the global window scope
    window.SCORM = scorm;

}(window));

