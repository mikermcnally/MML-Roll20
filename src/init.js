var MML = MML || {};

MML.init = function() {
  state.MML = state.MML || {};
  state.MML.GM = state.MML.GM || {
    player: new MML.Player('Robot', true),
    name: 'Robot',
    currentAction: {},
    inCombat: false,
    currentRound: 0,
    roundStarted: false
  };
  var playerObjects = findObjs({
    _type: 'player',
    online: true
  }, {
    caseInsensitive: false
  });
  MML.players = {};
  MML.players[state.MML.GM.name] = state.MML.GM.player;

  _.each(playerObjects, function(player) {
    if (player.get('displayname') !== state.MML.GM.name) {
      MML.players[player.get('displayname')] = new MML.Player(player.get('displayname'), false);
    }
  });

  var characterObjects = findObjs({
    _type: 'character',
    archived: false
  }, {
    caseInsensitive: false
  });

  MML.characters = {};
  _.each(characterObjects, function(characterObject) {
    var character = MML.createCharacter(characterObject.get('name'), characterObject.id);
    character.setPlayer();
    MML.characters[character.name] = character;
  });

  MML.initializeMenu(state.MML.GM.player);
};

on('ready', function() {
  MML.init();

  on('add:character', function(character) {
    var charName = character.get('name');
    MML.createAttribute('player', state.MML.GM.player.name, '', character);
    MML.createAttribute('name', charName, '', character);
    MML.createAttribute('race', 'Human', '', character);
    MML.createAttribute('gender', 'Male', '', character);
    MML.createAttribute('statureRoll', 6, '', character);
    MML.createAttribute('strengthRoll', 6, '', character);
    MML.createAttribute('coordinationRoll', 6, '', character);
    MML.createAttribute('healthRoll', 6, '', character);
    MML.createAttribute('beautyRoll', 6, '', character);
    MML.createAttribute('intellectRoll', 6, '', character);
    MML.createAttribute('reasonRoll', 6, '', character);
    MML.createAttribute('creativityRoll', 6, '', character);
    MML.createAttribute('presenceRoll', 6, '', character);
    MML.createAttribute('fomInitBonus', 6, '', character);
    MML.createAttribute('rightHand', JSON.stringify({
      _id: 'emptyHand'
    }), '', character);
    MML.createAttribute('leftHand', JSON.stringify({
      _id: 'emptyHand'
    }), '', character);

    setTimeout(function () {
      MML.characters[charName] = MML.createCharacter(charName, character.id);
      MML.characters[charName].updateCharacterSheet();
    }, 2000);
  });

  on('add:attribute', function(attribute) {
    var characterObject = getObj('character', attribute.get('_characterid'));
    var charName = characterObject.get('name');
    var attrName = attribute.get('name');

    if (attrName.indexOf('repeating_skills') !== -1 || attrName.indexOf('repeating_weaponskills') !== -1) {
      MML.characters[charName].updateCharacterSheet();
    }
  });

  on('chat:message', function(msg) {
    MML.parseCommand(msg);
  });

  on('change:token', function(obj, prev) {
    if (obj.get('name').indexOf('spellMarker') === -1 && obj.get('left') !== prev['left'] && obj.get('top') !== prev['top'] && state.MML.GM.inCombat === true) {
      var charName = MML.getTokenCharacter(obj);
      var character = MML.characters[charName];
      var left1 = prev['left'];
      var left2 = obj.get('left');
      var top1 = prev['top'];
      var top2 = obj.get('top');
      var distance = MML.getDistanceFeet(left1, left2, top1, top2);
      var distanceAvailable = MML.movementRates[character.race][character.movementPosition] * character.movementAvailable;

      if (state.MML.GM.actor === charName && distanceAvailable > 0) {
        // If they move too far, move the maxium distance in the same direction
        if (distance > distanceAvailable) {
          left3 = Math.floor(((left2 - left1) / distance) * distanceAvailable + left1 + 0.5);
          top3 = Math.floor(((top2 - top1) / distance) * distanceAvailable + top1 + 0.5);
          obj.set('left', left3);
          obj.set('top', top3);
          character.movementAvailable(0);
        }
        character.moveDistance(distance);
      } else {
        obj.set('left', prev['left']);
        obj.set('top', prev['top']);
      }
    } else if (obj.get('name').indexOf('spellMarker') > -1) {
      var targets = MML.getAoESpellTargets(obj);
      _.each(MML.characters, function (character) {
        var token = MML.getCharacterToken(character.name);
        if (!_.isUndefined(token)) {
          if (targets.indexOf(character.name) > -1) {
            token.set('tint_color', '#00FF00');
          } else {
            token.set('tint_color', 'transparent');
          }
        }
      });
      state.MML.GM.currentAction.parameters.metaMagic['Modified AoE'] = MML.getAoESpellModifier(obj, state.MML.GM.currentAction.parameters.spell);
      sendChat('GM',
        'EP Cost: ' + MML.getModifiedEpCost() + '\n' +
        'Chance to Cast: ' + MML.getModifiedCastingChance()
      );
      toBack(obj);
    }
  });

  on('change:character:name', function(changedCharacter) {
    var newName = changedCharacter.get('name');
    var characters = findObjs({
      _type: 'character',
      archived: false,
    }, {
      caseInsensitive: false
    });
    var apiNames = _.keys(MML.characters);
    var characterNames = [];

    _.each(characters, function(character) {
      characterNames.push(character.get('name'));
    });

    var oldName = _.difference(apiNames, characterNames)[0];

    MML.characters[newName] = MML.characters[oldName];
    delete MML.characters[oldName];
    MML.characters[newName].name = newName;
    MML.characters[newName].updateCharacterSheet();
  });

  on('change:attribute:current', function(attribute) {
    var characterObject = getObj('character', attribute.get('_characterid'));
    var character = MML.characters[characterObject.get('name')];
    var attrName = attribute.get('name');
    var roll;
    var rollAttributes = [
      'statureRoll',
      'strengthRoll',
      'coordinationRoll',
      'healthRoll',
      'beautyRoll',
      'intellectRoll',
      'reasonRoll',
      'creativityRoll',
      'presenceRoll'];

    if (rollAttributes.indexOf(attrName) > -1) {
      roll = parseFloat(attribute.get('current'));
      if (isNaN(roll) || roll < 6) {
        roll = 6;
      } else if (roll > 20) {
        roll = 20;
      }
      MML.setCurrentAttribute(character.name, attrName, roll);
      MML.updateCharacterSheet(character);
    } else if (attrName === 'player') {
      character.setPlayer();
    } else if (attrName != 'tab') {
      MML.updateCharacterSheet(character);
    }
  });
});
