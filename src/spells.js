MML.spells = {};
MML.spells['Flame Bolt'] = {
  name: 'Flame Bolt',
  family: 'Fire',
  components: ['Spoken'],
  actions: 1,
  task: 45,
  ep: 20,
  range: 0,
  duration: 0,
  target: [15, 1],
  targetSizeMatters: false,
  metaMagic: ['Increase Potency'],
  cast: function() {

  }
};
MML.spells['Dart'] = {
  name: 'Dart',
  family: 'Air',
  components: ['Spoken', 'Physical', 'Substantive'],
  requiredItem: 'Dart',
  actions: 1,
  task: 55,
  ep: 14,
  range: 100,
  duration: 0,
  target: 'Single',
  targetSizeMatters: false,
  metaMagic: ['Increase Potency', 'Called Shot', 'Called Shot Specific'],
  cast: function() {
    var currentAction = state.MML.GM.currentAction;
    var character = currentAction.character;
    var parameters = currentAction.parameters;
    var casterSkill = parameters.casterSkill;
    var spell = parameters.spell;
    var target = parameters.target;
    var targetArray = state.MML.GM.currentAction.targetArray;
    var epCost = parameters.epCost;
    var epModified = parameters.epModified;
    var metaMagic = parameters.metaMagic;
    var rolls = currentAction.rolls;

    if (_.isUndefined(rolls.castingRoll)) {
      _.findWhere(character.inventory, { name: 'Dart' }).quantity -= targetArray.length;
      character.castingRoll('castingRoll', spell.task, casterSkill, _.reduce(_.pluck(metaMagic, 'castingMod'), function(memo, num) { return memo + num; }));
    } else if (_.isUndefined(rolls.defenseRoll)) {
      if (rolls.castingRoll === 'Critical Success' || rolls.castingRoll === 'Success') {
        target.rangedDefense({ family: 'MWM' }, MML.getDistanceBetweenCharacters(character.id, target.id));
      } else if (rolls.castingRoll === 'Critical Failure') {
        MML.endAction();
      } else {
        MML.endAction();
      }
    } else if (_.isUndefined(rolls.hitPositionRoll)) {
      if (rolls.defenseRoll === 'Critical Success') {
        // criticalDefense
        MML[state.MML.GM.currentAction.callback]();
      } else if (rolls.defenseRoll === 'Success') {
        MML[state.MML.GM.currentAction.callback]();
      } else {
        character.hitPositionRoll();
      }
    } else if (_.isUndefined(rolls.damageRoll) && rolls.defenseRoll !== 'Success' && rolls.defenseRoll !== 'Critical Success') {
      if (rolls.castingRoll === 'Critical Success') {
        character.missileDamageRoll({ damageType: 'Pierce', damage: _.has(metaMagic, 'Increase Potency') ? (3 * metaMagic['Increase Potency'].level) + 'd6' : '3d6' }, true);
      } else {
        character.missileDamageRoll({ damageType: 'Pierce', damage: _.has(metaMagic, 'Increase Potency') ? (3 * metaMagic['Increase Potency'].level) + 'd6' : '3d6' }, false);
      }
    } else if (epModified !== true) {
      parameters.epModified = true;
      character.alterEP(-1 * epCost * _.reduce(_.pluck(metaMagic, 'epMod'), function(memo, num) { return memo * num; }));
    } else {
      if (_.isUndefined(targetArray[state.MML.GM.currentAction.targetIndex + 1])) {
        MML.damageCharacter('endAction');
      } else {
        MML.damageCharacter('nextTarget');
      }
    }
  }
};
MML.spells['Hail of Stones'] = {
  name: 'Hail of Stones',
  family: 'Earth',
  components: ['Spoken', 'Physical'],
  actions: 2,
  task: 35,
  ep: 30,
  range: 75,
  duration: 0,
  target: '5\' Radius',
  targetSizeMatters: false,
  metaMagic: ['Increase Potency'],
  cast: function() {
    var currentAction = state.MML.GM.currentAction;
    var character = currentAction.character;
    var parameters = currentAction.parameters;
    var casterSkill = parameters.casterSkill;
    var spell = parameters.spell;
    var target = parameters.target;
    var epCost = parameters.epCost;
    var epModified = parameters.epModified;
    var metaMagic = parameters.metaMagic;
    var stonesRemaining = parameters.stonesRemaining;
    var rolls = currentAction.rolls;
    log(target);
    log(state.MML.GM.currentAction.targetArray);
    if (_.isUndefined(rolls.castingRoll)) {
      character.castingRoll('castingRoll', spell.task, casterSkill, _.reduce(_.pluck(metaMagic, 'castingMod'), function(memo, num) { return memo + num; }));
    } else if (_.isUndefined(rolls.numberOfStonesRoll)) {
      if (rolls.castingRoll === 'Critical Success' || rolls.castingRoll === 'Success') {
        character.player.charMenuGenericRoll(character.name, 'numberOfStonesRoll', '1d3', 'Number of stones cast at ' + target.name, 'genericRollResult');
      } else if (rolls.castingRoll === 'Critical Failure') {
        MML.endAction();
      } else {
        MML.endAction();
      }
    } else if (rolls.numberOfStonesRoll > 0) {
      if (_.isUndefined(rolls.defenseRoll)) {
        target.rangedDefense({ family: 'SLI' }, MML.getDistanceBetweenCharacters(character.id, target.id));
      } else if (_.isUndefined(rolls.hitPositionRoll)) {
        if (rolls.defenseRoll === 'Critical Success') {
          state.MML.GM.currentAction.rolls.numberOfStonesRoll += -1;
          delete state.MML.GM.currentAction.rolls.defenseRoll;
          // target.criticalDefense();
        } else if (rolls.defenseRoll === 'Success') {
          state.MML.GM.currentAction.rolls.numberOfStonesRoll += -1;
          delete state.MML.GM.currentAction.rolls.defenseRoll;
          MML[state.MML.GM.currentAction.callback]();
        } else {
          character.hitPositionRoll();
        }
      } else if (_.isUndefined(rolls.damageRoll)) {
        if (rolls.castingRoll === 'Critical Success') {
          character.missileDamageRoll({ damageType: 'Impact', damage: _.has(metaMagic, 'Increase Potency') ? (2 * metaMagic['Increase Potency'].level) + 'd8' : '2d8' }, true);
        } else {
          character.missileDamageRoll({ damageType: 'Impact', damage: _.has(metaMagic, 'Increase Potency') ? (2 * metaMagic['Increase Potency'].level) + 'd8' : '2d8' }, false);
        }
      } else {
        state.MML.GM.currentAction.rolls.numberOfStonesRoll += -1;
        delete state.MML.GM.currentAction.rolls.defenseRoll;
        delete state.MML.GM.currentAction.rolls.hitPositionRoll;
        delete state.MML.GM.currentAction.rolls.damageRoll;
        MML[state.MML.GM.currentAction.callback]();
      }
    } else if (epModified !== true) {
      state.MML.GM.currentAction.parameters.epModified = true;
      character.alterEP(-1 * epCost * _.reduce(_.pluck(metaMagic, 'epMod'), function(memo, num) { return memo * num; }));
    } else {
      if (_.isUndefined(state.MML.GM.currentAction.targetArray[state.MML.GM.currentAction.targetIndex + 1])) {
        MML.damageCharacter('endAction');
      } else {
        MML.damageCharacter('nextTarget');
      }
    }
  }
};
