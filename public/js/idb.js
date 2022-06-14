// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'budget_tracker' 
//and set it to version 1
const request = indexedDB.open('budget_tracker', 1);
// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called ``, 
    //set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('new_budget', { autoIncrement: true });
  };
  // upon a successful 
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above)
    // or simply established a connection, save reference to db in global variable
    db = event.target.result;
  
    // check if app is online
    if (navigator.onLine) {
    uploadBudget();
    }
  };
  
  request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
  };

function saveRecord(record) {
    const transaction = db.transaction(["new_budget"], "readwrite");
    const budgetObjectStore = transaction.objectStore("new_budget");

budgetObjectStore.add(record);
}

// open trans on database
function uploadBudget() {
    const transaction = db.transaction(["new_budget"], "readwrite");

    const budgetObjectStore = transaction.objectStore("new_budget");
    //get all records
    const getAll = budgetObjectStore.getAll();

    
    getAll.onsuccess = function() {
        send data from indexedDB to API 
        if (getAll.result.length > 0) {
            fetch("api/transactyion/bulk", {
                method: "POST" ,
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
            })
            .then(response => response.json())
            .then(serverResponse => {
              if (serverResponse.message) {
                throw new Error(serverResponse);
              }
    
              const transaction = db.transaction(['new_budget'], 'readwrite');
              const budgetObjectStore = transaction.objectStore('new_budget');
              // clear all items in your store
              budgetObjectStore.clear();
            })
            .catch(err => {
              // set reference to redirect back here
              console.log(err);
            });
        }
      };
    }

    // listen for app coming back online
window.addEventListener("online", uploadBudget);