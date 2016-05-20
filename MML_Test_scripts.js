_ = require('underscore');
var roll20 = require('../Roll20 Emulation/Roll20');

state = roll20.state;
log = roll20.log;
sendChat = roll20.sendChat;
createObj = roll20.createObj;
getObj = roll20.getObj;
findObj = roll20.findObj;
randomInteger = roll20.randomInteger;
Campaign = roll20.Campaign;
on = function(event) {};

var MML = require('./MML_test').MML;

var test_characters = {
    "Remmy Denkin": {
        "name": "Remmy Denkin",
        "player": "Robot",
        "race": "Human",
        "bodyType": "humanoid",
        "gender": "Male",
        "height": "5'10",
        "weight": 165,
        "handedness": "",
        "stature": 24,
        "strength": 12,
        "coordination": 14,
        "health": 9,
        "beauty": 8,
        "intellect": 7,
        "reason": 16,
        "creativity": 10,
        "presence": 6,
        "willpower": 7,
        "evocation": 49,
        "perception": 11,
        "systemStrength": 8,
        "fitness": 11,
        "fitnessMod": 2.6,
        "load": 62,
        "overhead": 124,
        "deadLift": 248,
        "multiWoundMax": 20,
        "multiWound": 20,
        "headHPMax": 9,
        "headHP": 9,
        "chestHPMax": 12,
        "chestHP": 12,
        "abdomenHPMax": 17,
        "abdomenHP": 17,
        "leftArmHPMax": 17,
        "leftArmHP": 17,
        "rightArmHPMax": 17,
        "rightArmHP": 17,
        "leftLegHPMax": 17,
        "leftLegHP": 17,
        "rightLegHPMax": 17,
        "rightLegHP": 17,
        "epMax": 49,
        "ep": 49,
        "fatigueMax": 11,
        "fatigue": 11,
        "hpRecovery": 0.5,
        "epRecovery": 2,
        "inventory": {
            "-KERfJsqEUIMaif8MCcT": {
                "name": "Cudgel, Light",
                "type": "weapon",
                "weight": 3,
                "grips": {
                    "One Hand": {
                        "family": "Bludgeoning",
                        "hands": 1,
                        "primaryType": "Impact",
                        "primaryTask": 45,
                        "primaryDamage": "2d10",
                        "secondaryType": "",
                        "secondaryTask": 0,
                        "secondaryDamage": "",
                        "defense": 15,
                        "initiative": 6,
                        "rank": 1
                    }
                },
                "quality": "Standard"
            }
        },
        "totalWeightCarried": 3,
        "knockdownMax": 24,
        "knockdown": 0,
        "apv": [{
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }],
        "leftHand": {
            "_id": "-KERfJsqEUIMaif8MCcT",
            "grip": "One Hand"
        },
        "rightHand": {
            "_id": "-KERfJsqEUIMaif8MCcT",
            "grip": "One Hand"
        },
        "hitTable": "[null,1,1,2,3,3,4,4,5,5,6,7,8,8,8,8,9,9,9,9,10,10,11,11,11,11,12,12,13,13,13,13,14,14,14,15,15,16,16,17,17,17,18,18,19,19,19,19,20,20,21,21,21,22,22,23,23,23,24,24,25,25,26,26,27,27,27,28,28,29,29,29,30,30,31,31,32,32,33,34,34,35,35,35,36,36,36,37,37,38,38,39,39,40,40,41,42,43,44,45,46]",
        "movementRatio": 4,
        "movementAvailable": 4,
        "movementPosition": "",
        "situationalMod": 0,
        "attributeDefenseMod": 6,
        "meleeDefenseMod": -10,
        "missileDefenseMod": -10,
        "meleeAttackMod": -10,
        "missileAttackMod": -10,
        "attributeMeleeAttackMod": 6,
        "meleeDamageMod": 0,
        "attributeMissileAttackMod": 6,
        "attributeCastingMod": -20,
        "spellLearningMod": -5,
        "statureCheckMod": 0,
        "strengthCheckMod": 0,
        "coordinationCheckMod": 0,
        "healthCheckMod": 0,
        "beautyCheckMod": 0,
        "intellectCheckMod": 0,
        "reasonCheckMod": 0,
        "creativityCheckMod": 0,
        "presenceCheckMod": 0,
        "willpowerCheckMod": 0,
        "evocationCheckMod": 0,
        "perceptionCheckMod": 0,
        "systemStrengthCheckMod": 0,
        "fitnessCheckMod": 0,
        "statusEffects": {},
        "initiative": 13,
        "initiativeRoll": 3,
        "situationalInitBonus": -5,
        "movementRatioInitBonus": 5,
        "attributeInitBonus": 0,
        "senseInitBonus": 4,
        "fomInitBonus": 0,
        "firstActionInitBonus": 6,
        "spentInitiative": 0,
        "actionTempo": -12,
        "ready": true,
        "action": {
            "name": "Attack",
            "getTargets": "getSingleTarget",
            "triggeredFunction": "startAttackAction",
            "modifiers": [],
            "initBonus": 6
        },
        "defensesThisRound": 0,
        "dodgedThisRound": false,
        "meleeThisRound": false,
        "fatigueLevel": 0,
        "roundsRest": 0,
        "roundsExertion": 0,
        "damagedThisRound": false,
        "skills": {
            "Dancing": {
                "level": 0,
                "input": 0,
                "_id": "-KE9K8MdHDvVQkRnd7N9"
            },
            "Acrobatics": {
                "level": 49,
                "input": 46,
                "_id": "-KE9KtWNxzOg7JzWYZqW"
            },
            "Acting": {
                "level": -10,
                "input": 0,
                "_id": "-KE9LACTqa5zsEy7i9Tv"
            }
        },
        "weaponSkills": {
            "Default Martial": {
                "level": 12,
                "input": 0,
                "_id": "-KE9I4lvA4HHTPIaWJB7"
            },
            "Cudgel, Light": {
                "level": 24,
                "input": 24,
                "_id": "-KE9IFePeY9M0ymMKF1s"
            }
        }
    },
    "Thaddeus Clinch": {
        "name": "Thaddeus Clinch",
        "player": "Robot",
        "race": "Human",
        "bodyType": "humanoid",
        "gender": "Male",
        "height": "5'7",
        "weight": 150,
        "handedness": "",
        "stature": 22,
        "strength": 20,
        "coordination": 15,
        "health": 19,
        "beauty": 18,
        "intellect": 7,
        "reason": 7,
        "creativity": 13,
        "presence": 15,
        "willpower": 16,
        "evocation": 62,
        "perception": 9,
        "systemStrength": 18,
        "fitness": 20,
        "fitnessMod": 4,
        "load": 88,
        "overhead": 176,
        "deadLift": 352,
        "multiWoundMax": 29,
        "multiWound": 29,
        "headHPMax": 13,
        "headHP": 13,
        "chestHPMax": 16,
        "chestHP": 16,
        "abdomenHPMax": 21,
        "abdomenHP": 21,
        "leftArmHPMax": 21,
        "leftArmHP": 21,
        "rightArmHPMax": 21,
        "rightArmHP": 21,
        "leftLegHPMax": 21,
        "leftLegHP": 21,
        "rightLegHPMax": 21,
        "rightLegHP": 21,
        "epMax": 62,
        "ep": 62,
        "fatigueMax": 20,
        "fatigue": 20,
        "hpRecovery": 4,
        "epRecovery": 8,
        "inventory": {
            "-KEReXqw39IqL83Kf1oc": {
                "name": "Shovel",
                "type": "weapon",
                "weight": 6,
                "grips": {
                    "Two Hands": {
                        "family": "Bludgeoning",
                        "hands": 2,
                        "primaryType": "Impact",
                        "primaryTask": 35,
                        "primaryDamage": "1d8",
                        "secondaryType": "",
                        "secondaryTask": 0,
                        "secondaryDamage": "",
                        "defense": 15,
                        "initiative": 4,
                        "rank": 1
                    }
                },
                "quality": "Standard"
            }
        },
        "totalWeightCarried": 6,
        "knockdownMax": 23,
        "knockdown": 0,
        "apv": [{
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }, {
            "Surface": [{
                "value": null,
                "coverage": 100
            }],
            "Cut": [{
                "value": null,
                "coverage": 100
            }],
            "Chop": [{
                "value": null,
                "coverage": 100
            }],
            "Pierce": [{
                "value": null,
                "coverage": 100
            }],
            "Thrust": [{
                "value": null,
                "coverage": 100
            }],
            "Impact": [{
                "value": null,
                "coverage": 100
            }],
            "Flanged": [{
                "value": null,
                "coverage": 100
            }]
        }],
        "leftHand": {
            "_id": "-KEReXqw39IqL83Kf1oc",
            "grip": "Two Hands"
        },
        "rightHand": {
            "_id": "-KEReXqw39IqL83Kf1oc",
            "grip": "Two Hands"
        },
        "hitTable": "[null,1,1,2,3,3,4,4,5,5,6,7,8,8,8,8,9,9,9,9,10,10,11,11,11,11,12,12,13,13,13,13,14,14,14,15,15,16,16,17,17,17,18,18,19,19,19,19,20,20,21,21,21,22,22,23,23,23,24,24,25,25,26,26,27,27,27,28,28,29,29,29,30,30,31,31,32,32,33,34,34,35,35,35,36,36,36,37,37,38,38,39,39,40,40,41,42,43,44,45,46]",
        "movementRatio": 4,
        "movementAvailable": 4,
        "movementPosition": "",
        "situationalMod": 0,
        "attributeDefenseMod": 13,
        "meleeDefenseMod": 0,
        "missileDefenseMod": 0,
        "meleeAttackMod": 0,
        "missileAttackMod": 0,
        "attributeMeleeAttackMod": 13,
        "meleeDamageMod": 2,
        "attributeMissileAttackMod": 3,
        "attributeCastingMod": -30,
        "spellLearningMod": -5,
        "statureCheckMod": 0,
        "strengthCheckMod": 0,
        "coordinationCheckMod": 0,
        "healthCheckMod": 0,
        "beautyCheckMod": 0,
        "intellectCheckMod": 0,
        "reasonCheckMod": 0,
        "creativityCheckMod": 0,
        "presenceCheckMod": 0,
        "willpowerCheckMod": 0,
        "evocationCheckMod": 0,
        "perceptionCheckMod": 0,
        "systemStrengthCheckMod": 0,
        "fitnessCheckMod": 0,
        "statusEffects": {},
        "initiative": 15,
        "initiativeRoll": 3,
        "situationalInitBonus": 0,
        "movementRatioInitBonus": 5,
        "attributeInitBonus": -1,
        "senseInitBonus": 4,
        "fomInitBonus": 0,
        "firstActionInitBonus": 4,
        "spentInitiative": 0,
        "actionTempo": -12,
        "ready": true,
        "action": {
            "name": "Attack",
            "getTargets": "getSingleTarget",
            "triggeredFunction": "startAttackAction",
            "modifiers": [],
            "initBonus": 4
        },
        "defensesThisRound": 0,
        "dodgedThisRound": false,
        "meleeThisRound": false,
        "fatigueLevel": 0,
        "roundsRest": 0,
        "roundsExertion": 0,
        "damagedThisRound": false,
        "skills": {},
        "weaponSkills": {
            "Default Martial": {
                "level": 18,
                "input": 0,
                "_id": "-KEJQeZ75T2vH0BYsm2h"
            },
            "Mace": {
                "level": 36,
                "input": 36,
                "_id": "-KEJQvt3y5aHhJSJN-5J"
            }
        }
    }
}

_.each(MML, function(thing) {
    console.log(thing);
});