/*
 * PAGEMODULE
 * API:
 * - PageModule.changeConfig( configObject ) @type{function}
 *		configObject properties {
 *			url : @type{string} default "" // ajaxLocation,
 *			requestMethod : @type{string} default "POST" ,
 *			dataType : @type{string} default "application/json". 
 *			data : @type{object}, default { ip : "127.0.0.1" } // sending data
 *			onSuccessFunction : @type{function} default empty fn // callback function invoke when the AJAX call is successful
 *			onErrorFunction : @type{function} default empty fn // callback function invoke after AJAX location error
 *			onCompleteFunction : @type{function} default empty fn // callback function invoke always when the request is complete
 *		}
 * - PageModule.noActivityDetection @type{object}
 *		noActivityDetection properties {
 *			SET_IDLE_TIMEOUT(timeout @type{int}) : @type{function}	
 *			launchNoActivity(toggle @type{boolean}) : @type{function} // start/stop )true/false) to track idle time (only keydown event)	
 *			logoutFunction : @type{function} default empty // function invoke when idle time reach limit (SET_IDLE_TIMEOUT)	
 *		}
 */

var ThisPageModule = (function(document, window) {
	
	// page buttons NodeList variable
	var buttons;

	/*
	 * HttpRequest variable @type{object}
	 */
	var HttpRequest = (function() { 
		
		// default config
		var _config = { 
				url : "",
				requestMethod : "POST",
				dataType : "application/json",
				data : { ip : "127.0.0.1" },
				onSuccessFunction : function() { },
				onErrorFunction : function() { },
				onCompleteFunction : function() { } 
			};

		// sending request to server with pressed button value
		var _ajax = function(buttonValue) {
			var http_request = new XMLHttpRequest();

			http_request.onreadystatechange = function() {
				if( http_request.readyState == 4 ) {
					if( http_request.status == 200 ) {
						var returnData = (_config.dataType == "xml") ? http_request.responseXML : http_request.responseText;
						_config.onSuccessFunction(returnData);
					} else {
						_config.onErrorFunction();
					}
					_config.onCompleteFunction();
					http_request = null;
				}
			};
			
			http_request.open(_config.requestMethod, _config.url, true);
			http_request.setRequestHeader("Content-Type", _config.dataType);
			
			var temp = _config.data;
			temp.button = buttonValue;

			var dataText = JSON.stringify(temp);
			console.log(dataText);	// logging sending json data
			http_request.send(dataText);
		}

		return {
			sendJsonDataFunction : _ajax,
			changeConfig : function( new_config ) {
				_config.url = new_config.url || _config.url;
				_config.requestMethod = new_config.requestMethod || _config.requestMethod;
				_config.dataType = new_config.dataType || _config.dataType;
				_config.data = new_config.data || _config.data;
				_config.onSuccessFunction = new_config.onSuccessFunction || _config.onSuccessFunction;
				_config.onErrorFunction = new_config.onErrorFunction || _config.onErrorFunction;
				_config.onCompleteFunction = new_config.onCompleteFunction || _config.onCompleteFunction;
			}
		};

	})();

	/* 
	 * KeyHandler variable @type{object}
	 * properties:
	 * 		keyDownHandler @type{function}
	 * 		keyUpHandler @type{function}
	 */ 
	var KeyHandler = (function() {
		
		// @type{object} mapping key codes to their correspoding keys' values
		var _KEYMAP = {
			9 : "tab",
			17 : "ctrl",
			18 : "alt",
			32 : "space",
			37 : "left",
			38 : "up",
			39 : "right",
			40 : "down",
			65 : "a",
			68 : "d",
			83 : "s",
			87 : "w",
			// numeric keypad
			100 : "left",
			104 : "up",
			102 : "right",
			98 : "down"
		};
		
		var _keyPressedHandler = function(event, fn) {
			event = _eventHandler(event);
			
			// assigning key code of pressed key to its KEYMAP value or null if this one doesn't exist
			var pressedKey = _KEYMAP[event.keyCode] || null;
			
			if( pressedKey ) {
				var btn = _chooseButton(pressedKey);
				if ( btn ) {
					// function invoke pressed Key and button value match
					fn(btn);			
				}
			}
		};

		return {
			// ALT GR = CTRL + ALT = 2 requests in this case
			// key down event function
			keyDownHandler : function(event) {
				_keyPressedHandler(event, function(button) {
						if( button.className.indexOf("btn_active" ) < 0 ) {
							button.className += " btn_active";
						};
						HttpRequest.sendJsonDataFunction(button.getAttribute('value'));
					} );						
			},
			// key up event function
			keyUpHandler : function(event) {
				_keyPressedHandler(event, function(button) {
					button.className = "button";	
				});
			}
		};
	})();

	/* 
	 * MouseHandler variable @type{object}
	 * properties:
	 * 		onMouseOverEvent @type{function}
	 * 		onMouseOutEvent @type{function}
	 * 		onMouseDownEvent @type{function}
	 * 		onMouseUpEvent @type{function}
	 */ 
	var MouseHandler = (function() {
		var mouseEventHandler = function(event, fn) {
			event = _eventHandler(event);
			var button = event.target || event.srcElement;
			fn(button);
		};

		return {
			onMouseOverEvent : function(event) {
				mouseEventHandler(event, function(button) {
					button.className += " btn_hover";
				});
			},
			onMouseOutEvent : function(event) {
				mouseEventHandler(event, function(button) {
					button.className = "button";
				});
			},
			onMouseDownEvent : function(event) {
				mouseEventHandler(event, function(button) {
					button.className += " btn_active";
					HttpRequest.sendJsonDataFunction(button.getAttribute('value'));
				});
			},
			onMouseUpEvent : function(event) {
				mouseEventHandler(event, function(button) {
					button.className = button.className.replace(" btn_active", "");
				});
			}
		};
	})();

	/* 
	 * NoActivity variable @type{object}
	 * properties:
 	 *		SET_IDLE_TIMEOUT(timeout @type{int}) : @type{function}	
 	 *		launchNoActivity(toggle @type{boolean}) : @type{function} // start/stop )true/false) to track idle time (only keydown event)	
 	 *		logoutFunction : @type{function} default empty // function invoke when idle time reach limit (SET_IDLE_TIMEOUT)	
	 */ 
	var NoActivity = (function() {
		var _IDLE_TIMEOUT = 20;
		var _secondsCounter = 0;
		var _intervalHandler;

		_deteckedActivity = function() {
			_secondsCounter = 0;
		}
		
		_logout = function() { 
			console.log(_IDLE_TIMEOUT + " sec : No Activity Detected. Logget out?"); // logging TimeOut passed event
		};

		_checkedIdleTime = function() {
			_secondsCounter++;
			// console.log(_secondsCounter); // logging counting
			if ( _secondsCounter >= _IDLE_TIMEOUT ) {
				_logout();
				_NoActivity_OFF();
			}
		};

		// start counting
		_NoActivity_ON = function() {
			if( !_intervalHandler ) {
				_addEvent(document, 'keydown', _deteckedActivity);
				_intervalHandler = window.setInterval(_checkedIdleTime, 1000);
			}
		};

		// stop counting
		_NoActivity_OFF = function() {
			if( _intervalHandler ) {
				_removeEvent(document, 'keydown', _deteckedActivity);
				window.clearInterval(_intervalHandler);
				_intervalHandler = null;
				_secondsCounter = 0;
			}
		};

		return {
			SET_IDLE_TIMEOUT : function(timeout) {
				_IDLE_TIMEOUT = timeout;
			},
			launchNoActivity 	: function(toggle) {
				if( toggle ) { 
					_NoActivity_ON(); 
				} 
				else { 
					_NoActivity_OFF(); 
				}
			},
			logoutFunction : function(fn) {
				_logout = fn;
			}
		}
	})();

	/*
	 * _eventHandler variable @type{function}
	 * 		aggragate preparatory event's operations
	 * @return event @type{object}
	 */
	_eventHandler = function(event) {
		event = event || window.event;
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
        event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
        return event;
    }

    /*
	 * _chooseButton variable @type{function}
	 * 		choosing button which value match
	 * @return button @type{object|node|null}
	 */
	_chooseButton = function(keyValue) {
		for (var i=0, button; button = buttons[i]; i++) {
					if( buttons[i].getAttribute("value") == keyValue ) { 
						button = buttons[i];
						return button;
					}
		};
		return null;
	};

	/* 
	 *	_addEvent variable @type{function} 
	 * 		cross browser addign event listener to element
	 * @return void
	 */
	_addEvent = function( element, event, fn ) {
		if ( element.addEventListener ) {
			element.addEventListener(event, fn, false);
		} else if ( element.attachEvent ) {
			element.attachEvent("on" + event, fn);
		} else {
			eval(element + ".on" + event + "=" + fn + ";");
		}
	};

	/* 
	 *	_removeEvent variable @type{function} 
	 * 		cross browser removing event listener from element
	 * @return void
	 */
	_removeEvent = function ( element, event, fn ) {
		if ( element.removeEventListener ) {
			element.removeEventListener(event, fn, false);
		} else if ( element.attachEvent ) {
			element.detachEvent("on" + event, fn);
		} else {
			eval(element + ".on" + event + "= ;");
		}
	};

	/* 
	 *	_initModule variable @type{function} 
	 * 		init listeners for all buttons, and keys
	 *	@return void
	 */
	function _initModule() {
		// IE >= 8 support
		buttons = document.querySelectorAll("#menu_container > ul.row > li > .button");		

		for (var i=0; i < buttons.length; i++) {
			_addEvent(buttons[i], "mouseover", MouseHandler.onMouseOverEvent);
			_addEvent(buttons[i], "mouseout", MouseHandler.onMouseOutEvent);
			_addEvent(buttons[i], "mousedown", MouseHandler.onMouseDownEvent);
			_addEvent(buttons[i], "mouseup", MouseHandler.onMouseUpEvent);
		}
		_addEvent(document, "keydown", KeyHandler.keyDownHandler);
		_addEvent(document, "keyup", KeyHandler.keyUpHandler);
	}

	// attach _initModule function to DOMContentLoaded event
	_addEvent(window, 'DOMContentLoaded', _initModule);

	// @return @type{object} - API Module
	return {
		changeConfig : function(config) {
			HttpRequest.changeConfig(config);
		},
		noActivityDetection : NoActivity
	}

})(document, window);
