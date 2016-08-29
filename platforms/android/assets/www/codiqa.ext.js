(function () {		// Immediately Invoked Function Expression; to prevent Namespace conflicts
    "use strict";	// JavaScript Strict Mode

    document.addEventListener("deviceready", onDeviceReady.bind(this), false );	// For Cordova to work properly, we need wait for the "deviceready" Event, and invoke the onDeviceReady function
    
    function onDeviceReady() {			// All our code, espcially Cordova-based code, must be in the onDeviceReady function, which confirms the API is available for use
		console.log("Cordova Ready");	// Some Dev feedback that Cordova API is ready
	
		var osVer = device.version,			// Variable to store the device Operating System version
			osVerInt = parseInt(osVer, 10),	// Variable to store the device Operating System as a whole number, only
			osName = device.platform;		// Variable to store the device Platform
			
		if(osName == "Android") {			// If the device Platform is Android,
			if(osVerInt >= 4) {				// If the Android Operating System version is greater than, or equal to, 4, then
				console.log("Is Android, and is greater than version 4");	// Display some Console log output and allow PouchDB to function as normal
			} else {														// Or else, the Android Operating System version is too old, so
				console.log("Is Android, but not compatible version");		// Display some Console log outpuut for the Developer
				$("#btnClasses").hide();									// Hide the button to use the PouchDB feature
			}
		} else if(osName == "iOS") {		// If not Android, is the device Platform iOS?
			if(osVerInt >= 7) {				// If the iOS Operating System version is greater than, or equal to, 7, then
				console.log("Is iOS, and is greater than version 7");	// Display some Console log output and allow PouchDB to function as normal
			} else {													// Or else, the iOS Operating System version is too old, so
				console.log("Is iOS, but not compatible version");		// Display some Console log outpuut for the Developer
				$("#btnClasses").hide();								// Hide the button to use the PouchDB feature
			}
		}
		
		navigator.splashscreen.hide();	// Hide the Splashscreen, or else it will display for 10 seconds (defined in config.xml)
        
        document.addEventListener("pause", onPause.bind(this), false );		// Handle Cordova Pause Event
        document.addEventListener("resume", onResume.bind(this), false );	// Handle Cordova Resume Event
		
		$("#btnName").on("click", function(){getName()});			// Setting up the Event Handler for clicking on the "btnName" button in the HTML file
		function getName() {										// Defining the getName() function to ask for a User's name
			localStorage.userName = prompt("What's your name?");	// The result of the JavaScript prompt() Method is stored in a localStorage object, named userName
			console.log(localStorage.userName);						// Output result to Console for the developer
			if((localStorage.userName === "") || (localStorage.userName === "null") || (localStorage.userName === undefined)) {	// Check that userName is not empty, OR null OR undefined
				alert("Please enter a valid name!");																			// If any of those conditions are True, fire a JavaScript alert() to let the User know of invalid input
			} else {																											// Or else, the input is good, so
				$(".welcomeMsg").html(", " + localStorage.userName.replace(/[^a-zA-Z]/g, "") + "!");							// Find all instances of the "welcomeMsg" class in the HTML file, use the html() method to write their name (but first strip out invalid characters with the replace() method) on-screen, plus concatenation with an exlamation point and comma
			}
		} // END getName()

		function loadName() {										// Defining the loadName() function to show a User's name, if there is one
			if((localStorage.userName === "") || (localStorage.userName === "null") || (localStorage.userName === undefined)) { // Check if the "userName" localStorage object is empty, OR null, OR undifined
				console.log(localStorage.userName);																				// If any of those conditions are True, do nothing except display, in the Console, the contents of "userName"
			} else {																											// Or else, there is a "userName" saved, so,
				$(".welcomeMsg").html(", " + localStorage.userName.replace(/[^a-zA-Z]/g, "") + "!");							// Display the "userName" on-screen, but first strip out invalid characters
			}	
		} // END loadName()
		
		$(".btnURL").on("click", function(){getURL($(this))});						// Event Handler for clicking on any button to load a URL. $(this) element should have a "data-url" Property and Value
		function getURL(theURL) { 													// Define the getURL() function; takes on Parameter (the Object that was clicked)
			cordova.InAppBrowser.open(theURL.data("url"), "_blank", "location=yes");// Cordova API to load the InAppBrowser; based on the "data-url" Property of the $(this) Object, opening in a "_blank" instance, with the Location Bar visibile
		} // END getURL()
		
		loadName();		// Invoke the loadName() function at app's startup so can show the User's name, if they've ever input it 
		
		var db;				// Create a variable for PouchDB

		function initDB() {						// Function to initialize PouchDB
			db = new PouchDB("sdceClasses");	// Instantiate a new PouchDB object, or access an pre-existing one
			return db;							// Return the PouchDB object
		} // END initDB()
		
		initDB();								// Call the function to initialize PouchDB
		
		$("#btnAddClass").on("click", function(){addClasses()});	// Event handler for adding a class via button press
		function addClasses() {										// Defines the addClasses() function
			var classCRN  = $("#crnField").val(),					// Variable for holding the CRN the user input, via jQuery
				classNm   = $("#classField").val(),					// Variable for holding the Class name the user input, via jQuery
				classInst = $("#instField").val();					// Variable for holding the Instructor's name the user input, via jQuery

			var aClass = {											// JSON notation for creating a PouchDB Document
				"_id"   : classCRN,									// "_id" is REQUIRED and must be unique for PouchDB to function
				"title" : classNm,									// The Document is made of any number of Key/Value pairs
				"inst"  : classInst
			};

			db.put(aClass, function callback(error, result){		// PouchDB put() Method. Takes a Document, result is an error or success Callback
				if(!error){											// If no error when saving the Document,
					$("#dbSaved").popup();														// Prepare a Popup
					$("#dbSaved").popup("open", {positionTo: "window", transition: "slideUp"});	// Display a Popup as feedback
					clearFields();									// Clear the Form fields
				} else {											// Or else, there was an error, so
					console.log(error);								// Display some Console output
					switch(error.status) {							// Switch Conditional Statement based on the Error number from PouchDB
						case 409:									// 409 Error means the Document (Class CRN) already exists
							$("#dbErrorConflict").popup();
							$("#dbErrorConflict").popup("open", {positionTo: "window", transition: "slideUp"});
							clearFields();
							break;
						case 412:
							$("#dbErrorID").popup();				// 412 Error means no valid CRN ("_id") was input
							$("#dbErrorID").popup("open", {positionTo: "window", transition: "slideUp"});
							clearFields();
							break;
						default:									// Unkown error
							alert("Unknown Error!\nContact the developer!");
							break;
					}
				}
			});
		} //END addClasses();
		
		function clearFields() {		// Function to clear the Form Input Fields
			document.getElementById("formClass").reset();
		} //END clearFields()
		
		$("#btnShowClasses").on("click", function(){showClasses()});	// Event Handler for showing classes in a Table
		function showClasses() {										// Define showClasses() function
			db.allDocs({"include_docs" : true, "ascending" : true}, function callback(error, result){	// Use PouchDB .allDocs() Method to request all Documents from the Database. With Options to include all Properties of the Object, and sort in Ascending order. Results in Error or Sucess callback
				showTableOfClasses(result.rows);						// Call the showTableOfClasses() function with the resultant data as an Argument
			});
		} //END showClassses()
		
		function showTableOfClasses(result) {					// Define the showTableOfClasses() function with one Parameter, the data from .allDocs()
			var str = "<p><table border='1' id='classTable'>";	// Define a String object. Begin building a <table> in a Paragraph
			str += "<tr><th>CRN</th><th>Class</th><th>Instructor</th><th class='editPencil'>&nbsp;</th></tr>";	// Add to the String: Define the first Row of the Table, with <th>
			for(var i = 0; i < result.length; i++) {			// Begin a Conditional Statement to loop through the .length of the data
				str += "<tr><td>" + result[i].id + 				// Start the Row. Build a cell with the current "_id" data
				"</td><td>" + result[i].doc.title +				// Build a cell with the current "title" data
				"</td><td>" + result[i].doc.inst +				// Build a cell with the current "ints" data
				"</td><td class='editPencil'>&#x270E;" +		// Build a cell with an ASCII image of a pencil, and add the "editPencil" class
				"</td></tr>";									// End the Row.
			}
			str += "</table></p>";								// End the Table and Paragraph
			str += "<hr>";										// Horizontal Rule
			str += "<input type='text' placeholder='1234X' id='deleteCRN'><button id='btnDelete'>Delete Class</button>";	// Build an Input box and Button to delete a Class
			str += "<hr><hr>";
			str += "<div class='divTwoCol'><div class='divLeftCol'><button id='btnUpdate'>Update</button></div><div class='divRightCol'><input type='text' placeholder='1234X' id='updateCRN' disabled><input type='text' placeholder='Class' id='updateClass'><input type='text' placeholder='Instructor' id='updateInst'></div></div>"; // Build input boxes to update a Class
			$("#divResults").html(str);							// Display the Table and Delete/Update Fields on-screen
		} //END showTableOfClasses()
		
		$("body").on("click", "#btnDelete", function(){deleteClass()});	// Event Handler for deleting a class
		function deleteClass() {										// Define deleteClass() function
			var $theClass = $("#deleteCRN").val();						// Store the value of the class CRN the User input
			$theClass = $theClass.toLowerCase();						// Convert the User's input to lowercase
			db.get($theClass, function callback(error, result){			// First, use .get() PouchDB method to see if that Document (Class) exists before deleting it
				db.remove(result, function callback(error, result){		// use .remove() PouchDB method to delete the Class from the Database
					if(result) {										// If there existed a 'Success' result,
						showClasses();									// Update the Table on-screen
						$("#dbDeletedClass").popup();														// Prepare a Popup
						$("#dbDeletedClass").popup("open", {positionTo: "window", transition: "slideUp"});	// Show a Popup as feedback
					} else {											// Or else, there was an 'Error' in deleting
						console.log(error);												// Give the Developer some feedback
						alert("The CRN " + $theClass + " does not exist!\nTry Again.");	// Give the User some feedback
						$("#deleteCRN").val("");										// Blank out the CRN Input Box, since it's an invalid CRN
					}
				}); // END .remove()
			});	 // END .get()
		} //END deleteClass()
		
		$("#divResults").on("click", ".editPencil", function() {updateClassPrep($(this).parent())}); // Event Handler for preparing to Edit a class. Uses one Argument: the Parent of $(this) Object. Notice we must specifiy an existing Element (#divResults), and thenthe dynamic Element (.editPencil)
		function updateClassPrep(thisObj) {					// Define the updateClassPrep() function with one Parameter: the Parent of the Object clicked (in the particular Row)
			var $tmpCRN  = thisObj.find("td:eq(0)").text(),	// Create a Variable for storing the text of the 0th item in the <tr>
				$tmpName = thisObj.find("td:eq(1)").text(), // Create a Variable for storing the text of the 1st item in the <tr>
				$tmpInst = thisObj.find("td:eq(2)").text(); // Create a Variable for storing the text of the 2nd item in the <tr>

			$("#updateCRN").val($tmpCRN);					// Populate the "_id" Input Field on-screen
			$("#updateClass").val($tmpName);				// Populate the "title" Input Field on-screen
			$("#updateInst").val($tmpInst);					// Populate the "inst" Input Field on-screen
		} //END updateClassPrep(thisObj)
		
		$("#divResults").on("click", "#btnUpdate", function(){updateClass()});	// Event Handler for updating a class. Notice we must specifiy an existing Element (#divResults), and thenthe dynamic Element (#btnUpdate)
		function updateClass() {									// Define the updateClass() Function
			var $updateCRN = $("#updateCRN").val(),					// Create a Variable for storing the Value of the "_id" Input Field
				$updateName = $("#updateClass").val(),				// Create a Variable for storing the Value of the "title" Input Field
				$updateInst = $("#updateInst").val();				// Create a Variable for storing the Value of the "inst" Input Field

			db.get($updateCRN, function callback(error, result){	// First, use .get() PouchDB method to see if that Document (Class) exists before updating it
				if(error) {											// If there existed an "Error" result
					$("#updateCRN").val("");						// Blank out the Input Fields
					$("#updateClass").val("");
					$("#updateInst").val("");
					alert("The CRN " + $updateCRN + " does not exist!\nTry Again.");	// Alert the User to the error
				} else {											// Or else, no error, so
					db.put({										// Use .put() PouchDB Method to store the latest values of the Document (Class)
						"_id"   : $updateCRN,
						"title" : $updateName,
						"inst"  : $updateInst,
						"_rev"  : result._rev						// IMPORTANT: Must pass the "_rev" Property to create a new Revision of the Object
					}, function callback(error, result){			// Result is either "Error" or "Success" result
							showClasses();							// Update the Table on-screen to show the latest edits
							$("#dbUpdated").popup();														// Prepare a Popup
							$("#dbUpdated").popup("open", {positionTo: "window", transition: "slideUp"});	// Show a Popup as feedback
						});
				}
			});
		} //END updateClass()
		
		$("#btnNuke").on("click", function(){deleteDB()});			// Event Handler for deleting the PouchDB Database
		function deleteDB() {										// Define deleteDB() Function
			switch(confirm("You are about to delete EVERYTHING.\nConfirm?")){	// Switch Conditional Statement based on the confirm() Method
				case true:														// If user Agrees,
					db.destroy(function callback(error, result){				// .destroy() PouchDB Method to delete the Database
						if(error) {												// If an Error occured
							alert("Error! Contact the developer");				// Alert
							console.log(error);									// Console log
						} else {												// Or else, no Error, so
							initDB();											// Database is deleted, and then reinitialized
							$("#dbDeleted").popup();														// Prepare a Popup
							$("#dbDeleted").popup("open", {positionTo: "window", transition: "slideUp"});	// Show a Popup as feedback
							showClasses();										// Show the empty Table of classes
						}
					});
					break;
				case false:																				// If user Cancels
					$("#dbCancelled").popup();															// Prepare a Popup
					$("#dbCancelled").popup("open", {positionTo: "window", transition: "slideDown"});	// Show a Popup as feedback
					break;
				default:														// Unknown error
					console.log("Third option");
					break;
			}
		} //END deleteDB()
		
		$("#btnContact").on("click", function(){emailUs()});	// Event Handler for emailing the Developer
		function emailUs() {									// Define emailUs() Function
			window.plugins.socialsharing.shareViaEmail(			// Use the .shareViaEmail Method of the socialsharing Plugin, and pass in various Arguments
				"Regarding about your app:<br>", 				// Message (body of the email)
				"mySDCE Feedback", 								// Subject line of the email
				["vcampos@example.edu"], 							// Email address(es), in an array of strings ["john@example.com"]
				null, 											// CC field of the email, in an array of strings ["john@example.com"], or null if unused
				null, 											// BCC field, in an array of strings ["john@example.com"], or null if unused
				"www/images/sdcelogo.png", 						// Any file attachment, local or external; as a string w/ path "www/pic.jpg"
				function(result){console.log("Success: " + result)}, // Optional success callback function
				function(error){console.log("Failure: " + error)} 	// Optional fail callback function
			);
		} //END emailUs()
		
		$("#btnShare").on("click", function(){shareApp()});	// Event Handler for using the User's Social Networks
		function shareApp() {								// Define shareApp() function
			window.plugins.socialsharing.share(				// .share Method of the socialsharing Plugin, using variousArguments
				"Check out the mySDCE app!",				// Body of the Message
				"Download mySDCE app",						// Subject of the Message
				["www/images/vert-bw.png"],					// Attachments, as a String, in an Array
				"https://amzn.com/B01K9EOH5K",				// A URL (any may be set to null)
				function(result){console.log("Success: " + result)}, // Optional success callback function
				function(error){console.log("Failure: " + error)}	// Optional fail callback function
			);
		} //END shareApp()
    } //END onDeviceReady()

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    }

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    }
} )();

/*
	Author:		Victor Campos <vcampos@sdccd.edu>
	Project:	mySDCE
	Version:	1.0.20160808
	Date:		2016-08-08
	Description:The unoffical San Diego Continuing Education app.
*/