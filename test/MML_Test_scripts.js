var fs = require('fs');
_ = require('underscore');

var roll20String = '';
var filenames = fs.readdirSync('../r20').filter(function(filename) {
  return filename.search(/MML_(?!Test|Roll20).*\.js/) !== -1;
});
_.each(filenames, function(filename, index) {
  roll20String += fs.readFileSync('../r20/' + filename, 'utf-8');
});
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
on = function(event) {};
var expect = require('chai').expect;
var MML = require('../MML_Test.js').MML;

runTests();

function runTests() {
  describe('Combat', function() {
    this.timeout(150000);
    var player;

    beforeEach(function() {
      player = resetEnvironment();
      createTestCharacters(3);
      startTestCombat(player, _.pluck(MML.characters, 'name'));
    });

    it('Tested: Unarmed striking, observe without ranged weapon, basic combat flow, basic damage, multiple defenses', function() {
      setActionPunchAttack(player);
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Observe');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 2);
      setActionPunchAttack(player);
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 5);
      player.menuCommand(player.who, 'Take it');
      setTestRoll(player, 1);
      setTestRoll(player, 1);
      expect(MML.characters['test1'].hp.Head, 'punch action should do 1 damage').to.equal(MML.characters['test1'].hpMax.Head - 1);
      expect(MML.characters['test1'].hp['Multiple Wounds'], 'punch action should do 1 damage').to.equal(MML.characters['test1'].hpMax['Multiple Wounds'] - 1);
      expect(MML.characters['test1'].knockdown, 'punch action should do 1 knockdown').to.equal(MML.characters['test1'].knockdownMax - 1);
      expect(MML.characters['test0'].spentInitiative, 'punch action should cost 25 initiative').to.equal(-25);
      expect(MML.characters['test0'].statusEffects, 'punch action should create "Melee This Round" status effect for attacker').to.have.property("Melee This Round");
      expect(MML.characters['test1'].statusEffects, 'forgoing defense should not create "Melee This Round" status effect for defender').not.to.have.property("Melee This Round");
      expect(MML.characters['test1'].statusEffects, 'forgoing defense should not create "Number of Defenses" status effect for defender').not.to.have.property("Number of Defenses");
      expect(MML.characters['test1'].statusEffects, 'forgoing defense should create "Damaged This Round" status effect for defender').not.to.have.property("Damaged This Round");

      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      expect(MML.characters['test1'].statusEffects, 'observe action should create "Observe" status effect').to.have.property("Observe");

      player.menuCommand(player.who, 'End Action');
      expect(MML.characters['test1'].perceptionCheckMod, '"Observe" status effect should add 4 to perceptionCheckMod').to.equal(4);
      expect(MML.characters['test1'].rangedDefenseMod, '"Observe" status effect should add -10 to rangedDefenseMod').to.equal(-10);
      expect(MML.characters['test1'].meleeDefenseMod, '"Observe" status effect should add -10 to meleeDefenseMod').to.equal(-10);

      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      expect(MML.characters['test1'].statusEffects, 'observer should still have "Observe" status effect').to.have.property("Observe");
      expect(MML.characters['test1'].statusEffects, 'observe action should not create "Melee This Round" status effect').not.to.have.property("Melee This Round");
      expect(state.MML.GM.currentRound, 'currentRound should be incremented').to.equal(2);
      expect(MML.characters['test0'].roundsExertion, 'punch action should add to roundsExertion').to.equal(1);
      expect(MML.characters['test1'].roundsExertion, 'forgoing defense should not add to roundsExertion').to.equal(0);

      player.menuCommand(player.who, 'Attack');
      player.menuCommand(player.who, 'Punch');
      player.menuCommand(player.who, 'None');
      player.menuCommand(player.who, 'Neutral');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Observe');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.who, 'Attack');
      player.menuCommand(player.who, 'Punch');
      player.menuCommand(player.who, 'None');
      player.menuCommand(player.who, 'Neutral');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 9);
      expect(MML.characters['test1'].statusEffects, 'observer should still have "Observe" status effect').to.have.property("Observe");
      expect(MML.characters['test1'].situationalInitBonus, '"Observe" status effect should add 5 to situationalInitBonus').to.equal(5);
      expect(MML.characters['test1'].rangedDefenseMod, '"Observe" status effect should not add 10 to missileAttackMod when not wielding ranged weapon').to.equal(0);

      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 5);
      expect(MML.characters['test1'].statusEffects, 'observer should not lose "Observe" status effect from previous round after being attacked').to.have.property("Observe");
      expect(MML.characters['test1'].situationalInitBonus, '"Observe" status effect should add 5 to situationalInitBonus').to.equal(5);

      player.menuCommand(player.who, 'Block: 16%');
      setTestRoll(player, 5);
      expect(MML.characters['test1'].statusEffects, 'blocking should create "Melee This Round" status effect for defender').to.have.property("Melee This Round");
      expect(MML.characters['test1'].statusEffects, 'blocking should create "Number of Defenses" status effect for defender').to.have.property("Number of Defenses");
      expect(MML.characters['test1'].statusEffects["Number of Defenses"].number, 'blocking should add 1 to "Number of Defenses" status effect for defender').to.equal(1);
      expect(MML.characters['test1'].rangedDefenseMod, '"Number of Defenses" status effect should add -20 to rangedDefenseMod').to.equal(-20);
      expect(MML.characters['test1'].meleeDefenseMod, '"Number of Defenses" status effect should add -20 to meleeDefenseMod').to.equal(-20);
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test2",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 5);
      player.menuCommand(player.who, 'Block: -4%');
      setTestRoll(player, 5);
      setTestRoll(player, 1);
      setTestRoll(player, 1);
      expect(MML.characters['test1'].statusEffects["Number of Defenses"].number, 'blocking should add 1 to "Number of Defenses" status effect for defender').to.equal(2);
      expect(MML.characters['test1'].rangedDefenseMod, '2 defenses should add -40 to rangedDefenseMod').to.equal(-40);
      expect(MML.characters['test1'].meleeDefenseMod, '2 defenses should add -40 to meleeDefenseMod').to.equal(-40);
      expect(MML.characters['test1'].hp.Head, 'damage should accumlate').to.equal(MML.characters['test1'].hpMax.Head - 2);
      expect(MML.characters['test1'].hp['Multiple Wounds'], 'damage should accumlate').to.equal(MML.characters['test1'].hpMax['Multiple Wounds'] - 2);
      expect(MML.characters['test1'].knockdown, 'knockdown should only consider damage from this round').to.equal(MML.characters['test1'].knockdownMax - 1);
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'End Action');
      expect(MML.characters['test1'].statusEffects, 'new rounds should remove "Number of Defenses" status effect for defender').not.to.have.property("Number of Defenses");
      expect(MML.characters['test1'].rangedDefenseMod, 'new rounds should remove "Number of Defenses" status effect -40 penalty to rangedDefenseMod').to.equal(0);
      expect(MML.characters['test1'].meleeDefenseMod, 'new rounds should remove "Number of Defenses" status effect -40 penalty to meleeDefenseMod').to.equal(0);
      expect(MML.characters['test1'].hp.Head, 'damage should accumlate').to.equal(MML.characters['test1'].hpMax.Head - 2);
      expect(MML.characters['test1'].hp['Multiple Wounds'], 'damage should accumlate').to.equal(MML.characters['test1'].hpMax['Multiple Wounds'] - 2);
      expect(MML.characters['test1'].knockdown, 'knockdown should only consider damage from this round').to.equal(MML.characters['test1'].knockdownMax);
      expect(state.MML.GM.currentRound, 'currentRound should be incremented').to.equal(3);
    });

    it.only('Tested: Ready Item, Melee Attack, Melee Dodge', function() {
      var item = MML.items['Hand Axe'];
      item.quality = 'Standard';
      item._id = 'axe';
      MML.characters['test0'].inventory['axe'] = item;
      MML.characters['test1'].inventory['axe'] = item;
      player.menuCommand(player.who, 'Ready Item');
      player.menuCommand(player.who, 'Hand Axe');
      player.menuCommand(player.who, 'Right');
      player.menuCommand(player.who, 'Next Menu');
      player.menuCommand(player.who, 'Attack');
      expect(_.pluck(player.buttons, 'text'), 'Aim should not be an option for character without missile weapon').not.to.contain('Aim');
      expect(_.pluck(player.buttons, 'text'), 'Shoot From Cover should not be an option for unarmed character').not.to.contain('Shoot From Cover');

      player.menuCommand(player.who, 'Standard');
      player.menuCommand(player.who, 'None');
      player.menuCommand(player.who, 'Neutral');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Ready Item');
      player.menuCommand(player.who, 'Hand Axe');
      player.menuCommand(player.who, 'Right');
      player.menuCommand(player.who, 'Next Menu');
      setActionStandardAttack(player);
      setTestRoll(player, 9);
      player.menuCommand(player.who, 'Observe');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      expect(MML.characters['test0'].initiative).to.equal(21);
      expect(MML.characters['test0'].initiativeRollValue, 'initiativeRollValue should equal 10').to.equal(10);
      expect(MML.characters['test0'].situationalInitBonus, '"Ready Item" status effect should add -10 to situationalInitBonus').to.equal(-10);
      expect(MML.characters['test0'].movementRatioInitBonus, 'movementRatioInitBonus should be 5 for unencumbered').to.equal(5);
      expect(MML.characters['test0'].attributeInitBonus, 'attributeInitBonus should be 0 for character with 10 for all attributes').to.equal(0);
      expect(MML.characters['test0'].senseInitBonus, 'senseInitBonus should be 4 for character w/o headgear').to.equal(4);
      expect(MML.characters['test0'].fomInitBonus,'fomInitBonus should be 6 for character w/o armor').to.equal(6);
      expect(MML.characters['test0'].firstActionInitBonus, 'firstActionInitBonus should be 6 for character attacking with hand axe').to.equal(6);
      expect(MML.characters['test0'].spentInitiative, 'spentInitiative should be 0 for character who has not acted').to.equal(0);
      expect(MML.characters['test0'].actionTempo, 'actionTempo should be -25 for unskilled character').to.equal(-25);
      expect(MML.characters['test0'].statusEffects, '"Ready Item" action should add "Ready Item" status effect').to.have.property("Ready Item");
      expect(MML.characters['test2'].firstActionInitBonus, 'firstActionInitBonus should be 10 for character observing').to.equal(10);
      expect(MML.characters['test0'].rightHand._id, 'ready item should not take effect until action starts').to.equal('emptyHand');
      expect(MML.characters['test0'].leftHand._id, 'ready item should not take effect until action starts').to.equal('emptyHand');
      expect(MML.characters['test1'].rightHand._id, 'ready item should not take effect until action starts').to.equal('emptyHand');
      expect(MML.characters['test1'].leftHand._id, 'ready item should not take effect until action starts').to.equal('emptyHand');

      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'End Action');
      player.menuCommand(player.who, 'Observe');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      expect(MML.characters['test0'].rightHand._id, 'ready item should only update selected hand').to.equal('axe');
      expect(MML.characters['test0'].rightHand.grip, 'right hand grip should be "One Hand"').to.equal('One Hand');
      expect(MML.characters['test0'].leftHand._id, 'ready item should only update selected hand').to.equal('emptyHand');

      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 5);
      expect(MML.characters['test1'].rightHand._id, 'ready item should not take effect until action starts').to.equal('emptyHand');
      expect(MML.characters['test1'].leftHand._id, 'ready item should not take effect until action starts').to.equal('emptyHand');
      expect(_.pluck(player.buttons, 'text'), 'Block should not be an option for unarmed character').not.to.contain('Block: 1%');

      player.menuCommand(player.who, 'Dodge: 0%');
      setTestRoll(player, 5);
      setTestRoll(player, 8);
      setTestRoll(player, 8);
      expect(MML.characters['test1'].statusEffects, 'dodging should create "Dodged This Round" status effect for defender').to.have.property("Dodged This Round");
      expect(MML.characters['test1'].statusEffects, 'dodging should create "Melee This Round" status effect for defender').to.have.property("Melee This Round");
      expect(MML.characters['test1'].statusEffects, 'dodging should create "Number of Defenses" status effect for defender').to.have.property("Number of Defenses");
      expect(MML.characters['test1'].statusEffects["Number of Defenses"].number, 'dodging should add 1 to "Number of Defenses" status effect for defender').to.equal(1);
      expect(MML.characters['test0'].spentInitiative, 'spentInitiative should be -25 for character who has acted with default actionTempo').to.equal(-25);

      player.menuCommand(player.who, 'Start Action');
      expect(MML.characters['test1'].action.name, 'dodging should prevent a character from doing anything but movement').to.equal('Movement Only');
      expect(MML.characters['test1'].action.callback, 'dodging should prevent a character from doing anything but movement').to.equal('endAction');

      player.menuCommand(player.who, 'End Movement');
      expect(MML.characters['test1'].rightHand._id, 'dodging should not prevent ready item').to.equal('axe');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'End Action');

      setActionStandardAttack(player);
      setTestRoll(player, 9);
      setActionStandardAttack(player);
      setTestRoll(player, 8);
      player.menuCommand(player.who, 'Observe');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'End Action');
      player.menuCommand(player.who, 'Observe');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test2",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 5);
      player.menuCommand(player.who, 'Take it');
      setTestRoll(player, 8);
      setTestRoll(player, 9);
      player.menuCommand(player.who, 'Roll Willpower');
      setTestRoll(player, 10);
      expect(MML.characters['test2'].statusEffects, 'successful willpower roll should not add "Major Wound" status effect').not.to.have.property("Major Wound, Right Arm");
      player.menuCommand(player.who, 'Attack');
      player.menuCommand(player.who, 'Standard');
      player.menuCommand(player.who, 'None');
      player.menuCommand(player.who, 'Neutral');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test1",
        "target": "test2",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 5);
      player.menuCommand(player.who, 'Take it');
      setTestRoll(player, 8);
      setTestRoll(player, 2);
      player.menuCommand(player.who, 'Roll Willpower');
      setTestRoll(player, 11);
      expect(MML.characters['test2'].statusEffects, 'successful willpower roll shoulod not add "Major Wound" status effect').to.have.property("Major Wound, Right Arm");
      expect(MML.characters['test2'].situationalInitBonus, '"Major Wound" status effect should add -5 to situationalInitBonus').to.equal(-5);
      expect(MML.characters['test2'].situationalMod, '"Major Wound" status effect should add -10 to situationalMod').to.equal(-10);
      expect(MML.characters['test2'].statusEffects["Major Wound, Right Arm"].duration, '"Major Wound" status effect duration should equal damage taken beyond half HP').to.equal(2);
      expect(MML.characters['test2'].statusEffects["Major Wound, Right Arm"].startingRound, '"Major Wound" status effect starting round should equal current round').to.equal(2);
      player.menuCommand(player.who, 'Attack');
      player.menuCommand(player.who, 'Standard');
      player.menuCommand(player.who, 'None');
      player.menuCommand(player.who, 'Neutral');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
    });
  });
}

function setTestRoll(player, value) {
  player.changeRoll(value);
  player.currentRoll.accepted = true;
  MML.characters[player.who][player.currentRoll.callback]();
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
    MML.createAttribute('repeating_weaponskills_1_name', 'Default Martial', "", character);
    MML.createAttribute('repeating_weaponskills_1_input', '1', "", character);
    MML.createAttribute('repeating_weaponskills_1_level', '1', "", character);
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
  player.menuCommand(player.who, 'Roll');
}

function setActionPunchAttack(player) {
  player.menuCommand(player.who, 'Attack');
  player.menuCommand(player.who, 'Punch');
  player.menuCommand(player.who, 'None');
  player.menuCommand(player.who, 'Neutral');
  player.menuCommand(player.who, 'Roll');
}
