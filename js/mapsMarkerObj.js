//Currently working: Spec and Set time/location, websql, infowindows, etc.
var parkdb;
var myPos = new google.maps.LatLng(35.91303, -79.055707);
var mapFlag = false;
geoFlag = false;
var specFlag = false;
var myMap;
var gmap;
var resetFlag=false;
var markers = [];
var bullshit = false;
var onemore= false;
var myInt;
var myInfoWindow;
$(window).resize(function(){
	
	var header = $("div[data-role='header']:visible");
	var headHeight = header.height();
	var footer = $("div[data-role='footer']:visible");
	var footHeight = footer.height();
	var content = $("#mcontent");
	var viewport_height = $(window).height();
 
	var content_height = viewport_height - headHeight - footHeight + 30;
	if((content.outerHeight() - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
		content_height -= (content.outerHeight() - content.height());
	}
	$('#mcontent').height(content_height);
	$('#map_canvas').height(content_height);
	$('#map_canvas').width($(window).width());
	google.maps.event.addListenerOnce(gmap, 'idle', function() {
		setTimeout(function(){google.maps.event.trigger(gmap, 'resize');}, 200);
		
	});
	//setTimeout(function(){console.log(myPos);gmap.setCenter(myPos);gmap.setZoom(15);},1000);
});
function loadMap(){
	$('#map_canvas').gmap3({
		clear:{
			'name':'marker'
		}
		});
		myMap = $("#map_canvas").gmap3(
			{ map:{
				options:{
				center: [35.91303, -79.055707],
				zoom: 15,
				mapTypeId: 'roadmap',
				zoomControl:false,
				streetViewControl:false
				}
			}
			});
	$('#map_canvas').gmap3({
			getgeoloc:{
				callback: function(myLatLng){
					if(myLatLng){
						myPos = myLatLng;
						// var date = new Date();
						// var minutes = (date.getMinutes() > 9) ? date.getMinutes().toString() : "0" + date.getMinutes().toString();
						// var stringTime = date.getHours().toString() + minutes;
						// var dateArr = [date.getDay(), stringTime, myPos.toString()];
						var dateArr = [5, "2249","(35.91303, -79.05570699999998)"]
						resetFlag=true;
						initPage(dateArr);
					}
					else{
						
						myPos = new google.maps.LatLng(35.91303, -79.055707);
						var date = new Date();
						var minutes = (date.getMinutes() > 9) ? date.getMinutes().toString() : "0" + date.getMinutes().toString();
						var stringTime = date.getHours().toString() + minutes;
						var dateArr = [date.getDay(), stringTime, myPos.toString()];
						resetFlag=true;
						initPage(dateArr);
					}
				}
			}
		});
	//Potentially put entire rest of this function in callback
 }
function clearmap() {
	/*$('#mcontent').empty();
	$('#mcontent').html('<div id="map_canvas"></div>');*/
	clearInterval(myInt);
}

$(function(){
	$('.parkButton').on('singletap', function(){
		alert("singletap");
		$.UIGoToArticle("#mapPage");
	});
	$('.parkButton').on('tap', function(){
		alert("tap");
		$.UIGoToArticle("#mapPage");
	});
})
  
$(function(event) {

	$('input[name="minutes"]').val('00');
	//$.mobile.selectmenu.prototype.options.nativeMenu = false;
	parkdb = openDatabase('Where2Park', '1.0', 'my first database', 2 * 1024 * 1024);
	parkdb.transaction(function (tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS Spots (Name, Location, Days, StartTime, EndTime, Overnight)');
		
	});
	updateDB();
});
function specifiedTime(){
	specFlag=true;
	$('#map_canvas').gmap3({
		clear:{
			'name':'marker'
		}
		});
		myMap = $("#map_canvas").gmap3(
			{ map:{
				options:{
				center: [35.91303, -79.055707],
				zoom: 15,
				zoomControl:false,
				mapTypeId: 'roadmap'
				},			
			}
			});
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({ 'address': $('#location').val() }, function (results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			//alert("Okie dokie");
			console.log(results);
			//alert(google.maps.geometry.spherical.computeDistanceBetween(results[0].formatted_address, "Chapel Hill, NC"));
			var inpHours = ($('#ampm').val() == 'am') ? $('#hours').val() : (parseInt($('#hours').val(), 10) + 12).toString();
			var dateArr = [$('#days').val(), inpHours + $('#minutes').val(), $('#location').val()];
			myPos = results[0].geometry.location;
			resetFlag = true;
			initPage(dateArr);
		}
		else{
			alert("The address you entered was invalid, centering you in Chapel Hill, NC");
			var inpHours = ($('#ampm').val() == 'am') ? $('#hours').val() : (parseInt($('#hours').val(), 10) + 12).toString();
			var dateArr = [$('#days').val(), inpHours + $('#minutes').val(), "Chapel Hill, NC"];
			myPos = new google.maps.LatLng(35.91303, -79.055707);
			resetFlag = true;
			initPage(dateArr);
		}
	});
		
	
}

function initPage(dateArr){
	
	//initializeMap();
	//setTimeout(function(){initializeMap(date)}, 300);
	
	var header = $("div[data-role='header']:visible");
	var headHeight = header.height();
	var footer = $("div[data-role='footer']:visible");
	var footHeight = footer.height();
	var content = $("#mcontent");
	var viewport_height = $(window).height();
 
	var content_height = viewport_height - headHeight - footHeight;
	if((content.outerHeight() - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
		content_height -= (content.outerHeight() - content.height());
	}
	$('#mcontent').height(content_height);
	$('#map_canvas').height(content_height);
	$('#map_canvas').width($(window).width());
	createMarkers(dateArr);
	gmap = $('#map_canvas').gmap3({
		get:{
			name:"map"
		}
	});
	
	/*setTimeout(function(){
			google.maps.event.trigger(gmap, 'resize');
			gmap.setCenter(new google.maps.LatLng(35.91303,-79.055707));
			gmap.setZoom(15);
		}, 300);*/
	//addIWClose();
	//Create marker at location or centrally if necessary.
	if (!specFlag) {
	$('#map_canvas').gmap3({
		getgeoloc:{
			callback: function(myLatLng){
				if(myLatLng){
					myPos = myLatLng;
					//alert("you are at" + myLatLng);
					var markers3 = [];
					var marker = new Object();
					marker.latLng = myLatLng;
					marker.options = new Object();
					marker.data = "Your current location!";
					markers3.push(marker);
					$(this).gmap3({
						marker:{
							values:markers3,
							animation: google.maps.Animation.DROP
						},
						events:{
						click: function(marker, event, context){
							setTimeout(function(){addInfoWindow(marker, context, dateArr[2]);}, 100);				
						}
					}
					});
						
						//google.maps.event.trigger(gmap, 'resize');
						//gmap.setCenter(new google.maps.LatLng(35.91303,-79.055707));
				}
				else{
					var markers2 = [];
					var marker = new Object();
					marker.address = 'Chapel Hill, NC';
					specFlag=false;
					marker.options = new Object();
					marker.data = "Couldn't find your location.";	
					markers2.push(marker);
					$(this).gmap3({
						marker:{
							values:markers2,
							animation: google.maps.Animation.DROP
						},
							events:{
							click: function(marker, event, context){
								setTimeout(function(){addInfoWindow(marker, context, dateArr[2]);}, 100);
								
							}
							}
						});
					}
				}
		}
	});
	}
	else{
		var markers3 = [];
		var marker = new Object();
		marker.address = dateArr[2];
		marker.options = new Object();
		markers3.push(marker);
		$('#map_canvas').gmap3({
			marker:{
				values:markers3,
				animation: google.maps.Animation.DROP
			}
			});
		
	}
	specFlag=false;
	$.UIGoToArticle('#mapPage');
	
	// google.maps.event.addListener(gmap, 'idle', function() {
	// 	setTimeout(function(){google.maps.event.trigger(gmap, 'resize'); bullshit =true;}, 500);
		
	// });
	// bullshit = false;
	// myInt = setInterval(function(){
	// 	if(!bullshit){
	// 		gmap.setCenter(myPos);gmap.setZoom(15);
	// 		onemore = true;
	// 	}
	// 	if (onemore) {
	// 		setTimeout(function(){gmap.setCenter(myPos);gmap.setZoom(15);}, 600);
	// 		onemore=false;
			
	// 	}
	// }, 300);
	// setTimeout(function(){clearInterval(myInt);}, 5000);
	
	
	
}
//Closes any open windows on map click
function addIWClose(){
	/*google.maps.event.addDomListener(document.getElementById('map_canvas'),
		  'click', function() {
			$("#map_canvas").gmap3({
				get:{
					name:"infowindow",
					callback:function(iw){
						if(iw)
							iw.close();
					}
				}
			});
		  });*/
	$('#map_canvas').on('tap', function(){
		$("#map_canvas").gmap3({
				get:{
					name:"infowindow",
					callback:function(iw){
						if(iw)
							iw.close();
					}
				}
			});
	})
}
function createMarkers(dateArr){
	$("#map_canvas").gmap3({
		clear:{
			name: "marker"
		},
		get:{
				name:"directionsrenderer",
				callback:function(dir){
					if(dir)
						dir.setMap(null);
				}
			}
	});
	markers.forEach(function(marker){
		marker.setMap(null);	
	});
	markers = [];
	//Populate Table with webSql data
	var curTime = parseInt(dateArr[1], 10);
	//'Days contains ' + date.getDay().toString() + ' and 
	//startTime < ' + curTime + ' or
	//' or endTime > ' + curTime
	//var queryText = 'SELECT * FROM Spots WHERE Days LIKE "%' + date.getDay().toString() + '%" AND (StartTime < "'+curTime + '" OR EndTime > "'+curTime+'")';
	//var queryText = 'SELECT * FROM Spots WHERE Days LIKE "%' + dateArr[0] + '%" AND (StartTime <= '+ curTime + ' OR EndTime >='+ curTime +')';
	var d = new $.Deferred();
	var iwhtml="";
	var overnightQuery = '((StartTime <= '+ curTime + ' OR EndTime >='+ curTime +') AND Overnight = ' + 1 + ')';
	var samedayQuery = '((StartTime <= ' + curTime + ' AND Endtime >= ' + curTime + ') AND Overnight = ' + 0 + ')';
	var queryText = 'SELECT * FROM Spots WHERE Days LIKE "%' + dateArr[0] + '%" AND (' + samedayQuery + ' OR ' + overnightQuery + ')';
	 parkdb.transaction(function (tx) {
		tx.executeSql(queryText, [], function(tx, results){
			if (results.rows.length == 0) {
				console.log("empterr");
				setTimeout(function(){alert("Sorry, there are no free lots available at this time. Parking's tough in Chapel Hill :D. Try a time that isn't during the regular school day (M-F 7:30-5:00)");}, 1000);
			}
			for(i = 0; i < results.rows.length; i++){
			
			iwhtml = formatInfoHTML(results.rows.item(i));
			var options = new Object();
			options = new Object();
			options.icon = new google.maps.MarkerImage("https://maps.google.com/mapfiles/kml/shapes/parking_lot.png");
			options.icon.scaledSize = new google.maps.Size(26, 30);
			options.icon.anchor = new google.maps.Point(22,30);
			options.icon.origin = new google.maps.Point(0,0);
			var address = results.rows.item(i).Location.split(",");
			var marklatlng = new google.maps.LatLng(parseFloat(address[0]), parseFloat(address[1]));
			var markerG = new google.maps.Marker({
				position: marklatlng,
				map: gmap,
				options: options,
				content:iwhtml+ '<br/><strong>Get Directions:</strong><div id="goButton" style="display:inline"><input style="font-size:15px" type="button" value="Go!" id="go"></div>'
			});
			markers.push(markerG);
			var infowindow = new google.maps.InfoWindow();
			}
			markers.forEach(function(marker){
				
			 google.maps.event.addListener(marker, 'click', function() {
				myInfoWindow = infowindow;
				infowindow.setContent(this.content);
				infowindow.open(gmap,marker);			
				window.setTimeout(function(){createListener(marker.position, dateArr[2])}, 300);
			      });	
				
			});
		});
	}); 
}	
//Create the HTML for an info window
function formatInfoHTML(sqlRow){

	var html = "<Strong>Lot Name: </Strong>" + sqlRow.Name + "<br/>";
	html+="<strong>Days Free: </strong>" + sqlRow.Days.replace(/0/g , "Su").replace(/1/g , "M").replace(/2/g , "Tu").replace(/3/g , "W").replace(/4/g , "Th").replace(/5/g , "F").replace(/6/g , "Sa") + "<br/>";
	html+="<strong>Free between: </strong>" + formatTime(sqlRow.StartTime) + " and " + formatTime(sqlRow.EndTime);
	return html;

}
function formatTime(intTime){
	var start = intTime;
	var ampm = 'AM';
	if(start > 1259){
		start -= 1200;
		ampm = 'PM';
	}
	else if (start <100) {
		start +=1200;
	}
	var stringTime = start.toString();
	stringTime = stringTime.substring(0,stringTime.length-2) + ":" + stringTime.substring(stringTime.length-2, stringTime.length) + ampm;
	return stringTime;
}
//Add an info window when a marker is clicked			
function addInfoWindow(marker, context, origin){
	var layerLL = marker.position;
	myMap.gmap3({
	get:{
		name:"infowindow",
		callback:function(iw){
			if(iw)
				iw.close();
		}
	},
	infowindow:{
		anchor: marker,
		options: {
			content: context.data + '<br/><strong>Get Directions:</strong><div id="goButton" style="display:inline"><input style="font-size:15px" type="button" value="Go!" id="go"></div>'
		}
	},
	});
	var infowindow = myMap.gmap3({get:{name:"infowindow"}});
	console.log(infowindow);
	window.setTimeout(function(){createListener(layerLL, origin)}, 300);
}

//Create a listener for the "go" button on the info window
function createListener(layerLL, originVal){
	  google.maps.event.addDomListener(document.getElementById('go'),
		  'click', function() {
		myMap.gmap3({
			get:{
				name:"directionsrenderer",
				callback:function(dir){
					if(dir)
						dir.setMap(null);
				}
			},
			getroute:{
				options:{
					origin:originVal,
					destination: layerLL,
					travelMode: google.maps.DirectionsTravelMode.DRIVING
				},
				callback: function(results){
					$('#results').empty();
					$(this).gmap3({
						directionsrenderer:{
							container: $('#results'),
							options:{
								directions:results
							}
						}
					});
				}
			}
		});
		myInfoWindow.close();
	  });
}


function updateDB(){


	//Check if table is empty
	emptyCheckSql = "SELECT * FROM Spots"
	parkdb.transaction(function(tx){
		tx.executeSql(emptyCheckSql, [], function(tx, results){
			if(results.rows.length < 1)
				updateTable();
			else
				console.log("Table has data");
		});
	});
}
function updateTable(){
	var queries = new Array();
	var weekend="'0,6', 0, 2400, 1)";
	var campus = "'1,2,3,4,5', 1700, 730, 1)";
	var dorm = "'0,1,2,3,4', 2100, 730, 1)";
	var dorm2 = "'5', 1700, 730, 1)";

	var updateQuery = "INSERT INTO Spots VALUES ('PNC/Turtle Lot', '35.914691,-79.056354', '0,1,2,3,4,5,6', 1800, 600, 1)";
	queries.push(updateQuery);
	queries.push("INSERT INTO Spots VALUES ('Stadium Drive', '35.907976, -79.046234 ',"+campus);
	queries.push("INSERT INTO Spots VALUES ('Stadium Drive', '35.907976, -79.046234 ',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Cameron/Graham St. Lot', '35.90754, -79.06325 ', '1, 2,3,4,5', 1700, 730, 1)");
	queries.push("INSERT INTO Spots VALUES ('Cameron/Graham St. Lot', '35.90754, -79.06325 ', '0,6', 0, 2400, 1)");
	queries.push("INSERT INTO Spots VALUES ('Swain Lot', '35.91226, -79.05356', '1, 2,3,4,5', 1900, 600, 1)");
	queries.push("INSERT INTO Spots VALUES ('Graham St Lot', '35.90754, -79.06325', '1, 2, 3, 4, 5', 1800, 800, 1)");
	queries.push("INSERT INTO Spots VALUES ('Graham St Lot', '35.90754, -79.06325', '6', 2000, 800, 1)");
	queries.push("INSERT INTO Spots VALUES ('Graham St Lot', '35.90754, -79.06325', '0', 0, 2400, 1)");
	queries.push("INSERT INTO Spots VALUES ('427 West Franklin Lot','35.91017, -79.06242', '1,2,3,4,5,6,', 2000, 800, 1)");
	queries.push("INSERT INTO Spots VALUES ('427 West Franklin Lot','35.91017, -79.06242', '0', 0, 2400, 1)");
	queries.push("INSERT INTO Spots VALUES ('Basnight/Franklin Lot', '35.90979, -79.06192', '1,2,3,4,5,6,', 2000, 800, 1)");
	queries.push("INSERT INTO Spots VALUES ('Basnight/Franklin Lot', '35.90979, -79.06192', '0', 0, 2400, 1)");
	queries.push("INSERT INTO Spots VALUES ('415 West Franklin Lot', '35.91052, -79.06178', '1,2,3,4,5,6', 2000, 800, 1)");
	queries.push("INSERT INTO Spots VALUES ('415 West Franklin Lot', '35.91052, -79.06178', '0', 0, 2400, 1)");
	queries.push("INSERT INTO Spots VALUES ('440 South Lot', '35.91160, -79.06205', '1,2,3,4,5', 1700, 600, 1)");
	queries.push( "INSERT INTO Spots VALUES ('440 South Lot', '35.91160, -79.06205', '0,6', 0, 2400, 0)");
	queries.push("INSERT INTO Spots VALUES ('440 North Lot', '35.91226, -79.06137', '0,1,2,3,4,5', 1700, 2100, 0)");
	queries.push("INSERT INTO Spots VALUES ('UNC Development Lot', '35.91275, -79.05910', '0,1,2,3,4,5,6', 1700, 600, 1)");
	queries.push("INSERT INTO Spots VALUES ('Mallette St Lot', '35.911118, -79.059328', '1,2,3,4,5,6', 2000, 800, 1)"); 
	queries.push("INSERT INTO Spots VALUES ('Mallette St Lot', '35.911118, -79.059328', '0', 0, 2400, 1)");
	queries.push("INSERT INTO Spots VALUES ('Mallette St Lot (Permit Spaces)', '35.911092, -79.059516', '1,2,3,4,5,6', 1800, 700, 1)");  
	queries.push("INSERT INTO Spots VALUES ('Mallette St Lot (Permit Spaces)', '35.911092, -79.059516', '0', 0, 2400, 1)"); 
	queries.push("INSERT INTO Spots VALUES ('University Square (BLUE SPACES ONLY)', '35.911607, -79.058797', '0,1,2,3,4,5,6', 1800, 600, 1)");
	queries.push("INSERT INTO Spots VALUES ('West Rosemary Lot', '35.91400, -79.05697', '1,2,3,4,5', 2000, 800, 1)");
	queries.push("INSERT INTO Spots VALUES ('West Rosemary Lot', '35.91400, -79.05697',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Porthole Alley Lot', '35.91288, -79.05461', '1,2,3,4,5', 1700, 600, 1)");
	queries.push("INSERT INTO Spots VALUES ('Porthole Alley Lot', '35.91288, -79.05461', '0,6', 0, 2400, 0)");
	queries.push("INSERT INTO Spots VALUES ('Cogeneration Facility', '35.907050, -79.062854',"+campus);
	queries.push("INSERT INTO Spots VALUES ('Cogeneration Facility', '35.907050, -79.062854',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Law School Deck', '35.906974, -79.042846',"+campus);
	queries.push("INSERT INTO Spots VALUES ('Law School Deck', '35.906974, -79.042846',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Cobb Deck', '35.911716, -79.045756',"+campus);
	queries.push("INSERT INTO Spots VALUES ('Cobb Deck', '35.911716, -79.045756',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Ridge Rd Spots', '35.908312, -79.041566',"+campus);
	queries.push("INSERT INTO Spots VALUES ('Ridge Rd Spots', '35.908312, -79.041566',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Law School Lot', '35.909361, -79.042142',"+campus);
	queries.push("INSERT INTO Spots VALUES ('Law School Lot', '35.909361, -79.042142',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Navy Lot', '35.907087, -79.042012',"+campus);
	queries.push("INSERT INTO Spots VALUES ('Navy Lot', '35.907087, -79.042012',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Boshamer Lot', '35.906485, -79.042267',"+campus);
	queries.push("INSERT INTO Spots VALUES ('Boshamer Lot', '35.906485, -79.042267',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Bowles Lot', '35.901567, -79.044587',"+campus);
	queries.push("INSERT INTO Spots VALUES ('Bowles Lot', '35.901567, -79.044587',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Craige Lot', '35.902935, -79.045748',"+dorm);
	queries.push("INSERT INTO Spots VALUES ('Craige Lot', '35.902935, -79.045748',"+dorm2);
	queries.push("INSERT INTO Spots VALUES ('Hinton James Lot', '35.902046, -79.042956',"+dorm);
	queries.push("INSERT INTO Spots VALUES ('Hinton James Lot', '35.902046, -79.042956',"+dorm2);
	queries.push("INSERT INTO Spots VALUES ('Ehringhaus Lot', '35.904395, -79.042109',"+dorm);
	queries.push("INSERT INTO Spots VALUES ('Ehringhaus Lot', '35.904395, -79.042109',"+dorm2);
	queries.push("INSERT INTO Spots VALUES ('Morrison Lot', '35.904566, -79.046666',"+dorm);
	queries.push("INSERT INTO Spots VALUES ('Morrison Lot', '35.904566, -79.046666',"+dorm2);
	queries.push("INSERT INTO Spots VALUES ('Aycock Lot', '35.913043, -79.047301',"+dorm);
	queries.push("INSERT INTO Spots VALUES ('Aycock Lot', '35.913043, -79.047301',"+dorm2);
	queries.push("INSERT INTO Spots VALUES ('Campus Security Lot', '35.904519, -79.047336',"+campus);
	queries.push("INSERT INTO Spots VALUES ('Campus Security Lot', '35.904519, -79.047336',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Cardinal Deck', '35.902523, -79.052719',"+campus);
	queries.push("INSERT INTO Spots VALUES ('Cardinal Deck', '35.902523, -79.052719',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('New Venable', '35.909072, -79.052221',"+campus);
	queries.push("INSERT INTO Spots VALUES ('New Venable', '35.909072, -79.052221',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Old East Lot', '35.912500, -79.050590',"+campus);
	queries.push("INSERT INTO Spots VALUES ('Old East Lot', '35.912500, -79.050590',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Bynum Circle', '35.912155, -79.050029',"+campus);
	queries.push("INSERT INTO Spots VALUES ('Bynum Circle', '35.912155, -79.050029',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Steele/Caldwell Lots', '35.911918, -79.050029','1,2,3,4,5', 2000, 730, 1)");
	queries.push("INSERT INTO Spots VALUES ('Steele/Caldwell Lots', '35.911918, -79.050029',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Emerson Dr', '35.912285, -79.048664',"+campus);
	queries.push("INSERT INTO Spots VALUES ('Emerson Dr', '35.912285, -79.048664',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Country Club Dr', '35.913094, -79.045193','1,2,3,4,5', 2100, 700, 1)");
	queries.push("INSERT INTO Spots VALUES ('Country Club Dr', '35.913094, -79.045193',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('McIver Lot', '35.914256, -79.047238',"+dorm);
	queries.push("INSERT INTO Spots VALUES ('McIver Lot', '35.914256, -79.047238',"+dorm2);
	queries.push("INSERT INTO Spots VALUES ('McIver Lot', '35.914256, -79.047238',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('McIver Lot', '35.914970, -79.047677',"+dorm);
	queries.push("INSERT INTO Spots VALUES ('McIver Lot', '35.914970, -79.047677',"+dorm2);
	queries.push("INSERT INTO Spots VALUES ('McIver Lot', '35.914970, -79.047677',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Forest Theater', '35.913872, -79.044925',"+campus);
	queries.push("INSERT INTO Spots VALUES ('Forest Theater', '35.913872, -79.044925',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Park Place', '35.915879, -79.044887',"+campus);
	queries.push("INSERT INTO Spots VALUES ('Park Place', '35.915879, -79.044887',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('University Development', '35.912622, -79.059272',"+campus);
	queries.push("INSERT INTO Spots VALUES ('University Development', '35.912622, -79.059272',"+weekend);
	queries.push("INSERT INTO Spots VALUES ('Outdoor Education Center', '35.907769, -79.038018',"+campus);
	queries.push("INSERT INTO Spots VALUES ('Outdoor Education Center', '35.907769, -79.038018',"+weekend);
	
	
	
	
	
	
	
	parkdb.transaction(function(tx){
		queries.forEach(function(query){
			tx.executeSql(query);
		});
	});
	console.log("Now updating table");
}