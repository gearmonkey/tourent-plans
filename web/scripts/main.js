var directionDisplay;
var directionsService = new google.maps.DirectionsService();
var map;
var alpha='ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function proper_pop(some_array, i){
    if (i===0){
	    item = some_array.shift();
	    the_rest = some_array;
    }else if (i===(some_array.length-1)){
		item = some_array.pop();
		the_rest = some_array;
    }else{
	    item = some_array[i];
		the_rest = some_array.slice(0,i)
		for (var idx=i+1;idx<some_array.length;idx++){
			the_rest.push(some_array[idx]);
		}
    }
    return {item: item, the_rest: the_rest};
}

function euc_2d(a,b){
	return Math.sqrt(Math.pow(a[0]-b[0],2)+Math.pow(a[1]-b[1],2));
}

function find(arr, obj){
    for(var i=0;i<arr.length;i++){
	    if (arr[i] === obj) {return i;}
    } 
	return -1;
}

function argmin(some_array){
	min_val = Math.min.apply({},some_array);
	return find(some_array, min_val);
}

function argmax(some_array){
	max_val = Math.max.apply({},some_array);
	return find(some_array, max_val);
}

function find_nearest_cities_euc(from, tos){
    // $(".output").append('from '+JSON.stringify(from)+'<br/>');
	if (tos.length === 1){
		result = 0;
	}else {
		var dists = [];
		for (var i=0;i<tos.length;i++){
            // $(".output").append('to '+i+' '+JSON.stringify(tos[i])+'<br/>');
			dists.push(euc_2d([from.latitude,from.longitude],[tos[i].latitude,tos[i].longitude]));
		}
		result = argmin(dists);
	}
	return result;
}

function find_wide_edge(cities){
    var lats = [];
    var lons = [];
    for (var i=0;i<cities.length;i++){
        lats.push(cities[i].latitude);
        lons.push(cities[i].longitude);
    }
    // $(".output").append('lats - '+JSON.stringify(lats)+'<br/>');
    // $(".output").append('lons - '+JSON.stringify(lons)+'<br/>');
    lat_diff = lats[argmax(lats)]-lats[argmin(lats)];
    lon_diff = lons[argmax(lons)]-lons[argmin(lons)];
    if (argmax([lat_diff,lon_diff])===0){
        wide_edge = argmax(lats);
        // $(".output").append('lats wider!<br/>');
    }else{
        wide_edge = argmax(lons);
        // $(".output").append('lons wider!<br/>');
    }
    // $(".output").append('edge is '+wide_edge+'<br/>');
    return wide_edge;
}

function cheap_optimize(cities){
    // does a random start then simply picks the closest city
    var start_idx = Math.floor(Math.random()*cities.length);
    // var start_idx = find_wide_edge(cities);
	var split_list = proper_pop(cities, start_idx);
	var better_order = [split_list.item];
	var closest_idx = 0;
	cities = split_list.the_rest;
	while (cities.length > 0){
		closest_idx = find_nearest_cities_euc(better_order[better_order.length-1],cities)
		split_list = proper_pop(cities,closest_idx)
		better_order.push(split_list.item)
		cities = split_list.the_rest
	}
	return better_order
}  

function initialize() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var cannes = new google.maps.LatLng(43.55, 7.016667);
    var myOptions = {
        zoom:7,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: cannes
    }
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    directionsDisplay.setMap(map);
    // directionsDisplay.setPanel(document.getElementById("directionsPanel"));
}

// $(".adp-directions").click(function(){
//     $(".adp-directions").fadeOut('fast');
// })


function calcRoute() {
    $("div.working").fadeIn('fast');
	var artist = document.getElementById("artist").value
	var uri = "http://api.semetric.com/artist/"
				+artist+"/downloads/bittorrent/location/city?token="
				+semetric_api_key;
	var cities = [];
	var country = document.getElementById("country").value
	var continent = document.getElementById("country").value
	
	$.getJSON(uri, function(data) {
	    if (data.success==false) {
		    $(".output").append('error - '+JSON.stringify(data.error) + '<br/>');
		    return;
		}
	    var i;
	    var metros = data.response.data;
	    for (i=0;i<metros.length;i++){
		    if (country===metros[i].city.region.country.code){
			    cities.push(metros[i].city);
		    }else if (continent===metros[i].city.region.continent.code){
			    cities.push(metros[i].city);
		    }else if (country==='ALL'&&continent==='ALL'){
			    cities.push(metros[i].city);
		    }
	    }
	    cities = cities.slice(0,document.getElementById("num_cities").value);
        // $(".output").append('cities- '+JSON.stringify(cities) + '<br/>');
	    cities = cheap_optimize(cities);
        // $(".output").append('cities- '+JSON.stringify(cities) + '<br/>');
	    var first = cities.shift();
	    if (document.getElementById("return").checked){
	        var last = first;
	    }else{
	        var last = cities.pop();	
	    }
        // var start = new google.maps.LatLng(first.latitude, first.longitude)
        // var end = new google.maps.LatLng(last.latitude, last.longitude)
        start = first.name+','+first.region.country.name
        end = last.name+','+last.region.country.name
        var request = {
            origin:start, 
            destination:end,
		    waypoints:[],
            travelMode: google.maps.DirectionsTravelMode.DRIVING,
            optimizeWaypoints: true
        };
	    for (i=0;i<cities.length;i++) {
            // var way_loc = new google.maps.LatLng(cities[i].latitude, cities[i].longitude)
            way_loc = cities[i].name+','+cities[i].region.country.name
	     	request.waypoints.push({location:way_loc});
	    }
        // $(".output").append(JSON.stringify(request));
        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
                // $(".output").append('response - '+JSON.stringify(response.routes[0].legs[0])+'<br/>');
                // $(".output").append('legs - '+JSON.stringify(response.routes[0].legs.length)+'<br/>');
                $('#directionsPanel').empty();
                for (i=0;i<response.routes[0].legs.length; i++){
                    leg = response.routes[0].legs[i];
                    $('#directionsPanel').append("<div class='a_leg'> <div class='place'>"+alpha[i]+
                        '. '+leg.start_address+"</div><br/><div class='dist'>"+leg.distance.text + 
                        " -</div> <div class=duration>"+leg.duration.text+"</div><br/></div>");
                }
            }else {
                $(".output").val('directions failed, response: '+JSON.stringify(request)+'<br/>');
            }
            $("div.working").fadeOut('fast');
        });
	});
}