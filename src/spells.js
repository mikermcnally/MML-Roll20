SoS.spells = {};
SoS.spells['Flame Bolt'] = {
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

SoS.spells['Dart'] = {
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
  cast: async function castDart(player, character, action) {
    const targets = await SoS.getSpellTargets(player);
    _.findWhere(character.inventory, { name: 'Dart' }).quantity -= targets.length;
    const castingRoll = await SoS.castingRoll(player, character, [spell.task, casterSkill].concat(_.pluck(metaMagic, 'castingMod')));
    if (castingRoll === 'Critical Success' || castingRoll === 'Success') {
      targets.map(async function (target) {
        const defenseRoll = SoS.missileDefense(target.player, target, { family: 'MWM' }, SoS.getDistanceBetweenCharacters(character.id, target.id));
        if (defenseRoll === 'Critical Failure' || defenseRoll === 'Failure') {
          const hitPosition = await SoS.hitPositionRoll();
          const weapon = {damageType: 'Pierce', damage: _.has(metaMagic, 'Increase Potency') ? (3 * metaMagic['Increase Potency'].level) + 'd6' : '3d6'};
          const damage = await SoS.missileDamageRoll(weapon, castingRoll === 'Critical Success');
          await SoS.damageCharacter(target);
        }
      });
    }
    await SoS.alterEP(player, character, -1 * epCost * _.pluck(metaMagic, 'epMod').reduce((product, num) => product * num));
    SoS.endAction();
  }
};

SoS.spells['Hail of Stones'] = {
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
  cast: async function castHailOfStones(player, character, action) {
    const targets = await SoS.getRadiusSpellTargets();
    const castingRoll = await SoS.castingRoll(player, character, [spell.task, casterSkill].concat(_.pluck(metaMagic, 'castingMod')));
    if (castingRoll === 'Critical Success' || castingRoll === 'Success') {
      targets.map(function (target) {
        const numberOfStones = SoS.genericRoll(character.name, 'numberOfStonesRoll', '1d3', 'Number of stones cast at ' + target.name, 'genericRollResult');

      })

    } else if (rolls.numberOfStonesRoll > 0) {
      if (_.isUndefined(rolls.defenseRoll)) {
        target.rangedDefense({ family: 'SLI' }, SoS.getDistanceBetweenCharacters(character.id, target.id));
      } else if (_.isUndefined(rolls.hitPositionRoll)) {
        if (rolls.defenseRoll === 'Critical Success') {
          state.SoS.GM.currentAction.rolls.numberOfStonesRoll += -1;
          delete state.SoS.GM.currentAction.rolls.defenseRoll;
          // target.criticalDefense();
        } else if (rolls.defenseRoll === 'Success') {
          state.SoS.GM.currentAction.rolls.numberOfStonesRoll += -1;
          delete state.SoS.GM.currentAction.rolls.defenseRoll;
          SoS[state.SoS.GM.currentAction.callback]();
        } else {
          character.hitPositionRoll();
        }
      } else if (_.isUndefined(rolls.damageRoll)) {
        if (rolls.castingRoll === 'Critical Success') {
          character.missileDamageRoll({ damageType: 'Impact', damage: _.has(metaMagic, 'Increase Potency') ? (2 * metaMagic['Increase Potency'].level) + 'd8' : '2d8' }, true);
        } else {
          character.missileDamageRoll({ damageType: 'Impact', damage: _.has(metaMagic, 'Increase Potency') ? (2 * metaMagic['Increase Potency'].level) + 'd8' : '2d8' }, false);
        }
      }
    } else if (epModified !== true) {
      state.SoS.GM.currentAction.parameters.epModified = true;
    } else {
      if (_.isUndefined(state.SoS.GM.currentAction.targetArray[state.SoS.GM.currentAction.targetIndex + 1])) {
        SoS.damageCharacter('endAction');
      } else {
        SoS.damageCharacter('nextTarget');
      }
    }
    await SoS.alterEP(player, character, -1 * epCost * _.reduce(_.pluck(metaMagic, 'epMod'), function(memo, num) { return memo * num; }));
    SoS.endAction();
  }
};
