_ = require('underscore');
roll20 = require('../Roll20 Emulation/Roll20');

state = roll20.state;
log = roll20.log;
sendChat = roll20.sendChat;
createObj = roll20.createObj;
getObj = roll20.getObj;
findObjs = roll20.findObj;
randomInteger = roll20.randomInteger;
Campaign = roll20.Campaign;
on = function(event) {};

var MML = require('./MML_test').MML;

function test_setup(){
    state.MML = {};
    state.MML.GM = state.MML.GM || {
        player: "Robot",
        name: "GM",
        currentAction: {},
        inCombat: false,
        currentRound: 0,
        roundStarted: false
    };

    state.MML.players = {};
    state.MML.players["Robot"] = {
        name: "Robot",
        who: "GM",
        menu: "GmMenuMain",
        buttons:[MML.menuButtons.GmMenuMain],
        characters: [],
        characterIndex: 0
    };
    _.each(state.MML.players, function(player){
        //Clear players' list of characters
        player.characters = [];
    });

    var characterObjects = [];

    _.each(["actor", "target"], function(charName){
        var character = createObj("character", { name: charName, archived: false });
        MML.createAttribute("player", state.MML.GM.player, "", character);
        MML.createAttribute("name", charName, "", character);
        MML.createAttribute("race", "Human", "", character);
        MML.createAttribute("gender", "Male", "", character);
        MML.createAttribute("statureRoll", 10, "", character);
        MML.createAttribute("strengthRoll", 10, "", character);
        MML.createAttribute("coordinationRoll", 10, "", character);
        MML.createAttribute("healthRoll", 10, "", character);
        MML.createAttribute("beautyRoll", 10, "", character);
        MML.createAttribute("intellectRoll", 10, "", character);
        MML.createAttribute("reasonRoll", 10, "", character);
        MML.createAttribute("creativityRoll", 10, "", character);
        MML.createAttribute("presenceRoll", 10, "", character);

        state.MML.characters[charName] = new MML.characterConstructor(charName);

        // MML.processCommand({
        //     type: "character",
        //     who: charName,
        //     triggeredFunction:"updateCharacter",
        //     input: {
        //         attribute: "race"
        //     }
        // });
    });

    // _.each(characterObjects, function(character){
    //     var charName = character.get("name");
    //     characters[charName] = new MML.characterConstructor(charName);
    //     //Add to player's list of characters
    //     state.MML.players[characters[charName].player].characters.push(charName);
    //     state.MML.characters[charName] = character;
    // });
}

test_setup();

console.log(state.MML.characters);

// var characters = {
//         "Remmy Denkin": {
//             "name": "Remmy Denkin",
//             "player": "Robot",
//             "race": "Human",
//             "gender": "Male",
//             "handedness": "",
//             "stature": 24,
//             "strength": 12,
//             "coordination": 14,
//             "health": 9,
//             "beauty": 8,
//             "intellect": 7,
//             "reason": 16,
//             "creativity": 10,
//             "presence": 6,
//             "inventory": {
//                 "-KERfJsqEUIMaif8MCcT": {
//                     "name": "Cudgel, Light",
//                     "type": "weapon",
//                     "weight": 3,
//                     "grips": {
//                         "One Hand": {
//                             "family": "Bludgeoning",
//                             "hands": 1,
//                             "primaryType": "Impact",
//                             "primaryTask": 45,
//                             "primaryDamage": "2d10",
//                             "secondaryType": "",
//                             "secondaryTask": 0,
//                             "secondaryDamage": "",
//                             "defense": 15,
//                             "initiative": 6,
//                             "rank": 1
//                         }
//                     },
//                     "quality": "Standard"
//                 }
//             },
//             "leftHand": {
//                 "_id": "-KERfJsqEUIMaif8MCcT",
//                 "grip": "One Hand"
//             },
//             "rightHand": {
//                 "_id": "",
//                 "grip": ""
//             },
//             "fomInitBonus": 0,
//             "skills": {
//                 "Dancing": {
//                     "level": 0,
//                     "input": 0,
//                     "_id": "-KE9K8MdHDvVQkRnd7N9"
//                 },
//                 "Acrobatics": {
//                     "level": 49,
//                     "input": 46,
//                     "_id": "-KE9KtWNxzOg7JzWYZqW"
//                 },
//                 "Acting": {
//                     "level": -10,
//                     "input": 0,
//                     "_id": "-KE9LACTqa5zsEy7i9Tv"
//                 }
//             },
//             "weaponSkills": {
//                 "Default Martial": {
//                     "level": 12,
//                     "input": 0,
//                     "_id": "-KE9I4lvA4HHTPIaWJB7"
//                 },
//                 "Cudgel, Light": {
//                     "level": 24,
//                     "input": 24,
//                     "_id": "-KE9IFePeY9M0ymMKF1s"
//                 }
//             }
//         },
//         "Thaddeus Clinch": {
//             "name": "Thaddeus Clinch",
//             "player": "Robot",
//             "race": "Human",
//             "gender": "Male",
//             "handedness": "",
//             "stature": 22,
//             "strength": 20,
//             "coordination": 15,
//             "health": 19,
//             "beauty": 18,
//             "intellect": 7,
//             "reason": 7,
//             "creativity": 13,
//             "inventory": {
//                 "-KEReXqw39IqL83Kf1oc": {
//                     "name": "Shovel",
//                     "type": "weapon",
//                     "weight": 6,
//                     "grips": {
//                         "Two Hands": {
//                             "family": "Bludgeoning",
//                             "hands": 2,
//                             "primaryType": "Impact",
//                             "primaryTask": 35,
//                             "primaryDamage": "1d8",
//                             "secondaryType": "",
//                             "secondaryTask": 0,
//                             "secondaryDamage": "",
//                             "defense": 15,
//                             "initiative": 4,
//                             "rank": 1
//                         }
//                     },
//                     "quality": "Standard"
//                 }
//             },
//             "leftHand": {
//                 "_id": "-KEReXqw39IqL83Kf1oc",
//                 "grip": "Two Hands"
//             },
//             "rightHand": {
//                 "_id": "-KEReXqw39IqL83Kf1oc",
//                 "grip": "Two Hands"
//             },
//             "skills": {},
//             "weaponSkills": {
//                 "Default Martial": {
//                     "level": 18,
//                     "input": 0,
//                     "_id": "-KEJQeZ75T2vH0BYsm2h"
//                 },
//                 "Mace": {
//                     "level": 36,
//                     "input": 36,
//                     "_id": "-KEJQvt3y5aHhJSJN-5J"
//                 }
//             }
//         }
//     };