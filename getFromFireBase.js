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

let currentUnit = "Celcius";
const GRAPH_LENGTH = 10;
// roomList contains the rooms we have
let roomList = ["Terrariet", "Vaxthuset"];
// tempHumList contains what we should show, Temperature and humidity
let tempHumList = ["Temp", "Hum"];
// tempHumLog contains for every room, a list of the temperatures and the humidity values
let tempHumLog = {
};

// Takes the value in celcius and converts it to the correct unit
function convert(value) {
	if (currentUnit == "Farenheit") value = value * 1.8 + 32
	else if (currentUnit == "Kelvin") value += 	273.15;
	return value.toFixed(1);
}

// updateValue takes 3 arguments, the room, whether it should change the temperature or the humidity and the value
function updateValue(room, tempHum, value) {
	let prefix = "Temperatur: ";
    if (tempHum == "Hum") prefix = "Fuktighet: "
	else value = convert(value);
	
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
        
		// This fills tempHumLog with the values already in our firebase database
		let databaseRef = ref(database, roomList[i] + "/" + tempHumList[j] + "/Log");
		onValue(databaseRef, (snapshot) => {
			snapshot.forEach((childSnapshot) => {
				let currentRoom = databaseRef._path.pieces_[0];
            	let tempHum = databaseRef._path.pieces_[1];
				const childData = childSnapshot.val();
				let valueLog = tempHumLog[currentRoom][tempHum];
				valueLog.push(childData);
				if (valueLog.length > GRAPH_LENGTH) valueLog.shift();
				console.log("From Log:", currentRoom, tempHum, childData);
			});
		}, {
			onlyOnce: true
		});
		
        databaseRef = ref(database, roomList[i] + "/" + tempHumList[j] + "/Current");
        onValue(databaseRef, (snapshot) => {
            let currentRoom = databaseRef._path.pieces_[0];
            let tempHum = databaseRef._path.pieces_[1];
            const data = snapshot.val();
            let valueLog = tempHumLog[currentRoom][tempHum];
			valueLog.push(data);
			if (valueLog.length > GRAPH_LENGTH) valueLog.shift();
            console.log(currentRoom, tempHum, data, tempHumLog[currentRoom][tempHum].length);
			updateValue(currentRoom, tempHum, data);
        });
    }
}

// Add event listeners whcich are called when the buttons for different units are pressed
// The functions changes currentUnit to the right unit and then displays the values
document.getElementById("Celsius").onclick = function(event) {
	if (currentUnit != "Celcius") {
		console.log("Change to Celcius");
		currentUnit = "Celcius";
		for (let i = 0; i < roomList.length; ++i) {
			let room = roomList[i];
			let list =  tempHumLog[room]["Temp"];
			let value = list[list.length - 1];
			updateValue(room, "Temp", value)
		}
	}
}

document.getElementById("Farenheit").onclick = function(event) {
	if (currentUnit != "Farenheit") {
		console.log("Change to Farenheit");
		currentUnit = "Farenheit";
		for (let i = 0; i < roomList.length; ++i) {
			let room = roomList[i];
			let list =  tempHumLog[room]["Temp"];
			let value = list[list.length - 1];
			updateValue(room, "Temp", value)
		}
	}
}

document.getElementById("Kelvin").onclick = function(event) {
	if (currentUnit != "Kelvin") {
		console.log("Change to Kelvin");
		currentUnit = "Kelvin";
		for (let i = 0; i < roomList.length; ++i) {
			let room = roomList[i];
			let list =  tempHumLog[room]["Temp"];
			let value = list[list.length - 1];
			updateValue(room, "Temp", value)
		}
	}
}

const labels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const colors = ["#000000", "#FFFFFF"];

let chartsTemp = new Chart(ctx, {
	type: "line",
	dat
});