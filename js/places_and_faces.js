
// setup the base map here
var map = L.map('map',{
    tms: false
}).setView([42.755942, -72.8092041],3);

// load up the background tile layer
var Stamen_Watercolor =
    L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
    }).addTo(map);


// all the facemarkers will go into one layer
var facemarkers = L.layerGroup();

//copy the following 2 lines, rename the variable,then look up the lat/long of where you are from and change that as well.
var timIcon = new PersonIcon({iconUrl:'/images/froggy.jpg'});
facemarkers.addLayer(L.marker([9.6660971,-85.0621176], {icon: timIcon}).addTo(map).bindPopup("Tim was here. <br>Some day he'll move there!"));

//or if you have a gravatar set up you could look it up by email
var timGravatar = new PersonIcon({iconUrl:getGravatar('tim@zingweb.com')});
facemarkers.addLayer(L.marker([43.7022222, -72.29], {icon: timGravatar}).addTo(map).bindPopup("Dear Old Dartmouth"));


//Add yourself to the map here!
