var fs = require('fs');
_ = require('underscore');

var roll20String = '';
var source_path = '../r20/src/';
var filenames = fs.readdirSync(source_path).filter(function(filename) {
  return filename.search(/\.js$/) !== -1;
});
_.each(filenames, function(filename, index) {
  if (filename === 'init.js') {
    roll20String = fs.readFileSync(source_path + filename, 'utf-8') + roll20String;
  }
  roll20String += fs.readFileSync(source_path + filename, 'utf-8');
});

var lib_path = '../r20/src/lib/';
var lib_files = fs.readdirSync(lib_path).filter(function(filename) {
  return filename.search(/\.js$/) !== -1;
});
_.each(lib_files, function(filename, index) {
  roll20String += fs.readFileSync(lib_path + filename, 'utf-8');
});

fs.writeFileSync('../r20/MML.txt', roll20String, 'utf8');
roll20String += 'module.exports = { MML: MML };';
fs.writeFileSync('../r20/MML_Test.js', roll20String, 'utf8');

var roll20 = require('../Roll20-Emulation/Roll20');
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

on = function(eventName, listener) {
  emitter.on(eventName, listener);
};
var expect = require('chai').expect;
var MML = require('../MML_Test.js').MML;

runTests();

function runTests() {
  describe('Menu Flow Tests', function() {
    this.timeout(1500000);
    var player;

    beforeEach(function() {
      player = resetEnvironment();
    });

    afterEach(function() {
      var characters = findObjs({
        _type: "character"
      });
      _.each(characters, function(character) {
        character.remove();
      });
    });
    describe.only('Main Menu', function() {
      it('Checks that the menu initializes properly', function() {
        initializeMenu(player)
          .then(clickButton('Combat'))
          .then(clickButton('Back'))
          .then(clickButton('Combat'))
          .then(clickButton('Start Combat'));
      });

      it('Basic Weapon Attack', function() {
        var character = createCharacter('test');
        var character = createCharacter(player, 'test');
        var itemId = addItemToInventory(character, 'Hand Axe');
        MML.equipItem(character, itemId, 'Right Hand');
        startTestCombat(player, _.pluck(MML.characters, 'name'))
          .then(clickButton('Attack'))
          .then(clickButton('Standard'))
          .then(clickButton('None'))
          .then(clickButton('Neutral'))
          .then(clickButton('Roll'))
          .then(clickButton('Roll'))
          .then(clickButton('acceptRoll'))
          // .then(clickButton('Start Round'))
          ;
      });

      it('Release Opponent', function() {
        var character = createCharacter('test');
        character.statusEffects['Holding'] = {};
        startTestCombat(player, _.pluck(MML.characters, 'name'))
          .then(clickButton('Release Opponent'))
          .then(clickButton('Attack'))
          .then(clickButton('Punch'))
          .then(clickButton('None'))
          .then(clickButton('Neutral'))
          .then(clickButton('Roll'))
          .then(clickButton('Roll'))
          .then(clickButton('acceptRoll'))
          // .then(clickButton('Start Round'))
          ;
      });

      it('Ready Item', function() {
        var character = createCharacter('test');
        addItemToInventory(character, 'Hand Axe');
        addItemToInventory(character, 'Hand Axe', 'Excellent');
        addItemToInventory(character, 'Hand Axe', 'Poor');
        startTestCombat(player, _.pluck(MML.characters, 'name'))
          .then(clickButton('Ready Item'))
          .then(clickButton('Hand Axe'))
          .then(clickButton('Right Hand'))
          .then(clickButton('Hand Axe_2'))
          .then(clickButton('Attack'))
          .then(clickButton('Attack'))
          .then(clickButton('Attack'))
          .then(clickButton('Standard'))
          .then(clickButton('None'))
          .then(clickButton('Neutral'))
          .then(clickButton('Roll'))
          .then(clickButton('Roll'))
          .then(clickButton('Roll'))
          .then(clickButton('acceptRoll'))
          .then(clickButton('Start Round'))
          .then(clickButton('Start Round'))
          .then(clickButton('Start Round'))
          .then(clickButton('Start Action'))
          .then(clickButton('End Movement'))
          .then(function () {
            console.log(character.rightHand);
            console.log(character.inventory);
          })
          ;
      });

      it.only('Checks that start combat works', function() {
        createTestCharacters(player, 3);
        return startTestCombat(player, _.pluck(MML.characters, 'name'))
          .then(setActionPunchAttack)
          .then(clickButton('Roll'))
          // .then(clickButton('changeRoll eleventy'))
          // .then(clickButton('changeRoll 36'))
          // .then(clickButton('changeRoll 25'))
          // .then(clickButton('changeRoll 26'))
          .then(clickButton('changeRoll 35'))
          .then(clickButton('acceptRoll'))
          .then(clickButton('Observe'))
          .then(clickButton('Roll'))
          .then(clickButton('changeRoll 27'))
          .then(clickButton('acceptRoll'))
          .then(clickButton('Movement Only'))
          .then(clickButton('Roll'))
          .then(clickButton('changeRoll 26'))
          .then(clickButton('acceptRoll'))
          .then(clickButton('Start Round'))
          // .then(clickButton('Start Round'))
          // .then(clickButton('Start Action'))
          // .then(clickButton('Start Action'))
          // .then(clickButton('changeRoll 80'))
          // .then(clickButton('acceptRoll'))
          // .then(clickButton('End Movement'))
          // .then(clickButton('selectTarget test1'))
          // .then(clickButton('Roll'))
          // .then(clickButton('changeRoll 10'))
          // .then(clickButton('acceptRoll'))
          // .then(clickButton('acceptRoll'))
          // .then(clickButton('Block: 15%'))
          // .then(clickButton('changeRoll 16'))
          // .then(clickButton('acceptRoll'))
          // // .then(clickButton('acceptRoll'))
          // .then(clickButton('Roll'))
          // .then(clickButton('changeRoll 33'))
          // .then(clickButton('acceptRoll'))
          // // .then(clickButton('acceptRoll'))
          // .then(clickButton('Roll'))
          // .then(clickButton('changeRoll 4'))
          // .then(clickButton('acceptRoll'))
          // .then(clickButton('acceptRoll'))
          // .then(clickButton('Roll'))
          // .then(clickButton('changeRoll 4'))
          // .then(clickButton('acceptRoll'))
          // .then(clickButton('acceptRoll'))
          // .then(setActionPunchAttack)
          // .then(clickButton('Accept'))
          // .then(clickButton('Change Action'))
          // .then(clickButton('Observe'))
          // .then(clickButton('Edit Action'))
          // .then(clickButton('Observe'))
          // .then(clickButton('Accept'))
          // .then(clickButton('Start Action'))
          // .then(clickButton('Start Action'))
          // .then(clickButton('End Movement'))
          // .then(clickButton('End Action'))
          // .then(clickButton('Movement Only'))
          // .then(clickButton('Accept'))
          // .then(clickButton('Start Action'))
          // .then(clickButton('End Movement'))
          // .then(clickButton('End Action'))
          // .then(clickButton('Movement Only'))
          // .then(clickButton('End Movement'))
          // .then(clickButton('Start Action'))
          // .then(clickButton('End Movement'))
          // .then(clickButton('End Action'))
          // .then(clickButton('Observe'))
          // .then(clickButton('Accept'))
          // .then(clickButton('acceptRoll'))
          // .then(Promise.resolve)
          // .then(console.log)
          // .then(clickButton('Start Action'))
          .then(function (input) { console.log('done'); })
          .catch(console.log);
      });
    });

    describe('Prepare Action Menu', function() {
      it('Works with default character', function() {
        var character = createCharacter('test');
        var result = MML.prepareActionMenu(player, character, createTestAction(character));
        expect(result.message).to.equal('Prepare test\'s action');
        expect(result.buttons).to.contain('Attack');
        expect(result.buttons).to.contain('Observe');
        expect(result.buttons).to.contain('Movement Only');
        expect(result.buttons).to.contain('Ready Item');
        expect(result.buttons.length).to.equal(4);
      });

      it('Works with missile weapons', function() {
        var character = createCharacter('test');
        createTestToken(character.name, character.id);
        var crossbow = MML.items['Light Cross Bow'];
        crossbow.quality = 'Standard';
        crossbow._id = 'crossbow';
        crossbow.loaded = crossbow.grips['Two Hands'].reload;
        character.inventory['crossbow'] = crossbow;
        MML.equipItem(character, 'crossbow', 'Two Hands');
        MML.newRoundUpdate(character);
        var result = MML.prepareActionMenu(player, character, createTestAction(character));
        expect(result.message).to.equal('Prepare test\'s action');
        expect(result.buttons).to.contain('Attack');
        expect(result.buttons).to.contain('Observe');
        expect(result.buttons).to.contain('Movement Only');
        expect(result.buttons).to.contain('Ready Item');
        expect(result.buttons).to.contain('Aim');
        expect(result.buttons.length).to.equal(5);
      });

      it('Works with unloaded missile weapons', function() {
        var character = createCharacter('test');
        createTestToken(character.name, character.id);
        var crossbow = MML.items['Light Cross Bow'];
        crossbow.quality = 'Standard';
        crossbow._id = 'crossbow';
        crossbow.loaded = crossbow.grips['Two Hands'].reload - 1;
        character.inventory['crossbow'] = crossbow;
        MML.equipItem(character, 'crossbow', 'Two Hands');
        MML.newRoundUpdate(character);
        var result = MML.prepareActionMenu(player, character, createTestAction(character));
        expect(result.message).to.equal('Prepare test\'s action');
        expect(result.buttons).to.contain('Attack');
        expect(result.buttons).to.contain('Observe');
        expect(result.buttons).to.contain('Movement Only');
        expect(result.buttons).to.contain('Ready Item');
        expect(result.buttons).to.contain('Reload');
        expect(result.buttons.length).to.equal(5);
      });

      it('Works with holding status effect', function() {
        var character = createCharacter('test');
        character.statusEffects['Holding'] = {};
        state.MML.GM.inCombat = true;
        MML.newRoundUpdate(character);
        var result = MML.prepareActionMenu(player, character, createTestAction(character));
        expect(result.message).to.equal('Prepare test\'s action');
        expect(result.buttons).to.contain('Attack');
        expect(result.buttons).to.contain('Observe');
        expect(result.buttons).to.contain('Movement Only');
        expect(result.buttons).to.contain('Ready Item');
        expect(result.buttons).to.contain('Release Opponent');
        expect(result.buttons.length).to.equal(5);
      });

      it('Works with grappling status effect with one target', function() {
        var character = createCharacter('test');
        createTestToken(character.name, character.id);
        character.statusEffects['Grappled'] = { targets: ['1'] };
        state.MML.GM.inCombat = true;
        MML.newRoundUpdate(character);
        var result = MML.prepareActionMenu(player, character, createTestAction(character));
        expect(result.message).to.equal('Prepare test\'s action');
        expect(result.buttons).to.contain('Attack');
        expect(result.buttons).to.contain('Observe');
        expect(result.buttons).to.contain('Movement Only');
        expect(result.buttons).to.contain('Ready Item');
        expect(result.buttons).to.contain('Release Opponent');
        expect(result.buttons.length).to.equal(5);
      });

      it('Works with grappling status effect with two targets', function() {
        var character = createCharacter('test');
        createTestToken(character.name, character.id);
        character.statusEffects['Grappled'] = { targets: ['1', '2'] };
        state.MML.GM.inCombat = true;
        MML.newRoundUpdate(character);
        var result = MML.prepareActionMenu(player, character, createTestAction(character));
        expect(result.message).to.equal('Prepare test\'s action');
        expect(result.buttons).to.contain('Attack');
        expect(result.buttons).to.contain('Observe');
        expect(result.buttons).to.contain('Movement Only');
        expect(result.buttons).to.contain('Ready Item');
        expect(result.buttons.length).to.equal(4);
      });

      it('Works with held status effect', function() {
        var character = createCharacter('test');
        createTestToken(character.name, character.id);
        character.statusEffects['Grappled'] = { targets: ['1'] };
        character.statusEffects['Held'] = { targets: ['2'] };
        state.MML.GM.inCombat = true;
        MML.newRoundUpdate(character);
        var result = MML.prepareActionMenu(player, character, createTestAction(character));
        expect(result.message).to.equal('Prepare test\'s action');
        expect(result.buttons).to.contain('Attack');
        expect(result.buttons).to.contain('Observe');
        expect(result.buttons).to.contain('Movement Only');
        expect(result.buttons).to.contain('Ready Item');
        expect(result.buttons.length).to.equal(4);
      });

      it('Works with release opponent action modifier', function() {
        var character = createCharacter('test');
        createTestToken(character.name, character.id);
        character.statusEffects['Grappled'] = { targets: ['1'] };
        state.MML.GM.inCombat = true;
        MML.newRoundUpdate(character);
        var action = createTestAction(character);
        action.modifiers = ['Release Opponent'];
        var result = MML.prepareActionMenu(player, character, action);
        console.log(result.buttons);
        expect(result.message).to.equal('Prepare test\'s action');
        expect(result.buttons).to.contain('Attack');
        expect(result.buttons).to.contain('Observe');
        expect(result.buttons).to.contain('Movement Only');
        expect(result.buttons).to.contain('Ready Item');
        expect(result.buttons.length).to.equal(4);
      });

      it('Works with spells', function() {
        var character = createCharacter('test');
        createTestToken(character.name, character.id);
        MML.setCurrentAttribute('test', 'spells', JSON.stringify(['Dart']));
        state.MML.GM.inCombat = true;
        MML.newRoundUpdate(character);
        var result = MML.prepareActionMenu(player, character, createTestAction(character));
        expect(result.message).to.equal('Prepare test\'s action');
        expect(result.buttons).to.contain('Attack');
        expect(result.buttons).to.contain('Observe');
        expect(result.buttons).to.contain('Movement Only');
        expect(result.buttons).to.contain('Ready Item');
        expect(result.buttons).to.contain('Cast');
        expect(result.buttons.length).to.equal(5);
      });

      it('Works with multi-action spells', function() {
        var character = createCharacter('test');
        createTestToken(character.name, character.id);
        MML.setCurrentAttribute('test', 'spells', JSON.stringify(['Dart']));
        character.previousAction = {
          ts: Date.now(),
          modifiers: [],
          weapon: MML.getEquippedWeapon(character),
          spell: {
            actions: 1
          }
        };
        state.MML.GM.inCombat = true;
        MML.newRoundUpdate(character);
        var result = MML.prepareActionMenu(player, character, createTestAction(character));
        expect(result.message).to.equal('Prepare test\'s action');
        expect(result.buttons).to.contain('Attack');
        expect(result.buttons).to.contain('Observe');
        expect(result.buttons).to.contain('Movement Only');
        expect(result.buttons).to.contain('Ready Item');
        expect(result.buttons).to.contain('Cast');
        expect(result.buttons).to.contain('Continue Casting');
        expect(result.buttons.length).to.equal(6);
      });
    });

    describe('Prepare Character Action Buttons', function() {
      it('Attack button works with default character', function() {
        var result = MML.prepareActionCommand(setPressedButton(player, 'Attack'), createCharacter('test'));
        console.log(result);
        // expect(result.command.name).to.equal('prepareActionCommand');
      });
    });
  });
}

function setPressedButton(player, button, selectedCharNames) {
  player.buttonPressed(_.extend(player, { pressedButton: button, selectedCharNames: selectedCharNames || [] }));
  return player;
}

function clickButton(button, selectedCharNames) {
  return function(player) {
    player.buttonPressed(_.extend(player, { pressedButton: button, selectedCharNames: selectedCharNames || [] }));
    return Promise.resolve(player);
  };
}

function setTestRoll(value) {
  return function (player) {
    return Promise.resolve(player)
    .then(clickButton('changeRoll ' + value))
    .then(clickButton('acceptRoll'));
  };
}

function resetEnvironment() {
  Campaign().playerpageid = 'test';
  // var player = new MML.Player('Robot', true);
  // MML.players = {
  //   'Robot': player
  // };
  // state.MML = {};
  // state.MML.GM = {
  //   player: player,
  //   name: 'Robot',
  //   currentAction: {},
  //   inCombat: false,
  //   currentRound: 0,
  //   roundStarted: false
  // };
  // MML.characters = {};
  // return player;
  delete state.MML;
  MML.init();
  return state.MML.GM.player;
}

function createCharacter(player, name) {
  try {
    character = createObj("character", {
      name: name,
      "bio": "",
      "gmnotes": "",
      "_defaulttoken": "",
      "archived": false,
      "inplayerjournals": "",
      "controlledby": "",
      "avatar": ""
    });
    MML.createAttribute("player", player.name, "", character);
    MML.createAttribute("name", name, "", character);
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

    createTestToken(name, character.id);
    var mml_character = MML.createCharacter(name, character.id);
    MML.characters[name] = mml_character;
    player.characters.push(mml_character);

    return mml_character;
  } catch (e) {
    console.log(e.message);
    return createCharacter(name);
  }
}

function createTestToken(name, id) {
  return createObj("graphic", {
    name: name,
    _pageid: Campaign().get("playerpageid"),
    _type: "graphic",
    _subtype: "token",
    represents: id,
    tint_color: 'transparent',
    left: 10,
    top: 10
  });
}

function createTestCharacters(player, amount) {
  for (var i = 0; i < amount; i++) {
    createCharacter(player, 'test' + i);
  }
  return MML.characters;
}

function createTestAction(character) {
  return {
    ts: Date.now(),
    modifiers: [],
    weapon: MML.getEquippedWeapon(character)
  };
}

function addItemToInventory(character, itemName, quality = 'Standard') {
  var id = MML.generateRowID();
  var item = MML.items[itemName];
  item.quality = quality;
  item._id = id;
  character.inventory[id] = item;
  return id;
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

function initializeMenu(player) {
  return clickButton('initializeMenu')(player);
}

function startTestCombat(player, characters) {
  return initializeMenu(player)
    .then(clickButton('Combat'))
    .then(clickButton('Back'))
    .then(clickButton('Combat'))
    .then(clickButton('Start Combat', characters));
}

function setActionStandardAttack(player) {
  return Promise.resolve(player)
    .then(clickButton('Attack'))
    .then(clickButton('Standard'))
    .then(clickButton('None'))
    .then(clickButton('Neutral'));
}

function setActionPunchAttack(player) {
  return Promise.resolve(player)
    .then(clickButton('Attack'))
    .then(clickButton('Punch'))
    .then(clickButton('None'))
    .then(clickButton('Neutral'));
    // .then(Promise.resolve(player));
}

function executeObserve(player) {
  return clickButton('initializeMenu')(player)
    .then(clickButton('Start Action'))
    .then(clickButton('End Movement'))
    .then(clickButton('End Action'));
}

function pbcopy(data) {
  // require('child_process').spawn('clip').stdin.end(data);
}

// it('Tested: Unarmed striking, observe without ranged weapon, basic combat flow, basic damage, multiple defenses', function() {
//   setActionPunchAttack(player)
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10))
//   .then(clickButton('Observe'))
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 2))
//   .then(clickButton('Observe'))
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1))
//   .then(clickButton('Start Round'))
//   .then(clickButton('Start Action'))
//   .then(clickButton('End Movement'))
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 5))
//   .then(clickButton('Take it'))
//   .then(setTestRoll(player, 1))
//   .then(setTestRoll(player, 1))
//   expect(MML.characters['test1'].hp.Head, 'punch action should do 1 damage').to.equal(MML.characters['test1'].hpMax.Head - 1);
//   expect(MML.characters['test1'].hp['Wound Fatigue'], 'punch action should do 1 damage').to.equal(MML.characters['test1'].hpMax['Wound Fatigue'] - 1);
//   expect(MML.characters['test1'].knockdown, 'punch action should do 1 knockdown').to.equal(MML.characters['test1'].knockdownMax - 1);
//   expect(MML.characters['test0'].spentInitiative, 'punch action should cost 25 initiative').to.equal(-25);
//   expect(MML.characters['test0'].statusEffects, 'punch action should create "Melee This Round" status effect for attacker').to.have.property("Melee This Round");
//   expect(MML.characters['test1'].statusEffects, 'forgoing defense should not create "Melee This Round" status effect for defender').not.to.have.property("Melee This Round");
//   expect(MML.characters['test1'].statusEffects, 'forgoing defense should not create "Number of Defenses" status effect for defender').not.to.have.property("Number of Defenses");
//   expect(MML.characters['test1'].statusEffects, 'forgoing defense should create "Damaged This Round" status effect for defender').not.to.have.property("Damaged This Round");
//
//   .then(setActionPunchAttack(player))
//   .then(clickButton('Accept'))
//   .then(executeObserve(player))
//   expect(MML.characters['test1'].statusEffects, 'observe action should create "Observing" status effect').to.have.property("Observing");
//   expect(MML.characters['test1'].perceptionCheckMod, '"Observing" status effect should add 4 to perceptionCheckMod').to.equal(4);
//   expect(MML.characters['test1'].rangedDefenseMod, '"Observing" status effect should add -10 to rangedDefenseMod').to.equal(-10);
//   expect(MML.characters['test1'].meleeDefenseMod, '"Observing" status effect should add -10 to meleeDefenseMod').to.equal(-10);
//   expect(MML.characters['test1'].statusEffects, 'observe action should not create "Melee This Round" status effect').not.to.have.property("Melee This Round");
//
//   .then(executeObserve(player))
//   .then(clickButton('Observe'))
//   .then(clickButton('Accept'))
//   .then(executeObserve(player))
//   .then(clickButton('Observe'))
//   .then(clickButton('Accept'))
//   .then(clickButton('Start Action'))
//   .then(clickButton('End Movement'))
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 5);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 1);
//   .then(setTestRoll(player, 1);
//   expect(MML.characters['test1'].statusEffects, 'being attacked should remove "Observing" status effect').not.to.have.property("Observing");
//   expect(MML.characters['test1'].hp.Head, 'damage should accumlate').to.equal(MML.characters['test1'].hpMax.Head - 2);
//   expect(MML.characters['test1'].hp['Wound Fatigue'], 'damage should accumlate').to.equal(MML.characters['test1'].hpMax['Wound Fatigue'] - 2);
//   expect(MML.characters['test1'].knockdown, 'knockdown should accumlate damage taken this round').to.equal(MML.characters['test1'].knockdownMax - 2);
//   .then(executeObserve(player))
//   .then(executeObserve(player))
//   expect(MML.characters['test1'].statusEffects, 'observing previous round should add "Observed" status effect').to.have.property("Observed");
//   expect(state.MML.GM.currentRound, 'currentRound should be incremented').to.equal(2);
//   expect(MML.characters['test0'].roundsExertion, 'punch action should add to roundsExertion').to.equal(1);
//   expect(MML.characters['test1'].roundsExertion, 'forgoing defense should not add to roundsExertion').to.equal(0);
//
//   .then(setActionPunchAttack(player))
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Observe');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 2);
//   .then(clickButton('Observe');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   expect(MML.characters['test1'].statusEffects, 'observer should have "Observed" status effect').to.have.property("Observed");
//   expect(MML.characters['test1'].situationalInitBonus, '"Observed" status effect should add 5 to situationalInitBonus').to.equal(5);
//   expect(MML.characters['test1'].rangedDefenseMod, '"Observed" status effect should not add 10 to missileAttackMod when not wielding ranged weapon').to.equal(0);
//
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 5);
//   expect(MML.characters['test1'].statusEffects, 'observer should not lose "Observed" status effect from previous round after being attacked').to.have.property("Observed");
//   expect(MML.characters['test1'].situationalInitBonus, '"Observed" status effect should add 5 to situationalInitBonus').to.equal(5);
//
//   .then(clickButton('Block: 16%');
//   .then(setTestRoll(player, 5);
//   expect(MML.characters['test1'].statusEffects, 'blocking should create "Melee This Round" status effect for defender').to.have.property("Melee This Round");
//   expect(MML.characters['test1'].statusEffects, 'blocking should create "Number of Defenses" status effect for defender').to.have.property("Number of Defenses");
//   expect(MML.characters['test1'].statusEffects["Number of Defenses"].number, 'blocking should add 1 to "Number of Defenses" status effect for defender').to.equal(1);
//   expect(MML.characters['test1'].rangedDefenseMod, '"Number of Defenses" status effect should add -20 to rangedDefenseMod').to.equal(-20);
//   expect(MML.characters['test1'].meleeDefenseMod, '"Number of Defenses" status effect should add -20 to meleeDefenseMod').to.equal(-20);
//   .then(setActionPunchAttack(player))
//   .then(clickButton('Accept');
//   .then(executeObserve(player))
//   .then(clickButton('Observe');
//   .then(clickButton('Accept');
//   .then(executeObserve(player))
//   .then(clickButton('Observe');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 5);
//   .then(clickButton('Block: -14%');
//   .then(setTestRoll(player, 5);
//   .then(setTestRoll(player, 1);
//   .then(setTestRoll(player, 1);
//   expect(MML.characters['test1'].statusEffects["Number of Defenses"].number, 'blocking should add 1 to "Number of Defenses" status effect for defender').to.equal(2);
//   expect(MML.characters['test1'].rangedDefenseMod, '2 defenses should add -40 to rangedDefenseMod').to.equal(-40);
//   expect(MML.characters['test1'].meleeDefenseMod, '2 defenses should add -40 to meleeDefenseMod').to.equal(-40);
//   expect(MML.characters['test1'].hp.Head, 'damage should accumlate').to.equal(MML.characters['test1'].hpMax.Head - 3);
//   expect(MML.characters['test1'].hp['Wound Fatigue'], 'damage should accumlate').to.equal(MML.characters['test1'].hpMax['Wound Fatigue'] - 3);
//   expect(MML.characters['test1'].knockdown, 'knockdown should only consider damage from this round').to.equal(MML.characters['test1'].knockdownMax - 1);
//   .then(executeObserve(player))
//   .then(executeObserve(player))
//   .then(executeObserve(player))
//   expect(MML.characters['test1'].statusEffects, 'new rounds should remove "Number of Defenses" status effect for defender').not.to.have.property("Number of Defenses");
//   expect(MML.characters['test1'].rangedDefenseMod, 'new rounds should remove "Number of Defenses" status effect -40 penalty to rangedDefenseMod').to.equal(0);
//   expect(MML.characters['test1'].meleeDefenseMod, 'new rounds should remove "Number of Defenses" status effect -40 penalty to meleeDefenseMod').to.equal(0);
//   expect(MML.characters['test1'].hp.Head, 'damage should accumlate').to.equal(MML.characters['test1'].hpMax.Head - 3);
//   expect(MML.characters['test1'].hp['Wound Fatigue'], 'damage should accumlate').to.equal(MML.characters['test1'].hpMax['Wound Fatigue'] - 3);
//   expect(MML.characters['test1'].knockdown, 'knockdown should only consider damage from this round').to.equal(MML.characters['test1'].knockdownMax);
//   expect(state.MML.GM.currentRound, 'currentRound should be incremented').to.equal(3);
// .catch(console.log);
// });
//
// it.skip('Tested: Ready Item, Melee Attack, Melee Dodge, Major Wounds, Disabling Wounds, Mortal Wounds, Fatigue, Fatigue Recovery, Stun, Disarming from Disabling Wound', function() {
//   var item = MML.items['Hand Axe'];
//   item.quality = 'Standard';
//   item._id = 'axe';
//   MML.characters['test0'].inventory['axe'] = item;
//   MML.characters['test1'].inventory['axe'] = item;
//   .then(clickButton('Ready Item');
//   .then(clickButton('Hand Axe');
//   .then(clickButton('Right');
//   .then(clickButton('Next Menu');
//   .then(clickButton('Attack');
//   expect(_.pluck(player.buttons, 'text'), 'Aim should not be an option for character without missile weapon').not.to.contain('Aim');
//   expect(_.pluck(player.buttons, 'text'), 'Shoot From Cover should not be an option for unarmed character').not.to.contain('Shoot From Cover');
//
//   .then(clickButton('Standard');
//   .then(clickButton('None');
//   .then(clickButton('Neutral');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Ready Item');
//   .then(clickButton('Hand Axe');
//   .then(clickButton('Right');
//   .then(clickButton('Next Menu');
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 9);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   expect(MML.characters['test0'].initiative).to.equal(21);
//   expect(MML.characters['test0'].initiativeRollValue, 'initiativeRollValue should equal 10').to.equal(10);
//   expect(MML.characters['test0'].situationalInitBonus, '"Ready Item" status effect should add -10 to situationalInitBonus').to.equal(-10);
//   expect(MML.characters['test0'].movementRatioInitBonus, 'movementRatioInitBonus should be 5 for unencumbered').to.equal(5);
//   expect(MML.characters['test0'].attributeInitBonus, 'attributeInitBonus should be 0 for character with 10 for all attributes').to.equal(0);
//   expect(MML.characters['test0'].senseInitBonus, 'senseInitBonus should be 4 for character w/o headgear').to.equal(4);
//   expect(MML.characters['test0'].fomInitBonus, 'fomInitBonus should be 6 for character w/o armor').to.equal(6);
//   expect(MML.characters['test0'].firstActionInitBonus, 'firstActionInitBonus should be 6 for character attacking with hand axe').to.equal(6);
//   expect(MML.characters['test0'].spentInitiative, 'spentInitiative should be 0 for character who has not acted').to.equal(0);
//   expect(MML.characters['test0'].actionTempo, 'actionTempo should be -25 for unskilled character').to.equal(-25);
//   expect(MML.characters['test0'].statusEffects, '"Ready Item" action should add "Ready Item" status effect').to.have.property("Ready Item");
//   expect(MML.characters['test2'].firstActionInitBonus, 'firstActionInitBonus should be 10 for character observing').to.equal(10);
//   expect(MML.characters['test0'].rightHand._id, 'ready item should not take effect until action starts').to.equal('emptyHand');
//   expect(MML.characters['test0'].leftHand._id, 'ready item should not take effect until action starts').to.equal('emptyHand');
//   expect(MML.characters['test1'].rightHand._id, 'ready item should not take effect until action starts').to.equal('emptyHand');
//   expect(MML.characters['test1'].leftHand._id, 'ready item should not take effect until action starts').to.equal('emptyHand');
//
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   expect(MML.characters['test0'].rightHand._id, 'ready item should only update selected hand').to.equal('axe');
//   expect(MML.characters['test0'].rightHand.grip, 'right hand grip should be "One Hand"').to.equal('One Hand');
//   expect(MML.characters['test0'].leftHand._id, 'ready item should only update selected hand').to.equal('emptyHand');
//
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 5);
//   expect(MML.characters['test1'].rightHand._id, 'ready item should not take effect until action starts').to.equal('emptyHand');
//   expect(MML.characters['test1'].leftHand._id, 'ready item should not take effect until action starts').to.equal('emptyHand');
//   expect(_.pluck(player.buttons, 'text'), 'Block should not be an option for unarmed character').not.to.contain('Block: 1%');
//
//   .then(clickButton('Dodge: 0%');
//   .then(setTestRoll(player, 5);
//   .then(setTestRoll(player, 8);
//   .then(setTestRoll(player, 8);
//   expect(MML.characters['test1'].statusEffects, 'dodging should create "Dodged This Round" status effect for defender').to.have.property("Dodged This Round");
//   expect(MML.characters['test1'].statusEffects, 'dodging should create "Melee This Round" status effect for defender').to.have.property("Melee This Round");
//   expect(MML.characters['test1'].statusEffects, 'dodging should create "Number of Defenses" status effect for defender').to.have.property("Number of Defenses");
//   expect(MML.characters['test1'].statusEffects["Number of Defenses"].number, 'dodging should add 1 to "Number of Defenses" status effect for defender').to.equal(1);
//   expect(MML.characters['test0'].spentInitiative, 'spentInitiative should be -25 for character who has acted with default actionTempo').to.equal(-25);
//
//   .then(clickButton('Start Action');
//   expect(MML.characters['test1'].action.name, 'dodging should prevent a character from doing anything but movement').to.equal('Movement Only');
//   expect(MML.characters['test1'].action.callback, 'dodging should prevent a character from doing anything but movement').to.equal('endAction');
//
//   .then(clickButton('End Movement');
//   expect(MML.characters['test1'].rightHand._id, 'dodging should not prevent ready item').to.equal('axe');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 9);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 8);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(setTestRoll(player, 5);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 8);
//   .then(setTestRoll(player, 9);
//   .then(clickButton('Roll Willpower');
//   .then(setTestRoll(player, 10);
//   expect(MML.characters['test2'].statusEffects, 'successful willpower roll should not add "Major Wound" status effect').not.to.have.property("Major Wound, Right Arm");
//   setActionStandardAttack(player);
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(setTestRoll(player, 5);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 8);
//   .then(setTestRoll(player, 2);
//   .then(clickButton('Roll Willpower');
//   .then(setTestRoll(player, 11);
//   expect(MML.characters['test2'].statusEffects, 'successful willpower roll should not add "Major Wound" status effect').to.have.property("Major Wound, Right Arm");
//   expect(MML.characters['test2'].situationalInitBonus, '"Major Wound" status effect should add -5 to situationalInitBonus').to.equal(-5);
//   expect(MML.characters['test2'].situationalMod, '"Major Wound" status effect should add -10 to situationalMod').to.equal(-10);
//   expect(MML.characters['test2'].statusEffects["Major Wound, Right Arm"].duration, '"Major Wound" status effect duration should equal damage taken beyond half HP').to.equal(2);
//   expect(MML.characters['test2'].statusEffects["Major Wound, Right Arm"].startingRound, '"Major Wound" status effect starting round should equal current round').to.equal(2);
//   setActionStandardAttack(player);
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(setTestRoll(player, 5);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 8);
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Roll Willpower');
//   .then(setTestRoll(player, 10);
//   expect(MML.characters['test2'].statusEffects["Major Wound, Right Arm"].duration, 'successful willpower save should not add to duration of "Major Wound" status effect').to.equal(2);
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(setTestRoll(player, 5);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 8);
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Roll Willpower');
//   .then(setTestRoll(player, 11);
//   expect(MML.characters['test2'].statusEffects["Major Wound, Right Arm"].duration, 'failing willpower save should add to duration of "Major Wound" status effect').to.equal(3);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 9);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 8);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(setTestRoll(player, 5);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 8);
//   .then(setTestRoll(player, 5);
//   .then(clickButton('Roll System Strength');
//   .then(setTestRoll(player, 10);
//   expect(MML.characters['test2'].statusEffects, 'wounds to the same body part stack effects').to.have.property("Major Wound, Right Arm");
//   expect(MML.characters['test2'].statusEffects, 'successful systemStrength roll should not prevent adding "Disabling Wound" status effect').to.have.property("Disabling Wound, Right Arm");
//   expect(MML.characters['test2'].situationalInitBonus, '"Disabling Wound" status effect should add -10 to situationalInitBonus').to.equal(-15);
//   expect(MML.characters['test2'].situationalMod, '"Disabling Wound" status effect should add -25 to situationalMod').to.equal(-35);
//   expect(MML.characters['test2'].statusEffects, 'successful systemStrength roll should not add "Stunned" status effect').not.to.have.property("Stunned");
//   setActionStandardAttack(player);
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(setTestRoll(player, 5);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 8);
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Roll System Strength');
//   .then(setTestRoll(player, 11);
//   expect(MML.characters['test2'].statusEffects, 'wounds to the same body part stack effects').to.have.property("Major Wound, Right Arm");
//   expect(MML.characters['test2'].statusEffects, 'successful systemStrength roll should not prevent adding "Disabling Wound" status effect').to.have.property("Disabling Wound, Right Arm");
//   expect(MML.characters['test2'].situationalInitBonus, '"Disabling Wound" status effect should add -10 to situationalInitBonus').to.equal(-15);
//   expect(MML.characters['test2'].situationalMod, '"Disabling Wound" status effect should add -25 to situationalMod').to.equal(-35);
//   expect(MML.characters['test2'].statusEffects, 'failed systemStrength roll should add "Stunned" status effect').to.have.property("Stunned");
//   expect(MML.characters['test2'].statusEffects["Stunned"].duration, 'duration of "Stunned" status effect should equal damage taken in from wound').to.equal(1);
//   expect(MML.characters['test2'].action.name, '"Stunned" status effect should only allow movement during action').to.equal("Movement Only");
//   setActionStandardAttack(player);
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(setTestRoll(player, 5);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 8);
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Roll System Strength');
//   .then(setTestRoll(player, 10);
//   expect(MML.characters['test2'].statusEffects, 'wounds to the same body part stack effects').to.have.property("Major Wound, Right Arm");
//   expect(MML.characters['test2'].statusEffects, 'successful systemStrength roll should not prevent adding "Disabling Wound" status effect').to.have.property("Disabling Wound, Right Arm");
//   expect(MML.characters['test2'].situationalInitBonus, '"Disabling Wound" status effect should add -10 to situationalInitBonus').to.equal(-15);
//   expect(MML.characters['test2'].situationalMod, '"Disabling Wound" status effect should add -25 to situationalMod').to.equal(-35);
//   expect(MML.characters['test2'].statusEffects, 'Character should still have "Stunned" status effect').to.have.property("Stunned");
//   expect(MML.characters['test2'].statusEffects["Stunned"].duration, 'duration of "Stunned" status effect should not increase on successful systemStrength roll').to.equal(1);
//   expect(MML.characters['test2'].action.name, '"Stunned" status effect should only allow movement during action').to.equal("Movement Only");
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(setTestRoll(player, 5);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 8);
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Roll System Strength');
//   .then(setTestRoll(player, 11);
//   expect(MML.characters['test2'].statusEffects, 'wounds to the same body part stack effects').to.have.property("Major Wound, Right Arm");
//   expect(MML.characters['test2'].statusEffects, 'successful systemStrength roll should not prevent adding "Disabling Wound" status effect').to.have.property("Disabling Wound, Right Arm");
//   expect(MML.characters['test2'].situationalInitBonus, '"Disabling Wound" status effect should add -10 to situationalInitBonus').to.equal(-15);
//   expect(MML.characters['test2'].situationalMod, '"Disabling Wound" status effect should add -25 to situationalMod').to.equal(-35);
//   expect(MML.characters['test2'].statusEffects, 'failed systemStrength roll should add "Stunned" status effect').to.have.property("Stunned");
//   expect(MML.characters['test2'].statusEffects["Stunned"].duration, 'duration of "Stunned" status effect should add damage taken in from wound').to.equal(2);
//   expect(MML.characters['test2'].action.name, '"Stunned" status effect should only allow movement during action').to.equal("Movement Only");
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 9);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 9);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 9);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   expect(MML.characters['test2'].statusEffects, 'wounds to the same body part stack effects').to.have.property("Major Wound, Right Arm");
//   expect(MML.characters['test2'].situationalInitBonus, '"Major Wound" status effect should add -5 and "Disabling Wound" status effect should add -10 to situationalInitBonus').to.equal(-15);
//   expect(MML.characters['test2'].statusEffects, 'Only healing can remove "Disabling Wound" status effect').to.have.property("Disabling Wound, Right Arm");
//   expect(MML.characters['test2'].situationalMod, '"Disabling Wound" status effect should add -25 and "Major Wound" to status effect should expire').to.equal(-25);
//   expect(MML.characters['test2'].statusEffects, '"Stunned" status effect should expire').not.to.have.property("Stunned");
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 9);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 8);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(setTestRoll(player, 5);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 8);
//   .then(setTestRoll(player, 20);
//   expect(MML.characters['test2'].statusEffects, 'Only healing can remove "Major Wound" status effect').to.have.property("Major Wound, Right Arm");
//   expect(MML.characters['test2'].statusEffects, 'Only healing can remove "Disabling Wound" status effect').to.have.property("Disabling Wound, Right Arm");
//   expect(MML.characters['test2'].statusEffects, 'Taking over twice max HP should add "Mortal Wound" status effect').to.have.property("Mortal Wound, Right Arm");
//   expect(MML.characters['test2'].situationalInitBonus, '"Mortal Wound" status effect should set situationalInitBonus to "No Combat"').to.equal("No Combat");
//   expect(MML.characters['test2'].situationalMod, '"Disabling Wound" status effect should add -25 and "Major Wound"').to.equal(-25);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test0'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 9);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 8);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test0'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 9);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 8);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test0'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 9);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 8);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test0'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 9);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 8);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test0'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 9);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 8);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test0'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 9);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 8);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test0'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 9);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 8);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test0'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Roll Fitness');
//   .then(setTestRoll(player, 10);
//   expect(MML.characters['test0'].statusEffects, 'Successful fitness roll should not add "Fatigue" status effect').not.to.have.property("Fatigue");
//   expect(MML.characters['test1'].statusEffects, 'Successful fitness roll should not add "Fatigue" status effect').not.to.have.property("Fatigue");
//   .then(clickButton('Roll Fitness');
//   .then(setTestRoll(player, 11);
//   expect(MML.characters['test0'].statusEffects, 'Failed fitness roll should add "Fatigue" status effect').to.have.property("Fatigue");
//   expect(MML.characters['test1'].statusEffects, 'Successful fitness roll should not add "Fatigue" status effect').not.to.have.property("Fatigue");
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test0'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Roll Fitness');
//   .then(setTestRoll(player, 11);
//   expect(MML.characters['test0'].statusEffects, 'Failed fitness roll should add "Fatigue" status effect').to.have.property("Fatigue");
//   expect(MML.characters['test0'].statusEffects["Fatigue"].level, '"Fatigue" status effect should have level 1 when created').to.equal(1);
//   expect(MML.characters['test0'].situationalInitBonus, '"Fatigue" status effect level 1 should add -5 to situationalInitBonus').to.equal(-5);
//   expect(MML.characters['test0'].situationalMod, '"Fatigue" status effect level 1 should add -10 to situationalMod').to.equal(-10);
//   expect(MML.characters['test1'].statusEffects, 'Failed fitness roll should add "Fatigue" status effect').to.have.property("Fatigue");
//   expect(MML.characters['test1'].statusEffects["Fatigue"].level, '"Fatigue" status effect should have level 1 when created').to.equal(1);
//   expect(MML.characters['test1'].situationalInitBonus, '"Fatigue" status effect level 1 should add -5 to situationalInitBonus').to.equal(-5);
//   expect(MML.characters['test1'].situationalMod, '"Fatigue" status effect level 1 should add -10 to situationalMod').to.equal(-10);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test0'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test0'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test0'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test0'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test0'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Roll Fitness');
//   .then(setTestRoll(player, 6);
//   expect(MML.characters['test0'].statusEffects, 'Only resting should remove "Fatigue" status effect').to.have.property("Fatigue");
//   expect(MML.characters['test0'].statusEffects["Fatigue"].level, 'Successful fitness roll should not increase level of "Fatigue" status effect').to.equal(1);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test0'))
//   .then(setTestRoll(player, 94);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Roll Fitness');
//   .then(setTestRoll(player, 7);
//   expect(MML.characters['test0'].statusEffects, 'Only resting should remove "Fatigue" status effect').to.have.property("Fatigue");
//   expect(MML.characters['test0'].statusEffects["Fatigue"].level, 'Failed fitness roll should increase level of "Fatigue" status effect').to.equal(2);
//   expect(MML.characters['test0'].situationalInitBonus, '"Fatigue" status effect level 2 should add -10 to situationalInitBonus').to.equal(-10);
//   expect(MML.characters['test0'].situationalMod, '"Fatigue" status effect level 2 should add -20 to situationalMod').to.equal(-20);
//   .then(clickButton('Roll Fitness');
//   .then(setTestRoll(player, 7);
//   expect(MML.characters['test1'].statusEffects, 'Only resting should remove "Fatigue" status effect').to.have.property("Fatigue");
//   expect(MML.characters['test1'].statusEffects["Fatigue"].level, 'Failed fitness roll should increase level of "Fatigue" status effect').to.equal(2);
//   expect(MML.characters['test1'].situationalInitBonus, '"Fatigue" status effect level 2 should add -10 to situationalInitBonus').to.equal(-10);
//   expect(MML.characters['test1'].situationalMod, '"Fatigue" status effect level 2 should add -20 to situationalMod').to.equal(-20);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   expect(MML.characters['test0'].roundsRest, 'Not attacking or defending while fatigued should increase roundsRest').to.equal(1);
//   expect(MML.characters['test1'].roundsRest, 'Not attacking or defending while fatigued should increase roundsRest').to.equal(1);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Roll Health');
//   .then(setTestRoll(player, 11);
//   expect(MML.characters['test1'].statusEffects, 'Only resting should remove "Fatigue" status effect').to.have.property("Fatigue");
//   expect(MML.characters['test1'].statusEffects["Fatigue"].level, 'Failed health roll should not decrease level of "Fatigue" status effect').to.equal(2);
//   expect(MML.characters['test1'].situationalInitBonus, '"Fatigue" status effect level 2 should add -10 to situationalInitBonus').to.equal(-10);
//   expect(MML.characters['test1'].situationalMod, '"Fatigue" status effect level 2 should add -20 to situationalMod').to.equal(-20);
//   .then(clickButton('Roll Health');
//   .then(setTestRoll(player, 10);
//   expect(MML.characters['test0'].statusEffects, 'Only resting should remove "Fatigue" status effect').to.have.property("Fatigue");
//   expect(MML.characters['test0'].statusEffects["Fatigue"].level, 'Successful health roll should decrease level of "Fatigue" status effect').to.equal(1);
//   expect(MML.characters['test0'].situationalInitBonus, '"Fatigue" status effect level 1 should add -5 to situationalInitBonus').to.equal(-5);
//   expect(MML.characters['test0'].situationalMod, '"Fatigue" status effect level 1 should add -10 to situationalMod').to.equal(-10);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 4);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Roll Health');
//   .then(setTestRoll(player, 10);
//   expect(MML.characters['test1'].statusEffects, 'Only resting should remove "Fatigue" status effect').to.have.property("Fatigue");
//   expect(MML.characters['test1'].statusEffects["Fatigue"].level, 'Successful health roll should decrease level of "Fatigue" status effect').to.equal(1);
//   expect(MML.characters['test1'].situationalInitBonus, '"Fatigue" status effect level 1 should add -5 to situationalInitBonus').to.equal(-5);
//   expect(MML.characters['test1'].situationalMod, '"Fatigue" status effect level 1 should add -10 to situationalMod').to.equal(-10);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 4);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 4);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 4);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 4);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 4);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Roll Health');
//   .then(setTestRoll(player, 10);
//   expect(MML.characters['test0'].statusEffects, 'Resting should remove "Fatigue" status effect').not.to.have.property("Fatigue");
//   expect(MML.characters['test0'].situationalInitBonus, '"Fatigue" status effect level 0 should add 0 to situationalInitBonus').to.equal(0);
//   expect(MML.characters['test0'].situationalMod, '"Fatigue" status effect level 0 should add 0 to situationalMod').to.equal(0);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 5);
//   .then(clickButton('Block: -9%');
//   .then(setTestRoll(player, 94);
//   .then(setTestRoll(player, 8);
//   .then(setTestRoll(player, 20);
//   .then(clickButton('Roll System Strength');
//   .then(setTestRoll(player, 10);
//   expect(MML.characters['test1'].statusEffects, 'successful systemStrength roll should not prevent adding "Disabling Wound" status effect').to.have.property("Disabling Wound, Right Arm");
//   expect(MML.characters['test1'].situationalInitBonus, '"Disabling Wound" status effect should add -10 to situationalInitBonus').to.equal(-15);
//   expect(MML.characters['test1'].situationalMod, '"Disabling Wound" status effect should add -25 to situationalMod').to.equal(-35);
//   expect(MML.characters['test1'].rightHand._id, '"Disabling Wound, Right Arm" status effect should disarm character').to.equal('emptyHand');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   expect(MML.characters['test0'].roundsRest, 'Defending while fatigued should reset roundsRest').to.equal(0);
//   setActionStandardAttack(player);
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(setTestRoll(player, 5);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 1);
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Roll System Strength');
//   .then(setTestRoll(player, 10);
//   expect(MML.characters['test1'].statusEffects, 'successful systemStrength roll should not prevent adding "Disabling Wound" status effect').to.have.property("Disabling Wound, Right Arm");
//   expect(MML.characters['test1'].statusEffects, 'successful systemStrength roll should not prevent adding "Disabling Wound" status effect').to.have.property("Disabling Wound, Head");
//   expect(MML.characters['test1'].situationalInitBonus, '"Disabling Wound, Head" status effect should set situationalInitBonus to "No Combat"').to.equal("No Combat");
//   expect(MML.characters['test1'].situationalMod, '"Disabling Wound" status effects on different body parts should stack').to.equal(-60);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
// });
//
// it.skip('Tested: Ranged Attack, Ranged Defense, Reloading, Shooting From Cover, Aiming, Wound Fatigue, Called Shots', function () {
//   var bow = MML.items['Short Bow'];
//   bow.quality = 'Standard';
//   bow._id = 'bow';
//   var crossbow = MML.items['Light Cross Bow'];
//   crossbow.quality = 'Standard';
//   crossbow._id = 'crossbow';
//   crossbow.loaded = crossbow.grips['Two Hands'].reload;
//   MML.characters['test0'].inventory['bow'] = bow;
//   MML.characters['test1'].inventory['crossbow'] = crossbow;
//   .then(clickButton('Ready Item');
//   .then(clickButton('Short Bow');
//   .then(clickButton('Two Hands');
//   .then(clickButton('Next Menu');
//   .then(clickButton('Aim');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Ready Item');
//   .then(clickButton('Light Cross Bow');
//   .then(clickButton('Two Hands');
//   .then(clickButton('Next Menu');
//   .then(clickButton('Aim');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 7);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(clickButton('End Action');
//   expect(MML.characters['test0'].statusEffects, 'aim action should add "Taking Aim" status effect').to.have.property("Taking Aim");
//   expect(MML.characters['test0'].statusEffects["Taking Aim"].level, 'level of "Taking Aim" status effect should initialize to 1').to.equal(1);
//   expect(MML.characters['test0'].statusEffects["Taking Aim"].target.name, 'target of "Taking Aim" status effect should match selected target').to.equal('test2');
//   expect(MML.characters['test0'].missileAttackMod, '"Taking Aim" status effect level 1 should add 30 to missileAttackMod').to.equal(30);
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(clickButton('End Action');
//   expect(MML.characters['test1'].statusEffects["Taking Aim"].target.name, 'target of "Taking Aim" status effect should match selected target').to.equal('test2');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Aim');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Aim');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 7);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(clickButton('Roll Strength');
//   .then(setTestRoll(player, 10);
//   .then(clickButton('End Action');
//   expect(MML.characters['test0'].statusEffects, 'aim action should add "Taking Aim" status effect').to.have.property("Taking Aim");
//   expect(MML.characters['test0'].statusEffects["Taking Aim"].level, 'aiming 2 rounds in a row should increment level of "Taking Aim" status effect').to.equal(2);
//   expect(MML.characters['test0'].statusEffects["Taking Aim"].target.name, 'target of "Taking Aim" status effect should match selected target').to.equal('test2');
//   expect(MML.characters['test0'].missileAttackMod, '"Taking Aim" status effect level 2 should add 40 to missileAttackMod').to.equal(40);
//   .then(clickButton('Aim');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test0'))
//   .then(clickButton('End Action');
//   expect(MML.characters['test1'].statusEffects, 'aim action should add "Taking Aim" status effect').to.have.property("Taking Aim");
//   expect(MML.characters['test1'].statusEffects["Taking Aim"].level, 'changing targets should reset level of "Taking Aim" status effect').to.equal(1);
//   expect(MML.characters['test1'].statusEffects["Taking Aim"].target.name, 'target of "Taking Aim" status effect should match selected target').to.equal('test0');
//   expect(MML.characters['test1'].missileAttackMod, '"Taking Aim" status effect level 1 should add 30 to missileAttackMod').to.equal(30);
//   .then(clickButton('Aim');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(clickButton('Roll Strength');
//   .then(setTestRoll(player, 11);
//   expect(MML.characters['test0'].statusEffects, 'aim action should add "Taking Aim" status effect').to.have.property("Taking Aim");
//   expect(MML.characters['test0'].statusEffects["Taking Aim"].level, 'aiming 2 rounds in a row should increment level of "Taking Aim" status effect').to.equal(2);
//   expect(MML.characters['test0'].statusEffects["Taking Aim"].target.name, 'target of "Taking Aim" status effect should match selected target').to.equal('test2');
//   expect(MML.characters['test0'].missileAttackMod, '"Taking Aim" status effect level 2 should add 40 to missileAttackMod').to.equal(40);
//   .then(setTestRoll(player, 56);
//   .then(clickButton('Defend: 1%');
//   .then(setTestRoll(player, 5);
//   .then(setTestRoll(player, 8);
//   .then(setTestRoll(player, 3);
//   expect(MML.characters['test0'].statusEffects, 'shooting should remove "Taking Aim" status effect').not.to.have.property("Taking Aim");
//   expect(MML.characters['test2'].hp['Wound Fatigue'], 'Minor wounds should subtract from Multple Wounds').to.equal(MML.characters['test2'].hpMax['Wound Fatigue'] - 3);
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test0'))
//   .then(clickButton('End Action');
//   expect(MML.characters['test1'].statusEffects, 'aim action should add "Taking Aim" status effect').to.have.property("Taking Aim");
//   expect(MML.characters['test1'].statusEffects["Taking Aim"].level, 'aiming 2 rounds in a row should increment level of "Taking Aim" status effect').to.equal(2);
//   expect(MML.characters['test1'].statusEffects["Taking Aim"].target.name, 'target of "Taking Aim" status effect should match selected target').to.equal('test0');
//   expect(MML.characters['test1'].missileAttackMod, '"Taking Aim" status effect level 2 should add 40 to missileAttackMod').to.equal(40);
//   .then(clickButton('Attack');
//   .then(clickButton('Shoot From Cover');
//   .then(clickButton('None');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Attack');
//   .then(clickButton('Standard');
//   .then(clickButton('None');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 7);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   expect(MML.characters['test0'].statusEffects, 'shooting from cover should add "Shoot From Cover" status effect').to.have.property("Shoot From Cover");
//   expect(MML.characters['test0'].missileAttackMod, '"Shoot From Cover" status effect should add -10 to missileAttackMod').to.equal(-10);
//   .then(setTestRoll(player, 5);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 8);
//   .then(setTestRoll(player, 3);
//   expect(MML.characters['test0'].statusEffects, 'shooting from cover should add "Shoot From Cover" status effect').to.have.property("Shoot From Cover");
//   expect(MML.characters['test1'].statusEffects, 'taking damage should remove "Taking Aim" status effect').not.to.have.property("Taking Aim");
//   expect(MML.characters['test1'].missileAttackMod, 'Removing "Taking Aim" status effect should set to missileAttackMod to 0').to.equal(0);
//   .then(clickButton('Attack');
//   .then(clickButton('Shoot From Cover');
//   .then(clickButton('None');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test0'))
//   .then(setTestRoll(player, 5);
//   expect(MML.characters['test1'].inventory['crossbow'].loaded, 'Firing a MWM family weapon should set loaded to 0').to.equal(0);
//   expect(_.pluck(player.buttons, 'text'), 'Aim should not be an option for unloaded MWM weapon').not.to.contain('Aim');
//   .then(clickButton('Attack');
//   expect(_.pluck(player.buttons, 'text'), 'Shoot From Cover should not be an option for unloaded MWM weapon').not.to.contain('Shoot From Cover');
//   expect(_.pluck(player.buttons, 'text'), 'Standard attack should not be an option for unloaded MWM weapon').not.to.contain('Standard');
//   .then(clickButton('Punch');
//   .then(clickButton('None');
//   .then(clickButton('Neutral');
//   .then(clickButton('Edit Action');
//   .then(clickButton('Reload');
//   .then(clickButton('Accept');
//   expect(MML.characters['test1'].statusEffects, 'changing action before it is finalized should not add "Changed Action" status effect').not.to.have.property("Changed Action");
//   expect(MML.characters['test1'].action.name, 'Changing action should actually change the action').to.equal('Reload');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   expect(MML.characters['test0'].statusEffects, 'shooting from cover should add "Shoot From Cover" status effect').to.have.property("Shoot From Cover");
//   expect(MML.characters['test0'].missileAttackMod, '"Shoot From Cover" status effect should add -10 to missileAttackMod').to.equal(-10);
//   .then(setTestRoll(player, 5);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 8);
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Roll Willpower');
//   .then(setTestRoll(player, 10);
//   expect(MML.characters['test2'].hp['Wound Fatigue'], 'Damage beyond minor wounds should not subtract from Multple Wounds').to.equal(MML.characters['test2'].hpMax['Wound Fatigue'] - 8);
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('End Action');
//   expect(MML.characters['test1'].inventory['crossbow'].loaded, 'Reload action should increment loaded').to.equal(1);
//   .then(clickButton('Aim');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Reload');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 7);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test1'))
//   .then(clickButton('End Action');
//   .then(clickButton('Attack');
//   .then(clickButton('Standard');
//   .then(clickButton('None');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('End Action');
//   .then(clickButton('Reload');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   expect(MML.characters['test0'].missileAttackMod, 'Shooting at a target other than the one aimed at should not grant bonus of "Taking Aim" status effect').to.equal(0);
//   .then(setTestRoll(player, 16);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 31);
//   .then(setTestRoll(player, 8);
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('End Action');
//   .then(clickButton('Attack');
//   .then(clickButton('Standard');
//   .then(clickButton('None');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Reload');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 7);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(setTestRoll(player, 16);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 46);
//   .then(setTestRoll(player, 8);
//   .then(clickButton('Roll System Strength');
//   .then(setTestRoll(player, 10);
//   expect(MML.characters['test2'].statusEffects, 'successful System Strength roll should not add "Wound Fatigue" status effect').not.to.have.property("Wound Fatigue");
//   .then(clickButton('Attack');
//   .then(clickButton('Standard');
//   .then(clickButton('None');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('End Action');
//   expect(MML.characters['test1'].inventory['crossbow'].loaded, 'Reload action should increment loaded').to.equal(4);
//   expect(_.pluck(player.buttons, 'text'), 'Reload should not be an option for loaded MWM weapon').not.to.contain('Reload');
//   .then(clickButton('Aim');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(setTestRoll(player, 16);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 45);
//   .then(setTestRoll(player, 3);
//   .then(clickButton('Roll System Strength');
//   .then(setTestRoll(player, 11);
//   expect(MML.characters['test2'].statusEffects, 'failed System Strength roll should not add "Wound Fatigue" status effect').to.have.property("Wound Fatigue");
//   expect(MML.characters['test2'].situationalInitBonus, '"Wound Fatigue" status effect should add -5 to situationalInitBonus').to.equal(-5);
//   expect(MML.characters['test2'].situationalMod, '"Wound Fatigue" status effect should add -10 to situationalMod').to.equal(-10);
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(clickButton('End Action');
//   .then(clickButton('Attack');
//   .then(clickButton('Standard');
//   .then(clickButton('Body Part');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Attack');
//   .then(clickButton('Standard');
//   .then(clickButton('Specific Hit Position');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 7);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Start Round');
//   expect(MML.characters['test0'].statusEffects, 'Choosing "Called Shot" modifier should add "Called Shot" status effect').to.have.property("Called Shot");
//   expect(MML.characters['test0'].spentInitiative, '"Called Shot" status effect should add -5 to spentInitiative').to.equal(-5);
//   expect(MML.characters['test0'].missileAttackMod, '"Called Shot" status effect should add -10 to missileAttackMod').to.equal(-10);
//   expect(MML.characters['test0'].rangedDefenseMod, '"Called Shot" status effect should add -10 to rangedDefenseMod').to.equal(-10);
//   expect(MML.characters['test0'].meleeAttackMod, '"Called Shot" status effect should add -10 to meleeAttackMod').to.equal(-10);
//   expect(MML.characters['test0'].meleeDefenseMod, '"Called Shot" status effect should add -10 to missileAttackMod').to.equal(-10);
//   expect(MML.characters['test1'].statusEffects, 'Choosing "Called Shot Specific" modifier should add "Called Shot Specific" status effect').to.have.property("Called Shot Specific");
//   expect(MML.characters['test1'].spentInitiative, '"Called Shot Specific" status effect should add -5 to spentInitiative').to.equal(-5);
//   expect(MML.characters['test1'].missileAttackMod, '"Called Shot Specific" status effect should add -30 and "Taking Aim" status effect level 1 should add 30 to missileAttackMod').to.equal(0);
//   expect(MML.characters['test1'].rangedDefenseMod, '"Called Shot Specific" status effect should add -30 to rangedDefenseMod').to.equal(-30);
//   expect(MML.characters['test1'].meleeAttackMod, '"Called Shot Specific" status effect should add -30 to meleeAttackMod').to.equal(-30);
//   expect(MML.characters['test1'].meleeDefenseMod, '"Called Shot Specific" status effect should add -30 to missileAttackMod').to.equal(-30);
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(clickButton('Abdomen');
//   .then(setTestRoll(player, 6);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 9);
//   .then(setTestRoll(player, 3);
//   .then(clickButton('Roll Willpower');
//   .then(setTestRoll(player, 10);
//   expect(MML.characters['test0'].spentInitiative, '"Called Shot" status effect should add -5 to spentInitiative').to.equal(-30);
//   expect(MML.characters['test2'].statusEffects, 'Successful Willpower roll should not add "Sensitive Area" status effect').not.to.have.property("Sensitive Area");
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(clickButton('Groin');
//   .then(setTestRoll(player, 6);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 3);
//   .then(clickButton('Roll Willpower');
//   .then(setTestRoll(player, 11);
//   expect(MML.characters['test2'].statusEffects, 'Failed Willpower roll should add "Sensitive Area" status effect').to.have.property("Sensitive Area");
//   expect(MML.characters['test2'].situationalInitBonus, '"Sensitive Area" status effect should add -5 to situationalInitBonus').to.equal(-10);
//   expect(MML.characters['test2'].situationalMod, '"Sensitive Area" status effect should add -10 to situationalMod').to.equal(-20);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Aim');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Start Round');
//   expect(MML.characters['test2'].statusEffects, '"Sensitive Area" status effect should last for 1 round').to.have.property("Sensitive Area");
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(clickButton('End Action');
//   .then(clickButton('Attack');
//   .then(clickButton('Standard');
//   .then(clickButton('Specific Hit Position');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('selectTarget test2'))
//   .then(clickButton('Groin');
//   .then(setTestRoll(player, 26);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 1);
//   .then(setTestRoll(player, 3);
//   .then(clickButton('Roll Willpower');
//   .then(setTestRoll(player, 10);
//   expect(MML.characters['test2'].statusEffects, '"Sensitive Area" status effect should be removed after 1 round').not.to.have.property("Sensitive Area");
// });
//
// it.skip('Tested: Spell Casting', function() {
//   MML.setCurrentAttribute('test0', 'spells', JSON.stringify(['Hail of Stones', 'Dart']));
//   var item = MML.items['Dart'];
//   item._id = 'dart';
//   MML.characters['test0'].inventory['dart'] = item;
//
//   expect(_.pluck(player.buttons, 'text'), 'Cast should not be an option if character is not holding required spell component').not.to.contain('Cast');
//   .then(clickButton('Ready Item');
//   .then(clickButton('Dart');
//   .then(clickButton('Right');
//   .then(clickButton('Next Menu');
//   .then(clickButton('Cast');
//   .then(clickButton('Dart');
//   .then(clickButton('Ease Spell');
//   .then(clickButton('Next Menu');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   expect(MML.characters['test0'].statusEffects, 'Choosing Ease Spell Meta Magic should add "Ease Spell" status effect').to.have.property("Ease Spell");
//   expect(MML.characters['test0'].action.spell.actions, 'Ease Spell should add one action to base action cost of spell').to.equal(2);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 2);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Movement Only');
//   .then(clickButton('Accept');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('End Action');
//   expect(MML.characters['test0'].statusEffects, '"Ease Spell" status effect should last until spell is cast').to.have.property("Ease Spell");
//   expect(MML.characters['test0'].action.spell.actions, 'Ease Spell should add one action to base action cost of spell').to.equal(1);
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Continue Casting');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 10);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 2);
//   .then(clickButton('Movement Only');
//   .then(clickButton('Roll'))
//   .then(setTestRoll(player, 1);
//   .then(clickButton('Start Round');
//   .then(clickButton('Start Action');
//   .then(clickButton('End Movement');
//   .then(clickButton('Cast Spell');
//   MML.characters['test0'].getAdditionalTarget('test1');
//   .then(clickButton('Add Target');
//   MML.characters['test0'].getAdditionalTarget('test2');
//   expect(MML.characters['test0'].statusEffects, '"Ease Spell" status effect should last until spell is cast').to.have.property("Ease Spell");
//   .then(clickButton('Cast Spell');
//   .then(setTestRoll(player, 45);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 45);
//   .then(setTestRoll(player, 3);
//   .then(clickButton('Take it');
//   .then(setTestRoll(player, 45);
//   .then(setTestRoll(player, 3);
//   expect(MML.characters['test0'].ep, 'Casting a spell should reduce EP').to.equal(24);
//   expect(_.pluck(player.buttons, 'text'), 'Continue Casting should not be an option after spell is cast').not.to.contain('Continue Casting');
// });
