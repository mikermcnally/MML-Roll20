// Character Creation
MML.characterConstructor = function characterConstructor(charName){
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
    this.multiWoundMax = MML.getCurrentAttributeAsFloat(this.name, "multiWoundMax");
    this.multiWound = MML.getCurrentAttributeAsFloat(this.name, "multiWound");
    this.headHPMax = MML.getCurrentAttributeAsFloat(this.name, "headHPMax");
    this.headHP = MML.getCurrentAttributeAsFloat(this.name, "headHP");
    this.chestHPMax = MML.getCurrentAttributeAsFloat(this.name, "chestHPMax");
    this.chestHP = MML.getCurrentAttributeAsFloat(this.name, "chestHP");
    this.abdomenHPMax = MML.getCurrentAttributeAsFloat(this.name, "abdomenHPMax");
    this.abdomenHP = MML.getCurrentAttributeAsFloat(this.name, "abdomenHP");
    this.leftArmHPMax = MML.getCurrentAttributeAsFloat(this.name, "leftArmHPMax");
    this.leftArmHP = MML.getCurrentAttributeAsFloat(this.name, "leftArmHP");
    this.rightArmHPMax = MML.getCurrentAttributeAsFloat(this.name, "rightArmHPMax");
    this.rightArmHP = MML.getCurrentAttributeAsFloat(this.name, "rightArmHP");
    this.leftLegHPMax = MML.getCurrentAttributeAsFloat(this.name, "leftLegHPMax");
    this.leftLegHP = MML.getCurrentAttributeAsFloat(this.name, "leftLegHP");
    this.rightLegHPMax = MML.getCurrentAttributeAsFloat(this.name, "rightLegHPMax");
    this.rightLegHP = MML.getCurrentAttributeAsFloat(this.name, "rightLegHP");
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
    this.situationalMod = MML.getCurrentAttributeAsFloat(this.name, "situationalMod");
    this.attributeDefenseMod = MML.getCurrentAttributeAsFloat(this.name, "attributeDefenseMod");
    this.meleeDefenseMod = MML.getCurrentAttributeAsFloat(this.name, "meleeDefenseMod");
    this.missileDefenseMod = MML.getCurrentAttributeAsFloat(this.name, "missileDefenseMod");
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
};

MML.updateCharacter = function(input){
    var attributeArray = [input.attribute];

    for(var i = 0; i < attributeArray.length; i++){ //length of array is dynamic, for-in doesn't work here
        var localAttribute = MML.computeAttribute[attributeArray[i]];
        
        if(_.isUndefined(localAttribute)){
            log(attributeArray[i]);
        }
        else{
            attributeArray = _.union(attributeArray, localAttribute.dependents);  
        }
    }

    _.each(
        attributeArray,
        function(attribute) {
            var value = MML.computeAttribute[attribute].compute.apply(this, []); // Run compute function from character scope
            // log(attribute + " " + value);
            this[attribute] = value;
            if(typeof(value) === "object"){
                value = JSON.stringify(value);
            }     
            MML.setCurrentAttribute(this.name, attribute, value);
        },
        this
    );};

MML.setApiCharAttribute = function(input){
    this[input.attribute] = input.value;
    MML.processCommand({
        type: "character",
        who: this.name,
        triggeredFunction: "updateCharacter",
        input: input
    });
};

MML.setApiCharAttributeJSON = function(input){
    this[input.attribute][input.index] = input.value;
    MML.processCommand({
        type: "character",
        who: this.name,
        triggeredFunction: "updateCharacter",
        input: input
    });
};

MML.computeAttribute = {};
MML.computeAttribute.name = {
    dependents: [],
    compute: function(){
        return this.name;
    }
};

MML.computeAttribute.player = { 
    dependents: [],
    compute: function(){
        return this.player;
    }
};

MML.computeAttribute.race = {
    dependents: ["stature",
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
                "load",
                "bodyType",
                "skills",
                "weaponSkills"],
    compute: function(){
        return MML.getCurrentAttribute(this.name, "race");
    }
};

MML.computeAttribute.bodyType = { 
    dependents: ["hitTable"],
    compute: function() {
        return MML.bodyTypes[this.race];   
    }
};

MML.computeAttribute.gender = { dependents: ["stature"], //"magic bonus for females"],
    compute: function(){
        return MML.getCurrentAttribute(this.name, "gender");
    } };
MML.computeAttribute.height = { dependents: [], 
    compute: function(){
        return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, "statureRoll")].height;
    }};
MML.computeAttribute.weight = { dependents: [], 
    compute: function(){
        return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, "statureRoll")].weight;
    } };
MML.computeAttribute.handedness = { dependents: [], // "meleeAttackMod"
    compute: function(){
        return MML.getCurrentAttributeAsFloat(this.name, "handedness");
    }};

//Primary Attributes
MML.computeAttribute.stature = { dependents: ["load",
                "headHPMax",
                "chestHPMax",
                "abdomenHPMax",
                "leftArmHPMax",
                "rightArmHPMax",
                "leftLegHPMax",
                "rightLegHPMax",
                "multiWoundMax",
                "knockdownMax",
                "height",
                "weight"], 
    compute: function(){
        return MML.statureTables[this.race][this.gender][MML.getCurrentAttributeAsFloat(this.name, "statureRoll")].stature;
    } };
MML.computeAttribute.strength = { dependents: ["fitness",
                "chestHPMax",
                "attributeDefenseMod",
                "attributeMeleeAttackMod",
                "attributeMissileAttackMod",
                "attributeInitBonus",
                "skills",
                "weaponSkills"],
    compute: function(){
        return MML.getCurrentAttributeAsFloat(this.name, "strengthRoll") + MML.racialAttributeBonuses[this.race].strength;
    } };
MML.computeAttribute.coordination = { dependents: ["attributeMeleeAttackMod",
                "attributeMissileAttackMod",
                "attributeDefenseMod",
                "attributeInitBonus",
                "skills",
                "weaponSkills"], //skill mods
    compute: function(){
        return MML.getCurrentAttributeAsFloat(this.name, "coordinationRoll") + MML.racialAttributeBonuses[this.race].coordination;
    } };
MML.computeAttribute.health = { dependents: ["willpower",
                "evocation",
                "systemStrength",
                "fitness",
                "headHPMax",
                "chestHPMax",
                "abdomenHPMax",
                "leftArmHPMax",
                "rightArmHPMax",
                "leftLegHPMax",
                "rightLegHPMax",
                "multiWoundMax",
                "hpRecovery",
                "epRecovery",
                "skills",
                "weaponSkills"
                ], 
    compute: function(){
        return MML.getCurrentAttributeAsFloat(this.name, "healthRoll") + MML.racialAttributeBonuses[this.race].health;
    } };
MML.computeAttribute.beauty = { dependents: ["skills",
                "weaponSkills"],
    compute: function(){
        return MML.getCurrentAttributeAsFloat(this.name, "beautyRoll") + MML.racialAttributeBonuses[this.race].beauty;
    } };
MML.computeAttribute.intellect = { dependents: ["perception",
                "evocation",
                "spellLearningMod",
                "skills",
                "weaponSkills"],
    compute: function(){
        return MML.getCurrentAttributeAsFloat(this.name, "intellectRoll") + MML.racialAttributeBonuses[this.race].intellect;
    } };
MML.computeAttribute.reason = { dependents: ["perception",
                "evocation",
                "attributeCastingMod",
                "attributeInitBonus",
                "skills",
                "weaponSkills"],
    compute: function(){
        return MML.getCurrentAttributeAsFloat(this.name, "reasonRoll") + MML.racialAttributeBonuses[this.race].reason;
    } };
MML.computeAttribute.creativity = { dependents: ["perception",
                "evocation",
                "skills",
                "weaponSkills"],
    compute: function(){
        return MML.getCurrentAttributeAsFloat(this.name, "creativityRoll") + MML.racialAttributeBonuses[this.race].creativity;
    } };
MML.computeAttribute.presence = { dependents: ["willpower",
                "systemStrength",
                "skills",
                "weaponSkills"],
    compute: function(){
        return MML.getCurrentAttributeAsFloat(this.name, "presenceRoll") + MML.racialAttributeBonuses[this.race].presence;
    } };

// Secondary Attributes
MML.computeAttribute.willpower = { dependents: ["evocation",
                "multiWound"],
    compute: function(){
        return Math.round((2*this.presence + this.health)/3);
    } };
MML.computeAttribute.evocation = { dependents: ["epMax",
                "skills",
                "weaponSkills"], //skill mods
    compute: function(){
        return this.intellect + 
                this.reason + 
                this.creativity + 
                this.health + 
                this.willpower + 
                MML.racialAttributeBonuses[this.race].evocation;
    } };
MML.computeAttribute.perception = { dependents: ["missileAttackMod",
                "attributeInitBonus",
                "skills",
                "weaponSkills"],
    compute: function(){
        return Math.round((this.intellect + this.reason + this.creativity)/3) + MML.racialAttributeBonuses[this.race].perception;
    } };
MML.computeAttribute.systemStrength = { dependents: [], 
    compute: function(){
        return Math.round((this.presence + 2*this.health)/3);
    } };
MML.computeAttribute.fitness = { dependents: ["fitnessMod",
                "fatigueMax",
                "skills",
                "weaponSkills"],
    compute: function(){
        return Math.round((this.health + this.strength)/2) + MML.racialAttributeBonuses[this.race].fitness;
    }};
MML.computeAttribute.fitnessMod = { dependents: ["load",
                "skills",
                "weaponSkills"], //skill mods
    compute: function(){
        return MML.fitnessModLookup[this.fitness];
    }};
MML.computeAttribute.load = { dependents: ["overhead",
                "deadLift",
                "meleeDamageMod",
                "movementRatio",
                "skills",
                "weaponSkills"],
    compute: function(){
        return Math.round(this.stature * this.fitnessMod) + MML.racialAttributeBonuses[this.race].load;
    }};
MML.computeAttribute.overhead = { dependents: [], 
    compute: function(){
        return this.load*2;
    }};
MML.computeAttribute.deadLift = { dependents: [], 
    compute: function(){
        return this.load*4;
    }};

// HP stuff
MML.computeAttribute.multiWoundMax = { dependents: ["multiWound"],
    compute: function(){
        var multiWoundMax = Math.round((this.health + this.stature + this.willpower)/2);
        this.multiWound = multiWoundMax;
        return multiWoundMax;
    }};
MML.computeAttribute.multiWound = { dependents: [],
    compute: function(){
        return this.multiWound;
    }};
MML.computeAttribute.headHPMax = { dependents: ["headHP"],
    compute: function(){
        var headHPMax = MML.HPTables[this.race][Math.round(this.health + this.stature/3)];
        this.headHP = headHPMax;
        return headHPMax;
    }};
MML.computeAttribute.headHP = { dependents: [],
    compute: function(){
        return this.headHP;
    }};
MML.computeAttribute.chestHPMax = { dependents: ["chestHP"],
    compute: function(){
        var chestHPMax = MML.HPTables[this.race][Math.round((this.health + this.stature + this.strength)/2)];
        this.chestHP = chestHPMax;
        return chestHPMax;
    }};
MML.computeAttribute.chestHP = { dependents: [],
    compute: function(){
        return this.chestHP;
    }};
MML.computeAttribute.abdomenHPMax = { dependents: ["abdomenHP"],
    compute: function(){
        var abdomenHPMax = MML.HPTables[this.race][Math.round(this.health + this.stature)];
        this.abdomenHP = abdomenHPMax;
        return abdomenHPMax;
    }};
MML.computeAttribute.abdomenHP = { dependents: [],
    compute: function(){
        return this.abdomenHP;
    }};
MML.computeAttribute.leftArmHPMax = { dependents: ["leftArmHP"],
    compute: function(){
        var leftArmHPMax = MML.HPTables[this.race][Math.round(this.health + this.stature)];
        this.leftArmHP = leftArmHPMax;
        return leftArmHPMax;
    }};
MML.computeAttribute.leftArmHP = { dependents: [],
    compute: function(){
        return this.leftArmHP;
    }};
MML.computeAttribute.rightArmHPMax = { dependents: ["rightArmHP"],
    compute: function(){
        var rightArmHPMax = MML.HPTables[this.race][Math.round(this.health + this.stature)];
        this.rightArmHP = rightArmHPMax;
        return rightArmHPMax;
    }};
MML.computeAttribute.rightArmHP = { dependents: [],
    compute: function(){
        return this.rightArmHP;
    }};
MML.computeAttribute.leftLegHPMax = { dependents: ["leftLegHP"],
    compute: function(){
        var leftLegHPMax = MML.HPTables[this.race][Math.round(this.health + this.stature)];
        this.leftLegHP = leftLegHPMax;
        return leftLegHPMax;
    }};
MML.computeAttribute.leftLegHP = { dependents: [],
    compute: function(){
        return this.leftLegHP;
    }};
MML.computeAttribute.rightLegHPMax = { dependents: ["rightLegHP"],
    compute: function(){
        var rightLegHPMax = MML.HPTables[this.race][Math.round(this.health + this.stature)];
        this.rightLegHP = rightLegHPMax;
        return rightLegHPMax;
    }};
MML.computeAttribute.rightLegHP = { dependents: [],
    compute: function(){
        return this.rightLegHP;
    }};
MML.computeAttribute.epMax = { dependents: ["ep"],
    compute: function(){
        var epMax = this.evocation;
        this.ep = epMax;
        return epMax;
    }};
MML.computeAttribute.ep = { dependents: ["statusEffects"],
    compute: function(){
        return this.ep;
    }};
MML.computeAttribute.fatigueMax = { dependents: ["fatigue"],
    compute: function(){
        var fatigueMax = this.fitness;
        this.fatigue = fatigueMax;
        return fatigueMax;
    }};
MML.computeAttribute.fatigue = { dependents: ["statusEffects"],
    compute: function(){
        return this.fatigue;
    }};
MML.computeAttribute.hpRecovery = { dependents: [],
    compute: function(){
        return MML.recoveryMods[this.health].hp;
    }};
MML.computeAttribute.epRecovery = { dependents: [],
    compute: function(){
        return MML.recoveryMods[this.health].ep;
    }};

// Inventory stuff    
MML.computeAttribute.inventory = { dependents: ["totalWeightCarried",
                 "apv",
                 "leftHand",
                 "rightHand",
                 "senseInitBonus"],
    compute: function(){
        var items = this.inventory;

        _.each(
            items,
            function(item, _id) {
                MML.setCurrentAttribute(this.name, "repeating_items_" + _id + "_itemName", item.name);
                MML.setCurrentAttribute(this.name, "repeating_items_" + _id + "_itemId", _id);
            },
            this
        );
        return items;
    }};
MML.computeAttribute.totalWeightCarried = { dependents: ["knockdownMax", "movementRatio"],
    compute: function(){
        var totalWeightCarried = 0;

        _.each(this.inventory, function(item) {
            totalWeightCarried += item.weight;
        });
        return totalWeightCarried;
    }};
MML.computeAttribute.knockdownMax = { dependents: ["knockdown"],
    compute: function(){
        var knockdownMax = Math.round(this.stature + (this.totalWeightCarried/10));
        this.knockdown = knockdownMax;
        return knockdownMax;
    }};
MML.computeAttribute.knockdown = { dependents: [],
    compute: function(){
        if (this.knockdown < 0) {
            MML.knockdownRoll.apply(this, []);
        }       
        else{
            return false;
        }
        return this.knockdown;
    }};
MML.computeAttribute.apv = { dependents: [],
    compute: function(){
        var armor = [];
        _.each(
            this.inventory, 
            function(item){
                if(item.type === "armor"){
                    armor.push(item);
                }
            },
            this);

        var mat = [];
        
        // Initialize APV Matrix
        _.each(MML.hitPositions[this.bodyType], function(position){
            mat.push({
                Surface: [{ value: 0, coverage: 100}],
                Cut: [{ value: 0, coverage: 100}],
                Chop: [{ value: 0, coverage: 100}],
                Pierce: [{ value: 0, coverage: 100}],
                Thrust: [{ value: 0, coverage: 100}],
                Impact: [{ value: 0, coverage: 100}],
                Flanged: [{ value: 0, coverage: 100}]
            });
        });
        
        //Creates raw matrix of individual pieces of armor (no layering or partial coverage)
           
        _.each(armor, function(piece){
            var material = MML.APVList[piece.material];

            _.each(piece.protection, function(protection){
                mat[protection.position].Surface.push({ value: material.surface, coverage: protection.coverage });
                mat[protection.position].Cut.push({ value: material.cut, coverage: protection.coverage });
                mat[protection.position].Chop.push({ value: material.chop, coverage: protection.coverage });
                mat[protection.position].Pierce.push({ value: material.pierce, coverage: protection.coverage });
                mat[protection.position].Thrust.push({ value: material.thrust, coverage: protection.coverage });
                mat[protection.position].Impact.push({ value: material.impact, coverage: protection.coverage });
                mat[protection.position].Flanged.push({ value: material.flanged, coverage: protection.coverage });
            });
        });
        
        //This loop accounts for layered armor and partial coverage and outputs final APVs
        var position = 0;
        for (position in mat){
            for (var type in mat[position]){
                var rawAPVArray = mat[position][type];
                var apvFinalArray = [];
                var coverageArray = [];
                
                //Creates an array of armor coverage in ascending order.
                var apv;
                for (apv in rawAPVArray){
                    if (coverageArray.indexOf(rawAPVArray[apv].coverage) === -1){
                        coverageArray.push(rawAPVArray[apv].coverage);
                    }
                }
                coverageArray = coverageArray.sort(function(a,b){return a-b;});
                
                //Creates APV array per damage type per position
                var value;
                for (value in coverageArray){
                    var apvToLayerArray = [];
                    var apvValue = 0;
                    var apvCoverage = coverageArray[value];
                    
                    //Builds an array of APVs that meet or exceed the coverage value
                    apv = 0;
                    for (apv in rawAPVArray){
                        if (rawAPVArray[apv].coverage >= apvCoverage){
                            apvToLayerArray.push(rawAPVArray[apv]);
                        }
                    }
                    apvToLayerArray = apvToLayerArray.sort(function(a,b){return b-a;});
                    
                    //Adds the values at coverage value with diminishing returns on layered armor
                    value = 0;
                    for (value in apvToLayerArray){
                        apvValue += apvToLayerArray[value] * Math.pow(2, -value);
                        apvValue = Math.round(apvValue);
                    }
                    //Puts final APV and associated Coverage into final APV array for that damage type.
                    apvFinalArray.push({ value: apvValue, coverage: apvCoverage});
                }
                mat[position][type] = apvFinalArray;
            }
        }
        return mat;
    }};
MML.computeAttribute.leftHand = { dependents: ["hitTable"],
    compute: function(){
        return this.leftHand;
    }};
MML.computeAttribute.rightHand = { dependents: ["hitTable"],
    compute: function(){
        return this.rightHand;
    }};
MML.computeAttribute.hitTable = { dependents: [],
    compute: function() {
        return MML.hitTables[this.bodyType].A;   
    }};

// Movement
MML.computeAttribute.movementRatio = { dependents: ["movementRatioInitBonus"],
    compute: function(){
        var movementRatio;

        if(this.totalWeightCarried === 0){
            movementRatio = Math.round(10*this.load)/10;
        }
        else{
            movementRatio = Math.round(10*this.load/this.totalWeightCarried)/10;
        }

        if(movementRatio > 4.0){
            movementRatio = 4.0;
        }
        return movementRatio;
    }};
MML.computeAttribute.movementAvailable = { dependents: [],
    compute: function() {
        return this.movementAvailable;   
    }};
MML.computeAttribute.movementPosition = { dependents: [],
    compute: function() {
        return this.movementPosition;   
    }};

// Roll Modifiers
MML.computeAttribute.situationalMod = { dependents: [],
    compute: function() {
        return this.situationalMod;   
    }};
MML.computeAttribute.attributeDefenseMod = { dependents: [],
    compute: function() {
        return MML.attributeMods.strength[this.strength] + MML.attributeMods.coordination[this.coordination];   
    }};
MML.computeAttribute.meleeDefenseMod = { dependents: [],
    compute: function() {
        return this.meleeDefenseMod;   
    }};
MML.computeAttribute.missileDefenseMod = { dependents: [],
    compute: function() {
        return this.missileDefenseMod;   
    }};
 MML.computeAttribute.meleeAttackMod = { dependents: [],
    compute: function() {
        return this.meleeAttackMod;   
    }};
MML.computeAttribute.missileAttackMod = { dependents: [],
    compute: function() {
        return this.missileAttackMod;   
    }};
MML.computeAttribute.attributeMeleeAttackMod = { dependents: [],
    compute: function() {
        return MML.attributeMods.strength[this.strength] + MML.attributeMods.coordination[this.coordination];   
    }};
MML.computeAttribute.meleeDamageMod = { dependents: [],
    compute: function() {
        var meleeDamageMod;
        var load = this.load;

        var index;
         for(index in MML.meleeDamageMods){
             var data = MML.meleeDamageMods[index];

             if(load >= data.low && load <= data.high){
                meleeDamageMod = data.value;
                break;
             }
         }
        return meleeDamageMod;   
    }};
MML.computeAttribute.attributeMissileAttackMod = { dependents: [],
    compute: function() {
        return MML.attributeMods.perception[this.perception] + MML.attributeMods.coordination[this.coordination] + MML.attributeMods.strength[this.strength];   
    }};
MML.computeAttribute.attributeCastingMod = { dependents: [],
    compute: function() {
        var attributeCastingMod = MML.attributeMods.reason[this.reason];

        if(this.senseInitBonus < 3 || this.senseInitBonus > 0){
            attributeCastingMod -= 10;
        }
        else if(this.senseInitBonus < 0 || this.senseInitBonus > -2){
            attributeCastingMod -= 20;
        }
        else{
            attributeCastingMod -= 30;
        }

        if(this.fomInitBonus === 3 || this.fomInitBonus === 2){
            attributeCastingMod -= 5;
        }
        else if(this.fomInitBonus === 1){
            attributeCastingMod -= 10;
        }
        else if(this.fomInitBonus === 0){
            attributeCastingMod -= 15;
        }
        else if(this.fomInitBonus === -1){
            attributeCastingMod -= 20;
        }
        else if(this.fomInitBonus === -2){
            attributeCastingMod -= 30;
        }

        return attributeCastingMod;
    }};
MML.computeAttribute.spellLearningMod = { dependents: [],
    compute: function() {
        return MML.attributeMods.intellect[this.intellect];   
    }};
MML.computeAttribute.statureCheckMod = { dependents: [],
    compute: function() {
        return this.situationalMod;   
    }};
MML.computeAttribute.strengthCheckMod = { dependents: [],
    compute: function() {
        return this.situationalMod;   
    }};
MML.computeAttribute.coordinationCheckMod = { dependents: [],
    compute: function() {
        return this.situationalMod;   
    }};
MML.computeAttribute.healthCheckMod = { dependents: [],
    compute: function() {
        return this.situationalMod;   
    }};
MML.computeAttribute.beautyCheckMod = { dependents: [],
    compute: function() {
        return this.situationalMod;   
    }};
MML.computeAttribute.intellectCheckMod = { dependents: [],
    compute: function() {
        return this.situationalMod;   
    }};
MML.computeAttribute.reasonCheckMod = { dependents: [],
    compute: function() {
        return this.situationalMod;   
    }};
MML.computeAttribute.creativityCheckMod = { dependents: [],
    compute: function() {
        return this.situationalMod;   
    }};
MML.computeAttribute.presenceCheckMod = { dependents: [],
    compute: function() {
        return this.situationalMod;   
    }};
MML.computeAttribute.willpowerCheckMod = { dependents: [],
    compute: function() {
        return this.situationalMod;   
    }};
MML.computeAttribute.evocationCheckMod = { dependents: [],
    compute: function() {
        return this.situationalMod;   
    }};
MML.computeAttribute.perceptionCheckMod = { dependents: [],
    compute: function() {
        return this.situationalMod;   
    }};
MML.computeAttribute.systemStrengthCheckMod = { dependents: [],
    compute: function() {
        return this.situationalMod;   
    }};
MML.computeAttribute.fitnessCheckMod = { dependents: [],
    compute: function() {
        return this.situationalMod;   
    }};
MML.computeAttribute.statusEffects = { dependents: ["situationalInitBonus",
                 "situationalMod",
                 "missileDefenseMod",
                 "meleeDefenseMod",
                 "missileAttackMod",
                 "meleeAttackMod",
                 "perceptionCheckMod",
                 "roundsExertion"
                 ],
    compute: function() {
        _.each(this.statusEffects.dependents, function(dependent){
            this[dependent] = 0;
        }, this);
        _.each(this.statusEffects, function(effect, index){
            MML.statusEffects[effect.name].apply(this, [effect, index]);
        }, this);
        return this.statusEffects;   
    }};

// Initiative
MML.computeAttribute.initiative = { dependents: [],
    compute: function(){
         var initiative = this.initiativeRoll + 
                this.situationalInitBonus + 
                this.movementRatioInitBonus +
                this.attributeInitBonus + 
                this.senseInitBonus +
                this.fomInitBonus +
                this.firstActionInitBonus +
                this.spentInitiative;
        if(initiative < 0 ||
            state.MML.GM.roundStarted === false ||
            this.situationalInitBonus === "No Combat" || 
            this.movementRatioInitBonus === "No Combat"){
            return 0;
        }
        else{
            return initiative;
        }
    }};
MML.computeAttribute.initiativeRoll = { dependents: ["initiative"],
    compute: function(){
        return this.initiativeRoll;
    }}; 
MML.computeAttribute.situationalInitBonus = { dependents: ["initiative"],
    compute: function(){
        return this.situationalInitBonus;
    }}; 
MML.computeAttribute.movementRatioInitBonus = { dependents: ["initiative"],
    compute: function(){
        if(this.movementRatio < 0.6){
            return "No Combat";
        }
        else if (this.movementRatio === 0.6){
           return -4;
        }
        else if (this.movementRatio < 0.7 && this.movementRatio <= 0.8){
           return -3;
        }
        else if (this.movementRatio > 0.8 && this.movementRatio <= 1.0){
           return -2;
        }
        else if (this.movementRatio > 1.0 && this.movementRatio <= 1.2){
           return -1;
        }
        else if (this.movementRatio > 1.2 && this.movementRatio <= 1.4){
           return 0;
        }
        else if (this.movementRatio > 1.4 && this.movementRatio <= 1.7){
           return 1;
        }
        else if (this.movementRatio > 1.7 && this.movementRatio <= 2.0){
           return 2;
        }
        else if (this.movementRatio > 2.0 && this.movementRatio <= 2.5){
           return 3;
        }
        else if (this.movementRatio > 2.5 && this.movementRatio <= 3.2){
           return 4;
        }
        else if (this.movementRatio > 3.2){
           return 5;
        }
    }};  
MML.computeAttribute.attributeInitBonus = { dependents: ["initiative"],
    compute: function(){
        var attributeArray = [this.strength, this.coordination, this.reason, this.perception];
        var rankingAttribute = attributeArray.sort(function(a,b){return a-b;})[0];
        
        if (rankingAttribute <= 9){
            return -1;
        }
        else if (rankingAttribute === 10 || rankingAttribute === 11){
            return 0;
        }
        else if (rankingAttribute === 12 || rankingAttribute === 13){
            return 1;
        }
        else if (rankingAttribute === 14 || rankingAttribute === 15){
            return 2;
        }
        else if (rankingAttribute === 16 || rankingAttribute === 17){
            return 3;
        }
        else if (rankingAttribute === 18 || rankingAttribute === 19){ 
            return 4;
        }
        else if (rankingAttribute >= 20){
            return 5;
        }
            }};  
MML.computeAttribute.senseInitBonus = {
    dependents: ["initiative",
                "attributeCastingMod"],
    compute: function(){
        var armorList = _.where(this.inventory, {type: "armor"});    
        var bitsOfHelm = ["Barbute Helm", "Bascinet Helm", "Camail", "Camail-Conical", "Cap", "Cheeks", "Conical Helm", "Duerne Helm", "Dwarven War Hood", "Face Plate", "Great Helm", "Half-Face Plate", "Hood", "Nose Guard", "Pot Helm", "Sallet Helm", "Throat Guard", "War Hat"];
        var senseArray = [];
        
        _.each(bitsOfHelm, function(bit){
            _.each(armorList, function(piece){
                if (bit === piece.name){
                    senseArray.push(bit);
                }
            });
        });

        //nothing on head
        if (senseArray.length === 0){
            return 4;
        }
        else {
            //Head fully encased in metal
            if (senseArray.indexOf("Great Helm") !== -1 || (senseArray.indexOf("Sallet Helm") !== -1 && senseArray.indexOf("Throat Guard") !== -1)){
                return -2;
            }
            //wearing a helm
            else if (senseArray.indexOf("Barbute Helm") !== -1 || senseArray.indexOf("Sallet Helm") !== -1 || senseArray.indexOf("Bascinet Helm") !== -1 || senseArray.indexOf("Duerne Helm") !== -1 || senseArray.indexOf("Cap") !== -1 || senseArray.indexOf("Pot Helm") !== -1 || senseArray.indexOf("Conical Helm") !== -1 || senseArray.indexOf("War Hat") !== -1){
                //Has faceplate
                if (senseArray.indexOf("Face Plate") !== -1 ){
                    //Enclosed Sides
                    if (senseArray.indexOf("Barbute Helm") !== -1 || senseArray.indexOf("Bascinet Helm") !== -1 || senseArray.indexOf("Duerne Helm") !== -1){
                        return -2;
                    }
                    else {
                        return -1;
                    }
                }
                //These types of helms or half face plate
                else if (senseArray.indexOf("Barbute Helm") !== -1 || senseArray.indexOf("Sallet Helm") !== -1 || senseArray.indexOf("Bascinet Helm") !== -1 || senseArray.indexOf("Duerne Helm") !== -1 || senseArray.indexOf("Half-Face Plate") !== -1){
                    return 0;
                }
                //has camail or cheeks
                else if (senseArray.indexOf("Camail") !== -1 || senseArray.indexOf("Camail-Conical") !== -1 || senseArray.indexOf("Cheeks") !== -1){
                    return 1;
                }
                //Wearing a hood
                else if (senseArray.indexOf("Dwarven War Hood") !== -1 || senseArray.indexOf("Hood") !== -1){
                    _.each(armorList, function(piece){
                        if (piece.name === "Dwarven War Hood" || piece.name === "Hood"){
                            if (piece.family === "Cloth"){
                                return 2;
                            }
                            else {
                                return 1;
                            }
                        }
                    });
                }  
                //has nose guard
                else if (senseArray.indexOf("Nose Guard") !== -1){
                    return 2;
                }
                // just a cap
                else {
                    return 3;
                }
            }
            //Wearing a hood
            else if (senseArray.indexOf("Dwarven War Hood") !== -1 || senseArray.indexOf("Hood") !== -1){
                _.each(armorList, function(piece){
                    if (piece.name === "Dwarven War Hood" || piece.name === "Hood"){
                        if (piece.family === "Cloth"){
                            return 2;
                        }
                        else {
                            return 1;
                        }
                    }
                });
            }
        }
    }};  
MML.computeAttribute.fomInitBonus = { 
    dependents: ["initiative",
                "attributeCastingMod"],
    compute: function(){
        return this.fomInitBonus;
    }};  
MML.computeAttribute.firstActionInitBonus = { 
    dependents: ["initiative"],
    compute: function(){
        if(state.MML.GM.roundStarted === false){
            this.firstActionInitBonus = this.action.initBonus;
        }
        return this.firstActionInitBonus;
    }};
MML.computeAttribute.spentInitiative = { 
    dependents: ["initiative"],
    compute: function(){
        return this.spentInitiative;
    }};
MML.computeAttribute.actionTempo = { 
    dependents: [],
    compute: function(){
        var tempo;

        if (this.action.skill < 30){ tempo = 0; }
        else if (this.action.skill < 40){ tempo = 1; }
        else if (this.action.skill < 50){ tempo = 2; }
        else if (this.action.skill < 60){ tempo = 3; }
        else if (this.action.skill < 70){ tempo = 4; }
        else{ tempo = 5; }
        
        // If Dual Wielding
        if (this.action.name === "Attack" && MML.isDualWielding(this)){
            var twfSkill = this.weaponskills["Two Weapon Fighting"].level;
            if (twfSkill > 19 && twfSkill){ tempo += 1; }
            else if (twfSkill >= 40 && twfSkill < 60){ tempo += 2; }
            else if (twfSkill >= 60){ tempo += 3; }
            // If Dual Wielding identical weapons
            if (this.inventory[this.leftHand._id].name === this.inventory[this.rightHand._id].name){ tempo += 1; }   
        }
        return MML.attackTempoTable[tempo];
    }};

// Combat
MML.computeAttribute.ready = { 
    dependents: [],
    compute: function(){
        if(state.MML.GM.inCombat === true && this.ready === false){
            MML.getTokenFromChar(this.name).set("tint_color", "#FF0000");
        }
        else{
            MML.getTokenFromChar(this.name).set("tint_color", "transparent");
        }
        return this.ready;
    }};
MML.computeAttribute.action = { 
    dependents: ["firstActionInitBonus",
                "actionTempo",
                "statusEffects"],
    compute: function(){
        var initBonus = 10;

        if(this.action.name === "Attack"){
            var leftHand = MML.getWeaponFamily(this, "leftHand");
            var rightHand = MML.getWeaponFamily(this, "rightHand");
            
            if(leftHand === "unarmed" && rightHand === "unarmed"){
                this.action.skill = 0; //this.weaponSkills["Brawling"].level or this.weaponSkills["Default Martial Skill"].level;
            }
            else if(leftHand !== "unarmed" && rightHand !== "unarmed"){
                var weaponInits = [this.inventory[this.leftHand._id].grips[this.leftHand.grip].initiative,
                                   this.inventory[this.rightHand._id].grips[this.rightHand.grip].initiative];
                initBonus = _.min(weaponInits);
                // this.action.skill = this.weaponSkills.[this.inventory[this.leftHand._id].name].level or this.weaponSkills["Default Martial Skill"].level;
                //Dual Wielding
            }
            else if(rightHand !== "unarmed" && leftHand === "unarmed"){
                initBonus = this.inventory[this.rightHand._id].grips[this.rightHand.grip].initiative;
            }
            else{
                initBonus = this.inventory[this.leftHand._id].grips[this.leftHand.grip].initiative;
                //this.action.skill = this.weaponSkills.[this.inventory[this.leftHand._id].name].level or this.weaponSkills["Default Martial Skill"].level;                    
            }
        }
        this.action.initBonus = initBonus;

        _.each(this.action.modifiers, function(modifier){
            this.statusEffects[modifier] = { name: modifier };
        }, this);

        return this.action;
    }};
MML.computeAttribute.defensesThisRound = { 
    dependents: [],
    compute: function(){
        return this.defensesThisRound;
    }};
MML.computeAttribute.dodgedThisRound = { dependents: ["situationalInitBonus"],
    compute: function(){
        return this.dodgedThisRound;
    }};
MML.computeAttribute.meleeThisRound = { dependents: [],
    compute: function(){
        return this.meleeThisRound;
    }};
MML.computeAttribute.fatigueLevel = { dependents: ["statusEffects"],
    compute: function(){
        return this.fatigueLevel;
    }};
MML.computeAttribute.roundsRest = { dependents: [],
    compute: function(){
        return this.roundsRest;
    }};    
MML.computeAttribute.roundsExertion = { dependents: [],
    compute: function(){
        return this.roundsExertion;
    }};
MML.computeAttribute.damagedThisRound = { dependents: [],
    compute: function(){
        return this.damagedThisRound;
    }};

// Skills
MML.computeAttribute.skills = { dependents: [],
    compute: function(){
        var characterSkills = MML.getSkillAttributes(this.name, "skills");
        _.each(
            characterSkills,
            function(characterSkill, skillName){
                var level = characterSkill.input;       
                var attribute = MML.skills[skillName].attribute;

                level += MML.attributeMods[attribute][this[attribute]];

                if(_.isUndefined(MML.skillMods[this.race]) === false && _.isUndefined(MML.skillMods[this.race][skillName]) === false){
                    level += MML.skillMods[this.race][skillName];
                }
                if(_.isUndefined(MML.skillMods[this.gender]) === false && _.isUndefined(MML.skillMods[this.gender][skillName]) === false){
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
    }};
MML.computeAttribute.weaponSkills = { dependents: [],
    compute: function(){
        var characterSkills = MML.getSkillAttributes(this.name, "weaponskills");
        var highestSkill;

        _.each(
            characterSkills,
            function(characterSkill, skillName){
                var level = characterSkill.input;

                // This may need to include other modifiers
                if(_.isUndefined(MML.weaponSkillMods[this.race]) === false && _.isUndefined(MML.weaponSkillMods[this.race][skillName]) === false){
                    level += MML.weaponSkillMods[this.race][skillName];
                }
                characterSkill.level = level;
            },
            this
        );

        highestSkill = _.max(characterSkills, function(skill){ return skill.level; }).level;
        if(isNaN(highestSkill)){
            highestSkill = 0;
        }

        if(_.isUndefined(characterSkills["Default Martial"])){
            characterSkills["Default Martial"] = { input: 0, level: 0, _id: generateRowID() };
        }

        if(highestSkill < 20){
            characterSkills["Default Martial"].level = 1;
        }
        else{
            characterSkills["Default Martial"].level = Math.round(highestSkill/2);
        }

        _.each(
            characterSkills,
            function(characterSkill, skillName){
                MML.setCurrentAttribute(this.name, "repeating_weaponskills_" + characterSkill._id + "_name", skillName);
                MML.setCurrentAttribute(this.name, "repeating_weaponskills_" + characterSkill._id + "_input", characterSkill.input);
                MML.setCurrentAttribute(this.name, "repeating_weaponskills_" + characterSkill._id + "_level", characterSkill.level);
            },
            this
        );

        this.weaponSkills = characterSkills;
        return characterSkills;
    }};
