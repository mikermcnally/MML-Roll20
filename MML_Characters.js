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
    this.castingMod = MML.getCurrentAttributeAsFloat(this.name, "castingMod");
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
        attributeArray = _.union(attributeArray, localAttribute.dependents);    
    }
    // log(attributeArray);
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
                "bodyType"],
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
                "attributeInitBonus"],
    compute: function(){
        return MML.getCurrentAttributeAsFloat(this.name, "strengthRoll") + MML.racialAttributeBonuses[this.race].strength;
    } };
MML.computeAttribute.coordination = { dependents: ["attributeMeleeAttackMod",
                "attributeMissileAttackMod",
                "attributeDefenseMod",
                "attributeInitBonus"], //skill mods
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
                "epRecovery"
                ], 
    compute: function(){
        return MML.getCurrentAttributeAsFloat(this.name, "healthRoll") + MML.racialAttributeBonuses[this.race].health;
    } };
MML.computeAttribute.beauty = { dependents: [], //skill mods
    compute: function(){
        return MML.getCurrentAttributeAsFloat(this.name, "beautyRoll") + MML.racialAttributeBonuses[this.race].beauty;
    } };
MML.computeAttribute.intellect = { dependents: ["perception",
                "evocation",
                "spellLearningMod"], //spell learning/skill mods
    compute: function(){
        return MML.getCurrentAttributeAsFloat(this.name, "intellectRoll") + MML.racialAttributeBonuses[this.race].intellect;
    } };
MML.computeAttribute.reason = { dependents: ["perception",
                "evocation",
                "castingMod",
                "attributeInitBonus"], //skill mods
    compute: function(){
        return MML.getCurrentAttributeAsFloat(this.name, "reasonRoll") + MML.racialAttributeBonuses[this.race].reason;
    } };
MML.computeAttribute.creativity = { dependents: ["perception",
                "evocation"], //skill mods
    compute: function(){
        return MML.getCurrentAttributeAsFloat(this.name, "creativityRoll") + MML.racialAttributeBonuses[this.race].creativity;
    } };
MML.computeAttribute.presence = { dependents: ["willpower",
                "systemStrength"],
    compute: function(){
        return MML.getCurrentAttributeAsFloat(this.name, "presenceRoll") + MML.racialAttributeBonuses[this.race].presence;
    } };

// Secondary Attributes
MML.computeAttribute.willpower = { dependents: ["evocation",
                "multiWound"],
    compute: function(){
        return Math.round((2*this.presence + this.health)/3);
    } };
MML.computeAttribute.evocation = { dependents: ["epMax"], //skill mods
    compute: function(){
        return this.intellect + 
                this.reason + 
                this.creativity + 
                this.health + 
                this.willpower + 
                MML.racialAttributeBonuses[this.race].evocation;
    } };
MML.computeAttribute.perception = { dependents: ["missileAttackMod",
                "attributeInitBonus"],
    compute: function(){
        return Math.round((this.intellect + this.reason + this.creativity)/3) + MML.racialAttributeBonuses[this.race].perception;
    } };
MML.computeAttribute.systemStrength = { dependents: [], 
    compute: function(){
        return Math.round((this.presence + 2*this.health)/3);
    } };
MML.computeAttribute.fitness = { dependents: ["fitnessMod", "fatigueMax"], //skill mods
    compute: function(){
        return Math.round((this.health + this.strength)/2) + MML.racialAttributeBonuses[this.race].fitness;
    }};
MML.computeAttribute.fitnessMod = { dependents: ["load"], //skill mods
    compute: function(){
        return MML.fitnessModLookup[this.fitness];
    }};
MML.computeAttribute.load = { dependents: ["overhead",
                "deadLift",
                "meleeDamageMod",
                "movementRatio"],
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
MML.computeAttribute.ep = { dependents: [],
    compute: function(){
        return this.ep;
    }};
MML.computeAttribute.fatigueMax = { dependents: ["fatigue"],
    compute: function(){
        var fatigueMax = this.fitness;
        this.fatigue = fatigueMax;
        return fatigueMax;
    }};
MML.computeAttribute.fatigue = { dependents: [],
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
        var movementRatio = Math.round(10*this.load/this.totalWeightCarried)/10;
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
MML.computeAttribute.castingMod = { dependents: [],
    compute: function() {
        var castingMod = MML.attributeMods.reason[this.reason];

        if(this.senseInitBonus < 3 || this.senseInitBonus > 0){
            castingMod -= 10;
        }
        else if(this.senseInitBonus < 0 || this.senseInitBonus > -2){
            castingMod -= 20;
        }
        else{
            castingMod -= 30;
        }

        if(this.fomInitBonus === 3 || this.fomInitBonus === 2){
            castingMod -= 5;
        }
        else if(this.fomInitBonus === 1){
            castingMod -= 10;
        }
        else if(this.fomInitBonus === 0){
            castingMod -= 15;
        }
        else if(this.fomInitBonus === -1){
            castingMod -= 20;
        }
        else if(this.fomInitBonus === -2){
            castingMod -= 30;
        }

        return castingMod;
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
MML.computeAttribute.senseInitBonus = { dependents: ["initiative",
                "castingMod"],
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
MML.computeAttribute.fomInitBonus = { dependents: ["initiative",
                "castingMod"],
    compute: function(){
        return this.fomInitBonus;
    }};  
MML.computeAttribute.firstActionInitBonus = { dependents: ["initiative"],
    compute: function(){
        if(state.MML.GM.roundStarted === false){
            this.firstActionInitBonus = this.action.initBonus;
        }
        return this.firstActionInitBonus;
    }};
MML.computeAttribute.spentInitiative = { dependents: ["initiative"],
    compute: function(){
        return this.spentInitiative;
    }};
MML.computeAttribute.actionTempo = { dependents: [],
    compute: function(){
        var tempo;

        if (this.action.skill < 30){ tempo = 0; }
        else if (this.action.skill < 40){ tempo = 1; }
        else if (this.action.skill < 50){ tempo = 2; }
        else if (this.action.skill < 60){ tempo = 3; }
        else if (this.action.skill < 70){ tempo = 4; }
        else{ tempo = 5; }
        
        // If Dual Wielding
        if (this.action.name === "Attack" && MML.isDualWielding.apply(this,[])){
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
MML.computeAttribute.ready = { dependents: [],
    compute: function(){
        if(state.MML.GM.inCombat === true && this.ready === false){
            MML.getTokenFromChar(this.name).set("tint_color", "#FF0000");
        }
        else{
            MML.getTokenFromChar(this.name).set("tint_color", "transparent");
        }
        return this.ready;
    }};
MML.computeAttribute.action = { dependents: ["firstActionInitBonus",
                "actionTempo",
                "statusEffects"],
    compute: function(){
        var initBonus = 10;

        if(this.action.name === "Attack"){
            var leftHand = MML.getWeaponFamily.apply(this, ["leftHand"]);
            var rightHand = MML.getWeaponFamily.apply(this, ["rightHand"]);
            
            if(leftHand === "Not a Weapon" && rightHand === "Not a Weapon"){
                this.action.skill = 0; //this.weaponSkills["Brawling"].level or this.weaponSkills["Default Martial Skill"].level;
            }
            else if(leftHand !== "Not a Weapon" && rightHand !== "Not a Weapon"){
                var weaponInits = [this.inventory[this.leftHand._id].grips[this.leftHand.grip].initiative,
                                   this.inventory[this.rightHand._id].grips[this.rightHand.grip].initiative];
                initBonus = _.min(weaponInits);
                // this.action.skill = this.weaponSkills.[this.inventory[this.leftHand._id].name].level or this.weaponSkills["Default Martial Skill"].level;
                //Dual Wielding
            }
            else if(rightHand !== "Not a Weapon" && leftHand === "Not a Weapon"){
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
MML.computeAttribute.defensesThisRound = { dependents: [],
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
            function(characterSkill, _id){
                var skillName = characterSkill.name;
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
                MML.setCurrentAttribute(charName, "repeating_skills_" + _id + "_level", level);
            },
            this
        );

        this.skills = characterSkills;
        return characterSkills;
    }};
MML.computeAttribute.weaponSkills = { dependents: [],
    compute: function(){
        var characterSkills = MML.getSkillAttributes(this.name, "weaponskills");
        _.each(
            characterSkills,
            function(characterSkill, _id){
                var weaponName = characterSkill.name;
                var level = characterSkill.input;

                if(_.isUndefined(MML.weaponSkillMods[this.race]) === false && _.isUndefined(MML.weaponSkillMods[this.race][weaponName]) === false){
                    level += MML.weaponSkillMods[this.race][weaponName];
                }
                characterSkill.level = level;
                MML.setCurrentAttribute(charName, "repeating_weaponskills_" + _id + "_level", level);
            },
            this
        );

        this.weaponSkills = characterSkills;
        return characterSkills;
    }};


MML.updateInventory = function updateInventory(charName){
    //Armor
    var armor = [];
    var item = MML.getCharAttribute(this.name, "repeating_item_0_armorStyleName");
    var index = 0;
    while(typeof item !== "undefined"){
        armor[index] = { style: "", material: "", quality: "" };
        index++;
        item = MML.getCharAttribute(charName, "repeating_armor_" + index + "_armorStyleName");
    }
    
    //Weapons
    item = MML.getCharAttribute(charName, "repeating_weapons_0_weaponName");
    index = 0;
    var weapons = [];
    var left = false;
    var right = false;
    while(typeof item !== "undefined"){
        weapons[index] = MML.weaponStats[MML.getCharAttribute(charName, "repeating_weapons_" + index + "_weaponName").get("current")];
        weapons[index].equipped = MML.getCharAttribute(charName, "repeating_weapons_" + index + "_weaponEquipped").get("current");
        weapons[index].quality = MML.getCharAttribute(charName, "repeating_weapons_" + index + "_weaponQuality").get("current");
        
        if (weapons[index].equipped === "Both"){
            if(right === false && left === false){
                left = true;
                right = true;
                state.MML.GM.characters[charName].inventory.weapons.push(weapons[index]);
            }
            else {
                state.MML.GM.characters[charName].error = "Equipment Conflict: Hands Full";
            }
            
        }
        else if(weapons[index].equipped === "Right"){
            if(right === false){
                right = true;
                state.MML.GM.characters[charName].inventory.weapons.push(weapons[index]);
            }
            else {
                state.MML.GM.characters[charName].error = "Equipment Conflict: Hands Full";
            }
        }
        else if(weapons[index].equipped === "Left"){
            if(left === false){
                left = true;
                state.MML.GM.characters[charName].inventory.weapons.push(weapons[index]);
            }
            else {
                state.MML.GM.characters[charName].error = "Equipment Conflict: Hands Full";
            }
        }
        else{
            state.MML.GM.characters[charName].inventory.inPack.push(weapons[index]);
        }
        index++;
        item = MML.getCharAttribute(charName, "repeating_weapons_" + index + "_weaponName");
    }

    //Shields
    if(MML.getCharAttribute(charName, "shieldEquipped") === "Right"){
        if(right === false){
            right = true;
            state.MML.GM.characters[charName].inventory.shield = MML.shieldStats[MML.getCharAttribute(charName, "shieldName")];
        }
        else {
            state.MML.GM.characters[charName].error = "Equipment Conflict: Hands Full";
        }
    }
    else if(MML.getCharAttribute(charName, "shieldEquipped") === "Left"){
        if(left === false){
            left = true;
            state.MML.GM.characters[charName].inventory.shield = MML.shieldStats[MML.getCharAttribute(charName, "shieldName")];
        }
        else {
            state.MML.GM.characters[charName].error = "Equipment Conflict: Hands Full";
        }
    }
    else{
        state.MML.GM.characters[charName].inventory.inPack.push(MML.shieldStats[MML.getCharAttribute(charName, "shieldName")]);
    }
        
    //Other items
    

    //This looks at the character's stuff and decides which column on hit table to use (A, B, or C)
    if(state.MML.GM.characters[charName].inventory.weapons.length === 0){
        state.MML.GM.characters[charName].defense.hitTable = "A";
    }
    else if (state.MML.GM.characters[charName].inventory.weapons.length === 2){
        state.MML.GM.characters[charName].defense.hitTable = "B";
    }
    else if(state.MML.GM.characters[charName].inventory.shield !== "None"){
        state.MML.GM.characters[charName].defense.hitTable = "C";
    }
    else if(MML.weaponStats[state.MML.GM.characters[charName].inventory.weapons[0]].family === "MWD" || 
    MML.weaponStats[state.MML.GM.characters[charName].inventory.weapons[0]].family === "MWM" ||
    MML.weaponStats[state.MML.GM.characters[charName].inventory.weapons[0]].family === "TWH" || 
    MML.weaponStats[state.MML.GM.characters[charName].inventory.weapons[0]].family === "TWK" || 
    MML.weaponStats[state.MML.GM.characters[charName].inventory.weapons[0]].family === "TWS" || 
    MML.weaponStats[state.MML.GM.characters[charName].inventory.weapons[0]].family === "SLI"){
        state.MML.GM.characters[charName].defense.hitTable = "A";
    }
    else if(MML.weaponStats[state.MML.GM.characters[charName].inventory.weapons[0]].hands === 2){
        state.MML.GM.characters[charName].defense.hitTable = "B";
    }
    else{
        state.MML.GM.characters[charName].defense.hitTable = "A";
    }
};

//Combat Functions
MML.displayMovement = function displayMovement(input){
    if(input.display){
        MML.getTokenFromChar(this.name).set("aura1_radius", MML.movementRates[this.race][this.movementPosition]*this.movementAvailable);
        MML.getTokenFromChar(this.name).set("aura1_color", "#00FF00");
    }
    else{
        MML.getTokenFromChar(this.name).set("aura1_color", "transparent");
    }
};

MML.moveDistance = function moveDistance(distance){
    this.movementAvailable -= (distance)/(MML.movementRates[this.race][this.movementPosition]);
    MML.displayMovement.apply(this, [true]);
};

MML.computeSitMods = function computeSitMods(){
    var initiative = 0;
    var situational  = 0;
    var defense  = 0;
    var attack  = 0;
    var casting  = 0;

    //Apply wound effects
    var i;
    for(i in MML.hitPoints){
        if(MML.hitPoints[i].name !== "multiWound"){
            if(this[MML.hitPoints[i].name].wound.major === true){
                initiative += -5;
                if(this[MML.hitPoints[i].name].wound.major.duration > 0){
                    situational  += -10;
                }
            }
            if(this[MML.hitPoints[i].name].wound.disabling === true){
                initiative += -10;
                situational  += -25;
            }
        }
        else{
            if(this[MML.hitPoints[i].name].wound === true){
                initiative += -5;
                situational  += -10;
            }
        }
    }

    //Compute action-based initiative bonus
    switch(this.action.name){
        case "attack":
            //Weapon
            if(this.inventory.weapons.length === 0){
                //Unarmed
                initiative  += 10;
                this.action.skill = this.skills["brawling"];
            }
            else if(this.inventory.weapons.length === 2){
                //Dual Wielding
                var weaponInits = [MML.weaponStats[this.inventory.equipped.leftHand.name].initiative, MML.weaponStats[this.inventory.equipped.rightHand.name].initiative];
                initiative  += weaponInits.sort(function(a,b){return b-a;})[0];
                //Set action skill here
            }
            else{
                initiative  += MML.weaponStats[this.inventory.weapons[0].name].initiative;
                this.action.skill = this.skills[this.inventory.weapons[0].name];
            }
            if (this.action.calledShot === "head" || 
            this.action.calledShot === "chest" || 
            this.action.calledShot === "abdomen" || 
            this.action.calledShot === "leftArm" || 
            this.action.calledShot === "rightArm" || 
            this.action.calledShot === "leftLeg" || 
            this.action.calledShot === "rightLeg"){
                defense  += -10;
                attack  += -10;
                initiative  += -5;
            }
            
            else if (this.action.calledShot !== "standard"){ //Specific hit position
                defense  += -10;
                attack  += -30;
                initiative  += -5;
            }
            
            // Attack style
            if (this.action.style === "sweep"){
                defense  += -20;
            }
            else if (this.action.style === "cover"){
                attack  += -10;
            }
            break;
            
        case "ready":
            initiative  += 10;
            break;
        case "cast":
            initiative  += 10;
            break;
        case "observe":
            initiative  += 10;
            break;
    }
    
    //Action skill bonus
    if (this.action.skill <= 9){
        initiative  += 0;
    }
    else if (this.action.skill > 9 && this.action.skill <= 19){
        initiative  +=  1;
    }
    else if (this.action.skill > 19 && this.action.skill <= 29){
        initiative  += 2;
    }
    else if (this.action.skill > 29 && this.action.skill <= 39){
        initiative  += 3;
    }
    else if (this.action.skill > 39 && this.action.skill <= 49){
        initiative  += 4;
    }
    else if (this.action.skill > 49 && this.action.skill <= 59){
        initiative  += 5;
    }
    else if (this.action.skill > 59){
        initiative  += 6;
    }

    MML.setAttackTempo(this.name);
    
    // Compute defense mod
    defense  = -20 * this.defense.number;
    
    // Apply fatigue
    initiative  += -5*this.fatigue.level;
    situational  += -10*this.fatigue.level;
    
    // Apply sensitive area effect
    if (this.sensitive > -1){
        initiative  += -5;
        situational  += -10;
    }
    // Apply stumble effects from knockdown
    if (this.stumble > -1){
        initiative  += -5;
    }
    
    this.initiative.situational = initiative;
    this.modifiers.situational = situational;
    this.modifiers.defense = defense;
    this.modifiers.attack = attack;
    this.modifiers.casting = casting;
};

MML.newRoundUpdateCharacter = function newRoundUpdateCharacter(input){
    //Update wound counters, only major wounds have temporary effects. Disabling wound stun is handled with the .stun.duration property
    // var i;
    // for(i in MML.hitPoints){
    //  if(MML.hitPoints[i].name !== "multiWound"){
    //      if(this[MML.hitPoints[i].name].wound.major.duration > 0){
    //          this[MML.hitPoints[i].name].wound.major.duration--;
    //      }
    //  }
    // }
    // if(this.stun.duration > 0){ //if stun === -1, then stun is over
    //  this.stun.duration--;
    // }
    
    // Handle fatigue don't use the fitness score to track fatigue, just use the combat state
    if (this.meleeThisRound === true){ // Character acted in melee
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "setApiCharAttribute",
            input: {
                attribute: "roundsExertion",
                value: this.roundsExertion + 1
            }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "setApiCharAttribute",
            input: {
                attribute: "roundsRest",
                value: 0
            }
        });

        if (this.fatigueLevel < 1){
            if (this.roundsExertion > this.fitness){
                if (MML.attributeCheckRoll(charName, "fitness", [0])){
                    MML.processCommand({
                        type: "character",
                        who: this.name,
                        triggeredFunction: "setApiCharAttribute",
                        input: {
                            attribute: "fatigueLevel",
                            value: this.fatigueLevel + 1
                        }
                    });
                    MML.processCommand({
                        type: "character",
                        who: this.name,
                        triggeredFunction: "setApiCharAttribute",
                        input: {
                            attribute: "roundsExertion",
                            value: 0
                        }
                    });
                }
            }
        }
        else {
            if (this.roundsExertion > Math.round(this.fitness/2)){
                if (MML.attributeCheckRoll(charName, "fitness", [-4])){
                    MML.processCommand({
                        type: "character",
                        who: this.name,
                        triggeredFunction: "setApiCharAttribute",
                        input: {
                            attribute: "fatigueLevel",
                            value: this.fatigueLevel + 1
                        }
                    });
                    MML.processCommand({
                        type: "character",
                        who: this.name,
                        triggeredFunction: "setApiCharAttribute",
                        input: {
                            attribute: "roundsExertion",
                            value: 0
                        }
                    });
                }
            }
        }

        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "setApiCharAttribute",
            input: {
                attribute: "meleeThisRound",
                value: false
            }
        });
    }
    else if (this.fatigueLevel > 0){
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "setApiCharAttribute",
            input: {
                attribute: "roundsRest",
                value: this.roundsRest + 1
            }
        });
        if (this.roundsRest >= 6 && this.attributeCheckRoll("health", [0])){
            MML.processCommand({
                type: "character",
                who: this.name,
                triggeredFunction: "setApiCharAttribute",
                input: {
                    attribute: "roundsRest",
                    value: 0
                }
            });
            this.fatigueLevel--;
            this.updateCharacter("fatigueLevel");
            MML.processCommand({
                type: "character",
                who: this.name,
                triggeredFunction: "setApiCharAttribute",
                input: {
                    attribute: "fatigueLevel",
                    value: this.fatigueLevel - 1
                }
            });
            MML.processCommand({
                type: "character",
                who: this.name,
                triggeredFunction: "setApiCharAttribute",
                input: {
                    attribute: "roundsExertion",
                    value: 0
                }
            });
        }
    }
    // Reset number of defenses counter
    MML.processCommand({
        type: "character",
        who: this.name,
        triggeredFunction: "setApiCharAttribute",
        input: {
            attribute: "defensesThisRound",
            value: 0
        }
    });
    MML.processCommand({
        type: "character",
        who: this.name,
        triggeredFunction: "setApiCharAttribute",
        input: {
            attribute: "dodgedThisRound",
            value: false
        }
    });
    // Reset knockdown number
    MML.processCommand({
        type: "character",
        who: this.name,
        triggeredFunction: "setApiCharAttribute",
        input: {
            attribute: "knockdown",
            value: this.knockdownMax
        }
    });
    MML.processCommand({
        type: "character",
        who: this.name,
        triggeredFunction: "setApiCharAttribute",
        input: {
            attribute: "spentInitiative",
            value: 0
        }
    });
    this.action = {};

    MML.processCommand({
        type: "character",
        who: this.name,
        triggeredFunction: "setApiCharAttribute",
        input: {
            attribute: "ready",
            value: false
        }
    });
};

MML.setReady = function setReady(ready){
    if(state.MML.GM.inCombat === true && this.ready === "false"){
        MML.getTokenFromChar(this.name).set("tint_color", "#FF0000");
    }
    else{
        MML.getTokenFromChar(this.name).set("tint_color", "transparent");
    }
    return this.ready;
};

// Health and Wounds
MML.alterHP = function alterHP(position, hpAmount){
    var woundInfo = { bodyPart: MML.hitPositions[position].part, type: "none", duration: -1 };
    
    if(hpAmount < 0){ //if damage
        var initialHP = this[woundInfo.bodyPart].current;
        var currentHP = initialHP + hpAmount;
        this[woundInfo.bodyPart].current = currentHP;
        //Wounds
        if(currentHP < Math.round(this[woundInfo.bodyPart].max/2) && currentHP >= 0){//Major wound
            woundInfo.type = "major";
            if(initialHP >= Math.round(this[woundInfo.bodyPart].max/2) && this[woundInfo.bodyPart].wound.major === {}){ //Fresh wound
                woundInfo.duration = Math.round(this[woundInfo.bodyPart].max/2) - currentHP;
            }
            else{ //Add damage to duration of effect
                woundInfo.duration = -hpAmount;
            }
        }
        
        else if(currentHP < 0 && currentHP > -this[woundInfo.bodyPart].max){//Disabling wound           
            if(this[woundInfo.bodyPart].wound.disabling === {} ){ //Fresh wound
                woundInfo.type = "disabling";
                woundInfo.duration = -currentHP;
                
            }
            else{ //Add damage to duration of effect
                woundInfo.type = "disabling";
                woundInfo.duration = -hpAmount;
            }
            
        }
        
        else if(currentHP < -this[woundInfo.bodyPart].max){//Mortal wound
            woundInfo.type = "mortal";
        }
    }
    else{ //if healing
        this[woundInfo.bodyPart].current += hpAmount;
        
        if(this[woundInfo.bodyPart].current >= -1*this[woundInfo.bodyPart].max){
            this[woundInfo.bodyPart].wound.mortal = false;
        }
        if(this[woundInfo.bodyPart].current >= 0){
            this[woundInfo.bodyPart].wound.disabling = false;
        }
        if(this[woundInfo.bodyPart].current >= Math.round(this[woundInfo.bodyPart].max/2)){
            this[woundInfo.bodyPart].wound.major = {};
        }
        if(this[woundInfo.bodyPart].current > this[woundInfo.bodyPart].max){
            this[woundInfo.bodyPart].current = this[woundInfo.bodyPart].max;
        }
    }
    return woundInfo;
};

MML.setMultiWound = function setMultiWound(){
    var current = this.multiWound.max;
    var woundInfo = { bodyPart: "multiWound", type: "none", duration: -1 };
    
    var i;
    for(i in MML.hitPoints){
        if(MML.hitPoints[i].name !== "multiWound"){
            if(this[MML.hitPoints[i].name].current >= Math.round(this[MML.hitPoints[i].name].max/2)){ //Only minor wounds apply
                current -= this[MML.hitPoints[i].name].max - this[MML.hitPoints[i].name].current;
            }
            else{
                current -= this[MML.hitPoints[i].name].max - Math.round(this[MML.hitPoints[i].name].max/2);
            }
        }
    }
    
    if(this.multiWound.current < 0 && this.multiWound.wound === false){
        woundInfo.type = "multiWound";
    }
    else if(this.multiWound.current >= 0){
        this.multiWound.wound = false;
    }
    this.multiWound.current = current;
    return woundInfo;
};

MML.woundRoll = function woundRoll(woundInfo){
    var roll;

    switch(woundInfo.type){
        case "major":
            roll = this.attributeCheckRoll("willpower", [0]);
            roll.title = this.name + "'s major wound willpower save";
            break;
        case "disabling":
            roll = this.attributeCheckRoll("systemStrength", [0]);
            roll.title = this.name + "'s disabling wound system strength save";
            break;
        case "mortal":
            roll = this.attributeCheckRoll("systemStrength", [0]);
            roll.title = this.name + "'s mortal wound system strength save";
            break;
        case "multiWound":
            roll = this.attributeCheckRoll("willpower", [0]);
            roll.title = this.name + "'s wound fatigue willpower save";
            break;
        default:
        break;
    }
    woundInfo.name = roll.name;
    woundInfo.result = roll.result;
    woundInfo.target = roll.target;
    woundInfo.range = roll.range;
    woundInfo = roll;
    return woundInfo;
};

MML.checkKnockdown = function checkKnockdown(damage){
    if (this.movementPosition !== "Prone"){
        this.knockdown += damage;
        this.updateCharacter("knockdown");
    }
};

MML.knockdownRoll = function knockdownRoll(){
    var roll;

    if(MML.hasStatusEffect.apply(this, ["Stumbling"])){
        //victim saved first knockdown check, harder to save 2nd time
        roll = MML.attributeCheckRoll(this, ["systemStrength", [-5]]);
    }   
    else{
        roll = MML.attributeCheckRoll(this, ["systemStrength", [0]]);
    }
    return roll;
};

MML.isSensitiveArea = function isSensitiveArea(position){
    if(position === 2 || position === 6 || position === 33){
        return true;
    }
    else{
        return false;
    }
};

MML.sensitiveAreaRoll = function sensitiveAreaCheck(){ 
    var roll = this.attributeCheckRoll("willpower", [0]);
    return roll;
};

MML.armorPenetration = function armorPenetration(position, damage, type) {
    var damageApplied = false; //Accounts for partial coverage, once true the loop stops
    var coverageRoll = randomInteger(100); 
    var damageDeflected = 0;
    
    // Iterates over apv values at given position (accounting for partial coverage)
    var apv;
    for (apv in this.apv[position][type]){
        if (damageApplied === false){
            if (coverageRoll <= this.apv[position][type][apv].coverage) { //if coverage roll is less than apv coverage
                damageDeflected = this.apv[position][type][apv];
                
                //If all damage is deflected, do blunt trauma. Modifies damage variable for next if statement
                if (damage + damageDeflected >= 0){
                    //If surface, cut, or pierce, cut in half and apply as impact
                    if (type === "Surface" || type === "Cut" || type === "Pierce"){                        
                        damage = Math.ceil(damage/2);
                        damageDeflected = this.apv[position].Impact[apv];
                        
                        if (damage + damageDeflected >= 0){
                            damageDeflected = -damage;
                            damage = 0;
                        }
                    }
                    //If chop, or thrust, apply 3/4 as impact
                    else if (type === "Chop" || type === "Thrust"){
                        damage = Math.ceil(damage*0.75);
                        damageDeflected = this.apv[position].Impact[apv];
                        
                        if (damage + damageDeflected >= 0){
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
                if (damage < 0){
                    damage += damageDeflected;
                }
                damageApplied = true;
            }
        }
    }
    return damage;
};

MML.getWeaponFamily = function getWeaponFamily(hand){
    var item = this.inventory[this[hand]._id];

    if(!_.isUndefined(item) && item.type === "weapon"){
        return item.grips[this[hand].grip].family;
    }
    else{
        return "Not a Weapon";
    }
};

MML.isWieldingMissileWeapon = function isWieldingMissileWeapon(){
        var leftFamily = MML.getWeaponFamily.apply(this, ["leftHand"]);
        var rightFamily = MML.getWeaponFamily.apply(this, ["rightHand"]);

        return (leftFamily === "MWD" || 
                rightFamily === "MWD" ||
                leftFamily === "MWM" ||
                rightFamily === "MWM" ||
                leftFamily === "TWH" ||
                rightFamily === "TWH" || 
                leftFamily === "TWK" ||
                rightFamily === "TWS" ||
                leftFamily === "TWS" ||
                rightFamily === "SLI" ||
                leftFamily === "SLI");
};

MML.isDualWielding = function isDualWielding(){
    var leftHand = MML.getWeaponFamily.apply(this, ["leftHand"]);
    var rightHand = MML.getWeaponFamily.apply(this, ["rightHand"]);

    if(this.leftHand._id !== this.rightHand._id &&
        leftHand !== "Not a Weapon" &&
        rightHand !== "Not a Weapon"){
        return true;
    }
    else{
        return false;
    }
};

MML.initiativeRoll = function initiativeRoll(input){
    var rollValue = MML.rollDice(1, 10);
    
    MML.processCommand({
        type: "character",
        who: this.name,
        triggeredFunction: "updateCharacter",
        input: {
            attribute: "action"
        }
    });
    MML.processCommand({
        type: "character",
        who: this.name,
        triggeredFunction: "setApiCharAttribute",
        input: {
            attribute: "ready",
            value: true
        }
    });

    MML.processCommand({
        type: "player",
        who: this.player,
        triggeredFunction: "setApiPlayerAttribute",
        input: {
            attribute: "currentRoll",
            value: {
                who: this.name,
                name: "initiative",
                value: rollValue,
                getResult: "initiativeResult",
                applyResult: "initiativeApply",
                range: "1-10",
                accepted: false
            }
        }   
    });

    MML.processCommand({
        type: "character",
        who: this.name,
        triggeredFunction: "initiativeResult",
        input: {}
    });
};

MML.initiativeResult = function initiativeResult(input){
    var player = state.MML.players[this.player];
    var currentRoll = player.currentRoll;

    currentRoll.rollResult = 
        currentRoll.value + 
        this.situationalInitBonus + 
        this.movementRatioInitBonus +
        this.attributeInitBonus + 
        this.senseInitBonus +
        this.fomInitBonus +
        this.firstActionInitBonus +
        this.spentInitiative;

    currentRoll.message =
        "Roll: " + currentRoll.value + 
        "\nResult: " + currentRoll.rollResult + 
        "\nRange: " + currentRoll.range;

    if(player.name === state.MML.GM.player){
        if(currentRoll.accepted === false){
            MML.processCommand({
                type: "player",
                who: player.name,
                triggeredFunction: "displayGmRoll",
                input: {}
            });
        }
        else{
            MML.processCommand({
                type: "character",
                who: this.name,
                triggeredFunction: "initiativeApply",
                input: {}
            });
        }
    }
    else{
        MML.processCommand({
            type: "player",
            who: player.name,
            triggeredFunction: "displayPlayerRoll",
            input: {}
        });
    }
};

MML.initiativeApply = function initiativeApply(){
    MML.processCommand({
        type: "character",
        who: this.name,
        triggeredFunction: "setApiCharAttribute",
        input: {
            attribute: "initiativeRoll",
            value: state.MML.players[this.player].currentRoll.value
        }
    });

    MML.processCommand({
        type: "player",
        who: this.player,
        triggeredFunction: "prepareNextCharacter",
        input: {}   
    });

    
};

MML.startAttackAction = function startAttackAction(){
    var player = state.MML.players[this.player];
    if(_.contains(this.action.modifiers, ["Called Shot"])){
        MML.processCommand({
            type: "player",
            who: player.name,
            triggeredFunction: "menuSelectBodyPart",
            input: {
                who: this.name,
            }   
        });
    }
    else if(_.contains(this.action.modifiers, ["Called Shot Specific"])){
        MML.processCommand({
            type: "player",
            who: player.name,
            triggeredFunction: "menuSelectHitPosition",
            input: {
                who: this.name,
            }   
        });
    }
    else if(_.contains(this.action.modifiers, ["Aim"])){
        if(MML.hasStatusEffect("Taking Aim")){
            this.statusEffects["Taking Aim"].level++;
        }
        else{
            this.statusEffects["Taking Aim"] = { name: "Taking Aim", level: 1, target: this.action.targets[0] };
        }
    }
    else{
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "getAttackRoll",
            input: {}   
        });
    }
};


MML.statusEffects = {};
MML.statusEffects["Major Wound"] = function(effect, index){
    if(this[effect.bodyPart] > Math.round(this[effect.bodyPart + "Max"]/2)){
        delete this.statusEffects[index];
    }
    else{
        if(this.situationalInitBonus !== "No Combat"){
            this.situationalInitBonus += -5;
        }
        if(effect.duration > 0){
            this.situationalMod += -10;
        }
    }
};
MML.statusEffects["Disabling Wound"] = function(effect, index){
    if(this[effect.bodyPart] > 0){
        delete this.statusEffects[index];
    }
    else{
        if(this.situationalInitBonus !== "No Combat"){
            this.situationalInitBonus += -10;
        }
        this.situationalMod += -25;
    }
};
MML.statusEffects["Mortal Wound"] = function(effect, index){
    if(this[effect.bodyPart] <= -this[effect.bodyPart + "Max"]){
        delete this.statusEffects[index];
    }
    else{
        this.situationalInitBonus = "No Combat";
    }
};
MML.statusEffects["Wound Fatigue"] = function(effect, index){
    if(this.situationalInitBonus !== "No Combat"){
        this.situationalInitBonus += -5;
    }
    this.situationalMod  += -10;
};
MML.statusEffects["Number of Defenses"] = function(effect, index){
    if(state.GM.roundStarted === false){ 
        delete this.statusEffects[index];
    }

    this.missileDefenseMod += -20 * effect.number;
    this.meleeDefenseMod += -20 * effect.number;
};
MML.statusEffects["Fatigue"] = function(effect, index){
    if(this.situationalInitBonus !== "No Combat"){
        this.situationalInitBonus += -5*effect.level;
    }
    this.situationalMod  += -10*effect.level;
};
MML.statusEffects["Sensitive Area"] = function(effect, index){
    if(state.GM.roundStarted === false){ 
        effect.duration--;
        if(effect.duration < 1){
            delete this.statusEffects[index];
        }
    }
    else{
        if(this.situationalInitBonus !== "No Combat"){
            this.situationalInitBonus += -5;
        }
    }
    if(effect.duration > 1){
        this.situationalMod  += -10;
    }
};
MML.statusEffects["Stumbling"] = function(effect, index){
    if(state.GM.roundStarted === false){ 
        effect.duration--;
        if(effect.duration < 1){
            delete this.statusEffects[index];
        }
    }
    else{
        if(this.situationalInitBonus !== "No Combat"){
            this.situationalInitBonus += -5;
        }
    }
};
MML.statusEffects["Called Shot"] = function(effect, index){
    if(!_.contains(this.action.modifiers, "Called Shot")){
        delete this.statusEffects[index];
    }

    else{
        this.missileDefenseMod += -10;
        this.meleeDefenseMod += -10;
        this.missileAttackMod += -10;
        this.meleeAttackMod += -10;
        if(this.situationalInitBonus !== "No Combat"){
            this.situationalInitBonus += -5;
        }
    }
};
MML.statusEffects["Called Shot Specific"] = function(effect, index){
    if(!_.contains(this.action.modifiers, "Called Shot Specific")){
        delete this.statusEffects[index];
    }
    else{
        this.missileDefenseMod += -30;
        this.meleeDefenseMod += -30;
        this.meleeAttackMod += -30;
        this.missileAttackMod += -30;
        if(this.situationalInitBonus !== "No Combat"){
            this.situationalInitBonus += -5;
        }
    }
};
MML.statusEffects["Aggressive Stance"] = function(effect, index){
    if(!_.contains(this.action.modifiers, "Aggressive Stance")){
        // log("aggro deleted");
        delete this.statusEffects[index];
        // log(this.statusEffects);
    }
    else{
        this.missileDefenseMod += -40;
        this.meleeDefenseMod += -40;
        this.meleeAttackMod += 10;
        this.perceptionCheckMod += -4;
        if(this.situationalInitBonus !== "No Combat"){
            this.situationalInitBonus += 5;
        }
    }
};
MML.statusEffects["Defensive Stance"] = function(effect, index){
    if(!_.contains(this.action.modifiers, "Defensive Stance")){
        delete this.statusEffects[index];
    }
    else{
        this.missileDefenseMod += 40;
        this.meleeDefenseMod += 40;
        this.meleeAttackMod += -30;
        this.perceptionCheckMod += -4;
        if(this.situationalInitBonus !== "No Combat"){
            this.situationalInitBonus += -5;
        }
    }
};
MML.statusEffects["Observe"] = function(effect, index){
    if(state.GM.roundStarted === false){ 
        effect.duration--;
    }
    
    if(effect.duration < 1 || (this.situationalInitBonus !== "No Combat" && !MML.hasStatusEffect("Number of Defenses"))){
        delete this.statusEffects[index];
    }
    else if(effect.duration < 1){
        // Observing this round
        this.perceptionCheckMod += 4;
        this.missileDefenseMod += -10;
        this.meleeDefenseMod += -10;
    }
    else{
        //observed previous round
        this.situationalInitBonus += 5;
        if(MML.isWieldingMissileWeapon.apply(this, [])){
                this.missileAttackMod += 15;
            }
        } 
};
MML.statusEffects["Taking Aim"] = function(effect, index){
    if(MML.hasStatusEffect.apply(this, ["Number of Defenses"]) ||
       MML.hasStatusEffect.apply(this, ["Damaged This Round"]) ||
       MML.hasStatusEffect.apply(this, ["Dodged This Round"]) ||
       this.action.targets[0] !== effect.target)
    {
        delete this.statusEffects[index];
    }
    else{
        if(effect.level === 1){
            this.missileAttackMod += 30;
        }
        else if(effect.level === 2){
            this.missileAttackMod += 40;
        }
    }
};
MML.statusEffects["Aim"] = function(effect, index){
    // if(MML.hasStatusEffect.apply(this, ["Number of Defenses"]) ||
    //    MML.hasStatusEffect.apply(this, ["Damaged This Round"]) ||
    //    MML.hasStatusEffect.apply(this, ["Dodged This Round"]))
    // {
    //     this.statusEffects[index]
    // }
    // else if(state.MML.GM.roundStarted === false){
    //     if(effect.level === 1){
    //         this.missileAttackMod += 30;
    //     }
    //     else if(effect.level === 2){
    //         this.missileAttackMod += 40;
    //     }
    //}
};
MML.statusEffects["Damaged This Round"] = function(effect, index){

};
MML.statusEffects["Dodged This Round"] = function(effect, index){

};
MML.statusEffects["Melee This Round"] = function(effect, index){
    if(state.MML.GM.roundStarted === false){
        this.roundsExertion++;
        delete this.statusEffects[index];
    }
};

// //Give weapons functions and set character's getAttackRoll equal to it
MML.getAttackRoll = function getAttackRoll(input){
    log()
 var roll;
    
 if (this.inventory.weapons.length === 0){
     roll = this.unarmedAttack();
 }
 else if (this.inventory.weapons[0].family === "MWD" || this.inventory.weapons[0].family === "MWM"){
     roll = this.missileAttack();
 }
 else if(this.inventory.weapons[0].family === "TWH" || 
 this.inventory.weapons[0].family === "TWK" ||
 this.inventory.weapons[0].family === "TWS" ||
 this.inventory.weapons[0].family === "SLI"){
     roll = this.thrownAttack();
 }
 else if(this.inventory.weapons.length === 2){
     roll = this.dualWieldAttack();
 }
 else {
     roll = this.meleeAttack();
 }
 this.fatigue.inMelee = true;

 return roll;
};

MML.attackRollResult = function attackRollResult(){
    this.rolls.attack = this.currentRoll.result;
    if(this.rolls.attack === "Critical Success" || this.rolls.attack === "Success"){
        var player = state.MML.GM.characters[this.currentTarget].player;
        state.MML.players[player].menu = "charMenuDefense";
        MML.displayMenu.apply(state.MML.players[player], []);
    }
    else{
        MML.endAction.apply(this, []);
    }
};

MML.getDefenseRoll = function getDefenseRoll(){
    this.currentRoll = this.characters[this.currentTarget].defenseRoll();
    this.displayRoll();
};

MML.defenseRollResult = function defenseRollResult(){
    this.rolls.defense = this.currentRoll.result;
    if(this.rolls.defense === "Critical Success" || this.rolls.defense === "Success"){
        this.endAction();
    }
    else{
        var player = state.MML.GM.characters[this.actor].player;
        state.MML.players[player].setMenu = MML.charMenuHitPositionRoll;
        state.MML.players[player].displayMenu();
    }
};

// MML.weaponDamageRoll = function weaponDamageRoll(crit){
//     var weapon = this.inventory.weapons[0];
//     var weaponDamage;
//  var damageType;
//  var bonusDamage = 0; // Strength, weapon, and other bonuses
//  var roll;
    
//  if (this.inventory.weapons.length === 0){
//      log("unarmed");//unarmed damage
//  }
//  else if (this.inventory.weapons[0].family === "MWD" || this.inventory.weapons[0].family === "MWM"){
//      log("missile");//missile damage
//  }
//  else if(this.inventory.weapons[0].family === "TWH" || 
//  this.inventory.weapons[0].family === "TWK" ||
//  this.inventory.weapons[0].family === "TWS" ||
//  this.inventory.weapons[0].family === "SLI" ){
//      log("thrown"); //thrown damage
//  }
//  else if(this.inventory.weapons.length === 2){
//      log("dual"); //dual wield damage
//  }
//  else {//Melee Damage
//      //Primary or secondary attack
//      if (this.action.damageType === "primary"){
//          weaponDamage = weapon.primaryDamage;
//          damageType = weapon.primaryType;
//      }
//      else {
//          weaponDamage = weapon.secondaryDamage;
//          damageType = weapon.secondaryType;
//      }
//  }
//  roll = MML.rollDamage(weaponDamage, [bonusDamage], crit, damageType);
//  return roll;
// };


// // Todo: Add sweep attack
// MML.meleeAttack = function meleeAttack(){ 
//     this.currentWeapon = this.inventory.weapons[0];
//     var weapon = this.currentWeapon;
//     var skill = this.action.skill;
//  var attackMod = this.modifiers.attack;
//  var sitMod = this.modifiers.situational;
    
//  var roll;
//     //Primary or secondary attack
//  if (this.action.damageType === "primary"){
//      roll = this.universalRoll([weapon.primaryTask, skill, sitMod, attackMod]);
//  }
//  else {
//      roll = this.universalRoll([weapon.secondaryTask, skill, sitMod, attackMod]);
//  }
    
//  return roll;
// };
// // Check if missle weapon and maybe magic
// MML.defenseRoll = function defenseRoll(){
//  var roll = {};
//  var weapon = this.inventory.weapons[0];
//     var weaponSkill = Math.round(this.skills[weapon.name]/2);
//  var shieldMod = this.inventory.shield.defenseMod;
//  var dodgeSkill = this.skills.dodge;
//  var defaultMartialSkill = this.skills.defaultMartial;
//  var defenseMod = this.modifiers.defense;
//     var sitMod = this.modifiers.situational;
//  var dodgeChance;
//  var blockChance;
    
//  if(weaponSkill >= defaultMartialSkill){
//      blockChance = weapon.defense + weaponSkill + sitMod + defenseMod + shieldMod;
//  }
//  else{
//      blockChance = weapon.defense + defaultMartialSkill + sitMod + defenseMod + shieldMod;
//  }
    
//  if(dodgeSkill >= defaultMartialSkill){
//      dodgeChance = dodgeSkill + sitMod + defenseMod;
//  }
//  else{
//      dodgeChance = defaultMartialSkill + sitMod + defenseMod;
//  }

//  switch(this.defense.style){
//      case "Block":
//          this.defense.number++;
//          roll = this.universalRoll([blockChance]);
//      break;
//      case "Dodge":
//          this.defense.number++;
//          this.defense.dodge = true;
//          roll = this.universalRoll([dodgeChance]);
//      break;
//      case "Take It":
//          roll = {value: 100, player: this.player, result: "Failure", target: 1};
//      break;
//      default:
//      break;
//  }

//  return roll;
// };

// MML.missileAttack = function missileAttack(){
//  var weapon = this.inventory.weapons[0];
//  var skill = this.action.skill;
//  var attackMod = this.modifiers.attack;
//  var attackerSitMod = this.modifiers.situational;
//  // var range = MML.getDistanceBetweenChars(this.name, this.);
//  var task;
//  //var damageDice;
    
//  // Get task and damage from range
//  if ( range <= attackerWeapon.range.pointBlank.range ){
//      task = attackerWeapon.range.pointBlank.task;
//      //damageDice = attackerWeapon.range.pointBlank.damage;
//  }
//  else if ( range <= attackerWeapon.range.effective.range ){
//      task = attackerWeapon.range.effective.task;
//      //damageDice = attackerWeapon.range.effective.damage;
//  }
//  else if ( range <= attackerWeapon.range.long.range ){
//      task = attackerWeapon.range.long.task;
//      //damageDice = attackerWeapon.range.long.damage;
//  }
//  else {
//      task = attackerWeapon.range.extreme.task;
//      //damageDice = attackerWeapon.range.extreme.damage;
//  }
    
//  // // Determine dodge or shield
//  // if (defenderDodgeSkill > (defaultMartialSkill + shieldDefenseMod)){
//      // defenderSkill = defenderDodgeSkill;
//  // }
//  // else {
//      // defenderSkill = defaultMartialSkill + shieldDefenseMod;
//  // }

//  //var position = MML.rollHitPosition(state.MML.GM.characters[charName].action.elevation, defender, target);
//  state.MML.Combat.turnInfo.currentRoll = this.universalRoll([task, skill, attackerSitMod, attackMod]);

// };

MML.unarmedAttack = function unarmedAttack(charName){};

MML.readyItemAction = function readyItemAction(charName){};

MML.castSpellAction = function castSpellAction(charName){};

MML.observeAction = function observeAction(charName){};