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
    MML.setPlayer(character);
    MML.characters[character.id] = character;
  });

  MML.initializeMenu(state.MML.GM.player);

  on('add:character', function(character) {
    var id = character.get('id');
    var name = character.get('name');

    MML.createAttribute('id', id, '', character);
    MML.createAttribute('player', state.MML.GM.player.name, '', character);
    MML.createAttribute('name', name, '', character);
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
      MML.characters[id] = MML.createCharacter(name, character.id);
      MML.characters[id].updateCharacterSheet();
    }, 2000);
  });

  on('add:attribute', function(attribute) {
    var id = attribute.get('_characterid');
    var attrName = attribute.get('name');

    if (attrName.indexOf('repeating_skills') !== -1 || attrName.indexOf('repeating_weaponskills') !== -1) {
      MML.characters[id].updateCharacterSheet();
    }
  });

  on('chat:message', MML.stream(MML.chatStream));

  on('change:token', function(obj, prev) {
    if (obj.get('name').indexOf('spellMarker') === -1 && obj.get('left') !== prev['left'] && obj.get('top') !== prev['top'] && state.MML.GM.inCombat === true) {
      var character = MML.characters[MML.getCharacterIdFromToken(obj)];
      var left1 = prev['left'];
      var left2 = obj.get('left');
      var top1 = prev['top'];
      var top2 = obj.get('top');
      var distance = MML.getDistanceFeet(left1, left2, top1, top2);
      var distanceAvailable = MML.movementRates[character.race][character.movementType] * character.movementAvailable;

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
        var token = MML.getCharacterToken(character.id);
        if (!_.isUndefined(token)) {
          if (targets.indexOf(character.id) > -1) {
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
    var id = changedCharacter.get('id');
    var newName = changedCharacter.get('name');

    MML.characters[id].name = newName;
    MML.characters[id].updateCharacterSheet();
  });

  on('change:attribute:current', function(attribute) {
    var character = MML.characters[attribute.get('_characterid')];
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

    if (rollAttributes.includes(attrName)) {
      roll = parseFloat(attribute.get('current'));
      if (isNaN(roll) || roll < 6) {
        roll = 6;
      } else if (roll > 20) {
        roll = 20;
      }
      MML.setCurrentAttribute(character.id, attrName, roll);
      MML.updateCharacterSheet(character);
    } else if (attrName === 'player') {
      character.setPlayer();
    } else if (attrName != 'tab') {
      MML.updateCharacterSheet(character);
    }
  });
};

MML.chatStream = function chatStream(msg) {
  return
};

MML.ParseChat = function({who , content, selected, type}) {
  MML.getPlayer(who);
  if (msg.type === 'api' && msg.content.indexOf('!MML|') !== -1) {
    var player = MML.players[msg.who.replace(' (GM)', '')];
    player.buttonPressed(_.extend(player, {
      pressedButton: msg.content.replace('!MML|', ''),
      selectedIds: MML.getSelectedIds(msg.selected)
    }));
  }
};

MML.stream = function stream(fn, initial) {
  function lazy(value) {
    return {value, next: () => lazy(fn(value))};
  }
  return () => lazy(initial);
};

MML.streamFilter = function streamFilter(filter, rawStream) {
  function filteredStream(stream) {
    const { value, next } = stream();

    if (filter(value)) {
      return {
        value,
        next() {
          return (next);
        }
      };
    }

    return filteredStream(next);
  }

  return () => filteredStream(rawStream);
};

MML.streamUntil = function streamUntil(stream, until) {
  function lazy(stream, until, output) {
    if (until) {
      return output;
    }
    const { value, next } = stream();
    return lazy(next, until, output.concat(value));
  }
  return lazy(stream, until, []);
};

MML.streamMap = function streamMap(stream) {};

on('ready', MML.init);
