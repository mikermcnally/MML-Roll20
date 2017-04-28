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
    this.timeout(1500000);
    var player;

    // beforeEach(function() {
    //   player = resetEnvironment();
    //   createTestCharacters(3);
    //   startTestCombat(player, _.pluck(MML.characters, 'name'));
    // });
    //
    // afterEach(function () {
    //   var characters = findObjs({
    //     _type: "character"
    //   });
    //   _.each(characters, function (character) {
    //     character.remove();
    //   });
    // });

    it.only('proxy', function () {
      var p = new Proxy({}, {
  set: function(target, prop, value, receiver) {
    console.log('called: ' + prop + ' = ' + value);
    return true;
  }
});

p.a = 10;
    });

    it('Tested: Unarmed striking, observe without ranged weapon, basic combat flow, basic damage, multiple defenses', function() {
      setActionPunchAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Observe');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 2);
      player.menuCommand(player.who, 'Observe');
      player.menuCommand(player.who, 'Roll');
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

      setActionPunchAttack(player);
      player.menuCommand(player.who, 'Accept');
      executeObserve(player);
      expect(MML.characters['test1'].statusEffects, 'observe action should create "Observing" status effect').to.have.property("Observing");
      expect(MML.characters['test1'].perceptionCheckMod, '"Observing" status effect should add 4 to perceptionCheckMod').to.equal(4);
      expect(MML.characters['test1'].rangedDefenseMod, '"Observing" status effect should add -10 to rangedDefenseMod').to.equal(-10);
      expect(MML.characters['test1'].meleeDefenseMod, '"Observing" status effect should add -10 to meleeDefenseMod').to.equal(-10);
      expect(MML.characters['test1'].statusEffects, 'observe action should not create "Melee This Round" status effect').not.to.have.property("Melee This Round");

      executeObserve(player);
      player.menuCommand(player.who, 'Observe');
      player.menuCommand(player.who, 'Accept');
      executeObserve(player);
      player.menuCommand(player.who, 'Observe');
      player.menuCommand(player.who, 'Accept');
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
      expect(MML.characters['test1'].statusEffects, 'being attacked should remove "Observing" status effect').not.to.have.property("Observing");
      expect(MML.characters['test1'].hp.Head, 'damage should accumlate').to.equal(MML.characters['test1'].hpMax.Head - 2);
      expect(MML.characters['test1'].hp['Multiple Wounds'], 'damage should accumlate').to.equal(MML.characters['test1'].hpMax['Multiple Wounds'] - 2);
      expect(MML.characters['test1'].knockdown, 'knockdown should accumlate damage taken this round').to.equal(MML.characters['test1'].knockdownMax - 2);
      executeObserve(player);
      executeObserve(player);
      expect(MML.characters['test1'].statusEffects, 'observing previous round should add "Observed" status effect').to.have.property("Observed");
      expect(state.MML.GM.currentRound, 'currentRound should be incremented').to.equal(2);
      expect(MML.characters['test0'].roundsExertion, 'punch action should add to roundsExertion').to.equal(1);
      expect(MML.characters['test1'].roundsExertion, 'forgoing defense should not add to roundsExertion').to.equal(0);

      setActionPunchAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Observe');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 2);
      player.menuCommand(player.who, 'Observe');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      expect(MML.characters['test1'].statusEffects, 'observer should have "Observed" status effect').to.have.property("Observed");
      expect(MML.characters['test1'].situationalInitBonus, '"Observed" status effect should add 5 to situationalInitBonus').to.equal(5);
      expect(MML.characters['test1'].rangedDefenseMod, '"Observed" status effect should not add 10 to missileAttackMod when not wielding ranged weapon').to.equal(0);

      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 5);
      expect(MML.characters['test1'].statusEffects, 'observer should not lose "Observed" status effect from previous round after being attacked').to.have.property("Observed");
      expect(MML.characters['test1'].situationalInitBonus, '"Observed" status effect should add 5 to situationalInitBonus').to.equal(5);

      player.menuCommand(player.who, 'Block: 16%');
      setTestRoll(player, 5);
      expect(MML.characters['test1'].statusEffects, 'blocking should create "Melee This Round" status effect for defender').to.have.property("Melee This Round");
      expect(MML.characters['test1'].statusEffects, 'blocking should create "Number of Defenses" status effect for defender').to.have.property("Number of Defenses");
      expect(MML.characters['test1'].statusEffects["Number of Defenses"].number, 'blocking should add 1 to "Number of Defenses" status effect for defender').to.equal(1);
      expect(MML.characters['test1'].rangedDefenseMod, '"Number of Defenses" status effect should add -20 to rangedDefenseMod').to.equal(-20);
      expect(MML.characters['test1'].meleeDefenseMod, '"Number of Defenses" status effect should add -20 to meleeDefenseMod').to.equal(-20);
      setActionPunchAttack(player);
      player.menuCommand(player.who, 'Accept');
      executeObserve(player);
      player.menuCommand(player.who, 'Observe');
      player.menuCommand(player.who, 'Accept');
      executeObserve(player);
      player.menuCommand(player.who, 'Observe');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 5);
      player.menuCommand(player.who, 'Block: -14%');
      setTestRoll(player, 5);
      setTestRoll(player, 1);
      setTestRoll(player, 1);
      expect(MML.characters['test1'].statusEffects["Number of Defenses"].number, 'blocking should add 1 to "Number of Defenses" status effect for defender').to.equal(2);
      expect(MML.characters['test1'].rangedDefenseMod, '2 defenses should add -40 to rangedDefenseMod').to.equal(-40);
      expect(MML.characters['test1'].meleeDefenseMod, '2 defenses should add -40 to meleeDefenseMod').to.equal(-40);
      expect(MML.characters['test1'].hp.Head, 'damage should accumlate').to.equal(MML.characters['test1'].hpMax.Head - 3);
      expect(MML.characters['test1'].hp['Multiple Wounds'], 'damage should accumlate').to.equal(MML.characters['test1'].hpMax['Multiple Wounds'] - 3);
      expect(MML.characters['test1'].knockdown, 'knockdown should only consider damage from this round').to.equal(MML.characters['test1'].knockdownMax - 1);
      executeObserve(player);
      executeObserve(player);
      executeObserve(player);
      expect(MML.characters['test1'].statusEffects, 'new rounds should remove "Number of Defenses" status effect for defender').not.to.have.property("Number of Defenses");
      expect(MML.characters['test1'].rangedDefenseMod, 'new rounds should remove "Number of Defenses" status effect -40 penalty to rangedDefenseMod').to.equal(0);
      expect(MML.characters['test1'].meleeDefenseMod, 'new rounds should remove "Number of Defenses" status effect -40 penalty to meleeDefenseMod').to.equal(0);
      expect(MML.characters['test1'].hp.Head, 'damage should accumlate').to.equal(MML.characters['test1'].hpMax.Head - 3);
      expect(MML.characters['test1'].hp['Multiple Wounds'], 'damage should accumlate').to.equal(MML.characters['test1'].hpMax['Multiple Wounds'] - 3);
      expect(MML.characters['test1'].knockdown, 'knockdown should only consider damage from this round').to.equal(MML.characters['test1'].knockdownMax);
      expect(state.MML.GM.currentRound, 'currentRound should be incremented').to.equal(3);
    });

    it('Tested: Ready Item, Melee Attack, Melee Dodge, Major Wounds, Disabling Wounds, Mortal Wounds, Fatigue, Fatigue Recovery, Stun, Disarming from Disabling Wound', function() {
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
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 9);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      expect(MML.characters['test0'].initiative).to.equal(21);
      expect(MML.characters['test0'].initiativeRollValue, 'initiativeRollValue should equal 10').to.equal(10);
      expect(MML.characters['test0'].situationalInitBonus, '"Ready Item" status effect should add -10 to situationalInitBonus').to.equal(-10);
      expect(MML.characters['test0'].movementRatioInitBonus, 'movementRatioInitBonus should be 5 for unencumbered').to.equal(5);
      expect(MML.characters['test0'].attributeInitBonus, 'attributeInitBonus should be 0 for character with 10 for all attributes').to.equal(0);
      expect(MML.characters['test0'].senseInitBonus, 'senseInitBonus should be 4 for character w/o headgear').to.equal(4);
      expect(MML.characters['test0'].fomInitBonus, 'fomInitBonus should be 6 for character w/o armor').to.equal(6);
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
      player.menuCommand(player.who, 'Movement Only');
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

      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 9);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 8);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Movement Only');
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
      setActionStandardAttack(player);
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
      expect(MML.characters['test2'].statusEffects, 'successful willpower roll should not add "Major Wound" status effect').to.have.property("Major Wound, Right Arm");
      expect(MML.characters['test2'].situationalInitBonus, '"Major Wound" status effect should add -5 to situationalInitBonus').to.equal(-5);
      expect(MML.characters['test2'].situationalMod, '"Major Wound" status effect should add -10 to situationalMod').to.equal(-10);
      expect(MML.characters['test2'].statusEffects["Major Wound, Right Arm"].duration, '"Major Wound" status effect duration should equal damage taken beyond half HP').to.equal(2);
      expect(MML.characters['test2'].statusEffects["Major Wound, Right Arm"].startingRound, '"Major Wound" status effect starting round should equal current round').to.equal(2);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
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
      setTestRoll(player, 1);
      player.menuCommand(player.who, 'Roll Willpower');
      setTestRoll(player, 10);
      expect(MML.characters['test2'].statusEffects["Major Wound, Right Arm"].duration, 'successful willpower save should not add to duration of "Major Wound" status effect').to.equal(2);
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
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
      setTestRoll(player, 1);
      player.menuCommand(player.who, 'Roll Willpower');
      setTestRoll(player, 11);
      expect(MML.characters['test2'].statusEffects["Major Wound, Right Arm"].duration, 'failing willpower save should add to duration of "Major Wound" status effect').to.equal(3);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 9);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 8);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Movement Only');
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
      setTestRoll(player, 5);
      player.menuCommand(player.who, 'Roll System Strength');
      setTestRoll(player, 10);
      expect(MML.characters['test2'].statusEffects, 'wounds to the same body part stack effects').to.have.property("Major Wound, Right Arm");
      expect(MML.characters['test2'].statusEffects, 'successful systemStrength roll should not prevent adding "Disabling Wound" status effect').to.have.property("Disabling Wound, Right Arm");
      expect(MML.characters['test2'].situationalInitBonus, '"Disabling Wound" status effect should add -10 to situationalInitBonus').to.equal(-15);
      expect(MML.characters['test2'].situationalMod, '"Disabling Wound" status effect should add -25 to situationalMod').to.equal(-35);
      expect(MML.characters['test2'].statusEffects, 'successful systemStrength roll should not add "Stunned" status effect').not.to.have.property("Stunned");
      setActionStandardAttack(player);
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
      setTestRoll(player, 1);
      player.menuCommand(player.who, 'Roll System Strength');
      setTestRoll(player, 11);
      expect(MML.characters['test2'].statusEffects, 'wounds to the same body part stack effects').to.have.property("Major Wound, Right Arm");
      expect(MML.characters['test2'].statusEffects, 'successful systemStrength roll should not prevent adding "Disabling Wound" status effect').to.have.property("Disabling Wound, Right Arm");
      expect(MML.characters['test2'].situationalInitBonus, '"Disabling Wound" status effect should add -10 to situationalInitBonus').to.equal(-15);
      expect(MML.characters['test2'].situationalMod, '"Disabling Wound" status effect should add -25 to situationalMod').to.equal(-35);
      expect(MML.characters['test2'].statusEffects, 'failed systemStrength roll should add "Stunned" status effect').to.have.property("Stunned");
      expect(MML.characters['test2'].statusEffects["Stunned"].duration, 'duration of "Stunned" status effect should equal damage taken in from wound').to.equal(1);
      expect(MML.characters['test2'].action.name, '"Stunned" status effect should only allow movement during action').to.equal("Movement Only");
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
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
      setTestRoll(player, 1);
      player.menuCommand(player.who, 'Roll System Strength');
      setTestRoll(player, 10);
      expect(MML.characters['test2'].statusEffects, 'wounds to the same body part stack effects').to.have.property("Major Wound, Right Arm");
      expect(MML.characters['test2'].statusEffects, 'successful systemStrength roll should not prevent adding "Disabling Wound" status effect').to.have.property("Disabling Wound, Right Arm");
      expect(MML.characters['test2'].situationalInitBonus, '"Disabling Wound" status effect should add -10 to situationalInitBonus').to.equal(-15);
      expect(MML.characters['test2'].situationalMod, '"Disabling Wound" status effect should add -25 to situationalMod').to.equal(-35);
      expect(MML.characters['test2'].statusEffects, 'Character should still have "Stunned" status effect').to.have.property("Stunned");
      expect(MML.characters['test2'].statusEffects["Stunned"].duration, 'duration of "Stunned" status effect should not increase on successful systemStrength roll').to.equal(1);
      expect(MML.characters['test2'].action.name, '"Stunned" status effect should only allow movement during action').to.equal("Movement Only");
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
      setTestRoll(player, 1);
      player.menuCommand(player.who, 'Roll System Strength');
      setTestRoll(player, 11);
      expect(MML.characters['test2'].statusEffects, 'wounds to the same body part stack effects').to.have.property("Major Wound, Right Arm");
      expect(MML.characters['test2'].statusEffects, 'successful systemStrength roll should not prevent adding "Disabling Wound" status effect').to.have.property("Disabling Wound, Right Arm");
      expect(MML.characters['test2'].situationalInitBonus, '"Disabling Wound" status effect should add -10 to situationalInitBonus').to.equal(-15);
      expect(MML.characters['test2'].situationalMod, '"Disabling Wound" status effect should add -25 to situationalMod').to.equal(-35);
      expect(MML.characters['test2'].statusEffects, 'failed systemStrength roll should add "Stunned" status effect').to.have.property("Stunned");
      expect(MML.characters['test2'].statusEffects["Stunned"].duration, 'duration of "Stunned" status effect should add damage taken in from wound').to.equal(2);
      expect(MML.characters['test2'].action.name, '"Stunned" status effect should only allow movement during action').to.equal("Movement Only");
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 9);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 9);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 9);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      expect(MML.characters['test2'].statusEffects, 'wounds to the same body part stack effects').to.have.property("Major Wound, Right Arm");
      expect(MML.characters['test2'].situationalInitBonus, '"Major Wound" status effect should add -5 and "Disabling Wound" status effect should add -10 to situationalInitBonus').to.equal(-15);
      expect(MML.characters['test2'].statusEffects, 'Only healing can remove "Disabling Wound" status effect').to.have.property("Disabling Wound, Right Arm");
      expect(MML.characters['test2'].situationalMod, '"Disabling Wound" status effect should add -25 and "Major Wound" to status effect should expire').to.equal(-25);
      expect(MML.characters['test2'].statusEffects, '"Stunned" status effect should expire').not.to.have.property("Stunned");
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 9);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 8);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.name, 'Start Round');
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
      setTestRoll(player, 20);
      expect(MML.characters['test2'].statusEffects, 'Only healing can remove "Major Wound" status effect').to.have.property("Major Wound, Right Arm");
      expect(MML.characters['test2'].statusEffects, 'Only healing can remove "Disabling Wound" status effect').to.have.property("Disabling Wound, Right Arm");
      expect(MML.characters['test2'].statusEffects, 'Taking over twice max HP should add "Mortal Wound" status effect').to.have.property("Mortal Wound, Right Arm");
      expect(MML.characters['test2'].situationalInitBonus, '"Mortal Wound" status effect should set situationalInitBonus to "No Combat"').to.equal("No Combat");
      expect(MML.characters['test2'].situationalMod, '"Disabling Wound" status effect should add -25 and "Major Wound"').to.equal(-25);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test1",
        "target": "test0",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');

      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 9);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 8);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test1",
        "target": "test0",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');

      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 9);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 8);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test1",
        "target": "test0",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');

      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 9);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 8);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test1",
        "target": "test0",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 9);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 8);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test1",
        "target": "test0",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 9);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 8);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test1",
        "target": "test0",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 9);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 8);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test1",
        "target": "test0",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 9);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 8);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test1",
        "target": "test0",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Roll Fitness');
      setTestRoll(player, 10);
      expect(MML.characters['test0'].statusEffects, 'Successful fitness roll should not add "Fatigue" status effect').not.to.have.property("Fatigue");
      expect(MML.characters['test1'].statusEffects, 'Successful fitness roll should not add "Fatigue" status effect').not.to.have.property("Fatigue");
      player.menuCommand(player.who, 'Roll Fitness');
      setTestRoll(player, 11);
      expect(MML.characters['test0'].statusEffects, 'Failed fitness roll should add "Fatigue" status effect').to.have.property("Fatigue");
      expect(MML.characters['test1'].statusEffects, 'Successful fitness roll should not add "Fatigue" status effect').not.to.have.property("Fatigue");
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test1",
        "target": "test0",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Roll Fitness');
      setTestRoll(player, 11);
      expect(MML.characters['test0'].statusEffects, 'Failed fitness roll should add "Fatigue" status effect').to.have.property("Fatigue");
      expect(MML.characters['test0'].statusEffects["Fatigue"].level, '"Fatigue" status effect should have level 1 when created').to.equal(1);
      expect(MML.characters['test0'].situationalInitBonus, '"Fatigue" status effect level 1 should add -5 to situationalInitBonus').to.equal(-5);
      expect(MML.characters['test0'].situationalMod, '"Fatigue" status effect level 1 should add -10 to situationalMod').to.equal(-10);
      expect(MML.characters['test1'].statusEffects, 'Failed fitness roll should add "Fatigue" status effect').to.have.property("Fatigue");
      expect(MML.characters['test1'].statusEffects["Fatigue"].level, '"Fatigue" status effect should have level 1 when created').to.equal(1);
      expect(MML.characters['test1'].situationalInitBonus, '"Fatigue" status effect level 1 should add -5 to situationalInitBonus').to.equal(-5);
      expect(MML.characters['test1'].situationalMod, '"Fatigue" status effect level 1 should add -10 to situationalMod').to.equal(-10);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test1",
        "target": "test0",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test1",
        "target": "test0",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test1",
        "target": "test0",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test1",
        "target": "test0",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test1",
        "target": "test0",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Roll Fitness');
      setTestRoll(player, 6);
      expect(MML.characters['test0'].statusEffects, 'Only resting should remove "Fatigue" status effect').to.have.property("Fatigue");
      expect(MML.characters['test0'].statusEffects["Fatigue"].level, 'Successful fitness roll should not increase level of "Fatigue" status effect').to.equal(1);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test0",
        "target": "test1",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.setCurrentCharacterTargets({
        "charName": "test1",
        "target": "test0",
        "callback": "setCurrentCharacterTargets"
      });
      setTestRoll(player, 94);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Roll Fitness');
      setTestRoll(player, 7);
      expect(MML.characters['test0'].statusEffects, 'Only resting should remove "Fatigue" status effect').to.have.property("Fatigue");
      expect(MML.characters['test0'].statusEffects["Fatigue"].level, 'Failed fitness roll should increase level of "Fatigue" status effect').to.equal(2);
      expect(MML.characters['test0'].situationalInitBonus, '"Fatigue" status effect level 2 should add -10 to situationalInitBonus').to.equal(-10);
      expect(MML.characters['test0'].situationalMod, '"Fatigue" status effect level 2 should add -20 to situationalMod').to.equal(-20);
      player.menuCommand(player.who, 'Roll Fitness');
      setTestRoll(player, 7);
      expect(MML.characters['test1'].statusEffects, 'Only resting should remove "Fatigue" status effect').to.have.property("Fatigue");
      expect(MML.characters['test1'].statusEffects["Fatigue"].level, 'Failed fitness roll should increase level of "Fatigue" status effect').to.equal(2);
      expect(MML.characters['test1'].situationalInitBonus, '"Fatigue" status effect level 2 should add -10 to situationalInitBonus').to.equal(-10);
      expect(MML.characters['test1'].situationalMod, '"Fatigue" status effect level 2 should add -20 to situationalMod').to.equal(-20);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      expect(MML.characters['test0'].roundsRest, 'Not attacking or defending while fatigued should increase roundsRest').to.equal(1);
      expect(MML.characters['test1'].roundsRest, 'Not attacking or defending while fatigued should increase roundsRest').to.equal(1);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Roll Health');
      setTestRoll(player, 11);
      expect(MML.characters['test1'].statusEffects, 'Only resting should remove "Fatigue" status effect').to.have.property("Fatigue");
      expect(MML.characters['test1'].statusEffects["Fatigue"].level, 'Failed health roll should not decrease level of "Fatigue" status effect').to.equal(2);
      expect(MML.characters['test1'].situationalInitBonus, '"Fatigue" status effect level 2 should add -10 to situationalInitBonus').to.equal(-10);
      expect(MML.characters['test1'].situationalMod, '"Fatigue" status effect level 2 should add -20 to situationalMod').to.equal(-20);
      player.menuCommand(player.who, 'Roll Health');
      setTestRoll(player, 10);
      expect(MML.characters['test0'].statusEffects, 'Only resting should remove "Fatigue" status effect').to.have.property("Fatigue");
      expect(MML.characters['test0'].statusEffects["Fatigue"].level, 'Successful health roll should decrease level of "Fatigue" status effect').to.equal(1);
      expect(MML.characters['test0'].situationalInitBonus, '"Fatigue" status effect level 1 should add -5 to situationalInitBonus').to.equal(-5);
      expect(MML.characters['test0'].situationalMod, '"Fatigue" status effect level 1 should add -10 to situationalMod').to.equal(-10);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 4);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Roll Health');
      setTestRoll(player, 10);
      expect(MML.characters['test1'].statusEffects, 'Only resting should remove "Fatigue" status effect').to.have.property("Fatigue");
      expect(MML.characters['test1'].statusEffects["Fatigue"].level, 'Successful health roll should decrease level of "Fatigue" status effect').to.equal(1);
      expect(MML.characters['test1'].situationalInitBonus, '"Fatigue" status effect level 1 should add -5 to situationalInitBonus').to.equal(-5);
      expect(MML.characters['test1'].situationalMod, '"Fatigue" status effect level 1 should add -10 to situationalMod').to.equal(-10);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 4);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 4);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 4);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 4);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 4);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Roll Health');
      setTestRoll(player, 10);
      expect(MML.characters['test0'].statusEffects, 'Resting should remove "Fatigue" status effect').not.to.have.property("Fatigue");
      expect(MML.characters['test0'].situationalInitBonus, '"Fatigue" status effect level 0 should add 0 to situationalInitBonus').to.equal(0);
      expect(MML.characters['test0'].situationalMod, '"Fatigue" status effect level 0 should add 0 to situationalMod').to.equal(0);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
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
      player.menuCommand(player.who, 'Block: -9%');
      setTestRoll(player, 94);
      setTestRoll(player, 8);
      setTestRoll(player, 20);
      player.menuCommand(player.who, 'Roll System Strength');
      setTestRoll(player, 10);
      expect(MML.characters['test1'].statusEffects, 'successful systemStrength roll should not prevent adding "Disabling Wound" status effect').to.have.property("Disabling Wound, Right Arm");
      expect(MML.characters['test1'].situationalInitBonus, '"Disabling Wound" status effect should add -10 to situationalInitBonus').to.equal(-15);
      expect(MML.characters['test1'].situationalMod, '"Disabling Wound" status effect should add -25 to situationalMod').to.equal(-35);
      expect(MML.characters['test1'].rightHand._id, '"Disabling Wound, Right Arm" status effect should disarm character').to.equal('emptyHand');
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      expect(MML.characters['test0'].roundsRest, 'Defending while fatigued should reset roundsRest').to.equal(0);
      setActionStandardAttack(player);
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
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
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Roll System Strength');
      setTestRoll(player, 10);
      expect(MML.characters['test1'].statusEffects, 'successful systemStrength roll should not prevent adding "Disabling Wound" status effect').to.have.property("Disabling Wound, Right Arm");
      expect(MML.characters['test1'].statusEffects, 'successful systemStrength roll should not prevent adding "Disabling Wound" status effect').to.have.property("Disabling Wound, Head");
      expect(MML.characters['test1'].situationalInitBonus, '"Disabling Wound, Head" status effect should set situationalInitBonus to "No Combat"').to.equal("No Combat");
      expect(MML.characters['test1'].situationalMod, '"Disabling Wound" status effects on different body parts should stack').to.equal(-60);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Accept');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
    });

    it('Tested: Ranged Attack, Ranged Defense, ', function () {
      var bow = MML.items['Short Bow'];
      bow.quality = 'Standard';
      bow._id = 'bow';
      var crossbow = MML.items['Light Cross Bow'];
      crossbow.quality = 'Standard';
      crossbow._id = 'crossbow';
      MML.characters['test0'].inventory['bow'] = bow;
      MML.characters['test1'].inventory['crossbow'] = crossbow;
      player.menuCommand(player.who, 'Ready Item');
      player.menuCommand(player.who, 'Short Bow');
      player.menuCommand(player.who, 'Two Hands');
      player.menuCommand(player.who, 'Next Menu');
      player.menuCommand(player.who, 'Aim');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Ready Item');
      player.menuCommand(player.who, 'Light Cross Bow');
      player.menuCommand(player.who, 'Two Hands');
      player.menuCommand(player.who, 'Next Menu');
      player.menuCommand(player.who, 'Aim');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 9);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 10);
      player.menuCommand(player.who, 'Start Round');
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
    });

    it.skip('Tested: Spell Casting', function() {
      MML.setCurrentAttribute('test1', 'spells', JSON.stringify(['Hail of Stones', 'Dart']));
      var item = MML.items['Dart'];
      item._id = 'dart';
      MML.characters['test1'].inventory['dart'] = item;

      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 2);
      player.menuCommand(player.who, 'Ready Item');
      player.menuCommand(player.who, 'Dart');
      player.menuCommand(player.who, 'Right');
      player.menuCommand(player.who, 'Next Menu');
      player.menuCommand(player.who, 'Cast');
      player.menuCommand(player.who, 'Dart');
      player.menuCommand(player.who, 'Ease Spell');
      player.menuCommand(player.who, 'Next Menu');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 3);
      player.menuCommand(player.who, 'Movement Only');
      player.menuCommand(player.who, 'Roll');
      setTestRoll(player, 1);
      player.menuCommand(player.name, 'Start Round');
      expect(MML.characters['test1'].statusEffects, 'Choosing Ease Spell Meta Magic should add "Ease Spell" status effect').to.have.property("Ease Spell");
      expect(MML.characters['test1'].action.spell.actions, 'Ease Spell should add one action to base action cost of spell').to.equal(2);
      player.menuCommand(player.who, 'Start Action');
      player.menuCommand(player.who, 'End Movement');
      player.menuCommand(player.who, 'Continue Casting');
      player.menuCommand(player.who, 'Accept');
      // player.menuCommand(player.who, 'Start Action');
      // player.menuCommand(player.who, 'End Movement');

      expect(MML.characters['test1'].action.spell.actions, 'Ease Spell should add one action to base action cost of spell').to.equal(1);
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
