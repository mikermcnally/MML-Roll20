MML.test = function test(){
    log("test");
    state.MML.GM.characters["tori"] = {};
    state.MML.GM.characters["tori"].menu = MML.characterMenuStart;
    state.MML.GM.characters["tori"].player = "Robot";

    state.MML.GM.characters["tori"].name = "tori";
    state.MML.GM.characters["tori"].race = "Human";
    state.MML.GM.characters["tori"].gender = "Male";
    state.MML.GM.characters["tori"].height = 0;
    state.MML.GM.characters["tori"].weight = 0;
    state.MML.GM.characters["tori"].handedness = "Right";
    state.MML.GM.characters["tori"].stature = 10;
    state.MML.GM.characters["tori"].strength = 10;
    state.MML.GM.characters["tori"].coordination = 10;
    state.MML.GM.characters["tori"].health = 10;
    state.MML.GM.characters["tori"].beauty = 10;
    state.MML.GM.characters["tori"].intellect = 10;
    state.MML.GM.characters["tori"].reason = 10;
    state.MML.GM.characters["tori"].creativity = 10;
    state.MML.GM.characters["tori"].presence = 10;
    state.MML.GM.characters["tori"].willpower = 0;
    state.MML.GM.characters["tori"].evocation = 0;
    state.MML.GM.characters["tori"].perception = 0;
    state.MML.GM.characters["tori"].systemStrength = 0;
    state.MML.GM.characters["tori"].fitness = 0;
    state.MML.GM.characters["tori"].fitnessMod = 0;
    state.MML.GM.characters["tori"].load = 0;
    state.MML.GM.characters["tori"].overhead = 0;
    state.MML.GM.characters["tori"].deadLift = 0;
    
    // HP stuff
    state.MML.GM.characters["tori"].multiWound = { current: 0, max: 0, wound: false };
    state.MML.GM.characters["tori"].hpHead = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    state.MML.GM.characters["tori"].hpChest = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    state.MML.GM.characters["tori"].hpAb = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    state.MML.GM.characters["tori"].hpLA = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    state.MML.GM.characters["tori"].hpRA = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    state.MML.GM.characters["tori"].hpLL = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    state.MML.GM.characters["tori"].hpRL = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    
    // Inventory stuff
    state.MML.GM.characters["tori"].totalWeightCarried = 0;
    state.MML.GM.characters["tori"].knockdown = { current: 0, max: 0 };
    state.MML.GM.characters["tori"].inventory = { inPack: [], armor: [], weapons: [], shield: MML.shieldStats["None"] };
    state.MML.GM.characters["tori"].inventory.weapons[0] = MML.weaponStats["Maul"];
    state.MML.GM.characters["tori"].inventory.weapons[0].equipped = "Right";
    state.MML.GM.characters["tori"].inventory.weapons[0].quality = "Standard";
    state.MML.GM.characters["tori"].apv = [];
    
    // Movement
    state.MML.GM.characters["tori"].movement = {};
    state.MML.GM.characters["tori"].movement.movementRatio = 4;
    state.MML.GM.characters["tori"].movement.available = 4;
    state.MML.GM.characters["tori"].movement.position = "Walk";
    state.MML.GM.characters["tori"].movement.rates = MML.movementRates.human;

    // Combat stuff
    state.MML.GM.characters["tori"].ready = false;
    state.MML.GM.characters["tori"].action = { name: "attack", rolls: MML.AttackRolls, skill: 30, targets: ["uke"], style: "standard", calledShot: "standard", stance: "neutral", damageType: "primary", elevation: "level", flanking: "none" };
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
    state.MML.GM.characters["uke"] = {};
    state.MML.GM.characters["uke"].menu = MML.characterMenuStart;
    state.MML.GM.characters["uke"].player = "GM";
    
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
    state.MML.GM.characters["uke"].hpHead = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    state.MML.GM.characters["uke"].hpChest = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    state.MML.GM.characters["uke"].hpAb = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    state.MML.GM.characters["uke"].hpLA = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    state.MML.GM.characters["uke"].hpRA = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    state.MML.GM.characters["uke"].hpLL = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    state.MML.GM.characters["uke"].hpRL = { current: 0, max: 0, wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    
    // Inventory stuff
    state.MML.GM.characters["uke"].totalWeightCarried = 0;
    state.MML.GM.characters["uke"].knockdown = { current: 0, max: 0 };
    
    state.MML.GM.characters["uke"].inventory = { inPack: [], armor: [], weapons: [], shield: MML.shieldStats["None"] };
    state.MML.GM.characters["uke"].inventory.weapons[0] = MML.weaponStats["Club"];
    state.MML.GM.characters["uke"].inventory.weapons[0].equipped = "Right";
    state.MML.GM.characters["uke"].inventory.weapons[0].quality = "Standard";
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
    state.MML.GM.characters["uke"].action = { name: "attack", rolls: MML.AttackRolls, skill: 0, targets: ["tori"], style: "standard", calledShot: "standard", stance: "neutral", damageType: "primary", elevation: "level", flanking: "none" };
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

    state.MML.GM.characters["uke"].interrupts = [];
    state.MML.GM.characters["uke"].statusEffects = [];

    
    MML.initChar("tori");
    MML.initChar("uke");
    state.MML.GM.menu = MML.GmMenuMain;
    state.MML.GM.menu("Combat");
    state.MML.GM.selectedCharacters = ["tori", "uke"];
    state.MML.GM.menu("Start Combat");
    state.MML.GM.characters["uke"].setReady(true);
    state.MML.GM.characters["tori"].setReady(true);
    state.MML.GM.menu("entry");
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
