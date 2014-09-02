app.factory('buttongroupData', function () {
	return {
		multiSelectButtons: ['sure', 'nope', 'whynot'],
        singleToggle: true,
        singleSelectButtons: 'apple'
	}
});

app.factory("buttongroupField", function () {
	return [
        {
            "key": "multiSelectButtons",
            "type": "buttongroup",
            "selectType": "multiple",
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
        }, {
            "key": "singleToggle",
            "type": "buttongroup",
            "selectType": "multiple",
            "valueDelimiter": "|",
            "label": "Toggle me!",
            "options": [
                {
                    "name": "toggle",
                    "value": "active"
                }
            ]
        }, {
            "key": "singleSelectButtons",
            "type": "buttongroup",
            "selectType": "single",
            "required": true,
            "label": "Which one is best?",
            "options": [
                {
                    "name": "Apple",
                    "value": "apple"
                },
                {
                    "name": "Banana",
                    "value": "banana"
                },
                {
                    "name": "Peach",
                    "value": "peach"
                }
            ]
        }
    ];
});