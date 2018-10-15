import * as Rx from "rxjs";
import { Character, IGameEvent, Round } from "../mml";
import { SpellFamily } from "./spell_families";
import { MetaMagic } from "./meta_magic";
import { Component } from "./components";
import { Integer } from "../../utilities/integer";

export interface ISpell {
  readonly name: string;
  readonly family: SpellFamily;
  components: Array<Component>;
  actions: Integer.Unsigned;
  task: Integer.Unsigned;
  ep: Integer.Unsigned;
  range: Integer.Unsigned;
  duration: Round;
  readonly target_size_matters: boolean;
  readonly available_meta_magic: Array<MetaMagic>;
  cast(): Rx.Observable<IGameEvent>;
  getTargets(): Rx.Observable<Character>;
}

// export type GetSpellTargets = function(): Rx.Observable<Character>

export class FlameBolt implements ISpell {
  name: 'Flame Bolt';
  family: SpellFamily.Fire;
  components: [Component.Spoken];
  actions: 1;
  task: 45;
  ep: 20;
  range: 0;
  duration: 0;
  target: [15, 1];
  target_size_matters: false;
  metaMagic: [MetaMagic.IncreasePotency];
  cast() {

  }
}

export class Dart implements ISpell {
  name: 'Dart';
  family: SpellFamily.Air;
  components: [Component.Spoken, Component.Physical, Component.Substantive];
  requiredItem: 'Dart';
  actions: 1;
  task: 55;
  ep: 14;
  range: 100;
  duration: 0;
  target: 'Single';
  target_size_matters: false;
  metaMagic: ['Increase Potency', 'Called Shot', 'Called Shot Specific'];
  cast: async function castDart(player, character, action) {
    const targets = await MML.getSpellTargets(player);
    _.findWhere(character.inventory, { name: 'Dart' }).quantity -= targets.length;
    const castingRoll = await MML.castingRoll(player, character, [spell.task, casterSkill].concat(_.pluck(metaMagic, 'casting_mod')));
    if (castingRoll === 'Critical Success' || castingRoll === 'Success') {
      targets.map(async function (target) {
        const defenseRoll = MML.missileDefense(target.player, target, { family: 'MWM' }, MML.getDistanceBetweenCharacters(character.id, target.id));
        if (defenseRoll === 'Critical Failure' || defenseRoll === 'Failure') {
          const hitPosition = await MML.hitPositionRoll();
          const weapon = {damageType: 'Pierce', damage: _.has(metaMagic, 'Increase Potency') ? (3 * metaMagic['Increase Potency'].level) + 'd6' : '3d6'};
          const damage = await MML.missileDamageRoll(weapon, castingRoll === 'Critical Success');
          await MML.damageCharacter(target);
        }
      });
    }
    await MML.alterEP(player, character, -1 * epCost * _.pluck(metaMagic, 'epMod').reduce((product, num) => product * num));
    MML.endAction();
  }
}

export class HailOfStones implements ISpell {
  name: 'Hail of Stones';
  family: SpellFamily.Earth;
  components: [Component.Spoken, Component.Physical];
  actions: 2;
  task: 35;
  ep: 30;
  range: 75;
  duration: 0;
  target: '5\' Radius';
  target_size_matters: false;
  metaMagic: ['Increase Potency'];
  cast: async function castHailOfStones(player, character, action) {
    const targets = await MML.getRadiusSpellTargets();
    const castingRoll = await MML.castingRoll(player, character, [spell.task, casterSkill].concat(_.pluck(metaMagic, 'casting_mod')));
    if (castingRoll === 'Critical Success' || castingRoll === 'Success') {
      targets.map(function (target) {
        const numberOfStones = MML.genericRoll(character.name, 'numberOfStonesRoll', '1d3', 'Number of stones cast at ' + target.name, 'genericRollResult');

      })

    } else if (rolls.numberOfStonesRoll > 0) {
      if (_.isUndefined(rolls.defenseRoll)) {
        target.rangedDefense({ family: 'SLI' }, MML.getDistanceBetweenCharacters(character.id, target.id));
      } else if (_.isUndefined(rolls.hitPositionRoll)) {
        if (rolls.defenseRoll === 'Critical Success') {
          state.MML.gm.currentAction.rolls.numberOfStonesRoll += -1;
          delete state.MML.gm.currentAction.rolls.defenseRoll;
          // target.criticalDefense();
        } else if (rolls.defenseRoll === 'Success') {
          state.MML.gm.currentAction.rolls.numberOfStonesRoll += -1;
          delete state.MML.gm.currentAction.rolls.defenseRoll;
          MML[state.MML.gm.currentAction.callback]();
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
      state.MML.gm.currentAction.parameters.epModified = true;
    } else {
      if (_.isUndefined(state.MML.gm.currentAction.targetArray[state.MML.gm.currentAction.targetIndex + 1])) {
        MML.damageCharacter('endAction');
      } else {
        MML.damageCharacter('nextTarget');
      }
    }
    await MML.alterEP(player, character, -1 * epCost * _.reduce(_.pluck(metaMagic, 'epMod'), function(memo, num) { return memo * num; }));
    MML.endAction();
  }
}
