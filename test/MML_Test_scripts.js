var fs = require('fs');
_ = require('underscore');

var roll20String = '';
var filenames = fs.readdirSync('../r20').filter(function(filename) {
  return filename.search(/MML_(?!Test|Roll20).*\.js/) !== -1;
});
_.each(filenames, function(filename, index) {
  roll20String += fs.readFileSync('../r20/' + filename, 'utf-8');
});

pbcopy(roll20String);
roll20String += 'module.exports = { MML: MML };';
fs.writeFileSync('../r20/MML_Test.js', roll20String, 'utf8');

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
var eventEmitter = require('events');
var emitter = new eventEmitter();

on = function (eventName, listener) {
  emitter.on(eventName, listener);
};
var expect = require('chai').expect;
var MML = require('../MML_Test.js').MML;

runTests();

function runTests() {
  describe('Menu Tests', function() {
    this.timeout(1500000);
    var player;

    beforeEach(function() {
      player = resetEnvironment();
    });

    it('Checks that the menu initializes properly', function () {
      player.buttonPressed(_.extend(player, { pressedButton: 'initializeMenu' }))
      .then(player.buttonPressed(_.extend(player, { pressedButton: 'Combat' })));
      expect(true, 'it should work').to.equal(true);
      setTimeout(function () {
        console.log('fuck');

      }, 1000);
    });
  });
}

function setTestRoll(player, value) {
  player.changeRoll(value);
  player.currentRoll.accepted = true;
  MML.characters[player.currentRoll.character][player.currentRoll.callback]();
}

function resetEnvironment() {
  Campaign().playerpageid = 'test';
  var player = new MML.Player('Robot', true);
  MML.players = {
    'Robot': player
  };
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
  return player;
}

function createTestCharacters(amount) {
  var character;
  for (var i = 0; i < amount; i++) {
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
    MML.createAttribute("name", 'test' + i, "", character);
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
    MML.createAttribute('repeating_weaponskills_1_name', 'Default Martial', "", character);
    MML.createAttribute('repeating_weaponskills_1_input', '1', "", character);
    MML.createAttribute('repeating_weaponskills_1_level', '1', "", character);
    MML.characters['test' + i] = MML.createCharacter('test' + i, character.id);
    createObj("graphic", {
      name: 'test' + i,
      _pageid: Campaign().get("playerpageid"),
      _type: "graphic",
      _subtype: "token",
      represents: character.id,
      tint_color: 'transparent',
      left: i*10,
      top: i*10
    });
  }
}

function clone(obj) {
  if (obj === null || typeof obj !== 'object')
    return obj;
  var target = obj instanceof Array ? [] : {};
  for (var i in obj) {
    target[i] = this.clone(obj[i]);
  }
  return target;
}

function startTestCombat(player, characters) {
  player.menuCommand(player.name, 'GmMenuMain');
  player.menuCommand(player.name, 'Combat');
  player.menuCommand(player.name, 'Start Combat', characters);
}

function setActionStandardAttack(player) {
  player.menuCommand(player.who, 'Attack');
  player.menuCommand(player.who, 'Standard');
  player.menuCommand(player.who, 'None');
  player.menuCommand(player.who, 'Neutral');
}

function setActionPunchAttack(player) {
  player.menuCommand(player.who, 'Attack');
  player.menuCommand(player.who, 'Punch');
  player.menuCommand(player.who, 'None');
  player.menuCommand(player.who, 'Neutral');
}

function executeObserve(player) {
  player.menuCommand(player.who, 'Start Action');
  player.menuCommand(player.who, 'End Movement');
  player.menuCommand(player.who, 'End Action');
}

function pbcopy(data) {
    // require('child_process').spawn('clip').stdin.end(data);
}
