app.factory('selectData', function () {
    return {
        "transportation": "hot-air-balloon"
    }
});

app.factory('selectField', function () {
    return {
        "key": "transportation",
        "type": "select",
        "label": "How do you get around in the city",
        "options": [
            {
                "name": "Car",
                "value": "car",
                "group": "inefficiently"
            },
            {
                "name": "Helicopter",
                "value": "helicopter",
                "group": "inefficiently"
            },
            {
                "name": "Sport Utility Vehicle",
                "value": "sport-utility-vehicle",
                "group": "inefficiently"
            },
            {
                "name": "Bicycle",
                "value": "bicycle",
                "group": "efficiently"
            },
            {
                "name": "Skateboard",
                "value": "skateboard",
                "group": "efficiently"
            },
            {
                "name": "Walk",
                "value": "walk",
                "group": "efficiently"
            },
            {
                "name": "Bus",
                "value": "bus",
                "group": "efficiently"
            },
            {
                "name": "Scooter",
                "value": "scooter",
                "group": "efficiently"
            },
            {
                "name": "Train",
                "value": "train",
                "group": "efficiently"
            },
            {
                "name": "Hot Air Balloon",
                "value": "hot-air-balloon",
                "group": "efficiently"
            }
        ]
    };
});

