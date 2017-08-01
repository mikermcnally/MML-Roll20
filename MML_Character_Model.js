// Character Creation
MML.createCharacter = function(charName, id) {
  var characterProxy = new Proxy(new MML.Character(charName, id), {
    set: function(target, prop, value) {
      target[prop] = value;
      if (typeof(value) === 'object') {
        value = JSON.stringify(value);
      }
      MML.setCurrentAttribute(target.name, prop, value);
      return true;
    }
  });
  return characterProxy;
};

MML.Character = function(charName, id) {
  Object.defineProperties(this, {
    //Combat Functions
    'displayRoll': {
      value: function displayRoll(callback) {
        var currentRoll = this.player.currentRoll;
        if (this.player.name === state.MML.GM.name) {
          if (currentRoll.accepted === false) {
            this.player.displayGmRoll();
          } else {
            this[callback](currentRoll);
          }
        } else {
          this.player.displayPlayerRoll();
          this[callback](currentRoll);
        }
      }
    },
    'displayMovement': {
      value: function displayMovement() {
        var token = MML.getTokenFromChar(this.name);
        var path = getObj('path', this.pathID);

        if (!_.isUndefined(path)) {
          path.remove();
        }
        var pathID = MML.drawCirclePath(token.get('left'), token.get('top'), MML.movementRates[this.race][this.movementPosition] * this.movementAvailable).id;
        this.pathID = pathID;
      }
    },
    'moveDistance': {
      value: function moveDistance(distance) {
        var remainingMovement = this.movementAvailable - (distance) / (MML.movementRates[this.race][this.movementPosition]);
        if (this.movementAvailable > 0) {
          this.movementAvailable = remainingMovement;
          this.displayMovement();
        } else {
          var path = getObj('path', this.pathID);
          if (!_.isUndefined(path)) {
            path.remove();
          }
        }
      }
    },
    'newRoundUpdateCharacter': {
      value: function newRoundUpdateCharacter() {
        if (_.has(this.statusEffects, 'Melee This Round')) {
          var fatigueRate = 1;
          if (_.has(this.statusEffects, 'Pinned')) {
            fatigueRate = 2;
          }
          this.roundsExertion += fatigueRate;
          this.roundsRest = 0;

          if (!_.has(this.statusEffects, 'Fatigue')) {
            if (this.roundsExertion > this.fitness) {
              state.MML.GM.fatigueChecks.push(this);
            }
          } else {
            if (this.roundsExertion > Math.round(this.fitness / 2)) {
              state.MML.GM.fatigueChecks.push(this);
            }
          }
        } else if (_.has(this.statusEffects, 'Fatigue') || this.roundsExertion > 0) {
          this.roundsRest++;
          if (this.roundsRest >= 6) {
            state.MML.GM.fatigueChecks.push(this);
          }
        }

        // Reset knockdown number
        this.knockdown = this.knockdownMax;
        this.spentInitiative = 0;

        this.action = {
          ts: _.isUndefined(this.previousAction) ? Date.now() : this.previousAction.ts,
          modifiers: [],
          weapon: MML.getEquippedWeapon(this)
        };
        if (_.has(this.statusEffects, 'Observing')) {
          this.addStatusEffect('Observed', {
            startingRound: state.MML.GM.currentRound
          });
        }
        this.updateCharacter();
        this.setReady(false);
      }
    },
    'setReady': {
      value: function setReady(ready) {
        if (state.MML.GM.inCombat === true && ready === false) {
          MML.getTokenFromChar(this.name).set('tint_color', '#FF0000');
        } else {
          MML.getTokenFromChar(this.name).set('tint_color', 'transparent');
        }
        this.ready = ready;
      }
    },
    'setCombatVision': {
      value: function setCombatVision() {
        var token = MML.getTokenFromChar(this.name);
        if (state.MML.GM.inCombat || !_.has(this.statusEffects, 'Observing')) {
          token.set('light_losangle', this.fov);
          token.set('light_hassight', true);
        } else {
          token.set('light_losangle', 360);
          token.set('light_hassight', true);
        }
      }
    },
    'getSingleTarget': {
      value: function getSingleTarget() {
        MML.displayTargetSelection({
          charName: this.name,
          callback: 'setCurrentCharacterTargets'
        });
      }
    },
    'getSpellTargets': {
      value: function getSpellTargets() {
        MML.displayTargetSelection({
          charName: this.name,
          callback: 'getAdditionalTarget'
        });
      }
    },
    'getAdditionalTarget': {
      value: function getAdditionalTarget(target) {
        var targetArray;

        if (_.isUndefined(state.MML.GM.currentAction.targetArray)) {
          state.MML.GM.currentAction.targetArray = [target];
          state.MML.GM.currentAction.targetIndex = 0;
        } else {
          state.MML.GM.currentAction.targetArray.push(target);
        }

        this.player.charMenuAddTarget(this.name);
        this.player.displayMenu();
      }
    },
    'getRadiusSpellTargets': {
      value: function getRadiusSpellTargets(radius) {
        state.MML.GM.currentAction.parameters.spellMarker = 'spellMarkerCircle';
        var token = MML.getTokenFromChar(this.name);
        var graphic = createObj('graphic', {
          name: 'spellMarkerCircle',
          _pageid: token.get('_pageid'),
          layer: 'objects',
          left: token.get('left'),
          top: token.get('top'),
          width: MML.feetToPixels(radius * 2),
          height: MML.feetToPixels(radius * 2),
          imgsrc: 'https://s3.amazonaws.com/files.d20.io/images/27869253/ixTcySIkxTEEsbospj4PpA/thumb.png?1485314508',
          controlledby: MML.getPlayerFromName(this.player.name).get('id')
        });
        toBack(graphic);

        this.player.charMenuPlaceSpellMarker(this.name);
        this.player.displayMenu();
      }
    },

    // Health and Wounds
    'alterHP': {
      value: function alterHP(bodyPart, hpAmount) {
        var initialHP = this.hp[bodyPart];
        var currentHP = initialHP + hpAmount;
        var maxHP = this.hpMax[bodyPart];

        if (hpAmount < 0) { //if damage
          var duration;
          this.hp[bodyPart] = currentHP;

          //Wounds
          if (currentHP < Math.round(maxHP / 2) && currentHP >= 0) { //Major wound
            if (initialHP >= Math.round(maxHP / 2)) { //Fresh wound
              duration = Math.round(maxHP / 2) - currentHP;
            } else if (!_.has(this.statusEffects, 'Major Wound, ' + bodyPart)) {
              duration = -hpAmount;
            } else { //Add damage to duration of effect
              duration = parseInt(this.statusEffects['Major Wound, ' + bodyPart].duration) - hpAmount;
            }
            state.MML.GM.currentAction.woundDuration = duration;
            this.player.charMenuMajorWoundRoll(this.name);
            this.player.displayMenu();
          } else if (currentHP < 0 && currentHP > -maxHP) { //Disabling wound
            if (!_.has(this.statusEffects, 'Disabling Wound, ' + bodyPart)) { //Fresh wound
              duration = -currentHP;
            } else if (_.has(this.statusEffects, 'Stunned')) { //Add damage to duration of effect
              duration = parseInt(this.statusEffects['Stunned'].duration) - hpAmount;
            } else {
              duration = -hpAmount;
            }
            state.MML.GM.currentAction.woundDuration = duration;
            this.player.charMenuDisablingWoundRoll(this.name);
            this.player.displayMenu();
          } else if (currentHP < -maxHP) { //Mortal wound
            this.addStatusEffect('Mortal Wound, ' + bodyPart, {
              bodyPart: bodyPart
            });
            MML[state.MML.GM.currentAction.callback]();
          } else {
            MML[state.MML.GM.currentAction.callback]();
          }
        } else { //if healing
          this.hp[bodyPart] += hpAmount;
          if (this.hp[bodyPart] > maxHP) {
            this.hp[bodyPart] = maxHP;
          }
          MML[state.MML.GM.currentAction.callback]();
        }
      }
    },
    'setMultiWound': {
      value: function setMultiWound() {
        var currentHP = this.hp;
        currentHP['Multiple Wounds'] = this.hpMax['Multiple Wounds'];

        _.each(MML.getBodyParts(this), function(bodyPart) {
          if (currentHP[bodyPart] >= Math.round(this.hpMax[bodyPart] / 2)) { //Only minor wounds apply
            currentHP['Multiple Wounds'] -= this.hpMax[bodyPart] - currentHP[bodyPart];
          } else {
            currentHP['Multiple Wounds'] -= this.hpMax[bodyPart] - Math.round(this.hpMax[bodyPart] / 2);
          }
        }, this);

        this.hp = currentHP;

        if (currentHP['Multiple Wounds'] < 0 && !_.has(this.statusEffects, 'Wound Fatigue')) {
          this.player.charMenuWoundFatigueRoll(this.name);
          this.player.displayMenu();
        } else {
          MML[state.MML.GM.currentAction.callback]();
        }
      }
    },
    'multiWoundRoll': {
      value: function multiWoundRoll() {
        MML.attributeCheckRoll(this, 'Wound Fatigue Roll', 'systemStrength', [0], 'multiWoundRollResult');
      }
    },
    'multiWoundRollResult': {
      value: function multiWoundRollResult() {
        this.displayRoll('multiWoundRollApply');
      }
    },
    'multiWoundRollApply': {
      value: function multiWoundRollApply() {
        var result = this.player.currentRoll.result;
        state.MML.GM.currentAction.multiWoundRoll = result;
        if (result === 'Failure') {
          this.addStatusEffect('Wound Fatigue', {});
        }
        MML[state.MML.GM.currentAction.callback]();
      }
    },
    'majorWoundRoll': {
      value: function majorWoundRoll() {
        MML.attributeCheckRoll(this, 'Major Wound Willpower Roll', 'willpower', [0], 'majorWoundRollResult');
      }
    },
    'majorWoundRollResult': {
      value: function majorWoundRollResult() {
        this.displayRoll('majorWoundRollApply');
      }
    },
    'majorWoundRollApply': {
      value: function majorWoundRollApply() {
        var result = this.player.currentRoll.result;
        state.MML.GM.currentAction.woundRoll = result;
        var bodyPart = state.MML.GM.currentAction.rolls.hitPositionRoll.bodyPart;
        if (result === 'Failure') {
          this.addStatusEffect('Major Wound, ' + bodyPart, {
            duration: state.MML.GM.currentAction.woundDuration,
            startingRound: state.MML.GM.currentRound,
            bodyPart: bodyPart
          });
        }
        MML[state.MML.GM.currentAction.callback]();
      }
    },
    'disablingWoundRoll': {
      value: function disablingWoundRoll() {
        MML.attributeCheckRoll(this, 'Disabling Wound System Strength Roll', 'systemStrength', [0], 'disablingWoundRollResult');
      }
    },
    'disablingWoundRollResult': {
      value: function disablingWoundRollResult() {
        this.displayRoll('disablingWoundRollApply');
      }
    },
    'disablingWoundRollApply': {
      value: function disablingWoundRollApply() {
        var result = this.player.currentRoll.result;
        state.MML.GM.currentAction.woundRoll = result;
        var bodyPart = state.MML.GM.currentAction.rolls.hitPositionRoll.bodyPart;

        this.addStatusEffect('Disabling Wound, ' + bodyPart, {
          bodyPart: bodyPart
        });
        if (result === 'Failure') {
          if (_.has(this.statusEffects, 'Stunned')) {
            this.statusEffects['Stunned'].duration = state.MML.GM.currentAction.woundDuration;
          } else {
            this.addStatusEffect('Stunned', {
              startingRound: state.MML.GM.currentRound,
              duration: state.MML.GM.currentAction.woundDuration
            });
          }
        }
        MML[state.MML.GM.currentAction.callback]();
      }
    },
    'knockdownCheck': {
      value: function knockdownCheck(damage) {
        this.knockdown += damage;
        if (this.movementPosition !== 'Prone' && this.knockdown < 1) {
          this.knockdownRoll();
        } else {
          MML[state.MML.GM.currentAction.callback]();
        }
      }
    },
    'knockdownRoll': {
      value: function knockdownRoll() {
        MML.attributeCheckRoll(this, 'Knockdown System Strength Roll', 'systemStrength', [_.has(this.statusEffects, 'Stumbling') ? -5 : 0], 'getKnockdownRoll');
      }
    },
    'knockdownRollResult': {
      value: function knockdownRollResult() {
        this.displayRoll('knockdownRollApply');
      }
    },
    'knockdownRollApply': {
      value: function knockdownRollApply() {
        var result = this.player.currentRoll.result;

        if (result === 'Critical Failure' || result === 'Failure') {
          this.movementPosition = 'Prone';
        } else {
          this.addStatusEffect('Stumbling', {
            startingRound: state.MML.GM.currentRound
          });
        }

        MML[state.MML.GM.currentAction.callback]();
      }
    },
    'sensitiveAreaCheck': {
      value: function sensitiveAreaCheck(hitPosition) {
        if (MML.sensitiveAreas[this.bodyType].indexOf(hitPosition) > -1) {
          this.sensitiveAreaRoll();
        } else {
          MML[state.MML.GM.currentAction.callback]();
        }
      }
    },
    'sensitiveAreaRoll': {
      value: function sensitiveAreaRoll() {
        MML.attributeCheckRoll(this, 'Sensitive Area Willpower Roll', 'willpower', [0], 'sensitiveAreaRollResult');
      }
    },
    'sensitiveAreaRollResult': {
      value: function sensitiveAreaRollResult() {
        this.displayRoll('sensitiveAreaRollApply');
      }
    },
    'sensitiveAreaRollApply': {
      value: function sensitiveAreaRollApply() {
        var result = this.player.currentRoll.result;
        if (result === 'Critical Failure' || result === 'Failure') {
          this.addStatusEffect('Sensitive Area', {
            startingRound: state.MML.GM.currentRound
          });
        }
        MML[state.MML.GM.currentAction.callback]();
      }
    },
    'alterEP': {
      value: function alterEP(epAmount) {
        this.ep += epAmount;

        if (this.ep < Math.round(0.25 * this.epMax)) {
          this.fatigueCheckRoll();
        } else {
          MML[state.MML.GM.currentAction.callback]();
        }
      }
    },
    'fatigueCheckRoll': {
      value: function fatigueCheckRoll() {
        if (!_.has(this.statusEffects, 'Fatigue')) {
          MML.attributeCheckRoll(this, 'Fatigue Check Fitness Roll', 'fitness', [0], 'fatigueCheckRollResult');
        } else {
          MML.attributeCheckRoll(this, 'Fatigue Check Fitness Roll', 'fitness', [-4], 'fatigueCheckRollResult');
        }
      }
    },
    'fatigueCheckRollResult': {
      value: function fatigueCheckRollResult() {
        this.displayRoll('fatigueCheckRollApply');
      }
    },
    'fatigueCheckRollApply': {
      value: function fatigueCheckRollApply() {
        var result = this.player.currentRoll.result;
        if (result === 'Critical Failure' || result === 'Failure') {
          if (_.has(this.statusEffects, 'Fatigue')) {
            this.statusEffects['Fatigue'].level += 1;
            this.applyStatusEffects();
          } else {
            this.addStatusEffect('Fatigue', {
              level: 1
            });
          }
          this.roundsExertion = 0;
        }
        MML.nextFatigueCheck();
      }
    },
    'fatigueRecoveryRoll': {
      value: function fatigueRecoveryRoll(modifier) {
        MML.attributeCheckRoll(this, 'Fatigue Recovery Check Health Roll', 'health', [0], 'fatigueRecoveryRollResult');
      }
    },
    'fatigueRecoveryRollResult': {
      value: function fatigueRecoveryRollResult() {
        this.displayRoll('fatigueRecoveryRollApply');
      }
    },
    'fatigueRecoveryRollApply': {
      value: function fatigueRecoveryRollApply() {
        var result = this.player.currentRoll.result;
        if (result === 'Critical Success' || result === 'Success') {
          this.roundsRest = 0;
          this.roundsExertion = 0;
          this.statusEffects['Fatigue'].level--;
          this.applyStatusEffects();
        }
        MML.nextFatigueCheck();
      }
    },
    'armorDamageReduction': {
      value: function armorDamageReduction(position, damage, type, coverageRoll) {
        var damageApplied = false; //Accounts for partial coverage, once true the loop stops
        var damageDeflected = 0;
        // Iterates over apv values at given position (accounting for partial coverage)
        var apv;
        for (apv in this.apv[position][type]) {
          if (damageApplied === false) {
            if (coverageRoll <= this.apv[position][type][apv].coverage) { //if coverage roll is less than apv coverage
              damageDeflected = this.apv[position][type][apv].value;

              //If all damage is deflected, do blunt trauma. Modifies damage variable for next if statement
              if (damage + damageDeflected >= 0) {
                //If surface, cut, or pierce, cut in half and apply as impact
                if (type === 'Surface' || type === 'Cut' || type === 'Pierce') {
                  damage = Math.ceil(damage / 2);
                  damageDeflected = this.apv[position].Impact[apv].value;

                  if (damage + damageDeflected >= 0) {
                    damageDeflected = -damage;
                    damage = 0;
                  }
                }
                //If chop, or thrust, apply 3/4 as impact
                else if (type === 'Chop' || type === 'Thrust') {
                  damage = Math.ceil(damage * 0.75);
                  damageDeflected = this.apv[position].Impact[apv].value;

                  if (damage + damageDeflected >= 0) {
                    damageDeflected = -damage;
                    damage = 0;
                  }
                }
                //If impact or flanged, no damage
                else {
                  damageDeflected = -damage;
                  damage = 0;
                }
              }

              // if damage gets through, subtract amount deflected by armor
              if (damage < 0) {
                damage += damageDeflected;
              }
              damageApplied = true;
            }
          }
        }
        return damage;
      }
    },

    'setAction': {
      value: function setAction() {
        var initBonus = 10;

        if (this.action.name === 'Attack' || this.action.name === 'Aim') {
          if (['Punch', 'Kick', 'Head Butt', 'Bite', 'Grapple', 'Takedown', 'Place a Hold', 'Break a Hold', 'Break Grapple'].indexOf(this.action.weaponType) > -1 ||
            this.action.weapon === 'unarmed'
          ) {
            if (!_.isUndefined(this.weaponSkills['Brawling']) && this.weaponSkills['Brawling'].level > this.weaponSkills['Default Martial'].level) {
              this.action.skill = this.weaponSkills['Brawling'].level;
            } else {
              this.action.skill = this.weaponSkills['Default Martial'].level;
            }
            // } else if (leftHand !== 'unarmed' && rightHand !== 'unarmed') {
            //   var weaponInits = [this.inventory[this.leftHand._id].grips[this.leftHand.grip].initiative,
            //     this.inventory[this.rightHand._id].grips[this.rightHand.grip].initiative
            //   ];
            //   initBonus = _.min(weaponInits);
            // this.action.skill = this.weaponSkills.[this.inventory[this.leftHand._id].name].level or this.weaponSkills['Default Martial Skill'].level;
            //Dual Wielding
          } else {
            initBonus = this.action.weapon.initiative;
            this.action.skill = MML.getWeaponSkill(this, this.action.weapon);
          }
        } else if (this.action.name === 'Cast') {
          var skillInfo = MML.getMagicSkill(this, this.action.spell);
          this.action.skill = skillInfo.level;
          this.action.skillName = skillInfo.name;
        }
        if (state.MML.GM.roundStarted === false) {
          this.firstActionInitBonus = initBonus;
        }

        if (_.isUndefined(this.previousAction) || this.previousAction.ts !== this.action.ts) {
          _.each(this.action.modifiers, function(modifier) {
            this.addStatusEffect(modifier, {
              ts: this.action.ts,
              startingRound: state.MML.GM.currentRound
            });
          }, this);
        }
      }
    },
    'initiativeRoll': {
      value: function initiativeRoll() {
        var rollValue = MML.rollDice(1, 10);
        this.setAction();
        this.player.currentRoll = {
          character: this.name,
          name: 'initiative',
          value: rollValue,
          callback: 'initiativeResult',
          range: '1-10',
          accepted: false
        };
        this.initiativeResult();
      }
    },
    'initiativeResult': {
      value: function initiativeResult() {
        this.player.currentRoll.rollResult =
          this.player.currentRoll.value +
          this.situationalInitBonus +
          this.movementRatioInitBonus +
          this.attributeInitBonus +
          this.senseInitBonus +
          this.fomInitBonus +
          this.firstActionInitBonus +
          this.spentInitiative;

        this.player.currentRoll.message =
          'Roll: ' + this.player.currentRoll.value +
          '\nResult: ' + this.player.currentRoll.rollResult +
          '\nRange: ' + this.player.currentRoll.range;

        this.displayRoll('initiativeApply');
      }
    },
    'initiativeApply': {
      value: function initiativeApply() {
        this.initiativeRollValue = this.player.currentRoll.value;
        this.setReady(true);
        this.player.prepareNextCharacter();
      }
    },
    'startAction': {
      value: function startAction() {
        state.MML.GM.currentAction = {
          character: this,
          rolls: {}
        };

        if (_.contains(this.action.modifiers, 'Ready Item')) {
          _.each(this.action.items, function(item) {
            MML.equipItem(this, item.itemId, item.grip);
          }, this);
        }

        if (_.contains(this.action.modifiers, 'Release Opponent')) {
          var targetName = _.has(this.statusEffects, 'Holding') ? this.statusEffects['Holding'].targets[0] : this.statusEffects['Grappled'].targets[0];
          state.MML.GM.currentAction.parameters = {
            target: MML.characters[targetName]
          };
          this.releaseOpponentAction();
        } else if (this.action.name === 'Cast') {
          this.action.spell.actions--;
          if (this.action.spell.actions > 0) {
            this.player.charMenuContinueCasting(this.name);
            this.player.displayMenu();
          } else {
            var currentAction = {
              callback: 'castAction',
              parameters: {
                spell: this.action.spell,
                casterSkill: this.action.skill,
                epCost: MML.getEpCost(this.action.skillName, this.action.skill, this.action.spell.ep),
                metaMagic: {
                  base: {
                    epMod: 1,
                    castingMod: 0
                  }
                }
              },
              rolls: {}
            };

            state.MML.GM.currentAction = _.extend(state.MML.GM.currentAction, currentAction);
            this.player.charMenuMetaMagic(this.name);
            this.player.displayMenu();
          }
        } else if (!_.isUndefined(this.action.getTargets)) {
          this[this.action.getTargets]();
        } else {
          MML[this.action.callback]();
        }
      }
    },

    'chooseSpellTargets': {
      value: function chooseSpellTargets() {
        if (['Caster', 'Touch', 'Single'].indexOf(this.action.spell.target) > -1) {
          this.getSpellTargets();
        } else if (this.action.spell.target.indexOf('\' Radius') > -1) {
          this.getRadiusSpellTargets(parseInt(this.action.spell.target.replace('\' Radius', '')));
        } else {
          this.action.callback();
        }
      }
    },
    'startCastAction': {
      value: function startCastAction() {
        state.MML.GM.currentAction.parameters.target = MML.characters[state.MML.GM.currentAction.targetArray[0]];
        this.applyStatusEffects();
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'startAttackAction': {
      value: function startAttackAction(target) {
        state.MML.GM.currentAction.parameters = { target: MML.characters[state.MML.GM.currentAction.targetArray[0]] };
        this.applyStatusEffects();
        if (_.has(this.statusEffects, 'Called Shot') || this.action.weaponType === 'Place a Hold' || this.action.weaponType === 'Head Butt') {
          this.player.charMenuSelectBodyPart(this.name);
          this.player.displayMenu();
        } else if (_.has(this.statusEffects, 'Called Shot Specific')) {
          this.player.charMenuSelectHitPosition(this.name);
          this.player.displayMenu();
        } else {
          this.processAttack();
        }
      }
    },
    'processAttack': {
      value: function processAttack() {
        var weaponType = this.action.weaponType;
        if (['Punch', 'Kick', 'Head Butt', 'Bite'].indexOf(weaponType) > -1) {
          this.unarmedAttack();
        } else if (['Grapple', 'Place a Hold', 'Break a Hold', 'Break Grapple', 'Takedown', 'Regain Feet'].indexOf(weaponType) > -1) {
          this.grappleAttack();
        } else if (MML.isDualWielding(this)) {
          this.dualWieldAttack();
        } else if (MML.getWeaponFamily(this, 'leftHand') === 'MWD' || MML.getWeaponFamily(this, 'leftHand') === 'MWM') {
          this.missileAttack();
        } else if (MML.getWeaponFamily(this, 'leftHand') === 'TWH' ||
          MML.getWeaponFamily(this, 'rightHand') === 'TWH' ||
          MML.getWeaponFamily(this, 'leftHand') === 'TWK' ||
          MML.getWeaponFamily(this, 'rightHand') === 'TWK' ||
          MML.getWeaponFamily(this, 'leftHand') === 'TWS' ||
          MML.getWeaponFamily(this, 'rightHand') === 'TWS' ||
          MML.getWeaponFamily(this, 'leftHand') === 'SLI' ||
          MML.getWeaponFamily(this, 'rightHand') === 'SLI') {
          this.throwingAttack();
        } else {
          this.meleeAttack();
        }
      }
    },
    'meleeAttack': {
      value: function meleeAttack() {
        var characterWeaponInfo = MML.getCharacterWeaponAndSkill(this);
        state.MML.GM.currentAction.callback = 'meleeAttackAction';
        state.MML.GM.currentAction.parameters.attackerWeapon = characterWeaponInfo.characterWeapon;
        state.MML.GM.currentAction.parameters.attackerSkill = characterWeaponInfo.skill;
        MML.meleeAttackAction();
      }
    },
    'meleeAttackRoll': {
      value: function meleeAttackRoll(rollName, task, skill) {
        MML.universalRoll(this, rollName, [task, skill, this.situationalMod, this.meleeAttackMod, this.attributeMeleeAttackMod], 'attackRollResult');
      }
    },
    'missileAttack': {
      value: function missileAttack() {
        var range = MML.getDistanceBetweenChars(this.name, state.MML.GM.currentAction.parameters.target.name);
        var task;
        var itemId;
        var grip;

        if (MML.getWeaponFamily(this, 'rightHand') !== 'unarmed') {
          itemId = this.rightHand._id;
          grip = this.rightHand.grip;
        } else {
          itemId = this.leftHand._id;
          grip = this.leftHand.grip;
        }

        var item = this.inventory[itemId];

        var attackerWeapon = {
          _id: itemId,
          name: item.name,
          type: 'weapon',
          weight: item.weight,
          family: item.grips[grip].family,
          hands: item.grips[grip].hands,
          initiative: item.grips[grip].initiative,
          reload: item.grips[grip].reload,
          damageType: item.grips[grip].primaryType
        };

        if (range <= item.grips[grip].range.pointBlank.range) {
          attackerWeapon.task = item.grips[grip].range.pointBlank.task;
          attackerWeapon.damage = item.grips[grip].range.pointBlank.damage;
        } else if (range <= item.grips[grip].range.effective.range) {
          attackerWeapon.task = item.grips[grip].range.effective.task;
          attackerWeapon.damage = item.grips[grip].range.effective.damage;
        } else if (range <= item.grips[grip].range.long.range) {
          attackerWeapon.task = item.grips[grip].range.long.task;
          attackerWeapon.damage = item.grips[grip].range.long.damage;
        } else {
          attackerWeapon.task = item.grips[grip].range.extreme.task;
          attackerWeapon.damage = item.grips[grip].range.extreme.damage;
        }

        state.MML.GM.currentAction.callback = 'missileAttackAction';
        state.MML.GM.currentAction.parameters.range = range;
        state.MML.GM.currentAction.parameters.attackerWeapon = attackerWeapon;
        state.MML.GM.currentAction.parameters.attackerSkill = MML.getWeaponSkill(this, item);
        MML.missileAttackAction();
      }
    },
    'missileAttackRoll': {
      value: function missileAttackRoll(rollName, task, skill, target) {
        var mods = [task, skill, this.situationalMod, this.missileAttackMod, this.attributeMissileAttackMod];
        if (_.has(target.statusEffects, 'Shoot From Cover')) {
          mods.push(-20);
        }
        if (state.MML.GM.currentAction.parameters.attackerWeapon.family === 'MWM') {
          this.inventory[state.MML.GM.currentAction.parameters.attackerWeapon._id].loaded = 0;
        }
        MML.universalRoll(this, rollName, mods, 'attackRollResult');
      }
    },
    'unarmedAttack': {
      value: function unarmedAttack() {
        var attackType;
        switch (this.action.weaponType) {
          case 'Punch':
            attackType = MML.unarmedAttacks['Punch'];
            break;
          case 'Kick':
            attackType = MML.unarmedAttacks['Kick'];
            break;
          case 'Head Butt':
            attackType = MML.unarmedAttacks['Head Butt'];
            break;
          case 'Bite':
            attackType = MML.unarmedAttacks['Bite'];
            break;
          default:
        }

        state.MML.GM.currentAction.callback = 'unarmedAttackAction';
        state.MML.GM.currentAction.parameters.attackType = attackType;
        state.MML.GM.currentAction.parameters.attackerSkill = this.action.skill;
        MML.unarmedAttackAction();
      }
    },
    'grappleAttack': {
      value: function grappleAttack() {
        var attackType;
        switch (this.action.weaponType) {
          case 'Grapple':
            attackType = MML.unarmedAttacks['Grapple'];
            break;
          case 'Place a Hold':
            if (['Chest', 'Abdomen'].indexOf(state.MML.GM.currentAction.calledShot)) {
              attackType = MML.unarmedAttacks['Place a Hold, Chest, Abdomen'];
            } else {
              attackType = MML.unarmedAttacks['Place a Hold, Head, Arm, Leg'];
            }
            break;
          case 'Break a Hold':
            attackType = MML.unarmedAttacks['Break a Hold'];
            break;
          case 'Break Grapple':
            attackType = MML.unarmedAttacks['Break Grapple'];
            break;
          case 'Takedown':
            attackType = MML.unarmedAttacks['Takedown'];
            break;
          case 'Regain Feet':
            attackType = MML.unarmedAttacks['Regain Feet'];
            break;
          default:
            break;
        }

        state.MML.GM.currentAction.callback = 'grappleAttackAction';
        state.MML.GM.currentAction.parameters.attackType = attackType;
        state.MML.GM.currentAction.parameters.attackerSkill = this.action.skill;
        MML.grappleAttackAction();
      }
    },
    'attackRollResult': {
      value: function attackRollResult() {
        var currentRoll = this.player.currentRoll;
        if (this.player.name === state.MML.GM.name) {
          if (currentRoll.accepted === false) {
            this.player.displayGmRoll(currentRoll);
          } else {
            if (_.has(this.statusEffects, 'Called Shot Specific') && currentRoll.value > currentRoll.target && currentRoll.value - currentRoll.target < 11) {
              this.statusEffects['Called Shot Specific'].nearMiss = true;
              currentRoll.result = 'Success';
            }
            this.attackRollApply();
          }
        } else {
          this.player.displayPlayerRoll(currentRoll);
          if (_.has(this.statusEffects, 'Called Shot Specific') && currentRoll.value > currentRoll.target && currentRoll.value - currentRoll.target < 11) {
            this.statusEffects['Called Shot Specific'].nearMiss = true;
            currentRoll.result = 'Success';
          }
          this.attackRollApply();
        }
      }
    },
    'attackRollApply': {
      value: function attackRollApply() {
        state.MML.GM.currentAction.rolls.attackRoll = this.player.currentRoll.result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },
    'hitPositionRoll': {
      value: function hitPositionRoll() {
        var rollValue;
        var range;
        var rangeUpper;
        var result;
        var accepted;
        var action = state.MML.GM.currentAction;
        var target = MML.characters[action.targetArray[action.targetIndex]];

        if (_.has(this.statusEffects, 'Called Shot Specific')) {
          var hitPositionIndex = parseInt(_.findKey(MML.hitPositions[target.bodyType], function(hitPosition) {
            return hitPosition.name === action.calledShot;
          }));
          if (this.statusEffects['Called Shot Specific'].nearMiss) {
            var bodyPart = MML.hitPositions[target.bodyType][hitPositionIndex].bodyPart;
            rangeUpper = MML.getAvailableHitPositions(target, bodyPart).length;
            rollValue = MML.rollDice(1, rangeUpper);
            range = '1-' + rangeUpper;
            result = MML.getCalledShotHitPosition(target, rollValue, bodyPart);
            accepted = false;
          } else {
            rollValue = hitPositionIndex;
            range = rollValue + '-' + rollValue;
            result = MML.getHitPosition(target, rollValue);
            accepted = true;
          }
        } else if (_.has(this.statusEffects, 'Called Shot')) {
          rangeUpper = MML.getAvailableHitPositions(target, action.calledShot).length;
          rollValue = MML.rollDice(1, rangeUpper);
          range = '1-' + rangeUpper;
          result = MML.getCalledShotHitPosition(target, rollValue, action.calledShot);
          accepted = false;
        } else {
          range = '1-' + _.keys(MML.hitPositions[target.bodyType]).length;
          result = MML.getHitPosition(target, MML.rollDice(1, 100));
          rollValue = parseInt(_.findKey(MML.hitPositions[target.bodyType], function(hitPosition) {
            return hitPosition.name === result.name;
          }));
          accepted = false;
        }
        this.player.currentRoll = {
          type: 'hitPosition',
          character: this.name,
          player: this.player,
          callback: 'hitPositionRollResult',
          range: range,
          result: result,
          value: rollValue,
          accepted: accepted
        };
        this.hitPositionRollResult();
      }
    },
    'hitPositionRollResult': {
      value: function hitPositionRollResult() {
        var currentRoll = this.player.currentRoll;
        var action = state.MML.GM.currentAction;
        var target = MML.characters[action.targetArray[action.targetIndex]];

        if (_.has(this.statusEffects, 'Called Shot')) {
          currentRoll.result = MML.getCalledShotHitPosition(target, currentRoll.value, action.calledShot);
        } else if (_.has(this.statusEffects, 'Called Shot Specific') && this.statusEffects['Called Shot Specific'].nearMiss) {
          var hitPositionIndex = parseInt(_.findKey(MML.hitPositions[target.bodyType], function(hitPosition) {
            return hitPosition.name === action.calledShot;
          }));
          currentRoll.result = MML.getCalledShotHitPosition(target, currentRoll.value, MML.hitPositions[target.bodyType][hitPositionIndex].bodyPart);
        } else {
          currentRoll.result = MML.hitPositions[target.bodyType][currentRoll.value];
        }

        currentRoll.message = 'Roll: ' + currentRoll.value +
          '\nResult: ' + currentRoll.result.name +
          '\nRange: ' + currentRoll.range;

        this.player.currentRoll = currentRoll;
        this.displayRoll('hitPositionRollApply');
      }
    },
    'hitPositionRollApply': {
      value: function hitPositionRollApply(currentRoll) {
        state.MML.GM.currentAction.rolls.hitPositionRoll = currentRoll.result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },
    'meleeDefense': {
      value: function meleeDefense(attackerWeapon) {
        var itemId;
        var grip;
        var defenderWeapon;
        var dodgeChance;
        var blockChance;
        var dodgeSkill;
        var blockSkill;
        var weaponSkills = this.weaponSkills;
        var defaultMartialSkill = weaponSkills['Default Martial'].level;
        var shieldMod = MML.getShieldDefenseBonus(this);
        var defenseMod = this.meleeDefenseMod + this.attributeDefenseMod;
        var sitMod = this.situationalMod;

        if (!_.isUndefined(weaponSkills['Dodge']) && defaultMartialSkill < weaponSkills['Dodge'].level) {
          dodgeChance = weaponSkills['Dodge'].level + defenseMod + sitMod;
        } else {
          dodgeChance = defaultMartialSkill + defenseMod + sitMod;
        }

        if (attackerWeapon.initiative < 6) {
          dodgeChance += 15;
        }

        if (MML.isDualWielding(this)) {
          log('Dual Wield defense');
        } else if (MML.isUnarmed(this) || MML.isWieldingRangedWeapon(this)) {
          blockChance = 0;
        } else {
          if (MML.getWeaponFamily(this, 'rightHand') !== 'unarmed') {
            itemId = this.rightHand._id;
            grip = this.rightHand.grip;
          } else {
            itemId = this.leftHand._id;
            grip = this.leftHand.grip;
          }

          defenderWeapon = this.inventory[itemId];
          blockChance = defenderWeapon.grips[grip].defense + sitMod + defenseMod + shieldMod;
          blockSkill = Math.round(MML.getWeaponSkill(this, defenderWeapon) / 2);

          if (blockSkill >= defaultMartialSkill) {
            blockChance += blockSkill;
          } else {
            blockChance += defaultMartialSkill;
          }
        }

        if (attackerWeapon.family === 'Flexible') {
          dodgeChance += -10;
          blockChance += -10;
        } else if (attackerWeapon.family === 'Unarmed') {
          dodgeChance += attackerWeapon.defenseMod;
          blockChance += attackerWeapon.defenseMod;
        }

        MML.removeAimAndObserving(this);
        this.player.charMenuMeleeDefenseRoll(this.name, dodgeChance, blockChance);
        this.player.displayMenu();
      }
    },
    'meleeBlockRoll': {
      value: function meleeBlockRoll(blockChance) {
        MML.universalRoll(this, 'meleeBlockRoll', [blockChance], 'meleeBlockRollResult');
      }
    },
    'meleeBlockRollResult': {
      value: function meleeBlockRollResult() {
        this.displayRoll('meleeBlockRollApply');
      }
    },
    'meleeBlockRollApply': {
      value: function meleeBlockRollApply() {
        var result = this.player.currentRoll.result;

        if (_.has(this.statusEffects, 'Number of Defenses')) {
          this.statusEffects['Number of Defenses'].number++;
        } else {
          this.addStatusEffect('Number of Defenses', {
            number: 1
          });
        }

        state.MML.GM.currentAction.rolls.defenseRoll = result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },
    'meleeDodgeRoll': {
      value: function meleeDodgeRoll(dodgeChance) {
        MML.universalRoll(this, 'meleeDodgeRoll', [dodgeChance], 'meleeDodgeRollResult');
      }
    },
    'meleeDodgeRollResult': {
      value: function meleeDodgeRollResult() {
        this.displayRoll('meleeDodgeRollApply');
      }
    },
    'meleeDodgeRollApply': {
      value: function meleeDodgeRollApply() {
        var result = this.player.currentRoll.result;
        if (_.has(this.statusEffects, 'Number of Defenses')) {
          this.statusEffects['Number of Defenses'].number++;
        } else {
          this.addStatusEffect('Number of Defenses', {
            number: 1
          });
        }
        if (!_.has(this.statusEffects, 'Dodged This Round')) {
          this.addStatusEffect('Dodged This Round', {});
        }
        state.MML.GM.currentAction.rolls.defenseRoll = result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },
    'rangedDefense': {
      value: function rangedDefense(attackerWeapon, range) {
        var defenseChance;
        var defaultMartialSkill = this.weaponSkills['Default Martial'].level;
        var shieldMod = MML.getShieldDefenseBonus(this);
        var defenseMod = this.rangedDefenseMod + this.attributeDefenseMod;
        var sitMod = this.situationalMod;
        var rangeMod;

        this.statusEffects['Melee This Round'] = {
          id: generateRowID(),
          name: 'Melee This Round'
        };

        if (!_.isUndefined(this.skills['Dodge']) && this.skills['Dodge'].level >= defaultMartialSkill) {
          defenseChance = this.weaponSkills['Dodge'].level + defenseMod + sitMod + shieldMod;
        } else {
          defenseChance = defaultMartialSkill + defenseMod + sitMod + shieldMod;
        }

        if (attackerWeapon.family === 'MWD' || attackerWeapon.family === 'MWM') {
          rangeMod = Math.floor(range / 75);

          if (rangeMod > 3) {
            rangeMod = 3;
          }
          defenseChance += rangeMod;
        } else if (attackerWeapon.family === 'TWH') {
          rangeMod = Math.floor(range / 5);

          if (rangeMod > 5) {
            rangeMod = 5;
          }
          defenseChance += rangeMod + 25;
        } else if (attackerWeapon.family === 'TWK') {
          rangeMod = Math.floor(range / 5);

          if (rangeMod > 3) {
            rangeMod = 3;
          }
          defenseChance += rangeMod + 15;
        } else if (attackerWeapon.family === 'TWS') {
          rangeMod = Math.floor(range / 5);

          if (rangeMod > 5) {
            rangeMod = 5;
          }
          defenseChance += rangeMod + 15;
        } else {
          rangeMod = Math.floor(range / 20);

          if (rangeMod > 5) {
            rangeMod = 5;
          }
          defenseChance += rangeMod;
        }

        MML.removeAimAndObserving(this);
        this.player.charMenuRangedDefenseRoll(this.name, defenseChance);
        this.player.displayMenu();
      }
    },
    'rangedDefenseRoll': {
      value: function rangedDefenseRoll(defenseChance) {
        MML.universalRoll(this, 'rangedDefenseRoll', [defenseChance], 'rangedDefenseRollResult');
      }
    },
    'rangedDefenseRollResult': {
      value: function rangedDefenseRollResult() {
        this.displayRoll('rangedDefenseRollApply');
      }
    },
    'rangedDefenseRollApply': {
      value: function rangedDefenseRollApply() {
        var result = this.player.currentRoll.result;

        if (result === 'Success') {
          if (_.has('Number of Defenses')) {
            this.statusEffects['Number of Defenses'].number++;
          } else {
            this.addStatusEffect('Number of Defenses', {
              number: 1
            });
          }
          if (!_.has(this.statusEffects, 'Dodged This Round')) {
            this.addStatusEffect('Dodged This Round', {});
          }
        }
        state.MML.GM.currentAction.rolls.defenseRoll = result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },
    'grappleDefense': {
      value: function grappleDefense(attackType) {
        var defenderWeapon;
        var brawlChance;
        var weaponChance;
        var brawlSkill;
        var defaultMartialSkill = this.weaponSkills['Default Martial'].level;
        var defenseMod = this.meleeDefenseMod + this.attributeDefenseMod + attackType.defenseMod;
        var sitMod = this.situationalMod;

        this.addStatusEffect('Melee This Round', {});

        if (_.isUndefined(this.weaponSkills['Brawling'])) {
          brawlSkill = 0;
        } else {
          brawlSkill = this.weaponSkills['Brawling'].level;
        }

        if (brawlSkill >= defaultMartialSkill) {
          brawlChance = this.weaponSkills['Brawling'].level + defenseMod + sitMod;
        } else {
          brawlChance = defaultMartialSkill + defenseMod + sitMod;
        }

        if (
          MML.isUnarmed(this) ||
          _.has(this.statusEffects, 'Stunned') ||
          _.has(this.statusEffects, 'Holding') ||
          _.has(this.statusEffects, 'Held') ||
          _.has(this.statusEffects, 'Grappled') ||
          _.has(this.statusEffects, 'Taken Down') ||
          _.has(this.statusEffects, 'Pinned') ||
          _.has(this.statusEffects, 'Overborne')
        ) {
          this.player.charMenuGrappleDefenseRoll(this.name, brawlChance);
        } else {
          var characterWeaponInfo = MML.getCharacterWeaponAndSkill(this);
          state.MML.GM.currentAction.parameters.defenderWeapon = characterWeaponInfo.characterWeapon;
          this.player.charMenuGrappleDefenseRoll(
            this.name,
            brawlChance,
            characterWeaponInfo.characterWeapon.task + characterWeaponInfo.skill + this.situationalMod + this.meleeAttackMod + this.attributeMeleeAttackMod
          );
        }
        this.player.displayMenu();
      }
    },
    'grappleDefenseWeaponRoll': {
      value: function grappleDefenseWeaponRoll(attackChance) {
        MML.universalRoll(this, 'Weapon Defense Roll', [attackChance], 'grappleDefenseWeaponRollResult');
      }
    },
    'grappleDefenseWeaponRollResult': {
      value: function grappleDefenseWeaponRollResult() {
        this.displayRoll('grappleDefenseWeaponRollApply');
      }
    },
    'grappleDefenseWeaponRollApply': {
      value: function grappleDefenseWeaponRollApply() {
        var result = this.player.currentRoll.result;

        if (result === 'Success') {
          if (_.has(this.statusEffects, 'Number of Defenses')) {
            this.statusEffects['Number of Defenses'].number++;
          } else {
            this.addStatusEffect('Number of Defenses', {
              number: 1
            });
          }

        }
        state.MML.GM.currentAction.rolls.weaponDefenseRoll = this.player.currentRoll.result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },
    'grappleDefenseBrawlRoll': {
      value: function grappleDefenseBrawlRoll(brawlChance) {
        MML.universalRoll(this, 'Brawl Defense Roll', [brawlChance], 'grappleDefenseBrawlRollResult');
      }
    },
    'grappleDefenseBrawlRollResult': {
      value: function grappleDefenseBrawlRollResult() {
        this.displayRoll('grappleDefenseBrawlRollApply');
      }
    },
    'grappleDefenseBrawlRollApply': {
      value: function grappleDefenseBrawlRollApply() {
        var result = this.player.currentRoll.result;

        if (result === 'Success') {
          if (_.has(this.statusEffects, 'Number of Defenses')) {
            this.statusEffects['Number of Defenses'].number++;
          } else {
            this.addStatusEffect('Number of Defenses', {
              number: 1
            });
          }
        }
        state.MML.GM.currentAction.rolls.brawlDefenseRoll = this.player.currentRoll.result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },
    'grappleHandler': {
      value: function grappleHandler(defender, attackName) {
        switch (attackName) {
          case 'Grapple':
            this.applyGrapple(defender);
            break;
          case 'Place a Hold, Head, Arm, Leg':
            this.applyHold(defender);
            break;
          case 'Place a Hold, Chest, Abdomen':
            this.applyHold(defender);
            break;
          case 'Break a Hold':
            this.applyHoldBreak(defender);
            break;
          case 'Break Grapple':
            this.applyGrappleBreak(defender);
            break;
          case 'Takedown':
            this.applyTakedown(defender);
            break;
          case 'Regain Feet':
            this.applyRegainFeet(defender);
            break;
          default:
            sendChat('Error', 'Unhappy grapple :(');
        }
        this.applyStatusEffects();
        defender.applyStatusEffects();
        MML.endAction();
      }
    },
    'applyGrapple': {
      value: function applyGrapple(defender) {
        this.statusEffects['Grappled'] = {
          id: _.has(this.statusEffects, 'Grappled') ? this.statusEffects['Grappled'].id : generateRowID(),
          name: 'Grappled',
          targets: _.has(this.statusEffects, 'Grappled') ? this.statusEffects['Grappled'].targets.concat([defender.name]) : [defender.name]
        };

        if (_.has(defender.statusEffects, 'Holding')) {
          this.applyHoldBreak(MML.characters[defender.statusEffects['Holding'].targets[0]], defender);
        }
        defender.statusEffects['Grappled'] = {
          id: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].id : generateRowID(),
          name: 'Grappled',
          targets: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].targets.concat([this.name]) : [this.name]
        };
      }
    },
    'applyHold': {
      value: function applyHold(defender) {
        if (_.has(this.statusEffects, 'Grappled')) {
          this.removeStatusEffect('Grappled');
        }
        this.statusEffects['Holding'] = {
          id: generateRowID(),
          name: 'Holding',
          targets: [defender.name],
          bodyPart: state.MML.GM.currentAction.calledShot
        };
        if (['Chest', 'Abdomen'].indexOf(state.MML.GM.currentAction.calledShot) > -1 && defender.movementPosition === 'Prone') {
          defender.statusEffects['Pinned'] = {
            id: _.has(defender.statusEffects, 'Pinned') ? defender.statusEffects['Pinned'].id : generateRowID(),
            name: 'Pinned',
            targets: _.has(defender.statusEffects, 'Pinned') ? defender.statusEffects['Pinned'].targets.concat([this.name]) : [this.name]
          };
        } else {
          var holder = {
            name: this.name,
            bodyPart: state.MML.GM.currentAction.calledShot
          };
          defender.statusEffects['Held'] = {
            id: _.has(defender.statusEffects, 'Held') ? defender.statusEffects['Held'].id : generateRowID(),
            name: 'Held',
            targets: _.has(defender.statusEffects, 'Pinned') ? defender.statusEffects['Pinned'].targets.concat([holder]) : [holder]
          };
        }
        if (_.has(defender.statusEffects, 'Grappled')) {
          if (defender.statusEffects['Grappled'].targets.length === 1) {
            defender.removeStatusEffect('Grappled');
          } else {
            defender.statusEffects['Grappled'] = {
              id: defender.statusEffects['Grappled'].id,
              name: 'Grappled',
              targets: _.without(defender.statusEffects['Grappled'].targets, this.name)
            };
          }
        }
      }
    },
    'applyHoldBreak': {
      value: function applyHoldBreak(defender) {
        defender.statusEffects['Grappled'] = {
          id: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].id : generateRowID(),
          name: 'Grappled',
          targets: _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].targets.concat([this.name]) : [this.name]
        };
        defender.removeStatusEffect('Holding');
        this.statusEffects['Grappled'] = {
          id: _.has(this.statusEffects, 'Grappled') ? this.statusEffects['Grappled'].id : generateRowID(),
          name: 'Grappled',
          targets: _.has(this.statusEffects, 'Grappled') ? this.statusEffects['Grappled'].targets.concat([defender.name]) : [defender.name]
        };

        if (_.has(this.statusEffects, 'Held')) {
          if (this.statusEffects['Held'].targets.length === 1) {
            this.removeStatusEffect('Held');
          } else {
            this.statusEffects['Held'] = {
              id: this.statusEffects['Held'].id,
              name: 'Held',
              targets: _.reject(this.statusEffects['Held'].targets, function(target) {
                return target.name === defender.name;
              })
            };
          }
        } else if (_.has(this.statusEffects, 'Pinned')) {
          if (this.statusEffects['Pinned'].targets.length === 1) {
            this.removeStatusEffect('Pinned');
          } else {
            this.statusEffects['Pinned'] = {
              id: this.statusEffects['Pinned'].id,
              name: 'Pinned',
              targets: _.without(this.statusEffects['Pinned'].targets, defender.name)
            };
          }
        }
      }
    },
    'applyGrappleBreak': {
      value: function applyGrappleBreak(defender) {
        if (this.statusEffects['Grappled'].targets.length === 1) {
          this.removeStatusEffect('Grappled');
        } else {
          this.statusEffects['Grappled'] = {
            id: this.statusEffects['Grappled'].id,
            name: 'Grappled',
            targets: _.without(this.statusEffects['Grappled'].targets, defender.name)
          };
        }
        if (defender.statusEffects['Grappled'].targets.length === 1) {
          defender.removeStatusEffect('Grappled');
        } else {
          defender.statusEffects['Grappled'] = {
            id: defender.statusEffects['Grappled'].id,
            name: 'Grappled',
            targets: _.without(defender.statusEffects['Grappled'].targets, this.name)
          };
        }
      }
    },
    'applyTakedown': {
      value: function applyTakedown(defender) {
        var grapplers = _.has(defender.statusEffects, 'Grappled') ? defender.statusEffects['Grappled'].targets : [];
        var holders = _.has(defender.statusEffects, 'Held') ? defender.statusEffects['Held'].targets : [];
        if (grapplers.length + holders.length > 1) {
          defender.statusEffects['Overborne'] = {
            id: generateRowID(),
            name: 'Overborne'
          };
        } else {
          defender.tatusEffects['Taken Down'] = {
            id: generateRowID(),
            name: 'Taken Down'
          };
        }
        if (holders.length > 0) {
          var targets = [];
          _.each(holders, function(holder) {
            if (['Chest', 'Abdomen'].indexOf(holder.bodyPart) > -1) {
              targets.push(holder.name);
              holder.movementPosition('Prone');
            }
          });
          if (targets.length > 0) {
            defender.statusEffects['Pinned'] = {
              id: generateRowID(),
              name: 'Pinned',
              targets: targets
            };
            if (_.reject(defender.statusEffects['Held'].targets, function(target) {
                return ['Chest', 'Abdomen'].indexOf(target.bodyPart) > -1;
              }).length === 0) {
              defender.removeStatusEffect('Held');
            } else {
              defender.statusEffects['Held'] = {
                id: defender.statusEffects['Held'].id,
                name: 'Held',
                targets: _.reject(defender.statusEffects['Held'].targets, function(target) {
                  return ['Chest', 'Abdomen'].indexOf(target.bodyPart) > -1;
                })
              };
            }
          }
        }
        if (grapplers.length > 0) {
          _.each(defender.statusEffects['Grappled'].targets, function(target) {
            target.movementPosition = 'Prone';
          });
        }
        defender.movementPosition = 'Prone';
        this.movementPosition = 'Prone';
      }
    },
    'applyRegainFeet': {
      value: function applyRegainFeet(defender) {
        var grapplers = _.has(this.statusEffects, 'Grappled') ? this.statusEffects['Grappled'].targets : [];
        var holders = _.has(this.statusEffects, 'Held') ? this.statusEffects['Held'].targets : [];

        if (holders.length > 0) {
          var targets = [];
          _.each(holders, function(target) {
            target.movementPosition = 'Walk';
          });
        }
        if (grapplers.length > 0) {
          _.each(grapplers, function(target) {
            target.movementPosition = 'Walk';
          });
        }
        this.removeStatusEffect('Taken Down');
        this.removeStatusEffect('Overborne');
        this.movementPosition = 'Walk';
      }
    },
    'releaseHold': {
      value: function releaseHold(defender) {
        defender.applyHoldBreak(this);
        defender.player.charMenuResistRelease(defender.name, this, defender);
        defender.player.displayMenu();
      }
    },
    'releaseGrapple': {
      value: function releaseGrapple(defender) {
        this.applyGrappleBreak(defender, this);
        MML.characters[this.name].action.modifiers = _.without(MML.characters[this.name].action.modifiers, 'Release Opponent');
        this.startAction();
      }
    },
    'criticalDefense': {
      value: function criticalDefense() {
        MML.endAction();
      }
    },
    'forgoDefense': {
      value: function forgoDefense(rollName) {
        state.MML.GM.currentAction.rolls[rollName] = 'Failure';
        MML[state.MML.GM.currentAction.callback]();
      }
    },
    'equipmentFailure': {
      value: function equipmentFailure() {
        log('equipmentFailure');
      }
    },
    'rollDamage': {
      value: function rollDamage(damageDice, mods, crit, callback) {
        var dice = MML.parseDice(damageDice);
        var amount = dice.amount;
        var size = dice.size;
        var damageMod = 0;
        var value;

        var mod;
        _.each(mods, function(mod) {
          damageMod += mod;
        });

        if (crit) {
          value = MML.rollDice(amount, size) + amount * size + damageMod;
          range = (amount * size + amount + damageMod) + "-" + (2 * amount * size + damageMod);
        } else {
          value = MML.rollDice(amount, size) + damageMod;
          range = (amount + damageMod) + "-" + (amount * size + damageMod);
        }

        var roll = {
          type: "damage",
          character: this.name,
          accepted: false,
          value: value,
          result: -value,
          range: range,
          message: "Roll: " + value + "\nRange: " + range,
          callback: callback
        };

        this.player.currentRoll = roll;
        this[callback]();
      }
    },
    'meleeDamageRoll': {
      value: function meleeDamageRoll(attackerWeapon, crit, bonusDamage) {
        bonusDamage = 0;
        state.MML.GM.currentAction.parameters.damageType = attackerWeapon.damageType;
        this.rollDamage(attackerWeapon.damage, [this.meleeDamageMod, bonusDamage], crit, 'meleeDamageResult');
      }
    },
    'meleeDamageResult': {
      value: function meleeDamageResult() {
        this.displayRoll('meleeDamageRollApply');
      }
    },
    'meleeDamageRollApply': {
      value: function meleeDamageRollApply() {
        state.MML.GM.currentAction.rolls.damageRoll = this.player.currentRoll.result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },
    'missileDamageRoll': {
      value: function missileDamageRoll(attackerWeapon, crit, bonusDamage) {
        bonusDamage = 0;
        state.MML.GM.currentAction.parameters.damageType = attackerWeapon.damageType;
        this.rollDamage(attackerWeapon.damage, [bonusDamage], crit, 'missileDamageResult');
      }
    },
    'missileDamageResult': {
      value: function missileDamageResult() {
        this.displayRoll('missileDamageRollApply');
      }
    },
    'missileDamageRollApply': {
      value: function missileDamageRollApply() {
        state.MML.GM.currentAction.rolls.damageRoll = this.player.currentRoll.result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },
    'castingRoll': {
      value: function castingRoll(rollName, task, skill, metaMagicMod) {
        MML.universalRoll(this, rollName, [task, skill, this.situationalMod, this.castingMod, this.attributeCastingMod, metaMagicMod], 'castingRollResult');
      }
    },
    'castingRollResult': {
      value: function castingRollResult() {
        var currentRoll = this.player.currentRoll;

        if (this.player.name === state.MML.GM.name) {
          if (currentRoll.accepted === false) {
            this.player.displayGmRoll(currentRoll);
          } else {
            if (_.contains(this.action.modifiers, 'Called Shot Specific') && currentRoll.value - currentRoll.target < 11) {
              this.action.modifiers = _.without(this.action.modifiers, 'Called Shot Specific');
              this.action.modifiers.push('Called Shot');
              currentRoll.result = 'Success';
            }
            this.castingRollApply();
          }
        } else {
          this.player.displayPlayerRoll(currentRoll);
          if (_.contains(this.action.modifiers, 'Called Shot Specific') && currentRoll.value - currentRoll.target < 11) {
            this.action.modifiers = _.without(this.action.modifiers, 'Called Shot Specific');
            this.action.modifiers.push('Called Shot');
            currentRoll.result = 'Success';
          }
          this.castingRollApply();
        }
      }
    },
    'castingRollApply': {
      value: function castingRollApply() {
        state.MML.GM.currentAction.rolls.castingRoll = this.player.currentRoll.result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },
    'startAimAction': {
      value: function startAimAction() {
        var characterWeaponInfo = MML.getCharacterWeaponAndSkill(this);

        var currentAction = {
          character: this,
          callback: 'aimAction',
          parameters: {
            attackerWeapon: characterWeaponInfo.characterWeapon,
            attackerSkill: characterWeaponInfo.skill,
            target: MML.characters[state.MML.GM.currentAction.targetArray[0]]
          },
          rolls: {}
        };

        state.MML.GM.currentAction = _.extend(state.MML.GM.currentAction, currentAction);
        this.applyStatusEffects();
        MML[currentAction.callback]();
      }
    },
    'holdAimRoll': {
      value: function holdAimRoll() {
        MML.attributeCheckRoll(this, 'Strength Check Required to Maintain Aim', 'strength', [0], 'holdAimRollResult');
      }
    },
    'holdAimRollResult': {
      value: function holdAimRollResult() {
        this.displayRoll('holdAimRollApply');
      }
    },
    'holdAimRollApply': {
      value: function holdAimRollApply() {
        var result = this.player.currentRoll.result;
        state.MML.GM.currentAction.rolls.strengthRoll = result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },
    'reloadWeapon': {
      value: function reloadWeapon() {
        var characterWeaponInfo = MML.getCharacterWeaponAndSkill(this);
        var attackerWeapon = characterWeaponInfo.characterWeapon;
        attackerWeapon.loaded++;
        this.inventory[attackerWeapon._id].loaded = attackerWeapon.loaded;
        state.MML.GM.currentAction = _.extend(state.MML.GM.currentAction, {
          character: this,
          callback: 'reloadAction',
          parameters: {
            attackerWeapon: attackerWeapon,
            attackerSkill: characterWeaponInfo.skill
          },
          rolls: {}
        });
        this.applyStatusEffects();
        this.player.charMenuReloadAction(this.name, '');
        this.player.displayMenu();
      }
    },
    'applyStatusEffects': {
      value: function applyStatusEffects() {
        var dependents = [
          'situationalInitBonus',
          'situationalMod',
          'rangedDefenseMod',
          'meleeDefenseMod',
          'missileAttackMod',
          'meleeAttackMod',
          'castingMod',
          'perceptionCheckMod'
        ];
        _.each(dependents, function(dependent) {
          this[dependent] = 0;
        }, this);
        _.each(this.statusEffects, function(effect, index) {
          if (index.indexOf('Major Wound') !== -1) {
            MML.statusEffects['Major Wound'].apply(this, [effect, index]);
          } else if (index.indexOf('Disabling Wound') !== -1) {
            MML.statusEffects['Disabling Wound'].apply(this, [effect, index]);
          } else if (index.indexOf('Mortal Wound') !== -1) {
            MML.statusEffects['Mortal Wound'].apply(this, [effect, index]);
          } else {
            MML.statusEffects[index].apply(this, [effect, index]);
          }
          MML.setCurrentAttribute(this.name, 'repeating_statuseffects_' + effect.id + '_statusEffectName', index);
          MML.setCurrentAttribute(this.name, 'repeating_statuseffects_' + effect.id + '_statusEffectDescription', (effect.description ? effect.description : ''));
        }, this);

        var regex = new RegExp('^repeating_statuseffects_.*?_.*?$');
        var charObj = MML.getCharFromName(this.name);
        var statusEffectIDs = _.pluck(this.statusEffects, 'id');
        var statusEffects = filterObjs(function(obj) {
          if (obj.get('type') !== 'attribute' || obj.get('characterid') !== charObj.id) {
            return false;
          } else {
            return regex.test(obj.get('name'));
          }
        });
        var attributestoDelete = _.filter(statusEffects, function(effect) {
          var notFound = true;
          _.each(statusEffectIDs, function(id) {
            if (_.isString(effect.get('name', 'current')) && effect.get('name', 'current').indexOf(id) > -1) {
              notFound = false;
            }
          });
          return notFound;
        });
        _.each(attributestoDelete, function(attribute) {
          attribute.remove();
        });
      }
    },
    'addStatusEffect': {
      value: function addStatusEffect(index, effect) {
        effect.id = generateRowID();
        effect.name = index;
        this.statusEffects[index] = effect;
        this.applyStatusEffects();
      }
    },
    'removeStatusEffect': {
      value: function removeStatusEffect(index) {
        if (!_.isUndefined(this.statusEffects[index])) {
          delete this.statusEffects[index];
          this.applyStatusEffects();
        }
      }
    },
    'updateInventory': {
      value: function updateInventory() {
        var items = _.omit(this.inventory, 'emptyHand');
        _.each(items, function(item, _id) {
          MML.setCurrentAttribute(this.name, 'repeating_items_' + _id + '_itemName', item.name);
          MML.setCurrentAttribute(this.name, 'repeating_items_' + _id + '_itemId', _id);
        }, this);
        items.emptyHand = {
          type: 'empty',
          weight: 0
        };
        this.inventory = items;
      }
    },
    'updateCharacterSheet': {
      value: function updateCharacterSheet() {
        _.each(this, function(value, attribute) {
          if (typeof(value) === 'object') {
            value = JSON.stringify(value);
          }
          MML.setCurrentAttribute(this.name, attribute, value);
        }, this);
      }
    },
    'updateCharacter': {
      value: function updateCharacter() {
        this.applyStatusEffects();
        this.updateInventory();
        this.updateCharacterSheet();
      }
    },
    'setPlayer': {
      value: function setPlayer() {
        var playerName = MML.getCurrentAttribute(this.name, 'player');
        var newPlayer = MML.getPlayerFromName(playerName);
        if (_.isUndefined(newPlayer)) {
          sendChat('GM', 'Player ' + playerName + ' not found.');
          newPlayer = MML.getPlayerFromName(state.MML.GM.name);
          MML.setCurrentAttribute(this.name, 'player', state.MML.GM.name);
        }
        MML.getCharFromName(this.name).set('controlledby', newPlayer.id);
        _.each(MML.players, function(player) {
          if (player.name === MML.getCurrentAttribute(this.name, 'player')) {
            player.characters.push(this.name);
          } else {
            player.characters = _.without(player.characters, this.name);
          }
        }, this);
      }
    }
  });
  Object.defineProperty(this, 'name', {
    value: charName,
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'id', {
    get: function() {
      return id;
    },
    enumerable: false
  });
  Object.defineProperty(this, 'player', {
    get: function() {
      return MML.players[MML.getCurrentAttribute(this.name, 'player')];
    },
    enumerable: false
  });
  Object.defineProperty(this, 'race', {
    get: function() {
      return MML.getCurrentAttribute(this.name, 'race');
    },
    enumerable: false
  });
  Object.defineProperty(this, 'bodyType', {
    get: function() {
      var value = MML.bodyTypes[this.race];
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'gender', {
    get: function() {
      return MML.getCurrentAttribute(this.name, 'gender');
    },
    enumerable: false
  });
  Object.defineProperty(this, 'height', {
    get: function() {
      var value = MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, 'statureRoll')].height;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'weight', {
    get: function() {
      var value = MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, 'statureRoll')].weight;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'handedness', {
    get: function() {
      return MML.getCurrentAttribute(this.name, 'handedness');
    },
    enumerable: false
  });
  Object.defineProperty(this, 'stature', {
    get: function() {
      var value = MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, 'statureRoll')].stature;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'strength', {
    get: function() {
      var value = MML.racialAttributeBonuses[this.race].strength + MML.getCurrentAttributeAsFloat(this.name, 'strengthRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'coordination', {
    get: function() {
      var value = MML.racialAttributeBonuses[this.race].coordination + MML.getCurrentAttributeAsFloat(this.name, 'coordinationRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'health', {
    get: function() {
      var value = MML.racialAttributeBonuses[this.race].health + MML.getCurrentAttributeAsFloat(this.name, 'healthRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'beauty', {
    get: function() {
      var value = MML.racialAttributeBonuses[this.race].beauty + MML.getCurrentAttributeAsFloat(this.name, 'beautyRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'intellect', {
    get: function() {
      var value = MML.racialAttributeBonuses[this.race].intellect + MML.getCurrentAttributeAsFloat(this.name, 'intellectRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'reason', {
    get: function() {
      var value = MML.racialAttributeBonuses[this.race].reason + MML.getCurrentAttributeAsFloat(this.name, 'reasonRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'creativity', {
    get: function() {
      var value = MML.racialAttributeBonuses[this.race].creativity + MML.getCurrentAttributeAsFloat(this.name, 'creativityRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'presence', {
    get: function() {
      var value = MML.racialAttributeBonuses[this.race].presence + MML.getCurrentAttributeAsFloat(this.name, 'presenceRoll');
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'willpower', {
    get: function() {
      var value = Math.round((2 * this.presence + this.health) / 3);
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'evocation', {
    get: function() {
      var value = this.intellect + this.reason + this.creativity + this.health + this.willpower + MML.racialAttributeBonuses[this.race].evocation;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'perception', {
    get: function() {
      var value = Math.round((this.intellect + this.reason + this.creativity) / 3) + MML.racialAttributeBonuses[this.race].perception;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'systemStrength', {
    get: function() {
      var value = Math.round((this.presence + 2 * this.health) / 3);
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'fitness', {
    get: function() {
      var value = Math.round((this.health + this.strength) / 2) + MML.racialAttributeBonuses[this.race].fitness;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'fitnessMod', {
    get: function() {
      var value = MML.fitnessModLookup[this.fitness];
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'load', {
    get: function() {
      var value = Math.round(this.stature * this.fitnessMod) + MML.racialAttributeBonuses[this.race].load;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'overhead', {
    get: function() {
      var value = this.load * 2;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'deadLift', {
    get: function() {
      var value = this.load * 4;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'hpMax', {
    get: function() {
      var value = MML.buildHpAttribute(this);
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'hp', {
    value: _.isUndefined(getAttrByName(this.id, 'hp', 'current')) ? MML.buildHpAttribute(this) : MML.getCurrentAttributeJSON(this.name, 'hp'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'epMax', {
    get: function() {
      var value = this.evocation;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'ep', {
    value: _.isUndefined(getAttrByName(this.id, 'ep', 'current')) ? this.evocation : MML.getCurrentAttributeAsFloat(this.name, 'ep'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'fatigueMax', {
    get: function() {
      var value = this.fitness;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'fatigue', {
    value: isNaN(parseFloat(MML.getCurrentAttribute(this.name, 'fatigue'))) ? this.fitness : MML.getCurrentAttributeAsFloat(this.name, 'fatigue'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'hpRecovery', {
    get: function() {
      var value = MML.recoveryMods[this.health].hp;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'epRecovery', {
    get: function() {
      var value = MML.recoveryMods[this.health].ep;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'inventory', {
    value: _.isUndefined(getAttrByName(this.id, 'inventory', 'current')) ? {
      emptyHand: {
        type: 'empty',
        weight: 0
      }
    } : MML.getCurrentAttributeJSON(this.name, 'inventory'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'totalWeightCarried', {
    get: function() {
      var value = _.reduce(_.pluck(this.inventory, 'weight'), function(total, weight) {
        return total + weight;
      }, 0);
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'knockdownMax', {
    get: function() {
      var value = Math.round(this.stature + (this.totalWeightCarried / 10));
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'knockdown', {
    value: isNaN(parseFloat(MML.getCurrentAttribute(this.name, 'knockdown'))) ? this.knockdownMax : MML.getCurrentAttributeAsFloat(this.name, 'knockdown'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'apv', {
    get: function() {
      var bodyType = this.bodyType;
      var armor = [];
      _.each(
        this.inventory,
        function(item) {
          if (item.type === 'armor') {
            armor.push(item);
          }
        },
        this);

      var apvMatrix = {};
      // Initialize APV Matrix
      _.each(MML.hitPositions[bodyType], function(position) {
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

      _.each(armor, function(piece) {
        var material = MML.APVList[piece.material];

        _.each(piece.protection, function(protection) {
          var position = MML.hitPositions[bodyType][protection.position].name;
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
      _.each(apvMatrix, function(position, positionName) {
        _.each(position, function(rawAPVArray, type) {
          var apvFinalArray = [];
          var coverageArray = [];

          //Creates an array of armor coverage in ascending order.
          _.each(rawAPVArray, function(apv) {
            if (coverageArray.indexOf(apv.coverage) === -1) {
              coverageArray.push(apv.coverage);
            }
          });
          coverageArray = coverageArray.sort(function(a, b) {
            return a - b;
          });

          //Creates APV array per damage type per position
          _.each(coverageArray, function(apvCoverage) {
            var apvToLayerArray = [];
            var apvValue = 0;

            //Builds an array of APVs that meet or exceed the coverage value
            _.each(rawAPVArray, function(apv) {
              if (apv.coverage >= apvCoverage) {
                apvToLayerArray.push(apv.value);
              }
            });
            apvToLayerArray = apvToLayerArray.sort(function(a, b) {
              return b - a;
            });

            //Adds the values at coverage value with diminishing returns on layered armor
            _.each(apvToLayerArray, function(value, index) {
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
    },
    enumerable: false
  });
  Object.defineProperty(this, 'leftHand', {
    value: _.isEmpty(MML.getCurrentAttributeJSON(this.name, 'leftHand')) ? JSON.stringify({
      _id: 'emptyHand',
      grip: 'unarmed'
    }) : MML.getCurrentAttributeJSON(this.name, 'leftHand'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'rightHand', {
    value: _.isEmpty(MML.getCurrentAttributeJSON(this.name, 'rightHand')) ? JSON.stringify({
      _id: 'emptyHand',
      grip: 'unarmed'
    }) : MML.getCurrentAttributeJSON(this.name, 'rightHand'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'hitTable', {
    get: function() {
      var value = MML.getHitTable(this);
      return value;
    },
    enumerable: false
  });
  Object.defineProperty(this, 'movementRatio', {
    get: function() {
      var movementRatio;

      if (this.totalWeightCarried === 0) {
        movementRatio = Math.round(10 * this.load) / 10;
      } else {
        movementRatio = Math.round(10 * this.load / this.totalWeightCarried) / 10;
      }

      if (movementRatio > 4.0) {
        movementRatio = 4.0;
      }
      return movementRatio;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'movementAvailable', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'movementAvailable'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'movementPosition', {
    value: MML.getCurrentAttribute(this.name, 'movementPosition'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'pathID', {
    get: function() {
      return MML.getCurrentAttribute(this.name, 'pathID');
    }
  });
  Object.defineProperty(this, 'situationalMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'situationalMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'attributeDefenseMod', {
    get: function() {
      var value = MML.attributeMods.strength[this.strength] + MML.attributeMods.coordination[this.coordination];
      return value;
    },
    enumerable: false
  });
  Object.defineProperty(this, 'meleeDefenseMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'meleeDefenseMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'rangedDefenseMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'rangedDefenseMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'meleeAttackMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'meleeAttackMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'attributeMeleeAttackMod', {
    get: function() {
      var value = MML.attributeMods.strength[this.strength] + MML.attributeMods.coordination[this.coordination];
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'meleeDamageMod', {
    get: function() {
      var value = _.find(MML.meleeDamageMods, function(mod) {
        return this.load >= mod.low && this.load <= mod.high;
      }, this).value;
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'missileAttackMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'missileAttackMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'attributeMissileAttackMod', {
    get: function() {
      var value = MML.attributeMods.perception[this.perception] + MML.attributeMods.coordination[this.coordination] + MML.attributeMods.strength[this.strength];
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'castingMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'castingMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'attributeCastingMod', {
    get: function() {
      var attributeCastingMod = MML.attributeMods.reason[this.reason];

      if (this.senseInitBonus > 2) {} else if (this.senseInitBonus > 0) {
        attributeCastingMod -= 10;
      } else if (this.senseInitBonus > -2) {
        attributeCastingMod -= 20;
      } else {
        attributeCastingMod -= 30;
      }

      if (this.fomInitBonus === 3 || this.fomInitBonus === 2) {
        attributeCastingMod -= 5;
      } else if (this.fomInitBonus === 1) {
        attributeCastingMod -= 10;
      } else if (this.fomInitBonus === 0) {
        attributeCastingMod -= 15;
      } else if (this.fomInitBonus === -1) {
        attributeCastingMod -= 20;
      } else if (this.fomInitBonus === -2) {
        attributeCastingMod -= 30;
      }
      return attributeCastingMod;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'spellLearningMod', {
    get: function() {
      var value = MML.attributeMods.intellect[this.intellect];
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'statureCheckMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'statureCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'strengthCheckMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'strengthCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'coordinationCheckMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'coordinationCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'healthCheckMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'healthCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'beautyCheckMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'beautyCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'intellectCheckMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'intellectCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'reasonCheckMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'reasonCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'creativityCheckMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'creativityCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'presenceCheckMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'presenceCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'willpowerCheckMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'willpowerCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'evocationCheckMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'evocationCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'perceptionCheckMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'perceptionCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'systemStrengthCheckMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'systemStrengthCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'fitnessCheckMod', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'fitnessCheckMod'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'statusEffects', {
    value: MML.getCurrentAttributeJSON(this.name, 'statusEffects'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'initiative', {
    get: function() {
      var value;
      var initiative = this.initiativeRollValue +
        this.situationalInitBonus +
        this.movementRatioInitBonus +
        this.attributeInitBonus +
        this.senseInitBonus +
        this.fomInitBonus +
        this.firstActionInitBonus +
        this.spentInitiative;
      if (initiative < 0 || state.MML.GM.roundStarted === false || this.situationalInitBonus === 'No Combat' || this.movementRatioInitBonus === 'No Combat') {
        value = 0;
      } else {
        value = initiative;
      }
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'initiativeRollValue', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'initiativeRollValue'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'situationalInitBonus', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'situationalInitBonus'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'movementRatioInitBonus', {
    get: function() {
      var value;

      if (this.movementRatio < 0.6) {
        value = 'No Combat';
      } else if (this.movementRatio === 0.6) {
        value = -4;
      } else if (this.movementRatio < 0.7 && this.movementRatio <= 0.8) {
        value = -3;
      } else if (this.movementRatio > 0.8 && this.movementRatio <= 1.0) {
        value = -2;
      } else if (this.movementRatio > 1.0 && this.movementRatio <= 1.2) {
        value = -1;
      } else if (this.movementRatio > 1.2 && this.movementRatio <= 1.4) {
        value = 0;
      } else if (this.movementRatio > 1.4 && this.movementRatio <= 1.7) {
        value = 1;
      } else if (this.movementRatio > 1.7 && this.movementRatio <= 2.0) {
        value = 2;
      } else if (this.movementRatio > 2.0 && this.movementRatio <= 2.5) {
        value = 3;
      } else if (this.movementRatio > 2.5 && this.movementRatio <= 3.2) {
        value = 4;
      } else if (this.movementRatio > 3.2) {
        value = 5;
      }
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'attributeInitBonus', {
    get: function() {
      var value;
      var attributeArray = [this.strength, this.coordination, this.reason, this.perception];
      var rankingAttribute = attributeArray.sort(function(a, b) {
        return a - b;
      })[0];

      if (rankingAttribute <= 9) {
        value = -1;
      } else if (rankingAttribute === 10 || rankingAttribute === 11) {
        value = 0;
      } else if (rankingAttribute === 12 || rankingAttribute === 13) {
        value = 1;
      } else if (rankingAttribute === 14 || rankingAttribute === 15) {
        value = 2;
      } else if (rankingAttribute === 16 || rankingAttribute === 17) {
        value = 3;
      } else if (rankingAttribute === 18 || rankingAttribute === 19) {
        value = 4;
      } else if (rankingAttribute >= 20) {
        value = 5;
      }
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'senseInitBonus', {
    get: function() {
      var value;
      var armorList = _.where(this.inventory, {
        type: 'armor'
      });
      var bitsOfHelm = ['Barbute Helm', 'Bascinet Helm', 'Camail', 'Camail-Conical', 'Cap', 'Cheeks', 'Conical Helm', 'Duerne Helm', 'Dwarven War Hood', 'Face Plate', 'Great Helm', 'Half-Face Plate', 'Hood', 'Nose Guard', 'Pot Helm', 'Sallet Helm', 'Throat Guard', 'War Hat'];
      var senseArray = [];

      _.each(bitsOfHelm, function(bit) {
        _.each(armorList, function(piece) {
          if (piece.name.indexOf(bit) !== -1) {
            senseArray.push(bit);
          }
        });
      });

      //nothing on head
      if (senseArray.length === 0) {
        value = 4;
      } else {
        //Head fully encased in metal
        if (senseArray.indexOf('Great Helm') !== -1 || (senseArray.indexOf('Sallet Helm') !== -1 && senseArray.indexOf('Throat Guard') !== -1)) {
          value = -2;
        }
        //wearing a helm
        else if (_.intersection(senseArray, ['Barbute Helm', 'Sallet Helm', 'Bascinet Helm', 'Duerne Helm', 'Cap', 'Pot Helm', 'Conical Helm', 'War Hat']).length > 0) {
          //Has faceplate
          if (senseArray.indexOf('Face Plate') !== -1) {
            //Enclosed Sides
            if (_.intersection(senseArray, ['Barbute Helm', 'Bascinet Helm', 'Duerne Helm']).length > 0) {
              value = -2;
            } else {
              value = -1;
            }
          }
          //These types of helms or half face plate
          else if (_.intersection(senseArray, ['Barbute Helm', 'Sallet Helm', 'Bascinet Helm', 'Duerne Helm', 'Half-Face Plate']).length > 0) {
            value = 0;
          }
          //has camail or cheeks
          else if (_.intersection(senseArray, ['Camail', 'Camail-Conical', 'Cheeks']).length > 0) {
            value = 1;
          }
          //Wearing a hood
          else if (_.intersection(senseArray, ['Dwarven War Hood', 'Hood']).length > 0) {
            _.each(armorList, function(piece) {
              if (piece.name === 'Dwarven War Hood' || piece.name === 'Hood') {
                if (piece.family === 'Cloth') {
                  value = 2;
                } else {
                  value = 1;
                }
              }
            });
          }
          //has nose guard
          else if (senseArray.indexOf('Nose Guard') !== -1) {
            value = 2;
          }
          // just a cap
          else {
            value = 3;
          }
        }
        //Wearing a hood
        else if (_.intersection(senseArray, ['Dwarven War Hood', 'Hood']).length > 0) {
          _.each(armorList, function(piece) {
            if (piece.name === 'Dwarven War Hood' || piece.name === 'Hood') {
              if (piece.family === 'Cloth') {
                value = 2;
              } else {
                value = 1;
              }
            }
          });
        }
      }
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'fomInitBonus', {
    get: function() {
      return MML.getCurrentAttributeAsFloat(this.name, 'fomInitBonus');
    },
    enumerable: true
  });
  Object.defineProperty(this, 'firstActionInitBonus', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'firstActionInitBonus'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'spentInitiative', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'spentInitiative'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'actionTempo', {
    get: function() {
      var tempo;

      if (_.isUndefined(this.action.skill) || this.action.skill < 30) {
        tempo = 0;
      } else if (this.action.skill < 40) {
        tempo = 1;
      } else if (this.action.skill < 50) {
        tempo = 2;
      } else if (this.action.skill < 60) {
        tempo = 3;
      } else if (this.action.skill < 70) {
        tempo = 4;
      } else {
        tempo = 5;
      }

      // If Dual Wielding
      if (this.action.name === 'Attack' && MML.isDualWielding(this)) {
        var twfSkill = this.weaponskills['Two Weapon Fighting'].level;
        if (twfSkill > 19 && twfSkill) {
          tempo += 1;
        } else if (twfSkill >= 40 && twfSkill < 60) {
          tempo += 2;
        } else if (twfSkill >= 60) {
          tempo += 3;
        }
        // If Dual Wielding identical weapons
        if (this.inventory[this.leftHand._id].name === this.inventory[this.rightHand._id].name) {
          tempo += 1;
        }
      }
      var value = MML.attackTempoTable[tempo];
      return value;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'ready', {
    value: MML.getCurrentAttributeAsBool(this.name, 'ready'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'action', {
    value: MML.getCurrentAttributeJSON(this.name, 'action'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'previousAction', {
    value: MML.getCurrentAttributeJSON(this.name, 'previousAction'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'roundsRest', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'roundsRest'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'roundsExertion', {
    value: MML.getCurrentAttributeAsFloat(this.name, 'roundsExertion'),
    writable: true,
    enumerable: false
  });
  Object.defineProperty(this, 'skills', {
    get: function() {
      var characterSkills = MML.getSkillAttributes(this.name, 'skills');
      _.each(
        characterSkills,
        function(characterSkill, skillName) {
          var level = characterSkill.input;
          var attribute = MML.skills[skillName].attribute;

          level += MML.attributeMods[attribute][this[attribute]];

          if (_.isUndefined(MML.skillMods[this.race]) === false && _.isUndefined(MML.skillMods[this.race][skillName]) === false) {
            level += MML.skillMods[this.race][skillName];
          }
          if (_.isUndefined(MML.skillMods[this.gender]) === false && _.isUndefined(MML.skillMods[this.gender][skillName]) === false) {
            level += MML.skillMods[this.gender][skillName];
          }
          characterSkill.level = level;
          MML.setCurrentAttribute(this.name, 'repeating_skills_' + characterSkill._id + '_name', skillName);
          MML.setCurrentAttribute(this.name, 'repeating_skills_' + characterSkill._id + '_input', characterSkill.input);
          MML.setCurrentAttribute(this.name, 'repeating_skills_' + characterSkill._id + '_level', level);
        },
        this
      );

      return characterSkills;
    },
    enumerable: false
  });
  Object.defineProperty(this, 'weaponSkills', {
    get: function() {
      var characterSkills = MML.getSkillAttributes(this.name, "weaponskills");
      var highestSkill;

      _.each(
        characterSkills,
        function(characterSkill, skillName) {
          var level = characterSkill.input;

          // This may need to include other modifiers
          if (_.isUndefined(MML.weaponSkillMods[this.race]) === false && _.isUndefined(MML.weaponSkillMods[this.race][skillName]) === false) {
            level += MML.weaponSkillMods[this.race][skillName];
          }
          characterSkill.level = level;
        },
        this
      );

      highestSkill = _.max(characterSkills, function(skill) {
        return skill.level;
      }).level;
      if (isNaN(highestSkill)) {
        highestSkill = 0;
      }

      if (_.isUndefined(characterSkills["Default Martial"])) {
        characterSkills["Default Martial"] = {
          input: 0,
          level: 0,
          _id: generateRowID()
        };
      }

      if (highestSkill < 20) {
        characterSkills["Default Martial"].level = 1;
      } else {
        characterSkills["Default Martial"].level = Math.round(highestSkill / 2);
      }

      _.each(
        characterSkills,
        function(characterSkill, skillName) {
          MML.setCurrentAttribute(this.name, "repeating_weaponskills_" + characterSkill._id + "_name", skillName);
          MML.setCurrentAttribute(this.name, "repeating_weaponskills_" + characterSkill._id + "_input", characterSkill.input);
          MML.setCurrentAttribute(this.name, "repeating_weaponskills_" + characterSkill._id + "_level", characterSkill.level);
        },
        this
      );
      return characterSkills;
    },
    enumerable: false
  });
  Object.defineProperty(this, 'fov', {
    get: function() {
      var value;
      switch (this.senseInitBonus) {
        case 4:
          value = 180;
          break;
        case 3:
          value = 170;
          break;
        case 2:
          value = 160;
          break;
        case 1:
          value = 150;
          break;
        case 0:
          value = 140;
          break;
        case -1:
          value = 130;
          break;
        case -2:
          value = 120;
          break;
        default:
          value = 180;
          break;
      }
      return value;
    }
  });
  Object.defineProperty(this, 'spells', {
    get: function() {
      return MML.getCurrentAttributeAsArray(this.name, 'spells');
    }
  });
};
