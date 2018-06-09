const SoS = {};
import "rxjs";
import {
  map,
} from 'rxjs/operators';

const players = r20_ready.pipe(switchMapTo(
  Rx.from(findObjs({
    _type: 'player'
  }, {
    caseInsensitive: false
  }))
));

const gm = player.pipe(filter(player => playerIsGM(player.id)), take(1));

const new_character = character_added.pipe(mergeMap(SoS.createCharacter));

const characters = r20_ready.pipe(
  switchMapTo(
    Rx.from(findObjs({
      _type: 'character',
      archived: false
    }, {
      caseInsensitive: false
    }))
  ),
  merge(new_character),
  scan(function (list, character) {
    list[character.id] = character;
    return list;
  }, {})
);


SoS.init = function () {
  state.SoS = {};
  state.SoS.GM = {
    player: new SoS.Player('Robot', true),
    name: 'Robot',
    currentAction: {},
    inCombat: false,
    currentRound: 0,
    roundStarted: false
  };
  SoS.players = {};
  SoS.players[state.SoS.GM.name] = state.SoS.GM.player;

  _.each(playerObjects, function (player) {
    if (player.get('displayname') !== state.SoS.GM.name) {
      SoS.players[player.get('displayname')] = new SoS.Player(player.get('displayname'), false);
    }
  });

  const characterObjects = findObjs({
    _type: 'character',
    archived: false
  }, {
    caseInsensitive: false
  });

  SoS.characters = characterObjects.reduce(function (characters, characterObject) {
    const id = characterObject.id;
    const character = SoS.createCharacter(characterObject.get('name'), id);
    SoS.setPlayer(character);
    characters[id] = character;
    return characters;
  }, {});

  SoS.initializeMenu(state.SoS.GM.player);

  SoS.newCharacter = Rx.Observable.create(function (observer) {
    on('add:character', function (msg) {
      observer.next(msg);
    });
  });

  on('add:character', function (character) {
    const id = character.get('id');
    const name = character.get('name');

    SoS.createAttribute('id', id, '', character);
    SoS.createAttribute('player', state.SoS.GM.player.name, '', character);
    SoS.createAttribute('name', name, '', character);
    SoS.createAttribute('race', 'Human', '', character);
    SoS.createAttribute('gender', 'Male', '', character);
    SoS.createAttribute('statureRoll', 6, '', character);
    SoS.createAttribute('strengthRoll', 6, '', character);
    SoS.createAttribute('coordinationRoll', 6, '', character);
    SoS.createAttribute('healthRoll', 6, '', character);
    SoS.createAttribute('beautyRoll', 6, '', character);
    SoS.createAttribute('intellectRoll', 6, '', character);
    SoS.createAttribute('reasonRoll', 6, '', character);
    SoS.createAttribute('creativityRoll', 6, '', character);
    SoS.createAttribute('presenceRoll', 6, '', character);
    SoS.createAttribute('fomInitBonus', 6, '', character);
    SoS.createAttribute('rightHand', JSON.stringify({
      _id: 'emptyHand'
    }), '', character);
    SoS.createAttribute('leftHand', JSON.stringify({
      _id: 'emptyHand'
    }), '', character);

    setTimeout(function () {
      SoS.characters[id] = SoS.createCharacter(name, character.id);
      SoS.updateCharacterSheet(characters[id]);
    }, 2000);
  });

  on('add:attribute', function (attribute) {
    var id = attribute.get('_characterid');
    var attrName = attribute.get('name');

    if (attrName.includes('repeating_skills') || attrName.includes('repeating_weaponskills')) {
      SoS.updateCharacterSheet(characters[id]);
    }
  });

  on('chat:message', SoS.parseChat);

  on('change:token', function (obj, prev) {
    if (obj.get('name').indexOf('spellMarker') === -1 && obj.get('left') !== prev['left'] && obj.get('top') !== prev['top'] && state.SoS.GM.inCombat === true) {
      const character = SoS.characters[SoS.getCharacterIdFromToken(obj)];
      const left1 = prev['left'];
      const left2 = obj.get('left');
      const top1 = prev['top'];
      const top2 = obj.get('top');
      const distance = SoS.getDistanceFeet(left1, left2, top1, top2);
      const distanceAvailable = SoS.movementRates[character.race][character.movementType] * character.movementAvailable;

      if (state.SoS.GM.actor === charName && distanceAvailable > 0) {
        // If they move too far, move the maxium distance in the same direction
        if (distance > distanceAvailable) {
          const left3 = Math.floor(((left2 - left1) / distance) * distanceAvailable + left1 + 0.5);
          const top3 = Math.floor(((top2 - top1) / distance) * distanceAvailable + top1 + 0.5);
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
      var targets = SoS.getAoESpellTargets(obj);
      _.each(SoS.characters, function (character) {
        var token = SoS.getCharacterToken(character.id);
        if (!_.isUndefined(token)) {
          if (targets.includes(character.id)) {
            token.set('tint_color', '#00FF00');
          } else {
            token.set('tint_color', 'transparent');
          }
        }
      });
      state.SoS.GM.currentAction.parameters.metaMagic['Modified AoE'] = SoS.getAoESpellModifier(obj, state.SoS.GM.currentAction.parameters.spell);
      sendChat('GM',
        'EP Cost: ' + SoS.getModifiedEpCost() + '\n' +
        'Chance to Cast: ' + SoS.getModifiedCastingChance()
      );
      toBack(obj);
    }
  });

  on('change:character:name', function (changedCharacter) {
    const character = SoS.characters[changedCharacter.get('id')];
    character.name = changedCharacter.get('name');
    SoS.updateCharacterSheet(character);
  });

  on('change:attribute:current', function (attribute) {
    var character = SoS.characters[attribute.get('_characterid')];
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
      'presenceRoll'
    ];

    if (rollAttributes.includes(attrName)) {
      roll = parseFloat(attribute.get('current'));
      if (isNaN(roll) || roll < 6) {
        roll = 6;
      } else if (roll > 20) {
        roll = 20;
      }
      SoS.setCurrentAttribute(character.id, attrName, roll);
      SoS.updateCharacterSheet(character);
    } else if (attrName === 'player') {
      character.setPlayer();
    } else if (attrName != 'tab') {
      SoS.updateCharacterSheet(character);
    }
  });
};

SoS.parseChat = function ({
  who,
  content,
  selected,
  type
}) {
  if (type === 'api' && content.indexOf('!SoS|') !== -1) {
    const player = SoS.players[who.replace(' (GM)', '')];
    player.buttonPressed(content.replace('!SoS|', ''), SoS.getSelectedIds(selected));
  }
};

on('ready', SoS.init);