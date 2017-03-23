// Character Creation
MML.Character = function(charName, id) {
Object.defineProperties(this, {
    //Combat Functions
    'displayRoll': {
      value: function(callback) {
        var currentRoll = this.player.currentRoll;
        if (this.player.name === state.MML.GM.name) {
          if (currentRoll.accepted === false) {
            this.player.displayGmRoll(currentRoll);
          } else {
            this[callback](currentRoll);
          }
        } else {
          this.player.displayPlayerRoll(currentRoll);
          this[callback](currentRoll);
        }
      }
    },

    'displayMovement': {
      value: function() {
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
      value: function(distance) {
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
      value: function() {
        if (_.has(this.statusEffects, 'Melee This Round')) {
          var fatigueRate = 1;
          if (_.has(this.statusEffects, 'Pinned')) {
            fatigueRate = 2;
          }
          this.roundsExertion = this.roundsExertion + fatigueRate;
          this.roundsRest = 0;

          if (!_.has(this.statusEffects, 'Fatigue')) {
            if (this.roundsExertion > this.fitness) {
              this.fatigueCheckRoll(0);
            }
          } else {
            if (this.roundsExertion > Math.round(this.fitness / 2)) {
              this.fatigueCheckRoll(-4);
            }
          }
        } else if (_.has(this.statusEffects, 'Fatigue')) {
          this.roundsRest = this.roundsRest + 1;

          if (this.roundsRest >= 6) {
            this.fatigueRecoveryRoll(0);
          }
        }

        // Reset knockdown number
        this.knockdown = this.knockdownMax;
        this.spentInitiative = 0;

        this.previousAction = this.action;
        this.action = { modifiers: [] };
        this.applyStatusEffects();
        this.setReady(false);
      }
    },

    'setReady': {
      value: function(ready) {
        if (state.MML.GM.inCombat === true && ready === false) {
          MML.getTokenFromChar(this.name).set('tint_color', '#FF0000');
        } else {
          MML.getTokenFromChar(this.name).set('tint_color', 'transparent');
        }
        this.ready = ready;
      }
    },

    'setCombatVision': {
      value: function() {
        var token = MML.getTokenFromChar(this.name);
        if (state.MML.GM.inCombat || !_.has(this.statusEffects, 'Observe')) {
          token.set('light_losangle', this.fov);
          token.set('light_hassight', true);
        } else {
          token.set('light_losangle', 360);
          token.set('light_hassight', true);
        }
      }
    },

    'getSingleTarget': {
      value: function() {
        MML.displayTargetSelection({ charName: this.name, callback: 'setCurrentCharacterTargets' });
      }
    },

    'getSpellTargets': {
      value: function() {
        MML.displayTargetSelection({ charName: this.name, callback: 'getAdditionalTarget' });
      }
    },

    'getAdditionalTarget': {
      value: function(target) {
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
      value: function(radius) {
        state.MML.GM.currentAction.parameters.spellMarker = 'spellMarkerCircle';
        var token = MML.getTokenFromChar(this.name);
        var graphic = createObj('graphic', {
             name: 'spellMarkerCircle',
             _pageid: token.get('_pageid'),
             layer: 'objects',
             left: token.get('left'),
             top: token.get('top'),
             width: MML.feetToPixels(radius*2),
             height: MML.feetToPixels(radius*2),
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
      value: function(bodyPart, hpAmount) {
        var initialHP = this.hp[bodyPart];
        var currentHP = initialHP + hpAmount;
        var maxHP = this.hpMax[bodyPart];

        if (hpAmount < 0) { //if damage
          var duration;
          this.hp[bodyPart] = currentHP;

          //Wounds
          if (currentHP < Math.round(maxHP / 2) && currentHP >= 0) { //Major wound
            log('Major');
            if (initialHP >= Math.round(maxHP / 2) && !_.has(this.statusEffects, 'Major Wound, ' + bodyPart)) { //Fresh wound
              duration = Math.round(maxHP / 2) - currentHP;
            } else { //Add damage to duration of effect
              duration = parseInt(this.statusEffects['Major Wound, ' + bodyPart].duration) - hpAmount;
            }
            state.MML.GM.currentAction.woundDuration = duration;
            this.player.charMenuMajorWoundRoll(this.name);
            this.player.displayMenu();
          } else if (currentHP < 0 && currentHP > -maxHP) { //Disabling wound
            log('Disabling');
            if (!_.has(this.statusEffects, 'Disabling Wound, ' + bodyPart)) { //Fresh wound
              duration = -currentHP;
            } else { //Add damage to duration of effect
              duration = parseInt(this.statusEffects['Disabling Wound, ' + bodyPart].duration) - hpAmount;
            }
            state.MML.GM.currentAction.woundDuration = duration;
            this.player.charMenuDisablingWoundRoll(this.name);
            this.player.displayMenu();
          } else if (currentHP < -maxHP) { //Mortal wound
            log('Mortal');
            this.statusEffects['Mortal Wound, ' + bodyPart] = {
              id: generateRowID(),
              bodyPart: bodyPart
            };
            MML[state.MML.GM.currentAction.callback]();
          } else {
            log('Minor');
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
      value: function() {
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
      value: function() {
        this.attributeCheckRoll('systemStrength', [0], 'multiWoundRollResult');
      }
    },

    'multiWoundRollResult': {
      value: function() {
        this.displayRoll('multiWoundRollApply');
      }
    },

    'multiWoundRollApply': {
      value: function() {
        var result = this.player.currentRoll.result;
        state.MML.GM.currentAction.multiWoundRoll = result;
        if (result === 'Failure') {
          this.statusEffects['Wound Fatiuge'] = {
            id: generateRowID()
          };
        }
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'majorWoundRoll': {
      value: function() {
        this.attributeCheckRoll('Major Wound Willpower Roll', 'willpower', [0], 'majorWoundRollResult');
      }
    },

    'majorWoundRollResult': {
      value: function() {
        this.displayRoll('majorWoundRollApply');
      }
    },

    'majorWoundRollApply': {
      value: function() {
        var result = this.player.currentRoll.result;
        state.MML.GM.currentAction.woundRoll = result;
        var bodyPart = state.MML.GM.currentAction.rolls.hitPositionRoll.bodyPart;
        if (result === 'Failure') {
          this.statusEffects['Major Wound, ' + bodyPart] = {
            id: generateRowID(),
            duration: state.MML.GM.currentAction.woundDuration,
            startingRound: state.MML.GM.currentRound,
            bodyPart: bodyPart
          };
        }
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'disablingWoundRoll': {
      value: function() {
        this.attributeCheckRoll('Disabling Wound System Strength Roll', 'systemStrength', [0], 'disablingWoundRollResult');
      }
    },

    'disablingWoundRollResult': {
      value: function() {
        this.displayRoll('disablingWoundRollApply');
      }
    },

    'disablingWoundRollApply': {
      value: function() {
        var result = this.player.currentRoll.result;
        state.MML.GM.currentAction.woundRoll = result;
        var bodyPart = state.MML.GM.currentAction.rolls.hitPositionRoll.bodyPart;

        this.statusEffects['Disabling Wound, ' + bodyPart] = {
          id: generateRowID(),
          bodyPart: bodyPart
        };
        if (result === 'Failure') {
          this.statusEffects['Stunned'] = {
            id: generateRowID(),
            startingRound: state.MML.GM.currentRound,
            duration: state.MML.GM.currentAction.woundDuration
          };
        }
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'knockdownCheck': {
      value: function(damage) {
        this.knockdown += damage;
        if (this.movementPosition !== 'Prone' && this.knockdown < 1) {
          this.knockdownRoll();
        } else {
          MML[state.MML.GM.currentAction.callback]();
        }
      }
    },

    'knockdownRoll': {
      value: function() {
        this.attributeCheckRoll('Knockdown System Strength Roll', 'systemStrength', [_.has(this.statusEffects, 'Stumbling') ? -5 : 0], 'getKnockdownRoll');
      }
    },

    'knockdownRollResult': {
      value: function() {
        this.displayRoll('knockdownRollApply');
      }
    },

    'knockdownRollApply': {
      value: function() {
        var result = this.player.currentRoll.result;

        if (result === 'Critical Failure' || result === 'Failure') {
          this.movementPosition = 'Prone';
        } else {
          this.statusEffects['Stumbling'] = {
            id: generateRowID(),
            startingRound: state.MML.GM.currentRound
          };
        }

        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'sensitiveAreaCheck': {
      value: function(hitPosition) {
        if (MML.sensitiveAreas[this.bodyType].indexOf(hitPosition) > -1) {
          this.sensitiveAreaRoll();
        } else {
          MML[state.MML.GM.currentAction.callback]();
        }
      }
    },

    'sensitiveAreaRoll': {
      value: function() {
        this.attributeCheckRoll('Sensitive Area Willpower Roll', 'willpower', [0], 'sensitiveAreaRollResult');
      }
    },

    'sensitiveAreaRollResult': {
      value: function() {
        this.displayRoll('sensitiveAreaRollApply');
      }
    },

    'sensitiveAreaRollApply': {
      value: function() {
        var result = this.player.currentRoll.result;
        if (result === 'Critical Failure' || result === 'Failure') {
          this.statusEffects['Sensitive Area'] = {
            id: generateRowID(),
            startingRound: state.MML.GM.currentRound
          };
        }
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'alterEP': {
      value: function(epAmount) {
        this.ep += epAmount;

        if (this.ep < Math.round(0.75 * this.epMax)) {
          this.fatigueCheckRoll(0);
        } else {
          MML[state.MML.GM.currentAction.callback]();
        }
      }
    },

    'fatigueCheckRoll': {
      value: function(modifier) {
        this.attributeCheckRoll('Fatigue Check Fitness Roll', 'fitness', [modifier], 'fatigueCheckRollResult');
      }
    },

    'fatigueCheckRollResult': {
      value: function() {
        this.displayRoll('fatigueCheckRollApply');
      }
    },

    'fatigueCheckRollApply': {
      value: function() {
        var result = this.player.currentRoll.result;
        if (result === 'Critical Failure' || result === 'Failure') {
          this.statusEffects['Fatigue'] = {
            value: {
              id: _.has(this.statusEffects, 'Fatigue') ? this.statusEffects['Fatigue'].id : generateRowID(),
              name: 'Fatigue',
              level: _.has(this.statusEffects, 'Fatigue') ? this.statusEffects['Fatigue'].level + 1 : 1
            }
          };
          this.roundsExertion = 0;
        }
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'fatigueRecoveryRoll': {
      value: function(modifier) {
        this.attributeCheckRoll('Fatigue Recovery Check Health Roll', 'health', [modifier], 'fatigueRecoveryRollResult');
      }
    },

    'fatigueRecoveryRollResult': {
      value: function() {
        this.displayRoll('fatigueRecoveryRollApply');
      }
    },

    'fatigueRecoveryRollApply': {
      value: function() {
        var result = this.player.currentRoll.result;
        if (result === 'Critical Success' || result === 'Success') {
          this.roundsRest = 0;
          this.roundsExertion = 0;
          this.statusEffects['Fatigue'].level--;
        }
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'armorDamageReduction': {
      value: function(position, damage, type, coverageRoll) {
        var damageApplied = false; //Accounts for partial coverage, once true the loop stops
        var damageDeflected = 0;
        log(this.apv);
        log(position);
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
      value: function() {
      var initBonus = 10;

      if (this.action.name === 'Attack') {
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
          initBonus = this.action.initiative;
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

      _.each(this.action.modifiers, function(modifier) {
        this.statusEffects[modifier] = {
          id: generateRowID(),
          name: modifier
        };
      }, this);
    }
    },

    'initiativeRoll': {
      value: function() {
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
      value: function() {
        this.player.rollResult =
          this.player.currentRoll.value +
          this.situationalInitBonus +
          this.movementRatioInitBonus +
          this.attributeInitBonus +
          this.senseInitBonus +
          this.fomInitBonus +
          this.firstActionInitBonus +
          this.spentInitiative;

        this.player.message =
          'Roll: ' + this.player.currentRoll.value +
          '\nResult: ' + this.player.currentRoll.rollResult +
          '\nRange: ' + this.player.currentRoll.range;

        this.displayRoll('initiativeApply');
      }
    },

    'initiativeApply': {
      value: function() {
        this.initiativeRollValue = this.player.currentRoll.value;
        this.setReady(true);
        this.player.prepareNextCharacter();
      }
    },

    'startAction': {
      value: function() {
        state.MML.GM.currentAction = {
          character: this
        };

        if (_.contains(this.action.modifiers, ['Ready Item'])) {
          _.each(this.action.items, function (item) {
            if (item.grip === 'Left') {
              this.leftHand._id = item.itemId;
              if (item.type === 'weapon') {
                this.leftHand.grip = 'One Hand';
              } else {
                this.leftHand.grip = 'unarmed';
              }
            } else if (item.grip === 'Right') {
              this.rightHand._id = item.itemId;
              if (item.type === 'weapon') {
                this.rightHand.grip = 'One Hand';
              } else {
                this.rightHand.grip = 'unarmed';
              }
            } else {
              this.leftHand._id = item.itemId;
              this.leftHand.grip = item.grip;
              this.rightHand._id = item.itemId;
              this.rightHand.grip = item.grip;
            }
          });
        }

        if (_.contains(this.action.modifiers, 'Release Opponent')) {
          var targetName = _.has(this.statusEffects, 'Holding') ? this.statusEffects['Holding'].targets[0] : this.statusEffects['Grappled'].targets[0];
          state.MML.GM.currentAction.parameters = { target: MML.characters[targetName] };
          this.releaseOpponentAction();
        } else if (this.action.name === 'Cast') {
          if (!_.isUndefined(this.previousAction) && !_.isUndefined(this.previousAction.spell) && this.previousAction.spell.actions > 1) {
            this.action.spell.actions = this.previousAction.spell.actions -1;
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
          this.action.callback();
        }
      }
    },

    'chooseSpellTargets': {
      value: function() {
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
      value: function() {
        state.MML.GM.currentAction.parameters.target = MML.characters[state.MML.GM.currentAction.targetArray[0]];
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'startAttackAction': {
      value: function(target) {
        if (_.has(this.statusEffects, 'Called Shot') || this.action.weaponType === 'Place a Hold' || this.action.weaponType === 'Head Butt') {
          this.player.charMenuSelectBodyPart(this.name);
          this.player.displayMenu();
        } else if (_.has(this.statusEffects, 'Called Shot Specific')) {
          this.player.charMenuSelectHitPosition(this.name);
          this.player.displayMenu();
        } else if (_.contains(this.action.modifiers, ['Aim'])) {
          if (_.has(this.statusEffects, 'Taking Aim')) {
            this.statusEffects['Taking Aim'].level++;
          } else {
            this.addStatusEffects('Taking Aim', {
              name: 'Taking Aim',
              level: 1,
              target: target
            });
          }
        } else {
          this.processAttack();
        }
      }
    },

    'processAttack': {
      value: function() {
        this.addStatusEffect('Melee This Round', { name: 'Melee This Round' });

        if (['Punch', 'Kick', 'Head Butt', 'Bite'].indexOf(this.action.weaponType) > -1) {
          this.unarmedAttack();
        } else if (['Grapple', 'Place a Hold', 'Break a Hold', 'Break Grapple', 'Takedown', 'Regain Feet'].indexOf(this.action.weaponType) > -1) {
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
      value: function() {
        var characterWeaponInfo = MML.getCharacterWeaponAndSkill(this);

        var currentAction = {
          character: this,
          callback: 'meleeAttackAction',
          parameters: {
            attackerWeapon: characterWeaponInfo.characterWeapon,
            attackerSkill: characterWeaponInfo.skill,
            target: MML.characters[state.MML.GM.currentAction.targetArray[0]]
          },
          rolls: {}
        };

        state.MML.GM.currentAction = _.extend(state.MML.GM.currentAction, currentAction);
        MML[currentAction.callback]();
      }
    },

    'meleeAttackRoll': {
      value: function(rollName, character, task, skill) {
        this.universalRoll(rollName, 'attackRollResult', [task, skill, character.situationalMod, character.meleeAttackMod, character.attributeMeleeAttackMod]);
      }
    },

    'missileAttack': {
      value: function() {
        var target = MML.characters[state.MML.GM.currentAction.targetArray[0]];
        var range = MML.getDistanceBetweenChars(this.name, target.name);
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

        var currentAction = {
          character: this,
          callback: 'missileAttackAction',
          parameters: {
            attackerWeapon: attackerWeapon,
            attackerSkill: MML.getWeaponSkill(this, item),
            target: target,
            range: range
          },
          rolls: {}
        };

        state.MML.GM.currentAction = _.extend(state.MML.GM.currentAction, currentAction);
        MML[currentAction.callback]();
      }
    },

    'missileAttackRoll': {
      value: function(rollName, task, skill, target) {
        var mods = [task, skill, this.situationalMod, this.missileAttackMod, this.attributeMissileAttackMod];
        if (_.has((target.statusEffects, 'Shoot From Cover'))) {
          mods.push(-20);
        }
        this.universalRoll(rollName, 'attackRollResult', mods);
      }
    },

    'unarmedAttack': {
      value: function() {
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
        var currentAction = {
          character: this,
          callback: 'unarmedAttackAction',
          parameters: {
            attackType: attackType,
            attackerSkill: this.action.skill,
            target: MML.characters[state.MML.GM.currentAction.targetArray[0]]
          },
          rolls: {}
        };
        state.MML.GM.currentAction = _.extend(state.MML.GM.currentAction, currentAction);
        MML[currentAction.callback]();
      }
    },

    'grappleAttack': {
      value: function() {
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
        var currentAction = {
          character: this,
          callback: 'grappleAttackAction',
          parameters: {
            attackType: attackType,
            attackerSkill: this.action.skill,
            target: MML.characters[state.MML.GM.currentAction.targetArray[0]]
          },
          rolls: {}
        };
        state.MML.GM.currentAction = _.extend(state.MML.GM.currentAction, currentAction);
        MML[currentAction.callback]();
      }
    },

    'attackRollResult': {
      value: function() {
        var currentRoll = this.player.currentRoll;

        if (this.player.name === state.MML.GM.name) {
          if (currentRoll.accepted === false) {
            this.player.displayGmRoll(currentRoll);
          } else {
            if (_.contains(this.action.modifiers, ['Called Shot Specific']) && currentRoll.value - currentRoll.target < 11) {
              this.action.modifiers = _.without(this.action.modifiers, 'Called Shot Specific');
              this.action.modifiers.push('Called Shot');
              currentRoll.result = 'Success';
            }
            this.attackRollApply();
          }
        } else {
          this.player.displayPlayerRoll(currentRoll);
          if (_.contains(this.action.modifiers, ['Called Shot Specific']) && currentRoll.value - currentRoll.target < 11) {
            this.action.modifiers = _.without(this.action.modifiers, 'Called Shot Specific');
            this.action.modifiers.push('Called Shot');
            currentRoll.result = 'Success';
          }
          this.attackRollApply();
        }
      }
    },

    'attackRollApply': {
      value: function() {
        state.MML.GM.currentAction.rolls.attackRoll = this.player.currentRoll.result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'hitPositionRoll': {
      value: function() {
        var rollValue;
        var range;
        var result;
        var action = state.MML.GM.currentAction;
        var target = MML.characters[action.targetArray[action.targetIndex]];

        if (_.contains(this.action.modifiers, ['Called Shot Specific'])) {
          rollValue = parseInt(_.findKey(MML.hitPositions[target.bodyType], function(hitPosition) {
            return hitPosition.name === action.calledShot;
          }));
          range = rollValue + '-' + rollValue;
          result = MML.hitPositions[target.bodyType][rollValue];
        } else if (_.contains(this.action.modifiers, 'Called Shot')) {
          var rangeUpper = MML.getAvailableHitPositions(target, action.calledShot).length;
          rollValue = MML.rollDice(1, rangeUpper);
          range = '1-' + rangeUpper;
          result = MML.getCalledShotHitPosition(target, rollValue, action.calledShot);
        } else {
          range = '1-' + _.keys(MML.hitPositions[target.bodyType]).length;
          result = MML.getHitPosition(target, MML.rollDice(1, 100));
          rollValue = parseInt(_.findKey(MML.hitPositions[target.bodyType], function(hitPosition) {
            return hitPosition.name === result.name;
          }));
        }
        this.player.currentRoll = {
          type: 'hitPosition',
          character: this.name,
          player: this.player,
          callback: 'hitPositionRollResult',
          range: range,
          result: result,
          value: rollValue,
          accepted: false
        };
        this.hitPositionRollResult();
      }
    },

    'hitPositionRollResult': {
      value: function() {
        var currentRoll = this.player.currentRoll;
        var action = state.MML.GM.currentAction;
        var target = MML.characters[action.targetArray[action.targetIndex]];

        if (_.has(this.statusEffects, 'Called Shot')) {
          currentRoll.result = MML.getCalledShotHitPosition(target, currentRoll.value, action.calledShot);
        } else {
          currentRoll.result = MML.hitPositions[target.bodyType][currentRoll.value];
        }

        currentRoll.message = 'Roll: ' + currentRoll.value +
          '\nResult: ' + currentRoll.result.name +
          '\nRange: ' + currentRoll.range;

        this.player.currentRoll = currentRoll;
        this.displayRoll(hitPositionRollApply);
      }
    },

    'hitPositionRollApply': {
      value: function(currentRoll) {
        state.MML.GM.currentAction.rolls.hitPositionRoll = currentRoll.result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'meleeDefense': {
      value: function(defender, attackerWeapon) {
        var itemId;
        var grip;
        var defenderWeapon;
        var dodgeChance;
        var blockChance;
        var dodgeSkill;
        var blockSkill;
        var defaultMartialSkill = defender.weaponSkills['Default Martial'].level;
        var shieldMod = MML.getShieldDefenseBonus(defender);
        var defenseMod = defender.meleeDefenseMod + defender.attributeDefenseMod;
        var sitMod = defender.situationalMod;

        defender.statusEffects['Melee This Round'] = { id: generateRowID(), name: 'Melee This Round' };

        if (!_.isUndefined(defender.weaponSkills['Dodge']) && defaultMartialSkill < defender.weaponSkills['Dodge'].level) {
          dodgeChance = defender.weaponSkills['Dodge'].level + defenseMod + sitMod;
        } else {
          dodgeChance = defaultMartialSkill + defenseMod + sitMod;
        }

        if (attackerWeapon.initiative < 6) {
          dodgeChance += 15;
        }

        if (MML.isDualWielding(defender)) {
          log('Dual Wield defense');
        } else if (MML.isUnarmed(defender) || MML.isWieldingRangedWeapon(defender)) {
          blockChance = 0;
        } else {
          if (MML.getWeaponFamily(defender, 'rightHand') !== 'unarmed') {
            itemId = defender.rightHand._id;
            grip = defender.rightHand.grip;
          } else {
            itemId = defender.leftHand._id;
            grip = defender.leftHand.grip;
          }

          defenderWeapon = defender.inventory[itemId];
          blockChance = defenderWeapon.grips[grip].defense + sitMod + defenseMod + shieldMod;
          blockSkill = Math.round(MML.getWeaponSkill(defender, defenderWeapon) / 2);

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

        defender.player.charMenuMeleeDefenseRoll(defender.name, dodgeChance, blockChance);
        defender.player.displayMenu();
      }
    },

    'meleeBlockRoll': {
      value: function(blockChance) {
        this.universalRoll('meleeBlockRollResult', [blockChance]);
      }
    },

    'meleeBlockRollResult': {
      value: function() {
        displayRoll('meleeBlockRollApply');
      }
    },

    'meleeBlockRollApply': {
      value: function() {
        var result = this.player.currentRoll.result;

        if (result === 'Success') {
          if (_.has(this.statusEffects, 'Number of Defenses')) {
            this.statusEffects['Number of Defenses'].number++;
          } else {
            this.addStatusEffect('Number of Defenses', {
              name: 'Number of Defenses',
              number: 1
            });
          }
        }

        state.MML.GM.currentAction.rolls.defenseRoll = result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'meleeDodgeRoll': {
      value: function(dodgeChance) {
        this.universalRoll.meleeDodgeRollResult([dodgeChance]);
      }
    },

    'meleeDodgeRollResult': {
      value: function() {
        displayRoll('meleeDodgeRollApply');
      }
    },

    'meleeDodgeRollApply': {
      value: function() {
        var result = this.player.currentRoll.result;

        if (result === 'Success') {
          if (_.has(this.statusEffects, 'Number of Defenses')) {
            this.statusEffects['Number of Defenses'].number++;
          } else {
            this.statusEffects['Number of Defenses'] = {
              id: generateRowID(),
              number: 1
            };
          }
          if (!_.has(this.statusEffects, 'Dodged This Round')) {
            this.statusEffects['Dodged This Round'] = {
              id: generateRowID(),
            };
          }
        }

        state.MML.GM.currentAction.rolls.defenseRoll = result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'rangedDefense': {
      value: function(defender, attackerWeapon, range) {
        var defenseChance;
        var defaultMartialSkill = defender.weaponSkills['Default Martial'].level;
        var shieldMod = MML.getShieldDefenseBonus(defender);
        var defenseMod = defender.rangedDefenseMod + defender.attributeDefenseMod;
        var sitMod = defender.situationalMod;
        var rangeMod;

        defender.statusEffects['Melee This Round'] = { id: generateRowID(), name: 'Melee This Round' };

        if (!_.isUndefined(defender.skills['Dodge']) && defender.skills['Dodge'].level >= defaultMartialSkill) {
          defenseChance = defender.weaponSkills['Dodge'].level + defenseMod + sitMod + shieldMod;
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

        defender.player.charMenuRangedDefenseRoll(defender.name, defenseChance);
        defender.player.displayMenu();
      }
    },

    'rangedDefenseRoll': {
      value: function(defenseChance) {
        this.universalRoll('rangedDefenseRollResult', [input.defenseChance]);
      }
    },

    'rangedDefenseRollResult': {
      value: function() {
        this.displayRoll('rangedDefenseRollApply');
      }
    },

    'rangedDefenseRollApply': {
      value: function() {
        var result = this.player.currentRoll.result;

        if (result === 'Success') {
          if (_.has('Number of Defenses')) {
            this.statusEffects['Number of Defenses'].number++;
          } else {
            this.statusEffects['Number of Defenses'] = {
              id: generateRowID(),
              number: 1
            };
          }
          if (!_.has(this.statusEffects, 'Dodged This Round')) {
            this.statusEffects['Dodged This Round'] = {
              id: generateRowID()
            };
          }
        }

        state.MML.GM.currentAction.rolls.defenseRoll = result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'grappleDefense': {
      value: function(attackType) {
        var defenderWeapon;
        var brawlChance;
        var weaponChance;
        var brawlSkill;
        var defaultMartialSkill = this.weaponSkills['Default Martial'].level;
        var defenseMod = this.meleeDefenseMod + this.attributeDefenseMod + attackType.defenseMod;
        var sitMod = this.situationalMod;

        this.statusEffects['Melee This Round'] = { id: generateRowID(), name: 'Melee This Round' };

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
      value: function(attackChance) {
        this.universalRoll('Weapon Defense Roll', 'grappleDefenseWeaponRollResult', [attackChance]);
      }
    },

    'grappleDefenseWeaponRollResult': {
      value: function() {
        this.displayRoll('grappleDefenseWeaponRollApply');
      }
    },

    'grappleDefenseWeaponRollApply': {
      value: function() {
        var result = this.player.currentRoll.result;

        if (result === 'Success') {
          if (_.has(this.statusEffects, 'Number of Defenses')) {
            this.statusEffects['Number of Defenses'].number++;
          } else {
            this.statusEffects['Number of Defenses'] = {
              id: generateRowID(),
              number: 1
            };
          }

        }
        state.MML.GM.currentAction.rolls.weaponDefenseRoll = this.player.currentRoll.result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'grappleDefenseBrawlRoll': {
      value: function() {
        this.universalRoll('Brawl Defense Roll', 'grappleDefenseBrawlRollResult', [input.brawlChance]);
      }
    },

    'grappleDefenseBrawlRollResult': {
      value: function() {
        this.displayRoll('grappleDefenseBrawlRollApply');
      }
    },

    'grappleDefenseBrawlRollApply': {
      value: function() {
        var result = this.player.currentRoll.result;

        if (result === 'Success') {
          if (_.has(this.statusEffects, 'Number of Defenses')) {
            this.statusEffects['Number of Defenses'].number++;
          } else {
            this.statusEffects['Number of Defenses'] = {
              id: generateRowID(),
              number: 1
            };
          }
        }
        state.MML.GM.currentAction.rolls.brawlDefenseRoll = this.player.currentRoll.result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'grappleHandler': {
      value: function(defender, attackName) {
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
        MML.endAction();
      }
    },

    'applyGrapple': {
      value: function(defender) {
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
      value: function(defender) {
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
          var holder = { name: this.name, bodyPart: state.MML.GM.currentAction.calledShot };
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
      value: function(defender) {
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
              targets: _.reject(this.statusEffects['Held'].targets, function(target) { return target.name === defender.name; })
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
      value: function(defender) {
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
      value: function(defender) {
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
            if (_.reject(defender.statusEffects['Held'].targets, function(target) { return ['Chest', 'Abdomen'].indexOf(target.bodyPart) > -1; }).length === 0) {
              defender.removeStatusEffect('Held');
            } else {
              defender.statusEffects['Held'] = {
                id: defender.statusEffects['Held'].id,
                name: 'Held',
                targets: _.reject(defender.statusEffects['Held'].targets, function(target) { return ['Chest', 'Abdomen'].indexOf(target.bodyPart) > -1; })
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
      value: function(defender) {
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
      value: function(defender) {
        defender.applyHoldBreak(this);
        defender.player.charMenuResistRelease(defender.name, this, defender);
        defender.player.displayMenu();
      }
    },

    'releaseGrapple': {
      value: function(defender) {
        this.applyGrappleBreak(defender, this);
        MML.characters[this.name].action.modifiers = _.without(MML.characters[this.name].action.modifiers, 'Release Opponent');
        this.startAction();
      }
    },

    'criticalDefense': {
      value: function() {
        MML.endAction();
      }
    },

    'forgoDefense': {
      value: function() {
        state.MML.GM.currentAction.rolls[input.rollName] = 'Failure';
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'equipmentFailure': {
      value: function() {
        log('equipmentFailure');
      }
    },

    'meleeDamageRoll': {
      value: function(attackerWeapon, crit, bonusDamage) {
        bonusDamage = 0;
        state.MML.GM.currentAction.parameters.damageType = attackerWeapon.damageType;
        this.rollDamage('meleeDamageResult', crit, attackerWeapon.damage, [character.meleeDamageMod, bonusDamage]);
      }
    },

    'meleeDamageResult': {
      value: function() {
        this.displayRoll('meleeDamageRollApply');
      }
    },

    'meleeDamageRollApply': {
      value: function() {
        state.MML.GM.currentAction.rolls.damageRoll = this.player.currentRoll.result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'missileDamageRoll': {
      value: function(attackerWeapon, crit, bonusDamage) {
        bonusDamage = 0;
        state.MML.GM.currentAction.parameters.damageType = attackerWeapon.damageType;
        this.rollDamage('missileDamageResult', crit, attackerWeapon.damage, [bonusDamage]);
      }
    },

    'missileDamageResult': {
      value: function() {
        this.displayRoll('missileDamageRollApply');
      }
    },

    'missileDamageRollApply': {
      value: function() {
        state.MML.GM.currentAction.rolls.damageRoll = this.player.currentRoll.result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'castingRoll': {
      value: function(rollName, task, skill, metaMagicMod) {
        this.universalRoll(rollName, 'castingRollResult', [task, skill, this.situationalMod, this.castingMod, this.attributeCastingMod, metaMagicMod]);
      }
    },

    'castingRollResult': {
      value: function() {
        var currentRoll = this.player.currentRoll;

        if (this.player.name === state.MML.GM.name) {
          if (currentRoll.accepted === false) {
            this.player.displayGmRoll(currentRoll);
          } else {
            if (_.contains(this.action.modifiers, ['Called Shot Specific']) && currentRoll.value - currentRoll.target < 11) {
              this.action.modifiers = _.without(this.action.modifiers, 'Called Shot Specific');
              this.action.modifiers.push('Called Shot');
              currentRoll.result = 'Success';
            }
            this.castingRollApply();
          }
        } else {
          this.player.displayPlayerRoll(currentRoll);
          if (_.contains(this.action.modifiers, ['Called Shot Specific']) && currentRoll.value - currentRoll.target < 11) {
            this.action.modifiers = _.without(this.action.modifiers, 'Called Shot Specific');
            this.action.modifiers.push('Called Shot');
            currentRoll.result = 'Success';
          }
          this.castingRollApply();
        }
      }
    },

    'castingRollApply': {
      value: function() {
        state.MML.GM.currentAction.rolls.castingRoll = this.player.currentRoll.result;
        MML[state.MML.GM.currentAction.callback]();
      }
    },

    'applyStatusEffects': {
      value: function() {
        var dependents = [
      'situationalInitBonus',
      'situationalMod',
      'rangedDefenseMod',
      'meleeDefenseMod',
      'missileAttackMod',
      'meleeAttackMod',
      'castingMod',
      'perceptionCheckMod',
      'roundsExertion'
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
      value: function(index, effect) {
        effect.id = generateRowID();
        this.statusEffects[index] = effect;
        this.applyStatusEffects();
      }
    },

    'removeStatusEffect': {
      value: function(index) {
        if (!_.isUndefined(this.statusEffects[index])) {
          delete this.statusEffects[index];
          this.applyStatusEffects();
        }
      }
    },

    'updateInventory': {
      value: function() {
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
      value: function() {
        _.each(this, function(value, attribute) {
          if (typeof(value) === 'object') {
            value = JSON.stringify(value);
          }
          MML.setCurrentAttribute(this.name, attribute, value);
        }, this);
      }
    },

    'setPlayer': {
      value: function() {
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

  Object.defineProperty(this, 'name', { value: charName, writable: true, enumerable: true });
  Object.defineProperty(this, 'id', { value: id });
  Object.defineProperty(this, 'player', { get: function() { return MML.players[MML.getCurrentAttribute(this.name, 'player')]; } });
  Object.defineProperty(this, 'race', { get: function() { return MML.getCurrentAttribute(this.name, 'race'); }, enumerable: true });
  Object.defineProperty(this, 'bodyType', { get: function() { return MML.bodyTypes[this.race]; }, enumerable: true });
  Object.defineProperty(this, 'gender', { get: function() { return MML.getCurrentAttribute(this.name, 'gender'); }, enumerable: true });
  Object.defineProperty(this, 'height', { get: function() { return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, 'statureRoll')].height; }, enumerable: true });
  Object.defineProperty(this, 'weight', { get: function() { return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, 'statureRoll')].weight; }, enumerable: true });
  Object.defineProperty(this, 'handedness', { get: function() { return MML.getCurrentAttribute(this.name, 'handedness'); }, enumerable: true });
  Object.defineProperty(this, 'stature', { get: function() { return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, 'statureRoll')].stature; }, enumerable: true });
  Object.defineProperty(this, 'strength', { get: function() { return MML.racialAttributeBonuses[this.race].strength + MML.getCurrentAttributeAsFloat(this.name, 'strengthRoll'); }, enumerable: true });
  Object.defineProperty(this, 'coordination', { get: function() { return MML.racialAttributeBonuses[this.race].coordination + MML.getCurrentAttributeAsFloat(this.name, 'coordinationRoll'); }, enumerable: true });
  Object.defineProperty(this, 'health', { get: function() { return MML.racialAttributeBonuses[this.race].health + MML.getCurrentAttributeAsFloat(this.name, 'healthRoll'); }, enumerable: true });
  Object.defineProperty(this, 'beauty', { get: function() { return MML.racialAttributeBonuses[this.race].beauty + MML.getCurrentAttributeAsFloat(this.name, 'beautyRoll'); }, enumerable: true });
  Object.defineProperty(this, 'intellect', { get: function() { return MML.racialAttributeBonuses[this.race].intellect + MML.getCurrentAttributeAsFloat(this.name, 'intellectRoll'); }, enumerable: true });
  Object.defineProperty(this, 'reason', { get: function() { return MML.racialAttributeBonuses[this.race].reason + MML.getCurrentAttributeAsFloat(this.name, 'reasonRoll'); }, enumerable: true });
  Object.defineProperty(this, 'creativity', { get: function() { return MML.racialAttributeBonuses[this.race].creativity + MML.getCurrentAttributeAsFloat(this.name, 'creativityRoll'); }, enumerable: true });
  Object.defineProperty(this, 'presence', { get: function() { return MML.racialAttributeBonuses[this.race].presence + MML.getCurrentAttributeAsFloat(this.name, 'presenceRoll'); }, enumerable: true });
  this.updateCharacterSheet();
  Object.defineProperty(this, 'willpower', { get: function() { return Math.round((2 * this.presence + this.health) / 3); }, enumerable: true });
  Object.defineProperty(this, 'evocation', { get: function() { return this.intellect + this.reason + this.creativity + this.health + this.willpower + MML.racialAttributeBonuses[this.race].evocation; }, enumerable: true });
  Object.defineProperty(this, 'perception', { get: function() { return Math.round((this.intellect + this.reason + this.creativity) / 3) + MML.racialAttributeBonuses[this.race].perception; }, enumerable: true });
  Object.defineProperty(this, 'systemStrength', { get: function() { return Math.round((this.presence + 2 * this.health) / 3); }, enumerable: true });
  Object.defineProperty(this, 'fitness', { get: function() { return Math.round((this.health + this.strength) / 2) + MML.racialAttributeBonuses[this.race].fitness; }, enumerable: true });
  Object.defineProperty(this, 'fitnessMod', { get: function() { return MML.fitnessModLookup[this.fitness]; }, enumerable: true });
  Object.defineProperty(this, 'load', { get: function() { return Math.round(this.stature * this.fitnessMod) + MML.racialAttributeBonuses[this.race].load; }, enumerable: true });
  Object.defineProperty(this, 'overhead', { get: function() { return this.load * 2; }, enumerable: true });
  Object.defineProperty(this, 'deadLift', { get: function() { return this.load * 4; }, enumerable: true });
  this.updateCharacterSheet();
  Object.defineProperty(this, 'hpMax', { get: function() { return MML.buildHpAttribute(this); }, enumerable: true });
  Object.defineProperty(this, 'hp', { value: _.isUndefined(getAttrByName(this.id, 'hp', 'current')) ? MML.buildHpAttribute(this) : MML.getCurrentAttributeJSON(this.name, 'hp'), writable: true, enumerable: true });
  Object.defineProperty(this, 'epMax', { get: function() { return this.evocation; }, enumerable: true });
  Object.defineProperty(this, 'ep', { value: _.isUndefined(getAttrByName(this.id, 'ep', 'current')) ? this.evocation : MML.getCurrentAttributeAsFloat(this.name, 'ep'), writable: true, enumerable: true });
  Object.defineProperty(this, 'fatigueMax', { get: function() { return this.fitness; }, enumerable: true });
  Object.defineProperty(this, 'fatigue', { value: isNaN(parseFloat(MML.getCurrentAttribute(this.name, 'fatigue'))) ? this.fitness : MML.getCurrentAttributeAsFloat(this.name, 'fatigue'), writable: true, enumerable: true });
  Object.defineProperty(this, 'hpRecovery', { get: function() { return MML.recoveryMods[this.health].hp; }, enumerable: true });
  Object.defineProperty(this, 'epRecovery', { get: function() { return MML.recoveryMods[this.health].ep; }, enumerable: true });
  Object.defineProperty(this, 'inventory', { value: _.isUndefined(getAttrByName(this.id, 'inventory', 'current')) ? { emptyHand: { type: 'empty', weight: 0 } } : MML.getCurrentAttributeJSON(this.name, 'inventory'), writable: true, enumerable: true });
  Object.defineProperty(this, 'totalWeightCarried', { get: function() { return _.reduce(_.pluck(this.inventory, 'weight'), function(total, weight) { return total + weight; }, 0); }, enumerable: true });
  Object.defineProperty(this, 'knockdownMax', { get: function() { return Math.round(this.stature + (this.totalWeightCarried / 10)); }, enumerable: true });
  Object.defineProperty(this, 'knockdown', { value: isNaN(parseFloat(MML.getCurrentAttribute(this.name, 'knockdown'))) ? this.knockdownMax : MML.getCurrentAttributeAsFloat(this.name, 'knockdown'), writable: true, enumerable: true });
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
          Surface: [{ value: 0, coverage: 100 }],
          Cut: [{ value: 0, coverage: 100 }],
          Chop: [{ value: 0, coverage: 100 }],
          Pierce: [{ value: 0, coverage: 100 }],
          Thrust: [{ value: 0, coverage: 100 }],
          Impact: [{ value: 0, coverage: 100 }],
          Flanged: [{ value: 0, coverage: 100 }]
        };
      });
      //Creates raw matrix of individual pieces of armor (no layering or partial coverage)

      _.each(armor, function(piece) {
        var material = MML.APVList[piece.material];

        _.each(piece.protection, function(protection) {
          var position = MML.hitPositions[bodyType][protection.position].name;
          var coverage = protection.coverage;
          apvMatrix[position].Surface.push({ value: material.surface, coverage: coverage });
          apvMatrix[position].Cut.push({ value: material.cut, coverage: coverage });
          apvMatrix[position].Chop.push({ value: material.chop, coverage: coverage });
          apvMatrix[position].Pierce.push({ value: material.pierce, coverage: coverage });
          apvMatrix[position].Thrust.push({ value: material.thrust, coverage: coverage });
          apvMatrix[position].Impact.push({ value: material.impact, coverage: coverage });
          apvMatrix[position].Flanged.push({ value: material.flanged, coverage: coverage });
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
            apvFinalArray.push({ value: apvValue, coverage: apvCoverage });
          });
          apvMatrix[positionName][type] = apvFinalArray;
        });
      });
      return apvMatrix;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'leftHand', { value: _.isEmpty(MML.getCurrentAttributeJSON(this.name, 'leftHand')) ? JSON.stringify({_id: 'emptyHand', grip: 'unarmed'}) : MML.getCurrentAttributeJSON(this.name, 'leftHand'), writable: true, enumerable: true });
  Object.defineProperty(this, 'rightHand', { value: _.isEmpty(MML.getCurrentAttributeJSON(this.name, 'rightHand')) ? JSON.stringify({_id: 'emptyHand', grip: 'unarmed'}) : MML.getCurrentAttributeJSON(this.name, 'rightHand'), writable: true, enumerable: true });
  this.updateCharacterSheet();
  Object.defineProperty(this, 'hitTable', { get: function() { return MML.getHitTable(this); }, enumerable: true });
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
  Object.defineProperty(this, 'movementAvailable', { value: MML.getCurrentAttributeAsFloat(this.name, 'movementAvailable'), writable: true, enumerable: true });
  Object.defineProperty(this, 'movementPosition', { value: MML.getCurrentAttribute(this.name, 'movementPosition'), writable: true, enumerable: true });
  Object.defineProperty(this, 'pathID', { get: function() { return MML.getCurrentAttribute(this.name, 'pathID'); } });
  Object.defineProperty(this, 'situationalMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'situationalMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'attributeDefenseMod', { get: function() { return MML.attributeMods.strength[this.strength] + MML.attributeMods.coordination[this.coordination]; }, enumerable: true });
  Object.defineProperty(this, 'meleeDefenseMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'meleeDefenseMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'rangedDefenseMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'rangedDefenseMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'meleeAttackMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'meleeAttackMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'attributeMeleeAttackMod', { get: function() { return MML.attributeMods.strength[this.strength] + MML.attributeMods.coordination[this.coordination]; }, enumerable: true });
  Object.defineProperty(this, 'meleeDamageMod', { get: function() { return _.find(MML.meleeDamageMods, function(mod) { return this.load >= mod.low && this.load <= mod.high; }, this).value; }, enumerable: true });
  Object.defineProperty(this, 'missileAttackMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'missileAttackMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'attributeMissileAttackMod', { get: function() { return MML.attributeMods.perception[this.perception] + MML.attributeMods.coordination[this.coordination] + MML.attributeMods.strength[this.strength]; }, enumerable: true });
  Object.defineProperty(this, 'castingMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'castingMod'), writable: true, enumerable: true });
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
  Object.defineProperty(this, 'spellLearningMod', { get: function() { return MML.attributeMods.intellect[this.intellect]; }, enumerable: true });
  Object.defineProperty(this, 'statureCheckMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'statureCheckMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'strengthCheckMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'strengthCheckMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'coordinationCheckMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'coordinationCheckMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'healthCheckMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'healthCheckMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'beautyCheckMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'beautyCheckMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'intellectCheckMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'intellectCheckMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'reasonCheckMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'reasonCheckMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'creativityCheckMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'creativityCheckMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'presenceCheckMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'presenceCheckMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'willpowerCheckMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'willpowerCheckMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'evocationCheckMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'evocationCheckMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'perceptionCheckMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'perceptionCheckMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'systemStrengthCheckMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'systemStrengthCheckMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'fitnessCheckMod', { value: MML.getCurrentAttributeAsFloat(this.name, 'fitnessCheckMod'), writable: true, enumerable: true });
  Object.defineProperty(this, 'statusEffects', { value: MML.getCurrentAttributeJSON(this.name, 'statusEffects'), writable: true, enumerable: true });
  Object.defineProperty(this, 'initiative', {
    get: function() {
      var initiative = this.initiativeRollValue +
        this.situationalInitBonus +
        this.movementRatioInitBonus +
        this.attributeInitBonus +
        this.senseInitBonus +
        this.fomInitBonus +
        this.firstActionInitBonus +
        this.spentInitiative;
      if (initiative < 0 || state.MML.GM.roundStarted === false || this.situationalInitBonus === 'No Combat' || this.movementRatioInitBonus === 'No Combat') {
        return 0;
      } else {
        return initiative;
      }
    },
    enumerable: true
  });
  Object.defineProperty(this, 'initiativeRollValue', { value: MML.getCurrentAttributeAsFloat(this.name, 'initiativeRollValue'), writable: true, enumerable: true });
  Object.defineProperty(this, 'situationalInitBonus', { value: MML.getCurrentAttributeAsFloat(this.name, 'situationalInitBonus'), writable: true, enumerable: true });
  Object.defineProperty(this, 'movementRatioInitBonus', {
    get: function() {
      if (this.movementRatio < 0.6) {
        return 'No Combat';
      } else if (this.movementRatio === 0.6) {
        return -4;
      } else if (this.movementRatio < 0.7 && this.movementRatio <= 0.8) {
        return -3;
      } else if (this.movementRatio > 0.8 && this.movementRatio <= 1.0) {
        return -2;
      } else if (this.movementRatio > 1.0 && this.movementRatio <= 1.2) {
        return -1;
      } else if (this.movementRatio > 1.2 && this.movementRatio <= 1.4) {
        return 0;
      } else if (this.movementRatio > 1.4 && this.movementRatio <= 1.7) {
        return 1;
      } else if (this.movementRatio > 1.7 && this.movementRatio <= 2.0) {
        return 2;
      } else if (this.movementRatio > 2.0 && this.movementRatio <= 2.5) {
        return 3;
      } else if (this.movementRatio > 2.5 && this.movementRatio <= 3.2) {
        return 4;
      } else if (this.movementRatio > 3.2) {
        return 5;
      }
    },
    enumerable: true
  });
  Object.defineProperty(this, 'attributeInitBonus', {
    get: function() {
      var attributeArray = [this.strength, this.coordination, this.reason, this.perception];
      var rankingAttribute = attributeArray.sort(function(a, b) {
        return a - b;
      })[0];

      if (rankingAttribute <= 9) {
        return -1;
      } else if (rankingAttribute === 10 || rankingAttribute === 11) {
        return 0;
      } else if (rankingAttribute === 12 || rankingAttribute === 13) {
        return 1;
      } else if (rankingAttribute === 14 || rankingAttribute === 15) {
        return 2;
      } else if (rankingAttribute === 16 || rankingAttribute === 17) {
        return 3;
      } else if (rankingAttribute === 18 || rankingAttribute === 19) {
        return 4;
      } else if (rankingAttribute >= 20) {
        return 5;
      }
    },
    enumerable: true
  });
  Object.defineProperty(this, 'senseInitBonus', {
    get: function() {
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
        return 4;
      } else {
        //Head fully encased in metal
        if (senseArray.indexOf('Great Helm') !== -1 || (senseArray.indexOf('Sallet Helm') !== -1 && senseArray.indexOf('Throat Guard') !== -1)) {
          return -2;
        }
        //wearing a helm
        else if (_.intersection(senseArray, ['Barbute Helm', 'Sallet Helm', 'Bascinet Helm', 'Duerne Helm', 'Cap', 'Pot Helm', 'Conical Helm', 'War Hat']).length > 0) {
          //Has faceplate
          if (senseArray.indexOf('Face Plate') !== -1) {
            //Enclosed Sides
            if (_.intersection(senseArray, ['Barbute Helm', 'Bascinet Helm', 'Duerne Helm']).length > 0) {
              return -2;
            } else {
              return -1;
            }
          }
          //These types of helms or half face plate
          else if (_.intersection(senseArray, ['Barbute Helm', 'Sallet Helm', 'Bascinet Helm', 'Duerne Helm', 'Half-Face Plate']).length > 0) {
            return 0;
          }
          //has camail or cheeks
          else if (_.intersection(senseArray, ['Camail', 'Camail-Conical', 'Cheeks']).length > 0) {
            return 1;
          }
          //Wearing a hood
          else if (_.intersection(senseArray, ['Dwarven War Hood', 'Hood']).length > 0) {
            _.each(armorList, function(piece) {
              if (piece.name === 'Dwarven War Hood' || piece.name === 'Hood') {
                if (piece.family === 'Cloth') {
                  return 2;
                } else {
                  return 1;
                }
              }
            });
          }
          //has nose guard
          else if (senseArray.indexOf('Nose Guard') !== -1) {
            return 2;
          }
          // just a cap
          else {
            return 3;
          }
        }
        //Wearing a hood
        else if (_.intersection(senseArray, ['Dwarven War Hood', 'Hood']).length > 0) {
          _.each(armorList, function(piece) {
            if (piece.name === 'Dwarven War Hood' || piece.name === 'Hood') {
              if (piece.family === 'Cloth') {
                return 2;
              } else {
                return 1;
              }
            }
          });
        }
      }
    },
    enumerable: true
  });
  Object.defineProperty(this, 'fomInitBonus', { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'fomInitBonus'); }, enumerable: true });
  Object.defineProperty(this, 'firstActionInitBonus', { value: MML.getCurrentAttributeAsFloat(this.name, 'firstActionInitBonus'), enumerable: true });
  Object.defineProperty(this, 'spentInitiative', { value: MML.getCurrentAttributeAsFloat(this.name, 'spentInitiative'), writable: true, enumerable: true });
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
      return MML.attackTempoTable[tempo];
    },
    enumerable: true
  });
  Object.defineProperty(this, 'ready', { value: MML.getCurrentAttributeAsBool(this.name, 'ready'), writable: true, enumerable: true });
  Object.defineProperty(this, 'action', { value: MML.getCurrentAttributeJSON(this.name, 'action'), writable: true, enumerable: true });
  Object.defineProperty(this, 'previousAction', { value: MML.getCurrentAttributeJSON(this.name, 'previousAction'), writable: true, enumerable: true });
  Object.defineProperty(this, 'roundsRest', { value: MML.getCurrentAttributeAsFloat(this.name, 'roundsRest'), writable: true, enumerable: true });
  Object.defineProperty(this, 'roundsExertion', { value: MML.getCurrentAttributeAsFloat(this.name, 'roundsExertion'), enumerable: true });
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

      this.skills = characterSkills;
      return characterSkills;
    },
    enumerable: true
  });
  Object.defineProperty(this, 'weaponSkills', { get: function() { return MML.getSkillAttributes(this.name, 'weaponskills'); }, enumerable: true });
  Object.defineProperty(this, 'fov', {
    get: function() {
      switch (this.senseInitBonus) {
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
    }
  });
  Object.defineProperty(this, 'spells', { get: function() { return MML.getCurrentAttributeAsArray(this.name, 'spells'); } });
  this.updateCharacterSheet();
};
