var geoJsonObj;

//Start of Sensitivity Section Logic
var sensitivitySettings = {
    s1: {
        angle: 2.81,
        length: 5000,
    },
    s2: {
        angle: 2.83,
        length: 2000,
    },
    s3: {
        angle: 2.85,
        length: 1000,
    },
    s4: {
        angle: 2.89,
        length: 500,
    },
    s5: {
        angle: 2.93,
        length: 150,
    },
    s6: {
        angle: 3.14,
        length: 0,
    },
}
var sensitivitySetTo = sensitivitySettings.s3;

document.querySelector('#map_settings').addEventListener('click', function(e) {
        var ulChildren = e.currentTarget.children;
        for (var i = 0; i < ulChildren.length; i++) {
            ulChildren[i].classList.remove('selected_setting');
        }
        e.target.classList.add('selected_setting');
        sensitivitySetTo = sensitivitySettings[e.target.id];
        console.log(sensitivitySetTo)
    })
    //End of Sensitivity Section Logic

function initMap() {
    var mapOrigin = {
        lat: 52.3174833,
        lng: -0.17008959999998297
    }
    map = new google.maps.Map(document.getElementById('map_canvas'), {
        zoom: 10,
        center: mapOrigin,
        clickableIcons: false,
        disableDefaultUI: true,
        zoomControl: true,
        minZoom: 8,
        maxZoom: 15,
        noClear: true,
    });
    var marker = new google.maps.Marker({
        map: map
    });

    function disable() {
        map.setOptions({
            draggable: false,
            scrollwheel: false,
            disableDoubleClickZoom: false
        });
    }

    function enable() {
        map.setOptions({
            draggable: true,
            zoomControl: true,
            scrollwheel: true,
            disableDoubleClickZoom: true
        });
    }


    function drawFreeHand() {

        //the polygon
        poly = new google.maps.Polyline({
            map: map,
            clickable: false
        });
        //move-listener
        move = google.maps.event.addListener(map, 'mousemove', function(e) {
            poly.getPath().push(e.latLng);
        });
        clickCounter++;
        //mouseup-listener
        google.maps.event.addListenerOnce(map, 'mouseup', function(e) {
            google.maps.event.removeListener(move);
            var path = poly.getPath();
            poly.setMap(null);
            poly = new google.maps.Polygon({
                map: map,
                path: path
            });


            google.maps.event.clearListeners(map.getDiv(), 'mousedown');
            getLatLng();
            enable()

        });
		
    }
    var clickCounter = 0;
    document.querySelector('#draw').addEventListener('click', function(e) {
        e.preventDefault();
        if (clickCounter > 0) {
            poly.getPath().clear();
            map.data.forEach(function(feature) {
                console.log(feature);
                map.data.remove(feature);
            });

        }
        disable();
        google.maps.event.addDomListener(map.getDiv(), 'mousedown', function(e) {
			if(e.target.parentElement.parentElement.className != 'gm-style' ){
				return;
			}
			map.setOptions({
				zoomControl: false,
			})				
            drawFreeHand();
        })

    })
}


function getLatLng() {
    var latlngArr = [];


    for (var i = 0; i < poly.getPath().b.length; i++) {
        var first;
        if (i == 0) {
            first = {
                lat: poly.getPath().b[(poly.getPath().b.length - 1)].lat(),
                lng: poly.getPath().b[(poly.getPath().b.length - 1)].lng(),
            }
        } else {
            first = {
                lat: poly.getPath().b[(i - 1)].lat(),
                lng: poly.getPath().b[(i - 1)].lng(),
            }
        }
        var second = {
            lat: poly.getPath().b[i].lat(),
            lng: poly.getPath().b[i].lng(),
        }
        var third;
        if (i == poly.getPath().length - 1) {
            third = {
                lat: poly.getPath().b[0].lat(),
                lng: poly.getPath().b[0].lng(),
            }
        } else {
            third = {
                lat: poly.getPath().b[(i + 1)].lat(),
                lng: poly.getPath().b[(i + 1)].lng(),
            }
        }
        var a = latlngdis(first, second);
        var b = latlngdis(second, third);
        var c = latlngdis(first, third);

        var angle = Math.acos((Math.pow(a, 2) + Math.pow(b, 2) - Math.pow(c, 2)) / (2 * a * b));

        // console.log(angle +'rad');

        //console.log(c+' this is c');

        if (angle > sensitivitySetTo.angle || c < sensitivitySetTo.length) {
            // console.log('time to splice')
            poly.getPath().removeAt(i);
            //console.log(poly.getPath().b.length);
            //console.log(poly.getPath().length);
            i--;
        } else {
            console.log(i + ' number cood');
            console.log(poly.getPath().b[i].lat() + 'lat');
            console.log(poly.getPath().b[i].lng() + 'lng');
            latlngArr.push([poly.getPath().b[i].lng(), poly.getPath().b[i].lat()]);
        }

        // console.log(poly.getPath().b[i].lat()+'lat');
        //console.log(poly.getPath().b[i].lng()+'lng');


    }
	console.log(poly.getPath().b.length);
    document.querySelector('#numPoints').innerHTML = 'GeoJSON - Number of Points Plotted: ' + poly.getPath().b.length;
    latlngArr.push(latlngArr[0]);
    geoJsonObj = {
        "type": "Feature",
        "properties": {
            "id": "polygon",
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                latlngArr
            ]
        }
    }
    map.data.addGeoJson(geoJsonObj);
    map.data.setStyle({
        fillColor: 'blue',
        fillOpacity: 0.2,
        strokeColor: 'blue',
        strokeWeight: 3
    });
    var geoJsonString = JSON.stringify(geoJsonObj);
    poly.getPath().clear();



    document.querySelector('#geoJson').innerHTML = geoJsonString;
	
    return latlngArr;
	
	
	
	
}


function latlngdis(cood1, cood2) {
    var R = 6371e3; // metres
    var lat1 = cood1.lat * (Math.PI / 180);
    var lat2 = cood2.lat * (Math.PI / 180);
    var deltalat = (cood2.lat - cood1.lat) * (Math.PI / 180);
    var deltalng = (cood2.lng - cood1.lng) * (Math.PI / 180);

    var a = Math.sin(deltalat / 2) * Math.sin(deltalat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltalng / 2) * Math.sin(deltalng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var d = R * c; //meters
    //console.log(d+ ' meters')
    return d;
}

//Clear for everything incase of unforseen bugs
document.getElementById('reset').onclick=function(){
	document.location.reload()
}

//postcode tester
	document.querySelector('#postcode_test').addEventListener('click',function(){
		var postcode=document.querySelector('#postcode_input').value;
		console.log(postcode);
		var httpRequest = new XMLHttpRequest();
		httpRequest.open('GET','http://api.postcodes.io/postcodes/'+postcode);
		httpRequest.send();
		httpRequest.onreadystatechange= function(){
			if(httpRequest.readyState == 4){
				var parsedResponse = JSON.parse(httpRequest.response)
				console.log('Status: '+parsedResponse.status);
				if(parsedResponse.status!=200){
					document.querySelector('#postcode_container p').innerHTML='Cant find Postcode!';
					return;
				}	else if(!geoJsonObj){
					document.querySelector('#postcode_container p').innerHTML='No geoJson to compare!';
					return;
				}
				
				var youngWolf = Wherewolf();
				var geodata = geoJsonObj
				youngWolf.add("matched",geodata);
				var postcodelnglat = [parsedResponse.result.longitude, parsedResponse.result.latitude]
				var results = youngWolf.find(postcodelnglat);
				if(results.matched){
					console.log(results.matched);
					document.querySelector('#postcode_container p').innerHTML='Yes, it is within the polygon boundry';
				}	else{
					console.log(results.matched);
					document.querySelector('#postcode_container p').innerHTML='No, this seems to be outside the polygon boundry';
				}
			}
		}
	
		
		
	})
	