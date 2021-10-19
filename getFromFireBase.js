// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
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
const database = getDatabase();

// roomList contains the rooms we have
let roomList = ["Terrariet", "Vaxthuset"];
// tempHumList contains what we should show, Temperature and humidity
let tempHumList = ["Temp", "Hum"];
// tempHumLog contains for every room, a list of the temperatures and the humidity values
let tempHumLog = {
};

// updateValue takes 3 arguments, the room, whether it should change the temperature or the humidity and the value
function updateValue(room, tempHum, value) {
	let prefix = "Temperatur: ";
    if (tempHum == "Hum") prefix = "Fuktighet: "
	let tempElement = document.getElementById(tempHum + room);
	tempElement.innerText = prefix + value;
	console.log(room, prefix, value);
}

// In these for-loops, we add event listeners which are called when a value in the firebase database is updated and then calls updateValue for that room and value
// We also add event listeners for the buttons which control whether a graph is shown or not for a specific room
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
			updateValue(currentRoom, tempHum, data);
        });
    }

    let button = document.getElementById("But" + roomList[i]);
    button.onclick = function(event) {
		let room = event.target.id;
		room = room.slice(3, room.length);
		console.log("Button Press", room);
    };
}

// Add event listeners whcich are called when the buttons for different units are pressed
// The functions convert the temperature values to the right unit and then displays them
document.getElementById("Celsius").onclick = function(event,value) {
	console.log("Change to Celcius");
	for (let i = 0; i < roomList.length; ++i) {
		let room = roomList[i];
		let list =  tempHumLog[room]["Temp"];
		let value = list[list.length - 1];
		updateValue(room, "Temp", value)
	}
}

document.getElementById("Farenheit").onclick = function(event) {
	console.log("Change to Farenheit");
	for (let i = 0; i < roomList.length; ++i) {
		let room = roomList[i];
		let list =  tempHumLog[room]["Temp"];
		let value = (list[list.length - 1] * 1.8 + 32).toFixed(1);
		updateValue(room, "Temp", value )
	}
}

document.getElementById("Kelvin").onclick = function(event) {
	console.log("Change to Kelvin");
	for (let i = 0; i < roomList.length; ++i) {
		let room = roomList[i];
		let list =  tempHumLog[room]["Temp"];
		let value = list[list.length - 1] + 273.2;
		updateValue(room, "Temp", value)
	}
}