// Character Creation
MML.Character = function(charName) {
  // Basic Info
  Object.defineProperties(this, {
    'name': { value: charName, enumerable: true },
    'player': { value: MML.players[MML.getCurrentAttribute(this.name, 'player')] },
    'race': { get: function() { return MML.getCurrentAttribute(this.name, 'race'); } },
    'bodyType': { get: function() { return MML.bodyTypes[this.race]; } },
    'gender': { get: function() { return MML.getCurrentAttribute(this.name, 'gender'); } },
    'height': { get: function() { return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, 'statureRoll')].height; } },
    'weight': { get: function() { return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, 'statureRoll')].weight; } },
    'handedness': { get: function() { return MML.getCurrentAttribute(this.name, 'handedness'); } },
    'stature': { get: function() { return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, 'statureRoll')].stature; } },
    'strength': { get: function() { return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, 'strengthRoll')].strength; } },
    'coordination': { get: function() { return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, 'coordinationRoll')].coordination; } },
    'health': { get: function() { return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, 'healthRoll')].health; } },
    'beauty': { get: function() { return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, 'beautyRoll')].beauty; } },
    'intellect': { get: function() { return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, 'intellectRoll')].intellect; } },
    'reason': { get: function() { return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, 'reasonRoll')].reason; } },
    'creativity': { get: function() { return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, 'creativityRoll')].creativity; } },
    'presence': { get: function() { return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, 'presenceRoll')].presence; } },
    'willpower': { get: function() { return Math.round((2 * this.presence + this.health) / 3); } },
    'evocation': { get: function() { return this.intellect + this.reason + this.creativity + this.health + this.willpower + MML.racialAttributeBonuses[this.race].evocation; } },
    'perception': { get: function() { return Math.round((this.intellect + this.reason + this.creativity) / 3) + MML.racialAttributeBonuses[this.race].perception; } },
    'systemStrength': { get: function() { return Math.round((this.presence + 2 * this.health) / 3); } },
    'fitness': { get: function() { return Math.round((this.health + this.strength) / 2) + MML.racialAttributeBonuses[this.race].fitness; } },
    'fitnessMod': { get: function() { return MML.fitnessModLookup[this.fitness]; } },
    'load': { get: function() { return Math.round(this.stature * this.fitnessMod) + MML.racialAttributeBonuses[this.race].load; } },
    'overhead': { get: function() { return this.load * 2; } },
    'deadLift': { get: function() { return this.load * 4; } },
    'hpMax': { get: function() { return MML.getCurrentAttributeJSON(this.name, 'hpMax'); } },
    'hp': { get: function() { return MML.getCurrentAttributeJSON(this.name, 'hp'); } },
    'epMax': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'epMax'); } },
    'ep': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'ep'); } },
    'fatigueMax': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'fatigueMax'); } },
    'fatigue': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'fatigue'); } },
    'hpRecovery': { get: function() { return MML.recoveryMods[this.health].hp; } },
    'epRecovery': { get: function() { return MML.recoveryMods[this.health].ep; } },
    'inventory': { get: function() { return MML.getCurrentAttributeJSON(this.name, 'inventory'); } },
    'totalWeightCarried': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'totalWeightCarried'); } },
    'knockdownMax': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'knockdownMax'); } },
    'knockdown': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'knockdown'); } },
    'apv': { get: function() { return MML.getCurrentAttributeJSON(this.name, 'apv'); } },
    'leftHand': { get: function() { return MML.getCurrentAttributeJSON(this.name, 'leftHand'); } },
    'rightHand': { get: function() { return MML.getCurrentAttributeJSON(this.name, 'rightHand'); } },
    'hitTable': { get: function() { return MML.getCurrentAttribute(this.name, 'hitTable'); } },
    'movementRatio': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'movementRatio'); } },
    'movementAvailable': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'movementAvailable'); } },
    'movementPosition': { get: function() { return MML.getCurrentAttribute(this.name, 'movementPosition'); } },
    'pathID': { get: function() { return MML.getCurrentAttribute(this.name, 'pathID'); } },
    'situationalMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'situationalMod'); } },
    'attributeDefenseMod': { get: function() { return MML.attributeMods.strength[this.strength] + MML.attributeMods.coordination[this.coordination]; } },
    'meleeDefenseMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'meleeDefenseMod'); } },
    'rangedDefenseMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'rangedDefenseMod'); } },
    'meleeAttackMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'meleeAttackMod'); } },
    'attributeMeleeAttackMod': { get: function() { return MML.attributeMods.strength[this.strength] + MML.attributeMods.coordination[this.coordination]; } },
    'meleeDamageMod': {
      get: function() {
        var meleeDamageMod;
        var load = this.load;

        var index;
        for (index in MML.meleeDamageMods) {
          var data = MML.meleeDamageMods[index];

          if (load >= data.low && load <= data.high) {
            meleeDamageMod = data.value;
            break;
          }
        }
        return meleeDamageMod;
      }
    },
    'missileAttackMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'missileAttackMod'); } },
    'attributeMissileAttackMod': { get: function() { return MML.attributeMods.perception[this.perception] + MML.attributeMods.coordination[this.coordination] + MML.attributeMods.strength[this.strength]; } },
    'castingMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'castingMod'); } },
    'attributeCastingMod': {
      get: function() {
        var attributeCastingMod = MML.attributeMods.reason[this.reason];

        if (this.senseInitBonus > 2) {
          attributeCastingMod += 0;
        } else if (this.senseInitBonus > 0) {
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
      }
    },
    'spellLearningMod': { get: function() { return MML.attributeMods.intellect[this.intellect]; } },
    'statureCheckMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'statureCheckMod'); } },
    'strengthCheckMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'strengthCheckMod'); } },
    'coordinationCheckMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'coordinationCheckMod'); } },
    'healthCheckMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'healthCheckMod'); } },
    'beautyCheckMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'beautyCheckMod'); } },
    'intellectCheckMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'intellectCheckMod'); } },
    'reasonCheckMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'reasonCheckMod'); } },
    'creativityCheckMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'creativityCheckMod'); } },
    'presenceCheckMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'presenceCheckMod'); } },
    'willpowerCheckMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'willpowerCheckMod'); } },
    'evocationCheckMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'evocationCheckMod'); } },
    'perceptionCheckMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'perceptionCheckMod'); } },
    'systemStrengthCheckMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'systemStrengthCheckMod'); } },
    'fitnessCheckMod': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'fitnessCheckMod'); } },
    'statusEffects': { get: function() { return MML.getCurrentAttributeJSON(this.name, 'statusEffects'); } },
    'initiative': {
      get: function() {
        var initiative = this.initiativeRoll +
          this.situationalInitBonus +
          this.movementRatioInitBonus +
          this.attributeInitBonus +
          this.senseInitBonus +
          this.fomInitBonus +
          this.firstActionInitBonus +
          this.spentInitiative;
        if (initiative < 0 ||
          state.MML.GM.roundStarted === false ||
          this.situationalInitBonus === 'No Combat' ||
          this.movementRatioInitBonus === 'No Combat') {
          return 0;
        } else {
          return initiative;
        }
      }
    },
    'initiativeRoll': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'initiativeRoll'); } },
    'situationalInitBonus': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'situationalInitBonus'); } },
    'movementRatioInitBonus': {
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
      }
    },
    'attributeInitBonus': {
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
      }
    },
    'senseInitBonus': {
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
      }
    },
    'fomInitBonus': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'fomInitBonus'); } },
    'firstActionInitBonus': {
      get: function() {
        if (state.MML.GM.roundStarted === false) {
          this.firstActionInitBonus = this.action.initBonus;
        }
        return this.firstActionInitBonus;
      }
    },
    'spentInitiative': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'spentInitiative'); } },
    'actionTempo': {
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
      }
    },
    'ready': { get: function() { return MML.getCurrentAttribute(this.name, 'ready'); } },
    'action': { get: function() { return MML.getCurrentAttributeJSON(this.name, 'action'); } },
    'defensesThisRound': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'defensesThisRound'); } },
    'dodgedThisRound': { get: function() { return MML.getCurrentAttributeAsBool(this.name, 'dodgedThisRound'); } },
    'meleeThisRound': { get: function() { return MML.getCurrentAttributeAsBool(this.name, 'meleeThisRound'); } },
    'fatigueLevel': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'fatigueLevel'); } },
    'roundsRest': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'roundsRest'); } },
    'roundsExertion': { get: function() { return MML.getCurrentAttributeAsFloat(this.name, 'roundsExertion'); } },
    'damagedThisRound': { get: function() { return MML.getCurrentAttributeAsBool(this.name, 'damagedThisRound'); } },
    'skills': {
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
      }
    },
    'weaponSkills': {
      get: function() { return MML.getSkillAttributes(this.name, 'weaponskills'); }
    },
    'fov': {
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
    },
    'spells': { get: function() { return MML.getCurrentAttributeAsArray(this.name, 'spells'); } },
  });
};

MML.update = function(attribute) {
  var attributeArray = [attribute];
  var dependents = MML.computeAttribute[attribute].dependents;
  attributeArray.push.apply(attributeArray, dependents);

  // for(var i = 0; i < attributeArray.length; i++){ //length of array is dynamic, for-in doesn't work here
  //     var localAttribute = MML.computeAttribute[attributeArray[i]];

  //     if(_.isUndefined(localAttribute)){
  //         log(attributeArray[i]);
  //     }
  //     else{
  //         attributeArray = _.difference(attributeArray, localAttribute.dependents);
  //         attributeArray.push.apply(attributeArray, localAttribute.dependents);
  //     }
  // }

  _.each(attributeArray, function(attribute) {
    var value = MML.computeAttribute[attribute].compute.apply(this, []); // Run compute function from character scope
    // log(attribute + ' ' + value);
    this[attribute] = value;
    if (typeof(value) === 'object') {
      value = JSON.stringify(value);
    }
    MML.setCurrentAttribute(this.name, attribute, value);
  }, this);

  _.each(dependents, function(attribute) {
    this.update(attribute);
  }, this);
};

MML.setApiCharAttribute = function(input) {
  this[input.attribute] = input.value;
  MML.processCommand({
    type: 'character',
    who: this.name,
    callback: 'update',
    input: input
  });
};

MML.setApiCharAttributeJSON = function(input) {
  this[input.attribute][input.index] = input.value;
  MML.processCommand({
    type: 'character',
    who: this.name,
    callback: 'update',
    input: input
  });
};

MML.removeStatusEffect = function(input) {
  if (!_.isUndefined(this.statusEffects[input.index])) {
    delete this.statusEffects[input.index];
    MML.processCommand({
      type: 'character',
      who: this.name,
      callback: 'update',
      input: {
        attribute: 'statusEffects'
      }
    });
  }
};

MML.computeAttribute.player = {
  dependents: [],
  compute: function() {
    var newPlayer = MML.getPlayerFromName(this.player);
    MML.getCharFromName(this.name).set('controlledby', newPlayer.id);
    _.each(MML.players, function(player) {
      if (player.name === this.player) {
        player.characters.push(this.name);
      } else {
        player.characters = _.without(player.characters, this.name);
      }
    }, this);
    return this.player;
  }
};

// HP stuff
MML.computeAttribute.hpMax = {
  dependents: ['hp'],
  compute: function() {
    var hpMax = MML.buildHpAttribute(this);
    this.hp = MML.buildHpAttribute(this);
    return hpMax;
  }
};
MML.computeAttribute.hp = {
  dependents: ['statusEffects'],
  compute: function() {
    return this.hp;
  }
};
MML.computeAttribute.epMax = {
  dependents: ['ep'],
  compute: function() {
    var epMax = this.evocation;
    this.ep = epMax;
    return epMax;
  }
};
MML.computeAttribute.ep = {
  dependents: ['statusEffects'],
  compute: function() {
    return this.ep;
  }
};
MML.computeAttribute.fatigueMax = {
  dependents: ['fatigue'],
  compute: function() {
    var fatigueMax = this.fitness;
    this.fatigue = fatigueMax;
    return fatigueMax;
  }
};
MML.computeAttribute.fatigue = {
  dependents: ['statusEffects'],
  compute: function() {
    return this.fatigue;
  }
};

// Inventory stuff
MML.computeAttribute.inventory = {
  dependents: [
    'totalWeightCarried',
    'apv',
    'leftHand',
    'rightHand',
    'senseInitBonus'
  ],
  compute: function() {
    var items = _.omit(this.inventory, 'emptyHand');

    _.each(
      items,
      function(item, _id) {
        MML.setCurrentAttribute(this.name, 'repeating_items_' + _id + '_itemName', item.name);
        MML.setCurrentAttribute(this.name, 'repeating_items_' + _id + '_itemId', _id);
      },
      this
    );
    items.emptyHand = {
      type: 'empty',
      weight: 0
    };
    return items;
  }
};
MML.computeAttribute.totalWeightCarried = {
  dependents: [
    'knockdownMax',
    'movementRatio'
  ],
  compute: function() {
    var totalWeightCarried = 0;

    _.each(this.inventory, function(item) {
      totalWeightCarried += item.weight;
    });
    return totalWeightCarried;
  }
};
MML.computeAttribute.knockdownMax = {
  dependents: ['knockdown'],
  compute: function() {
    var knockdownMax = Math.round(this.stature + (this.totalWeightCarried / 10));
    this.knockdown = knockdownMax;
    return knockdownMax;
  }
};
MML.computeAttribute.knockdown = {
  dependents: [],
  compute: function() {
    if (state.MML.GM.roundStarted === false) {
      return this.knockdownMax;
    } else {
      return this.knockdown;
    }
  }
};
MML.computeAttribute.apv = {
  dependents: [],
  compute: function() {
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
  }
};
MML.computeAttribute.leftHand = {
  dependents: ['hitTable'],
  compute: function() {
    return this.leftHand;
  }
};
MML.computeAttribute.rightHand = {
  dependents: ['hitTable'],
  compute: function() {
    return this.rightHand;
  }
};
MML.computeAttribute.hitTable = {
  dependents: [],
  compute: function() {
    return MML.getHitTable(this);
  }
};

// Movement
MML.computeAttribute.movementRatio = {
  dependents: ['movementRatioInitBonus'],
  compute: function() {
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
  }
};
MML.computeAttribute.movementAvailable = {
  dependents: [],
  compute: function() {
    return this.movementAvailable;
  }
};
MML.computeAttribute.movementPosition = {
  dependents: [],
  compute: function() {
    return this.movementPosition;
  }
};
MML.computeAttribute.pathID = {
  dependents: [],
  compute: function() {
    return this.pathID;
  }
};

// Roll Modifiers
MML.computeAttribute.situationalMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.meleeDefenseMod = {
  dependents: [],
  compute: function() {
    return this.meleeDefenseMod;
  }
};
MML.computeAttribute.rangedDefenseMod = {
  dependents: [],
  compute: function() {
    return this.rangedDefenseMod;
  }
};
MML.computeAttribute.meleeAttackMod = {
  dependents: [],
  compute: function() {
    return this.meleeAttackMod;
  }
};
MML.computeAttribute.missileAttackMod = {
  dependents: [],
  compute: function() {
    return this.missileAttackMod;
  }
};
MML.computeAttribute.attributeMeleeAttackMod = {
  dependents: [],
  compute: function() {
    return MML.attributeMods.strength[this.strength] + MML.attributeMods.coordination[this.coordination];
  }
};
MML.computeAttribute.meleeDamageMod = {
  dependents: [],
  compute: function() {
    var meleeDamageMod;
    var load = this.load;

    var index;
    for (index in MML.meleeDamageMods) {
      var data = MML.meleeDamageMods[index];

      if (load >= data.low && load <= data.high) {
        meleeDamageMod = data.value;
        break;
      }
    }
    return meleeDamageMod;
  }
};
MML.computeAttribute.castingMod = {
  dependents: [],
  compute: function() {
    return this.castingMod;
  }
};

MML.computeAttribute.spellLearningMod = {
  dependents: [],
  compute: function() {
    return MML.attributeMods.intellect[this.intellect];
  }
};
MML.computeAttribute.statureCheckMod = {
  dependents: [],
  compute: function() {
    return this.statureCheckMod;
  }
};
MML.computeAttribute.strengthCheckMod = {
  dependents: [],
  compute: function() {
    return this.strengthCheckMod;
  }
};
MML.computeAttribute.coordinationCheckMod = {
  dependents: [],
  compute: function() {
    return this.coordinationCheckMod;
  }
};
MML.computeAttribute.healthCheckMod = {
  dependents: [],
  compute: function() {
    return this.healthCheckMod;
  }
};
MML.computeAttribute.beautyCheckMod = {
  dependents: [],
  compute: function() {
    return this.beautyCheckMod;
  }
};
MML.computeAttribute.intellectCheckMod = {
  dependents: [],
  compute: function() {
    return this.intellectCheckMod;
  }
};
MML.computeAttribute.reasonCheckMod = {
  dependents: [],
  compute: function() {
    return this.reasonCheckMod;
  }
};
MML.computeAttribute.creativityCheckMod = {
  dependents: [],
  compute: function() {
    return this.creativityCheckMod;
  }
};
MML.computeAttribute.presenceCheckMod = {
  dependents: [],
  compute: function() {
    return this.presenceCheckMod;
  }
};
MML.computeAttribute.willpowerCheckMod = {
  dependents: [],
  compute: function() {
    return this.willpowerCheckMod;
  }
};
MML.computeAttribute.evocationCheckMod = {
  dependents: [],
  compute: function() {
    return this.evocationCheckMod;
  }
};
MML.computeAttribute.perceptionCheckMod = {
  dependents: [],
  compute: function() {
    return this.perceptionCheckMod;
  }
};
MML.computeAttribute.systemStrengthCheckMod = {
  dependents: [],
  compute: function() {
    return this.systemStrengthCheckMod;
  }
};
MML.computeAttribute.fitnessCheckMod = {
  dependents: [],
  compute: function() {
    return this.fitnessCheckMod;
  }
};
MML.computeAttribute.statusEffects = {
  dependents: [
    'situationalInitBonus',
    'situationalMod',
    'rangedDefenseMod',
    'meleeDefenseMod',
    'missileAttackMod',
    'meleeAttackMod',
    'castingMod',
    'perceptionCheckMod',
    'roundsExertion'
  ],
  compute: function() {
    _.each(MML.computeAttribute.statusEffects.dependents, function(dependent) {
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

    return this.statusEffects;
  }
};

// Initiative
MML.computeAttribute.initiativeRoll = {
  dependents: ['initiative'],
  compute: function() {
    return this.initiativeRoll;
  }
};
MML.computeAttribute.situationalInitBonus = {
  dependents: ['initiative'],
  compute: function() {
    return this.situationalInitBonus;
  }
};
MML.computeAttribute.spentInitiative = {
  dependents: ['initiative'],
  compute: function() {
    return this.spentInitiative;
  }
};

// Combat
MML.computeAttribute.ready = {
  dependents: [],
  compute: function() {
    if (state.MML.GM.inCombat === true && this.ready === false) {
      MML.getTokenFromChar(this.name).set('tint_color', '#FF0000');
    } else {
      MML.getTokenFromChar(this.name).set('tint_color', 'transparent');
    }
    return this.ready;
  }
};
MML.computeAttribute.action = {
  dependents: [
    'firstActionInitBonus',
    'actionTempo',
    'statusEffects'
  ],
  compute: function() {
    var initBonus = 10;

    if (this.action.name === 'Attack') {
      var leftHand = MML.getWeaponFamily(this, 'leftHand');
      var rightHand = MML.getWeaponFamily(this, 'rightHand');

      if (['Punch', 'Kick', 'Head Butt', 'Bite', 'Grapple', 'Takedown', 'Place a Hold', 'Break a Hold', 'Break Grapple'].indexOf(this.action.weaponType) > -1 ||
        (leftHand === 'unarmed' && rightHand === 'unarmed')
      ) {
        if (!_.isUndefined(this.weaponSkills['Brawling']) && this.weaponSkills['Brawling'].level > this.weaponSkills['Default Martial'].level) {
          this.action.skill = this.weaponSkills['Brawling'].level;
        } else {
          this.action.skill = this.weaponSkills['Default Martial'].level;
        }
      } else if (leftHand !== 'unarmed' && rightHand !== 'unarmed') {
        var weaponInits = [this.inventory[this.leftHand._id].grips[this.leftHand.grip].initiative,
          this.inventory[this.rightHand._id].grips[this.rightHand.grip].initiative
        ];
        initBonus = _.min(weaponInits);
        // this.action.skill = this.weaponSkills.[this.inventory[this.leftHand._id].name].level or this.weaponSkills['Default Martial Skill'].level;
        //Dual Wielding
      } else if (rightHand !== 'unarmed' && leftHand === 'unarmed') {
        initBonus = this.inventory[this.rightHand._id].grips[this.rightHand.grip].initiative;
        this.action.skill = MML.getWeaponSkill(this, this.inventory[this.rightHand._id]);
      } else {
        initBonus = this.inventory[this.leftHand._id].grips[this.leftHand.grip].initiative;
        this.action.skill = MML.getWeaponSkill(this, this.inventory[this.leftHand._id]);
      }
    } else if (this.action.name === 'Cast') {
      var skillInfo = MML.getMagicSkill(this, this.action.spell);
      this.action.skill = skillInfo.level;
      this.action.skillName = skillInfo.name;
    }
    this.action.initBonus = initBonus;

    _.each(this.action.modifiers, function(modifier) {
      this.statusEffects[modifier] = {
        id: generateRowID(),
        name: modifier
      };
    }, this);

    return this.action;
  }
};
MML.computeAttribute.roundsRest = {
  dependents: [],
  compute: function() {
    return this.roundsRest;
  }
};
MML.computeAttribute.roundsExertion = {
  dependents: [],
  compute: function() {
    return this.roundsExertion;
  }
};

// Skills

MML.computeAttribute.spells = {
  dependents: [],
  compute: function() {
    return this.spells;
  }
};
