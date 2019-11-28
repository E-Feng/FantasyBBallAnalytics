//Method 1 ???
let schedule_data;
$.getJSON("schedule_analytics.json", function (json) {
  console.log("JSON Data received, name is " + json.name);
  console.log(json)
  schedule_data = json;
});


let data_table = [];
console.log("test", schedule_data);
for (let i=0; i<Object.keys(schedule_data).length; i++){
    console.log(i);
    data_table[week+1] = [];
    for (let j=0; j<Object.keys(schedule_data[i+1]).length; j++){


    }
}

// Method 2
function loadJSON(callback) {

  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', 'schedule_analytics.json', true); // Replace 'my_data' with the path to your file
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

function init() {
  loadJSON(function (response) {
    // Parse JSON string into object
    schedule_data = JSON.parse(response);
    console.log("JSON Loaded");
    console.log(schedule_data);
  });
}

function drawTable() {
    var data = new google.visualization.DataTable();

}