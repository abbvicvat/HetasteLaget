// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-analytics.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8EDmKJXu6tvOErFAZfI-DeFscR5DpkXs",
  authDomain: "temperatur-1827b.firebaseapp.com",
  databaseURL: "https://temperatur-1827b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "temperatur-1827b",
  storageBucket: "temperatur-1827b.appspot.com",
  messagingSenderId: "1088110277596",
  appId: "1:1088110277596:web:1e033ce17f62d63b0c5519",
  measurementId: "G-1W4CYWKFHP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase();


let roomList = ["Terrariet", "Vaxthuset"];
let tempHumList = ["Temp", "Hum"];

let tempHumLog = {
};

function defineFireBaseDestinations(){
  for (let i = 0; i < roomList.length; i++) {
      tempHumLog[roomList[i]] = {};
      for (let j = 0; j < tempHumList.length; j++) {
          tempHumLog[roomList[i]][tempHumList[j]] = [];
          
          const value = ref(database, roomList[i] + "/" + tempHumList[j] + "/Current");

          onValue(value, (snapshot) => {
              let currentRoom = value._path.pieces_[0];
              let tempHum = value._path.pieces_[1];
              const data = snapshot.val();
              tempHumLog[currentRoom][tempHum].push(data);
              console.log(currentRoom, tempHum, data, tempHumLog[currentRoom][tempHum].length);
              let element = document.getElementById(tempHum + currentRoom);
              element.innerText = tempHum
          });
      }
  }    
}


defineFireBaseDestinations()
