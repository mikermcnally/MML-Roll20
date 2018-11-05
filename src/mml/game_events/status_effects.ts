import * as Rx from "rxjs";
import {  } from "rxjs/operators";
import { IGameEvent } from "./game_events";

export interface IStatusEffect extends IGameEvent {
  readonly effect: Rx.Observable<any>;
  [property: string]: any;
  updateCharacterSheet(): void;
}

// class StatusEffect {
//   constructor(effect, end = Rx.never()) {
//     this = effect.pipe(
//       takeUntil(end)
//     );
//     this.id = id;
//     this.menu; // For manual removal
//   }
//   /**
//    * Emits {
//    *    
//    * }
//    */
// }

export class MajorWound implements IStatusEffect {
  readonly effect: Rx.Observable<any>;
  readonly body_part: string;

  constructor(parameters) {
    
  }
}
MML.statusEffects = {
  'Major Wound':  function (effect, index) {
    if (!state.MML.gm.inCombat) {
      this.statusEffects[index].duration = 0;
      effect.duration = 0;
    }
    if (this.hp[effect.bodyPart] > Math.round(this.hpMax[effect.bodyPart] / 2)) {
      delete this.statusEffects[index];
    } else {
      if (this.situational_init_bonus !== 'No Combat') {
        this.situational_init_bonus += -5;
      }
      if (state.MML.gm.currentRound - parseInt(effect.startingRound) <= effect.duration) {
        this.situational_mod += -10;
      }
      this.statusEffects[index].description = 'Situational Modifier: -10%. Initiative: -5';
    }
  },
  'Disabling Wound': function (effect, index) {
    if (this.hp[effect.bodyPart] > 0) {
      delete this.statusEffects[index];
    } else {
      if (this.situational_init_bonus !== 'No Combat') {
        this.situational_init_bonus += -10;
      }
      this.situational_mod += -25;
      if (effect.bodyPart === 'Head') {
        this.situational_init_bonus = 'No Combat';
        this.statusEffects[index].description = 'Situational Modifier: -25%. Unconscious';
      } else if (effect.bodyPart === 'Left Arm') {
        this.statusEffects[index].description = 'Situational Modifier: -25%. Initiative: -10. Left Arm Limp';
        this.leftHand = {
          _id: 'emptyHand',
          grip: 'unarmed'
        };
      } else if (effect.bodyPart === 'Right Arm') {
        this.statusEffects[index].description = 'Situational Modifier: -25%. Initiative: -10. Right Arm Limp';
        this.rightHand = {
          _id: 'emptyHand',
          grip: 'unarmed'
        };
      } // TODO: else if legs limit movement
    }
  },
  'Mortal Wound': function (effect, index) {
    if (this.hp[effect.bodyPart] >= -this.hpMax[effect.bodyPart]) {
      delete this.statusEffects[index];
    } else {
      this.situational_init_bonus = 'No Combat';
      this.statusEffects[index].description = 'You\'re dying, broh!';
    }
  },
  'Wound Fatigue': function (effect, index) {
    if (this.hp['Wound Fatigue'] > -1) {
      delete this.statusEffects[index];
    } else {
      if (this.situational_init_bonus !== 'No Combat') {
        this.situational_init_bonus += -5;
      }
      this.situational_mod += -10;
      this.statusEffects[index].description = 'Situational Modifier: -10%. Initiative: -5';
    }
  },
  'Number of Defenses': Rx.merge(MML.meleeDefense, MML.missileDefense, MML.grappleDefense)
    .pipe(
      map(function (effect, index) {
        if (state.MML.gm.roundStarted === false) {
          delete this.statusEffects[index];
        } else {
          this.missile_defense_mod += -20 * effect.number;
          this.melee_defense_mod += -20 * effect.number;
          this.statusEffects[index].description = 'Defense Modifier: ' + (-20 * effect.number) + '%';
        }
      }),
      takeUntil(MML.newRound)
    ),
  'Fatigue': function (effect, index) {
    if (effect.level < 1) {
      delete this.statusEffects[index];
    } else {
      if (this.situational_init_bonus !== 'No Combat') {
        this.situational_init_bonus += -5 * effect.level;
      }
      this.situational_mod += -10 * effect.level;
      this.statusEffects[index].description = 'Situational Modifier: ' + -10 * effect.level + '%. Initiative: ' + -5 * effect.level;
    }
  },
  'Sensitive Area': function (effect, index) {
    if (state.MML.gm.inCombat === false || state.MML.gm.currentRound - parseInt(effect.startingRound) > 1) {
      delete this.statusEffects[index];
    } else {
      if (this.situational_init_bonus !== 'No Combat') {
        this.situational_init_bonus += -5;
      }
      this.situational_mod += -10;
      this.statusEffects[index].description = 'Situational Modifier: -10%. Initiative: -5';
    }
  },
  'Stumbling': function (effect, index) {
    if (state.MML.gm.inCombat === false || state.MML.gm.currentRound - parseInt(effect.startingRound) > 1) {
      delete this.statusEffects[index];
    } else {
      if (this.situational_init_bonus !== 'No Combat') {
        this.situational_init_bonus += -5;
      }
      this.statusEffects[index].description = 'Initiative: -5';
    }
  },
  'Called Shot': function (effect, index) {
    if (state.MML.gm.inCombat === false ||
      !_.contains(this.action.modifiers, 'Called Shot') ||
      (this.action.attackType !== 'Place a Hold' &&
        _.has(this.statusEffects, 'Holding'))
    ) {
      delete this.statusEffects[index];
    } else {
      this.missile_defense_mod += -10;
      this.melee_defense_mod += -10;
      this.missile_attack_mod += -10;
      this.melee_attack_mod += -10;
      this.casting_mod += -10;

      if (this.situational_init_bonus !== 'No Combat' && !effect.applied) {
        this.actionInitCostMod += -5;
        effect.applied = true;
      }

      this.statusEffects[index].description = 'Attack Modifier: -10%. Defense Modifier: -10%. Initiative: -5';
    }
  },
  'Called Shot Specific': function (effect, index) {
    if (state.MML.gm.inCombat === false || !_.contains(this.action.modifiers, 'Called Shot Specific')) {
      delete this.statusEffects[index];
    } else {
      this.missile_defense_mod += -30;
      this.melee_defense_mod += -30;
      this.melee_attack_mod += -30;
      this.missile_attack_mod += -30;
      this.casting_mod += -30;

      if (this.situational_init_bonus !== 'No Combat') {
        this.actionInitCostMod += -5;
        effect.applied = true;
      }
      this.statusEffects[index].description = 'Attack Modifier: -30%. Defense Modifier: -30%. Initiative: -5';
    }
  },
  'Aggressive Stance': function (effect, index) {
    if (state.MML.gm.inCombat === false || !_.contains(this.action.modifiers, 'Aggressive Stance')) {
      delete this.statusEffects[index];
    } else {
      this.missile_defense_mod += -40;
      this.melee_defense_mod += -40;
      this.melee_attack_mod += 10;
      this.perception_check_mod += -4;
      if (this.situational_init_bonus !== 'No Combat') {
        this.actionInitCostMod += 5;
      }
      this.statusEffects[index].description = 'Attack Modifier: +10%. Defense Modifier: -40%. Initiative: +5. Preception Modifier: -4';
    }
  },
  'Defensive Stance': function (effect, index) {
    if (state.MML.gm.inCombat === false || !_.contains(this.action.modifiers, 'Defensive Stance')) {
      delete this.statusEffects[index];
    } else {
      this.missile_defense_mod += 40;
      this.melee_defense_mod += 40;
      this.melee_attack_mod += -30;
      this.perception_check_mod += -4;
      if (this.situational_init_bonus !== 'No Combat') {
        this.actionInitCostMod += -5;
      }
      this.statusEffects[index].description = 'Attack Modifier: -30%. Defense Modifier: +40%. Initiative: -5. Preception Modifier: -4';
    }
  },
  'Observing': function (effect, index) {
    if (state.MML.gm.inCombat === false ||
      state.MML.gm.roundStarted === false ||
      this.situational_init_bonus === 'No Combat'
    ) {
      delete this.statusEffects[index];
    } else {
      // Observing this round
      this.perception_check_mod += 4;
      this.missile_defense_mod += -10;
      this.melee_defense_mod += -10;
      this.statusEffects[index].description = 'Defense Modifier: -10%. Preception Modifier: +4';
    }
  },
  'Observed': function (effect, index) {
    if (state.MML.gm.inCombat === false || state.MML.gm.currentRound !== parseInt(effect.startingRound)) {
      delete this.statusEffects[index];
    } else {
      this.situational_init_bonus += 5;
      if (MML.isWieldingRangedWeapon(this) &&
        (!_.has(this.statusEffects, 'Damaged This Round') ||
          !_.has(this.statusEffects, 'Dodged This Round') ||
          !_.has(this.statusEffects, 'Melee This Round'))
      ) {
        this.missile_attack_mod += 15;
        this.statusEffects[index].description = 'Missile Attack Modifier: +15%. Initiative: +5';
      } else {
        this.statusEffects[index].description = 'Initiative: +5';
      }
    }
  },
  'Taking Aim': function (effect, index) {
    if (state.MML.gm.inCombat === false ||
      (state.MML.gm.roundStarted === true &&
        _.isObject(state.MML.gm.currentAction) &&
        _.isObject(state.MML.gm.currentAction.character) &&
        state.MML.gm.currentAction.character.name === this.name &&
        state.MML.gm.currentAction.callback !== 'missileAttackAction' &&
        state.MML.gm.currentAction.callback !== 'aimAction' &&
        _.isObject(state.MML.gm.currentAction.parameters) &&
        _.isObject(state.MML.gm.currentAction.parameters.target) &&
        state.MML.gm.currentAction.parameters.target.name !== effect.target.name) ||
      _.has(this.statusEffects, 'Damaged This Round') ||
      _.has(this.statusEffects, 'Dodged This Round') ||
      _.has(this.statusEffects, 'Melee This Round')
    ) {
      delete this.statusEffects[index];
    } else {
      if (effect.level === 1) {
        this.missile_attack_mod += 30;
        this.statusEffects[index].description = 'Missile Attack Modifier: +30%.';
      } else if (effect.level === 2) {
        this.missile_attack_mod += 40;
        this.statusEffects[index].description = 'Missile Attack Modifier: +40%.';
      }
    }
  },
  'Shoot From Cover': function (effect, index) {
    if (state.MML.gm.inCombat === false || !_.contains(this.action.modifiers, 'Shoot From Cover')) {
      delete this.statusEffects[index];
    } else {
      this.missile_attack_mod += -10;
      this.statusEffects[index].description = 'Missile attacks -10%. Missile attacks against -20%';
    }
  },
  'Damaged This Round': function (effect, index) {
    if (state.MML.gm.inCombat === false || state.MML.gm.roundStarted === false) {
      delete this.statusEffects[index];
    } else {
      this.statusEffects[index].description = 'Took damage this round';
    }
  },
  'Dodged This Round': function (effect, index) {
    if (state.MML.gm.inCombat === false || state.MML.gm.roundStarted === false) {
      delete this.statusEffects[index];
    } else {
      this.action.name = 'Movement Only';
      this.action.callback = 'endAction';
      delete this.action.getTargets;
      this.statusEffects[index].description = 'Only movement is allowed the remainder of the round';
    }
  },
  'Melee This Round': function (effect, index) {
    if (state.MML.gm.inCombat === false || state.MML.gm.roundStarted === false) {
      delete this.statusEffects[index];
    } else {
      this.statusEffects[index].description = 'Adds to rounds of exertion';
    }
  },
  'Stunned': function (effect, index) {
    if (state.MML.gm.inCombat === false || state.MML.gm.currentRound - parseInt(effect.startingRound) > effect.duration) {
      delete this.statusEffects[index];
    } else {
      this.action.name = 'Movement Only';
      this.action.callback = 'endAction';
      delete this.action.getTargets;
      this.statusEffects[index].description = 'Only movement is allowed the next ' + effect.duration + ' rounds';
    }
  },
  'Grappled': function (effect, index) {
    if (!state.MML.gm.inCombat) {
      delete this.statusEffects[index];
    } else if (_.has(this.statusEffects, 'Overborne') || _.has(this.statusEffects, 'Taken Down')) {
      this.statusEffects[index].description = 'Effect does not stack with Overborne or Taken Down';
    } else {
      this.situational_mod += -10;
      this.statusEffects[index].description = 'Situational Modifier: -10%.';
    }
  },
  'Held': function (effect, index) {
    if (!state.MML.gm.inCombat) {
      delete this.statusEffects[index];
    } else {
      this.missile_defense_mod += -20;
      this.melee_defense_mod += -20;
      this.melee_attack_mod += -10;
      this.statusEffects[index].description = 'Attack Modifier: -10%. Defense Modifier: -20';
    }
  },
  'Holding': function (effect, index) {
    if (!state.MML.gm.inCombat) {
      delete this.statusEffects[index];
    } else {
      this.missile_defense_mod += -20;
      this.melee_defense_mod += -20;
      this.melee_attack_mod += -15;
      this.statusEffects[index].description = 'Attack Modifier: -15%. Defense Modifier: -20%';
    }
  },
  'Pinned': function (effect, index) {
    if (!state.MML.gm.inCombat) {
      delete this.statusEffects[index];
    } else {
      if (this.situational_init_bonus !== 'No Combat') {
        this.situational_init_bonus += -10;
      }
      this.situational_mod += -20;

      this.statusEffects[index].description = 'Situational Modifier: -20%. Initiative: -10';
    }
  },
  'Taken Down': function (effect, index) {
    if (!state.MML.gm.inCombat ||
      (!_.has(this.statusEffects, 'Grappled') &&
        !_.has(this.statusEffects, 'Held') &&
        !_.has(this.statusEffects, 'Holding') &&
        !_.has(this.statusEffects, 'Pinned'))
    ) {
      delete this.statusEffects[index];
    } else {
      if (this.situational_init_bonus !== 'No Combat') {
        this.situational_init_bonus += -15;
      }
      this.situational_mod += -10;

      this.statusEffects[index].description = 'Situational Modifier: -10%. Initiative: -15';
    }
  },
  'Overborne': function (effect, index) {
    if (!state.MML.gm.inCombat ||
      (!_.has(this.statusEffects, 'Grappled') &&
        !_.has(this.statusEffects, 'Held') &&
        !_.has(this.statusEffects, 'Holding') &&
        !_.has(this.statusEffects, 'Pinned'))
    ) {
      delete this.statusEffects[index];
    } else {
      if (this.situational_init_bonus !== 'No Combat') {
        this.situational_init_bonus += -15;
      }
      this.missile_defense_mod += -40;
      this.melee_defense_mod += -30;
      this.melee_attack_mod += -20;
      this.statusEffects[index].description = 'Attack Modifier: -20%. Defense Modifier: -30%. Dodge Modifier: -40%. Initiative: -15';
    }
  },
  'Hasten Spell': function (effect, index) {
    if (state.MML.gm.inCombat === false || !_.contains(this.action.modifiers, 'Hasten Spell')) {
      delete this.statusEffects[index];
    } else {
      this.casting_mod += -10;
      this.statusEffects[index].description = 'Casting Modifier: -10%';
      if (this.situational_init_bonus !== 'No Combat' && this.action.spell.actions === 1) {
        this.actionInitCostMod += 5;
        this.statusEffects[index].description += '. Initiative: +5';
      } else {
        if (!effect.applied) {
          this.action.spell.actions -= 1;
          effect.applied = true;
        }
        this.statusEffects[index].description += '. Spell Actions Required: -1';
      }
    }
  },
  'Ease Spell': function (effect, index) {
    if (state.MML.gm.inCombat === false || this.action.ts !== effect.ts) {
      delete this.statusEffects[index];
    } else {
      this.casting_mod += 10;
      if (!effect.applied) {
        this.action.spell.actions += 1;
        effect.applied = true;
      }
      this.statusEffects[index].description = 'Casting Modifier: +10%. Spell Actions Required: +1';
    }
  },
  'Release Opponent': function (effect, index) {},
  'Ready Item': function (effect, index) {
    if (state.MML.gm.inCombat === false || state.MML.gm.currentRound !== parseInt(effect.startingRound)) {
      delete this.statusEffects[index];
    } else {
      this.actionInitCostMod += -10;
      this.statusEffects[index].description = 'Initiative: -10';
    }
  },
  'Changed Action': function (effect, index) {
    if (state.MML.gm.inCombat === false || state.MML.gm.roundStarted === false) {
      delete this.statusEffects[index];
    } else {
      this.situational_init_bonus += -10 * effect.level;
      this.statusEffects[index].description = 'Initiative: ' + (-10 * effect.level);
    }
  }
};