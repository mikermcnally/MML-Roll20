// Character Creation
MML.characterConstructor = function characterConstructor(charName){
    //Functions aren't saved in state variable between sessions. In the name of good form dependents and compute should stored outside the character object.
    //This has the advantage of simplifiying attribute value references and making them consistent with the player and GM class.
    //
    //all attributes should have the following forms:
    //
    //this.attribute = getCurrentAttribute;
    //
    //MML.computeAttribute.attribute = { depedents: [], compute: function(){} };

    // Basic Info 
    this.name = {
        value: charName,
        dependents: [],
        compute: function(){
            return this.name.value;
        }};
    this.player = {
        value: MML.getCurrentAttribute(this.name.value, "player"),
        dependents: [],
        compute: function(){
            return this.player.value;
        }};
    this.race = { 
        value: MML.getCurrentAttribute(this.name.value, "race"), 
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
            return MML.getCurrentAttribute(this.name.value, "race");
        }};
    this.bodyType = {
        value: MML.getCurrentAttribute(this.name.value, "bodyType"),
        dependents: ["hitTable"],
        compute: function() {
            return MML.bodyTypes[this.race.value];   
        }};
    this.gender = { 
        value: MML.getCurrentAttribute(this.name.value, "gender"), 
        dependents: ["stature"], //"magic bonus for females"],
        compute: function(){
            return MML.getCurrentAttribute(this.name.value, "gender");
        } };
    this.height = { 
        value: MML.getCurrentAttribute(this.name.value, "height"), 
        dependents: [], 
        compute: function(){
            return MML.statureTables[this.race.value][this.gender.value][MML.getCurrentAttributeAsFloat(this.name.value, "statureRoll")].height;
        }};
    this.weight = { 
        value: MML.getCurrentAttributeAsFloat(this.name.value, "weight"), 
        dependents: [], 
        compute: function(){
            return MML.statureTables[this.race.value][this.gender.value][MML.getCurrentAttributeAsFloat(this.name.value, "statureRoll")].weight;
        } };
    this.handedness = { 
        value: MML.getCurrentAttribute(this.name.value, "handedness"), 
        dependents: [], // "meleeAttackMod"
        compute: function(){
            return MML.getCurrentAttributeAsFloat(this.name.value, "handedness");
        }};
    
    //Primary Attributes
    this.stature = { 
        value: MML.getCurrentAttributeAsFloat(this.name.value, "stature"), 
        dependents: ["load",
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
            return MML.statureTables[this.race.value][this.gender.value][MML.getCurrentAttributeAsFloat(this.name.value, "statureRoll")].stature;
        } };
    this.strength = { 
        value: MML.getCurrentAttributeAsFloat(this.name.value, "strength"), 
        dependents: ["fitness",
                    "chestHPMax",
                    "attributeDefenseMod",
                    "attributeMeleeAttackMod",
                    "attributeMissileAttackMod",
                    "attributeInitBonus"],
        compute: function(){
            return MML.getCurrentAttributeAsFloat(this.name.value, "strengthRoll") + MML.racialAttributeBonuses[this.race.value].strength;
        } };
    this.coordination = { 
        value: MML.getCurrentAttributeAsFloat(this.name.value, "coordination"), 
        dependents: ["attributeMeleeAttackMod",
                    "attributeMissileAttackMod",
                    "attributeDefenseMod",
                    "attributeInitBonus"], //skill mods
        compute: function(){
            return MML.getCurrentAttributeAsFloat(this.name.value, "coordinationRoll") + MML.racialAttributeBonuses[this.race.value].coordination;
        } };
    this.health = { 
        value: MML.getCurrentAttributeAsFloat(this.name.value, "health"), 
        dependents: ["willpower",
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
            return MML.getCurrentAttributeAsFloat(this.name.value, "healthRoll") + MML.racialAttributeBonuses[this.race.value].health;
        } };
    this.beauty = { 
        value: MML.getCurrentAttributeAsFloat(this.name.value, "beauty"), 
        dependents: [], //skill mods
        compute: function(){
            return MML.getCurrentAttributeAsFloat(this.name.value, "beautyRoll") + MML.racialAttributeBonuses[this.race.value].beauty;
        } };
    this.intellect = { 
        value: MML.getCurrentAttributeAsFloat(this.name.value, "intellect"), 
        dependents: ["perception",
                    "evocation",
                    "spellLearningMod"], //spell learning/skill mods
        compute: function(){
            return MML.getCurrentAttributeAsFloat(this.name.value, "intellectRoll") + MML.racialAttributeBonuses[this.race.value].intellect;
        } };
    this.reason = { 
        value: MML.getCurrentAttributeAsFloat(this.name.value, "reason"), 
        dependents: ["perception",
                    "evocation",
                    "castingMod",
                    "attributeInitBonus"], //skill mods
        compute: function(){
            return MML.getCurrentAttributeAsFloat(this.name.value, "reasonRoll") + MML.racialAttributeBonuses[this.race.value].reason;
        } };
    this.creativity = { 
        value: MML.getCurrentAttributeAsFloat(this.name.value, "creativity"), 
        dependents: ["perception",
                    "evocation"], //skill mods
        compute: function(){
            return MML.getCurrentAttributeAsFloat(this.name.value, "creativityRoll") + MML.racialAttributeBonuses[this.race.value].creativity;
        } };
    this.presence = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "presence"),
        dependents: ["willpower",
                    "systemStrength"],
        compute: function(){
            return MML.getCurrentAttributeAsFloat(this.name.value, "presenceRoll") + MML.racialAttributeBonuses[this.race.value].presence;
        } };

    // Secondary Attributes
    this.willpower = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "willpower"),
        dependents: ["evocation",
                    "multiWound"],
        compute: function(){
            return Math.round((2*this.presence.value + this.health.value)/3);
        } };
    this.evocation = { 
        value: MML.getCurrentAttributeAsFloat(this.name.value, "evocation"), 
        dependents: ["epMax"], //skill mods
        compute: function(){
            return this.intellect.value + 
                    this.reason.value + 
                    this.creativity.value + 
                    this.health.value + 
                    this.willpower.value + 
                    MML.racialAttributeBonuses[this.race.value].evocation;
        } };
    this.perception = { 
        value: MML.getCurrentAttributeAsFloat(this.name.value, "perception"), 
        dependents: ["missileAttackMod",
                    "attributeInitBonus"],
        compute: function(){
            return Math.round((this.intellect.value + this.reason.value + this.creativity.value)/3) + MML.racialAttributeBonuses[this.race.value].perception;
        } };
    this.systemStrength = { 
        value: MML.getCurrentAttributeAsFloat(this.name.value, "systemStrength"), 
        dependents: [], 
        compute: function(){
            return Math.round((this.presence.value + 2*this.health.value)/3);
        } };
    this.fitness = { 
        value: MML.getCurrentAttributeAsFloat(this.name.value, "fitness"), 
        dependents: ["fitnessMod", "fatigueMax"], //skill mods
        compute: function(){
            return Math.round((this.health.value + this.strength.value)/2) + MML.racialAttributeBonuses[this.race.value].fitness;
        }};
    this.fitnessMod = { 
        value: MML.getCurrentAttributeAsFloat(this.name.value, "fitnessMod"), 
        dependents: ["load"], //skill mods
        compute: function(){
            return MML.fitnessModLookup[this.fitness.value];
        }};
    this.load = { 
        value: MML.getCurrentAttributeAsFloat(this.name.value, "load"), 
        dependents: ["overhead",
                    "deadLift",
                    "meleeDamageMod",
                    "movementRatio"],
        compute: function(){
            return Math.round(this.stature.value * this.fitnessMod.value) + MML.racialAttributeBonuses[this.race.value].load;
        }};
    this.overhead = { 
        value: MML.getCurrentAttributeAsFloat(this.name.value, "overhead"), 
        dependents: [], 
        compute: function(){
            return this.load.value*2;
        }};
    this.deadLift = { 
        value: MML.getCurrentAttributeAsFloat(this.name.value, "deadLift"), 
        dependents: [], 
        compute: function(){
            return this.load.value*4;
        }};
    
    // HP stuff
    this.multiWoundMax = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "multiWoundMax"),
        dependents: ["multiWound"],
        compute: function(){
            var multiWoundMax = Math.round((this.health.value + this.stature.value + this.willpower.value)/2);
            this.multiWound.value = multiWoundMax;
            return multiWoundMax;
        }};
    this.multiWound = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "multiWound"),
        dependents: [],
        compute: function(){
            return this.multiWound.value;
        }};
    this.headHPMax = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "headHPMax"),
        dependents: ["headHP"],
        compute: function(){
            var headHPMax = MML.HPTables[this.race.value][Math.round(this.health.value + this.stature.value/3)];
            this.headHP.value = headHPMax;
            return headHPMax;
        }};
    this.headHP = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "headHP"),
        dependents: [],
        compute: function(){
            return this.headHP.value;
        }};
    this.chestHPMax = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "chestHPMax"),
        dependents: ["chestHP"],
        compute: function(){
            var chestHPMax = MML.HPTables[this.race.value][Math.round((this.health.value + this.stature.value + this.strength.value)/2)];
            this.chestHP.value = chestHPMax;
            return chestHPMax;
        }};
    this.chestHP = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "chestHP"),
        dependents: [],
        compute: function(){
            return this.chestHP.value;
        }};
    this.abdomenHPMax = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "abdomenHPMax"),
        dependents: ["abdomenHP"],
        compute: function(){
            var abdomenHPMax = MML.HPTables[this.race.value][Math.round(this.health.value + this.stature.value)];
            this.abdomenHP.value = abdomenHPMax;
            return abdomenHPMax;
        }};
    this.abdomenHP = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "abdomenHP"),
        dependents: [],
        compute: function(){
            return this.abdomenHP.value;
        }};
    this.leftArmHPMax = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "leftArmHPMax"),
        dependents: ["leftArmHP"],
        compute: function(){
            var leftArmHPMax = MML.HPTables[this.race.value][Math.round(this.health.value + this.stature.value)];
            this.leftArmHP.value = leftArmHPMax;
            return leftArmHPMax;
        }};
    this.leftArmHP = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "leftArmHP"),
        dependents: [],
        compute: function(){
            return this.leftArmHP.value;
        }};
    this.rightArmHPMax = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "rightArmHPMax"),
        dependents: ["rightArmHP"],
        compute: function(){
            var rightArmHPMax = MML.HPTables[this.race.value][Math.round(this.health.value + this.stature.value)];
            this.rightArmHP.value = rightArmHPMax;
            return rightArmHPMax;
        }};
    this.rightArmHP = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "rightArmHP"),
        dependents: [],
        compute: function(){
            return this.rightArmHP.value;
        }};
    this.leftLegHPMax = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "leftLegHPMax"),
        dependents: ["leftLegHP"],
        compute: function(){
            var leftLegHPMax = MML.HPTables[this.race.value][Math.round(this.health.value + this.stature.value)];
            this.leftLegHP.value = leftLegHPMax;
            return leftLegHPMax;
        }};
    this.leftLegHP = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "leftLegHP"),
        dependents: [],
        compute: function(){
            return this.leftLegHP.value;
        }};
    this.rightLegHPMax = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "rightLegHPMax"),
        dependents: ["rightLegHP"],
        compute: function(){
            var rightLegHPMax = MML.HPTables[this.race.value][Math.round(this.health.value + this.stature.value)];
            this.rightLegHP.value = rightLegHPMax;
            return rightLegHPMax;
        }};
    this.rightLegHP = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "rightLegHP"),
        dependents: [],
        compute: function(){
            return this.rightLegHP.value;
        }};
    this.epMax = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "epMax"),
        dependents: ["ep"],
        compute: function(){
            var epMax = this.evocation.value;
            this.ep.value = epMax;
            return epMax;
        }};
    this.ep = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "ep"),
        dependents: [],
        compute: function(){
            return this.ep.value;
        }};
    this.fatigueMax = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "fatigueMax"),
        dependents: ["fatigue"],
        compute: function(){
            var fatigueMax = this.fitness.value;
            this.fatigue.value = fatigueMax;
            return fatigueMax;
        }};
    this.fatigue = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "fatigue"),
        dependents: [],
        compute: function(){
            return this.fatigue.value;
        }};
    this.hpRecovery = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "hpRecovery"),
        dependents: [],
        compute: function(){
            return MML.recoveryMods[this.health.value].hp;
        }};
    this.epRecovery = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "epRecovery"),
        dependents: [],
        compute: function(){
            return MML.recoveryMods[this.health.value].ep;
        }};

    // Inventory stuff    
    this.inventory = {
        value: MML.getCurrentAttributeJSON(this.name.value, "inventory"),
        dependents: ["totalWeightCarried",
                     "apv",
                     "leftHand",
                     "rightHand",
                     "senseInitBonus"],
        compute: function(){
            var items = this.inventory.value;

            _.each(
                items,
                function(item, _id) {
                    MML.setCurrentAttribute(this.name.value, "repeating_items_" + _id + "_itemName", item.name);
                    MML.setCurrentAttribute(this.name.value, "repeating_items_" + _id + "_itemId", _id);
                },
                this
            );
            return items;
        }};
    this.totalWeightCarried = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "totalWeightCarried"),
        dependents: ["knockdownMax", "movementRatio"],
        compute: function(){
            var totalWeightCarried = 0;

            _.each(this.inventory.value, function(item) {
                totalWeightCarried += item.weight;
            });
            return totalWeightCarried;
        }};
    this.knockdownMax = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "knockdownMax"),
        dependents: ["knockdown"],
        compute: function(){
            var knockdownMax = Math.round(this.stature.value + (this.totalWeightCarried.value/10));
            this.knockdown.value = knockdownMax;
            return knockdownMax;
        }};
    this.knockdown = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "knockdown"),
        dependents: [],
        compute: function(){
            if (this.knockdown.value < 0) {
                MML.knockdownRoll.apply(this, []);
            }       
            else{
                return false;
            }
            return this.knockdown.value;
        }};
    this.apv = {
        value: MML.getCurrentAttributeJSON(this.name.value, "apv"),
        dependents: [],
        compute: function(){
            var armor = [];
            _.each(
                this.inventory.value, 
                function(item){
                    if(item.type === "armor"){
                        armor.push(item);
                    }
                },
                this);

            var mat = [];
            
            // Initialize APV Matrix
            _.each(MML.hitPositions[this.bodyType.value], function(position){
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
                                apvToLayerArray.push(rawAPVArray[apv].value);
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
    this.leftHand = {
        value: MML.getCurrentAttributeJSON(this.name.value, "leftHand"),
        dependents: ["hitTable"],
        compute: function(){
            return this.leftHand.value;
        }};
    this.rightHand = {
        value: MML.getCurrentAttributeJSON(this.name.value, "rightHand"),
        dependents: ["hitTable"],
        compute: function(){
            return this.rightHand.value;
        }};
    this.hitTable = {
        value: MML.getCurrentAttribute(this.name.value, "hitTable"),
        dependents: [],
        compute: function() {
            return MML.hitTables[this.bodyType.value].A;   
        }};
    
    // Movement
    this.movementRatio = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "movementRatio"),
        dependents: ["movementRatioInitBonus"],
        compute: function(){
            var movementRatio = Math.round(10*this.load.value/this.totalWeightCarried.value)/10;
            if(movementRatio > 4.0){
                movementRatio = 4.0;
            }
            return movementRatio;
        }};
    this.movementAvailable = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "movementAvailable"),
        dependents: [],
        compute: function() {
            return this.movementAvailable.value;   
        }};
    this.movementPosition = {
        value: MML.getCurrentAttribute(this.name.value, "movementPosition"),
        dependents: [],
        compute: function() {
            return this.movementPosition.value;   
        }};

    // Roll Modifiers
    this.situationalMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "situationalMod"),
        dependents: [],
        compute: function() {
            return this.situationalMod.value;   
        }};
    this.attributeDefenseMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "attributeDefenseMod"),
        dependents: [],
        compute: function() {
            return MML.attributeMods.strength[this.strength.value] + MML.attributeMods.coordination[this.coordination.value];   
        }};
    this.meleeDefenseMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "meleeDefenseMod"),
        dependents: [],
        compute: function() {
            return this.meleeDefenseMod.value;   
        }};
    this.missileDefenseMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "missileDefenseMod"),
        dependents: [],
        compute: function() {
            return this.missileDefenseMod.value;   
        }};
     this.meleeAttackMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "meleeAttackMod"),
        dependents: [],
        compute: function() {
            return this.meleeAttackMod.value;   
        }};
    this.missileAttackMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "missileAttackMod"),
        dependents: [],
        compute: function() {
            return this.missileAttackMod.value;   
        }};
    this.attributeMeleeAttackMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "attributeMeleeAttackMod"),
        dependents: [],
        compute: function() {
            return MML.attributeMods.strength[this.strength.value] + MML.attributeMods.coordination[this.coordination.value];   
        }};
    this.meleeDamageMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "meleeDamageMod"),
        dependents: [],
        compute: function() {
            var meleeDamageMod;
            var load = this.load.value;

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
    this.attributeMissileAttackMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "attributeMissileAttackMod"),
        dependents: [],
        compute: function() {
            return MML.attributeMods.perception[this.perception.value] + MML.attributeMods.coordination[this.coordination.value] + MML.attributeMods.strength[this.strength.value];   
        }};
    this.castingMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "castingMod"),
        dependents: [],
        compute: function() {
            var castingMod = MML.attributeMods.reason[this.reason.value];

            if(this.senseInitBonus.value < 3 || this.senseInitBonus.value > 0){
                castingMod -= 10;
            }
            else if(this.senseInitBonus.value < 0 || this.senseInitBonus.value > -2){
                castingMod -= 20;
            }
            else{
                castingMod -= 30;
            }

            if(this.fomInitBonus.value === 3 || this.fomInitBonus.value === 2){
                castingMod -= 5;
            }
            else if(this.fomInitBonus.value === 1){
                castingMod -= 10;
            }
            else if(this.fomInitBonus.value === 0){
                castingMod -= 15;
            }
            else if(this.fomInitBonus.value === -1){
                castingMod -= 20;
            }
            else if(this.fomInitBonus.value === -2){
                castingMod -= 30;
            }

            return castingMod;
        }};
    this.spellLearningMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "spellLearningMod"),
        dependents: [],
        compute: function() {
            return MML.attributeMods.intellect[this.intellect.value];   
        }};
    this.statureCheckMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "statureCheckMod"),
        dependents: [],
        compute: function() {
            return this.situationalMod.value;   
        }};
    this.strengthCheckMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "strengthCheckMod"),
        dependents: [],
        compute: function() {
            return this.situationalMod.value;   
        }};
    this.coordinationCheckMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "coordinationCheckMod"),
        dependents: [],
        compute: function() {
            return this.situationalMod.value;   
        }};
    this.healthCheckMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "healthCheckMod"),
        dependents: [],
        compute: function() {
            return this.situationalMod.value;   
        }};
    this.beautyCheckMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "beautyCheckMod"),
        dependents: [],
        compute: function() {
            return this.situationalMod.value;   
        }};
    this.intellectCheckMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "intellectCheckMod"),
        dependents: [],
        compute: function() {
            return this.situationalMod.value;   
        }};
    this.reasonCheckMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "reasonCheckMod"),
        dependents: [],
        compute: function() {
            return this.situationalMod.value;   
        }};
    this.creativityCheckMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "creativityCheckMod"),
        dependents: [],
        compute: function() {
            return this.situationalMod.value;   
        }};
    this.presenceCheckMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "presenceCheckMod"),
        dependents: [],
        compute: function() {
            return this.situationalMod.value;   
        }};
    this.willpowerCheckMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "willpowerCheckMod"),
        dependents: [],
        compute: function() {
            return this.situationalMod.value;   
        }};
    this.evocationCheckMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "evocationCheckMod"),
        dependents: [],
        compute: function() {
            return this.situationalMod.value;   
        }};
    this.perceptionCheckMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "perceptionCheckMod"),
        dependents: [],
        compute: function() {
            return this.situationalMod.value;   
        }};
    this.systemStrengthCheckMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "systemStrengthCheckMod"),
        dependents: [],
        compute: function() {
            return this.situationalMod.value;   
        }};
    this.fitnessCheckMod = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "fitnessCheckMod"),
        dependents: [],
        compute: function() {
            return this.situationalMod.value;   
        }};
    this.statusEffects = {
        value: MML.getCurrentAttributeJSON(this.name.value, "statusEffects"),
        dependents: ["situationalInitBonus",
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
                this[dependent].value = 0;
            }, this);
            _.each(this.statusEffects.value, function(effect, index){
                MML.statusEffects[effect.name].apply(this, [effect, index]);
            }, this);
            return this.statusEffects.value;   
        }};
    
    // Initiative
    this.initiative = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "initiative"),
        dependents: [],
        compute: function(){
             var initiative = this.initiativeRoll.value + 
                    this.situationalInitBonus.value + 
                    this.movementRatioInitBonus.value +
                    this.attributeInitBonus.value + 
                    this.senseInitBonus.value +
                    this.fomInitBonus.value +
                    this.firstActionInitBonus.value +
                    this.spentInitiative.value;
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
    this.initiativeRoll = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "initiativeRoll"),
        dependents: ["initiative"],
        compute: function(){
            return this.initiativeRoll.value;
        }}; 
    this.situationalInitBonus = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "situationalInitBonus"),
        dependents: ["initiative"],
        compute: function(){
            return this.situationalInitBonus.value;
        }}; 
    this.movementRatioInitBonus = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "movementRatioInitBonus"),
        dependents: ["initiative"],
        compute: function(){
            if(this.movementRatio.value < 0.6){
                return "No Combat";
            }
            else if (this.movementRatio.value === 0.6){
               return -4;
            }
            else if (this.movementRatio.value < 0.7 && this.movementRatio.value <= 0.8){
               return -3;
            }
            else if (this.movementRatio.value > 0.8 && this.movementRatio.value <= 1.0){
               return -2;
            }
            else if (this.movementRatio.value > 1.0 && this.movementRatio.value <= 1.2){
               return -1;
            }
            else if (this.movementRatio.value > 1.2 && this.movementRatio.value <= 1.4){
               return 0;
            }
            else if (this.movementRatio.value > 1.4 && this.movementRatio.value <= 1.7){
               return 1;
            }
            else if (this.movementRatio.value > 1.7 && this.movementRatio.value <= 2.0){
               return 2;
            }
            else if (this.movementRatio.value > 2.0 && this.movementRatio.value <= 2.5){
               return 3;
            }
            else if (this.movementRatio.value > 2.5 && this.movementRatio.value <= 3.2){
               return 4;
            }
            else if (this.movementRatio.value > 3.2){
               return 5;
            }
        }};  
    this.attributeInitBonus = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "attributeInitBonus"),
        dependents: ["initiative"],
        compute: function(){
            var attributeArray = [this.strength.value, this.coordination.value, this.reason.value, this.perception.value];
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
    this.senseInitBonus = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "senseInitBonus"),
        dependents: ["initiative",
                    "castingMod"],
        compute: function(){
            var armorList = _.where(this.inventory.value, {type: "armor"});    
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
    this.fomInitBonus = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "fomInitBonus"),
        dependents: ["initiative",
                    "castingMod"],
        compute: function(){
            return this.fomInitBonus.value;
        }};  
    this.firstActionInitBonus = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "firstActionInitBonus"),
        dependents: ["initiative"],
        compute: function(){
            if(state.MML.GM.roundStarted === false){
                this.firstActionInitBonus.value = this.action.value.initBonus;
            }
            return this.firstActionInitBonus.value;
        }};
    this.spentInitiative = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "spentInitiative"),
        dependents: ["initiative"],
        compute: function(){
            return this.spentInitiative.value;
        }};
    this.actionTempo = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "actionTempo"),
        dependents: [],
        compute: function(){
            var tempo;
    
            if (this.action.value.skill < 30){ tempo = 0; }
            else if (this.action.value.skill < 40){ tempo = 1; }
            else if (this.action.value.skill < 50){ tempo = 2; }
            else if (this.action.value.skill < 60){ tempo = 3; }
            else if (this.action.value.skill < 70){ tempo = 4; }
            else{ tempo = 5; }
            
            // If Dual Wielding
            if (this.action.value.name === "Attack" && MML.isDualWielding.apply(this,[])){
                var twfSkill = this.weaponskills.value["Two Weapon Fighting"].level;
                if (twfSkill > 19 && twfSkill){ tempo += 1; }
                else if (twfSkill >= 40 && twfSkill < 60){ tempo += 2; }
                else if (twfSkill >= 60){ tempo += 3; }
                // If Dual Wielding identical weapons
                if (this.inventory.value[this.leftHand.value._id].name === this.inventory.value[this.rightHand.value._id].name){ tempo += 1; }   
            }
            return MML.attackTempoTable[tempo];
        }};

    // Combat
    this.ready = {
        value: MML.getCurrentAttribute(this.name.value, "ready"),
        dependents: [],
        compute: function(){
            if(state.MML.GM.inCombat === true && this.ready.value === false){
                MML.getTokenFromChar(this.name.value).set("tint_color", "#FF0000");
            }
            else{
                MML.getTokenFromChar(this.name.value).set("tint_color", "transparent");
            }
            return this.ready.value;
        }};
    this.action = {
        value: MML.getCurrentAttributeJSON(this.name.value, "action"),
        dependents: ["firstActionInitBonus",
                    "actionTempo",
                    "statusEffects"],
        compute: function(){
            var initBonus = 10;

            if(this.action.value.name === "Attack"){
                var leftHand = MML.getWeaponFamily.apply(this, ["leftHand"]);
                var rightHand = MML.getWeaponFamily.apply(this, ["rightHand"]);
                
                if(leftHand === "Not a Weapon" && rightHand === "Not a Weapon"){
                    this.action.value.skill = 0; //this.weaponSkills.value["Brawling"].level or this.weaponSkills.value["Default Martial Skill"].level;
                }
                else if(leftHand !== "Not a Weapon" && rightHand !== "Not a Weapon"){
                    var weaponInits = [this.inventory.value[this.leftHand.value._id].grips[this.leftHand.value.grip].initiative,
                                       this.inventory.value[this.rightHand.value._id].grips[this.rightHand.value.grip].initiative];
                    initBonus = _.min(weaponInits);
                    // this.action.value.skill = this.weaponSkills.value.[this.inventory.value[this.leftHand.value._id].name].level or this.weaponSkills.value["Default Martial Skill"].level;
                    //Dual Wielding
                }
                else if(rightHand !== "Not a Weapon" && leftHand === "Not a Weapon"){
                    initBonus = this.inventory.value[this.rightHand.value._id].grips[this.rightHand.value.grip].initiative;
                }
                else{
                    initBonus = this.inventory.value[this.leftHand.value._id].grips[this.leftHand.value.grip].initiative;
                    //this.action.value.skill = this.weaponSkills.value.[this.inventory.value[this.leftHand.value._id].name].level or this.weaponSkills.value["Default Martial Skill"].level;                    
                }
            }
            this.action.value.initBonus = initBonus;

            _.each(this.action.value.modifiers, function(modifier){
                this.statusEffects.value[modifier] = { name: modifier };
            }, this);

            return this.action.value;
        }};
    this.defensesThisRound = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "defensesThisRound"),
        dependents: [],
        compute: function(){
            return this.defensesThisRound.value;
        }};
    this.dodgedThisRound = {
        value: MML.getCurrentAttributeAsBool(this.name.value, "dodgedThisRound"),
        dependents: ["situationalInitBonus"],
        compute: function(){
            return this.dodgedThisRound.value;
        }};
    this.meleeThisRound = {
        value: MML.getCurrentAttributeAsBool(this.name.value, "meleeThisRound"),
        dependents: [],
        compute: function(){
            return this.meleeThisRound.value;
        }};
    this.fatigueLevel = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "fatigueLevel"),
        dependents: ["statusEffects"],
        compute: function(){
            return this.fatigueLevel.value;
        }};
    this.roundsRest = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "roundsRest"),
        dependents: [],
        compute: function(){
            return this.roundsRest.value;
        }};    
    this.roundsExertion = {
        value: MML.getCurrentAttributeAsFloat(this.name.value, "roundsExertion"),
        dependents: [],
        compute: function(){
            return this.roundsExertion.value;
        }};
    this.damagedThisRound = {
        value: MML.getCurrentAttributeAsBool(this.name.value, "damagedThisRound"),
        dependents: [],
        compute: function(){
            return this.damagedThisRound.value;
        }};
    
    // Skills
    this.skills = {
        value: MML.getSkillAttributes(this.name.value, "skills"),
        dependents: [],
        compute: function(){
            var characterSkills = MML.getSkillAttributes(this.name.value, "skills");
            _.each(
                characterSkills,
                function(characterSkill, _id){
                    var skillName = characterSkill.name;
                    var level = characterSkill.input;       
                    var attribute = MML.skills[skillName].attribute;

                    level += MML.attributeMods[attribute][this[attribute].value];

                    if(_.isUndefined(MML.skillMods[this.race.value]) === false && _.isUndefined(MML.skillMods[this.race.value][skillName]) === false){
                        level += MML.skillMods[this.race.value][skillName];
                    }
                    if(_.isUndefined(MML.skillMods[this.gender.value]) === false && _.isUndefined(MML.skillMods[this.gender.value][skillName]) === false){
                        level += MML.skillMods[this.gender.value][skillName];
                    }
                    characterSkill.level = level;
                    MML.setCurrentAttribute(charName, "repeating_skills_" + _id + "_level", level);
                },
                this
            );

            this.skills.value = characterSkills;
            return characterSkills;
        }};
    this.weaponSkills = {
        value: MML.getSkillAttributes(this.name.value, "weaponskills"),
        dependents: [],
        compute: function(){
            var characterSkills = MML.getSkillAttributes(this.name.value, "weaponskills");
            _.each(
                characterSkills,
                function(characterSkill, _id){
                    var weaponName = characterSkill.name;
                    var level = characterSkill.input;

                    if(_.isUndefined(MML.weaponSkillMods[this.race.value]) === false && _.isUndefined(MML.weaponSkillMods[this.race.value][weaponName]) === false){
                        level += MML.weaponSkillMods[this.race.value][weaponName];
                    }
                    characterSkill.level = level;
                    MML.setCurrentAttribute(charName, "repeating_weaponskills_" + _id + "_level", level);
                },
                this
            );

            this.weaponSkills.value = characterSkills;
            return characterSkills;
        }};

    this.updateCharacter = function(attribute){
        var attributeArray = [attribute];

        for(var i = 0; i < attributeArray.length; i++){ //length of array is dynamic, for-in doesn't work here
            var localAttribute = this[attributeArray[i]];
            attributeArray = _.union(attributeArray, localAttribute.dependents);    
        }
        // log(attributeArray);
        _.each(
            attributeArray,
            function(attribute) {
                var value = this[attribute].compute.apply(this, []); // Run compute function from character scope
                // log(attribute + " " + value);
                this[attribute].value = value;
                if(typeof(value) === "object"){
                    value = JSON.stringify(value);
                }
                //log(attribute);       
                MML.setCurrentAttribute(this.name.value, attribute, value);
            },
            this
        );};
};

MML.characterCommand = function characterCommand(){
    
};

MML.updateInventory = function updateInventory(charName){
    //Armor
    var armor = [];
    var item = MML.getCharAttribute(this.name.value, "repeating_item_0_armorStyleName");
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
                state.MML.characters[charName].inventory.weapons.push(weapons[index]);
            }
            else {
                state.MML.characters[charName].error = "Equipment Conflict: Hands Full";
            }
            
        }
        else if(weapons[index].equipped === "Right"){
            if(right === false){
                right = true;
                state.MML.characters[charName].inventory.weapons.push(weapons[index]);
            }
            else {
                state.MML.characters[charName].error = "Equipment Conflict: Hands Full";
            }
        }
        else if(weapons[index].equipped === "Left"){
            if(left === false){
                left = true;
                state.MML.characters[charName].inventory.weapons.push(weapons[index]);
            }
            else {
                state.MML.characters[charName].error = "Equipment Conflict: Hands Full";
            }
        }
        else{
            state.MML.characters[charName].inventory.inPack.push(weapons[index]);
        }
        index++;
        item = MML.getCharAttribute(charName, "repeating_weapons_" + index + "_weaponName");
    }

    //Shields
    if(MML.getCharAttribute(charName, "shieldEquipped") === "Right"){
        if(right === false){
            right = true;
            state.MML.characters[charName].inventory.shield = MML.shieldStats[MML.getCharAttribute(charName, "shieldName")];
        }
        else {
            state.MML.characters[charName].error = "Equipment Conflict: Hands Full";
        }
    }
    else if(MML.getCharAttribute(charName, "shieldEquipped") === "Left"){
        if(left === false){
            left = true;
            state.MML.characters[charName].inventory.shield = MML.shieldStats[MML.getCharAttribute(charName, "shieldName")];
        }
        else {
            state.MML.characters[charName].error = "Equipment Conflict: Hands Full";
        }
    }
    else{
        state.MML.characters[charName].inventory.inPack.push(MML.shieldStats[MML.getCharAttribute(charName, "shieldName")]);
    }
        
    //Other items
    

    //This looks at the character's stuff and decides which column on hit table to use (A, B, or C)
    if(state.MML.characters[charName].inventory.weapons.length === 0){
        state.MML.characters[charName].defense.hitTable = "A";
    }
    else if (state.MML.characters[charName].inventory.weapons.length === 2){
        state.MML.characters[charName].defense.hitTable = "B";
    }
    else if(state.MML.characters[charName].inventory.shield !== "None"){
        state.MML.characters[charName].defense.hitTable = "C";
    }
    else if(MML.weaponStats[state.MML.characters[charName].inventory.weapons[0]].family === "MWD" || 
    MML.weaponStats[state.MML.characters[charName].inventory.weapons[0]].family === "MWM" ||
    MML.weaponStats[state.MML.characters[charName].inventory.weapons[0]].family === "TWH" || 
    MML.weaponStats[state.MML.characters[charName].inventory.weapons[0]].family === "TWK" || 
    MML.weaponStats[state.MML.characters[charName].inventory.weapons[0]].family === "TWS" || 
    MML.weaponStats[state.MML.characters[charName].inventory.weapons[0]].family === "SLI"){
        state.MML.characters[charName].defense.hitTable = "A";
    }
    else if(MML.weaponStats[state.MML.characters[charName].inventory.weapons[0]].hands === 2){
        state.MML.characters[charName].defense.hitTable = "B";
    }
    else{
        state.MML.characters[charName].defense.hitTable = "A";
    }
};

//Combat Functions
MML.displayMovement = function displayMovement(input){
    if(input){
        MML.getTokenFromChar(this.name.value).set("aura1_radius", MML.movementRates[this.race.value][this.movementPosition.value]*this.movementAvailable.value);
        MML.getTokenFromChar(this.name.value).set("aura1_color", "#00FF00");
    }
    else{
        MML.getTokenFromChar(this.name.value).set("aura1_color", "transparent");
    }
};

MML.moveDistance = function moveDistance(distance){
    this.movementAvailable.value -= (distance)/(MML.movementRates[this.race.value][this.movementPosition.value]);
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
            if(this[MML.hitPoints[i].name].wound.major.value === true){
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
                this.action.skill = this.skills["brawling"].value;
            }
            else if(this.inventory.weapons.length === 2){
                //Dual Wielding
                var weaponInits = [MML.weaponStats[this.inventory.equipped.leftHand.name].initiative, MML.weaponStats[this.inventory.equipped.rightHand.name].initiative];
                initiative  += weaponInits.sort(function(a,b){return b-a;})[0];
                //Set action skill here
            }
            else{
                initiative  += MML.weaponStats[this.inventory.weapons[0].name].initiative;
                this.action.skill = this.skills[this.inventory.weapons[0].name].value;
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

MML.newRoundUpdate = function newRoundUpdate(){
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
    if (this.meleeThisRound.value === true){ // Character acted in melee
        this.roundsExertion.value++;
        this.updateCharacter("roundsExertion");
        this.roundsRest.value = 0;
        this.updateCharacter("roundsRest");

        if (this.fatigueLevel.value < 1){
            if (this.roundsExertion.value > this.fitness.value){
                if (MML.attributeCheckRoll(charName, "fitness", [0])){
                    this.fatigueLevel.value++;
                    this.updateCharacter("fatigueLevel");
                    this.roundsExertion.value = 0;
                    this.updateCharacter("roundsExertion");
                }
            }
        }
        else {
            if (this.roundsExertion.value > Math.round(this.fitness.value/2)){
                if (MML.attributeCheckRoll(charName, "fitness", [-4])){
                    this.fatigueLevel.value++;
                    this.updateCharacter("fatigueLevel");
                    this.roundsExertion.value = 0;
                    this.updateCharacter("roundsExertion");
                }
            }
        }

        this.meleeThisRound.value = false;
        this.updateCharacter("meleeThisRound");
    }
    else if (this.fatigueLevel.value > 0){
        this.roundsRest.value++;
        this.updateCharacter("roundsRest");
        if (this.roundsRest.value >= 6 && this.attributeCheckRoll("health", [0])){
            this.roundsRest.value = 0;
            this.updateCharacter("roundsRest");
            this.fatigueLevel.value--;
            this.updateCharacter("fatigueLevel");
            this.roundsExertion.value = 0;
            this.updateCharacter("roundsExertion");
        }
    }
    // Reset number of defenses counter
    this.defensesThisRound.value = 0;
    this.updateCharacter("defensesThisRound");
    this.dodgedThisRound.value = false;
    this.updateCharacter("dodgedThisRound");
    // Reset knockdown number
    this.knockdown.value = this.knockdownMax.value;
    this.updateCharacter("knockdown");
    // Decrement stumble effect
    //this.stumble--;
    // Decrement sensitive area effect
    //this.sensitive--;
    // Reset action counter
    this.spentInitiative.value = 0;
    this.updateCharacter("spentInitiative");
    // Reset currentRoll
    //this.currentRoll = { accepted:false };
};

MML.setReady = function setReady(ready){
    if(state.MML.GM.inCombat === true && this.ready.value === "false"){
        MML.getTokenFromChar(this.name.value).set("tint_color", "#FF0000");
    }
    else{
        MML.getTokenFromChar(this.name.value).set("tint_color", "transparent");
    }
    return this.ready.value;
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
    woundInfo.value = roll.value;
    return woundInfo;
};

MML.checkKnockdown = function checkKnockdown(damage){
    if (this.movementPosition.value !== "Prone"){
        this.knockdown.value += damage;
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

//ToDo: return damage only and send damage deflected to global message handler
MML.armorPenetration = function armorPenetration(position, damage, type) {
    var damageApplied = false; //Accounts for partial coverage, once true the loop stops
    var coverageRoll = randomInteger(100); 
    var damageDeflected = 0;
    
    // Iterates over apv values at given position (accounting for partial coverage)
    var apv;
    for (apv in this.apv[position][type]){
        if (damageApplied === false){
            if (coverageRoll <= this.apv[position][type][apv].coverage) { //if coverage roll is less than apv coverage
                damageDeflected = this.apv[position][type][apv].value;
                
                //If all damage is deflected, do blunt trauma. Modifies damage variable for next if statement
                if (damage + damageDeflected >= 0){
                    //If surface, cut, or pierce, cut in half and apply as impact
                    if (type === "Surface" || type === "Cut" || type === "Pierce"){                        
                        damage = Math.ceil(damage/2);
                        damageDeflected = this.apv[position].Impact[apv].value;
                        
                        if (damage + damageDeflected >= 0){
                            damageDeflected = -damage;
                            damage = 0;
                        }
                    }
                    //If chop, or thrust, apply 3/4 as impact
                    else if (type === "Chop" || type === "Thrust"){
                        damage = Math.ceil(damage*0.75);
                        damageDeflected = this.apv[position].Impact[apv].value;
                        
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
    var item = this.inventory.value[this[hand].value._id];

    if(!_.isUndefined(item) && item.type === "weapon"){
        return item.grips[this[hand].value.grip].family;
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

    if(this.leftHand.value._id !== this.rightHand.value._id &&
        leftHand !== "Not a Weapon" &&
        rightHand !== "Not a Weapon"){
        return true;
    }
    else{
        return false;
    }
};

MML.initiativeRoll = function initiativeRoll(){
    var rollValue = MML.rollDice(1, 10);
    this.updateCharacter("action");
    this.ready.value = true;
    this.updateCharacter("ready");

    state.MML.players[this.player.value].currentRoll = {
        who: this.who,
        name: "initiative",
        value: rollValue,
        getResult: "initiativeResult",
        applyResult: "initiativeApply",
        range: "1-10",
        accepted: false
    };
    MML.initiativeResult.apply(this, []);
};

MML.initiativeResult = function initiativeResult(){
    state.MML.players[this.player.value].currentRoll.rollResult = state.MML.players[this.player.value].currentRoll.value + 
                                this.situationalInitBonus.value + 
                                this.movementRatioInitBonus.value +
                                this.attributeInitBonus.value + 
                                this.senseInitBonus.value +
                                this.fomInitBonus.value +
                                this.firstActionInitBonus.value +
                                this.spentInitiative.value;

    state.MML.players[this.player.value].currentRoll.message = "Roll: " + state.MML.players[this.player.value].currentRoll.value + 
                                                               "\nResult: " + state.MML.players[this.player.value].currentRoll.rollResult + 
                                                               "\nRange: " + state.MML.players[this.player.value].currentRoll.range;

    if(state.MML.players[this.player.value].name === state.MML.GM.player){
        if(state.MML.players[this.player.value].currentRoll.accepted === false){
            MML.displayGmRoll.apply(state.MML.players[this.player.value], []);
        }
        else{
            MML.initiativeApply.apply(this, []);
        }
    }
    else{
        MML.displayPlayerRoll.apply(state.MML.players[this.player.value], []);
    }
};

MML.initiativeApply = function initiativeApply(){
    this.initiativeRoll.value = state.MML.players[this.player.value].currentRoll.value;
    this.updateCharacter("initiativeRoll");

    
    state.MML.players[this.player.value].characterIndex++;
    if(state.MML.players[this.player.value].characterIndex < state.MML.players[this.player.value].characters.length){
        MML.charMenuPrepareAction.apply(state.MML.players[this.player.value], [this.name.value]);
    }
    else if(state.MML.players[this.player.value].name === state.MML.GM.player){
        MML.GmMenuStartRound.apply(state.MML.players[this.player.value], ["GM"]);
    }
    MML.displayMenu.apply(state.MML.players[this.player.value], []);
};

MML.startAttackAction = function startAttackAction(){
    if(_.contains(this.action.value.modifiers, ["Called Shot"])){
        MML.menuSelectBodyPart.apply(state.MML.players[this.player.value], [this.name.value]);
    }
    else if(_.contains(this.action.value.modifiers, ["Called Shot Specific"])){
        MML.menuSelectHitPosition.apply(state.MML.players[this.player.value], [this.name.value]);
    }
    else if(_.contains(this.action.value.modifiers, ["Aim"])){
        if(MML.hasStatusEffect("Taking Aim")){
            this.statusEffects.value["Taking Aim"].level++;
        }
        else{
            this.statusEffects.value["Taking Aim"] = { name: "Taking Aim", level: 1, target: this.action.value.targets[0] };
        }
    }
    else{
        MML.getAttackRoll.apply(this, []);
    }
};


MML.statusEffects = {};
MML.statusEffects["Major Wound"] = function(effect, index){
    if(this[effect.bodyPart].value > Math.round(this[effect.bodyPart + "Max"].value/2)){
        delete this.statusEffects[index];
    }
    else{
        if(this.situationalInitBonus.value !== "No Combat"){
            this.situationalInitBonus.value += -5;
        }
        if(effect.duration > 0){
            this.situationalMod.value += -10;
        }
    }
};
MML.statusEffects["Disabling Wound"] = function(effect, index){
    if(this[effect.bodyPart].value > 0){
        delete this.statusEffects[index];
    }
    else{
        if(this.situationalInitBonus.value !== "No Combat"){
            this.situationalInitBonus.value += -10;
        }
        this.situationalMod.value += -25;
    }
};
MML.statusEffects["Mortal Wound"] = function(effect, index){
    if(this[effect.bodyPart].value <= -this[effect.bodyPart + "Max"].value){
        delete this.statusEffects[index];
    }
    else{
        this.situationalInitBonus.value = "No Combat";
    }
};
MML.statusEffects["Wound Fatigue"] = function(effect, index){
    if(this.situationalInitBonus.value !== "No Combat"){
        this.situationalInitBonus.value += -5;
    }
    this.situationalMod.value  += -10;
};
MML.statusEffects["Number of Defenses"] = function(effect, index){
    this.missileDefenseMod.value += -20 * effect.number;
    this.meleeDefenseMod.value += -20 * effect.number;
};
MML.statusEffects["Fatigue"] = function(effect, index){
    if(this.situationalInitBonus.value !== "No Combat"){
        this.situationalInitBonus.value += -5*effect.level;
    }
    this.situationalMod.value  += -10*effect.level;
};
MML.statusEffects["Sensitive Area"] = function(effect, index){
    if(effect.duration < 1){
        delete this.statusEffects[index];
    }
    else{
        if(this.situationalInitBonus.value !== "No Combat"){
            this.situationalInitBonus.value += -5;
        }
    }
    if(effect.duration > 1){
        this.situationalMod.value  += -10;
    }
};
MML.statusEffects["Stumbling"] = function(effect, index){
    if(effect.duration < 1){
        delete this.statusEffects[index];
    }
    else{
        if(this.situationalInitBonus.value !== "No Combat"){
            this.situationalInitBonus.value += -5;
        }
    }
};
MML.statusEffects["Called Shot"] = function(effect, index){
    if(!_.contains(this.action.value.modifiers, "Called Shot")){
        delete this.statusEffects[index];
    }

    else{
        this.missileDefenseMod.value += -10;
        this.meleeDefenseMod.value += -10;
        this.missileAttackMod.value += -10;
        this.meleeAttackMod.value += -10;
        if(this.situationalInitBonus.value !== "No Combat"){
            this.situationalInitBonus.value += -5;
        }
    }
};
MML.statusEffects["Called Shot Specific"] = function(effect, index){
    if(!_.contains(this.action.value.modifiers, "Called Shot Specific")){
        delete this.statusEffects[index];
    }
    else{
        this.missileDefenseMod.value += -30;
        this.meleeDefenseMod.value += -30;
        this.meleeAttackMod.value += -30;
        this.missileAttackMod.value += -30;
        if(this.situationalInitBonus.value !== "No Combat"){
            this.situationalInitBonus.value += -5;
        }
    }
};
MML.statusEffects["Aggressive Stance"] = function(effect, index){
    if(!_.contains(this.action.value.modifiers, "Aggressive Stance")){
        // log("aggro deleted");
        delete this.statusEffects[index];
        // log(this.statusEffects);
    }
    else{
        this.missileDefenseMod.value += -40;
        this.meleeDefenseMod.value += -40;
        this.meleeAttackMod.value += 10;
        this.perceptionCheckMod.value += -4;
        if(this.situationalInitBonus.value !== "No Combat"){
            this.situationalInitBonus.value += 5;
        }
    }
};
MML.statusEffects["Defensive Stance"] = function(effect, index){
    if(!_.contains(this.action.value.modifiers, "Defensive Stance")){
        delete this.statusEffects[index];
    }
    else{
        this.missileDefenseMod.value += 40;
        this.meleeDefenseMod.value += 40;
        this.meleeAttackMod.value += -30;
        this.perceptionCheckMod.value += -4;
        if(this.situationalInitBonus.value !== "No Combat"){
            this.situationalInitBonus.value += -5;
        }
    }
};
MML.statusEffects["Observe"] = function(effect, index){
    if(effect.duration > 0){
        // Observing this round
        this.perceptionCheckMod.value += 4;
        this.missileDefenseMod.value += -10;
        this.meleeDefenseMod.value += -10;
    }
    else{
        //observed previous round
        if(this.situationalInitBonus.value !== "No Combat" && !MML.hasStatusEffect("Number of Defenses")){
            this.situationalInitBonus.value += 5;
            if(MML.isWieldingMissileWeapon.apply(this, [])){
                this.missileAttackMod.value += 15;
            }
        }
        delete this.statusEffects[index];    
    }
};
MML.statusEffects["Taking Aim"] = function(effect, index){
    if(MML.hasStatusEffect.apply(this, ["Number of Defenses"]) ||
       MML.hasStatusEffect.apply(this, ["Damaged This Round"]) ||
       MML.hasStatusEffect.apply(this, ["Dodged This Round"]) ||
       this.action.value.targets[0] !== effect.target)
    {
        delete this.statusEffects.value[index];
    }
    else{
        if(effect.level === 1){
            this.missileAttackMod.value += 30;
        }
        else if(effect.level === 2){
            this.missileAttackMod.value += 40;
        }
    }
};
MML.statusEffects["Aim"] = function(effect, index){
    // if(MML.hasStatusEffect.apply(this, ["Number of Defenses"]) ||
    //    MML.hasStatusEffect.apply(this, ["Damaged This Round"]) ||
    //    MML.hasStatusEffect.apply(this, ["Dodged This Round"]))
    // {
    //     this.statusEffects.value[index]
    // }
    // else if(state.MML.GM.roundStarted === false){
    //     if(effect.level === 1){
    //         this.missileAttackMod.value += 30;
    //     }
    //     else if(effect.level === 2){
    //         this.missileAttackMod.value += 40;
    //     }
    //}
};
MML.statusEffects["Damaged This Round"] = function(effect, index){

};
MML.statusEffects["Dodged This Round"] = function(effect, index){

};
MML.statusEffects["Melee This Round"] = function(effect, index){
    if(state.MML.GM.roundStarted === false){
        this.roundsExertion.value++;
        delete this.statusEffects.value[index];
    }
};

// //Give weapons functions and set character's getAttackRoll equal to it
MML.attackRoll = function attackRoll(){
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
//     var weaponSkill = Math.round(this.skills[weapon.name].value/2);
//  var shieldMod = this.inventory.shield.defenseMod;
//  var dodgeSkill = this.skills.dodge.value;
//  var defaultMartialSkill = this.skills.defaultMartial.value;
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

//  //var position = MML.rollHitPosition(state.MML.characters[charName].action.elevation, defender, target);
//  state.MML.Combat.turnInfo.currentRoll = this.universalRoll([task, skill, attackerSitMod, attackMod]);

// };

MML.unarmedAttack = function unarmedAttack(charName){};

MML.readyItemAction = function readyItemAction(charName){};

MML.castSpellAction = function castSpellAction(charName){};

MML.observeAction = function observeAction(charName){};
