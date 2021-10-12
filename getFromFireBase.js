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


let roomList = ["Terrariet", "Vaxthuset"];
let tempHumList = ["Temp", "Hum"];

let tempHumLog = {
};

function updateValue(room, tempHum, value) {
	let prefix = "Temperatur: ";
    if (tempHum == "Hum") prefix = "Fuktighet: "
	let tempElement = document.getElementById(tempHum + room);
	tempElement.innerText = prefix + value;
}

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
		console.log(room);
    };
}

document.getElementById("Celsius").onclick = function(event,value) {
	for (let i = 0; i < roomList.length; ++i) {
		let room = roomList[i];
		let list =  tempHumLog[room]["Temp"];
		let value = list[list.length - 1];
		updateValue(room, "Temp", value)
	}
}

document.getElementById("Farenheit").onclick = function(event) {
	for (let i = 0; i < roomList.length; ++i) {
		let room = roomList[i];
		let list =  tempHumLog[room]["Temp"];
		let value = list[list.length - 1] * 1.8 + 32;
		value = Math.round(value * 10) / 10;
		updateValue(room, "Temp", value )
	}
}

document.getElementById("Kelvin").onclick = function(event) {
	for (let i = 0; i < roomList.length; ++i) {
		let room = roomList[i];
		let list =  tempHumLog[room]["Temp"];
		let value = list[list.length - 1] + 273.5;
		updateValue(room, "Temp", value)
	}
}