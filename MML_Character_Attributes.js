// Character Creation
MML.characterConstructor = function characterConstructor(charName) {
  // Basic Info
  this.name = charName;
  this.player = MML.getCurrentAttribute(this.name, "player");
  this.race = MML.getCurrentAttribute(this.name, "race");
  this.bodyType = MML.getCurrentAttribute(this.name, "bodyType");
  this.gender = MML.getCurrentAttribute(this.name, "gender");
  this.height = MML.getCurrentAttribute(this.name, "height");
  this.weight = MML.getCurrentAttributeAsFloat(this.name, "weight");
  this.handedness = MML.getCurrentAttribute(this.name, "handedness");
  this.stature = MML.getCurrentAttributeAsFloat(this.name, "stature");
  this.strength = MML.getCurrentAttributeAsFloat(this.name, "strength");
  this.coordination = MML.getCurrentAttributeAsFloat(this.name, "coordination");
  this.health = MML.getCurrentAttributeAsFloat(this.name, "health");
  this.beauty = MML.getCurrentAttributeAsFloat(this.name, "beauty");
  this.intellect = MML.getCurrentAttributeAsFloat(this.name, "intellect");
  this.reason = MML.getCurrentAttributeAsFloat(this.name, "reason");
  this.creativity = MML.getCurrentAttributeAsFloat(this.name, "creativity");
  this.presence = MML.getCurrentAttributeAsFloat(this.name, "presence");
  this.willpower = MML.getCurrentAttributeAsFloat(this.name, "willpower");
  this.evocation = MML.getCurrentAttributeAsFloat(this.name, "evocation");
  this.perception = MML.getCurrentAttributeAsFloat(this.name, "perception");
  this.systemStrength = MML.getCurrentAttributeAsFloat(this.name, "systemStrength");
  this.fitness = MML.getCurrentAttributeAsFloat(this.name, "fitness");
  this.fitnessMod = MML.getCurrentAttributeAsFloat(this.name, "fitnessMod");
  this.load = MML.getCurrentAttributeAsFloat(this.name, "load");
  this.overhead = MML.getCurrentAttributeAsFloat(this.name, "overhead");
  this.deadLift = MML.getCurrentAttributeAsFloat(this.name, "deadLift");
  this.hpMax = MML.getCurrentAttributeJSON(this.name, "hpMax");
  this.hp = MML.getCurrentAttributeJSON(this.name, "hp");
  this.epMax = MML.getCurrentAttributeAsFloat(this.name, "epMax");
  this.ep = MML.getCurrentAttributeAsFloat(this.name, "ep");
  this.fatigueMax = MML.getCurrentAttributeAsFloat(this.name, "fatigueMax");
  this.fatigue = MML.getCurrentAttributeAsFloat(this.name, "fatigue");
  this.hpRecovery = MML.getCurrentAttributeAsFloat(this.name, "hpRecovery");
  this.epRecovery = MML.getCurrentAttributeAsFloat(this.name, "epRecovery");
  this.inventory = MML.getCurrentAttributeJSON(this.name, "inventory");
  this.totalWeightCarried = MML.getCurrentAttributeAsFloat(this.name, "totalWeightCarried");
  this.knockdownMax = MML.getCurrentAttributeAsFloat(this.name, "knockdownMax");
  this.knockdown = MML.getCurrentAttributeAsFloat(this.name, "knockdown");
  this.apv = MML.getCurrentAttributeJSON(this.name, "apv");
  this.leftHand = MML.getCurrentAttributeJSON(this.name, "leftHand");
  this.rightHand = MML.getCurrentAttributeJSON(this.name, "rightHand");
  this.hitTable = MML.getCurrentAttribute(this.name, "hitTable");
  this.movementRatio = MML.getCurrentAttributeAsFloat(this.name, "movementRatio");
  this.movementAvailable = MML.getCurrentAttributeAsFloat(this.name, "movementAvailable");
  this.movementPosition = MML.getCurrentAttribute(this.name, "movementPosition");
  this.pathID = MML.getCurrentAttribute(this.name, "pathID");
  this.situationalMod = MML.getCurrentAttributeAsFloat(this.name, "situationalMod");
  this.attributeDefenseMod = MML.getCurrentAttributeAsFloat(this.name, "attributeDefenseMod");
  this.meleeDefenseMod = MML.getCurrentAttributeAsFloat(this.name, "meleeDefenseMod");
  this.rangedDefenseMod = MML.getCurrentAttributeAsFloat(this.name, "rangedDefenseMod");
  this.meleeAttackMod = MML.getCurrentAttributeAsFloat(this.name, "meleeAttackMod");
  this.missileAttackMod = MML.getCurrentAttributeAsFloat(this.name, "missileAttackMod");
  this.attributeMeleeAttackMod = MML.getCurrentAttributeAsFloat(this.name, "attributeMeleeAttackMod");
  this.meleeDamageMod = MML.getCurrentAttributeAsFloat(this.name, "meleeDamageMod");
  this.attributeMissileAttackMod = MML.getCurrentAttributeAsFloat(this.name, "attributeMissileAttackMod");
  this.attributeCastingMod = MML.getCurrentAttributeAsFloat(this.name, "attributeCastingMod");
  this.spellLearningMod = MML.getCurrentAttributeAsFloat(this.name, "spellLearningMod");
  this.statureCheckMod = MML.getCurrentAttributeAsFloat(this.name, "statureCheckMod");
  this.strengthCheckMod = MML.getCurrentAttributeAsFloat(this.name, "strengthCheckMod");
  this.coordinationCheckMod = MML.getCurrentAttributeAsFloat(this.name, "coordinationCheckMod");
  this.healthCheckMod = MML.getCurrentAttributeAsFloat(this.name, "healthCheckMod");
  this.beautyCheckMod = MML.getCurrentAttributeAsFloat(this.name, "beautyCheckMod");
  this.intellectCheckMod = MML.getCurrentAttributeAsFloat(this.name, "intellectCheckMod");
  this.reasonCheckMod = MML.getCurrentAttributeAsFloat(this.name, "reasonCheckMod");
  this.creativityCheckMod = MML.getCurrentAttributeAsFloat(this.name, "creativityCheckMod");
  this.presenceCheckMod = MML.getCurrentAttributeAsFloat(this.name, "presenceCheckMod");
  this.willpowerCheckMod = MML.getCurrentAttributeAsFloat(this.name, "willpowerCheckMod");
  this.evocationCheckMod = MML.getCurrentAttributeAsFloat(this.name, "evocationCheckMod");
  this.perceptionCheckMod = MML.getCurrentAttributeAsFloat(this.name, "perceptionCheckMod");
  this.systemStrengthCheckMod = MML.getCurrentAttributeAsFloat(this.name, "systemStrengthCheckMod");
  this.fitnessCheckMod = MML.getCurrentAttributeAsFloat(this.name, "fitnessCheckMod");
  this.statusEffects = MML.getCurrentAttributeJSON(this.name, "statusEffects");
  this.initiative = MML.getCurrentAttributeAsFloat(this.name, "initiative");
  this.initiativeRoll = MML.getCurrentAttributeAsFloat(this.name, "initiativeRoll");
  this.situationalInitBonus = MML.getCurrentAttributeAsFloat(this.name, "situationalInitBonus");
  this.movementRatioInitBonus = MML.getCurrentAttributeAsFloat(this.name, "movementRatioInitBonus");
  this.attributeInitBonus = MML.getCurrentAttributeAsFloat(this.name, "attributeInitBonus");
  this.senseInitBonus = MML.getCurrentAttributeAsFloat(this.name, "senseInitBonus");
  this.fomInitBonus = MML.getCurrentAttributeAsFloat(this.name, "fomInitBonus");
  this.firstActionInitBonus = MML.getCurrentAttributeAsFloat(this.name, "firstActionInitBonus");
  this.spentInitiative = MML.getCurrentAttributeAsFloat(this.name, "spentInitiative");
  this.actionTempo = MML.getCurrentAttributeAsFloat(this.name, "actionTempo");
  this.ready = MML.getCurrentAttribute(this.name, "ready");
  this.action = MML.getCurrentAttributeJSON(this.name, "action");
  this.defensesThisRound = MML.getCurrentAttributeAsFloat(this.name, "defensesThisRound");
  this.dodgedThisRound = MML.getCurrentAttributeAsBool(this.name, "dodgedThisRound");
  this.meleeThisRound = MML.getCurrentAttributeAsBool(this.name, "meleeThisRound");
  this.fatigueLevel = MML.getCurrentAttributeAsFloat(this.name, "fatigueLevel");
  this.roundsRest = MML.getCurrentAttributeAsFloat(this.name, "roundsRest");
  this.roundsExertion = MML.getCurrentAttributeAsFloat(this.name, "roundsExertion");
  this.damagedThisRound = MML.getCurrentAttributeAsBool(this.name, "damagedThisRound");
  this.skills = MML.getSkillAttributes(this.name, "skills");
  this.weaponSkills = MML.getSkillAttributes(this.name, "weaponskills");
  this.fov = MML.getCurrentAttributeAsFloat(this.name, "fov");
};

MML.updateCharacter = function(input) {
  var attributeArray = [input.attribute];
  var dependents = MML.computeAttribute[input.attribute].dependents;
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
    // log(attribute + " " + value);
    this[attribute] = value;
    if (typeof(value) === "object") {
      value = JSON.stringify(value);
    }
    MML.setCurrentAttribute(this.name, attribute, value);
  }, this);

  _.each(dependents, function(attribute) {
    MML.processCommand({
      type: "character",
      who: this.name,
      callback: "updateCharacter",
      input: {
        attribute: attribute
      }
    });
  }, this);
};

MML.setApiCharAttribute = function(input) {
  this[input.attribute] = input.value;
  MML.processCommand({
    type: "character",
    who: this.name,
    callback: "updateCharacter",
    input: input
  });
};

MML.setApiCharAttributeJSON = function(input) {
  this[input.attribute][input.index] = input.value;
  MML.processCommand({
    type: "character",
    who: this.name,
    callback: "updateCharacter",
    input: input
  });
};

MML.removeStatusEffect = function(input) {
  if (!_.isUndefined(this.statusEffects[input.index])) {
    delete this.statusEffects[input.index];
    MML.processCommand({
      type: "character",
      who: this.name,
      callback: "updateCharacter",
      input: {
        attribute: "statusEffects"
      }
    });
  }
};

MML.computeAttribute = {};
MML.computeAttribute.name = {
  dependents: [],
  compute: function() {
    return this.name;
  }
};
MML.computeAttribute.player = {
  dependents: [],
  compute: function() {
    return this.player;
  }
};

MML.computeAttribute.race = {
  dependents: [
    "inventory",
    "stature",
    "strength",
    "coordination",
    "health",
    "beauty",
    "intellect",
    "reason",
    "creativity",
    "presence",
    "willpower",
    "evocation",
    "perception",
    "systemStrength",
    "fitness",
    "fitnessMod",
    "load",
    "bodyType",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return MML.getCurrentAttribute(this.name, "race");
  }
};
MML.computeAttribute.bodyType = {
  dependents: ["hitTable"],
  compute: function() {
    return MML.bodyTypes[this.race];
  }
};
MML.computeAttribute.gender = {
  dependents: ["stature"], //"magic bonus for females"],
  compute: function() {
    return MML.getCurrentAttribute(this.name, "gender");
  }
};
MML.computeAttribute.height = {
  dependents: [],
  compute: function() {
    return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, "statureRoll")].height;
  }
};
MML.computeAttribute.weight = {
  dependents: [],
  compute: function() {
    return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, "statureRoll")].weight;
  }
};
MML.computeAttribute.handedness = {
  dependents: [], // "meleeAttackMod"
  compute: function() {
    return MML.getCurrentAttributeAsFloat(this.name, "handedness");
  }
};

//Primary Attributes
MML.computeAttribute.stature = {
  dependents: [
    "load",
    "hpMax",
    "knockdownMax",
    "height",
    "weight"
  ],
  compute: function() {
    return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, "statureRoll")].stature;
  }
};
MML.computeAttribute.strength = {
  dependents: [
    "fitness",
    "hpMax",
    "attributeDefenseMod",
    "attributeMeleeAttackMod",
    "attributeMissileAttackMod",
    "attributeInitBonus",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return MML.getCurrentAttributeAsFloat(this.name, "strengthRoll") + MML.racialAttributeBonuses[this.race].strength;
  }
};
MML.computeAttribute.coordination = {
  dependents: [
    "attributeMeleeAttackMod",
    "attributeMissileAttackMod",
    "attributeDefenseMod",
    "attributeInitBonus",
    "skills",
    "weaponSkills"
  ], //skill mods
  compute: function() {
    return MML.getCurrentAttributeAsFloat(this.name, "coordinationRoll") + MML.racialAttributeBonuses[this.race].coordination;
  }
};
MML.computeAttribute.health = {
  dependents: [
    "willpower",
    "hpMax",
    "evocation",
    "systemStrength",
    "fitness",
    "hpRecovery",
    "epRecovery",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return MML.getCurrentAttributeAsFloat(this.name, "healthRoll") + MML.racialAttributeBonuses[this.race].health;
  }
};
MML.computeAttribute.beauty = {
  dependents: [
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return MML.getCurrentAttributeAsFloat(this.name, "beautyRoll") + MML.racialAttributeBonuses[this.race].beauty;
  }
};
MML.computeAttribute.intellect = {
  dependents: [
    "perception",
    "evocation",
    "spellLearningMod",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return MML.getCurrentAttributeAsFloat(this.name, "intellectRoll") + MML.racialAttributeBonuses[this.race].intellect;
  }
};
MML.computeAttribute.reason = {
  dependents: [
    "perception",
    "evocation",
    "attributeCastingMod",
    "attributeInitBonus",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return MML.getCurrentAttributeAsFloat(this.name, "reasonRoll") + MML.racialAttributeBonuses[this.race].reason;
  }
};
MML.computeAttribute.creativity = {
  dependents: [
    "perception",
    "evocation",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return MML.getCurrentAttributeAsFloat(this.name, "creativityRoll") + MML.racialAttributeBonuses[this.race].creativity;
  }
};
MML.computeAttribute.presence = {
  dependents: [
    "willpower",
    "systemStrength",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return MML.getCurrentAttributeAsFloat(this.name, "presenceRoll") + MML.racialAttributeBonuses[this.race].presence;
  }
};

// Secondary Attributes
MML.computeAttribute.willpower = {
  dependents: [
    "evocation",
    "hpMax"
  ],
  compute: function() {
    return Math.round((2 * this.presence + this.health) / 3);
  }
};
MML.computeAttribute.evocation = {
  dependents: [
    "epMax",
    "skills",
    "weaponSkills"
  ], //skill mods
  compute: function() {
    return this.intellect +
      this.reason +
      this.creativity +
      this.health +
      this.willpower +
      MML.racialAttributeBonuses[this.race].evocation;
  }
};
MML.computeAttribute.perception = {
  dependents: [
    "missileAttackMod",
    "attributeInitBonus",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return Math.round((this.intellect + this.reason + this.creativity) / 3) + MML.racialAttributeBonuses[this.race].perception;
  }
};
MML.computeAttribute.systemStrength = {
  dependents: [],
  compute: function() {
    return Math.round((this.presence + 2 * this.health) / 3);
  }
};
MML.computeAttribute.fitness = {
  dependents: [
    "fitnessMod",
    "fatigueMax",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return Math.round((this.health + this.strength) / 2) + MML.racialAttributeBonuses[this.race].fitness;
  }
};
MML.computeAttribute.fitnessMod = {
  dependents: [
    "load",
    "skills",
    "weaponSkills"
  ], //skill mods
  compute: function() {
    return MML.fitnessModLookup[this.fitness];
  }
};
MML.computeAttribute.load = {
  dependents: [
    "overhead",
    "deadLift",
    "meleeDamageMod",
    "movementRatio",
    "skills",
    "weaponSkills"
  ],
  compute: function() {
    return Math.round(this.stature * this.fitnessMod) + MML.racialAttributeBonuses[this.race].load;
  }
};
MML.computeAttribute.overhead = {
  dependents: [],
  compute: function() {
    return this.load * 2;
  }
};
MML.computeAttribute.deadLift = {
  dependents: [],
  compute: function() {
    return this.load * 4;
  }
};

// HP stuff
MML.computeAttribute.hpMax = {
  dependents: ["hp"],
  compute: function() {
    var hpMax = MML.buildHpAttribute(this);
    this.hp = MML.buildHpAttribute(this);
    return hpMax;
  }
};
MML.computeAttribute.hp = {
  dependents: ["statusEffects"],
  compute: function() {
    return this.hp;
  }
};
MML.computeAttribute.epMax = {
  dependents: ["ep"],
  compute: function() {
    var epMax = this.evocation;
    this.ep = epMax;
    return epMax;
  }
};
MML.computeAttribute.ep = {
  dependents: ["statusEffects"],
  compute: function() {
    return this.ep;
  }
};
MML.computeAttribute.fatigueMax = {
  dependents: ["fatigue"],
  compute: function() {
    var fatigueMax = this.fitness;
    this.fatigue = fatigueMax;
    return fatigueMax;
  }
};
MML.computeAttribute.fatigue = {
  dependents: ["statusEffects"],
  compute: function() {
    return this.fatigue;
  }
};
MML.computeAttribute.hpRecovery = {
  dependents: [],
  compute: function() {
    return MML.recoveryMods[this.health].hp;
  }
};
MML.computeAttribute.epRecovery = {
  dependents: [],
  compute: function() {
    return MML.recoveryMods[this.health].ep;
  }
};

// Inventory stuff
MML.computeAttribute.inventory = {
  dependents: [
    "totalWeightCarried",
    "apv",
    "leftHand",
    "rightHand",
    "senseInitBonus"
  ],
  compute: function() {
    var items = _.omit(this.inventory, "emptyHand");

    _.each(
      items,
      function(item, _id) {
        MML.setCurrentAttribute(this.name, "repeating_items_" + _id + "_itemName", item.name);
        MML.setCurrentAttribute(this.name, "repeating_items_" + _id + "_itemId", _id);
      },
      this
    );
    items.emptyHand = {
      type: "empty",
      weight: 0
    };
    return items;
  }
};
MML.computeAttribute.totalWeightCarried = {
  dependents: [
    "knockdownMax",
    "movementRatio"
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
  dependents: ["knockdown"],
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
        if (item.type === "armor") {
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
  dependents: ["hitTable"],
  compute: function() {
    return this.leftHand;
  }
};
MML.computeAttribute.rightHand = {
  dependents: ["hitTable"],
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
  dependents: ["movementRatioInitBonus"],
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
MML.computeAttribute.attributeDefenseMod = {
  dependents: [],
  compute: function() {
    return MML.attributeMods.strength[this.strength] + MML.attributeMods.coordination[this.coordination];
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
MML.computeAttribute.attributeMissileAttackMod = {
  dependents: [],
  compute: function() {
    return MML.attributeMods.perception[this.perception] + MML.attributeMods.coordination[this.coordination] + MML.attributeMods.strength[this.strength];
  }
};
MML.computeAttribute.attributeCastingMod = {
  dependents: [],
  compute: function() {
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
    return this.situationalMod;
  }
};
MML.computeAttribute.strengthCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.coordinationCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.healthCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.beautyCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.intellectCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.reasonCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.creativityCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.presenceCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.willpowerCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.evocationCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.perceptionCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.systemStrengthCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.fitnessCheckMod = {
  dependents: [],
  compute: function() {
    return this.situationalMod;
  }
};
MML.computeAttribute.statusEffects = {
  dependents: [
    "situationalInitBonus",
    "situationalMod",
    "rangedDefenseMod",
    "meleeDefenseMod",
    "missileAttackMod",
    "meleeAttackMod",
    "perceptionCheckMod",
    "roundsExertion"
  ],
  compute: function() {
    _.each(MML.computeAttribute.statusEffects.dependents, function(dependent) {
      this[dependent] = 0;
    }, this);
    _.each(this.statusEffects, function(effect, index) {
      if (index.indexOf("Major Wound") !== -1) {
        MML.statusEffects["Major Wound"].apply(this, [effect, index]);
      } else if (index.indexOf("Disabling Wound") !== -1) {
        MML.statusEffects["Disabling Wound"].apply(this, [effect, index]);
      } else if (index.indexOf("Mortal Wound") !== -1) {
        MML.statusEffects["Mortal Wound"].apply(this, [effect, index]);
      } else {
        MML.statusEffects[index].apply(this, [effect, index]);
      }
      MML.setCurrentAttribute(this.name, "repeating_statuseffects_" + effect.id + "_statusEffectName", index);
      MML.setCurrentAttribute(this.name, "repeating_statuseffects_" + effect.id + "_statusEffectDescription", (effect.description ? effect.description : ""));
    }, this);

    var regex = new RegExp('^repeating_statuseffects_.*?_.*?$');
    var charObj = MML.getCharFromName(this.name);
    var statusEffectIDs = _.pluck(this.statusEffects, "id");
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
        if (_.isString(effect.get("name", "current")) && effect.get("name", "current").indexOf(id) > -1) {
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
MML.computeAttribute.initiative = {
  dependents: [],
  compute: function() {
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
      this.situationalInitBonus === "No Combat" ||
      this.movementRatioInitBonus === "No Combat") {
      return 0;
    } else {
      return initiative;
    }
  }
};
MML.computeAttribute.initiativeRoll = {
  dependents: ["initiative"],
  compute: function() {
    return this.initiativeRoll;
  }
};
MML.computeAttribute.situationalInitBonus = {
  dependents: ["initiative"],
  compute: function() {
    return this.situationalInitBonus;
  }
};
MML.computeAttribute.movementRatioInitBonus = {
  dependents: ["initiative"],
  compute: function() {
    if (this.movementRatio < 0.6) {
      return "No Combat";
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
};
MML.computeAttribute.attributeInitBonus = {
  dependents: ["initiative"],
  compute: function() {
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
};
MML.computeAttribute.senseInitBonus = {
  dependents: [
    "initiative",
    "attributeCastingMod",
    "fov"
  ],
  compute: function() {
    var armorList = _.where(this.inventory, {
      type: "armor"
    });
    var bitsOfHelm = ["Barbute Helm", "Bascinet Helm", "Camail", "Camail-Conical", "Cap", "Cheeks", "Conical Helm", "Duerne Helm", "Dwarven War Hood", "Face Plate", "Great Helm", "Half-Face Plate", "Hood", "Nose Guard", "Pot Helm", "Sallet Helm", "Throat Guard", "War Hat"];
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
      if (senseArray.indexOf("Great Helm") !== -1 || (senseArray.indexOf("Sallet Helm") !== -1 && senseArray.indexOf("Throat Guard") !== -1)) {
        return -2;
      }
      //wearing a helm
      else if (_.intersection(senseArray, ["Barbute Helm", "Sallet Helm", "Bascinet Helm", "Duerne Helm", "Cap", "Pot Helm", "Conical Helm", "War Hat"]).length > 0) {
        //Has faceplate
        if (senseArray.indexOf("Face Plate") !== -1) {
          //Enclosed Sides
          if (_.intersection(senseArray, ["Barbute Helm", "Bascinet Helm", "Duerne Helm"]).length > 0) {
            return -2;
          } else {
            return -1;
          }
        }
        //These types of helms or half face plate
        else if (_.intersection(senseArray, ["Barbute Helm", "Sallet Helm", "Bascinet Helm", "Duerne Helm", "Half-Face Plate"]).length > 0) {
          return 0;
        }
        //has camail or cheeks
        else if (_.intersection(senseArray, ["Camail", "Camail-Conical", "Cheeks"]).length > 0) {
          return 1;
        }
        //Wearing a hood
        else if (_.intersection(senseArray, ["Dwarven War Hood", "Hood"]).length > 0) {
          _.each(armorList, function(piece) {
            if (piece.name === "Dwarven War Hood" || piece.name === "Hood") {
              if (piece.family === "Cloth") {
                return 2;
              } else {
                return 1;
              }
            }
          });
        }
        //has nose guard
        else if (senseArray.indexOf("Nose Guard") !== -1) {
          return 2;
        }
        // just a cap
        else {
          return 3;
        }
      }
      //Wearing a hood
      else if (_.intersection(senseArray, ["Dwarven War Hood", "Hood"]).length > 0) {
        _.each(armorList, function(piece) {
          if (piece.name === "Dwarven War Hood" || piece.name === "Hood") {
            if (piece.family === "Cloth") {
              return 2;
            } else {
              return 1;
            }
          }
        });
      }
    }
  }
};
MML.computeAttribute.fomInitBonus = {
  dependents: [
    "initiative",
    "attributeCastingMod"
  ],
  compute: function() {
    return this.fomInitBonus;
  }
};
MML.computeAttribute.firstActionInitBonus = {
  dependents: ["initiative"],
  compute: function() {
    if (state.MML.GM.roundStarted === false) {
      this.firstActionInitBonus = this.action.initBonus;
    }
    return this.firstActionInitBonus;
  }
};
MML.computeAttribute.spentInitiative = {
  dependents: ["initiative"],
  compute: function() {
    return this.spentInitiative;
  }
};
MML.computeAttribute.actionTempo = {
  dependents: [],
  compute: function() {
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
    if (this.action.name === "Attack" && MML.isDualWielding(this)) {
      var twfSkill = this.weaponskills["Two Weapon Fighting"].level;
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
};

// Combat
MML.computeAttribute.ready = {
  dependents: [],
  compute: function() {
    if (state.MML.GM.inCombat === true && this.ready === false) {
      MML.getTokenFromChar(this.name).set("tint_color", "#FF0000");
    } else {
      MML.getTokenFromChar(this.name).set("tint_color", "transparent");
    }
    return this.ready;
  }
};
MML.computeAttribute.action = {
  dependents: [
    "firstActionInitBonus",
    "actionTempo",
    "statusEffects"
  ],
  compute: function() {
    var initBonus = 10;

    if (this.action.name === "Attack") {
      var leftHand = MML.getWeaponFamily(this, "leftHand");
      var rightHand = MML.getWeaponFamily(this, "rightHand");

      if (["Punch", "Kick", "Head Butt", "Bite", "Grapple", "Place a Hold", "Break a Hold", "Break Grapple"].indexOf(this.action.weaponType) > -1 ||
        (leftHand === "unarmed" && rightHand === "unarmed")
      ) {
        if (!_.isUndefined(this.weaponSkills["Brawling"]) && this.weaponSkills["Brawling"].level > this.weaponSkills["Default Martial"].level) {
          this.action.skill = this.weaponSkills["Brawling"].level;
        } else {
          this.action.skill = this.weaponSkills["Default Martial"].level;
        }
      } else if (leftHand !== "unarmed" && rightHand !== "unarmed") {
        var weaponInits = [this.inventory[this.leftHand._id].grips[this.leftHand.grip].initiative,
          this.inventory[this.rightHand._id].grips[this.rightHand.grip].initiative
        ];
        initBonus = _.min(weaponInits);
        // this.action.skill = this.weaponSkills.[this.inventory[this.leftHand._id].name].level or this.weaponSkills["Default Martial Skill"].level;
        //Dual Wielding
      } else if (rightHand !== "unarmed" && leftHand === "unarmed") {
        initBonus = this.inventory[this.rightHand._id].grips[this.rightHand.grip].initiative;
        this.action.skill = MML.getWeaponSkill(this, this.inventory[this.rightHand._id]);
      } else {
        initBonus = this.inventory[this.leftHand._id].grips[this.leftHand.grip].initiative;
        this.action.skill = MML.getWeaponSkill(this, this.inventory[this.leftHand._id]);
      }
    } else if (this.action.name === "Cast") {
      this.action.skill = MML.getMagicSkill(this, this.action.spell);
    }
    this.action.initBonus = initBonus;

    _.each(_.without(this.action.modifiers, "Release Opponent"), function(modifier) {
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
MML.computeAttribute.fov = {
  dependents: [],
  compute: function() {
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
};

// Skills
MML.computeAttribute.skills = {
  dependents: ["actionTempo"],
  compute: function() {
    var characterSkills = MML.getSkillAttributes(this.name, "skills");
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
        MML.setCurrentAttribute(this.name, "repeating_skills_" + characterSkill._id + "_name", skillName);
        MML.setCurrentAttribute(this.name, "repeating_skills_" + characterSkill._id + "_input", characterSkill.input);
        MML.setCurrentAttribute(this.name, "repeating_skills_" + characterSkill._id + "_level", level);
      },
      this
    );

    this.skills = characterSkills;
    return characterSkills;
  }
};
MML.computeAttribute.weaponSkills = {
  dependents: ["actionTempo"],
  compute: function() {
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

    this.weaponSkills = characterSkills;
    return characterSkills;
  }
};
