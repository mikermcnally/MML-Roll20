MML.test = function test(){
    log("test");
    state.MML.GM.characters["tori"] = {};
    state.MML.GM.characters["tori"].menu = MML.charMenuStart;
    state.MML.GM.characters["tori"].player = "Robot";

    state.MML.GM.characters["tori"].name = {
        value: "tori",
        dependents: [],
        compute: function(){
            return MML.getCurrentAttribute(this.name.value, "name");
        }
    };
    state.MML.GM.characters["tori"].race = { 
        value: "Human", 
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
                    "load",],
        compute: function(){
            return MML.getCurrentAttribute(this.name.value, "race");
        }
    };
    state.MML.GM.characters["tori"].gender = { 
        value: "Male", 
        dependents: ["stature"], //"magic bonus for females"],
        compute: function(){
            return MML.getCurrentAttribute(this.name.value, "gender");
        } 
    };
    state.MML.GM.characters["tori"].height = { 
        value: "", 
        dependents: [], 
        compute: function(){
            return MML.statureTables[this.race.value][this.gender.value][MML.getCurrentAttributeAsInt(this.name.value, "statureRoll")].height;
        }
    };
    state.MML.GM.characters["tori"].weight = { 
        value: "", 
        dependents: [], 
        compute: function(){
            return MML.statureTables[this.race.value][this.gender.value][MML.getCurrentAttributeAsInt(this.name.value, "statureRoll")].weight;
        } 
    };
    state.MML.GM.characters["tori"].handedness = { 
        value: "Right", 
        dependents: [], // "meleeAttackMod"
        compute: function(){
            return MML.getCurrentAttributeAsInt(this.name.value, "handedness");
        } 
    };
    state.MML.GM.characters["tori"].stature = { 
        value: 10, 
        dependents: ["load",
                    "headHPMax",
                    "chestHPMax",
                    "abdomenHPMax",
                    "leftArmHPMax",
                    "rightArmHPMax",
                    "leftLegHPMax",
                    "rightLegHPMax",
                    "multiWoundMax"],
                    //"knockdown"], 
        compute: function(){
            log(MML.statureTables[this.race.value][this.gender.value][MML.getCurrentAttributeAsInt(this.name.value, "statureRoll")].stature);
            return MML.statureTables[this.race.value][this.gender.value][MML.getCurrentAttributeAsInt(this.name.value, "statureRoll")].stature;
        } };
    state.MML.GM.characters["tori"].strength = { 
        value: 10, 
        dependents: ["fitness",
                    "chestHPMax"], //att/def mods
        compute: function(){
            return MML.getCurrentAttributeAsInt(this.name.value, "strengthRoll") + MML.racialAttributeBonuses[this.race.value].strength;
        } };
    state.MML.GM.characters["tori"].coordination = { 
        value: 10, 
        dependents: [], //att/def/skill mods
        compute: function(){
            return MML.getCurrentAttributeAsInt(this.name.value, "coordinationRoll") + MML.racialAttributeBonuses[this.race.value].coordination;
        } };
    state.MML.GM.characters["tori"].health = { 
        value: 10, 
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
                    "multiWoundMax"
                    ], 
        compute: function(){
            return MML.getCurrentAttributeAsInt(this.name.value, "healthRoll") + MML.racialAttributeBonuses[this.race.value].health;
        } };
    state.MML.GM.characters["tori"].beauty = { 
        value: 10, 
        dependents: [], //skill mods
        compute: function(){
            return MML.getCurrentAttributeAsInt(this.name.value, "beautyRoll") + MML.racialAttributeBonuses[this.race.value].beauty;
        } };
    state.MML.GM.characters["tori"].intellect = { 
        value: 10, 
        dependents: ["perception", "evocation"], //spell learning/skill mods
        compute: function(){
            return MML.getCurrentAttributeAsInt(this.name.value, "intellectRoll") + MML.racialAttributeBonuses[this.race.value].intellect;
        } 
    };
    state.MML.GM.characters["tori"].reason = { 
        value: 10, 
        dependents: ["perception", "evocation"], //casting/skill mods
        compute: function(){
            return MML.getCurrentAttributeAsInt(this.name.value, "reasonRoll") + MML.racialAttributeBonuses[this.race.value].reason;
        } 
    };
    state.MML.GM.characters["tori"].creativity = { 
        value: 10, 
        dependents: ["perception", "evocation"], //skill mods
        compute: function(){
            return MML.getCurrentAttributeAsInt(this.name.value, "creativityRoll") + MML.racialAttributeBonuses[this.race.value].creativity;
        } 
    };
    state.MML.GM.characters["tori"].presence = {
        value: 10,
        dependents: ["willpower",
                    "systemStrength"],
        compute: function(){
            return MML.getCurrentAttributeAsInt(this.name.value, "presenceRoll") + MML.racialAttributeBonuses[this.race.value].presence;
        } 
    };
    state.MML.GM.characters["tori"].willpower = {
        value: 0,
        dependents: ["evocation",
                    "multiWound"],
        compute: function(){
            return Math.round((2*this.presence.value + this.health.value)/3);
        } 
    };
    state.MML.GM.characters["tori"].evocation = { 
        value: 10, 
        dependents: [], //skill mods
        compute: function(){
            return this.intellect.value + 
                    this.reason.value + 
                    this.creativity.value + 
                    this.health.value + 
                    this.willpower.value + 
                    MML.racialAttributeBonuses[this.race.value].evocation;
        } 
    };
    state.MML.GM.characters["tori"].perception = { 
        value: 10, 
        dependents: [], //ranged attack mod
        compute: function(){
            return Math.round((this.intellect.value + this.reason.value + this.creativity.value)/3) + MML.racialAttributeBonuses[this.race.value].perception;
        } 
    };
    state.MML.GM.characters["tori"].systemStrength = { 
        value: 0, 
        dependents: [], 
        compute: function(){
            return Math.round((this.presence.value + 2*this.health.value)/3);
        } 
    };
    state.MML.GM.characters["tori"].fitness = { 
        value: 10, 
        dependents: ["fitnessMod"], //skill mods, fatigue value
        compute: function(){
            return Math.round((this.health.value + this.strength.value)/2) + MML.racialAttributeBonuses[this.race.value].fitness;
        }
    };
    state.MML.GM.characters["tori"].fitnessMod = { 
        value: 10, 
        dependents: ["load"], //skill mods
        compute: function(){
            return MML.fitnessModLookup[this.fitness.value];
        }
    };
    state.MML.GM.characters["tori"].load = { 
        value: 10, 
        dependents: ["overhead",
                    "deadLift"], //"damageMod", "movementRatio"
        compute: function(){
            return Math.round(this.stature.value * this.fitnessMod.value) + MML.racialAttributeBonuses[this.race.value].load;
        }
    };
    state.MML.GM.characters["tori"].overhead = { 
        value: 10, 
        dependents: [], 
        compute: function(){
            return this.load.value*2;
        }
    };
    state.MML.GM.characters["tori"].deadLift = { 
        value: 10, 
        dependents: [], 
        compute: function(){
            return this.load.value*4;
        }
    };
    
    
    // HP stuff
    state.MML.GM.characters["tori"].multiWoundMax = { value: 0, dependents: ["multiWound"],
        compute: function(){
            return Math.round((this.health.value + this.stature.value + this.willpower.value)/2);
        }
    };
    state.MML.GM.characters["tori"].multiWound = { value: 0, dependents: [],
        compute: function(){
            return this.multiWoundMax.value;
        }
    };
    state.MML.GM.characters["tori"].headHPMax = { value: 0, dependents: ["headHP"],
        compute: function(){
            return MML.HPTables[this.race.value][Math.round(this.health.value + this.stature.value/3)];
        }
    };
    state.MML.GM.characters["tori"].headHP = { value: 0, dependents: [],
        compute: function(){
            return this.headHPMax.value;
        }
    };
    state.MML.GM.characters["tori"].chestHPMax = { value: 0, dependents: ["chestHP"],
         compute: function(){
            return MML.HPTables[this.race.value][Math.round((this.health.value + this.stature.value + this.strength.value)/2)];
        }
    };
    state.MML.GM.characters["tori"].chestHP = { value: 0, dependents: [],
        compute: function(){
            return this.chestHPMax.value;
        }
    };
    state.MML.GM.characters["tori"].abdomenHPMax = { value: 0, dependents: ["abdomenHP"],
         compute: function(){
            return MML.HPTables[this.race.value][Math.round(this.health.value + this.stature.value)];
        }
    };
    state.MML.GM.characters["tori"].abdomenHP = { value: 0, dependents: [],
        compute: function(){
            return this.abdomenHPMax.value;
        }
    };
    state.MML.GM.characters["tori"].leftArmHPMax = { value: 0, dependents: ["leftArmHP"],
         compute: function(){
            return MML.HPTables[this.race.value][Math.round(this.health.value + this.stature.value)];
        }
    };
    state.MML.GM.characters["tori"].leftArmHP = { value: 0, dependents: [],
        compute: function(){
            return this.leftArmHPMax.value;
        }
    };
    state.MML.GM.characters["tori"].rightArmHPMax = { value: 0, dependents: ["rightArmHP"],
         compute: function(){
            return MML.HPTables[this.race.value][Math.round(this.health.value + this.stature.value)];
        }
    };
    state.MML.GM.characters["tori"].rightArmHP = { value: 0, dependents: [],
        compute: function(){
            return this.rightArmHPMax.value;
        }
    };
    state.MML.GM.characters["tori"].leftLegHPMax = { value: 0, dependents: ["leftLegHP"],
         compute: function(){
            return MML.HPTables[this.race.value][Math.round(this.health.value + this.stature.value)];
        }
    };
    state.MML.GM.characters["tori"].leftLegHP = { value: 0, dependents: [],
        compute: function(){
            return this.leftLegHPMax.value;
        }
    };
    state.MML.GM.characters["tori"].rightLegHPMax = { value: 0, dependents: ["rightLegHP"],
         compute: function(){
            return MML.HPTables[this.race.value][Math.round(this.health.value + this.stature.value)];
        }
    };
    state.MML.GM.characters["tori"].rightLegHP = { value: 0, dependents: [],
        compute: function(){
            return this.rightLegHPMax.value;
        }
    };

    // Inventory stuff
    state.MML.GM.characters["tori"].totalWeightCarried = { value: 0, dependents: [], compute: function(){} };
    state.MML.GM.characters["tori"].knockdownMax = { value: 0, dependents: [], compute: function(){} };
    state.MML.GM.characters["tori"].inventory = {
        value: [],
        dependents: ["totalWeightCarried",
                     "knockdownMax",
                     "apv"]
        compute: function(){

        }};
    state.MML.GM.characters["tori"].apv = {
        value: [],
        dependents: ["totalWeightCarried",
                     "knockdownMax",
                     "apv"]
        compute: function(){

        }
    };
    
    // Movement
    state.MML.GM.characters["tori"].movement = {};
    state.MML.GM.characters["tori"].movement.movementRatio = 4;
    state.MML.GM.characters["tori"].movement.available = 4;
    state.MML.GM.characters["tori"].movement.position = "Walk";
    state.MML.GM.characters["tori"].movement.rates = MML.movementRates.human;

    // Combat stuff
    state.MML.GM.characters["tori"].ready = false;
    state.MML.GM.characters["tori"].action = { name: "attack", roll: MML.charMenuAttackRoll, skill: 30, targets: ["uke"], style: "standard", calledShot: "standard", stance: "neutral", damageType: "primary", elevation: "level", flanking: "none" };
    state.MML.GM.characters["tori"].defense = { hitTable: "A", skill: 0, number: 0, dodge: false, shield: 0 };
    state.MML.GM.characters["tori"].initiative = { value: 0, roll: 0, situational: 0, movementRatio: 0, attribute: 0, sense: 0, fom: 0, action: 0, tempo: 0 };
    state.MML.GM.characters["tori"].modifiers = { hitTable: "A", skill: 0, style: "Block", number: 0, dodge: false, shield: 0 };
    state.MML.GM.characters["tori"].fatigue = { inMelee: false, rest: 0, level: 0, exertion: 0 };
    state.MML.GM.characters["tori"].damaged = false;
    state.MML.GM.characters["tori"].stun = {};
    state.MML.GM.characters["tori"].sensitive = -1;
    state.MML.GM.characters["tori"].stumble = -1;
    
    // Skills
    state.MML.GM.characters["tori"].skills = {};
    state.MML.GM.characters["tori"].skills.Maul = { value: 30 };
    state.MML.GM.characters["tori"].skills.dodge = { value: 30 };
    state.MML.GM.characters["tori"].skills.defaultMartial = { value: 15 };

    state.MML.GM.characters["tori"].setReady = MML.setReady;
    state.MML.GM.characters["tori"].computeSitMods = MML.computeSitMods;
    state.MML.GM.characters["tori"].rollInitiative = MML.rollInitiative;
    state.MML.GM.characters["tori"].setInitiative = MML.setInitiative;
    state.MML.GM.characters["tori"].attackRoll = MML.attackRoll;
    state.MML.GM.characters["tori"].weaponDamageRoll = MML.weaponDamageRoll;
    state.MML.GM.characters["tori"].defenseRoll = MML.defenseRoll;
    state.MML.GM.characters["tori"].meleeAttack = MML.meleeAttack;
    state.MML.GM.characters["tori"].checkKnockdown = MML.checkKnockdown;
    state.MML.GM.characters["tori"].knockdownRoll = MML.knockdownRoll;
    state.MML.GM.characters["tori"].isSensitiveArea = MML.isSensitiveArea;
    state.MML.GM.characters["tori"].sensitiveAreaRoll = MML.sensitiveAreaRoll;
    state.MML.GM.characters["tori"].woundRoll = MML.woundRoll;
    state.MML.GM.characters["tori"].hitPositionRoll = MML.rollHitPosition;
    state.MML.GM.characters["tori"].attributeCheckRoll = MML.attributeCheckRoll;    
    state.MML.GM.characters["tori"].universalRoll = MML.universalRoll;
    state.MML.GM.characters["tori"].alterHP = MML.alterHP; 
    state.MML.GM.characters["tori"].setMultiWound = MML.setMultiWound;
    state.MML.GM.characters["tori"].newRoundUpdate = MML.newRoundUpdate;
    state.MML.GM.characters["tori"].displayMenu = MML.displayMenu;
    state.MML.GM.characters["tori"].moveDistance = MML.moveDistance;
    state.MML.GM.characters["tori"].displayMovement = MML.displayMovement;
    state.MML.GM.characters["tori"].set = function(attribute){
        var attributeArray = [attribute];

        for(var i = 0; i < attributeArray.length; i++){ //length of array is dynamic, for-in doesn't work here
            var localAttribute = this[attributeArray[i]];

            var dependent;
            for(dependent in localAttribute.dependents){
                var localDependent = localAttribute.dependents[dependent];
     
                //check to see if the attributeArray already contains the dependent attribute
                if(attributeArray.indexOf(localDependent) == -1){
                    attributeArray.push(localDependent);
                }
            }       
        }
        
        for(var index in attributeArray){
            var value = this[attributeArray[index]].compute.apply(this, []); // Run compute function from character scope
            log(attributeArray[index] + " " + value);
            this[attributeArray[index]].value = value;
            MML.setCurrentAttribute(this.name.value, attributeArray[index], value);
        }
    };

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
    state.MML.GM.characters["uke"] = {};
    state.MML.GM.characters["uke"].menu = MML.charMenuStart;
    state.MML.GM.characters["uke"].player = "Robot";
    
    state.MML.GM.characters["uke"].name = "uke";
    state.MML.GM.characters["uke"].race = "Human";
    state.MML.GM.characters["uke"].gender = "Male";
    state.MML.GM.characters["uke"].height = 0;
    state.MML.GM.characters["uke"].weight = 0;
    state.MML.GM.characters["uke"].handedness = "Right";
    state.MML.GM.characters["uke"].stature = 10;
    state.MML.GM.characters["uke"].strength = 10;
    state.MML.GM.characters["uke"].coordination = 10;
    state.MML.GM.characters["uke"].health = 10;
    state.MML.GM.characters["uke"].beauty = 10;
    state.MML.GM.characters["uke"].intellect = 10;
    state.MML.GM.characters["uke"].reason = 10;
    state.MML.GM.characters["uke"].creativity = 10;
    state.MML.GM.characters["uke"].presence = 10;
    state.MML.GM.characters["uke"].willpower = 0;
    state.MML.GM.characters["uke"].evocation = 0;
    state.MML.GM.characters["uke"].perception = 0;
    state.MML.GM.characters["uke"].systemStrength = 0;
    state.MML.GM.characters["uke"].fitness = 0;
    state.MML.GM.characters["uke"].fitnessMod = 0;
    state.MML.GM.characters["uke"].load = 0;
    state.MML.GM.characters["uke"].overhead = 0;
    state.MML.GM.characters["uke"].deadLift = 0;
    
    // HP stuff
    state.MML.GM.characters["uke"].multiWound = { current: 0, max: 0, wound: false };
    state.MML.GM.characters["uke"].headHP = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    state.MML.GM.characters["uke"].chestHP = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    state.MML.GM.characters["uke"].abdomenHP = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    state.MML.GM.characters["uke"].leftArmHP = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    state.MML.GM.characters["uke"].rightArmHP = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    state.MML.GM.characters["uke"].leftLegHP = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    state.MML.GM.characters["uke"].rightLegHP = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    
    // Inventory stuff
    state.MML.GM.characters["uke"].totalWeightCarried = 0;
    state.MML.GM.characters["uke"].knockdown = { current: 0, max: 0 };
    
    state.MML.GM.characters["uke"].inventory = [];
    state.MML.GM.characters["uke"].apv = [];
    
    // Movement
    state.MML.GM.characters["uke"].movement = {};
    state.MML.GM.characters["uke"].movement.movementRatio = 4;
    state.MML.GM.characters["uke"].movement.available = 4;
    state.MML.GM.characters["uke"].movement.position = "Walk";
    state.MML.GM.characters["uke"].movement.rates = MML.movementRates.human;

    // Roll storage
    state.MML.GM.characters["uke"].currentRoll = { accepted: false };
    
    // combat stuff
    state.MML.GM.characters["uke"].ready = false;
    state.MML.GM.characters["uke"].action = { name: "attack", roll: MML.charMenuAttackRoll, skill: 0, targets: ["tori"], style: "standard", calledShot: "standard", stance: "neutral", damageType: "primary", elevation: "level", flanking: "none" };
    state.MML.GM.characters["uke"].defense = { hitTable: "A", skill: 0, style: "Block", number: 0, dodge: false, shield: 0 };
    state.MML.GM.characters["uke"].initiative = { value: 0, roll: 0, situational: 0, movementRatio: 0, attribute: 0, sense: 0, fom: 0, action: 0, tempo: 0 };
    state.MML.GM.characters["uke"].modifiers = { situational: 0, attack: 0, defense: 0, casting: 0 };
    state.MML.GM.characters["uke"].fatigue = { inMelee: false, rest: 0, level: 0, exertion: 0 };
    state.MML.GM.characters["uke"].damaged = false;
    state.MML.GM.characters["uke"].stun = {};
    state.MML.GM.characters["uke"].sensitive = -1;
    state.MML.GM.characters["uke"].stumble = -1;
    
    // Skills
    state.MML.GM.characters["uke"].skills = {};
    state.MML.GM.characters["uke"].skills.Club = { value: 30 };
    state.MML.GM.characters["uke"].skills.dodge = { value: 30 };
    state.MML.GM.characters["uke"].skills.defaultMartial = { value: 15 };

    state.MML.GM.characters["uke"].setReady = MML.setReady;
    state.MML.GM.characters["uke"].computeSitMods = MML.computeSitMods;
    state.MML.GM.characters["uke"].rollInitiative = MML.rollInitiative;
    state.MML.GM.characters["uke"].setInitiative = MML.setInitiative;
    state.MML.GM.characters["uke"].attackRoll = MML.attackRoll;
    state.MML.GM.characters["uke"].weaponDamageRoll = MML.weaponDamageRoll;
    state.MML.GM.characters["uke"].defenseRoll = MML.defenseRoll;
    state.MML.GM.characters["uke"].meleeAttack = MML.meleeAttack;
    state.MML.GM.characters["uke"].checkKnockdown = MML.checkKnockdown;
    state.MML.GM.characters["uke"].knockdownRoll = MML.knockdownRoll;
    state.MML.GM.characters["uke"].sensitiveAreaRoll = MML.sensitiveAreaRoll;
    state.MML.GM.characters["uke"].isSensitiveArea = MML.isSensitiveArea;
    state.MML.GM.characters["uke"].woundRoll = MML.woundRoll;
    state.MML.GM.characters["uke"].hitPositionRoll = MML.rollHitPosition;
    state.MML.GM.characters["uke"].attributeCheckRoll = MML.attributeCheckRoll;
    state.MML.GM.characters["uke"].universalRoll = MML.universalRoll;
    state.MML.GM.characters["uke"].alterHP = MML.alterHP; 
    state.MML.GM.characters["uke"].setMultiWound = MML.setMultiWound;
    state.MML.GM.characters["uke"].newRoundUpdate = MML.newRoundUpdate;
    state.MML.GM.characters["uke"].displayMenu = MML.displayMenu;
    state.MML.GM.characters["uke"].moveDistance = MML.moveDistance;
    state.MML.GM.characters["uke"].displayMovement = MML.displayMovement;

    state.MML.GM.characters["uke"].interrupts = [];
    state.MML.GM.characters["uke"].statusEffects = [];

    
    // MML.initChar("tori");
    // MML.initChar("uke");
    state.MML.players = {};
    state.MML.players["Robot"] = {
        name: "Robot",
        displayMenu: MML.displayMenu,
        setMenu: MML.GmMenuMain,
        characters: ["uke", "tori"],
        characterIndex: 0
    };
    state.MML.players.Robot.setMenu(MML.GmMenuMain, "GM");
    //log(state.MML.players.Robot.menu.buttons);
    state.MML.players.Robot.displayMenu();

    // for(var i = 1; i < 101; i++){
    //     if( i%3 === 0 && i%5 === 0){
    //         log('FizzBuzz');
    //     }
    //     else if(i%3 === 0){
    //         log('Fizz');
    //     }
    //     else if( i%5 === 0){
    //         log('Buzz');
    //     }
    //     else{
    //         log(i);
    //     }
    // }
    // state.MML.GM.selectedCharacters = ["tori", "uke"];
    // state.MML.GM.characters["uke"].setReady(true);
    // state.MML.GM.characters["tori"].setReady(true);
    // state.MML.GM.characters["tori"].menu("Ready");
    // state.MML.GM.characters["uke"].menu("Ready");
    // state.MML.GM.menu("Perform Action");
    // state.MML.GM.menu("Roll to Hit");
    // state.MML.GM.currentRoll.value = 20;
    // sendChat("", "!acceptRoll", null, {noarchive: false});
    // state.MML.GM.characters[state.MML.GM.currentTarget].menu("Block");
    // state.MML.GM.currentRoll.value = 70
    // sendChat("", "!acceptRoll", null, {noarchive: false});
};

// Shield of reflection: returns arrows back to shooter as dart spell
