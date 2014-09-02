app.factory('radioField', function () {
	return [
		{
	        "key": "triedEmber",
	        "type": "radio",
	        "label": "Have you tried EmberJs yet?",
	        "options": [
	            {
	                "name": "Yes, and I love it!",
	                "value": "yesyes"
	            },
	            {
	                "name": "Yes, but I'm not a fan...",
	                "value": "yesno",
	                "description": "Help me!"
	            },
	            {
	                "name": "Nope",
	                "value": "no"
	            }
	        ]
	    }
	]
});

app.factory('radioData', function () {
	return {
	  "triedEmber": "yesno"
	}
});