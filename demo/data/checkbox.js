app.factory('checkboxData', function () {
	return {
		multiSelectButtons: ['sure', 'nope'],
        singleToggle: "active"
	}
});

app.factory("checkboxField", function () {
	return [
        {
            "key": "multiSelectButtons",
            "type": "checkbox",
            "label": "Is this thing on?",
            "options": [
                {
                    "name": "Sure",
                    "value": "sure"
                },
                {
                    "name": "Nope",
                    "value": "nope"
                },
                {
                    "name": "Why Not?",
                    "value": "whynot"
                }
            ]
        }, 
        {
            "key": "singleToggle",
            "type": "checkbox",
            "label": "Toggle me!",
            "options": [
                {
                    "name": "toggle",
                    "value": "active"
                }
            ]
        }
    ];
});