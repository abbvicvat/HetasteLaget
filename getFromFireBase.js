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
					 callback: function(value){//a function that adds a degree character after the number on the y axis 
						 return value + "º" + currentUnit[0];//then it uses the variable currentunit and takes the first character from that string
					 }

				 }
			 }
		 }
    }
});

let humGraph = new Chart(document.getElementById("humGraph"), {
    type: 'line',//defines the graph type to line
    data: {
    labels: labels,//defines the labels to the constant labels which is all the numbers 1-49
    datasets: [
        
    ]},
    options: {
		tension: 0.5,//sets the tension to 0.5 which makes the graph lines curvy
		title: {
			display: false,//displays a title but display is set to false so this does nothing
			text: 'luftfuktighet över tid',
		},
		scales:{
			y:{
				ticks: {
					callback: function(value){//this function sets a percentage charachter after the 
						return value + "%";//number on the y axis
					}

				}
			}
		}
    }
});

const roomIndex = {//Contains indexes of the different rooms to know what color to put on the different lines
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
		suffix = "º" + currentUnit[0];
		value = convert(value);
	}

	let tempElement = document.getElementById(tempHum + room);
	tempElement.innerText = value + suffix;
	console.log(room, value + suffix);
}

// updateGraph updates tempGraph or humGraph depending on the value of tempHum and updates the line corresponding to the room in that graph to the values in data
// If tempHum is temperature it also converts the values in data to the correct unit since the temperature data is given in celcius
function updateGraph(tempHum, index, data) {
	if (tempHum == "Temp") {
		// Convert to correct unit
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
			// This fills tempHumLog with the values logged in our firebase database so we can display old values
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
				// Build a chart js dataset
				let dataset = {
					fill: false, // if fill is true, the area under the line becomes gray
					label: currentRoom, // What label the dataset should have
					// The color depends on what room the line is displaying
					borderColor: colors[roomIndex[currentRoom]],
					data: data // the actual data for our dataset
				};

				// Add the this dataset to the tempGraph and update tempGraph
				tempgGraph.data.datasets.push(dataset);
				tempgGraph.update();
				
				console.log(dataset["label"], dataset["borderColor"], dataset["data"]);
				updateValue(currentRoom, "Temp", data[data.length - 1]);
			}

			// Same thing but for the humidity graph
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
			onlyOnce: true // This function should only be called once and not every time a value changes
		});

        databaseRef = ref(database, roomList[i] + "/" + tempHumList[j] + "/Current");
		// This function is called when a new value is pushed to the database, adds that value to tempHumLog and updates the value displayed by calling updateValue
		// It also updates the graph corresponding to the value which was changed by calling updateGraph
		// If there are to many values in the log we remove the oldest one
        onValue(databaseRef, (snapshot) => {
            let currentRoom = databaseRef._path.pieces_[0]; // databaseRef._path.pieces is a list that contains the room and whether temp if a temperature value was changed, otherwise it contains the room and hum
            let tempHum = databaseRef._path.pieces_[1]; // We need the room and whether we changed temperature or humidity to know what values we should change

            const data = snapshot.val(); // The data that was added
            let valueLog = tempHumLog[currentRoom][tempHum]; // tempHumLog[currentRoom][tempHum] contains our log of values for that specific room and tempHum
			valueLog.push(data); // Add our new data to our valueLog

	
			if (valueLog.length > GRAPH_LENGTH) valueLog.shift(); // Remove a value from valueLog if it is too large
            console.log(currentRoom, tempHum, data, tempHumLog[currentRoom][tempHum].length);
			updateValue(currentRoom, tempHum, data); // update the value displayed on the website

			// update the values displayed on the graph
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
	// if currentUnit already is Celcius there is no need to change
	if (currentUnit != "Celcius") {
		console.log("Change to Celcius");
		currentUnit = "Celcius"; // set currenUnit to celcius
		updateTemps(); // update the temperatures displayed
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