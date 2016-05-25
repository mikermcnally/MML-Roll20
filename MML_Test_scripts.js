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

function test_setup() {
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
        buttons: [MML.menuButtons.GmMenuMain],
        characters: [],
        characterIndex: 0
    };
    _.each(state.MML.players, function(player) {
        //Clear players' list of characters
        player.characters = [];
    });

    state.MML.characters = {};

    _.each(["actor", "target"], function(charName) {
        var character = createObj("character", {
            name: charName,
            "bio": "",
            "gmnotes": "",
            "_defaulttoken": "",
            "archived": false,
            "inplayerjournals": "",
            "controlledby": "",
            "avatar": ""
        });
        MML.createAttribute("player", state.MML.GM.player, "", character);
        MML.createAttribute("name", charName, "", character);
        MML.createAttribute("race", "Human", "", character);
        MML.createAttribute("gender", "Male", "", character);
        MML.createAttribute("statureRoll", 10, "", character);
        MML.createAttribute("strengthRoll", 10, "", character);
        MML.createAttribute("coordinationRoll", 10, "", character);
        MML.createAttribute("healthRoll", 10, "", character);
        MML.createAttribute("beautyRoll", 10, "", character);
        MML.createAttribute("intellectRoll", 20, "", character);
        MML.createAttribute("reasonRoll", 20, "", character);
        MML.createAttribute("creativityRoll", 10, "", character);
        MML.createAttribute("presenceRoll", 10, "", character);

        // console.log(character.id);
        // console.log(MML.getCharAttribute(charName, "race"));

        state.MML.characters[charName] = new MML.characterConstructor(charName);

        MML.processCommand({
            type: "character",
            who: charName,
            triggeredFunction: "updateCharacter",
            input: {
                attribute: "race"
            }
        });
    });
    // console.log(state.MML.players);
    // _.each(state.MML.characters, function(character) {
    //     console.log(character);
    //     state.MML.players[character.player].characters.push(charName);
    // });
}

test_setup();

console.log(state.MML.characters);

// {
//     "name": "test char",
//     "bio": "",
//     "gmnotes": "",
//     "_defaulttoken": "",
//     "archived": false,
//     "inplayerjournals": "",
//     "controlledby": "",
//     "_id": "-KIYuApQVV8EbIPXb0fM",
//     "_type": "character",
//     "avatar": ""
// }

// {
//     "name": "test attribute",
//     "current": "current",
//     "max": "max",
//     "_id": "-KIYwCwVZsLqOAX5qlYR",
//     "_type": "attribute",
//     "_characterid": "-KIYwCwN5jX9WESOdwEX"
// }