//the database
let db;

//a new item - contains name and age
let newItem = [
  { name: "", age: 0 }
];

//html items we need access to.
var nameInput = document.getElementById("name");
var ageInput = document.getElementById("age");
var output = document.getElementById("output");
var log = document.getElementById("log");

//runs when window loads
window.onload = function () {
  // In the following line, you should include the prefixes of implementations you want to test.
  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  // DON'T use "var indexedDB = ..." if you're not in a function.
  // Moreover, you may need references to some window.IDB* objects:
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

  // Let us open our database
  //contactList is the database name, version 1
  const DBOpenRequest = window.indexedDB.open("contactList", 3);
  // these two event handlers act on the database being opened successfully, or not
  DBOpenRequest.onerror = function (event) {
    log.innerHTML += '<li>Error loading database.</li>';
  };

  DBOpenRequest.onsuccess = function (event) {
    log.innerHTML += '<li>Database initialised.</li>';

    // store the result of opening the database in the db variable. This is used a lot below
    db = DBOpenRequest.result;

    // Run the displayData() function to populate with data
    displayData();

    //https://github.com/mdn/to-do-notifications/blob/gh-pages/scripts/todo.js line 72 shows how to upgrade
  };


  //The DBOpenRequest has a number indicating the version.  When I've added to my database (i.e. new tables, new columns) I change the version and then this will run.
  DBOpenRequest.onupgradeneeded = function (event) {
    let db = event.target.result;

    db.onerror = function (event) {
      log.innerHTML += "<li>Error loading database.</li>";
    }
    //create an objectStore
    let objectStore = db.createObjectStore("contactList", { keyPath: "name" });
    //define the data it contains
    objectStore.createIndex("age", "age", { unique: false });
    log.innerHTML += "<li>Object store created</li>";
  }
}


function displayData() {
  //clear any output
  output.innerHTML = "";

  // Open our object store and then get a cursor list of all the different data items in the IDB to iterate through
  try{
  let objectStore = db.transaction('contactList').objectStore('contactList');
  db.transaction.onerror = function(event){
    log.innerHTML += "<li>Object store not found.</li>";
  }
  objectStore.openCursor().onsuccess = function (event) {
    let cursor = event.target.result;
    //if anoher cursor, keep going...
    if (cursor) {
      //create a paragraph to hold data
      const contactItem = document.createElement("p");
      //build the data:
      contactItem.innerHTML = cursor.value.name + " is " + cursor.value.age;

      //put the item inside the output
      output.appendChild(contactItem);

      //create a delete button
      const deleteButton = document.createElement("button");
      contactItem.appendChild(deleteButton);
      deleteButton.innerHTML = "x";
      //this sets the attribute so we know what to delete!
      deleteButton.setAttribute("data-task", cursor.value.name);
      deleteButton.onclick = function (event) {
        deleteItem(event);
      }

      //continue
      cursor.continue();
    } else {
      //no more entries
      output.innerHTML += "<p>All entries displayed.</p>";
    }

  }

//error here.
objectStore.openCursor().onerror = function (event) {
  log.innerHTML += "<li>No data available.</li>";
}
}catch(err) {
 log.innerHTML += "<li>"+err.message+"</li>";
}//end catch
}

//add form data
function add(){
  alert(nameInput.value + " " + ageInput.value);
  //check if any empty
  if(nameInput.value = "" || ageInput.value == ""){
    log.innerHTML += "<li>Form had empty items</li>";
  }else{
    //logic to add items
    let newItem = [
      {name: nameInput.value, age: ageInput.value}
    ];

    //open for read/write
    let transaction = db.transaction(["contactList"],"readwrite");

    //if successful
    transaction.oncomplete = function(){
      log.innerHTML += "<li>Data added</li>";
      displayData();
    };

    transaction.onerror = function(){
      log.innerHTML += "<li>Error when adding: " + transaction.error + "</li>";
    };

    //call object store
    let objectStore = transaction.objectStore("contactList");
    console.log(objectStore.indexNames);
      console.log(objectStore.keyPath);
      console.log(objectStore.name);
      console.log(objectStore.transaction);
      console.log(objectStore.autoIncrement);

      let objectStoreRequest = objectStore.add(newItem[0]);
      objectStore.onsuccess = function(event){
        log.innerHTML += "<li>Request successful</li>";
        //clear the form
        nameInput.value = "";
        ageInput.value ="";
      };
  }
}