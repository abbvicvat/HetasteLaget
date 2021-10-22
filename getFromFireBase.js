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
const GRAPH_LENGTH = 50;
// roomList contains the rooms we have
let roomList = ["Vardagsrummet", "Vaxthuset", "Hallonrummet", "Pingisrummet", "Cafeterian"];
// tempHumList contains what we should show, Temperature and humidity
let tempHumList = ["Temp", "Hum"];
// tempHumLog contains for every room, a list of the temperatures and the humidity values
let tempHumLog = {
};

// Initalize charts and some values needed for them
const labels = [];
for (let i = GRAPH_LENGTH - 1; i >= 0; i--) labels.push(i);
const colors = ["red", "green", "black", "#FFCD01", "blue"];

let tempgGraph = new Chart(document.getElementById("tempGraph"), {
    type: 'line',
    data: {
    labels: labels,
    datasets: [
        
    ]},
    options: {
		tension: 0.5,
		title: {
			display: true,
			text: 'temperatur över tid'
		 },
		 scales:{
			 y:{
				 ticks:{
					 callback: function(value,index,values){
						 return value + " º" + currentUnit[0];
					 }

				 }
			 }
		 }
    }
});

let humGraph = new Chart(document.getElementById("humGraph"), {
    type: 'line',
    data: {
    labels: labels,
    datasets: [
        
    ]},
    options: {
		tension: 0.5,
		title: {
			display: true,
			text: 'luftfuktighet över tid',
		},
		scales:{
			y:{
				ticks: {
					callback: function(value,index,values){
						return value + "%";
					}

				}
			}
		}
    }
});

const roomIndex = {
	"Vardagsrummet": 0,
	"Vaxthuset": 1,
	"Hallonrummet": 2,
	"Pingisrummet": 3,
	"Cafeterian": 4,
}

// Takes the value in celcius and converts it to the correct unit
function convert(value) {
	if (currentUnit == "Farenheit") value = value * 1.8 + 32
	else if (currentUnit == "Kelvin") value += 	273.15;
	return value.toFixed(1);
}

// updateValue takes 3 arguments, the room, whether it should change the temperature or the humidity and the value
function updateValue(room, tempHum, value) {
	// suffix is what should be displayed after the value
	let suffix = "";
    if (tempHum == "Hum") 
		suffix = "%";
	else {
		suffix = " º" + currentUnit[0];
		value = convert(value);
	}

	let tempElement = document.getElementById(tempHum + room);
	tempElement.innerText = value + suffix;
	console.log(room, value + suffix);
}

// updateGraph updates tempGraph or humGraph depending on the value of tempHum and updates the line at position index in that graph to the values in data
// If tempHum is temperature it also converts the values in data to the correct unit since the temperature data is given in celcius
function updateGraph(tempHum, index, data) {
	if (tempHum == "Temp") {
		let convertedData = [];
		for (let i = 0; i < data.length; i++) convertedData[i] = convert(data[i]);
		tempgGraph.data.datasets[index].data = convertedData;
		console.log(tempHum, index, convertedData);
	}
	else humGraph.data.datasets[index].data = data;
}

// In these for-loops, we add event listeners which are called when a value in the firebase database is updated and then calls updateValue for that room and value
// We also add event listeners for the buttons which control whether a graph is shown or not for a specific room
for (let i = 0; i < roomList.length; i++) {
    tempHumLog[roomList[i]] = {};
    for (let j = 0; j < tempHumList.length; j++) {
        tempHumLog[roomList[i]][tempHumList[j]] = [];
        
		let databaseRef = ref(database, roomList[i] + "/" + tempHumList[j] + "/Log");
		onValue(databaseRef, (snapshot) => {
			// This fills tempHumLog with the values logged in our firebase database
			snapshot.forEach((childSnapshot) => {
				let currentRoom = databaseRef._path.pieces_[0];
				// tempHum is either "temp" or "hum"
            	let tempHum = databaseRef._path.pieces_[1];
				// childData is a value from the firebase log
				const childData = childSnapshot.val();
				let valueLog = tempHumLog[currentRoom][tempHum];

				// Add childData to valueLog and remove the oldest value if the number of values in the log is greater than GRAPH_LENGTH				
				valueLog.push(childData);
				if (valueLog.length > GRAPH_LENGTH) valueLog.shift();
			});

			let currentRoom = databaseRef._path.pieces_[0];
            let tempHum = databaseRef._path.pieces_[1];

			// This adds the lines to tempGraph and humGraph with the data that is in tempHumLog 
			if (tempHum == "Temp") {
				let data = tempHumLog[currentRoom]["Temp"]
				let dataset = {
					fill: false,
					label: currentRoom,
					// The color depends on what room the line is displaying
					borderColor: colors[roomIndex[currentRoom]],
					data: data
				};

				// Add the this dataset to the tempGraph and update tempGraph
				tempgGraph.data.datasets.push(dataset);
				tempgGraph.update();
				
				console.log(dataset["label"], dataset["borderColor"], dataset["data"]);
				updateValue(currentRoom, "Temp", data[data.length - 1]);
			}

			else {
				let data = tempHumLog[currentRoom]["Hum"];
				let dataset = {
					fill: false,
					label: currentRoom,
					borderColor: colors[roomIndex[currentRoom]],
					data: data
				};

				humGraph.data.datasets.push(dataset);
				humGraph.update();

				console.log(currentRoom, "Hum");
				updateValue(currentRoom, "Hum", data[data.length - 1]);
			}
		}, {
			onlyOnce: true
		});

        databaseRef = ref(database, roomList[i] + "/" + tempHumList[j] + "/Current");
		// This function is called when a new value is pushed to the database, adds that value to tempHumLog and updates the value displayed by calling updateValue
		// It also updates the graph corresponding to the value which was changed by calling updateGraph
		// If there are to many values in the log we remove the oldest one
        onValue(databaseRef, (snapshot) => {
            let currentRoom = databaseRef._path.pieces_[0];
            let tempHum = databaseRef._path.pieces_[1];

            const data = snapshot.val();
            let valueLog = tempHumLog[currentRoom][tempHum];
			valueLog.push(data);

	
			if (valueLog.length > GRAPH_LENGTH) valueLog.shift();
            console.log(currentRoom, tempHum, data, tempHumLog[currentRoom][tempHum].length);
			updateValue(currentRoom, tempHum, data);
			
			if (tempHum == "Temp") {
				updateGraph("Temp", roomIndex[currentRoom], valueLog);
				tempgGraph.update();
			}
			else {
				updateGraph("Hum", roomIndex[currentRoom], valueLog);
				humGraph.update();
			}
        });
    }
}

// updateTemps updates the temperatures displayed on the website and updates the values in the temperature-graph and displays the new graph
function updateTemps() {
	for (let i = 0; i < roomList.length; ++i) {
		let room = roomList[i];
		let valueLog =  tempHumLog[room]["Temp"];
		let value = valueLog[valueLog.length - 1];
		updateValue(room, "Temp", value)
		updateGraph("Temp", roomIndex[room], valueLog);
	}
	tempgGraph.update();
}

// Add event listeners whcich are called when the buttons to change to different units are pressed
// The functions changes currentUnit to the Celcius, Farenheit or Kelvin depending on what button was pressed and then calls updateTemps
document.getElementById("Celsius").onclick = function(event) {
	if (currentUnit != "Celcius") {
		console.log("Change to Celcius");
		currentUnit = "Celcius";
		updateTemps();
	}
}

document.getElementById("Farenheit").onclick = function(event) {
	if (currentUnit != "Farenheit") {
		console.log("Change to Farenheit");
		currentUnit = "Farenheit";
		updateTemps();
	}
}

document.getElementById("Kelvin").onclick = function(event) {
	if (currentUnit != "Kelvin") {
		console.log("Change to Kelvin");
		currentUnit = "Kelvin";
		updateTemps();
	}
}