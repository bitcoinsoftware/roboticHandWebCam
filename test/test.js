/*
 * test example
 * moving figures by arrows, 
 * space switching figure
 */ 
var switchFigure = 1;

ThisPageModule.changeConfig( {
	url : "test/json_server_side.php",
	
	// data to send
	data : { 
		"ip" : "127.0.0.1", 
		"msg" : "ohyeah"
	},

	// callback function after ajax call is successful 
	onSuccessFunction : function(response) {
		var svg = document.getElementById("svg");
		console.log(response); // logging response data

		var receivedData = JSON.parse(response);

		if (receivedData.button == "space") { switchFigure += 2; switchFigure %= 6; }
		var figure = svg.childNodes[switchFigure];

		var i, move, attr, textPoints;
		
		if ( receivedData.x ) { i=0; move = receivedData.x; attr = "x"; } 
		else if ( receivedData.y ) { i=1; move = receivedData.y; attr = "y"; } 
		else { return; }

		if (figure.getAttribute("points")) {
			
			var textPoints ="", points = figure.getAttribute("points");
			points = points.split(/[\s,]/);

	 		for(; i < points.length; i += 2) {
				points[i] = parseInt(points[i]) + parseInt(move);
			}
			for (i=0; i<points.length; i++) {
				textPoints += points[i];
				if (i % 2 == 0) { textPoints += ','; }
				else if (i == points.length-1 ) { break; }
				else { textPoints += ' '; }
			}
			figure.setAttribute("points", textPoints);

		} else {
			var pos = figure.getAttribute(attr);
			var newPos = parseInt(pos) + parseInt(move);
			var newPosText = '"' + newPos + '"';
	 		figure.setAttribute(attr, newPos);
	}

} } );

// start noActivityDetection
// set idle timeout
// showing information when the time has passed
ThisPageModule.noActivityDetection.SET_IDLE_TIMEOUT(5);
ThisPageModule.noActivityDetection.logoutFunction( function() {
	var akapit = document.createElement("div");
	with (akapit.style) {
		position = "absolute";
		width = "500px";
		height = "250px";
		top = "100px";
		left = "35%";
		background = "#e18728";
		border = "3px solid #f29839";
		textAlign = "center";
		font = "bold 2.5em/200px black sans-serif";
	};
	akapit.innerHTML = "NO ACTIVITY DETECT";
	var tekst = document.createElement("div");
	with (tekst.style) {
		position = "relative";
		left = "-50%";
	};
	akapit.appendChild(tekst);
	document.body.appendChild(akapit);
});
ThisPageModule.noActivityDetection.launchNoActivity(true);
