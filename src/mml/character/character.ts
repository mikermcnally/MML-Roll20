import * as Rx from "rxjs";
import { filter, map, first, shareReplay, startWith, switchMap, } from "rxjs/operators";
import * as Roll20 from "../../roll20/roll20";
import { IGameEvent, Round } from "../../mml/mml";
import { createAbility, createAttribute, ChangeAttributeCurrent, Integer, Point, ChangeCharacterName, AddAttribute } from "../../utilities/utilities";
import {
  AttributeProperties,
  Id,
  IR20Campaign,
  IR20Character,
  IR20ChatMessage,
  IR20Object,
  IR20Path,
  LineEffectType,
  ObjectType,
  PointEffectType,
  IR20CustomFX,
  IR20Token,
  TokenProperties,
  CharacterProperties,
  IR20Attribute
} from "../../roll20/roll20";
import { listenForRoute, Routes, IRoute } from "../routes";
import { ButtonPressed } from "../main";
import { CharacterRouter } from "./router";
import { BodyTypes } from "./bodies/bodies";

export class Character {
  private attribute_changed: Rx.Observable<IR20Attribute>;
  private game_events: Rx.Observable<IGameEvent>;
  private router: CharacterRouter;

  readonly id: IR20Character['id'];
  readonly name: Rx.Observable<string>;
  readonly token: Rx.Observable<IR20Token>;
  readonly position: Rx.Observable<Point> = this.token.pipe(map(token => new Point(token.top, token.left)));
  readonly body_type: Rx.Observable<BodyTypes>;
  readonly height: Rx.Observable<Integer.Unsigned>;
  readonly weight: Rx.Observable<Integer.Unsigned>;
  readonly stature: Rx.Observable<Integer.Unsigned>;
  readonly strength: Rx.Observable<Integer.Unsigned>;
  readonly coordination: Rx.Observable<Integer.Unsigned>;
  readonly health: Rx.Observable<Integer.Unsigned>;
  readonly beauty: Rx.Observable<Integer.Unsigned>;
  readonly intellect: Rx.Observable<Integer.Unsigned>;
  readonly reason: Rx.Observable<Integer.Unsigned>;
  readonly creativity: Rx.Observable<Integer.Unsigned>;
  readonly presence: Rx.Observable<Integer.Unsigned>;
  readonly willpower: Rx.Observable<Integer.Unsigned>;
  readonly perception: Rx.Observable<Integer.Unsigned>;
  readonly evocation: Rx.Observable<Integer.Unsigned>;
  readonly systemStrength: Rx.Observable<Integer.Unsigned>;
  readonly fitness: Rx.Observable<Integer.Unsigned>;
  readonly fitnessMod: Rx.Observable<Integer.Unsigned>;
  readonly load: Rx.Observable<Integer.Unsigned>;
  readonly overhead: Rx.Observable<Integer.Unsigned>;
  readonly deadLift: Rx.Observable<Integer.Unsigned>;
  readonly hpMax: Rx.Observable<>;
  readonly hpRecovery: Rx.Observable<>;

  constructor(roll20_character: IR20Character, game_events: Rx.Observable<IGameEvent>, token_represents: Rx.Observable<IR20Token>) {
    this.id = roll20_character.id;

    this.attribute_changed = ChangeAttributeCurrent.pipe(
      filter(attribute => attribute.get(AttributeProperties.CharacterId) === this.id)
    );

    this.game_events = game_events.pipe(filter(effect => effect.entity_id === this.id));
    
    this.router = new CharacterRouter(this.id);
    

    // Rx.add_attribute
    // Rx.change_attribute_current

    // Object.defineProperty(character, 'player', {
    //   get: function () {
    //     return MML.players[MML.getCurrentAttribute(character.id, 'player')];
    //   },

    // const epMax = evocation;

    // const ep = _.isUndefined(getAttrByName(character.id, 'ep', 'current')) ? character.evocation : MML.getCurrentAttributeAsFloat(character.id, 'ep');

    // const fatigueMax = fitness;
    // const fatigue = isNaN(parseFloat(MML.getCurrentAttribute(character.id, 'fatigue'))) ? character.fitness : MML.getCurrentAttributeAsFloat(character.id, 'fatigue');
    // const knockdown = isNaN(parseFloat(MML.getCurrentAttribute(character.id, 'knockdown'))) ? character.knockdown_max : MML.getCurrentAttributeAsFloat(character.id, 'knockdown');

    // #region Input Attributes
    this.name = ChangeCharacterName.pipe(
      filter(changed_character => changed_character.id === this.id),
      map(changed_character => changed_character.get(CharacterProperties.Name)),
      startWith(roll20_character.get(CharacterProperties.Name))
    );

    this.token = token_represents.pipe(
      filter(token => token.represents === this.id && token.pageid === Campaign().playerpageid),
      shareReplay(1)
    );

    // this.position = this.token.pipe(map(token => new Point(token.top, token.left)));

    this.action = this.game_events.pipe(
      filter(({ attribute }) => attribute === 'action'),
      switchMap(({ value }) => value)
    );

    createAttribute('race', 'Human', '', this.id);
    createAttribute('gender', 'Male', '', this.id);
    createAttribute('stature_roll', '6', '', this.id);
    createAttribute('strength_roll', '6', '', this.id);
    createAttribute('coordination_roll', '6', '', this.id);
    createAttribute('health_roll', '6', '', this.id);
    createAttribute('beauty_roll', '6', '', this.id);
    createAttribute('intellect_roll', '6', '', this.id);
    createAttribute('reason_roll', '6', '', this.id);
    createAttribute('creativity_roll', '6', '', this.id);
    createAttribute('presence_roll', '6', '', this.id);
    createAttribute('fom_init_bonus', '6', '', this.id);
    createAttribute('right_hand', JSON.stringify({ _id: 'empty_hand' }), '', this.id);
    createAttribute('left_hand', JSON.stringify({ _id: 'empty_hand' }), '', this.id);
    createAbility('Menu', '!MML /character/' + this.id, this.id, true);
    const stature_roll = this.attribute_changed.pipe(this.rollAttributeChanged('stature_roll'));
    const strength_roll = this.attribute_changed.pipe(this.rollAttributeChanged('strength_roll'));
    const coordination_roll = this.attribute_changed.pipe(this.rollAttributeChanged('coordination_roll'));
    const health_roll = this.attribute_changed.pipe(this.rollAttributeChanged('health_roll'));
    const beauty_roll = this.attribute_changed.pipe(this.rollAttributeChanged('beauty_roll'));
    const intellect_roll = this.attribute_changed.pipe(this.rollAttributeChanged('intellect_roll'));
    const reason_roll = this.attribute_changed.pipe(this.rollAttributeChanged('reason_roll'));
    const creativity_roll = this.attribute_changed.pipe(this.rollAttributeChanged('creativity_roll'));
    const presence_roll = this.attribute_changed.pipe(this.rollAttributeChanged('presence_roll'));
    const race = this.attribute_changed.pipe(MML.inputAttributeChanged('race'));
    const gender = this.attribute_changed.pipe(MML.inputAttributeChanged('gender'));
    const handedness = this.attribute_changed.pipe(MML.inputAttributeChanged('handedness'));

    // const inventory = MML.getCurrentAttributeObject(character.id, 'inventory').pipe(startWith({
    //   emptyHand: {
    //     type: 'empty',
    //     weight: 0
    //   }));
    // const leftHand = _.isEmpty(MML.getCurrentAttributeObject(character.id, 'leftHand')) ? JSON.stringify({
    //   _id: 'emptyHand',
    //   grip: 'unarmed'
    // }) : MML.getCurrentAttributeObject(character.id, 'leftHand');

    // const rightHand = _.isEmpty(MML.getCurrentAttributeObject(character.id, 'rightHand')) ? JSON.stringify({
    //   _id: 'emptyHand',
    //   grip: 'unarmed'
    // }) : MML.getCurrentAttributeObject(character.id, 'rightHand');
    // const spells = MML.getCurrentAttributeAsArray(character.id, 'spells');
    // #endregion

    // #region Derived Attributes
    this.body_type = MML.derivedAttribute('body_type', race => MML.body_types[race], race);
    this.height = MML.derivedAttribute('height', (race, gender, stature_roll) => MML.statureTables[race][gender][stature_roll].height, race, gender, stature_roll);
    this.weight = MML.derivedAttribute('weight', (race, gender, stature_roll) => MML.statureTables[race][gender][stature_roll].weight, race, gender, stature_roll);
    this.stature = MML.derivedAttribute('stature', (race, gender, stature_roll) => MML.statureTables[race][gender][stature_roll].stature, race, gender, stature_roll);
    this.strength = MML.derivedAttribute('strength', (race, strength_roll) => MML.racialAttributeBonuses[race].strength + strength_roll, race, strength_roll);
    this.coordination = MML.derivedAttribute('coordination', (race, coordination_roll) => MML.racialAttributeBonuses[race].coordination + coordination_roll, race, coordination_roll);
    this.health = MML.derivedAttribute('health', (race, health_roll) => MML.racialAttributeBonuses[race].health + health_roll, race, health_roll);
    this.beauty = MML.derivedAttribute('beauty', (race, beauty_roll) => MML.racialAttributeBonuses[race].beauty + beauty_roll, race, beauty_roll);
    this.intellect = MML.derivedAttribute('intellect', (race, intellect_roll) => MML.racialAttributeBonuses[race].intellect + intellect_roll, race, intellect_roll);
    this.reason = MML.derivedAttribute('reason', (race, reason_roll) => MML.racialAttributeBonuses[race].reason + reason_roll, race, reason_roll);
    this.creativity = MML.derivedAttribute('creativity', (race, creativity_roll) => MML.racialAttributeBonuses[race].creativity + creativity_roll, race, creativity_roll);
    this.presence = MML.derivedAttribute('presence', (race, presence_roll) => MML.racialAttributeBonuses[race].presence + presence_roll, race, presence_roll);
    this.willpower = MML.derivedAttribute('willpower', (presence, health) => Math.round((2 * presence + health) / 3), presence, health);
    this.perception = MML.derivedAttribute('perception', (race, intellect, reason, creativity) => Math.round((intellect + reason + creativity) / 3) + MML.racialAttributeBonuses[race].perception, race, intellect, reason, creativity);
    this.systemStrength = MML.derivedAttribute('systemStrength', (presence, health) => Math.round((presence + 2 * health) / 3), presence, health);
    this.fitness = MML.derivedAttribute('fitness', (race, health, strength) => Math.round((health + strength) / 2) + MML.racialAttributeBonuses[race].fitness, race, health, strength);
    this.fitnessMod = MML.derivedAttribute('fitnessMod', fitness => MML.fitnessModLookup[fitness], fitness);
    this.load = MML.derivedAttribute('load', (race, stature, fitnessMod) => Math.round(stature * fitnessMod) + MML.racialAttributeBonuses[race].load, race, stature, fitnessMod);
    this.overhead = MML.derivedAttribute('overhead', load => load * 2, load);
    this.deadLift = MML.derivedAttribute('deadLift', load => load * 4, load);
    this.hpMax = MML.derivedAttribute('hpMax', MML.buildHpAttribute, race, stature, strength, health, willpower);
    this.hpRecovery = MML.derivedAttribute('hpRecovery', health => MML.recoveryMods[health].hp, health);
    this.evocation = MML.derivedAttribute('evocation', (race, intellect, reason, creativity, health, willpower) => intellect + reason + creativity + health + willpower + MML.racialAttributeBonuses[race].evocation,
      race,
      intellect,
      reason,
      creativity,
      health,
      willpower
    );
    const epRecovery = MML.derivedAttribute('epRecovery', health => MML.recoveryMods[health].ep, health);
    const totalWeightCarried = MML.derivedAttribute('totalWeightCarried', inventory => _.reduce(_.pluck(inventory, 'weight'), (sum, num) => sum + num, 0), inventory);
    const knockdown_max = MML.derivedAttribute('knockdown_max', Math.round(stature + (totalWeightCarried / 10)), stature, totalWeightCarried);
    const armorProtectionValues = ML.derivedAttribute(MML.buildApvMatrix, body_type, inventory);
    const movement_ratio = MML.derivedAttribute('movement_ratio', function (load, totalWeightCarried) {
      const movement_ratio = totalWeightCarried === 0 ? Math.round(10 * load) / 10 : Math.round(10 * load / totalWeightCarried) / 10;
      return movement_ratio > 4.0 ? 4.0 : movement_ratio;
    }, load, totalWeightCarried);

    const attributeDefenseMod = MML.derivedAttribute('attributeDefenseMod', (strength, coordination) => MML.attributeMods.strength[strength] + MML.attributeMods.coordination[coordination], strength, coordination);
    const attributemelee_attack_mod = MML.derivedAttribute('attributemelee_attack_mod', (strength, coordination) => MML.attributeMods.strength[strength] + MML.attributeMods.coordination[coordination], strength, coordination);
    const attributemissile_attack_mod = MML.derivedAttribute('attributemissile_attack_mod', (strength, coordination, perception) => MML.attributeMods.perception[perception] + MML.attributeMods.coordination[coordination] + MML.attributeMods.strength[strength], strength, coordination, perception);
    const meleeDamageMod = MML.derivedAttribute('meleeDamageMod', load => _.find(MML.meleeDamageMods, ({ high, low }) => load >= low && load <= high).value, load);
    const spellLearningMod = MML.derivedAttribute('spellLearningMod', intellect => MML.attributeMods.intellect[intellect], intellect);

    // const hitTable = MML.getHitTable(character);
    // #endregion

    // #region Variable Attributes
    const movementAvailable = MML.getCurrentAttributeAsFloat(character.id, 'movementAvailable');
    const movementType = MML.getCurrentAttribute(character.id, 'movementType');
    const pathID = MML.getCurrentAttribute(character.id, 'pathID');
    const situational_mod = MML.getCurrentAttributeAsFloat(character.id, 'situational_mod');
    const melee_defense_mod = MML.getCurrentAttributeAsFloat(character.id, 'melee_defense_mod');
    const missile_defense_mod = MML.getCurrentAttributeAsFloat(character.id, 'missile_defense_mod');
    const melee_attack_mod = MML.getCurrentAttributeAsFloat(character.id, 'melee_attack_mod');
    const missile_attack_mod = MML.getCurrentAttributeAsFloat(character.id, 'missile_attack_mod');
    const casting_mod = MML.getCurrentAttributeAsFloat(character.id, 'casting_mod');
    const statureCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'statureCheckMod');
    const strengthCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'strengthCheckMod');
    const coordinationCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'coordinationCheckMod');
    const healthCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'healthCheckMod');
    const beautyCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'beautyCheckMod');
    const intellectCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'intellectCheckMod');
    const reasonCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'reasonCheckMod');
    const creativityCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'creativityCheckMod');
    const presenceCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'presenceCheckMod');
    const willpowerCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'willpowerCheckMod');
    const evocationCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'evocationCheckMod');
    const perception_check_mod = MML.getCurrentAttributeAsFloat(character.id, 'perception_check_mod');
    const systemStrengthCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'systemStrengthCheckMod');
    const fitnessCheckMod = MML.getCurrentAttributeAsFloat(character.id, 'fitnessCheckMod');
    const statusEffects = MML.getCurrentAttributeObject(character.id, 'statusEffects');
    const initiative_roll_value = MML.getCurrentAttributeAsFloat(character.id, 'initiative_roll_value');
    const situational_init_bonus = MML.getCurrentAttributeAsFloat(character.id, 'situational_init_bonus');
    const actionInitCostMod = MML.getCurrentAttributeAsFloat(character.id, 'actionInitCostMod');
    const hp = game_state.pipe(
      filter(effect => effect.attribute === 'hp'),
      scan(function (current, effect) {
        current[effect.body_part] += effect.change;
        return current;
      }, _.isUndefined(getAttrByName(character.id, 'hp', 'current')) ? MML.buildHpAttribute(character) : MML.getCurrentAttributeObject(id, 'hp'))
    );
    // #endregion

    // #region Saves
    const major_wound_save = Rx.combineLatest(hpMax, hp.pipe(pairwise())).pipe(
      filter(function ([max, [previous, current]]) {
        return Object.keys(max).reduce(function (save_needed, body_part) {
          const half_max = Math.round(max[body_part] / 2);
          const current_hp = current[body_part];
          if (current_hp < half_max && current_hp >= 0) { //Major wound
            if (initialHP >= half_max) { //Fresh wound
              duration = half_max - current_hp;
            } else if (!_.has(character.statusEffects, 'Major Wound, ' + bodyPart)) {
              duration = -hpAmount;
            } else { //Add damage to duration of effect
              duration = parseInt(character.statusEffects['Major Wound, ' + bodyPart].duration) - hpAmount;
            }
            await MML.displayMenu(player, character.name + '\'s Major Wound Roll', ['Roll']);
            const result = await MML.attributeCheckRoll(player, character.willpower);
            if (result === 'Failure') {
              MML.addStatusEffect(character, 'Major Wound, ' + bodyPart, {
                duration: duration,
                startingRound: state.MML.gm.currentRound,
                bodyPart: bodyPart
              });
            }
          }
          return save_needed;
        }, false)
      }),
      concatMap(MML.attributeCheckRoll)
    )
    // #endregion

    // #region Initaitive Attributes
    const attribute_init_bonus = MML.derivedAttribute('attribute_init_bonus', function (strength, coordination, reason, perception) {
      const ranking_attribute = _.max([strength, coordination, reason, perception]);

      if (ranking_attribute < 10) {
        return -1;
      } else if (ranking_attribute === 10 || ranking_attribute === 11) {
        return 0;
      } else if (ranking_attribute === 12 || ranking_attribute === 13) {
        return 1;
      } else if (ranking_attribute === 14 || ranking_attribute === 15) {
        return 2;
      } else if (ranking_attribute === 16 || ranking_attribute === 17) {
        return 3;
      } else if (ranking_attribute === 18 || ranking_attribute === 19) {
        return 4;
      } else {
        return 5;
      }
    }, strength, coordination, reason, perception);

    const movement_ratio_init_bonus = MML.derivedAttribute('movement_ratio_init_bonus', function (movement_ratio) {
      if (movement_ratio < 0.6) {
        return 'No Combat';
      } else if (movement_ratio === 0.6) {
        return -4;
      } else if (movement_ratio < 0.7 && movement_ratio <= 0.8) {
        return -3;
      } else if (movement_ratio > 0.8 && movement_ratio <= 1.0) {
        return -2;
      } else if (movement_ratio > 1.0 && movement_ratio <= 1.2) {
        return -1;
      } else if (movement_ratio > 1.2 && movement_ratio <= 1.4) {
        return 0;
      } else if (movement_ratio > 1.4 && movement_ratio <= 1.7) {
        return 1;
      } else if (movement_ratio > 1.7 && movement_ratio <= 2.0) {
        return 2;
      } else if (movement_ratio > 2.0 && movement_ratio <= 2.5) {
        return 3;
      } else if (movement_ratio > 2.5 && movement_ratio <= 3.2) {
        return 4;
      } else (movement_ratio > 3.2) {
        return 5;
      }
    }, movement_ratio);

    const initiative = MML.derivedAttribute('initiative', function (initiative_roll_value, situational_init_bonus, movement_ratio_init_bonus, attribute_init_bonus, sense_init_bonus, fom_init_bonus, first_action_init_bonus, spent_initiative) {
      if ([situational_init_bonus, movement_ratio_init_bonus].includes('No Combat')) {
        return 0;
      }

      const initiative = initiative_roll_value +
        situational_init_bonus +
        movement_ratio_init_bonus +
        attribute_init_bonus +
        sense_init_bonus +
        fom_init_bonus +
        first_action_init_bonus +
        spent_initiative;

      return initiative < 0 || state.MML.gm.roundStarted === false ? 0 : initiative;
    }, initiative_roll_value, situational_init_bonus, movement_ratio_init_bonus, attribute_init_bonus, sense_init_bonus, fom_init_bonus, first_action_init_bonus, spent_initiative);

    const sense_init_bonus = MML.derivedAttribute('sense_init_bonus', function (inventory) {
      var bits_of_helm = [
        'Barbute Helm',
        'Bascinet Helm',
        'Camail',
        'Camail-Conical',
        'Cap',
        'Cheeks',
        'Conical Helm',
        'Duerne Helm',
        'Dwarven War Hood',
        'Face Plate',
        'Great Helm',
        'Half-Face Plate',
        'Hood',
        'Nose Guard',
        'Pot Helm',
        'Sallet Helm',
        'Throat Guard',
        'War Hat'
      ];
      var sense_array = _.filter(inventory, item => item.type === 'armor' && bits_of_helm.includes(item.name));

      if (sense_array.length === 0) {
        //nothing on head
        return 4;
      } else {
        if (sense_array.includes('Great Helm') || (sense_array.includes('Sallet Helm') && sense_array.includes('Throat Guard'))) {
          //Head fully encased in metal
          return -2;
        } else if (_.intersection(sense_array, ['Barbute Helm',
          'Sallet Helm',
          'Bascinet Helm', 'Duerne Helm', 'Cap', 'Pot Helm', 'Conical Helm', 'War Hat'
        ]).length > 0) {
          //wearing a helm
          if (sense_array.includes('Face Plate')) {
            //Has faceplate
            if (_.intersection(sense_array, ['Barbute Helm', 'Bascinet Helm', 'Duerne Helm']).length > 0) {
              //Enclosed Sides
              return -2;
            } else {
              return -1;
            }
          } else if (_.intersection(sense_array, ['Barbute Helm', 'Sallet Helm', 'Bascinet Helm', 'Duerne Helm', 'Half-Face Plate']).length > 0) {
            //These types of helms or half face plate
            return 0;
          } else if (_.intersection(sense_array, ['Camail', 'Camail-Conical', 'Cheeks']).length > 0) {
            //has camail or cheeks
            return 1;
          } else if (_.intersection(sense_array, ['Dwarven War Hood', 'Hood']).length > 0) {
            //Wearing a hood
            return sense_array.reduce(function (min, piece) {
              if ((piece.name === 'Dwarven War Hood' || piece.name === 'Hood') && piece.family !== 'Cloth') {
                return 1;
              }
              return min;
            }, 2);
          } else if (sense_array.includes('Nose Guard')) {
            //has nose guard
            return 2;
          } else {
            // just a cap
            return 3;
          }
        } else if (_.intersection(sense_array, ['Dwarven War Hood', 'Hood']).length > 0) {
          //Wearing a hood
          return sense_array.reduce(function (min, piece) {
            if ((piece.name === 'Dwarven War Hood' || piece.name === 'Hood') && piece.family !== 'Cloth') {
              return 1;
            }
            return min;
          }, 2);
        }
      }
    });

    const fom_init_bonus = MML.getCurrentAttributeAsFloat(character.id, 'fom_init_bonus');
    const first_action_init_bonus = MML.getCurrentAttributeAsFloat(character.id, 'first_action_init_bonus');
    const spent_initiative = MML.getCurrentAttributeAsFloat(character.id, 'spent_initiative');

    // #endregion

    const actionTempo = action.pipe(
      withLatestFrom(is_dual_wielding),
      map(function ([action, is_dual_wielding]) {
        var tempo;

        if (_.isUndefined(action.skill) || action.skill < 30) {
          tempo = 0;
        } else if (action.skill < 40) {
          tempo = 1;
        } else if (action.skill < 50) {
          tempo = 2;
        } else if (action.skill < 60) {
          tempo = 3;
        } else if (action.skill < 70) {
          tempo = 4;
        } else {
          tempo = 5;
        }

        // If Dual Wielding
        if (action.name === 'Attack' && is_dual_wielding) {
          var twfSkill = weaponskills['Two Weapon Fighting'].level;
          if (twfSkill > 19 && twfSkill) {
            tempo += 1;
          } else if (twfSkill >= 40 && twfSkill < 60) {
            tempo += 2;
          } else if (twfSkill >= 60) {
            tempo += 3;
          }
          // If Dual Wielding identical weapons
          if (inventory[leftHand._id].name === inventory[rightHand._id].name) {
            tempo += 1;
          }
        }
        return MML.attackTempoTable[tempo];
      }));

    const newRoundUpdate = MML.newRound.pipe(map(function (character) {
      if (_.has(character.statusEffects, 'Melee This Round')) {
        var fatigueRate = 1;
        if (_.has(character.statusEffects, 'Pinned')) {
          fatigueRate = 2;
        }
        character.roundsExertion += fatigueRate;
        character.roundsRest = 0;

        if (!_.has(character.statusEffects, 'Fatigue')) {
          if (character.roundsExertion > character.fitness) {
            await MML.fatigueCheck(player, character);
          }
        } else {
          if (character.roundsExertion > Math.round(character.fitness / 2)) {
            await MML.fatigueCheck(player, character);
          }
        }
      } else if (_.has(character.statusEffects, 'Fatigue') || character.roundsExertion > 0) {
        character.roundsRest++;
        if (character.roundsRest > 5) {
          await MML.fatigueRecovery(player, character);
        }
      }

      // Reset knockdown number
      character.knockdown = character.knockdown_max;
      character.spent_initiative = 0;

      character.action = {
        ts: _.isUndefined(character.previousAction) ? Date.now() : character.previousAction.ts,
        modifiers: [],
        weapon: MML.getEquippedWeapon(character)
      };
      if (_.has(character.statusEffects, 'Observing')) {
        MML.addStatusEffect(character, 'Observed', {
          startingRound: state.MML.gm.currentRound
        });
      }
      return character;
    }));

    const character_moved = MML.character_moved.pipe(filter(character => character.id === id));

    const character_movement_blocked = character_moved.pipe(

    );

    const moved = token.pipe(
      map(token => token.get('id')),
      switchMap(function (token_id) {
        return Rx.change_token.pipe(
          filter(([curr, prev]) => curr.get('id') === token_id && curr.get('left') !== prev['left'] || curr.get('top') !== prev['top'])
        );
      }),
    );

    const distance_moved = moved.pipe(map(([curr, prev]) => MML.getDistanceFeet(prev['left'], curr.get('left'), prev['top'], curr.get('top'))));
    const is_acting = gm.actor.pipe(map(actor => actor.id === id));
    const movement_type = game_state.pipe(filter(({ attribute }) => attribute === 'movement_type'), switchMap(({ value }) => value));
    const movement_rate = MML.derivedAttribute('movement_rate', (race, movement_type) => MML.movementRates[race][movement_type], race, movement_type);
    const movement_available = gm.round_started.pipe(
      switchMapTo(movement_ratio),
      switchMap(function (initial_movement) {
        return distance_moved.pipe(
          withLatestFrom(movement_rate, is_acting),
          filter(([distance_moved, movement_rate, is_acting]) => is_acting),
          scan(function (current, [distance, rate]) {
            const remaining = current - (distance / rate);
            return remaining > 0 ? remaining : 0;
          }, initial_movement)
        );
      })
    );
    const movement_circle = is_acting.pipe(
      filter(is_acting => is_acting),
      switchMapTo(Rx.combineLatest(token, movement_rate, movement_available)),
      map(function ([token, movement_rate, movement_available]) {
        return MML.drawCirclePath(token.get('left'), token.get('top'), movement_rate * movement_available);
      }),
      takeUntil(is_acting.pipe(filter(is_acting => !is_acting)))
    );

    movement_circle.pipe(switchMap(function (path) {
      return Rx.merge(
        moved,
        is_acting.pipe(filter(is_acting => !is_acting))
      )
        .pipe(mapTo(path));
    }))
      .subscribe(path => path.remove());

    // Block movement when it isn't character's turn
    in_combat.pipe(
      filter(in_combat => in_combat),
      switchMapTo(is_acting.pipe(
        filter(is_acting => !is_acting),
        switchMapTo(moved),
        takeUntil(Rx.merge(
          in_combat.pipe(filter(in_combat => !in_combat)),
          is_acting.pipe(filter(is_acting => is_acting))
        ))
      ))
    )
      .subscribe(function ([token, prev]) {
        token.set('left', prev['left']);
        token.set('top', prev['top']);
      });

    // Send token back to edge of circle if moved beyond
    in_combat.pipe(
      filter(in_combat => in_combat),
      switchMapTo(is_acting.pipe(
        filter(is_acting => !is_acting),
        switchMapTo(moved),
        takeUntil(Rx.merge(
          in_combat.pipe(filter(in_combat => !in_combat)),
          is_acting.pipe(filter(is_acting => is_acting))
        ))
      ))
    )
      .subscribe(function ([token, prev]) {
        if (distance > movement_available) {
          const left_1 = prev['left'];
          const top_1 = prev['left'];
          const left_2 = token.get('left');
          const top_2 = token.get('top');
          const left_3 = Math.floor(((left_2 - left_1) / distance) * distanceAvailable + left_1 + 0.5);
          const top_3 = Math.floor(((top_2 - top_1) / distance) * distanceAvailable + top_1 + 0.5);
          token.set('left', left_3);
          token.set('top', top_3);
        }
      });

    // const velocity = Rx.zip(position).pipe()

    const ready = Rx.merge(
      MML.new_round.pipe(mapTo(false)),
      action.pipe(mapTo(true)),
      MML.end_combat
    )
      .pipe(
        tap(function (is_ready) {
          const token = MML.getCharacterToken(id);
          if (!_.isUndefined(token)) {
            token.set('tint_color', is_ready ? 'transparent' : 'FF0000');
          }
        })
      );

    const available_actions = Rx.combineLatest(
      spells.pipe(map(spell_list => spell_list.length > 0 ? [] : ['Cast'])),
      action_equipment.pipe(every(item => !MML.isRangedWeapon(item)), map(no_ranged => no_ranged ? ['Aim', 'Reload'] : [])),
      status_effects.pipe(filter(effect => effect.attribute === 'available_actions'), pluck('effect'), reduce((forbidden_actions, forbid) => _.uniq(forbidden_actions, forbid))),

    ).pipe(
      map(forbidden_actions => _.difference(['Movement Only', 'Observe', 'Attack', 'Aim', 'Reload'], ...forbidden_actions)),
      swtichMap(actions => Rx.of(actions))
    );

    const action_modifiers = ['Ready Item', 'Release Opponent'];

    const previousAction = MML.getCurrentAttributeObject(character.id, 'previousAction');
    const roundsRest = MML.getCurrentAttributeAsFloat(character.id, 'roundsRest');
    const roundsExertion = MML.getCurrentAttributeAsFloat(character.id, 'roundsExertion');

    const attributecasting_mod = MML.derivedAttribute('attributecasting_mod', function (reason, fom_init_bonus, sense_init_bonus) {
      var attributecasting_mod = MML.attributeMods.reason[reason];

      if (sense_init_bonus < 2 && sense_init_bonus > 0) {
        attributecasting_mod -= 10;
      } else if (sense_init_bonus > -2) {
        attributecasting_mod -= 20;
      } else {
        attributecasting_mod -= 30;
      }

      if (fom_init_bonus === 3 || fom_init_bonus === 2) {
        attributecasting_mod -= 5;
      } else if (fom_init_bonus === 1) {
        attributecasting_mod -= 10;
      } else if (fom_init_bonus === 0) {
        attributecasting_mod -= 15;
      } else if (fom_init_bonus === -1) {
        attributecasting_mod -= 20;
      } else if (fom_init_bonus === -2) {
        attributecasting_mod -= 30;
      }
      return attributecasting_mod;
    }, reason, fom_init_bonus, sense_init_bonus);

    const add_attribute = AddAttribute.pipe(filter(attribute => attribute.get(AttributeProperties.CharacterId) === this.id))
    const skills = add_attribute.pipe(filter(attribute => attribute.get('name').includes('repeating_skills')));
    const weapon_skills = add_attribute.pipe(filter(attribute => attribute.get('name').includes('repeating_weaponskills')));
    const skills =
      function () {
        var characterSkills = MML.getSkillAttributes(character.id, 'skills');
        _.each(
          characterSkills,
          function (characterSkill, skillName) {
            var level = characterSkill.input;
            var attribute = MML.skills[skillName].attribute;

            level += MML.attributeMods[attribute][character[attribute]];

            if (_.isUndefined(MML.skillMods[race]) === false && _.isUndefined(MML.skillMods[race][skillName]) === false) {
              level += MML.skillMods[race][skillName];
            }
            if (_.isUndefined(MML.skillMods[character.gender]) === false && _.isUndefined(MML.skillMods[character.gender][skillName]) === false) {
              level += MML.skillMods[character.gender][skillName];
            }
            characterSkill.level = level;
            MML.setCurrentAttribute(character.id, 'repeating_skills_' + characterSkill._id + '_name', skillName);
            MML.setCurrentAttribute(character.id, 'repeating_skills_' + characterSkill._id + '_input', characterSkill.input);
            MML.setCurrentAttribute(character.id, 'repeating_skills_' + characterSkill._id + '_level', level);
          },
          character
        );

        return characterSkills;
      },

    const weaponSkills =
      function () {
        var characterSkills = MML.getSkillAttributes(character.id, "weaponskills");
        var highestSkill;

        _.each(
          characterSkills,
          function (characterSkill, skillName) {
            var level = characterSkill.input;

            // This may need to include other modifiers
            if (_.isUndefined(MML.weaponSkillMods[race]) === false && _.isUndefined(MML.weaponSkillMods[race][skillName]) === false) {
              level += MML.weaponSkillMods[race][skillName];
            }
            characterSkill.level = level;
          },
          character
        );

        highestSkill = _.max(characterSkills, skill => skill.level).level;
        if (isNaN(highestSkill)) {
          highestSkill = 0;
        }

        if (_.isUndefined(characterSkills["Default Martial"])) {
          characterSkills["Default Martial"] = {
            input: 0,
            level: 0,
            _id: MML.generateRowID()
          };
        }

        if (highestSkill < 20) {
          characterSkills["Default Martial"].level = 1;
        } else {
          characterSkills["Default Martial"].level = Math.round(highestSkill / 2);
        }

        _.each(
          characterSkills,
          function (characterSkill, skillName) {
            MML.setCurrentAttribute(character.id, "repeating_weaponskills_" + characterSkill._id + "_name", skillName);
            MML.setCurrentAttribute(character.id, "repeating_weaponskills_" + characterSkill._id + "_input", characterSkill.input);
            MML.setCurrentAttribute(character.id, "repeating_weaponskills_" + characterSkill._id + "_level", characterSkill.level);
          },
          character
        );
        return characterSkills;
      },

    const fov = MML.derivedAttribute('fov', function (sense_init_bonus) {
      switch (sense_init_bonus) {
        case 4:
          return 180;
        case 3:
          return 170;
        case 2:
          return 160;
        case 1:
          return 150;
        case 0:
          return 140;
        case -1:
          return 130;
        case -2:
          return 120;
        default:
          return 180;
      }
    }, sense_init_bonus);

    const getShieldDefenseBonus(character) {
      const rightHand = character.inventory[character.rightHand._id];
      const leftHand = character.inventory[character.leftHand._id];

      if (!_.isUndefined(rightHand) && rightHand.type === 'shield') {
        return rightHand.defenseMod;
      } else if (!_.isUndefined(leftHand) && leftHand.type === 'shield' && leftHand.defenseMod > rightHand.defenseMod) {
        return leftHand.defenseMod;
      } else {
        return 0;
      }
    };

    const getWeaponGrip(character) {
      if (character['rightHand'].grip !== 'unarmed') {
        return character['rightHand'].grip;
      } else if (character['leftHand'].grip !== 'unarmed') {
        return character['leftHand'].grip;
      } else {
        return 'unarmed';
      }
    };

    const getEquippedWeapon(character) {
      const grip = MML.getWeaponGrip(character);
      var weapon;
      var item;
      var itemId;

      if (MML.isUnarmed(character)) {
        return 'unarmed';
      } else if (character['rightHand'].grip !== 'unarmed') {
        itemId = character.rightHand._id;
        item = character.inventory[itemId];
      } else {
        itemId = character.leftHand._id;
        item = character.inventory[itemId];
      }
      return MML.buildWeaponObject(item, grip);
    };

    const buildWeaponObject(item, grip) {
      var weapon = {
        _id: item._id,
        name: item.name,
        type: 'weapon',
        weight: item.weight,
        family: item.grips[grip].family,
        hands: item.grips[grip].hands
      };

      if (['MWD', 'MWM', 'TWH', 'TWK', 'TWS', 'SLI'].includes(weapon.family)) {
        _.extend(weapon, item.grips[grip]);
        if (weapon.family === 'MWM') {
          weapon.loaded = item.loaded;
        }
      } else {
        _.extend(weapon, {
          defense: item.grips[grip].defense,
          initiative: item.grips[grip].initiative,
          rank: item.grips[grip].rank,
          primary_type: item.grips[grip].primary_type,
          primary_task: item.grips[grip].primary_task,
          primary_damage: item.grips[grip].primary_damage,
          secondary_type: item.grips[grip].secondary_type,
          secondary_task: item.grips[grip].secondary_task,
          secondary_damage: item.grips[grip].secondary_damage
        });
      }
      return weapon;
    };

    const getWeaponAndSkill(character) {
      var itemId;
      var grip;

      if (MML.getWeaponFamily(character, 'rightHand') !== 'unarmed') {
        itemId = character.rightHand._id;
        grip = character.rightHand.grip;
      } else {
        itemId = character.leftHand._id;
        grip = character.leftHand.grip;
      }
      var item = character.inventory[itemId];
      var characterWeapon = MML.buildWeaponObject(item, grip);

      if (!MML.isRangedWeapon(characterWeapon)) {
        if (character.action.attackType === 'secondary') {
          characterWeapon.damageType = item.grips[grip].secondary_type;
          characterWeapon.task = item.grips[grip].secondary_task;
          characterWeapon.damage = item.grips[grip].secondary_damage;
        } else {
          characterWeapon.damageType = item.grips[grip].primary_type;
          characterWeapon.task = item.grips[grip].primary_task;
          characterWeapon.damage = item.grips[grip].primary_damage;
        }
      }

      return {
        characterWeapon: characterWeapon,
        skill: MML.getWeaponSkill(character, item)
      };
    };

    const getWeaponSkill(character, weapon) {
      var item = weapon;
      var skill;

      if (item.type !== 'weapon') {
        log('Not a weapon');
        MML.error();
      }

      const grip = MML.getWeaponGrip(character);
      const skillName = item.name + ['War Spear', 'Boar Spear', 'Military Fork', 'Bastard Sword'].includes(item.name) ? ', ' + grip : '';

      if (_.has(character.weaponSkills, skillName)) {
        return character.weaponSkills[skillName].level;
      } else {
        var relatedSkills = [];
        _.each(character.weaponSkills, function (relatedSkill, skillName) {
          if (skillName !== 'Default Martial') {
            _.each(MML.items[skillName.replace(', ' + grip, '')].grips, function (skillFamily) {
              if (skillFamily.family === item.grips[grip].family) {
                relatedSkills.push(relatedSkill);
              }
            });
          }
        }, character);

        if (relatedSkills.length === 0) {
          return character.weaponSkills['Default Martial'].level;
        } else {
          return _.max(relatedSkills, function (skill) {
            return skill.level;
          }).level - 10;
        }
      }
    };

    const graspers = body_type.pipe(map(function (type) {
      switch (type) {
        case 'humanoid':
          return ['Left', 'Right'];
        default:
          return [];
      }
    }));

    const wielded_weapon_families = function isWieldingWeaponFamily(character, families) {
      return families.includes(getWeaponFamily(character, 'rightHand')) || families.includes(getWeaponFamily(character, 'leftHand'));
    };

    const getWeaponFamily(character, hand) {
      const item = character.inventory[character[hand]._id];
      if (!_.isUndefined(item) && item.type === 'weapon') {
        return item.grips[character[hand].grip].family;
      } else {
        return 'unarmed';
      }
    };

    const isWieldingRangedWeapon = function isWieldingRangedWeapon(character) {
      return isWieldingMissileWeapon(character) || isWieldingThrowingWeapon(character);
    };

    const isWieldingMissileWeapon = function isWieldingMissileWeapon(character) {
      return isWieldingWeaponFamily(character, ['MWD', 'MWM']);
    };

    const isWieldingThrowingWeapon = function isWieldingThrowingWeapon(character) {
      return isWieldingWeaponFamily(character, ['TWH', 'TWK', 'TWS', 'SLI']);
    };

    const isRangedWeapon = function isRangedWeapon(weapon) {
      return ['MWD', 'MWM', 'TWH', 'TWK', 'TWS', 'SLI'].includes(weapon.family);
    };

    const isUnarmed = function isUnarmed(character) {
      return getWeaponFamily(character, 'leftHand') === 'unarmed' && getWeaponFamily(character, 'rightHand') === 'unarmed';
    };

    const is_dual_wielding = Rx.combineLatest(graspers).pipe(map(function (character) {
      const leftHand = getWeaponFamily(character, 'leftHand');
      const rightHand = getWeaponFamily(character, 'rightHand');
      return character.leftHand._id !== character.rightHand._id && leftHand !== 'unarmed' && rightHand !== 'unarmed';
    }));

    // set vision
    Rx.combineLatest(token, in_combat, fov, observing).subscribe(function ([token, in_combat, fov, observing]) {
      if (in_combat || !observing) {
        token.set('light_losangle', fov);
        token.set('light_hassight', true);
      } else {
        token.set('light_losangle', 360);
        token.set('light_hassight', true);
      }
    });
  }

  rollAttributeChanged(name: string) {
    return function (source: Rx.Observable<IR20Attribute>) {
      return source.pipe(
        filter(attribute => attribute.get(AttributeProperties.Name) === name),
        map(function (attribute) {
          const roll = parseFloat(attribute.get(AttributeProperties.Current));
          if (isNaN(roll) || roll < 6) {
            return 6;
          } else if (roll > 20) {
            return 20;
          } else {
            return roll;
          }
        }),
        startWith(getRollAttribute(this.id, name))
      );
    }
}

MML.alterHP = async function alterHP(player, character, bodyPart, hpAmount) {
  var initialHP = character.hp[bodyPart];
  var currentHP = initialHP + hpAmount;
  var maxHP = character.hpMax[bodyPart];

  if (hpAmount < 0) { //if damage
    var duration;
    character.hp[bodyPart] = currentHP;

    //Wounds
    if (currentHP < Math.round(maxHP / 2) && currentHP >= 0) { //Major wound
      if (initialHP >= Math.round(maxHP / 2)) { //Fresh wound
        duration = Math.round(maxHP / 2) - currentHP;
      } else if (!_.has(character.statusEffects, 'Major Wound, ' + bodyPart)) {
        duration = -hpAmount;
      } else { //Add damage to duration of effect
        duration = parseInt(character.statusEffects['Major Wound, ' + bodyPart].duration) - hpAmount;
      }
      await MML.displayMenu(player, character.name + '\'s Major Wound Roll', ['Roll']);
      const result = await MML.attributeCheckRoll(player, character.willpower);
      if (result === 'Failure') {
        MML.addStatusEffect(character, 'Major Wound, ' + bodyPart, {
          duration: duration,
          startingRound: state.MML.gm.currentRound,
          bodyPart: bodyPart
        });
      }
    } else if (currentHP < 0 && currentHP > -maxHP) { //Disabling wound
      if (!_.has(character.statusEffects, 'Disabling Wound, ' + bodyPart)) { //Fresh wound
        duration = -currentHP;
      } else if (_.has(character.statusEffects, 'Stunned')) { //Add damage to duration of effect
        duration = parseInt(character.statusEffects['Stunned'].duration) - hpAmount;
      } else {
        duration = -hpAmount;
      }
      await MML.displayMenu(player, character.name + '\'s Disabling Wound Roll', ['Roll']);
      const result = await MML.attributeCheckRoll(player, character.systemStrength);
      MML.addStatusEffect(character, 'Disabling Wound, ' + bodyPart, {
        bodyPart: bodyPart
      });
      if (result === 'Failure') {
        if (_.has(character.statusEffects, 'Stunned')) {
          character.statusEffects['Stunned'].duration = duration;
        } else {
          MML.addStatusEffect(character, 'Stunned', {
            startingRound: state.MML.gm.currentRound,
            duration: duration
          });
        }
      }
    } else if (currentHP < -maxHP) { //Mortal wound
      MML.addStatusEffect(character, 'Mortal Wound, ' + bodyPart, {
        bodyPart: bodyPart
      });
    }
  } else { //if healing
    character.hp[bodyPart] += hpAmount;
    if (character.hp[bodyPart] > maxHP) {
      character.hp[bodyPart] = maxHP;
    }
  }
  await MML.setWoundFatigue(player, character);
};



MML.knockdownCheck = async function knockdownCheck(player, character, damage) {
  character.knockdown += damage;
  if (character.movementType !== 'Prone' && character.knockdown < 1) {
    await MML.displayMenu(player, character.name + '\'s Knockdown Roll', ['Roll']);
    const result = await MML.attributeCheckRoll(player, character.systemStrength, [_.has(character.statusEffects, 'Stumbling') ? -5 : 0])
    if (result === 'Failure') {
      character.movementType = 'Prone';
    } else {
      MML.addStatusEffect(character, 'Stumbling', {
        startingRound: state.MML.gm.currentRound
      });
    }
  }
};

MML.sensitiveAreaCheck = async function sensitiveAreaCheck(player, character, hitPosition) {
  if (MML.sensitive_areas[character.body_type].includes(hitPosition)) {
    await MML.displayMenu(player, character.name + '\'s Sensitive Area Roll', ['Roll']);
    const result = await MML.attributeCheckRoll(player, character.willpower);
    if (result === 'Failure') {
      MML.addStatusEffect(character, 'Sensitive Area', {
        startingRound: state.MML.gm.currentRound
      });
    }
  }
};

MML.damageCharacter = async function damageCharacter(player, character, damage, type, hitPosition) {
  const reduced_damage = await MML.armorDamageReduction(player, character, hitPosition.name, damage, type);
  await MML.alterHP(player, character, hitPosition.bodyPart, reduced_damage);
  await MML.sensitiveAreaCheck(player, character, hitPosition.name);
  await MML.knockdownCheck(player, character, damage);
};

class StateChange {
  constructor() {

  }
}

class Damage extends StateChange {
  constructor(value, type, hit_position) {
    this.value = value;
    this.type = type;
    this.hit_position = hit_position;
  }
}

const receive_damage = game_state.filter(change => change instanceof Damage);

const knockdown = Rx.of(MML.getCurrentAttributeAsFloat('knockdown')).pipe(
  expand(function (current) {
    return Rx.merge(
      receive_damage.pipe(
        pluck('value'),
        map(damage => current - damage > 0 ? current - damage : 0),
        take(1)
      ),
      current_round.pipe(switchMapTo(knockdown_max))
    );
  })
);

const sensitive_area_hit = sensitive_areas.pipe(
  switchMap(function (sensitive_areas) {
    return receive_damage.pipe(
      pluck('hit_position'),
      filter(hit_position => sensitive_areas.includes(hit_position))
    );
  })
);

const sensitive_area_save = sensitive_area_hit

MML.alterEP = async function alterEP(player, character, epAmount) {
  character.ep += epAmount;
  if (character.ep < Math.round(0.25 * character.epMax)) {
    await MML.fatigueCheck(player, character);
  }
};

MML.armorDamageReduction = async function armorDamageReduction(player, character, position, damage, type) {
  const position_apvs = character.armorProtectionValues[position];
  const base_apvs = position_apvs[type];
  const impact_apvs = position_apvs['Impact'];
  var apv_base;
  var apv_impact;
  if (base_apvs.length > 1) {
    await MML.displayMenu(player, 'Armor Coverage Roll', ['Roll']);
    const coverage_roll = await genericRoll(player, '1d100');
    apv_base = _.find(position_apvs[type], function (apv) {
      return coverage_roll <= apv.coverage;
    }).value;
    apv_impact = _.find(position_apvs.Impact, function (apv) {
      return coverage_roll <= apv.coverage;
    }).value;
  } else {
    apv_base = base_apvs[0];
    apv_impact = impact_apvs[0];
  }
  const base_damage = damage + apv_base;
  if (base_damage > 0 && !['Impact', 'Flanged'].includes(type)) {
    const impact_damage = ['Surface', 'Cut', 'Pierce'].includes(type) ? Math.ceil(damage / 2) : Math.ceil(damage * 0.75);
    if (impact_damage + apv_impact < 0) {
      return impact_damage + apv_impact;
    }
  }
  return 0;
};

MML.equipmentFailure = function equipmentFailure(character) {
  log('equipmentFailure');
};

MML.applyStatusEffects = function applyStatusEffects(character) {
  const dependents = [
    'situational_init_bonus',
    'situational_mod',
    'missile_defense_mod',
    'melee_defense_mod',
    'missile_attack_mod',
    'melee_attack_mod',
    'casting_mod',
    'perception_check_mod'
  ];
  _.each(dependents, function (dependent) {
    character[dependent] = 0;
  }, character);
  _.each(character.statusEffects, function (effect, index) {
    if (index.indexOf('Major Wound') !== -1) {
      MML.statusEffects['Major Wound'].apply(character, [effect, index]);
    } else if (index.indexOf('Disabling Wound') !== -1) {
      MML.statusEffects['Disabling Wound'].apply(character, [effect, index]);
    } else if (index.indexOf('Mortal Wound') !== -1) {
      MML.statusEffects['Mortal Wound'].apply(character, [effect, index]);
    } else {
      MML.statusEffects[index].apply(character, [effect, index]);
    }
    MML.setCurrentAttribute(character.id, 'repeating_statuseffects_' + effect.id + '_statusEffectName', index);
    MML.setCurrentAttribute(character.id, 'repeating_statuseffects_' + effect.id + '_statusEffectDescription', (effect.description ? effect.description : ''));
  });

  const regex = new RegExp('^repeating_statuseffects_.*?_.*?$');
  const statusEffectIDs = _.pluck(character.statusEffects, 'id');
  const statusEffects = filterObjs(function (obj) {
    if (obj.get('type') !== 'attribute' || obj.get('characterid') !== character.id) {
      return false;
    } else {
      return regex.test(obj.get('name'));
    }
  });
  _.each(statusEffects, function (attribute) {
    const name = attribute.get('name', 'current');
    if (_.isString(name) && !statusEffectIDs.some(id => name.includes(id))) {
      attribute.remove();
    }
  });
};

MML.addStatusEffect = function addStatusEffect(character, index, effect) {
  effect.id = MML.generateRowID();
  effect.name = index;
  character.statusEffects[index] = effect;
  MML.applyStatusEffects(character);
};

MML.removeStatusEffect = function removeStatusEffect(character, index) {
  if (!_.isUndefined(character.statusEffects[index])) {
    delete character.statusEffects[index];
    MML.applyStatusEffects(character);
  }
};

MML.updateInventory = function updateInventory(character) {
  const items = _.omit(character.inventory, 'emptyHand');
  _.each(items, function (item, _id) {
    MML.setCurrentAttribute(character.id, 'repeating_items_' + _id + '_itemName', item.name);
    MML.setCurrentAttribute(character.id, 'repeating_items_' + _id + '_itemId', _id);
  }, character);
  items.emptyHand = {
    type: 'empty',
    weight: 0
  };
  character.inventory = items;
};

MML.isSensitiveArea = function isSensitiveArea(position) {
  return [2, 6, 33].includes(position);
};

MML.equipItem = function equipItem(character, itemId, grip) {
  if (grip === 'Left Hand') {
    character.leftHand._id = itemId;
    if (character.inventory[itemId].type === 'weapon') {
      character.leftHand.grip = 'One Hand';
    } else {
      character.leftHand.grip = 'unarmed';
    }
  } else if (grip === 'Right Hand') {
    character.rightHand._id = itemId;
    if (character.inventory[itemId].type === 'weapon') {
      character.rightHand.grip = 'One Hand';
    } else {
      character.rightHand.grip = 'unarmed';
    }
  } else {
    character.leftHand._id = itemId;
    character.leftHand.grip = grip;
    character.rightHand._id = itemId;
    character.rightHand.grip = grip;
  }
};

MML.hasStatusEffects = function hasStatusEffects(character, effects) {
  return !_.isEmpty(_.intersection(_.keys(character.statusEffects), effects));
};

MML.getHitPosition = function getHitPosition(character, rollValue) {
  if (isNaN(rollValue)) {
    return 'Error: Value is not a number';
  } else if (rollValue < 1 || rollValue > 100) {
    return 'Error: Value out of range';
  } else {
    return MML.hitPositions[character.body_type][MML.hitTables[character.body_type][character.hitTable][rollValue - 1]];
  }
};

MML.getHitTable = function getHitTable(body_type, inventory, leftHand, rightHand) {
  switch (character.body_type) {
    case 'humanoid':
      if (character.inventory[character.rightHand._id].type === 'shield' || character.inventory[character.leftHand._id].type === 'shield') {
        return 'C';
      } else if (MML.isWieldingRangedWeapon(character) || MML.isUnarmed(character) || !(character.inventory[character.leftHand._id].type === 'weapon' && character.inventory[character.rightHand._id].type === 'weapon')) {
        return 'A';
      } else {
        return 'B';
      }
    default:
      log('Error: Body type not found');
      return 'Error: Body type not found';
  }
};

MML.getHitPositionNames = function getHitPositionNames(character) {
  if (_.isUndefined(MML.hitPositions[character.body_type])) {
    return 'Error: Body type not found';
  } else {
    return _.pluck(MML.hitPositions[character.body_type], 'name');
  }
};

MML.getBodyParts = function getBodyParts(character) {
  if (_.isUndefined(MML.hitPositions[character.body_type])) {
    return 'Error: Body type not found';
  } else {
    return _.chain(MML.hitPositions[character.body_type])
      .pluck('bodyPart')
      .uniq()
      .value();
  }
};

MML.getBodyPart = function getBodyPart(character, hitPosition) {
  if (_.isUndefined(MML.hitPositions[character.body_type])) {
    return 'Error: Body type not found';
  } else {
    return _.findWhere(MML.hitPositions[character.body_type], {
      name: hitPosition
    });
  }
};

MML.getAvailableHitPositions = function getAvailableHitPositions(character, bodyPart) {
  const availableHitPositions = _.where(MML.hitPositions[character.body_type], {
    bodyPart: bodyPart
  });

  if (availableHitPositions.length < 1) {
    return 'Error: No hit positions found';
  } else {
    return availableHitPositions;
  }
};

MML.getCalledShotHitPosition = function getCalledShotHitPosition(character, rollValue, bodyPart) {
  const availableHitPositions = MML.getAvailableHitPositions(character, bodyPart);
  if (isNaN(rollValue)) {
    return 'Error: Value is not a number';
  } else if (availableHitPositions === 'Error: No hit positions found') {
    return availableHitPositions;
  } else if (rollValue < 1 || rollValue > availableHitPositions.length) {
    return 'Error: Value out of range';
  } else {
    return availableHitPositions[rollValue - 1];
  }
};

MML.buildHpAttribute = function buildHpAttribute(race, stature, strength, health, willpower) {
  switch (character.body_type) {
    case 'humanoid':
      return {
        'Wound Fatigue': Math.round((health + stature + willpower) / 2),
        'Head': MML.HPTables[race][Math.round(health + stature / 3)],
        'Chest': MML.HPTables[race][Math.round(health + stature + strength)],
        'Abdomen': MML.HPTables[race][Math.round(health + stature)],
        'Left Arm': MML.HPTables[race][Math.round(health + stature)],
        'Right Arm': MML.HPTables[race][Math.round(health + stature)],
        'Left Leg': MML.HPTables[race][Math.round(health + stature)],
        'Right Leg': MML.HPTables[race][Math.round(health + stature)],
      };
    default:
      log('Oh No!');
  }
};

MML.getDistanceBetweenCharacters = function getDistanceBetweenCharacters(character, target) {
  return Point.pixelsToFeet(MML.getDistanceBetweenTokens(MML.getCharacterToken(character.id), MML.getCharacterToken(target.id)));
};

MML.getAoESpellTargets = function getAoESpellTargets(spell_marker) {
  switch (spell_marker.get('name')) {
    case 'spellMarkerCircle':
      return MML.getCharactersWithinRadius(spell_marker.get('left'), spell_marker.get('top'), spell_marker.get('width') / 2);
    case 'spellMarkerRectangle':
      return MML.getCharactersWithinRectangle(spell_marker.get('left'), spell_marker.get('top'), spell_marker.get('width'), spell_marker.get('height'), spell_marker.get('rotation'));
    case 'spellMarkerTriangle':
      return MML.getCharactersWithinTriangle(spell_marker.get('left'), spell_marker.get('top'), spell_marker.get('width'), spell_marker.get('height'), spell_marker.get('rotation'));
    default:
  }
};

MML.getCharactersWithinRadius = function getCharactersWithinRadius(left, top, radius) {
  return _.filter(MML.characters, function (character) {
    const token = MML.getCharacterToken(character.id);
    return !_.isUndefined(token) && MML.getDistanceFeet(token.get('left'), left, token.get('top'), top) < MML.raceSizes[character.race].radius + MML.pixelsToFeet(radius);
  });
};

MML.getCharactersWithinRectangle = function getCharactersWithinRectangle(left_original, top_original, width, height, rotation) {
  return _.filter(MML.characters, function (character) {
    const token = MML.getCharacterToken(character.id);
    const [token_left, token_top] = MML.rotateAxes(token.get('left') - left_original, token.get('top') - top_original, rotation);
    const token_radius = MML.feetToPixels(MML.raceSizes[character.race].radius);

    return !_.isUndefined(token) &&
      token_left + token_radius > width / -2 &&
      token_left - token_radius < width / 2 &&
      token_top - token_radius < height / 2 &&
      token_top + token_radius > height / -2
  });
};

MML.getCharactersWithinTriangle = function getCharactersWithinTriangle(left_original, top_original, width, height, rotation) {
  return MML.characters.pipe(pluck('token'), filter(function (character) {
    const token = MML.getCharacterToken(character.id);
    const tokenCoordinates = MML.rotateAxes(token.get('left') - left_original, token.get('top') - top_original, rotation);
    const token_radius = MML.feetToPixels(MML.raceSizes[character.race].radius);
    const ax = (-width * (tokenCoordinates[1] - (height / 2))) / (2 * height);
    const ay = tokenCoordinates[1];
    const bx = tokenCoordinates[0];
    const by = ((-2 * height * tokenCoordinates[0]) / width) + (height / 2);
    const cx = (width * (tokenCoordinates[1] - (height / 2))) / (2 * height);
    const cy = tokenCoordinates[1];
    const dx = tokenCoordinates[0];
    const dy = ((2 * height * tokenCoordinates[0]) / width) + (height / 2);

    return !_.isUndefined(token) &&
      tokenCoordinates[1] - token_radius < height / 2 &&
      tokenCoordinates[1] + token_radius > height / -2 &&
      ((MML.getDistance(ax, tokenCoordinates[0], ay, tokenCoordinates[1]) * MML.getDistance(bx, tokenCoordinates[0], by, tokenCoordinates[1])) / MML.getDistance(ax, bx, ay, by) < tokenRadius ||
        (MML.getDistance(cx, tokenCoordinates[0], cy, tokenCoordinates[1]) * MML.getDistance(dx, tokenCoordinates[0], dy, tokenCoordinates[1])) / MML.getDistance(cx, dx, cy, dy) < tokenRadius ||
        (tokenCoordinates[0] < ax && tokenCoordinates[0] > cx));
  }));
};

MML.getSkill = function getSkill(character, skill) {
  return _.isUndefined(character.skills[skill]) ? 0 : character.skills[skill].level;
};

MML.getMagicSkill = function getMagicSkill(character, spell) {
  const family = spell.family;
  if (['Fire', 'Earth', 'Water', 'Air', 'Life'].includes(spell.family)) {
    const wizardry_skill = MML.getSkill(character, 'Wizardry') - (MML.getSkill(character, 'Lore: Element of ' + family) > 19 ? 10 : 20);
    const elementalism_skill = MML.getSkill(character, family + ' Elementalism');
    if (wizardry_skill > elementalism_skill) {
      return {
        name: 'Wizardry',
        level: wizardry_skill
      };
    } else {
      return {
        name: family + ' Elementalism',
        level: elementalism_skill
      };
    }
  } else if (spell.family === 'Symbolism') {
    return {
      name: 'Symbolism',
      level: MML.getSkill(character, 'Symbolism')
    };
  } else {
    return {
      name: 'Wizardry',
      level: MML.getSkill(character, 'Wizardry')
    };
  }
};

MML.getElementalSkill = function getElementalSkill(character, element) {

};

MML.getEpCost = function getEpCost(skillName, skillLevel, ep) {
  skillName = skillName.replace(/(Earth|Air|Fire|Water|Life)\s/, '');
  if (skillLevel < 6) {
    return MML.epModifiers[skillName][ep][0];
  } else if (skillLevel < 11) {
    return MML.epModifiers[skillName][ep][1];
  } else if (skillLevel < 16) {
    return MML.epModifiers[skillName][ep][2];
  } else if (skillLevel < 21) {
    return MML.epModifiers[skillName][ep][3];
  } else if (skillLevel < 26) {
    return MML.epModifiers[skillName][ep][4];
  } else if (skillLevel < 31) {
    return MML.epModifiers[skillName][ep][5];
  } else if (skillLevel < 36) {
    return MML.epModifiers[skillName][ep][6];
  } else if (skillLevel < 41) {
    return MML.epModifiers[skillName][ep][7];
  } else if (skillLevel < 46) {
    return MML.epModifiers[skillName][ep][8];
  } else if (skillLevel < 51) {
    return MML.epModifiers[skillName][ep][9];
  } else if (skillLevel < 60) {
    return MML.epModifiers[skillName][ep][10];
  } else if (skillLevel < 70) {
    return MML.epModifiers[skillName][ep][11];
  } else {
    return MML.epModifiers[skillName][ep][12];
  }
};

MML.getModifiedCastingChance = function getModifiedCastingChance(character, action) {
  return [
    action.casterSkill,
    action.spell.task,
    character.situational_mod,
    character.casting_mod,
    character.attributecasting_mod,
    _.reduce(_.pluck(action.metaMagic, 'casting_mod'), (sum, num) => sum + num)
  ];
};

MML.getModifiedEpCost = function getModifiedEpCost(metaMagic, epCost) {
  return _.reduce(_.pluck(metaMagic, 'epMod'), (sum, num) => sum + num, 1) * epCost;
};

MML.getAoESpellModifier = function getAoESpellModifier(spell_marker, spell) {
  var area;
  var areaModified;
  var casting_mod;

  if (typeof spell.target === 'string' && spell.target.indexOf('\' Radius')) {
    const base_radius = parseInt(spell.target.replace('\' Radius', ''));
    const modified_radius = MML.pixelsToFeet(spell_marker.get('width') / 2);
    area = Math.pow(base_radius, 2);
    areaModified = Math.pow(modified_radius, 2);
    casting_mod = Math.round(Math.log2(modified_radius / base_radius) * 20);
  } else {
    const height = spell_marker.get('height');
    const width = spell_marker.get('width');
    area = spell.target[0] * spell.target[1];
    areaModified = width * height;
    casting_mod = Math.round(Math.log2(width / spell.target[0]) * 10 + Math.log2(height / spell.target[1]) * 10);
  }

  return {
    epMod: areaModified > area ? Math.pow(areaModified / area, 2) : 0,
    casting_mod: casting_mod > 0 ? 0 : casting_mod
  };
};

MML.getRangecasting_modifier = function getRangecasting_modifier(caster, targets, spell) {
  if (['Caster', 'Touch', 'Single'].includes(spell.target)) {
    return target.reduce(function (mod, target) {
      const distance = MML.getDistanceBetweenCharacters(caster, target);
      if (spell.range === 'Caster' || spell.range === 'Touch') {
        const self_range_mod = spell.range === 'Caster' && target.id !== caster.id ? -10 : 0;
        if (distance > MML.weaponRanks[1].high) {
          return mod + MML.weaponRanks[1].high - distance + self_range_mod;
        }
      } else {
        if (distance > spell.range) {
          return mod + Math.round(((spell.range - distance) / distance) * 10);
        }
      }
    });
  } else {
    const distance = MML.getDistanceBetweenTokens(MML.getCharacterToken(caster.id), MML.getSpellMarkerToken(spell.name));
    return distance > spell.range ? Math.round(((spell.range - distance) / distance) * 10) : 0;
  }
};

MML.removeAimAndObserving = function removeAimAndObserving(character) {
  if (_.has(character.statusEffects, 'Taking Aim')) {
    MML.removeStatusEffect(character, 'Taking Aim');
  }
  if (_.has(character.statusEffects, 'Observing')) {
    MML.removeStatusEffect(character, 'Observing');
  }
};

MML.validateAction = function validateAction(character) {
  switch (character.action.name) {
    case 'Attack':
      switch (character.action.attackType) {
        case 'Grapple':
          if (_.has(character.statusEffects, 'Grappled') &&
            _.has(character.statusEffects, 'Held') &&
            _.has(character.statusEffects, 'Taken Down') &&
            _.has(character.statusEffects, 'Pinned') &&
            _.has(character.statusEffects, 'Overborne')
          ) {
            return false;
          }
          break;
        case 'Regain Feet':
          if (!((_.has(character.statusEffects, 'Grappled') || _.has(character.statusEffects, 'Held') || _.has(character.statusEffects, 'Holding')) &&
            character.movementType === 'Prone') ||
            (!(_.has(character.statusEffects, 'Taken Down') || _.has(character.statusEffects, 'Overborne')) || _.has(character.statusEffects, 'Pinned'))
          ) {
            return false;
          }
          break;
        case 'Place a Hold':
          if (_.has(character.statusEffects, 'Holding') &&
            _.has(character.statusEffects, 'Held') &&
            _.has(character.statusEffects, 'Pinned') &&
            (_.has(character.statusEffects, 'Grappled') && character.statusEffects['Grappled'].targets.length > 1)
          ) {
            return false;
          }
          break;
        case 'Break a Hold':
          if (!_.has(character.statusEffects, 'Held') && !_.has(character.statusEffects, 'Pinned')) {
            return false;
          }
          break;
        case 'Break Grapple':
          if (!_.has(character.statusEffects, 'Grappled')) {
            return false;
          }
          break;
        case 'Takedown':
          if (((!_.has(character.statusEffects, 'Holding') &&
            (!_.has(character.statusEffects, 'Grappled') || character.statusEffects['Grappled'].targets.length > 1) &&
            (!_.has(character.statusEffects, 'Held') || character.statusEffects['Held'].targets.length > 1))) ||
            (_.has(character.statusEffects, 'Grappled') && _.has(character.statusEffects, 'Held')) ||
            character.movementType === 'Prone'
          ) {
            return false;
          }
          break;
        case 'Head Butt':
        case 'Bite':
          if (!_.has(character.statusEffects, 'Held') &&
            !_.has(character.statusEffects, 'Grappled') &&
            !_.has(character.statusEffects, 'Holding') &&
            !_.has(character.statusEffects, 'Taken Down') &&
            !_.has(character.statusEffects, 'Pinned') &&
            !_.has(character.statusEffects, 'Overborne')
          ) {
            return false;
          }
          break;
        default:
      }
      break;
    default:
  }

  return true;
};

MML.buildApvMatrix = function buildApvMatrix(inventory, body_type) {
  const armor = inventory.values()
    .filter(item => item.type === 'armor')
    .reduce();

  var apvMatrix = {};
  // Initialize APV Matrix
  _.each(MML.hitPositions[body_type], function (position) {
    apvMatrix[position.name] = {
      Surface: [{
        value: 0,
        coverage: 100
      }],
      Cut: [{
        value: 0,
        coverage: 100
      }],
      Chop: [{
        value: 0,
        coverage: 100
      }],
      Pierce: [{
        value: 0,
        coverage: 100
      }],
      Thrust: [{
        value: 0,
        coverage: 100
      }],
      Impact: [{
        value: 0,
        coverage: 100
      }],
      Flanged: [{
        value: 0,
        coverage: 100
      }]
    };
  });
  //Creates raw matrix of individual pieces of armor (no layering or partial coverage)

  _.each(armor, function (piece) {
    var material = MML.APVList[piece.material];

    _.each(piece.protection, function (protection) {
      var position = MML.hitPositions[body_type][protection.position].name;
      var coverage = protection.coverage;
      apvMatrix[position].Surface.push({
        value: material.surface,
        coverage: coverage
      });
      apvMatrix[position].Cut.push({
        value: material.cut,
        coverage: coverage
      });
      apvMatrix[position].Chop.push({
        value: material.chop,
        coverage: coverage
      });
      apvMatrix[position].Pierce.push({
        value: material.pierce,
        coverage: coverage
      });
      apvMatrix[position].Thrust.push({
        value: material.thrust,
        coverage: coverage
      });
      apvMatrix[position].Impact.push({
        value: material.impact,
        coverage: coverage
      });
      apvMatrix[position].Flanged.push({
        value: material.flanged,
        coverage: coverage
      });
    });
  });

  //This loop accounts for layered armor and partial coverage and outputs final APVs
  _.each(apvMatrix, function (position, positionName) {
    _.each(position, function (rawAPVArray, type) {
      var apvFinalArray = [];
      var coverageArray = [];

      //Creates an array of armor coverage in ascending order.
      _.each(rawAPVArray, function (armorProtectionValues) {
        if (coverageArray.indexOf(armorProtectionValues.coverage) === -1) {
          coverageArray.push(armorProtectionValues.coverage);
        }
      });
      coverageArray = coverageArray.sort((a, b) => a - b);

      //Creates APV array per damage type per position
      _.each(coverageArray, function (apvCoverage) {
        var apvToLayerArray = [];
        var apvValue = 0;

        //Builds an array of APVs that meet or exceed the coverage value
        _.each(rawAPVArray, function (armorProtectionValues) {
          if (armorProtectionValues.coverage >= apvCoverage) {
            apvToLayerArray.push(armorProtectionValues.value);
          }
        });
        apvToLayerArray = apvToLayerArray.sort(function (a, b) {
          return b - a;
        });

        //Adds the values at coverage value with diminishing returns on layered armor
        _.each(apvToLayerArray, function (value, index) {
          apvValue += value * Math.pow(2, -index);
          apvValue = Math.round(apvValue);
        });
        //Puts final APV and associated Coverage into final APV array for that damage type.
        apvFinalArray.push({
          value: apvValue,
          coverage: apvCoverage
        });
      });
      apvMatrix[positionName][type] = apvFinalArray;
    });
  });
  return apvMatrix;
};

// Rx operators


MML.inputAttributeChanged = function inputAttributeChanged(name) {
  return function (source) {
    return source.pipe(
      filter(attribute => attribute.get('name') === name),
      map(attribute => attribute.get('current'))
    );
  };
};

MML.repeating_attribute_added = on('add:attribute', function (attribute) {
  var id = attribute.get('_characterid');
  var attrName = attribute.get('name');

  if (attrName.includes('repeating_skills') || attrName.includes('repeating_weaponskills')) {
    MML.updateCharacterSheet(characters[id]);
  }
});

MML.derivedAttribute = function derivedAttribute(name, compute, ...attributes) {
  const user_changed = MML.change_attribute_current.pipe(
    filter(attribute => attribute.get('name') === name),
    startWith(MML.getCurrentAttribute(attribute.get('_characterid'), name))
  );
  return Rx.combineLatest(attributes.concat(user_changed)).pipe(map((attributes) => compute(...attributes)));
};

MML.variableAttribute = function variableAttribute(name) {
  return function (source) {
    return source.pipe(
      filter(effect => effect.attribute === name),
      pluck('value'),
      mergeAll()
    );
  };
}
