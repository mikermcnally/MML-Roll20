_ = require('underscore');
roll20 = require('../Roll20 Emulation/Roll20');
state = roll20.state;
log = roll20.log;
sendChat = roll20.sendChat;
createObj = roll20.createObj;
getObj = roll20.getObj;
findObjs = roll20.findObjs;
filterObjs = roll20.filterObjs;
getAttrByName = roll20.getAttrByName;
randomInteger = roll20.randomInteger;
Campaign = roll20.Campaign;
on = function(event) {};
var expect = require('chai').expect;
var MML = require('../MML_Test.js').MML;

function runTests() {
  describe('Character', function() {
    describe('Constructor', function() {
      it('should create a character', function() {
        Campaign().playerpageid = 'test';
        var player = new MML.Player('Robot', true);
        MML.players = {'Robot': player };
        state.MML = {};
        state.MML.GM = {
          player: player,
          name: 'Robot',
          currentAction: {},
          inCombat: false,
          currentRound: 0,
          roundStarted: false
        };
        MML.characters = {};
        var character;
        for (var i = 0; i < 2; i++) {
          character = createObj("character", {
            name: 'test' + i,
            "bio": "",
            "gmnotes": "",
            "_defaulttoken": "",
            "archived": false,
            "inplayerjournals": "",
            "controlledby": "",
            "avatar": ""
          });
          MML.createAttribute("player", 'Robot', "", character);
          MML.createAttribute("name", 'test', "", character);
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
          MML.createAttribute("fomInitBonus", 6, "", character);
          MML.createAttribute("rightHand", JSON.stringify({
            _id: "emptyHand"
          }), "", character);
          MML.createAttribute("leftHand", JSON.stringify({
            _id: "emptyHand"
          }), "", character);
          MML.characters['test' + i] = new MML.Character('test' + i, character.id);
          createObj("graphic", {
            name: 'test' + i,
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            represents: character.id,
            tint_color: 'transparent'
          });
        }

        MML.startCombat(['test0', 'test1']);
        player.menuCommand('test0', 'Start Round', []);
      });
    });
  });
}
runTests();
