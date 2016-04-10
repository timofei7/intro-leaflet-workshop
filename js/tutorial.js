// the geoserver workspace:layer
var layername = 'opengeo:normalized';
// chose a column variable you'd like to show
var viewparams = 'column:pct_park_access';
var mapTitle  = 'US Park Access 2010';

// this is the url for a geoserver instance set up
// exactly the way as in the geoserver lab
var geojsonURL = 'http://geo.dali.dartmouth.edu/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames='+layername+'&srsName=EPSG:4326&outputFormat=application/json&viewparams='+viewparams;

// shall we jenks?
var useJenks = false;

// the number of class breaks we want
var numClasses = 7;

//empty for now
var breaks = [];


// 1 setup the base map here
var map = L.map('map',{
    tms: false
}).setView([42.755942, -72.8092041],6);

// load up the background tile layer
var Stamen_Watercolor =
    L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
    }).addTo(map);
// /1

// do an ajax call to pull geoJSON from geoserver and insert it as a
// layer into the map
$.ajax({
    type: "GET",
    cache: true,
    url: geojsonURL,
    dataType: 'json',
    success: function (data) {
        setupColors(data);
        setupLegend(data);
        geojsonLayer = L.geoJson(data, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);
        // zoom to bounding box after loading
        zoomToLayer(geojsonLayer);
    },
    error: function (err) {
        console.log('failure '+ err.Message);
    }
});




// how to do the zoom
var zoomStyle={ 
	pan: {
		animate: true,
		duration: 0.5,
		easeLinearity: 1.00,
		noMoveStart: true
	},
	zoom: {
		animate: true
	}
};

    
// sets the style per feature
function style(feature) {
    return {
        "clickable": true,
        "color": "#00D",
        "fillColor":color(feature.properties.data),
        "weight": 1.0,
        "opacity": 0.8,
        "fillOpacity": 0.8
    };
}

// configure callbacks for layer
// on each mouseover / mouseout / click
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}
// what to do on mouseover
function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 5,
        color: '#85dbf8',
        dashArray: '',
        fillOpacity: 0.7
    });
    info.update(layer.feature.properties);
    layer.bringToFront();
}
// what to do on mouseout
function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
    info.update();
}
// what to do on click
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds(), zoomStyle);
}
// what to do on load zoom
function zoomToLayer(layer) {
    map.fitBounds(geojsonLayer.getBounds(), zoomStyle);
}



// a function to analyze the data and find the min/max
// todo: add jenks option
function setupColors(data) {
    var datas = data.features.map(function(feature){return feature.properties.data;});
    var max = Math.max.apply(Math,datas);
    var min = Math.min.apply(Math,datas); 
    if (useJenks) {
        breaks = ss.jenks(datas, numClasses);
        breaks[0]=0;
        color = d3.scale.threshold()
        .domain(breaks, numClasses)
        .range(colorbrewer.YlOrRd[numClasses+2]);
    } else {
        breaks = d3.range(min, max, max/numClasses);
        color= d3.scale.quantize()
        .domain([min,max])
        .range(colorbrewer.YlOrRd[numClasses]);
    }
    console.log("breaks: " + breaks);
    console.log("colors: " + colorbrewer.YlOrRd[numClasses]);
    console.log("min: " +min + ", max: "+max);
}


// this sets up the legend using the data to get all the intervals
function setupLegend(data) {
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = breaks,
            labels = [];

        //loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length-1; i++) {
            try {
                div.innerHTML += 
                    '<div class=legend-element><i style="background:' +
                    color(grades[i] + 1) + '"></i>' +
                    grades[i].toFixed(0) + (grades[i + 1].toFixed(0) ? '&ndash;' +
                                            grades[i + 1].toFixed(0) + '<br>' : '+')+'</div>';
            } catch (e) {}
        }
        return div;
    };
    legend.addTo(map);
}

//info control box
var info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); 
    this.update();
    return this._div;
};
// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = 
        '<h4>'+mapTitle+'</h4>' + 
        (props ? '<b>' + props.name +
         '</b><br />' + props.data + '%'
         : '');
};
info.addTo(map);

 
