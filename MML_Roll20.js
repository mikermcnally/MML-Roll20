var MML = MML || {};

MML.init = function init(){
    state.MML = state.MML || {};
    state.MML.GM = state.MML.GM || {
        player: "Robot",
        name: "GM",
    	currentAction: {},
		inCombat: false,
		currentRound: 0,
		roundStarted: false
	};

	state.MML.players = {};
    state.MML.players["Robot"] = {
        name: "Robot",
        who: "GM",
        menu: "GmMenuMain",
        buttons:[MML.menuButtons.GmMenuMain],
        characters: [],
        characterIndex: 0
    };
    state.MML.players["Andrew"] = {
        name: "Andrew",
        who: "",
        menu: "",
        characters: [],
        characterIndex: 0
    };
    _.each(state.MML.players, function(player){
		//Clear players' list of characters
		player.characters = [];
	});

	var characters = {};
	var characterObjects = findObjs({
        _type: "character",
        archived: false
    }, {caseInsensitive: false});

    _.each(characterObjects, function(character){
    	var charName = character.get("name");
    	characters[charName] = new MML.characterConstructor(charName);
    	//Add to player's list of characters
		state.MML.players[characters[charName].player].characters.push(charName);
    });
	state.MML.characters = characters;

	MML.test();
};
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
            triggeredFunction: "processAttack",
            input: {}   
        });
    }
};


MML.processAttack = function processAttack(input){
    this.statusEffects["Melee This Round"] = {};

    if (MML.isUnarmed(this)){
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "unarmedAttack",
            input: input   
        });
    }
    else if(MML.isDualWielding(this)){
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "dualWieldAttack",
            input: input   
        });
    }
    else if (MML.getWeaponFamily(this, "leftHand") === "MWD" || MML.getWeaponFamily(this, "leftHand") === "MWM"){
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "missileAttack",
            input: input   
        });
    }
    else if(MML.getWeaponFamily(this, "leftHand") === "TWH" || 
    MML.getWeaponFamily(this, "rightHand") === "TWH" ||
    MML.getWeaponFamily(this, "leftHand") === "TWK" ||
    MML.getWeaponFamily(this, "rightHand") === "TWK" ||
    MML.getWeaponFamily(this, "leftHand") === "TWS" ||
    MML.getWeaponFamily(this, "rightHand") === "TWS" ||
    MML.getWeaponFamily(this, "leftHand") === "SLI" ||
    MML.getWeaponFamily(this, "rightHand") === "SLI"){
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "throwingAttack",
            input: input   
        });
    }
    else {
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "meleeAttack",
            input: input   
        });
    }
};

MML.meleeAttack = function meleeAttack(input){ 
    var itemId;
    var skill;
    var attackerWeapon;
    input.attackMod = this.meleeAttackMod + this.attributeMeleeAttackMod;
    input.sitMod = this.situationalMod;

    if(MML.getWeaponFamily(this, "rightHand") !== "unarmed"){
        itemId = this.rightHand._id;
    }
    else{
        itemId = this.leftHand._id;
    }

    attackerWeapon = this.inventory[itemId];
    input.attackerWeapon = attackerWeapon;
    input.skill = MML.getWeaponSkill(this, attackerWeapon); 
    
    log(input.skill);
    
};

// MML.selectDamageTypeMenu

MML.meleeAttackRoll = function meleeAttackRoll(input){
    var roll;
    //Primary or secondary attack
    if (input.damageType === "primary"){
        roll = this.universalRoll([weapon.grip.primaryTask, skill, sitMod, attackMod]);
    }
    else {
        roll = this.universalRoll([weapon.grip.secondaryTask, skill, sitMod, attackMod]);
    }
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


// Todo: Add sweep attack

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

MML.observeAction = function observeAction(charName){};// Character Creation
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
MML.isSensitiveArea = function isSensitiveArea(position){
    if(position === 2 || position === 6 || position === 33){
        return true;
    }
    else{
        return false;
    }
};

MML.getWeaponFamily = function getWeaponFamily(character, hand){
    var item = character.inventory[character[hand]._id];

    if(!_.isUndefined(item) && item.type === "weapon"){
        return item.grips[character[hand].grip].family;
    }
    else{
        return "unarmed";
    }
};

MML.getWeaponSkill = function getWeaponSkill(character, weapon){
    var item = weapon;
    var grip;
    var skillName;
    var skill;
    
    if(item.type !== "weapon"){
        log("Not a weapon");
        MML.error();
    }

    if(character["rightHand"].grip !== "unarmed"){
        grip = character["rightHand"].grip;
    }
    else{
        grip = character["leftHand"].grip;
    }

    if(item.name === "War Spear" || item.name === "Boar Spear" || item.name === "Military Fork" || item.name === "Bastard Sword"){
        skillName = item.name + ", " + grip;
    }
    else{
        skillName = item.name;
    }

    if(typeof character.weaponSkills[skillName] !== "undefined"){
        skill = character.weaponSkills[skillName].level;
    }
    else{
        var relatedSkills = [];
        _.each(character.weaponSkills, function(relatedSkill){
            if(MML.items[relatedSkill.replace(", " + grip, "")].grips[grip].family === item.grips[grip].family){
                relatedSkills.push(character.weaponSkills[relatedSkill].level);
            }
        }, character);

        if(relatedSkills.length === 0){
            skill = character.weaponSkills["Default Martial"].level;
        }
        else{
            skill = _.max(relatedSkills) - 10;
        }
    }

    return skill;
};

MML.isWieldingMissileWeapon = function isWieldingMissileWeapon(character){
    var leftFamily = MML.getWeaponFamily(character, "leftHand");
    var rightFamily = MML.getWeaponFamily(character, "rightHand");

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

MML.isUnarmed = function isUnarmed(character){
    var leftHand = MML.getWeaponFamily(character, "leftHand");
    var rightHand = MML.getWeaponFamily(character, "rightHand");

    if(leftHand === "unarmed" && rightHand === "unarmed"){
        return true;
    }
    else{
        return false;
    }
};

MML.isDualWielding = function isDualWielding(character){
    var leftHand = MML.getWeaponFamily(character, "leftHand");
    var rightHand = MML.getWeaponFamily(character, "rightHand");

    if(character.leftHand._id !== character.rightHand._id &&
        leftHand !== "unarmed" &&
        rightHand !== "unarmed"){
        return true;
    }
    else{
        return false;
    }
};
MML.skills = {};
MML.skills["Acrobatics"] = {attribute: "coordination"};
MML.skills["Acting"] = {attribute: "presence"};
MML.skills["Alchemy"] = {attribute: "intellect"};
MML.skills["Animal Handling"] = {attribute: "presence"};
MML.skills["Animal Husbandry"] = {attribute: "reason"};
MML.skills["Armorer"] = {attribute: "reason"};
MML.skills["Blacksmith"] = {attribute: "coordination"};
MML.skills["Botany"] = {attribute: "intellect"};
MML.skills["Bowyer"] = {attribute: "coordination"};
MML.skills["Brawling"] = {attribute: "combat"};
MML.skills["Brewing"] = {attribute: "reason"};
MML.skills["Bureaucracy"] = {attribute: "creativity"};
MML.skills["Caligraphy"] = {attribute: "creativity"};
MML.skills["Camouflage"] = {attribute: "reason"};
MML.skills["Carpentry"] = {attribute: "coordination"};
MML.skills["Cartography"] = {attribute: "reason"};
MML.skills["Climbing"] = {attribute: "coordination"};
MML.skills["Cooking"] = {attribute: "reason"};
MML.skills["Dancing"] = {attribute: "creativity"};
MML.skills["Diplomacy"] = {attribute: "presence"};
MML.skills["Disguise"] = {attribute: "creativity"};
MML.skills["Dowsing"] = {attribute: "reason"};
MML.skills["Ecology, Specific"] = {attribute: "intellect"};
MML.skills["Earth Elementalism"] = {attribute: "intellect"};
MML.skills["Air Elementalism"] = {attribute: "intellect"};
MML.skills["Fire Elementalism"] = {attribute: "intellect"};
MML.skills["Water Elementalism"] = {attribute: "intellect"};
MML.skills["Life Elementalism"] = {attribute: "intellect"};
MML.skills["Engineering"] = {attribute: "intellect"};
MML.skills["Etiquette"] = {attribute: "presence"};
MML.skills["Falconry"] = {attribute: "reason"};
MML.skills["First Aid"] = {attribute: "reason"};
MML.skills["Fishing"] = {attribute: "reason"};
MML.skills["Fletchery"] = {attribute: "coordination"};
MML.skills["Foraging"] = {attribute: "reason"};
MML.skills["Forced March"] = {attribute: "Health"};
MML.skills["Forgery"] = {attribute: "creativity"};
MML.skills["Gambling"] = {attribute: "reason"};
MML.skills["Gem Cutting"] = {attribute: "reason"};
MML.skills["Geology"] = {attribute: "intellect"};
MML.skills["Hand Signalling"] = {attribute: "coordination"};
MML.skills["Heraldry"] = {attribute: "reason"};
MML.skills["Herbalism"] = {attribute: "reason"};
MML.skills["History"] = {attribute: "intellect"};
MML.skills["Horsemanship"] = {attribute: "coordination"};
MML.skills["Hunting and Trapping"] = {attribute: "reason"};
MML.skills["Jeweler"] = {attribute: "creativity"};
MML.skills["Knowledge"] = {attribute: "intellect"};
MML.skills["Language"] = {attribute: "creativity"};
MML.skills["Leatherworking"] = {attribute: "coordination"};
MML.skills["Literacy"] = {attribute: "intellect"};
MML.skills["Literature"] = {attribute: "intellect"};
MML.skills["Lock Picking"] = {attribute: "coordination"};
MML.skills["Lore"] = {attribute: "reason"};
MML.skills["Mathematics"] = {attribute: "intellect"};
MML.skills["Metallurgy"] = {attribute: "intellect"};
MML.skills["Mimicry"] = {attribute: "presence"};
MML.skills["Musical Instrument"] = {attribute: "creativity"};
MML.skills["Navigation"] = {attribute: "reason"};
MML.skills["Negotiation"] = {attribute: "presence"};
MML.skills["Oration"] = {attribute: "presence"};
MML.skills["Persuasion"] = {attribute: "presence"};
MML.skills["Physician"] = {attribute: "reason"};
MML.skills["Pick Pocket"] = {attribute: "coordination"};
MML.skills["Running"] = {attribute: "health"};
MML.skills["Scrounging"] = {attribute: "reason"};
MML.skills["Sculpture"] = {attribute: "creativity"};
MML.skills["Seamanship"] = {attribute: "reason"};
MML.skills["Sewing"] = {attribute: "coordination"};
MML.skills["Singing"] = {attribute: "presence"};
MML.skills["Sleight of Hand"] = {attribute: "coordination"};
MML.skills["Stalking"] = {attribute: "coordination"};
MML.skills["Stealth"] = {attribute: "coordination"};
MML.skills["Survival"] = {attribute: "reason"};
MML.skills["Swimming"] = {attribute: "coordination"};
MML.skills["Symbol Magic"] = {attribute: "intellect"};
MML.skills["Tactical"] = {attribute: "reason"};
MML.skills["Teamster"] = {attribute: "reason"};
MML.skills["Tracking"] = {attribute: "reason"};
MML.skills["Veterinary"] = {attribute: "reason"};
MML.skills["Weapon Smith"] = {attribute: "coordination"};
MML.skills["Sword Smith"] = {attribute: "coordination"};
MML.skills["Wizardry"] = {attribute: "intellect"};

MML.attributeMods = {};
MML.attributeMods.strength = [];
MML.attributeMods.strength[0] = -10;
MML.attributeMods.strength[1] = -10;
MML.attributeMods.strength[2] = -10;
MML.attributeMods.strength[3] = -10;
MML.attributeMods.strength[4] = -10;
MML.attributeMods.strength[5] = -10;
MML.attributeMods.strength[6] = -10;
MML.attributeMods.strength[7] = -5;
MML.attributeMods.strength[8] = -3;
MML.attributeMods.strength[9] = -3;
MML.attributeMods.strength[10] = 0;
MML.attributeMods.strength[11] = 0;
MML.attributeMods.strength[12] = 3;
MML.attributeMods.strength[13] = 3;
MML.attributeMods.strength[14] = 3;
MML.attributeMods.strength[15] = 5;
MML.attributeMods.strength[16] = 5;
MML.attributeMods.strength[17] = 5;
MML.attributeMods.strength[18] = 8;
MML.attributeMods.strength[19] = 8;
MML.attributeMods.strength[20] = 8;
MML.attributeMods.strength[21] = 10;
MML.attributeMods.strength[22] = 10;
MML.attributeMods.strength[23] = 15;
MML.attributeMods.coordination = [];
MML.attributeMods.coordination[0] = -10;
MML.attributeMods.coordination[1] = -10;
MML.attributeMods.coordination[2] = -10;
MML.attributeMods.coordination[3] = -10;
MML.attributeMods.coordination[4] = -10;
MML.attributeMods.coordination[5] = -10;
MML.attributeMods.coordination[6] = -10;
MML.attributeMods.coordination[7] = -5;
MML.attributeMods.coordination[8] = -3;
MML.attributeMods.coordination[9] = -3;
MML.attributeMods.coordination[10] = 0;
MML.attributeMods.coordination[11] = 0;
MML.attributeMods.coordination[12] = 3;
MML.attributeMods.coordination[13] = 3;
MML.attributeMods.coordination[14] = 3;
MML.attributeMods.coordination[15] = 5;
MML.attributeMods.coordination[16] = 5;
MML.attributeMods.coordination[17] = 5;
MML.attributeMods.coordination[18] = 8;
MML.attributeMods.coordination[19] = 8;
MML.attributeMods.coordination[20] = 8;
MML.attributeMods.coordination[21] = 10;
MML.attributeMods.coordination[22] = 10;
MML.attributeMods.coordination[23] = 15;
MML.attributeMods.beauty = [];
MML.attributeMods.beauty[0] = -10;
MML.attributeMods.beauty[1] = -10;
MML.attributeMods.beauty[2] = -10;
MML.attributeMods.beauty[3] = -10;
MML.attributeMods.beauty[4] = -10;
MML.attributeMods.beauty[5] = -10;
MML.attributeMods.beauty[6] = -10;
MML.attributeMods.beauty[7] = -5;
MML.attributeMods.beauty[8] = -3;
MML.attributeMods.beauty[9] = -3;
MML.attributeMods.beauty[10] = 0;
MML.attributeMods.beauty[11] = 0;
MML.attributeMods.beauty[12] = 3;
MML.attributeMods.beauty[13] = 3;
MML.attributeMods.beauty[14] = 3;
MML.attributeMods.beauty[15] = 5;
MML.attributeMods.beauty[16] = 5;
MML.attributeMods.beauty[17] = 5;
MML.attributeMods.beauty[18] = 8;
MML.attributeMods.beauty[19] = 8;
MML.attributeMods.beauty[20] = 8;
MML.attributeMods.beauty[21] = 10;
MML.attributeMods.beauty[22] = 10;
MML.attributeMods.beauty[23] = 15;
MML.attributeMods.intellect = [];
MML.attributeMods.intellect[0] = -10;
MML.attributeMods.intellect[1] = -10;
MML.attributeMods.intellect[2] = -10;
MML.attributeMods.intellect[3] = -10;
MML.attributeMods.intellect[4] = -10;
MML.attributeMods.intellect[5] = -10;
MML.attributeMods.intellect[6] = -10;
MML.attributeMods.intellect[7] = -5;
MML.attributeMods.intellect[8] = -3;
MML.attributeMods.intellect[9] = -3;
MML.attributeMods.intellect[10] = 0;
MML.attributeMods.intellect[11] = 0;
MML.attributeMods.intellect[12] = 3;
MML.attributeMods.intellect[13] = 3;
MML.attributeMods.intellect[14] = 3;
MML.attributeMods.intellect[15] = 5;
MML.attributeMods.intellect[16] = 5;
MML.attributeMods.intellect[17] = 5;
MML.attributeMods.intellect[18] = 8;
MML.attributeMods.intellect[19] = 8;
MML.attributeMods.intellect[20] = 8;
MML.attributeMods.intellect[21] = 10;
MML.attributeMods.intellect[22] = 10;
MML.attributeMods.intellect[23] = 15;
MML.attributeMods.reason = [];
MML.attributeMods.reason[0] = -10;
MML.attributeMods.reason[1] = -10;
MML.attributeMods.reason[2] = -10;
MML.attributeMods.reason[3] = -10;
MML.attributeMods.reason[4] = -10;
MML.attributeMods.reason[5] = -10;
MML.attributeMods.reason[6] = -10;
MML.attributeMods.reason[7] = -5;
MML.attributeMods.reason[8] = -3;
MML.attributeMods.reason[9] = -3;
MML.attributeMods.reason[10] = 0;
MML.attributeMods.reason[11] = 0;
MML.attributeMods.reason[12] = 3;
MML.attributeMods.reason[13] = 3;
MML.attributeMods.reason[14] = 3;
MML.attributeMods.reason[15] = 5;
MML.attributeMods.reason[16] = 5;
MML.attributeMods.reason[17] = 5;
MML.attributeMods.reason[18] = 8;
MML.attributeMods.reason[19] = 8;
MML.attributeMods.reason[20] = 8;
MML.attributeMods.reason[21] = 10;
MML.attributeMods.reason[22] = 10;
MML.attributeMods.reason[23] = 15;
MML.attributeMods.creativity = [];
MML.attributeMods.creativity[0] = -10;
MML.attributeMods.creativity[1] = -10;
MML.attributeMods.creativity[2] = -10;
MML.attributeMods.creativity[3] = -10;
MML.attributeMods.creativity[4] = -10;
MML.attributeMods.creativity[5] = -10;
MML.attributeMods.creativity[6] = -10;
MML.attributeMods.creativity[7] = -5;
MML.attributeMods.creativity[8] = -3;
MML.attributeMods.creativity[9] = -3;
MML.attributeMods.creativity[10] = 0;
MML.attributeMods.creativity[11] = 0;
MML.attributeMods.creativity[12] = 3;
MML.attributeMods.creativity[13] = 3;
MML.attributeMods.creativity[14] = 3;
MML.attributeMods.creativity[15] = 5;
MML.attributeMods.creativity[16] = 5;
MML.attributeMods.creativity[17] = 5;
MML.attributeMods.creativity[18] = 8;
MML.attributeMods.creativity[19] = 8;
MML.attributeMods.creativity[20] = 8;
MML.attributeMods.creativity[21] = 10;
MML.attributeMods.creativity[22] = 10;
MML.attributeMods.creativity[23] = 15;
MML.attributeMods.presence = [];
MML.attributeMods.presence[0] = -10;
MML.attributeMods.presence[1] = -10;
MML.attributeMods.presence[2] = -10;
MML.attributeMods.presence[3] = -10;
MML.attributeMods.presence[4] = -10;
MML.attributeMods.presence[5] = -10;
MML.attributeMods.presence[6] = -10;
MML.attributeMods.presence[7] = -5;
MML.attributeMods.presence[8] = -3;
MML.attributeMods.presence[9] = -3;
MML.attributeMods.presence[10] = 0;
MML.attributeMods.presence[11] = 0;
MML.attributeMods.presence[12] = 3;
MML.attributeMods.presence[13] = 3;
MML.attributeMods.presence[14] = 3;
MML.attributeMods.presence[15] = 5;
MML.attributeMods.presence[16] = 5;
MML.attributeMods.presence[17] = 5;
MML.attributeMods.presence[18] = 8;
MML.attributeMods.presence[19] = 8;
MML.attributeMods.presence[20] = 8;
MML.attributeMods.presence[21] = 10;
MML.attributeMods.presence[22] = 10;
MML.attributeMods.presence[23] = 15;
MML.attributeMods.perception = [];
MML.attributeMods.perception[0] = -10;
MML.attributeMods.perception[1] = -10;
MML.attributeMods.perception[2] = -10;
MML.attributeMods.perception[3] = -10;
MML.attributeMods.perception[4] = -10;
MML.attributeMods.perception[5] = -10;
MML.attributeMods.perception[6] = -10;
MML.attributeMods.perception[7] = -10;
MML.attributeMods.perception[8] = -5;
MML.attributeMods.perception[9] = -5;
MML.attributeMods.perception[10] = 0;
MML.attributeMods.perception[11] = 0;
MML.attributeMods.perception[12] = 3;
MML.attributeMods.perception[13] = 3;
MML.attributeMods.perception[14] = 5;
MML.attributeMods.perception[15] = 5;
MML.attributeMods.perception[16] = 8;
MML.attributeMods.perception[17] = 8;
MML.attributeMods.perception[18] = 10;
MML.attributeMods.perception[19] = 10;
MML.attributeMods.perception[20] = 15;
MML.attributeMods.perception[21] = 15;
MML.attributeMods.perception[22] = 15;
MML.attributeMods.perception[23] = 20;

MML.skillMods = {};
MML.skillMods["Dwarf"] = {};
MML.skillMods["Dwarf"]["Armorer"] = 10;
MML.skillMods["Dwarf"]["Earth Elementalism"] = 3;
MML.skillMods["Dwarf"]["Air Elementalism"] = 3;
MML.skillMods["Dwarf"]["Fire Elementalism"] = 3;
MML.skillMods["Dwarf"]["Water Elementalism"] = 3;
MML.skillMods["Dwarf"]["Life Elementalism"] = 3;
MML.skillMods["Dwarf"]["Engineering"] = 5;
MML.skillMods["Dwarf"]["Forced March"] = 10;
MML.skillMods["Dwarf"]["Gem Cutting"] = 10;
MML.skillMods["Dwarf"]["Geology"] = 5;
MML.skillMods["Dwarf"]["Jeweler"] = 10;
MML.skillMods["Dwarf"]["Mathematics"] = 5;
MML.skillMods["Dwarf"]["Metallurgy"] = 10;
MML.skillMods["Dwarf"]["Musical Instrument"] = 5;
MML.skillMods["Dwarf"]["Symbol Magic"] = 3;
MML.skillMods["Dwarf"]["Weapon Smith"] = 10;
MML.skillMods["Gnome"] = {};
MML.skillMods["Gnome"]["Animal Husbandry"] = 5;
MML.skillMods["Gnome"]["Armorer"] = 5;
MML.skillMods["Gnome"]["Blacksmith"] = 10;
MML.skillMods["Gnome"]["Diplomacy"] = 5;
MML.skillMods["Gnome"]["Engineering"] = 10;
MML.skillMods["Gnome"]["Gem Cutting"] = 5;
MML.skillMods["Gnome"]["Jeweler"] = 10;
MML.skillMods["Gnome"]["Mathematics"] = 3;
MML.skillMods["Gnome"]["Negotiation"] = 10;
MML.skillMods["Gnome"]["Teamster"] = 5;
MML.skillMods["Gray Elf"] = {};
MML.skillMods["Gray Elf"]["Animal Husbandry"] = 5;
MML.skillMods["Gray Elf"]["Bowyer"] = 5;
MML.skillMods["Gray Elf"]["Earth Elementalism"] = 5;
MML.skillMods["Gray Elf"]["Air Elementalism"] = 5;
MML.skillMods["Gray Elf"]["Fire Elementalism"] = 5;
MML.skillMods["Gray Elf"]["Water Elementalism"] = 5;
MML.skillMods["Gray Elf"]["Life Elementalism"] = 5;
MML.skillMods["Gray Elf"]["Etiquette"] = 5;
MML.skillMods["Gray Elf"]["Herbalism"] = 3;
MML.skillMods["Gray Elf"]["History"] = 10;
MML.skillMods["Gray Elf"]["Literacy"] = 10;
MML.skillMods["Gray Elf"]["Lore"] = 10;
MML.skillMods["Gray Elf"]["Musical Instrument"] = 5;
MML.skillMods["Gray Elf"]["Navigation"] = 10;
MML.skillMods["Gray Elf"]["Physician"] = 3;
MML.skillMods["Gray Elf"]["Seamanship"] = 10;
MML.skillMods["Gray Elf"]["Singing"] = 5;
MML.skillMods["Gray Elf"]["Symbol Magic"] = 5;
MML.skillMods["Gray Elf"]["Sword Smith"] = 3;
MML.skillMods["Gray Elf"]["Wizardry"] = 5;
MML.skillMods["Hobbit"] = {};
MML.skillMods["Hobbit"]["Animal Husbandry"] = 3;
MML.skillMods["Hobbit"]["Botany"] = 10;
MML.skillMods["Hobbit"]["Brewing"] = 5;
MML.skillMods["Hobbit"]["Bureaucracy"] = 3;
MML.skillMods["Hobbit"]["Calligraphy"] = 5;
MML.skillMods["Hobbit"]["Cooking"] = 5;
MML.skillMods["Hobbit"]["Dancing"] = 10;
MML.skillMods["Hobbit"]["Gambling"] = 10;
MML.skillMods["Hobbit"]["Leatherworking"] = 3;
MML.skillMods["Hobbit"]["Literacy"] = 10;
MML.skillMods["Hobbit"]["Negotiation"] = 10;
MML.skillMods["Hobbit"]["Oration"] = 3;
MML.skillMods["Hobbit"]["Singing"] = 5;
MML.skillMods["Hobbit"]["Stealth"] = 10;
MML.skillMods["Hobbit"]["Sewing"] = 10;
MML.skillMods["Human"] = {};
MML.skillMods["Human"]["Animal Husbandry"] = 5;
MML.skillMods["Human"]["Bureaucracy"] = 5;
MML.skillMods["Human"]["Falconry"] = 3;
MML.skillMods["Human"]["Foraging"] = 5;
MML.skillMods["Human"]["Heraldry"] = 3;
MML.skillMods["Human"]["Herbalism"] = 3;
MML.skillMods["Human"]["Horsemanship"] = 10;
MML.skillMods["Human"]["Leatherworking"] = 10;
MML.skillMods["Human"]["Oration"] = 5;
MML.skillMods["Human"]["Persuasion"] = 10;
MML.skillMods["Human"]["Scrounging"] = 5;
MML.skillMods["Human"]["Teamster"] = 5;
MML.skillMods["Wood Elf"] = {};
MML.skillMods["Wood Elf"]["Animal Husbandry"] = 10;
MML.skillMods["Wood Elf"]["Bowyer"] = 10;
MML.skillMods["Wood Elf"]["Air Elementalism"] = 5;
MML.skillMods["Wood Elf"]["Life Elementalism"] = 5;
MML.skillMods["Wood Elf"]["Falconry"] = 5;
MML.skillMods["Wood Elf"]["Fletchery"] = 10;
MML.skillMods["Wood Elf"]["Foraging"] = 5;
MML.skillMods["Wood Elf"]["Hand Signalling"] = 5;
MML.skillMods["Wood Elf"]["Herbalism"] = 5;
MML.skillMods["Wood Elf"]["Hunting and Trapping"] = 10;
MML.skillMods["Wood Elf"]["Navigation"] = 10;
MML.skillMods["Wood Elf"]["Stealth"] = 10;
MML.skillMods["Wood Elf"]["Survival"] = 10;
MML.skillMods["Wood Elf"]["Tracking"] = 3;
MML.skillMods["Female"] = []
MML.skillMods["Female"]["Life Elementalism"] = 5;
MML.skillMods["Female"]["Symbol Magic"] = 5;

MML.weaponSkillMods = {};
MML.weaponSkillMods["Dwarf"] = {};
MML.weaponSkillMods["Dwarf"]["Light Cross Bow"] = 3;
MML.weaponSkillMods["Dwarf"]["Medium Cross Bow"] = 3;
MML.weaponSkillMods["Dwarf"]["Heavy Cross Bow"] = 3;
MML.weaponSkillMods["Dwarf"]["Battle Axe"] = 5;
MML.weaponSkillMods["Dwarf"]["Two-Handed Axe"] = 5;
MML.weaponSkillMods["Dwarf"]["Bardiche"] = 5;
MML.weaponSkillMods["Dwarf"]["Pole Axe"] = 5;
MML.weaponSkillMods["Dwarf"]["Maul"] = 5;
MML.weaponSkillMods["Dwarf"]["War Hammer"] = 5;
MML.weaponSkillMods["Dwarf"]["Glaive"] = 5;
MML.weaponSkillMods["Dwarf"]["Halberd"] = 5;
MML.weaponSkillMods["Dwarf"]["Brawling"] = 10;
MML.weaponSkillMods["Dwarf"]["Round Target Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Small Round Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Medium Round Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Large Round Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Small Rectangular Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Medium Rectangular Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Large Rectangular Shield"] = 10;
MML.weaponSkillMods["Dwarf"]["Heater Shield"] = 10;
MML.weaponSkillMods["Gnome"] = {};
MML.weaponSkillMods["Gnome"]["Fauchard"] = 5;
MML.weaponSkillMods["Gnome"]["Bill"] = 5;
MML.weaponSkillMods["Gnome"]["Glaive"] = 5;
MML.weaponSkillMods["Gnome"]["Halberd"] = 5;
MML.weaponSkillMods["Gnome"]["Pole Hammer"] = 5;
MML.weaponSkillMods["Gnome"]["War Spear, One Hand"] = 5;
MML.weaponSkillMods["Gnome"]["War Spear, Two Hands"] = 5;
MML.weaponSkillMods["Gnome"]["Boar Spear, One Hand"] = 5;
MML.weaponSkillMods["Gnome"]["Boar Spear, Two Hands"] = 5;
MML.weaponSkillMods["Gnome"]["Military Fork, One Hand"] = 5;
MML.weaponSkillMods["Gnome"]["Military Fork, Two Hands"] = 5;
MML.weaponSkillMods["Gnome"]["Spetum"] = 5;
MML.weaponSkillMods["Gnome"]["Pitch Fork"] = 5;
MML.weaponSkillMods["Gray Elf"] = {};
MML.weaponSkillMods["Gray Elf"]["Short Sword"] = 10;
MML.weaponSkillMods["Gray Elf"]["Long Sword"] = 10;
MML.weaponSkillMods["Gray Elf"]["Falchion"] = 10;
MML.weaponSkillMods["Gray Elf"]["Broadsword"] = 10;
MML.weaponSkillMods["Hobbit"] = {};
MML.weaponSkillMods["Hobbit"]["Short Bow"] = 3;
MML.weaponSkillMods["Hobbit"]["Medium Bow"] = 3;
MML.weaponSkillMods["Hobbit"]["Long Bow"] = 3;
MML.weaponSkillMods["Hobbit"]["Heavy Long Bow"] = 3;
MML.weaponSkillMods["Hobbit"]["Short Composite Bow"] = 3;
MML.weaponSkillMods["Hobbit"]["Medium Composite Bow"] = 3;
// MML.weaponSkillMods["Hobbit"]["MissileWeaponThrown"] = 3;
// MML.weaponSkillMods["Hobbit"]["Sling"] = 10;
MML.weaponSkillMods["Wood Elf"] = {};
MML.weaponSkillMods["Wood Elf"]["War Spear, One Hand"] = 5;
MML.weaponSkillMods["Wood Elf"]["War Spear, Two Hands"] = 5;
MML.weaponSkillMods["Wood Elf"]["Boar Spear, One Hand"] = 5;
MML.weaponSkillMods["Wood Elf"]["Boar Spear, Two Hands"] = 5;
MML.weaponSkillMods["Wood Elf"]["Short Bow"] = 10;
MML.weaponSkillMods["Wood Elf"]["Medium Bow"] = 10;
MML.weaponSkillMods["Wood Elf"]["Long Bow"] = 10;
MML.weaponSkillMods["Wood Elf"]["Short Composite Bow"] = 10;
MML.weaponSkillMods["Wood Elf"]["Medium Composite Bow"] = 10;
//MML.weaponSkillMods["Wood Elf"]["thrownWeaponSpears"] = 3;

MML.movementRates = {};
MML.movementRates["Dwarf"] = { 
    Prone: 0,
    Crawl: 1.75,
	Stalk: 1.75,
	Walk: 6,
	Jog: 14,
	Run: 34	
};
MML.movementRates["Gnome"] = { 
	Prone: 0,
	Crawl: 1.75,
	Stalk: 1.75,
	Walk: 6,
	Jog: 14,
	Run: 32
};
MML.movementRates["Gray Elf"] = { 
	Prone: 0,
	Crawl: 2,
	Stalk: 2,
	Walk: 8,
	Jog: 20,
	Run: 36
};
MML.movementRates["Hobbit"] = { 
	Prone: 0,
	Crawl: 2,
	Stalk: 2,
	Walk: 5,
	Jog: 8,
	Run: 18
};
MML.movementRates["Human"] = { 
	Prone: 0,
	Crawl: 1.75,
	Stalk: 1.75,
	Walk: 6,
	Jog: 16,
	Run: 28
};
MML.movementRates["Wood Elf"] = { 
	Prone: 0,
	Crawl: 2,
	Stalk: 2,
	Walk: 8,
	Jog: 20,
	Run: 34	
};


MML.recoveryMods = []; //uses health stat
MML.recoveryMods[0] = { hp: 0.33, ep:  1 };
MML.recoveryMods[1] = { hp: 0.33, ep:  1 };
MML.recoveryMods[2] = { hp: 0.33, ep:  1 };
MML.recoveryMods[3] = { hp: 0.33, ep:  1 };
MML.recoveryMods[4] = { hp: 0.33, ep:  1 };
MML.recoveryMods[5] = { hp: 0.33, ep:  1 };
MML.recoveryMods[6] = { hp: 0.33, ep:  1 };
MML.recoveryMods[7] = { hp: 0.33, ep:  1 };
MML.recoveryMods[8] = { hp: 0.5, ep:  2 };
MML.recoveryMods[9] = { hp: 0.5, ep:  2 };
MML.recoveryMods[10] = { hp: 1, ep:  3 };
MML.recoveryMods[11] = { hp: 1, ep:  3 };
MML.recoveryMods[12] = { hp: 1, ep:  3 };
MML.recoveryMods[13] = { hp: 1.5, ep:  4 };
MML.recoveryMods[14] = { hp: 1.5, ep:  4 };
MML.recoveryMods[15] = { hp: 2, ep:  5 };
MML.recoveryMods[16] = { hp: 2, ep:  5 };
MML.recoveryMods[17] = { hp: 3, ep:  6 };
MML.recoveryMods[18] = { hp: 3, ep:  6 };
MML.recoveryMods[19] = { hp: 4, ep:  8 };
MML.recoveryMods[20] = { hp: 4, ep:  8 };
MML.recoveryMods[21] = { hp: 5, ep:  10 };
MML.recoveryMods[22] = { hp: 5, ep:  10 };
MML.recoveryMods[23] = { hp: 5, ep:  10 };
MML.recoveryMods[24] = { hp: 5, ep:  10 };
MML.recoveryMods[25] = { hp: 5, ep:  10 };

MML.attackTempoTable = [-25, -22, -18, -16, -14, -12, -11, -10, -9, -9];

MML.bodyTypes = {};
MML.bodyTypes["Dwarf"] = "humanoid";
MML.bodyTypes["Gnome"] = "humanoid";
MML.bodyTypes["Gray Elf"] = "humanoid";
MML.bodyTypes["Human"] = "humanoid";
MML.bodyTypes["Hobbit"] = "humanoid";
MML.bodyTypes["Wood Elf"] = "humanoid";

MML.hitPositions = {};
MML.hitPositions.humanoid = [];
MML.hitPositions.humanoid[1] = { name: "Top of Head", part: "hpHead" };
MML.hitPositions.humanoid[2] = { name: "Face", part: "hpHead" };
MML.hitPositions.humanoid[3] = { name: "Rear of Head", part: "hpHead" };
MML.hitPositions.humanoid[4] = { name: "Right Side of Head", part: "hpHead" };
MML.hitPositions.humanoid[5] = { name: "Left Side of Head", part: "hpHead" };
MML.hitPositions.humanoid[6] = { name: "Neck, Throat", part: "hpHead" };
MML.hitPositions.humanoid[7] = { name: "Rear of Neck", part: "hpHead" };
MML.hitPositions.humanoid[8] = { name: "Right Shoulder", part: "hpRA" };
MML.hitPositions.humanoid[9] = { name: "Right Upper Chest", part: "hpChest" };
MML.hitPositions.humanoid[10] = { name: "Right Upper Back", part: "hpChest" };
MML.hitPositions.humanoid[11] = { name: "Left Upper Chest", part: "hpChest" };
MML.hitPositions.humanoid[12] = { name: "Left Upper Back", part: "hpChest" };
MML.hitPositions.humanoid[13] = { name: "Left Shoulder", part: "hpLA" };
MML.hitPositions.humanoid[14] = { name: "Right Upper Arm", part: "hpRA" };
MML.hitPositions.humanoid[15] = { name: "Right Lower Chest", part: "hpChest" };
MML.hitPositions.humanoid[16] = { name: "Right Mid Back", part: "hpChest" };
MML.hitPositions.humanoid[17] = { name: "Left Lower Chest", part: "hpChest" };
MML.hitPositions.humanoid[18] = { name: "Left Mid Back", part: "hpChest" };
MML.hitPositions.humanoid[19] = { name: "Left Upper Arm", part: "hpLA" };
MML.hitPositions.humanoid[20] = { name: "Right Elbow", part: "hpRA" };
MML.hitPositions.humanoid[21] = { name: "Right Abdomen", part: "hpAb" };
MML.hitPositions.humanoid[22] = { name: "Right Lower Back", part: "hpAb" };
MML.hitPositions.humanoid[23] = { name: "Left Abdomen", part: "hpAb" };
MML.hitPositions.humanoid[24] = { name: "Left Lower Back", part: "hpAb" };
MML.hitPositions.humanoid[25] = { name: "Left Elbow", part: "hpLA" };
MML.hitPositions.humanoid[26] = { name: "Right Forearm", part: "hpRA" };
MML.hitPositions.humanoid[27] = { name: "Right Hip", part: "hpAb" };
MML.hitPositions.humanoid[28] = { name: "Right Buttock", part: "hpAb" };
MML.hitPositions.humanoid[29] = { name: "Left Hip", part: "hpAb" };
MML.hitPositions.humanoid[30] = { name: "Left Buttock", part: "hpAb" };
MML.hitPositions.humanoid[31] = { name: "Left Forearm", part: "hpLA" };
MML.hitPositions.humanoid[32] = { name: "Right Hand/Wrist", part: "hpRA" };
MML.hitPositions.humanoid[33] = { name: "Groin", part: "hpAb" };
MML.hitPositions.humanoid[34] = { name: "Left Hand/Wrist", part: "hpLA" };
MML.hitPositions.humanoid[35] = { name: "Right Upper Thigh", part: "hpRL" };
MML.hitPositions.humanoid[36] = { name: "Left Upper Thigh", part: "hpLL" };
MML.hitPositions.humanoid[37] = { name: "Right Lower Thigh", part: "hpRL" };
MML.hitPositions.humanoid[38] = { name: "Left Lower Thigh", part: "hpLL" };
MML.hitPositions.humanoid[39] = { name: "Right Knee", part: "hpRL" };
MML.hitPositions.humanoid[40] = { name: "Left Knee", part: "hpLL" };
MML.hitPositions.humanoid[41] = { name: "Right Upper Shin", part: "hpRL" };
MML.hitPositions.humanoid[42] = { name: "Left Upper Shin", part: "hpLL" };
MML.hitPositions.humanoid[43] = { name: "Right Lower Shin", part: "hpRL" };
MML.hitPositions.humanoid[44] = { name: "Left Lower Shin", part: "hpLL" };
MML.hitPositions.humanoid[45] = { name: "Right Foot/Ankle", part: "hpRL" };
MML.hitPositions.humanoid[46] = { name: "Left Foot/Ankle", part: "hpLL" };

// Armor Styles
MML.items = {};
MML.items["Barbute Helm"] = { name: "Barbute Helm", type: "armor", protection: [{position: 1, coverage: 100}, {position: 2, coverage: 85}, {position: 3, coverage: 100}, {position: 5, coverage: 100}, {position: 4, coverage: 100}], totalPostitions: 4.85 };
MML.items["Bascinet Helm"] = { name: "Bascinet Helm", type: "armor", protection: [{position: 1, coverage: 100},{position: 3, coverage: 100}, {position: 4, coverage: 100}, {position: 5, coverage: 100}], totalPostitions: 4 };
MML.items["Camail"] = { name: "Camail", type: "armor", protection: [{position: 6, coverage: 100}, {position: 7, coverage: 100}], totalPostitions: 2 };
MML.items["Camail-Conical"] = { name: "Camail-Conical", type: "armor", protection: [{position: 3, coverage: 100},{position: 4, coverage: 100}, {position: 5, coverage: 100}], totalPostitions: 3 };
MML.items["Cap"] = { name: "Cap", type: "armor", protection: [{position: 1, coverage: 100}, {position: 3, coverage: 100}, {position: 4, coverage: 100}, {position: 5, coverage: 100}], totalPostitions: 4 };
MML.items["Cheeks"] = { name: "Cheeks", type: "armor", protection: [{position: 2, coverage: 40}, {position: 4, coverage: 100}, {position: 5, coverage: 100}], totalPostitions: 2.4 };
MML.items["Collar"] = { name: "Collar", type: "armor", protection: [{position: 6, coverage: 100}, {position: 7, coverage: 100}], totalPostitions: 2 };
MML.items["Conical Helm"] = { name: "Conical Helm", type: "armor", protection: [{position: 1, coverage: 100}], totalPostitions: 1 };
MML.items["Duerne Helm"] = { name: "Duerne Helm", type: "armor", protection: [{position: 1, coverage: 100}, {position: 3, coverage: 100}, {position: 4, coverage: 100}, {position: 5, coverage: 100}], totalPostitions: 4 };
MML.items["Dwarven War Hood"] = { name: "Dwarven War Hood", type: "armor", protection: [{position: 1, coverage: 100}, {position: 2, coverage: 100}, {position: 3, coverage: 100}, {position: 4, coverage: 100}, {position: 5, coverage: 100}, {position: 6, coverage: 100}, {position: 7, coverage: 100}], totalPostitions: 7 };
MML.items["Face Plate"] = { name: "Face Plate", type: "armor", protection: [{position: 2, coverage: 100}], totalPostitions: 1 };
MML.items["Great Helm"] = { name: "Great Helm", type: "armor", protection: [{position: 1, coverage: 100}, {position: 2, coverage: 100}, {position: 3, coverage: 100}, {position: 4, coverage: 100}, {position: 5, coverage: 100}], totalPostitions: 5 };
MML.items["Half-Face Plate"] = { name: "Half-Face Plate", type: "armor", protection: [{position: 2, coverage: 40}], totalPostitions: 0.4 };
MML.items["Hood"] = { name: "Hood", type: "armor", protection: [{position: 1, coverage: 100}, {position: 3, coverage: 100}, {position: 4, coverage: 100}, {position: 5, coverage: 100}, {position: 6, coverage: 100}, {position: 7, coverage: 100}], totalPostitions: 6 };
MML.items["Nose Guard"] = { name: "Nose Guard", type: "armor", protection: [{position: 2, coverage: 25}], totalPostitions: 0.25 };
MML.items["Pot Helm"] = { name: "Pot Helm", type: "armor", protection: [{position: 1, coverage: 100}], totalPostitions: 1 };
MML.items["Sallet Helm"] = { name: "Sallet Helm", type: "armor", protection: [{position: 1, coverage: 100}, {position: 2, coverage: 70}, {position: 3, coverage: 100}, {position: 4, coverage: 100}, {position: 5, coverage: 100}, {position: 7, coverage: 100}], totalPostitions: 5.7 };
MML.items["Throat Guard"] = { name: "Throat Guard", type: "armor", protection: [{position: 2, coverage: 30}, {position: 6, coverage: 100}], totalPostitions: 1.3 };
MML.items["War Hat"] = { name: "War Hat", type: "armor", protection: [{position: 1, coverage: 100}, {position: 2, coverage: 25}, {position: 3, coverage: 25}, {position: 4, coverage: 25}, {position: 5, coverage: 25}], totalPostitions: 2 };
MML.items["Breast Plate"] = { name: "Breast Plate", type: "armor", protection: [{position: 9, coverage: 100}, {position: 10, coverage: 100}, {position: 11, coverage: 100}, {position: 12, coverage: 100}, {position: 15, coverage: 100}, {position: 16, coverage: 100}, {position: 17, coverage: 100}, {position: 18, coverage: 100}, {position: 21, coverage: 100}, {position: 22, coverage: 100}, {position: 23, coverage: 100}, {position: 24, coverage: 100}], totalPostitions: 12 };
MML.items["Byrnie"] = { name: "Byrnie", type: "armor", protection: [{position: 8, coverage: 100}, {position: 9, coverage: 100}, {position: 10, coverage: 100}, {position: 11, coverage: 100}, {position: 12, coverage: 100}, {position: 13, coverage: 100}, {position: 14, coverage: 100}, {position: 15, coverage: 100}, {position: 16, coverage: 100}, {position: 17, coverage: 100}, {position: 18, coverage: 100}, {position: 19, coverage: 100}, {position: 21, coverage: 100}, {position: 22, coverage: 100}, {position: 23, coverage: 100}, {position: 24, coverage: 100}, {position: 27, coverage: 100}, {position: 28, coverage: 100}, {position: 29, coverage: 100}, {position: 30, coverage: 100}, {position: 33, coverage: 50}], totalPostitions: 20.5 };
MML.items["Hauberk"] = { name: "Hauberk", type: "armor", protection: [{position: 8, coverage: 100}, {position: 9, coverage: 100}, {position: 10, coverage: 100}, {position: 11, coverage: 100}, {position: 12, coverage: 100}, {position: 13, coverage: 100}, {position: 14, coverage: 100}, {position: 15, coverage: 100}, {position: 16, coverage: 100}, {position: 17, coverage: 100}, {position: 18, coverage: 100}, {position: 19, coverage: 100}, {position: 20, coverage: 100}, {position: 21, coverage: 100}, {position: 22, coverage: 100}, {position: 23, coverage: 100}, {position: 24, coverage: 100}, {position: 25, coverage: 100}, {position: 26, coverage: 100}, {position: 27, coverage: 100}, {position: 28, coverage: 100}, {position: 29, coverage: 100}, {position: 30, coverage: 100}, {position: 31, coverage: 100}, {position: 33, coverage: 100}, {position: 35, coverage: 100}, {position: 36, coverage: 100}, {position: 37, coverage: 100}, {position: 38, coverage: 100}], totalPostitions: 29 };
MML.items["Shirt"] = { name: "Shirt", type: "armor", protection: [{position: 8, coverage: 100}, {position: 9, coverage: 100}, {position: 10, coverage: 100}, {position: 11, coverage: 100}, {position: 12, coverage: 100}, {position: 13, coverage: 100}, {position: 15, coverage: 100}, {position: 16, coverage: 100}, {position: 17, coverage: 100}, {position: 18, coverage: 100}, {position: 21, coverage: 100}, {position: 22, coverage: 100}, {position: 23, coverage: 100}, {position: 24, coverage: 100}], totalPostitions: 14 };
MML.items["Shirt with Arms"] = { name: "Shirt with Arms", type: "armor", protection: [{position: 8, coverage: 100}, {position: 9, coverage: 100}, {position: 10, coverage: 100}, {position: 11, coverage: 100}, {position: 12, coverage: 100}, {position: 13, coverage: 100}, {position: 14, coverage: 100}, {position: 15, coverage: 100}, {position: 16, coverage: 100}, {position: 17, coverage: 100}, {position: 18, coverage: 100}, {position: 19, coverage: 100}, {position: 20, coverage: 100}, {position: 21, coverage: 100}, {position: 22, coverage: 100}, {position: 23, coverage: 100}, {position: 24, coverage: 100}, {position: 25, coverage: 100}, {position: 26, coverage: 100}, {position: 31, coverage: 100}], totalPostitions: 20 };
MML.items["Breech"] = { name: "Breech", type: "armor", protection: [{position: 33, coverage: 100}], totalPostitions: 1 };
MML.items["Pants"] = { name: "Pants", type: "armor", protection: [{position: 27, coverage: 100}, {position: 28, coverage: 100}, {position: 29, coverage: 100}, {position: 30, coverage: 100}, {position: 33, coverage: 100}, {position: 35, coverage: 100}, {position: 36, coverage: 100}, {position: 37, coverage: 100}, {position: 38, coverage: 100}, {position: 39, coverage: 100}, {position: 40, coverage: 100}, {position: 41, coverage: 100}, {position: 42, coverage: 100}, {position: 43, coverage: 100}, {position: 43, coverage: 100}, {position: 44, coverage: 100}], totalPostitions: 15 };
MML.items["Arms"] = { name: "Arms", type: "armor", protection: [{position: 14, coverage: 100}, {position: 19, coverage: 100}, {position: 20, coverage: 100}, {position: 25, coverage: 100}, {position: 26, coverage: 100}, {position: 31, coverage: 100}], totalPostitions: 6 };
MML.items["Forearms"] = { name: "Forearms", type: "armor", protection: [{position: 26, coverage: 100}, {position: 31, coverage: 100}], totalPostitions: 2 };
MML.items["Gauntlets, Finger (or Glove)"] = { name: "Gauntlets, Finger (or Glove)", type: "armor", protection: [{position: 32, coverage: 100}, {position: 34, coverage: 100}], totalPostitions: 2 };
MML.items["Gauntlets, Mitten"] = { name: "Gauntlets, Mitten", type: "armor", protection: [{position: 32, coverage: 100}, {position: 34, coverage: 100}], totalPostitions: 2 };
MML.items["Half-Arms"] = { name: "Half-Arms", type: "armor", protection: [{position: 20, coverage: 100}, {position: 25, coverage: 100}, {position: 26, coverage: 100}, {position: 31, coverage: 100}], totalPostitions: 4 };
MML.items["Half-Legs"] = { name: "Half-Legs", type: "armor", protection: [{position: 35, coverage: 50}, {position: 36, coverage: 50}, {position: 37, coverage: 50}, {position: 38, coverage: 50}, {position: 39, coverage: 50}, {position: 40, coverage: 50}, {position: 41, coverage: 50}, {position: 42, coverage: 50}, {position: 43, coverage: 50}, {position: 43, coverage: 50}, {position: 44, coverage: 50}], totalPostitions: 5 };
MML.items["Legs"] = { name: "Legs", type: "armor", protection: [{position: 35, coverage: 100}, {position: 36, coverage: 100}, {position: 37, coverage: 100}, {position: 38, coverage: 100}, {position: 39, coverage: 100}, {position: 40, coverage: 100}, {position: 41, coverage: 100}, {position: 42, coverage: 100}, {position: 43, coverage: 100}, {position: 43, coverage: 100}, {position: 44, coverage: 100}], totalPostitions: 10 };
MML.items["Shin Guards"] = { name: "Shin Guards", type: "armor", protection: [{position: 39, coverage: 50}, {position: 40, coverage: 50}, {position: 41, coverage: 50}, {position: 42, coverage: 50}, {position: 43, coverage: 50}, {position: 43, coverage: 50}, {position: 44, coverage: 50}], totalPostitions: 3 };
MML.items["Shoe Guards"] = { name: "Shoe Guards", type: "armor", protection: [{position: 45, coverage: 100}, {position: 46, coverage: 100}], totalPostitions: 2 };
MML.items["Elbow Guards"] = { name: "Elbow Guards", type: "armor", protection: [{position: 20, coverage: 100}, {position: 25, coverage: 100}], totalPostitions: 2 };
MML.items["Hip Guards"] = { name: "Hip Guards", type: "armor", protection: [{position: 27, coverage: 100}, {position: 28, coverage: 100}, {position: 29, coverage: 100}, {position: 30, coverage: 100}], totalPostitions: 4 };
MML.items["Knee Guards"] = { name: "Knee Guards", type: "armor", protection: [{position: 39, coverage: 100}, {position: 40, coverage: 100}], totalPostitions: 2 };
MML.items["Shoulder Guards"] = { name: "Shoulder Guards", type: "armor", protection: [{position: 8, coverage: 100}, {position: 13, coverage: 100}], totalPostitions: 2 };
MML.items["Socks"] = { name: "Socks", type: "armor", protection: [{position: 45, coverage: 100}, {position: 46, coverage: 100}], totalPostitions: 2 };

MML.APVList = {};
MML.APVList["None"] = { family: "None", name: "None", surface: 0, cut: 0, chop: 0, pierce: 0, thrust: 0, impact: 0, flanged: 0, weightPerPosition: 0};
MML.APVList["Greater Steel Coat of Lames, Leather, Medium"] = { family: "Coat of Lames", name: "Greater Steel Coat of Lames, Leather, Medium", surface: 34, cut: 29, chop: 19, pierce: 30, thrust: 19, impact: 18, flanged: 13, weightPerPosition: 2.12};
MML.APVList["Greater Steel Coat of Lames, Cloth, Medium"] = { family: "Coat of Lames", name: "Greater Steel Coat of Lames, Cloth, Medium", surface: 33, cut: 28, chop: 18, pierce: 30, thrust: 19, impact: 16, flanged: 12, weightPerPosition: 1.87};
MML.APVList["Hardened Leather Coat of Lames, Leather, Medium"] = { family: "Coat of Lames", name: "Hardened Leather Coat of Lames, Leather, Medium", surface: 15, cut: 14, chop: 10, pierce: 15, thrust: 10, impact: 10, flanged: 6, weightPerPosition: 1.14};
MML.APVList["Greater Steel Coat of Plates, Leather, Medium"] = { family: "Coat of Plates", name: "Greater Steel Coat of Plates, Leather, Medium", surface: 27, cut: 23, chop: 15, pierce: 23, thrust: 16, impact: 10, flanged: 9, weightPerPosition: 1.81};
MML.APVList["Greater Steel Coat of Plates, Cloth, Medium"] = { family: "Coat of Plates", name: "Greater Steel Coat of Plates, Cloth, Medium", surface: 26, cut: 25, chop: 14, pierce: 23, thrust: 16, impact: 8, flanged: 8, weightPerPosition: 1.55};
MML.APVList["Mannish High Steel Coat of Plates, Leather, Medium"] = { family: "Coat of Plates", name: "Mannish High Steel Coat of Plates, Leather, Medium", surface: 31, cut: 28, chop: 17, pierce: 26, thrust: 19, impact: 11, flanged: 10, weightPerPosition: 1.81};
MML.APVList["Greater Steel Coat of Scales, Leather, Medium"] = { family: "Coat of Scales", name: "Greater Steel Coat of Scales, Leather, Medium", surface: 34, cut: 24, chop: 17, pierce: 22, thrust: 15, impact: 15, flanged: 10, weightPerPosition: 1.91};
MML.APVList["Greater Steel Coat of Scales, Cloth, Medium"] = { family: "Coat of Scales", name: "Greater Steel Coat of Scales, Cloth, Medium", surface: 33, cut: 23, chop: 16, pierce: 21, thrust: 14, impact: 13, flanged: 9, weightPerPosition: 1.66};
MML.APVList["Hardened Leather Coat of Scales, Leather, Medium"] = { family: "Coat of Scales", name: "Hardened Leather Coat of Scales, Leather, Medium", surface: 14, cut: 14, chop: 9, pierce: 12, thrust: 9, impact: 7, flanged: 5, weightPerPosition: 1.05};
MML.APVList["Mannish High Steel Coat of Scales, Leather, Medium"] = { family: "Coat of Scales", name: "Mannish High Steel Coat of Scales, Leather, Medium", surface: 39, cut: 27, chop: 19, pierce: 25, thrust: 17, impact: 17, flanged: 11, weightPerPosition: 1.91};
MML.APVList["Mannish Cloth, Light"] = { family: "Cloth", name: "Mannish Cloth, Light", surface: 2, cut: 2, chop: 2, pierce: 2, thrust: 2, impact: 1, flanged: 1, weightPerPosition: 0.04};
MML.APVList["Mannish Cloth, Medium"] = { family: "Cloth", name: "Mannish Cloth, Medium", surface: 4, cut: 3, chop: 3, pierce: 3, thrust: 3, impact: 1, flanged: 2, weightPerPosition: 0.08};
MML.APVList["Mannish Cloth, Heavy"] = { family: "Cloth", name: "Mannish Cloth, Heavy", surface: 6, cut: 5, chop: 4, pierce: 5, thrust: 5, impact: 2, flanged: 2, weightPerPosition: 0.24};
MML.APVList["Mannish Quilt"] = { family: "Cloth", name: "Mannish Quilt", surface: 8, cut: 6, chop: 6, pierce: 7, thrust: 5, impact: 8, flanged: 7, weightPerPosition: 0.15};
MML.APVList["Mannish Silk"] = { family: "Cloth", name: "Mannish Silk", surface: 5, cut: 4, chop: 3, pierce: 4, thrust: 4, impact: 2, flanged: 2, weightPerPosition: 0.06};
MML.APVList["Fur, Light"] = { family: "Light Leather", name: "Fur, Light", surface: 10, cut: 6, chop: 6, pierce: 6, thrust: 5, impact: 6, flanged: 6, weightPerPosition: 0.2};
MML.APVList["Fur, Medium"] = { family: "Light Leather", name: "Fur, Medium", surface: 10, cut: 6, chop: 6, pierce: 6, thrust: 5, impact: 6, flanged: 7, weightPerPosition: 0.4};
MML.APVList["Fur, Heavy"] = { family: "Heavy Leather", name: "Fur, Heavy", surface: 11, cut: 8, chop: 8, pierce: 7, thrust: 7, impact: 7, flanged: 8, weightPerPosition: 0.6};
MML.APVList["Hardened Leather, Medium"] = { family: "Heavy Leather", name: "Hardened Leather, Medium", surface: 10, cut: 9, chop: 6, pierce: 9, thrust: 8, impact: 5, flanged: 4, weightPerPosition: 0.64};
MML.APVList["Hardened Leather, Heavy"] = { family: "Heavy Leather", name: "Hardened Leather, Heavy", surface: 14, cut: 12, chop: 8, pierce: 13, thrust: 10, impact: 7, flanged: 6, weightPerPosition: 0.96};
MML.APVList["Hardened Leather Lames, Medium"] = { family: "Heavy Leather", name: "Hardened Leather Lames, Medium", surface: 12, cut: 9, chop: 6, pierce: 10, thrust: 6, impact: 6, flanged: 4, weightPerPosition: 0.77};
MML.APVList["Hardened Leather Lames, Heavy"] = { family: "Heavy Leather", name: "Hardened Leather Lames, Heavy", surface: 16, cut: 13, chop: 8, pierce: 13, thrust: 8, impact: 8, flanged: 6, weightPerPosition: 1.15};
MML.APVList["Hardened Leather Scales, Medium"] = { family: "Heavy Leather", name: "Hardened Leather Scales, Medium", surface: 12, cut: 10, chop: 6, pierce: 8, thrust: 6, impact: 5, flanged: 4, weightPerPosition: 0.68};
MML.APVList["Hardened Leather Scales, Heavy"] = { family: "Heavy Leather", name: "Hardened Leather Scales, Heavy", surface: 16, cut: 13, chop: 8, pierce: 11, thrust: 8, impact: 7, flanged: 6, weightPerPosition: 1.30};
MML.APVList["Hide, Light"] = { family: "Light Leather", name: "Hide, Light", surface: 5, cut: 2, chop: 2, pierce: 2, thrust: 2, impact: 2, flanged: 2, weightPerPosition: 0.14};
MML.APVList["Hide, Heavy"] = { family: "Heavy Leather", name: "Hide, Heavy", surface: 6, cut: 3, chop: 4, pierce: 3, thrust: 3, impact: 4, flanged: 3, weightPerPosition: 0.42};
MML.APVList["Leather, Light"] = { family: "Light Leather", name: "Leather, Light", surface: 5, cut: 3, chop: 4, pierce: 3, thrust: 3, impact: 4, flanged: 3, weightPerPosition: 0.16};
MML.APVList["Leather, Medium"] = { family: "Light Leather", name: "Leather, Medium", surface: 6, cut: 5, chop: 5, pierce: 4, thrust: 4, impact: 5, flanged: 4, weightPerPosition: 0.32};
MML.APVList["Leather, Heavy"] = { family: "Heavy Leather", name: "Leather, Heavy", surface: 9, cut: 8, chop: 8, pierce: 7, thrust: 7, impact: 7, flanged: 7, weightPerPosition: 0.48};
MML.APVList["Mannish Padded"] = { family: "Padded", name: "Mannish Padded", surface: 11, cut: 8, chop: 9, pierce: 9, thrust: 7, impact: 10, flanged: 9, weightPerPosition: 0.40};
MML.APVList["Laced Mail of Common Steel, Medium"] = { family: "Heavy Mail", name: "Laced Mail of Common Steel, Medium", surface: 20, cut: 17, chop: 9, pierce: 15, thrust: 10, impact: 5, flanged: 6, weightPerPosition: 1.30};
MML.APVList["Laced Mail of Greater Steel, Medium"] = { family: "Heavy Mail", name: "Laced Mail of Greater Steel, Medium", surface: 24, cut: 20, chop: 11, pierce: 18, thrust: 12, impact: 6, flanged: 7, weightPerPosition: 1.30};
MML.APVList["Laced Mail of Mannish High Steel, Medium"] = { family: "Heavy Mail", name: "Laced Mail of Mannish High Steel, Medium", surface: 28, cut: 23, chop: 13, pierce: 21, thrust: 15, impact: 7, flanged: 8, weightPerPosition: 1.30};
MML.APVList["Laced Mail of Wrought Iron, Medium"] = { family: "Heavy Mail", name: "Laced Mail of Wrought Iron, Medium", surface: 12, cut: 10, chop: 5, pierce: 9, thrust: 6, impact: 3, flanged: 3, weightPerPosition: 1.29};
MML.APVList["Lames of Common Steel, Medium"] = { family: "Lames", name: "Lames of Common Steel, Medium", surface: 26, cut: 20, chop: 13, pierce: 21, thrust: 13, impact: 11, flanged: 9, weightPerPosition: 1.70};
MML.APVList["Lames of Greater Steel, Medium"] = { family: "Lames", name: "Lames of Greater Steel, Medium", surface: 31, cut: 24, chop: 15, pierce: 25, thrust: 15, impact: 14, flanged: 11, weightPerPosition: 1.70};
MML.APVList["Lames of Mannish High Steel, Light"] = { family: "Lames", name: "Lames of Mannish High Steel, Light", surface: 32, cut: 20, chop: 13, pierce: 20, thrust: 13, impact: 12, flanged: 9, weightPerPosition: 1.28};
MML.APVList["Lames of Mannish High Steel, Medium"] = { family: "Lames", name: "Lames of Mannish High Steel, Medium", surface: 36, cut: 26, chop: 18, pierce: 29, thrust: 18, impact: 16, flanged: 13, weightPerPosition: 1.70};
MML.APVList["Lames of Wrought Iron, Medium"] = { family: "Lames", name: "Lames of Wrought Iron, Medium", surface: 15, cut: 12, chop: 8, pierce: 13, thrust: 8, impact: 7, flanged: 6, weightPerPosition: 1.68};
MML.APVList["Brazed Mail of Greater Steel"] = { family: "Light Mail", name: "Brazed Mail of Greater Steel", surface: 22, cut: 19, chop: 12, pierce: 20, thrust: 14, impact: 6, flanged: 6, weightPerPosition: 1.30};
MML.APVList["Brazed Mail of Mannish High Steel"] = { family: "Light Mail", name: "Brazed Mail of Mannish High Steel", surface: 25, cut: 22, chop: 13, pierce: 24, thrust: 17, impact: 7, flanged: 7, weightPerPosition: 1.30};
MML.APVList["Butted Mail of Common Steel"] = { family: "Light Mail", name: "Butted Mail of Common Steel", surface: 16, cut: 14, chop: 8, pierce: 14, thrust: 8, impact: 4, flanged: 4, weightPerPosition: 0.95};
MML.APVList["Butted Mail of Greater Steel"] = { family: "Light Mail", name: "Butted Mail of Greater Steel", surface: 19, cut: 17, chop: 9, pierce: 16, thrust: 9, impact: 5, flanged: 5, weightPerPosition: 0.95};
MML.APVList["Butted Mail of Wrought Iron"] = { family: "Light Mail", name: "Butted Mail of Wrought Iron", surface: 10, cut: 8, chop: 5, pierce: 8, thrust: 5, impact: 2, flanged: 2, weightPerPosition: 0.94};
MML.APVList["Double Mail of Common Steel"] = { family: "Light Mail", name: "Double Mail of Common Steel", surface: 18, cut: 16, chop: 9, pierce: 16, thrust: 10, impact: 5, flanged: 4, weightPerPosition: 1.30};
MML.APVList["Double Mail of Greater Steel"] = { family: "Light Mail", name: "Double Mail of Greater Steel", surface: 22, cut: 19, chop: 11, pierce: 19, thrust: 12, impact: 6, flanged: 5, weightPerPosition: 1.30};
MML.APVList["Double Mail of Mannish High Steel"] = { family: "Light Mail", name: "Double Mail of Mannish High Steel", surface: 25, cut: 22, chop: 13, pierce: 22, thrust: 15, impact: 7, flanged: 6, weightPerPosition: 1.30};
MML.APVList["Single Mail of Common Steel"] = { family: "Light Mail", name: "Single Mail of Common Steel", surface: 17, cut: 15, chop: 8, pierce: 15, thrust: 10, impact: 4, flanged: 4, weightPerPosition: 1};
MML.APVList["Single Mail of Greater Steel"] = { family: "Light Mail", name: "Single Mail of Greater Steel", surface: 20, cut: 18, chop: 10, pierce: 18, thrust: 12, impact: 5, flanged: 5, weightPerPosition: 1};
MML.APVList["Single Mail of Mannish High Steel"] = { family: "Light Mail", name: "Single Mail of Mannish High Steel", surface: 24, cut: 21, chop: 12, pierce: 21, thrust: 13, impact: 6, flanged: 6, weightPerPosition: 1};
MML.APVList["Single Mail of Wrought Iron"] = { family: "Light Mail", name: "Single Mail of Wrought Iron", surface: 10, cut: 9, chop: 5, pierce: 9, thrust: 6, impact: 2, flanged: 2, weightPerPosition: 0.99};
MML.APVList["Plates of Common Steel, Medium"] = { family: "Plates", name: "Plates of Common Steel, Medium", surface: 22, cut: 18, chop: 12, pierce: 20, thrust: 16, impact: 10, flanged: 9, weightPerPosition: 1.40};
MML.APVList["Plates of Greater Steel, Medium"] = { family: "Plates", name: "Plates of Greater Steel, Medium", surface: 27, cut: 22, chop: 14, pierce: 24, thrust: 19, impact: 12, flanged: 11, weightPerPosition: 1.40};
MML.APVList["Plates of Mannish High Steel, Light"] = { family: "Plates", name: "Plates of Mannish High Steel, Light", surface: 30, cut: 24, chop: 12, pierce: 19, thrust: 16, impact: 11, flanged: 9, weightPerPosition: 1.05};
MML.APVList["Plates of Mannish High Steel, Medium"] = { family: "Plates", name: "Plates of Mannish High Steel, Medium", surface: 31, cut: 26, chop: 17, pierce: 28, thrust: 22, impact: 15, flanged: 12, weightPerPosition: 1.40};
MML.APVList["Plates of Mannish High Steel, Heavy"] = { family: "Plates", name: "Plates of Mannish High Steel, Heavy", surface: 33, cut: 27, chop: 22, pierce: 38, thrust: 30, impact: 18, flanged: 16, weightPerPosition: 1.75};
MML.APVList["Plates of Wrought Iron, Medium"] = { family: "Plates", name: "Plates of Wrought Iron, Medium", surface: 13, cut: 11, chop: 7, pierce: 12, thrust: 10, impact: 6, flanged: 5, weightPerPosition: 1.39};
MML.APVList["Plates of Wrought Iron, Heavy"] = { family: "Plates", name: "Plates of Wrought Iron, Heavy", surface: 14, cut: 15, chop: 9, pierce: 16, thrust: 13, impact: 8, flanged: 7, weightPerPosition: 1.73};
MML.APVList["Hardened Leather, Medium, Studs"] = { family: "Heavy Leather", name: "Hardened Leather, Medium, Studs", surface: 10, cut: 11, chop: 6, pierce: 9, thrust: 7, impact: 4, flanged: 4, weightPerPosition: 0.69};
MML.APVList["Hardened Leather, Medium, Rings"] = { family: "Heavy Leather", name: "Hardened Leather, Medium, Rings", surface: 13, cut: 12, chop: 8, pierce: 11, thrust: 9, impact: 4, flanged: 5, weightPerPosition: 0.75};
MML.APVList["Hardened Leather, Medium, Splints"] = { family: "Heavy Leather", name: "Hardened Leather, Medium, Splints", surface: 15, cut: 13, chop: 9, pierce: 12, thrust: 9, impact: 8, flanged: 6, weightPerPosition: 0.85};
MML.APVList["Hardened Leather, Medium, Bezaints"] = { family: "Heavy Leather", name: "Hardened Leather, Medium, Bezaints", surface: 20, cut: 14, chop: 10, pierce: 13, thrust: 10, impact: 7, flanged: 6, weightPerPosition: 0.94};
MML.APVList["Leather, Medium, Rings"] = { family: "Light Leather", name: "Leather, Medium, Rings", surface: 9, cut: 8, chop: 7, pierce: 6, thrust: 6, impact: 4, flanged: 5, weightPerPosition: 0.43};
MML.APVList["Leather, Medium, Studs"] = { family: "Light Leather", name: "Leather, Medium, Studs", surface: 6, cut: 7, chop: 5, pierce: 4, thrust: 4, impact: 4, flanged: 4, weightPerPosition: 0.37};
MML.APVList["Leather, Heavy, Bezaints"] = { family: "Heavy Leather", name: "Leather, Heavy, Bezaints", surface: 19, cut: 13, chop: 12, pierce: 11, thrust: 10, impact: 9, flanged: 9, weightPerPosition: 0.78};
MML.APVList["Leather, Heavy, Rings"] = { family: "Heavy Leather", name: "Leather, Heavy, Rings", surface: 12, cut: 11, chop: 10, pierce: 9, thrust: 9, impact: 6, flanged: 8, weightPerPosition: 0.59};
MML.APVList["Leather, Heavy, Splints"] = { family: "Heavy Leather", name: "Leather, Heavy, Splints", surface: 14, cut: 12, chop: 11, pierce: 10, thrust: 9, impact: 10, flanged: 9, weightPerPosition: 0.69};
MML.APVList["Leather, Heavy, Studs"] = { family: "Heavy Leather", name: "Leather, Heavy, Studs", surface: 9, cut: 10, chop: 8, pierce: 7, thrust: 7, impact: 6, flanged: 7, weightPerPosition: 0.53};
MML.APVList["Padded, Bezaints"] = { family: "Padded", name: "Padded, Bezaints", surface: 21, cut: 13, chop: 13, pierce: 13, thrust: 10, impact: 12, flanged: 11, weightPerPosition: 0.70};
MML.APVList["Dwarven Quilt"] = { family: "Cloth", name: "Dwarven Quilt", surface: 10, cut: 11, chop: 11, pierce: 12, thrust: 9, impact: 13, flanged: 11, weightPerPosition: 0.35};
MML.APVList["Dwarven Padded"] = { family: "Padded", name: "Dwarven Padded", surface: 14, cut: 14, chop: 14, pierce: 15, thrust: 12, impact: 16, flanged: 14, weightPerPosition: 0.52};
MML.APVList["Fine Mail, Dwarven Low Steel"] = { family: "Light Mail", name: "Fine Mail, Dwarven Low Steel", surface: 28, cut: 25, chop: 15, pierce: 27, thrust: 19, impact: 7, flanged: 7, weightPerPosition: 0.95};
MML.APVList["Brazed Mail of Gnomish Steel, Medium"] = { family: "Light Mail", name: "Brazed Mail of Gnomish Steel, Medium", surface: 30, cut: 27, chop: 16, pierce: 29, thrust: 20, impact: 8, flanged: 8, weightPerPosition: 1.29};
MML.APVList["Double Mail of Gnomish Steel, Medium"] = { family: "Light Mail", name: "Double Mail of Gnomish Steel, Medium", surface: 30, cut: 27, chop: 15, pierce: 26, thrust: 28, impact: 8, flanged: 7, weightPerPosition: 1.29};
MML.APVList["Laced Mail of Gnomish Steel, Medium"] = { family: "Heavy Mail", name: "Laced Mail of Gnomish Steel, Medium", surface: 34, cut: 28, chop: 15, pierce: 26, thrust: 18, impact: 9, flanged: 10, weightPerPosition: 1.29};
MML.APVList["Lames of Gnomish Steel, Medium"] = { family: "Lames", name: "Lames of Gnomish Steel, Medium", surface: 44, cut: 34, chop: 21, pierce: 36, thrust: 22, impact: 19, flanged: 16, weightPerPosition: 1.68};
MML.APVList["Plates of Gnomish Steel, Medium"] = { family: "Plates", name: "Plates of Gnomish Steel, Medium", surface: 38, cut: 31, chop: 20, pierce: 34, thrust: 27, impact: 18, flanged: 15, weightPerPosition: 1.39};
MML.APVList["Single Mail of Gnomish Steel, Medium"] = { family: "Light Mail", name: "Single Mail of Gnomish Steel, Medium", surface: 29, cut: 25, chop: 14, pierce: 26, thrust: 16, impact: 7, flanged: 7, weightPerPosition: 0.99};
MML.APVList["Elven Cloth, Light"] = { family: "Cloth", name: "Elven Cloth, Light", surface: 4, cut: 3, chop: 2, pierce: 3, thrust: 2, impact: 1, flanged: 1, weightPerPosition: 0.03};
MML.APVList["Elven Cloth, Medium"] = { family: "Cloth", name: "Elven Cloth, Medium", surface: 5, cut: 4, chop: 3, pierce: 4, thrust: 3, impact: 2, flanged: 2, weightPerPosition: 0.06};
MML.APVList["Elven Cloth, Heavy"] = { family: "Cloth", name: "Elven Cloth, Heavy", surface: 7, cut: 6, chop: 5, pierce: 6, thrust: 6, impact: 3, flanged: 3, weightPerPosition: 0.18};
MML.APVList["Elven Greater Steel Fine Coat of Scales"] = { family: "Lames", name: "Elven Greater Steel Fine Coat of Scales", surface: 35, cut: 23, chop: 16, pierce: 23, thrust: 16, impact: 13, flanged: 8, weightPerPosition: 1.53};
MML.APVList["Elven Padded"] = { family: "Padded", name: "Elven Padded", surface: 14, cut: 15, chop: 13, pierce: 15, thrust: 10, impact: 13, flanged: 11, weightPerPosition: 0.36};
MML.APVList["Elven Quilt"] = { family: "Cloth", name: "Elven Quilt", surface: 10, cut: 12, chop: 10, pierce: 12, thrust: 8, impact: 10, flanged: 9, weightPerPosition: 0.12};
MML.APVList["Elven Silk"] = { family: "Cloth", name: "Elven Silk", surface: 5, cut: 7, chop: 5, pierce: 7, thrust: 6, impact: 3, flanged: 4, weightPerPosition: 0.12};
MML.APVList["Fine Mail, Elven Travel Steel"] = { family: "Light Mail", name: "Fine Mail, Elven Travel Steel", surface: 28, cut: 25, chop: 15, pierce: 27, thrust: 19, impact: 7, flanged: 7, weightPerPosition: 0.95};
MML.APVList["Fine Mail, Mannish Greater Steel"] = { family: "Light Mail", name: "Fine Mail, Mannish Greater Steel", surface: 24, cut: 22, chop: 13, pierce: 23, thrust: 17, impact: 6, flanged: 6, weightPerPosition: 0.95};
MML.APVList["Lames of Elven Bronze"] = { family: "Lames", name: "Lames of Elven Bronze", surface: 28, cut: 22, chop: 14, pierce: 23, thrust: 14, impact: 13, flanged: 10, weightPerPosition: 0.95};

// Weapon Stats
MML.items["Hand Axe"] = {
    name: "Hand Axe",
    type: "weapon",
    weight: 3,
    grips: {
        "One Hand":{
            family: "Axe",
            hands: 1,
            primaryType: "Chop",
            primaryTask: 35,
            primaryDamage: "1d20",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 6,
            rank: 1}
       }
    };
MML.items["Battle Axe"] = {
    name: "Battle Axe",
    type: "weapon",
    weight: 5,
    grips: {
        "One Hand":{
            family: "Axe",
            hands: 1,
            primaryType: "Chop",
            primaryTask: 35,
            primaryDamage: "3d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Pick"] = {
    name: "Pick",
    type: "weapon",
    weight: 6,
    grips: {
        "Two Hands":{
            family: "Axe",
            hands: 2,
            primaryType: "Flanged",
            primaryTask: 25,
            primaryDamage: "1d20",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 1}
       }
    };
MML.items["Two-Handed Axe"] = {
    name: "Two-Handed Axe",
    type: "weapon",
    weight: 6.5,
    grips: {
        "Two Hands":{
            family: "Axe",
            hands: 2,
            primaryType: "Chop",
            primaryTask: 25,
            primaryDamage: "4d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Bardiche"] = {
    name: "Bardiche",
    type: "weapon",
    weight: 7.5,
    grips: {
        "Two Hands":{
            family: "Axe",
            hands: 2,
            primaryType: "Chop",
            primaryTask: 25,
            primaryDamage: "5d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 3,
            rank: 2}
       }
    };
MML.items["Pole Axe"] = {
    name: "Pole Axe",
    type: "weapon",
    weight: 7,
    grips: {
        "Two Hands":{
            family: "Axe",
            hands: 2,
            primaryType: "Chop",
            primaryTask: 25,
            primaryDamage: "4d12",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 3,
            rank: 2}
       }
    };
MML.items["Club"] = {
    name: "Club",
    type: "weapon",
    weight: 2,
    grips: {
        "One Hand":{
            family: "Bludgeoning",
            hands: 1,
            primaryType: "Impact",
            primaryTask: 45,
            primaryDamage: "2d8",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 7,
            rank: 1}
       }
    };
MML.items["Cudgel, Light"] = {
    name: "Cudgel, Light",
    type: "weapon",
    weight: 3,
    grips: {
        "One Hand":{
            family: "Bludgeoning",
            hands: 1,
            primaryType: "Impact",
            primaryTask: 45,
            primaryDamage: "2d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 6,
            rank: 1}
       }
    };
MML.items["Cudgel, Heavy"] = {
    name: "Cudgel, Heavy",
    type: "weapon",
    weight: 7,
    grips: {
        "Two Hands":{
            family: "Bludgeoning",
            hands: 2,
            primaryType: "Impact",
            primaryTask: 35,
            primaryDamage: "4d8",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Mace"] = {
    name: "Mace",
    type: "weapon",
    weight: 5,
    grips: {
        "One Hand":{
            family: "Bludgeoning",
            hands: 1,
            primaryType: "Flanged",
            primaryTask: 45,
            primaryDamage: "2d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Maul"] = {
    name: "Maul",
    type: "weapon",
    weight: 9,
    grips: {
        "Two Hands":{
            family: "Bludgeoning",
            hands: 2,
            primaryType: "Impact",
            primaryTask: 25,
            primaryDamage: "4d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Morningstar"] = {
    name: "Morningstar",
    type: "weapon",
    weight: 5,
    grips: {
        "One Hand":{
            family: "Bludgeoning",
            hands: 1,
            primaryType: "Thrust",
            primaryTask: 45,
            primaryDamage: "3d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["War Hammer"] = {
    name: "War Hammer",
    type: "weapon",
    weight: 5.5,
    grips: {
        "One Hand":{
            family: "Bludgeoning",
            hands: 1,
            primaryType: "Impact",
            primaryTask: 35,
            primaryDamage: "3d10",
            secondaryType: "Flanged",
            secondaryTask: 25,
            secondaryDamage: "2d8",
            defense: 15,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Ball & Chain, Footman's"] = {
    name: "Ball & Chain, Footman's",
    type: "weapon",
    weight: 5,
    grips: {
        "Two Hands":{
            family: "Flexible",
            hands: 2,
            primaryType: "Impact",
            primaryTask: 15,
            primaryDamage: "3d12",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Ball & Chain, Horseman's"] = {
    name: "Ball & Chain, Horseman's",
    type: "weapon",
    weight: 3.5,
    grips: {
        "One Hand":{
            family: "Flexible",
            hands: 1,
            primaryType: "Impact",
            primaryTask: 25,
            primaryDamage: "2d12",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Flail, Footman's"] = {
    name: "Flail, Footman's",
    type: "weapon",
    weight: 5,
    grips: {
        "Two Hands":{
            family: "Flexible",
            hands: 2,
            primaryType: "Impact",
            primaryTask: 25,
            primaryDamage: "3d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Flail, Horseman's"] = {
    name: "Flail, Horseman's",
    type: "weapon",
    weight: 2.5,
    grips: {
        "One Hand":{
            family: "Flexible",
            hands: 1,
            primaryType: "Impact",
            primaryTask: 35,
            primaryDamage: "1d20",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Mace & Chain"] = {
    name: "Mace & Chain",
    type: "weapon",
    weight: 3.5,
    grips: {
        "One Hand":{
            family: "Flexible",
            hands: 1,
            primaryType: "Flanged",
            primaryTask: 25,
            primaryDamage: "2d12",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Morningstar & Chain"] = {
    name: "Morningstar & Chain",
    type: "weapon",
    weight: 4,
    grips: {
        "One Hand":{
            family: "Flexible",
            hands: 1,
            primaryType: "Thrust",
            primaryTask: 25,
            primaryDamage: "3d12",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Boot Knife"] = {
    name: "Boot Knife",
    type: "weapon",
    weight: 0.5,
    grips: {
        "One Hand":{
            family: "Knives",
            hands: 1,
            primaryType: "Thrust",
            primaryTask: 15,
            primaryDamage: "1d8",
            secondaryType: "Cut",
            secondaryTask: 15,
            secondaryDamage: "1d6",
            defense: 0,
            initiative: 10,
            rank: 1}
       }
    };
MML.items["Dagger"] = {
    name: "Dagger",
    type: "weapon",
    weight: 1,
    grips: {
        "One Hand":{
            family: "Knives",
            hands: 1,
            primaryType: "Thrust",
            primaryTask: 15,
            primaryDamage: "2d6",
            secondaryType: "Cut",
            secondaryTask: 15,
            secondaryDamage: "1d8",
            defense: 0,
            initiative: 10,
            rank: 1}
       }
    };
MML.items["Knife"] = {
    name: "Knife",
    type: "weapon",
    weight: 1.5,
    grips: {
        "One Hand":{
            family: "Knives",
            hands: 1,
            primaryType: "Cut",
            primaryTask: 25,
            primaryDamage: "2d6",
            secondaryType: "Thrust",
            secondaryTask: 15,
            secondaryDamage: "2d6",
            defense: 0,
            initiative: 10,
            rank: 1}
       }
    };
MML.items["Dirk"] = {
    name: "Dirk",
    type: "weapon",
    weight: 1.5,
    grips: {
        "One Hand":{
            family: "Knives",
            hands: 1,
            primaryType: "Cut",
            primaryTask: 25,
            primaryDamage: "2d8",
            secondaryType: "Thrust",
            secondaryTask: 15,
            secondaryDamage: "2d6",
            defense: 15,
            initiative: 9,
            rank: 1}
       }
    };
MML.items["Fauchard"] = {
    name: "Fauchard",
    type: "weapon",
    weight: 5,
    grips: {
        "Two Hands":{
            family: "Pole Arms",
            hands: 2,
            primaryType: "Cut",
            primaryTask: 15,
            primaryDamage: "2d12",
            secondaryType: "Thrust",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Bill"] = {
    name: "Bill",
    type: "weapon",
    weight: 5,
    grips: {
        "Two Hands":{
            family: "Pole Arms",
            hands: 2,
            primaryType: "Cut",
            primaryTask: 25,
            primaryDamage: "2d12",
            secondaryType: "Thrust",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Glaive"] = {
    name: "Glaive",
    type: "weapon",
    weight: 6,
    grips: {
        "Two Hands":{
            family: "Pole Arms",
            hands: 2,
            primaryType: "Chop",
            primaryTask: 25,
            primaryDamage: "3d20",
            secondaryType: "Thrust",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Halberd"] = {
    name: "Halberd",
    type: "weapon",
    weight: 6,
    grips: {
        "Two Hands":{
            family: "Pole Arms",
            hands: 2,
            primaryType: "Chop",
            primaryTask: 25,
            primaryDamage: "3d20",
            secondaryType: "Thrust",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Pole Hammer"] = {
    name: "Pole Hammer",
    type: "weapon",
    weight: 6,
    grips: {
        "Two Hands":{
            family: "Pole Hammers",
            hands: 2,
            primaryType: "Flanged",
            primaryTask: 25,
            primaryDamage: "3d10",
            secondaryType: "Thrust",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["War Spear"] = {
    name: "War Spear",
    type: "weapon",
    weight: 2,
    grips: {
        "One Hand":{
            family: "Spears",
            hands: 1,
            primaryType: "Thrust",
            primaryTask: 35,
            primaryDamage: "2d8",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 3,
            rank: 1},
        "Two Hands":{
            family: "Spears",
            hands: 2,
            primaryType: "Thrust",
            primaryTask: 45,
            primaryDamage: "3d8",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 5,
            rank: 2}
       }
    };
MML.items["Boar Spear"] = {
    name: "Boar Spear",
    type: "weapon",
    weight: 3.5,
    grips: {
        "One Hand":{
            family: "Spears",
            hands: 1,
            primaryType: "Thrust",
            primaryTask: 25,
            primaryDamage: "2d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 2,
            rank: 1},
        "Two Hands":{
            family: "Spears",
            hands: 2,
            primaryType: "Thrust",
            primaryTask: 45,
            primaryDamage: "3d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Military Fork"] = {
    name: "Military Fork",
    type: "weapon",
    weight: 3.5,
    grips: {
        "One Hand":{
            family: "Spears",
            hands: 1,
            primaryType: "Thrust",
            primaryTask: 15,
            primaryDamage: "2d12",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 2,
            rank: 1},
        "Two Hands":{
            family: "Spears",
            hands: 2,
            primaryType: "Thrust",
            primaryTask: 35,
            primaryDamage: "3d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Spetum"] = {
    name: "Spetum",
    type: "weapon",
    weight: 4,
    grips: {
        "Two Hands":{
            family: "Spears",
            hands: 2,
            primaryType: "Thrust",
            primaryTask: 35,
            primaryDamage: "3d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 2}
       }
    };
MML.items["Quarter Staff"] = {
    name: "Quarter Staff",
    type: "weapon",
    weight: 2,
    grips: {
        "Two Hands":{
            family: "Staves",
            hands: 2,
            primaryType: "Impact",
            primaryTask: 45,
            primaryDamage: "3d8",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 35,
            initiative: 9,
            rank: 2}
       }
    };
MML.items["Scimitar"] = {
    name: "Scimitar",
    type: "weapon",
    weight: 3.5,
    grips: {
        "One Hand":{
            family: "Swords",
            hands: 1,
            primaryType: "Cut",
            primaryTask: 35,
            primaryDamage: "2d12",
            secondaryType: "Thrust",
            secondaryTask: 25,
            secondaryDamage: "2d6",
            defense: 35,
            initiative: 7,
            rank: 1}
       }
    };
MML.items["Short Sword"] = {
    name: "Short Sword",
    type: "weapon",
    weight: 3.5,
    grips: {
        "One Hand":{
            family: "Swords",
            hands: 1,
            primaryType: "Thrust",
            primaryTask: 35,
            primaryDamage: "3d8",
            secondaryType: "Cut",
            secondaryTask: 35,
            secondaryDamage: "3d6",
            defense: 35,
            initiative: 1,
            rank: 1}
       }
    };
MML.items["Long Sword"] = {
    name: "Long Sword",
    type: "weapon",
    weight: 3,
    grips: {
        "One Hand":{
            family: "Swords",
            hands: 1,
            primaryType: "Cut",
            primaryTask: 45,
            primaryDamage: "3d10",
            secondaryType: "Thrust",
            secondaryTask: 35,
            secondaryDamage: "2d6",
            defense: 25,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Falchion"] = {
    name: "Falchion",
    type: "weapon",
    weight: 3.5,
    grips: {
        "One Hand":{
            family: "Swords",
            hands: 1,
            primaryType: "Chop",
            primaryTask: 35,
            primaryDamage: "4d8",
            secondaryType: "Thrust",
            secondaryTask: 25,
            secondaryDamage: "3d6",
            defense: 25,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Bastard Sword"] = {
    name: "Bastard Sword",
    type: "weapon",
    weight: 6,
    grips: {
        "One Hand":{
            family: "Swords",
            hands: 1,
            primaryType: "Cut",
            primaryTask: 25,
            primaryDamage: "5d6",
            secondaryType: "Thrust",
            secondaryTask: 15,
            secondaryDamage: "3d6",
            defense: 15,
            initiative: 4,
            rank: 1},
        "Two Hands":{
            family: "Swords",
            hands: 2,
            primaryType: "Cut",
            primaryTask: 35,
            primaryDamage: "4d10",
            secondaryType: "Thrust",
            secondaryTask: 25,
            secondaryDamage: "4d6",
            defense: 25,
            initiative: 5,
            rank: 1}
       }
    };
MML.items["Broadsword"] = {
    name: "Broadsword",
    type: "weapon",
    weight: 5,
    grips: {
        "One Hand":{
            family: "Swords",
            hands: 1,
            primaryType: "Chop",
            primaryTask: 25,
            primaryDamage: "3d12",
            secondaryType: "Thrust",
            secondaryTask: 15,
            secondaryDamage: "1d12",
            defense: 15,
            initiative: 4,
            rank: 1}
       }
    };
MML.items["Two-Handed Broadsword"] = {
    name: "Two-Handed Broadsword",
    type: "weapon",
    weight: 7.5,
    grips: {
        "Two Hands":{
            family: "Swords",
            hands: 2,
            primaryType: "Chop",
            primaryTask: 35,
            primaryDamage: "4d12",
            secondaryType: "Thrust",
            secondaryTask: 25,
            secondaryDamage: "1d20",
            defense: 25,
            initiative: 3,
            rank: 1}
       }
    };
MML.items["Great Sword"] = {
    name: "Great Sword",
    type: "weapon",
    weight: 13,
    grips: {
        "Two Hands":{
            family: "Swords",
            hands: 2,
            primaryType: "Chop",
            primaryTask: 15,
            primaryDamage: "6d10",
            secondaryType: "Thrust",
            secondaryTask: 15,
            secondaryDamage: "3d10",
            defense: 35,
            initiative: 2,
            rank: 2}
       }
    };
MML.items["Whip"] = {
    name: "Whip",
    type: "weapon",
    weight: 1,
    grips: {
        "One Hand":{
            family: "Whip",
            hands: 1,
            primaryType: "Surface",
            primaryTask: 35,
            primaryDamage: "2d4",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 8,
            rank: 3}
       }
    };
MML.items["Cleaver"] = {
    name: "Cleaver",
    type: "weapon",
    weight: 2,
    grips: {
        "One Hand":{
            family: "Axe",
            hands: 1,
            primaryType: "Chop",
            primaryTask: 25,
            primaryDamage: "1d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 8,
            rank: 1}
       }
    };
MML.items["Hatchet"] = {
    name: "Hatchet",
    type: "weapon",
    weight: 2.5,
    grips: {
        "One Hand":{
            family: "Axe",
            hands: 1,
            primaryType: "Chop",
            primaryTask: 25,
            primaryDamage: "1d12",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 7,
            rank: 1}
       }
    };
MML.items["Hoe"] = {
    name: "Hoe",
    type: "weapon",
    weight: 4,
    grips: {
        "Two Hands":{
            family: "Axe",
            hands: 2,
            primaryType: "Flanged",
            primaryTask: 35,
            primaryDamage: "1d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 1}
       }
    };
MML.items["Wood Axe"] = {
    name: "Wood Axe",
    type: "weapon",
    weight: 3,
    grips: {
        "Two Hands":{
            family: "Axe",
            hands: 2,
            primaryType: "Chop",
            primaryTask: 35,
            primaryDamage: "2d12",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 1}
       }
    };
MML.items["Hammer, Medium"] = {
    name: "Hammer, Medium",
    type: "weapon",
    weight: 2.5,
    grips: {
        "One Hand":{
            family: "Bludgeoning",
            hands: 1,
            primaryType: "Impact",
            primaryTask: 25,
            primaryDamage: "1d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 7,
            rank: 1}
       }
    };
MML.items["Shovel"] = {
    name: "Shovel",
    type: "weapon",
    weight: 6,
    grips: {
        "Two Hands":{
            family: "Bludgeoning",
            hands: 2,
            primaryType: "Impact",
            primaryTask: 35,
            primaryDamage: "",
            secondaryType: "1d8",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 4,
            rank: 1}
       }
    };
MML.items["Skinning Knife"] = {
    name: "Skinning Knife",
    type: "weapon",
    weight: 0.5,
    grips: {
        "One Hand":{
            family: "Knives",
            hands: 1,
            primaryType: "Cut",
            primaryTask: 15,
            primaryDamage: "1d8",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 9,
            rank: 1}
       }
    };
MML.items["Butcher's Knife"] = {
    name: "Butcher's Knife",
    type: "weapon",
    weight: 1,
    grips: {
        "One Hand":{
            family: "Knives",
            hands: 1,
            primaryType: "Cut",
            primaryTask: 15,
            primaryDamage: "2d6",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 0,
            initiative: 9,
            rank: 1}
       }
    };
MML.items["Pitch Fork"] = {
    name: "Pitch Fork",
    type: "weapon",
    weight: 3,
    grips: {
        "Two Hands":{
            family: "Spears",
            hands: 2,
            primaryType: "Thrust",
            primaryTask: 35,
            primaryDamage: "2d10",
            secondaryType: "",
            secondaryTask: 0,
            secondaryDamage: "",
            defense: 15,
            initiative: 3,
            rank: 1}
       }
    };
MML.items["Short Bow"] = {
    name: "Short Bow", 
    type: "weapon",
    weight: 0,
    grips: {
        "Two Hands": {
            family: "MWD", 
            hands: 2, 
            pull: 45, 
            initiative: 8, 
            reload: 1, 
            primaryType: "Pierce", 
            range: { 
                pointBlank: { task: 15, range: 74, damage: "3d6"}, 
                effective: { task: 45, range: 149, damage: "2d8"}, 
                long: { task: 25, range: 299, damage: "2d6"}, 
                extreme: { task: 0, range: 300, damage: "1d6"}
            }
        }
    }};
MML.items["Medium Bow"] = {
    name: "Medium Bow", 
    type: "weapon",
    weight: 0,
    grips: {
        "Two Hands": { 
            family: "MWD", 
            hands: 2, 
            pull: 60, 
            initiative: 7, 
            reload: 1, 
            primaryType: "Pierce", 
            range: { 
                pointBlank: { task: 15, range: 89, damage: "3d8"}, 
                effective: { task: 45, range: 179, damage: "2d10"}, 
                long: { task: 25, range: 449, damage: "2d8"}, 
                extreme: { task: 0, range: 450, damage: "1d8"} 
            }
        }
    }};
MML.items["Long Bow"] = { 
    name: "Long Bow", 
    type: "weapon", 
    weight: 0, 
    grips: {
        "Two Hands": {
            family: "MWD",
            hands: 2, 
            pull: 80, 
            initiative: 6, 
            reload: 1, 
            primaryType: "Pierce", 
            range: { 
                pointBlank: { task: 15, range: 149, damage: "3d10"}, 
                effective: { task: 45, range: 269, damage: "3d8"}, 
                long: { task: 25, range: 599, damage: "3d6"}, 
                extreme: { task: 0, range: 600, damage: "1d10"} 
            }
        }
    }};
MML.items["Heavy Long Bow"] = { 
    name: "Heavy Long Bow", 
    type: "weapon", 
    weight: 0, 
    grips: {
        "Two Hands": {
            family: "MWD", 
            hands: 2, 
            pull: 100, 
            initiative: 4,
            reload: 1, 
            primaryType: "Pierce", 
            range: { 
                pointBlank: { task: 15, range: 179, damage: "3d12"}, 
                effective: { task: 45, range: 299, damage: "3d10"}, 
                long: { task: 25, range: 674, damage: "3d8"}, 
                extreme: { task: 0, range: 675, damage: "1d10"} 
            }
        }
    }};
MML.items["Short Composite Bow"] = {
    name: "Short Composite Bow", 
    type: "weapon",
    weight: 0, 
    grips: {
        "Two Hands": {
            family: "MWD", 
            hands: 2, 
            pull: 60, 
            initiative: 7, 
            reload: 1, 
            primaryType: "Pierce", 
            range: { 
                pointBlank: { task: 15, range: 89, damage: "3d8"},
                effective: { task: 45, range: 179, damage: "2d10"},
                long: { task: 25, range: 449, damage: "2d8"},
                extreme: { task: 0, range: 450, damage: "1d8"}
            }
        }
    }};
MML.items["Medium Composite Bow"] = {
    name: "Medium Composite Bow",
    type: "weapon",
    weight: 0, 
    grips: {
        "Two Hands": {
            family: "MWD",
            hands: 2,
            pull: 80,
            initiative: 6,
            reload: 1,
            primaryType: "Pierce",
            range: {
                pointBlank: { task: 15, range: 149, damage: "3d10"},
                effective: { task: 45, range: 269, damage: "3d8"},
                long: { task: 25, range: 599, damage: "3d6"},
                extreme: { task: 0, range: 600, damage: "1d10"}
            }
        }
    }};
MML.items["Light Cross Bow"] = {
    name: "Light Cross Bow",
    type: "weapon",
    weight: 0, 
    grips: {
        "Two Hands": {
            family: "MWM",
            hands: 2,
            pull: 80,
            initiative: 10,
            reload: 4,
            primaryType: "Pierce",
            range: {
                pointBlank: { task: 15, range: 179, damage: "3d10"}, 
                effective: { task: 45, range: 299, damage: "3d8"}, 
                long: { task: 25, range: 674, damage: "3d6"}, 
                extreme: { task: 0, range: 675, damage: "1d10"} 
            }
        }
    } };
MML.items["Medium Cross Bow"] = {
    name: "Medium Cross Bow", 
    type: "weapon",
    weight: 0, 
    grips: {
        "Two Hands": { 
            family: "MWM", 
            hands: 2, 
            pull: 100, 
            initiative: 10, 
            reload: 6, 
            primaryType: "Pierce", 
            range: {
                pointBlank: { task: 15, range: 224, damage: "3d12"},
                effective: { task: 45, range: 374, damage: "3d10"},
                long: { task: 25, range: 899, damage: "3d8"},
                extreme: { task: 0, range: 900, damage: "1d10"}
            }
        }
    }};
MML.items["Heavy Cross Bow"] = {
    name: "Heavy Cross Bow",
    type: "weapon",
    weight: 0, 
    grips: {
        "Two Hands": {
            family: "MWM",
            hands: 2,
            pull: 120,
            initiative: 8,
            reload: 12,
            primaryType: "Pierce",
            range: {
                pointBlank: { task: 15, range: 269, damage: "4d10"},
                effective: { task: 45, range: 449, damage: "3d12"},
                long: { task: 25, range: 1199, damage: "3d10"},
                extreme: { task: 0, range: 1200, damage: "1d12"}
            }
        }
    }};
MML.items["Battle Axe, Thrown"] = { 
    name: "Battle Axe, Thrown", 
    type: "weapon",
    weight: 0, 
    grips: {
        "Two Hands": { 
            family: "TWH", 
            hands: 1, 
            initiative: 3, 
            accuracyMod: -8, 
            primaryType: "Chop", 
            range: { 
                pointBlank: { task: 35, loadDivider: 8, damage: "2d12"}, 
                effective: { task: 45, loadDivider: 4, damage: "2d10"}, 
                long: { task: 25, loadDivider: 3, damage: "2d6"}, 
                extreme: { task: 0, loadDivider: 2, damage: "1d6"}
            }
        }
    }};

//Spell Components
MML.items["Dart"] = {name: "Dart", type: "spellComponent", spell: "Dart"};
MML.items["Drop of Mercury"] = {name: "Drop of Mercury", type: "spellComponent", spell: "Quick Action"};

//Miscellaneous Items

MML.items["No Shield"] = {name: "No Shield", type: "shield", weight: 0, attackMod: 0, defenseMod: 0};
MML.items["Round Target Shield"] = {name: "Round Target Shield", type: "shield", weight: 1.6, attackMod: 0, defenseMod: 10};
MML.items["Small Round Shield"] = {name: "Small Round Shield", type: "shield", weight: 4.3, attackMod: 0, defenseMod: 20};
MML.items["Medium Round Shield"] = {name: "Medium Round Shield", type: "shield", weight: 11.3, attackMod: -10, defenseMod: 35};
MML.items["Large Round Shield"] = {name: "Large Round Shield", type: "shield", weight: 16.4, attackMod: -16, defenseMod: 43};
MML.items["Small Rectangular Shield"] = {name: "Small Rectangular Shield", type: "shield", weight: 4, attackMod: 0, defenseMod: 19};
MML.items["Medium Rectangular Shield"] = {name: "Medium Rectangular Shield", type: "shield", weight: 11.1, attackMod: -10, defenseMod: 35};
MML.items["Large Rectangular Shield"] = {name: "Large Rectangular Shield", type: "shield", weight: 16.6, attackMod: -15, defenseMod: 39};
MML.items["Heater Shield"] = {name: "Heater Shield", type: "shield", weight: 10.6, attackMod: -10, defenseMod: 33};

MML.HPTables = {};
MML.HPTables["Dwarf"] = [];
MML.HPTables["Dwarf"][9] = "-";
MML.HPTables["Dwarf"][10] = "-";
MML.HPTables["Dwarf"][11] = 7;
MML.HPTables["Dwarf"][12] = 7;
MML.HPTables["Dwarf"][13] = 8;
MML.HPTables["Dwarf"][14] = 8;
MML.HPTables["Dwarf"][15] = 9;
MML.HPTables["Dwarf"][16] = 10;
MML.HPTables["Dwarf"][17] = 10;
MML.HPTables["Dwarf"][18] = 11;
MML.HPTables["Dwarf"][19] = 11;
MML.HPTables["Dwarf"][20] = 12;
MML.HPTables["Dwarf"][21] = 13;
MML.HPTables["Dwarf"][22] = 13;
MML.HPTables["Dwarf"][23] = 14;
MML.HPTables["Dwarf"][24] = 14;
MML.HPTables["Dwarf"][25] = 15;
MML.HPTables["Dwarf"][26] = 15;
MML.HPTables["Dwarf"][27] = 16;
MML.HPTables["Dwarf"][28] = 17;
MML.HPTables["Dwarf"][29] = 17;
MML.HPTables["Dwarf"][30] = 18;
MML.HPTables["Dwarf"][31] = 19;
MML.HPTables["Dwarf"][32] = 19;
MML.HPTables["Dwarf"][33] = 20;
MML.HPTables["Dwarf"][34] = 20;
MML.HPTables["Dwarf"][35] = 21;
MML.HPTables["Dwarf"][36] = 22;
MML.HPTables["Dwarf"][37] = 22;
MML.HPTables["Dwarf"][38] = 23;
MML.HPTables["Dwarf"][39] = 23;
MML.HPTables["Dwarf"][40] = 24;
MML.HPTables["Dwarf"][41] = 25;
MML.HPTables["Dwarf"][42] = 25;
MML.HPTables["Dwarf"][43] = 26;
MML.HPTables["Dwarf"][44] = 26;
MML.HPTables["Dwarf"][45] = 27;
MML.HPTables["Dwarf"][46] = 28;
MML.HPTables["Dwarf"][47] = 28;
MML.HPTables["Dwarf"][48] = 29;
MML.HPTables["Dwarf"][49] = 29;
MML.HPTables["Dwarf"][50] = 30;
MML.HPTables["Dwarf"][51] = 31;
MML.HPTables["Dwarf"][52] = 31;
MML.HPTables["Dwarf"][53] = 32;
MML.HPTables["Dwarf"][54] = 32;
MML.HPTables["Dwarf"][55] = 33;
MML.HPTables["Dwarf"][56] = 34;
MML.HPTables["Dwarf"][57] = 34;
MML.HPTables["Dwarf"][58] = 35;
MML.HPTables["Dwarf"][59] = 35;
MML.HPTables["Dwarf"][60] = 36;
MML.HPTables["Dwarf"][61] = 37;
MML.HPTables["Dwarf"][62] = 37;
MML.HPTables["Dwarf"][63] = 38;
MML.HPTables["Dwarf"][64] = 38;
MML.HPTables["Dwarf"][65] = 39;
MML.HPTables["Dwarf"][66] = 40;
MML.HPTables["Dwarf"][67] = 40;
MML.HPTables["Dwarf"][68] = 41;
MML.HPTables["Dwarf"][69] = 42;
MML.HPTables["Dwarf"][70] = 43;
MML.HPTables["Dwarf"][71] = 43;
MML.HPTables["Dwarf"][72] = 44;
MML.HPTables["Dwarf"][73] = 44;
MML.HPTables["Dwarf"][74] = 45;
MML.HPTables["Dwarf"][75] = 46;
MML.HPTables["Dwarf"][76] = 46;
MML.HPTables["Dwarf"][78] = 47;
MML.HPTables["Dwarf"][79] = 47;
MML.HPTables["Dwarf"][80] = 48;

MML.HPTables["Gnome"] = [];
MML.HPTables["Gnome"][9] = "-";
MML.HPTables["Gnome"][10] = "-";
MML.HPTables["Gnome"][11] = "-";
MML.HPTables["Gnome"][12] = 7;
MML.HPTables["Gnome"][13] = 7;
MML.HPTables["Gnome"][14] = 8;
MML.HPTables["Gnome"][15] = 9;
MML.HPTables["Gnome"][16] = 9;
MML.HPTables["Gnome"][17] = 10;
MML.HPTables["Gnome"][18] = 10;
MML.HPTables["Gnome"][19] = 11;
MML.HPTables["Gnome"][20] = 12;
MML.HPTables["Gnome"][21] = 12;
MML.HPTables["Gnome"][22] = 13;
MML.HPTables["Gnome"][23] = 13;
MML.HPTables["Gnome"][24] = 14;
MML.HPTables["Gnome"][25] = 14;
MML.HPTables["Gnome"][26] = 14;
MML.HPTables["Gnome"][27] = 16;
MML.HPTables["Gnome"][28] = 16;
MML.HPTables["Gnome"][29] = 17;
MML.HPTables["Gnome"][30] = 17;
MML.HPTables["Gnome"][31] = 18;
MML.HPTables["Gnome"][32] = 18;
MML.HPTables["Gnome"][33] = 19;
MML.HPTables["Gnome"][34] = 20;
MML.HPTables["Gnome"][35] = 20;
MML.HPTables["Gnome"][36] = 21;
MML.HPTables["Gnome"][37] = 21;
MML.HPTables["Gnome"][38] = 22;
MML.HPTables["Gnome"][39] = 22;
MML.HPTables["Gnome"][40] = 23;
MML.HPTables["Gnome"][41] = 24;
MML.HPTables["Gnome"][42] = 24;
MML.HPTables["Gnome"][43] = 25;
MML.HPTables["Gnome"][44] = 25;
MML.HPTables["Gnome"][45] = 26;
MML.HPTables["Gnome"][46] = 26;
MML.HPTables["Gnome"][47] = 27;
MML.HPTables["Gnome"][48] = 28;
MML.HPTables["Gnome"][49] = 28;
MML.HPTables["Gnome"][50] = 29;
MML.HPTables["Gnome"][51] = 29;
MML.HPTables["Gnome"][52] = 30;
MML.HPTables["Gnome"][53] = 30;
MML.HPTables["Gnome"][54] = 31;
MML.HPTables["Gnome"][55] = 32;
MML.HPTables["Gnome"][56] = 32;
MML.HPTables["Gnome"][57] = 33;
MML.HPTables["Gnome"][58] = 33;
MML.HPTables["Gnome"][59] = 34;
MML.HPTables["Gnome"][60] = 35;
MML.HPTables["Gnome"][61] = 35;
MML.HPTables["Gnome"][62] = 36;
MML.HPTables["Gnome"][63] = 36;
MML.HPTables["Gnome"][64] = 37;
MML.HPTables["Gnome"][65] = 37;
MML.HPTables["Gnome"][66] = 38;
MML.HPTables["Gnome"][67] = 39;
MML.HPTables["Gnome"][68] = 39;
MML.HPTables["Gnome"][69] = 40;
MML.HPTables["Gnome"][70] = 40;
MML.HPTables["Gnome"][71] = 41;
MML.HPTables["Gnome"][72] = 41;
MML.HPTables["Gnome"][73] = "-";
MML.HPTables["Gnome"][74] = "-";
MML.HPTables["Gnome"][75] = "-";
MML.HPTables["Gnome"][76] = "-";
MML.HPTables["Gnome"][78] = "-";
MML.HPTables["Gnome"][79] = "-";
MML.HPTables["Gnome"][80] = "-";

MML.HPTables["Gray Elf"] = [];
MML.HPTables["Gray Elf"][9] = "-";
MML.HPTables["Gray Elf"][10] = "-";
MML.HPTables["Gray Elf"][11] = "-";
MML.HPTables["Gray Elf"][12] = 7;
MML.HPTables["Gray Elf"][13] = 7;
MML.HPTables["Gray Elf"][14] = 8;
MML.HPTables["Gray Elf"][15] = 8;
MML.HPTables["Gray Elf"][16] = 9;
MML.HPTables["Gray Elf"][17] = 9;
MML.HPTables["Gray Elf"][18] = 10;
MML.HPTables["Gray Elf"][19] = 10;
MML.HPTables["Gray Elf"][20] = 11;
MML.HPTables["Gray Elf"][21] = 12;
MML.HPTables["Gray Elf"][22] = 12;
MML.HPTables["Gray Elf"][23] = 13;
MML.HPTables["Gray Elf"][24] = 13;
MML.HPTables["Gray Elf"][25] = 14;
MML.HPTables["Gray Elf"][26] = 14;
MML.HPTables["Gray Elf"][27] = 15;
MML.HPTables["Gray Elf"][28] = 15;
MML.HPTables["Gray Elf"][29] = 16;
MML.HPTables["Gray Elf"][30] = 17;
MML.HPTables["Gray Elf"][31] = 17;
MML.HPTables["Gray Elf"][32] = 18;
MML.HPTables["Gray Elf"][33] = 18;
MML.HPTables["Gray Elf"][34] = 19;
MML.HPTables["Gray Elf"][35] = 19;
MML.HPTables["Gray Elf"][36] = 20;
MML.HPTables["Gray Elf"][37] = 20;
MML.HPTables["Gray Elf"][38] = 21;
MML.HPTables["Gray Elf"][39] = 21;
MML.HPTables["Gray Elf"][40] = 22;
MML.HPTables["Gray Elf"][41] = 23;
MML.HPTables["Gray Elf"][42] = 23;
MML.HPTables["Gray Elf"][43] = 24;
MML.HPTables["Gray Elf"][44] = 24;
MML.HPTables["Gray Elf"][45] = 25;
MML.HPTables["Gray Elf"][46] = 25;
MML.HPTables["Gray Elf"][47] = 26;
MML.HPTables["Gray Elf"][48] = 26;
MML.HPTables["Gray Elf"][49] = 27;
MML.HPTables["Gray Elf"][50] = 28;
MML.HPTables["Gray Elf"][51] = 28;
MML.HPTables["Gray Elf"][52] = 29;
MML.HPTables["Gray Elf"][53] = 29;
MML.HPTables["Gray Elf"][54] = 30;
MML.HPTables["Gray Elf"][55] = 30;
MML.HPTables["Gray Elf"][56] = 31;
MML.HPTables["Gray Elf"][57] = 31;
MML.HPTables["Gray Elf"][58] = 32;
MML.HPTables["Gray Elf"][59] = 32;
MML.HPTables["Gray Elf"][60] = 33;
MML.HPTables["Gray Elf"][61] = 34;
MML.HPTables["Gray Elf"][62] = 34;
MML.HPTables["Gray Elf"][63] = 35;
MML.HPTables["Gray Elf"][64] = 35;
MML.HPTables["Gray Elf"][65] = 36;
MML.HPTables["Gray Elf"][66] = 36;
MML.HPTables["Gray Elf"][67] = 37;
MML.HPTables["Gray Elf"][68] = 37;
MML.HPTables["Gray Elf"][69] = 38;
MML.HPTables["Gray Elf"][70] = 39;
MML.HPTables["Gray Elf"][71] = 39;
MML.HPTables["Gray Elf"][72] = 40;
MML.HPTables["Gray Elf"][73] = 40;
MML.HPTables["Gray Elf"][74] = "-";
MML.HPTables["Gray Elf"][75] = "-";
MML.HPTables["Gray Elf"][76] = "-";
MML.HPTables["Gray Elf"][78] = "-";
MML.HPTables["Gray Elf"][79] = "-";
MML.HPTables["Gray Elf"][80] = "-";

MML.HPTables["Hobbit"] = [];
MML.HPTables["Hobbit"][9] = 5;
MML.HPTables["Hobbit"][10] = 6;
MML.HPTables["Hobbit"][11] = 6;
MML.HPTables["Hobbit"][12] = 7;
MML.HPTables["Hobbit"][13] = 7;
MML.HPTables["Hobbit"][14] = 8;
MML.HPTables["Hobbit"][15] = 8;
MML.HPTables["Hobbit"][16] = 9;
MML.HPTables["Hobbit"][17] = 9;
MML.HPTables["Hobbit"][18] = 10;
MML.HPTables["Hobbit"][19] = 10;
MML.HPTables["Hobbit"][20] = 11;
MML.HPTables["Hobbit"][21] = 12;
MML.HPTables["Hobbit"][22] = 12;
MML.HPTables["Hobbit"][23] = 13;
MML.HPTables["Hobbit"][24] = 13;
MML.HPTables["Hobbit"][25] = 14;
MML.HPTables["Hobbit"][26] = 14;
MML.HPTables["Hobbit"][27] = 15;
MML.HPTables["Hobbit"][28] = 15;
MML.HPTables["Hobbit"][29] = 16;
MML.HPTables["Hobbit"][30] = 17;
MML.HPTables["Hobbit"][31] = 17;
MML.HPTables["Hobbit"][32] = 18;
MML.HPTables["Hobbit"][33] = 18;
MML.HPTables["Hobbit"][34] = 19;
MML.HPTables["Hobbit"][35] = 19;
MML.HPTables["Hobbit"][36] = 20;
MML.HPTables["Hobbit"][37] = 20;
MML.HPTables["Hobbit"][38] = 21;
MML.HPTables["Hobbit"][39] = 21;
MML.HPTables["Hobbit"][40] = 22;
MML.HPTables["Hobbit"][41] = 23;
MML.HPTables["Hobbit"][42] = 23;
MML.HPTables["Hobbit"][43] = 24;
MML.HPTables["Hobbit"][44] = 24;
MML.HPTables["Hobbit"][45] = 25;
MML.HPTables["Hobbit"][46] = 25;
MML.HPTables["Hobbit"][47] = 26;
MML.HPTables["Hobbit"][48] = 26;
MML.HPTables["Hobbit"][49] = 27;
MML.HPTables["Hobbit"][50] = 28;
MML.HPTables["Hobbit"][51] = 28;
MML.HPTables["Hobbit"][52] = 29;
MML.HPTables["Hobbit"][53] = 29;
MML.HPTables["Hobbit"][54] = 30;
MML.HPTables["Hobbit"][55] = 30;
MML.HPTables["Hobbit"][56] = 31;
MML.HPTables["Hobbit"][57] = 31;
MML.HPTables["Hobbit"][58] = "-";
MML.HPTables["Hobbit"][59] = "-";
MML.HPTables["Hobbit"][60] = "-";
MML.HPTables["Hobbit"][61] = "-";
MML.HPTables["Hobbit"][62] = "-";
MML.HPTables["Hobbit"][63] = "-";
MML.HPTables["Hobbit"][64] = "-";
MML.HPTables["Hobbit"][65] = "-";
MML.HPTables["Hobbit"][66] = "-";
MML.HPTables["Hobbit"][67] = "-";
MML.HPTables["Hobbit"][68] = "-";
MML.HPTables["Hobbit"][69] = "-";
MML.HPTables["Hobbit"][70] = "-";
MML.HPTables["Hobbit"][71] = "-";
MML.HPTables["Hobbit"][72] = "-";
MML.HPTables["Hobbit"][73] = "-";
MML.HPTables["Hobbit"][74] = "-";
MML.HPTables["Hobbit"][75] = "-";
MML.HPTables["Hobbit"][76] = "-";
MML.HPTables["Hobbit"][78] = "-";
MML.HPTables["Hobbit"][79] = "-";
MML.HPTables["Hobbit"][80] = "-";

MML.HPTables["Human"] = [];
MML.HPTables["Human"][9] = "-";
MML.HPTables["Human"][10] = "-";
MML.HPTables["Human"][11] = "-";
MML.HPTables["Human"][12] = 6;
MML.HPTables["Human"][13] = 7;
MML.HPTables["Human"][14] = 7;
MML.HPTables["Human"][15] = 8;
MML.HPTables["Human"][16] = 8;
MML.HPTables["Human"][17] = 9;
MML.HPTables["Human"][18] = 9;
MML.HPTables["Human"][19] = 10;
MML.HPTables["Human"][20] = 10;
MML.HPTables["Human"][21] = 11;
MML.HPTables["Human"][22] = 11;
MML.HPTables["Human"][23] = 12;
MML.HPTables["Human"][24] = 12;
MML.HPTables["Human"][25] = 13;
MML.HPTables["Human"][26] = 13;
MML.HPTables["Human"][27] = 14;
MML.HPTables["Human"][28] = 14;
MML.HPTables["Human"][29] = 15;
MML.HPTables["Human"][30] = 15;
MML.HPTables["Human"][31] = 16;
MML.HPTables["Human"][32] = 16;
MML.HPTables["Human"][33] = 17;
MML.HPTables["Human"][34] = 17;
MML.HPTables["Human"][35] = 18;
MML.HPTables["Human"][36] = 18;
MML.HPTables["Human"][37] = 19;
MML.HPTables["Human"][38] = 19;
MML.HPTables["Human"][39] = 20;
MML.HPTables["Human"][40] = 20;
MML.HPTables["Human"][41] = 21;
MML.HPTables["Human"][42] = 21;
MML.HPTables["Human"][43] = 22;
MML.HPTables["Human"][44] = 22;
MML.HPTables["Human"][45] = 23;
MML.HPTables["Human"][46] = 23;
MML.HPTables["Human"][47] = 24;
MML.HPTables["Human"][48] = 24;
MML.HPTables["Human"][49] = 25;
MML.HPTables["Human"][50] = 25;
MML.HPTables["Human"][51] = 26;
MML.HPTables["Human"][52] = 26;
MML.HPTables["Human"][53] = 27;
MML.HPTables["Human"][54] = 27;
MML.HPTables["Human"][55] = 28;
MML.HPTables["Human"][56] = 28;
MML.HPTables["Human"][57] = 29;
MML.HPTables["Human"][58] = 29;
MML.HPTables["Human"][59] = 30;
MML.HPTables["Human"][60] = 30;
MML.HPTables["Human"][61] = 31;
MML.HPTables["Human"][62] = 31;
MML.HPTables["Human"][63] = 32;
MML.HPTables["Human"][64] = 32;
MML.HPTables["Human"][65] = 33;
MML.HPTables["Human"][66] = 33;
MML.HPTables["Human"][67] = 34;
MML.HPTables["Human"][68] = 34;
MML.HPTables["Human"][69] = 35;
MML.HPTables["Human"][70] = 35;
MML.HPTables["Human"][71] = "-";
MML.HPTables["Human"][72] = "-";
MML.HPTables["Human"][73] = "-";
MML.HPTables["Human"][74] = "-";
MML.HPTables["Human"][75] = "-";
MML.HPTables["Human"][76] = "-";
MML.HPTables["Human"][78] = "-";
MML.HPTables["Human"][79] = "-";
MML.HPTables["Human"][80] = "-";

MML.HPTables["Wood Elf"] = [];
MML.HPTables["Wood Elf"][9] = "-";
MML.HPTables["Wood Elf"][10] = "-";
MML.HPTables["Wood Elf"][11] = "-";
MML.HPTables["Wood Elf"][12] = "-";
MML.HPTables["Wood Elf"][13] = 7;
MML.HPTables["Wood Elf"][14] = 7;
MML.HPTables["Wood Elf"][15] = 8;
MML.HPTables["Wood Elf"][16] = 8;
MML.HPTables["Wood Elf"][17] = 9;
MML.HPTables["Wood Elf"][18] = 9;
MML.HPTables["Wood Elf"][19] = 10;
MML.HPTables["Wood Elf"][20] = 11;
MML.HPTables["Wood Elf"][21] = 11;
MML.HPTables["Wood Elf"][22] = 12;
MML.HPTables["Wood Elf"][23] = 12;
MML.HPTables["Wood Elf"][24] = 13;
MML.HPTables["Wood Elf"][25] = 13;
MML.HPTables["Wood Elf"][26] = 13;
MML.HPTables["Wood Elf"][27] = 14;
MML.HPTables["Wood Elf"][28] = 15;
MML.HPTables["Wood Elf"][29] = 15;
MML.HPTables["Wood Elf"][30] = 16;
MML.HPTables["Wood Elf"][31] = 16;
MML.HPTables["Wood Elf"][32] = 17;
MML.HPTables["Wood Elf"][33] = 17;
MML.HPTables["Wood Elf"][34] = 18;
MML.HPTables["Wood Elf"][35] = 18;
MML.HPTables["Wood Elf"][36] = 19;
MML.HPTables["Wood Elf"][37] = 19;
MML.HPTables["Wood Elf"][38] = 20;
MML.HPTables["Wood Elf"][39] = 20;
MML.HPTables["Wood Elf"][40] = 21;
MML.HPTables["Wood Elf"][41] = 22;
MML.HPTables["Wood Elf"][42] = 22;
MML.HPTables["Wood Elf"][43] = 23;
MML.HPTables["Wood Elf"][44] = 23;
MML.HPTables["Wood Elf"][45] = 24;
MML.HPTables["Wood Elf"][46] = 24;
MML.HPTables["Wood Elf"][47] = 25;
MML.HPTables["Wood Elf"][48] = 25;
MML.HPTables["Wood Elf"][49] = 26;
MML.HPTables["Wood Elf"][50] = 26;
MML.HPTables["Wood Elf"][51] = 27;
MML.HPTables["Wood Elf"][52] = 27;
MML.HPTables["Wood Elf"][53] = 28;
MML.HPTables["Wood Elf"][54] = 28;
MML.HPTables["Wood Elf"][55] = 29;
MML.HPTables["Wood Elf"][56] = 29;
MML.HPTables["Wood Elf"][57] = 30;
MML.HPTables["Wood Elf"][58] = 30;
MML.HPTables["Wood Elf"][59] = 31;
MML.HPTables["Wood Elf"][60] = 32;
MML.HPTables["Wood Elf"][61] = 32;
MML.HPTables["Wood Elf"][62] = 33;
MML.HPTables["Wood Elf"][63] = 33;
MML.HPTables["Wood Elf"][64] = 34;
MML.HPTables["Wood Elf"][65] = 34;
MML.HPTables["Wood Elf"][66] = 35;
MML.HPTables["Wood Elf"][67] = 35;
MML.HPTables["Wood Elf"][68] = 36;
MML.HPTables["Wood Elf"][69] = 36;
MML.HPTables["Wood Elf"][70] = "-";
MML.HPTables["Wood Elf"][71] = "-";
MML.HPTables["Wood Elf"][72] = "-";
MML.HPTables["Wood Elf"][73] = "-";
MML.HPTables["Wood Elf"][74] = "-";
MML.HPTables["Wood Elf"][75] = "-";
MML.HPTables["Wood Elf"][76] = "-";
MML.HPTables["Wood Elf"][78] = "-";
MML.HPTables["Wood Elf"][79] = "-";
MML.HPTables["Wood Elf"][80] = "-";

MML.statureTables = {};
MML.statureTables["Human"] = {};
MML.statureTables["Human"]["Male"] = [];
MML.statureTables["Human"]["Male"][1] = { height: "4'11", weight: 120, stature: 17};
MML.statureTables["Human"]["Male"][2] = { height: "5'0", weight: 123, stature: 18 };
MML.statureTables["Human"]["Male"][3] = { height: "5'1", weight: 125, stature: 18 };
MML.statureTables["Human"]["Male"][4] = { height: "5'2", weight: 128, stature: 19 };
MML.statureTables["Human"]["Male"][5] = { height: "5'3", weight: 130, stature: 20 };
MML.statureTables["Human"]["Male"][6] = { height: "5'4", weight: 135, stature: 20 };
MML.statureTables["Human"]["Male"][7] = { height: "5'5", weight: 140, stature: 21 };
MML.statureTables["Human"]["Male"][8] = { height: "5'6", weight: 145, stature: 22 };
MML.statureTables["Human"]["Male"][9] = { height: "5'7", weight: 150, stature: 22 };
MML.statureTables["Human"]["Male"][10] = { height: "5'8", weight: 155, stature: 23 };
MML.statureTables["Human"]["Male"][11] = { height: "5'9", weight: 160, stature: 23 };
MML.statureTables["Human"]["Male"][12] = { height: "5'10", weight: 165, stature: 24 };
MML.statureTables["Human"]["Male"][13] = { height: "5'11", weight: 170, stature: 24 };
MML.statureTables["Human"]["Male"][14] = { height: "6'0", weight: 175, stature: 25 };
MML.statureTables["Human"]["Male"][15] = { height: "6'1", weight: 180, stature: 25 };
MML.statureTables["Human"]["Male"][16] = { height: "6'2", weight: 185, stature: 26 };
MML.statureTables["Human"]["Male"][17] = { height: "6'3", weight: 190, stature: 27 };
MML.statureTables["Human"]["Male"][18] = { height: "6'4", weight: 200, stature: 28 };
MML.statureTables["Human"]["Male"][19] = { height: "6'5", weight: 210, stature: 29 };
MML.statureTables["Human"]["Male"][20] = { height: "6'6", weight: 220, stature: 30 };

MML.statureTables["Human"]["Female"] = [];
MML.statureTables["Human"]["Female"][1] = { height: "4'8", weight: 113, stature: 17 };
MML.statureTables["Human"]["Female"][2] = { height: "4'9", weight: 115, stature: 18 };
MML.statureTables["Human"]["Female"][3] = { height: "4'10", weight: 118, stature: 18 };
MML.statureTables["Human"]["Female"][4] = { height: "4'11", weight: 120, stature: 18 };
MML.statureTables["Human"]["Female"][5] = { height: "5'0", weight: 123, stature: 18 };
MML.statureTables["Human"]["Female"][6] = { height: "5'1", weight: 125, stature: 19 };
MML.statureTables["Human"]["Female"][7] = { height: "5'2", weight: 128, stature: 19 };
MML.statureTables["Human"]["Female"][8] = { height: "5'3", weight: 133, stature: 19 };
MML.statureTables["Human"]["Female"][9] = { height: "5'4", weight: 135, stature: 20 };
MML.statureTables["Human"]["Female"][10] = { height: "5'5", weight: 138, stature: 21 };
MML.statureTables["Human"]["Female"][11] = { height: "5'6", weight: 140, stature: 21 };
MML.statureTables["Human"]["Female"][12] = { height: "5'7", weight: 143, stature: 21 };
MML.statureTables["Human"]["Female"][13] = { height: "5'8", weight: 145, stature: 22 };
MML.statureTables["Human"]["Female"][14] = { height: "5'9", weight: 148, stature: 22 };
MML.statureTables["Human"]["Female"][15] = { height: "5'10", weight: 150, stature: 22 };
MML.statureTables["Human"]["Female"][16] = { height: "5'11", weight: 155, stature: 23 };
MML.statureTables["Human"]["Female"][17] = { height: "6'0", weight: 160, stature: 23 };
MML.statureTables["Human"]["Female"][18] = { height: "6'1", weight: 165, stature: 24 };
MML.statureTables["Human"]["Female"][19] = { height: "6'2", weight: 170, stature: 24 };
MML.statureTables["Human"]["Female"][20] = { height: "6'3", weight: 175, stature: 25 };

MML.statureTables["Dwarf"] = {};
MML.statureTables["Dwarf"]["Male"] = [];
MML.statureTables["Dwarf"]["Male"][1] = { height: "3'10", weight: 140, stature: 19 };
MML.statureTables["Dwarf"]["Male"][2] = { height: "3'10", weight: 140, stature: 19 };
MML.statureTables["Dwarf"]["Male"][3] = { height: "3'11", weight: 150, stature: 20 };
MML.statureTables["Dwarf"]["Male"][4] = { height: "3'11", weight: 150, stature: 20 };
MML.statureTables["Dwarf"]["Male"][5] = { height: "4'0", weight: 160, stature: 21 };
MML.statureTables["Dwarf"]["Male"][6] = { height: "4'0", weight: 160, stature: 21 };
MML.statureTables["Dwarf"]["Male"][7] = { height: "4'1", weight: 170, stature: 22 };
MML.statureTables["Dwarf"]["Male"][8] = { height: "4'2", weight: 180, stature: 23 };
MML.statureTables["Dwarf"]["Male"][9] = { height: "4'3", weight: 190, stature: 24 };
MML.statureTables["Dwarf"]["Male"][10] = { height: "4'4", weight: 200, stature: 25 };
MML.statureTables["Dwarf"]["Male"][11] = { height: "4'5", weight: 210, stature: 26 };
MML.statureTables["Dwarf"]["Male"][12] = { height: "4'6", weight: 220, stature: 27 };
MML.statureTables["Dwarf"]["Male"][13] = { height: "4'7", weight: 230, stature: 29 };
MML.statureTables["Dwarf"]["Male"][14] = { height: "4'8", weight: 240, stature: 30 };
MML.statureTables["Dwarf"]["Male"][15] = { height: "4'9", weight: 250, stature: 31 };
MML.statureTables["Dwarf"]["Male"][16] = { height: "4'10", weight: 260, stature: 32 };
MML.statureTables["Dwarf"]["Male"][17] = { height: "4'11", weight: 270, stature: 33 };
MML.statureTables["Dwarf"]["Male"][18] = { height: "4'11", weight: 270, stature: 33 };
MML.statureTables["Dwarf"]["Male"][19] = { height: "5'0", weight: 280, stature: 34 };
MML.statureTables["Dwarf"]["Male"][20] = { height: "5'0", weight: 280, stature: 34 };

MML.statureTables["Dwarf"]["Female"] = [];
MML.statureTables["Dwarf"]["Female"][1] = { height: "3'8", weight: 110, stature: 15 };
MML.statureTables["Dwarf"]["Female"][2] = { height: "3'8", weight: 110, stature: 15 };
MML.statureTables["Dwarf"]["Female"][3] = { height: "3'9", weight: 120, stature: 17 };
MML.statureTables["Dwarf"]["Female"][4] = { height: "3'9", weight: 120, stature: 17 };
MML.statureTables["Dwarf"]["Female"][5] = { height: "3'10", weight: 130, stature: 18 };
MML.statureTables["Dwarf"]["Female"][6] = { height: "3'10", weight: 130, stature: 18 };
MML.statureTables["Dwarf"]["Female"][7] = { height: "3'11", weight: 140, stature: 19 };
MML.statureTables["Dwarf"]["Female"][8] = { height: "4'0", weight: 150, stature: 20 };
MML.statureTables["Dwarf"]["Female"][9] = { height: "4'1", weight: 160, stature: 21 };
MML.statureTables["Dwarf"]["Female"][10] = { height: "4'2", weight: 170, stature: 22 };
MML.statureTables["Dwarf"]["Female"][11] = { height: "4'3", weight: 180, stature: 23 };
MML.statureTables["Dwarf"]["Female"][12] = { height: "4'3", weight: 180, stature: 23 };
MML.statureTables["Dwarf"]["Female"][13] = { height: "4'4", weight: 190, stature: 24 };
MML.statureTables["Dwarf"]["Female"][14] = { height: "4'4", weight: 190, stature: 24 };
MML.statureTables["Dwarf"]["Female"][15] = { height: "4'5", weight: 200, stature: 25 };
MML.statureTables["Dwarf"]["Female"][16] = { height: "4'5", weight: 200, stature: 25 };
MML.statureTables["Dwarf"]["Female"][17] = { height: "4'6", weight: 210, stature: 26 };
MML.statureTables["Dwarf"]["Female"][18] = { height: "4'6", weight: 210, stature: 26 };
MML.statureTables["Dwarf"]["Female"][19] = { height: "4'7", weight: 220, stature: 27 };
MML.statureTables["Dwarf"]["Female"][20] = { height: "4'7", weight: 220, stature: 27 };

MML.statureTables["Gnome"] = {};
MML.statureTables["Gnome"]["Male"] = [];
MML.statureTables["Gnome"]["Male"][1] = { height: "3'11", weight: 130, stature: 18 };
MML.statureTables["Gnome"]["Male"][2] = { height: "3'11", weight: 130, stature: 18 };
MML.statureTables["Gnome"]["Male"][3] = { height: "4'0", weight: 140, stature: 19 };
MML.statureTables["Gnome"]["Male"][4] = { height: "4'0", weight: 140, stature: 19 };
MML.statureTables["Gnome"]["Male"][5] = { height: "4'1", weight: 150, stature: 20 };
MML.statureTables["Gnome"]["Male"][6] = { height: "4'1", weight: 150, stature: 20 };
MML.statureTables["Gnome"]["Male"][7] = { height: "4'2", weight: 160, stature: 21 };
MML.statureTables["Gnome"]["Male"][8] = { height: "4'2", weight: 160, stature: 21 };
MML.statureTables["Gnome"]["Male"][9] = { height: "4'3", weight: 170, stature: 22 };
MML.statureTables["Gnome"]["Male"][10] = { height: "4'4", weight: 180, stature: 23 };
MML.statureTables["Gnome"]["Male"][11] = { height: "4'5", weight: 190, stature: 24 };
MML.statureTables["Gnome"]["Male"][12] = { height: "4'5", weight: 190, stature: 24 };
MML.statureTables["Gnome"]["Male"][13] = { height: "4'6", weight: 200, stature: 25 };
MML.statureTables["Gnome"]["Male"][14] = { height: "4'6", weight: 200, stature: 25 };
MML.statureTables["Gnome"]["Male"][15] = { height: "4'7", weight: 210, stature: 27 };
MML.statureTables["Gnome"]["Male"][16] = { height: "4'7", weight: 210, stature: 27 };
MML.statureTables["Gnome"]["Male"][17] = { height: "4'8", weight: 220, stature: 28 };
MML.statureTables["Gnome"]["Male"][18] = { height: "4'8", weight: 220, stature: 28 };
MML.statureTables["Gnome"]["Male"][19] = { height: "4'9", weight: 230, stature: 29 };
MML.statureTables["Gnome"]["Male"][20] = { height: "4'9", weight: 230, stature: 29 };

MML.statureTables["Gnome"]["Female"] = [];
MML.statureTables["Gnome"]["Female"][1] = { height: "3'9", weight: 100, stature: 17 };
MML.statureTables["Gnome"]["Female"][2] = { height: "3'9", weight: 100, stature: 17 };
MML.statureTables["Gnome"]["Female"][3] = { height: "3'10", weight: 110, stature: 18 };
MML.statureTables["Gnome"]["Female"][4] = { height: "3'10", weight: 110, stature: 18 };
MML.statureTables["Gnome"]["Female"][5] = { height: "3'11", weight: 120, stature: 19 };
MML.statureTables["Gnome"]["Female"][6] = { height: "3'11", weight: 120, stature: 19 };
MML.statureTables["Gnome"]["Female"][7] = { height: "4'0", weight: 130, stature: 20 };
MML.statureTables["Gnome"]["Female"][8] = { height: "4'0", weight: 130, stature: 20 };
MML.statureTables["Gnome"]["Female"][9] = { height: "4'1", weight: 140, stature: 21 };
MML.statureTables["Gnome"]["Female"][10] = { height: "4'2", weight: 150, stature: 22 };
MML.statureTables["Gnome"]["Female"][11] = { height: "4'3", weight: 160, stature: 23 };
MML.statureTables["Gnome"]["Female"][12] = { height: "4'3", weight: 160, stature: 23 };
MML.statureTables["Gnome"]["Female"][13] = { height: "4'4", weight: 170, stature: 24 };
MML.statureTables["Gnome"]["Female"][14] = { height: "4'4", weight: 170, stature: 24 };
MML.statureTables["Gnome"]["Female"][15] = { height: "4'5", weight: 180, stature: 25 };
MML.statureTables["Gnome"]["Female"][16] = { height: "4'5", weight: 180, stature: 25 };
MML.statureTables["Gnome"]["Female"][17] = { height: "4'6", weight: 190, stature: 26 };
MML.statureTables["Gnome"]["Female"][18] = { height: "4'6", weight: 190, stature: 26 };
MML.statureTables["Gnome"]["Female"][19] = { height: "4'7", weight: 200, stature: 27 };
MML.statureTables["Gnome"]["Female"][20] = { height: "4'7", weight: 200, stature: 27 };

MML.statureTables["Gray Elf"] = {};
MML.statureTables["Gray Elf"]["Male"] = [];
MML.statureTables["Gray Elf"]["Male"][1] = { height: "5'1", weight: 125, stature: 18 };
MML.statureTables["Gray Elf"]["Male"][2] = { height: "5'2", weight: 128, stature: 19 };
MML.statureTables["Gray Elf"]["Male"][3] = { height: "5'3", weight: 130, stature: 20 };
MML.statureTables["Gray Elf"]["Male"][4] = { height: "5'4", weight: 135, stature: 20 };
MML.statureTables["Gray Elf"]["Male"][5] = { height: "5'5", weight: 140, stature: 21 };
MML.statureTables["Gray Elf"]["Male"][6] = { height: "5'6", weight: 145, stature: 22 };
MML.statureTables["Gray Elf"]["Male"][7] = { height: "5'7", weight: 150, stature: 22 };
MML.statureTables["Gray Elf"]["Male"][8] = { height: "5'8", weight: 155, stature: 23 };
MML.statureTables["Gray Elf"]["Male"][9] = { height: "5'9", weight: 160, stature: 23 };
MML.statureTables["Gray Elf"]["Male"][10] = { height: "5'10", weight: 165, stature: 24 };
MML.statureTables["Gray Elf"]["Male"][11] = { height: "5'11", weight: 170, stature: 24 };
MML.statureTables["Gray Elf"]["Male"][12] = { height: "6'0", weight: 175, stature: 25 };
MML.statureTables["Gray Elf"]["Male"][13] = { height: "6'1", weight: 180, stature: 25 };
MML.statureTables["Gray Elf"]["Male"][14] = { height: "6'2", weight: 185, stature: 26 };
MML.statureTables["Gray Elf"]["Male"][15] = { height: "6'3", weight: 190, stature: 27 };
MML.statureTables["Gray Elf"]["Male"][16] = { height: "6'4", weight: 200, stature: 28 };
MML.statureTables["Gray Elf"]["Male"][17] = { height: "6'5", weight: 210, stature: 29 };
MML.statureTables["Gray Elf"]["Male"][18] = { height: "6'6", weight: 220, stature: 30 };
MML.statureTables["Gray Elf"]["Male"][19] = { height: "6'7", weight: 230, stature: 31 };
MML.statureTables["Gray Elf"]["Male"][20] = { height: "6'8", weight: 250, stature: 33 };

MML.statureTables["Gray Elf"]["Female"] = [];
MML.statureTables["Gray Elf"]["Female"][1] = { height: "5'1", weight: 120, stature: 18 };
MML.statureTables["Gray Elf"]["Female"][2] = { height: "5'1", weight: 120, stature: 18 };
MML.statureTables["Gray Elf"]["Female"][3] = { height: "5'2", weight: 123, stature: 18 };
MML.statureTables["Gray Elf"]["Female"][4] = { height: "5'2", weight: 123, stature: 18 };
MML.statureTables["Gray Elf"]["Female"][5] = { height: "5'3", weight: 125, stature: 19 };
MML.statureTables["Gray Elf"]["Female"][6] = { height: "5'3", weight: 125, stature: 19 };
MML.statureTables["Gray Elf"]["Female"][7] = { height: "5'4", weight: 128, stature: 19 };
MML.statureTables["Gray Elf"]["Female"][8] = { height: "5'5", weight: 130, stature: 20 };
MML.statureTables["Gray Elf"]["Female"][9] = { height: "5'6", weight: 133, stature: 20 };
MML.statureTables["Gray Elf"]["Female"][10] = { height: "5'7", weight: 135, stature: 21 };
MML.statureTables["Gray Elf"]["Female"][11] = { height: "5'8", weight: 140, stature: 21 };
MML.statureTables["Gray Elf"]["Female"][12] = { height: "5'9", weight: 145, stature: 22 };
MML.statureTables["Gray Elf"]["Female"][13] = { height: "5'10", weight: 150, stature: 22 };
MML.statureTables["Gray Elf"]["Female"][14] = { height: "5'11", weight: 155, stature: 23 };
MML.statureTables["Gray Elf"]["Female"][15] = { height: "6'0", weight: 160, stature: 23 };
MML.statureTables["Gray Elf"]["Female"][16] = { height: "6'1", weight: 165, stature: 24 };
MML.statureTables["Gray Elf"]["Female"][17] = { height: "6'2", weight: 170, stature: 25 };
MML.statureTables["Gray Elf"]["Female"][18] = { height: "6'2", weight: 170, stature: 25 };
MML.statureTables["Gray Elf"]["Female"][19] = { height: "6'3", weight: 175, stature: 26 };
MML.statureTables["Gray Elf"]["Female"][20] = { height: "6'3", weight: 175, stature: 26 };

MML.statureTables["Hobbit"] = {};
MML.statureTables["Hobbit"]["Male"] = [];
MML.statureTables["Hobbit"]["Male"][1] = { height: "3'4", weight: 55, stature: 10 };
MML.statureTables["Hobbit"]["Male"][2] = { height: "3'4", weight: 55, stature: 10 };
MML.statureTables["Hobbit"]["Male"][3] = { height: "3'6", weight: 60, stature: 11 };
MML.statureTables["Hobbit"]["Male"][4] = { height: "3'6", weight: 60, stature: 11 };
MML.statureTables["Hobbit"]["Male"][5] = { height: "3'7", weight: 65, stature: 11 };
MML.statureTables["Hobbit"]["Male"][6] = { height: "3'7", weight: 65, stature: 11 };
MML.statureTables["Hobbit"]["Male"][7] = { height: "3'8", weight: 70, stature: 12 };
MML.statureTables["Hobbit"]["Male"][8] = { height: "3'8", weight: 70, stature: 12 };
MML.statureTables["Hobbit"]["Male"][9] = { height: "3'9", weight: 75, stature: 12 };
MML.statureTables["Hobbit"]["Male"][10] = { height: "3'10", weight: 80, stature: 13 };
MML.statureTables["Hobbit"]["Male"][11] = { height: "3'11", weight: 85, stature: 14 };
MML.statureTables["Hobbit"]["Male"][12] = { height: "3'11", weight: 85, stature: 14 };
MML.statureTables["Hobbit"]["Male"][13] = { height: "4'0", weight: 90, stature: 14 };
MML.statureTables["Hobbit"]["Male"][14] = { height: "4'0", weight: 90, stature: 14 };
MML.statureTables["Hobbit"]["Male"][15] = { height: "4'1", weight: 95, stature: 15 };
MML.statureTables["Hobbit"]["Male"][16] = { height: "4'1", weight: 95, stature: 15 };
MML.statureTables["Hobbit"]["Male"][17] = { height: "4'2", weight: 100, stature: 15 };
MML.statureTables["Hobbit"]["Male"][18] = { height: "4'2", weight: 100, stature: 15 };
MML.statureTables["Hobbit"]["Male"][19] = { height: "4'3", weight: 110, stature: 16 };
MML.statureTables["Hobbit"]["Male"][20] = { height: "4'3", weight: 110, stature: 16 };

MML.statureTables["Hobbit"]["Female"] = [];
MML.statureTables["Hobbit"]["Female"][1] = { height: "3'0", weight: 40, stature: 8 };
MML.statureTables["Hobbit"]["Female"][2] = { height: "3'0", weight: 40, stature: 8 };
MML.statureTables["Hobbit"]["Female"][3] = { height: "3'2", weight: 45, stature: 9 };
MML.statureTables["Hobbit"]["Female"][4] = { height: "3'2", weight: 45, stature: 9 };
MML.statureTables["Hobbit"]["Female"][5] = { height: "3'4", weight: 50, stature: 10 };
MML.statureTables["Hobbit"]["Female"][6] = { height: "3'4", weight: 50, stature: 10 };
MML.statureTables["Hobbit"]["Female"][7] = { height: "3'5", weight: 55, stature: 11 };
MML.statureTables["Hobbit"]["Female"][8] = { height: "3'5", weight: 55, stature: 11 };
MML.statureTables["Hobbit"]["Female"][9] = { height: "3'6", weight: 60, stature: 11 };
MML.statureTables["Hobbit"]["Female"][10] = { height: "3'7", weight: 65, stature: 12 };
MML.statureTables["Hobbit"]["Female"][11] = { height: "3'8", weight: 70, stature: 12 };
MML.statureTables["Hobbit"]["Female"][12] = { height: "3'8", weight: 70, stature: 12 };
MML.statureTables["Hobbit"]["Female"][13] = { height: "3'9", weight: 75, stature: 13 };
MML.statureTables["Hobbit"]["Female"][14] = { height: "3'9", weight: 75, stature: 13 };
MML.statureTables["Hobbit"]["Female"][15] = { height: "3'10", weight: 80, stature: 13 };
MML.statureTables["Hobbit"]["Female"][16] = { height: "3'10", weight: 80, stature: 13 };
MML.statureTables["Hobbit"]["Female"][17] = { height: "3'11", weight: 85, stature: 14 };
MML.statureTables["Hobbit"]["Female"][18] = { height: "3'11", weight: 85, stature: 14 };
MML.statureTables["Hobbit"]["Female"][19] = { height: "4'0", weight: 90, stature: 14 };
MML.statureTables["Hobbit"]["Female"][20] = { height: "4'0", weight: 90, stature: 14 };

MML.statureTables["Wood Elf"] = {};
MML.statureTables["Wood Elf"]["Male"] = [];
MML.statureTables["Wood Elf"]["Male"][1] = { height: "5'4", weight: 125, stature: 20 };
MML.statureTables["Wood Elf"]["Male"][2] = { height: "5'4", weight: 125, stature: 20 };
MML.statureTables["Wood Elf"]["Male"][3] = { height: "5'5", weight: 128, stature: 20 };
MML.statureTables["Wood Elf"]["Male"][4] = { height: "5'5", weight: 128, stature: 20 };
MML.statureTables["Wood Elf"]["Male"][5] = { height: "5'6", weight: 130, stature: 20 };
MML.statureTables["Wood Elf"]["Male"][6] = { height: "5'6", weight: 130, stature: 20 };
MML.statureTables["Wood Elf"]["Male"][7] = { height: "5'7", weight: 135, stature: 21 };
MML.statureTables["Wood Elf"]["Male"][8] = { height: "5'8", weight: 140, stature: 21 };
MML.statureTables["Wood Elf"]["Male"][9] = { height: "5'9", weight: 145, stature: 22 };
MML.statureTables["Wood Elf"]["Male"][10] = { height: "5'10", weight: 150, stature: 22 };
MML.statureTables["Wood Elf"]["Male"][11] = { height: "5'11", weight: 155, stature: 23 };
MML.statureTables["Wood Elf"]["Male"][12] = { height: "6'0", weight: 160, stature: 23 };
MML.statureTables["Wood Elf"]["Male"][13] = { height: "6'1", weight: 165, stature: 24 };
MML.statureTables["Wood Elf"]["Male"][14] = { height: "6'2", weight: 170, stature: 24 };
MML.statureTables["Wood Elf"]["Male"][15] = { height: "6'3", weight: 175, stature: 26 };
MML.statureTables["Wood Elf"]["Male"][16] = { height: "6'4", weight: 180, stature: 26 };
MML.statureTables["Wood Elf"]["Male"][17] = { height: "6'5", weight: 190, stature: 27 };
MML.statureTables["Wood Elf"]["Male"][18] = { height: "6'5", weight: 190, stature: 27 };
MML.statureTables["Wood Elf"]["Male"][19] = { height: "6'6", weight: 200, stature: 28 };
MML.statureTables["Wood Elf"]["Male"][20] = { height: "6'6", weight: 200, stature: 28 };

MML.statureTables["Wood Elf"]["Female"] = [];
MML.statureTables["Wood Elf"]["Female"][1] = { height: "5'1", weight: 110, stature: 16 };
MML.statureTables["Wood Elf"]["Female"][2] = { height: "5'1", weight: 110, stature: 16 };
MML.statureTables["Wood Elf"]["Female"][3] = { height: "5'2", weight: 113, stature: 17 };
MML.statureTables["Wood Elf"]["Female"][4] = { height: "5'2", weight: 113, stature: 17 };
MML.statureTables["Wood Elf"]["Female"][5] = { height: "5'3", weight: 115, stature: 17 };
MML.statureTables["Wood Elf"]["Female"][6] = { height: "5'3", weight: 115, stature: 17 };
MML.statureTables["Wood Elf"]["Female"][7] = { height: "5'4", weight: 118, stature: 18 };
MML.statureTables["Wood Elf"]["Female"][8] = { height: "5'5", weight: 120, stature: 18 };
MML.statureTables["Wood Elf"]["Female"][9] = { height: "5'6", weight: 123, stature: 19 };
MML.statureTables["Wood Elf"]["Female"][10] = { height: "5'7", weight: 125, stature: 19 };
MML.statureTables["Wood Elf"]["Female"][11] = { height: "5'8", weight: 128, stature: 20 };
MML.statureTables["Wood Elf"]["Female"][12] = { height: "5'9", weight: 130, stature: 20 };
MML.statureTables["Wood Elf"]["Female"][13] = { height: "5'10", weight: 133, stature: 21 };
MML.statureTables["Wood Elf"]["Female"][14] = { height: "5'11", weight: 135, stature: 21 };
MML.statureTables["Wood Elf"]["Female"][15] = { height: "6'0", weight: 140, stature: 22 };
MML.statureTables["Wood Elf"]["Female"][16] = { height: "6'1", weight: 145, stature: 22 };
MML.statureTables["Wood Elf"]["Female"][17] = { height: "6'2", weight: 150, stature: 23 };
MML.statureTables["Wood Elf"]["Female"][18] = { height: "6'2", weight: 150, stature: 23 };
MML.statureTables["Wood Elf"]["Female"][19] = { height: "6'3", weight: 155, stature: 23 };
MML.statureTables["Wood Elf"]["Female"][20] = { height: "6'3", weight: 155, stature: 23 };

MML.racialAttributeBonuses = {};
MML.racialAttributeBonuses["Human"] = {};
MML.racialAttributeBonuses["Human"].strength = 0;
MML.racialAttributeBonuses["Human"].coordination = 0;
MML.racialAttributeBonuses["Human"].health = 0;
MML.racialAttributeBonuses["Human"].beauty = 0;
MML.racialAttributeBonuses["Human"].intellect = 0;
MML.racialAttributeBonuses["Human"].reason = 0;
MML.racialAttributeBonuses["Human"].creativity = 0;
MML.racialAttributeBonuses["Human"].presence = 0;
MML.racialAttributeBonuses["Human"].willpower = 0;
MML.racialAttributeBonuses["Human"].evocation = 0;
MML.racialAttributeBonuses["Human"].perception = 0;
MML.racialAttributeBonuses["Human"].systemStrength = 0;
MML.racialAttributeBonuses["Human"].fitness = 0;
MML.racialAttributeBonuses["Human"].load = 0;

MML.racialAttributeBonuses["Dwarf"] = {};
MML.racialAttributeBonuses["Dwarf"].strength = 3;
MML.racialAttributeBonuses["Dwarf"].coordination = 0;
MML.racialAttributeBonuses["Dwarf"].health = 3;
MML.racialAttributeBonuses["Dwarf"].beauty = 0;
MML.racialAttributeBonuses["Dwarf"].intellect = 0;
MML.racialAttributeBonuses["Dwarf"].reason = 0;
MML.racialAttributeBonuses["Dwarf"].creativity = 0;
MML.racialAttributeBonuses["Dwarf"].presence = -2;
MML.racialAttributeBonuses["Dwarf"].willpower = 2;
MML.racialAttributeBonuses["Dwarf"].evocation = 0;
MML.racialAttributeBonuses["Dwarf"].perception = 0;
MML.racialAttributeBonuses["Dwarf"].systemStrength = 3;
MML.racialAttributeBonuses["Dwarf"].fitness = 0;
MML.racialAttributeBonuses["Dwarf"].load = 20;

MML.racialAttributeBonuses["Gnome"] = {};
MML.racialAttributeBonuses["Gnome"].strength = 2;
MML.racialAttributeBonuses["Gnome"].coordination = 0;
MML.racialAttributeBonuses["Gnome"].health = 1;
MML.racialAttributeBonuses["Gnome"].beauty = 0;
MML.racialAttributeBonuses["Gnome"].intellect = 0;
MML.racialAttributeBonuses["Gnome"].reason = 0;
MML.racialAttributeBonuses["Gnome"].creativity = 0;
MML.racialAttributeBonuses["Gnome"].presence = 0;
MML.racialAttributeBonuses["Gnome"].willpower = 1;
MML.racialAttributeBonuses["Gnome"].evocation = 0;
MML.racialAttributeBonuses["Gnome"].perception = 0;
MML.racialAttributeBonuses["Gnome"].systemStrength = 1;
MML.racialAttributeBonuses["Gnome"].fitness = 0;
MML.racialAttributeBonuses["Gnome"].load = 15;

MML.racialAttributeBonuses["Hobbit"] = {};
MML.racialAttributeBonuses["Hobbit"].strength = 0;
MML.racialAttributeBonuses["Hobbit"].coordination = 2;
MML.racialAttributeBonuses["Hobbit"].health = 1;
MML.racialAttributeBonuses["Hobbit"].beauty = 0;
MML.racialAttributeBonuses["Hobbit"].intellect = 0;
MML.racialAttributeBonuses["Hobbit"].reason = 0;
MML.racialAttributeBonuses["Hobbit"].creativity = 2;
MML.racialAttributeBonuses["Hobbit"].presence = 0;
MML.racialAttributeBonuses["Hobbit"].willpower = 2;
MML.racialAttributeBonuses["Hobbit"].evocation = 5;
MML.racialAttributeBonuses["Hobbit"].perception = 1;
MML.racialAttributeBonuses["Hobbit"].systemStrength = 2;
MML.racialAttributeBonuses["Hobbit"].fitness = 0;
MML.racialAttributeBonuses["Hobbit"].load = 5;

MML.racialAttributeBonuses["Gray Elf"] = {};
MML.racialAttributeBonuses["Gray Elf"].strength = 0;
MML.racialAttributeBonuses["Gray Elf"].coordination = 1;
MML.racialAttributeBonuses["Gray Elf"].health = 1;
MML.racialAttributeBonuses["Gray Elf"].beauty = 1;
MML.racialAttributeBonuses["Gray Elf"].intellect = 1;
MML.racialAttributeBonuses["Gray Elf"].reason = 0;
MML.racialAttributeBonuses["Gray Elf"].creativity = 1;
MML.racialAttributeBonuses["Gray Elf"].presence = 1;
MML.racialAttributeBonuses["Gray Elf"].willpower = 0;
MML.racialAttributeBonuses["Gray Elf"].evocation = 10;
MML.racialAttributeBonuses["Gray Elf"].perception = 2;
MML.racialAttributeBonuses["Gray Elf"].systemStrength = 2;
MML.racialAttributeBonuses["Gray Elf"].fitness = 0;
MML.racialAttributeBonuses["Gray Elf"].load = 10;

MML.racialAttributeBonuses["Wood Elf"] = {};
MML.racialAttributeBonuses["Wood Elf"].strength = 0;
MML.racialAttributeBonuses["Wood Elf"].coordination = 3;
MML.racialAttributeBonuses["Wood Elf"].health = 1;
MML.racialAttributeBonuses["Wood Elf"].beauty = 0;
MML.racialAttributeBonuses["Wood Elf"].intellect = 0;
MML.racialAttributeBonuses["Wood Elf"].reason = 0;
MML.racialAttributeBonuses["Wood Elf"].creativity = 2;
MML.racialAttributeBonuses["Wood Elf"].presence = 0;
MML.racialAttributeBonuses["Wood Elf"].willpower = 0;
MML.racialAttributeBonuses["Wood Elf"].evocation = 5;
MML.racialAttributeBonuses["Wood Elf"].perception = 2;
MML.racialAttributeBonuses["Wood Elf"].systemStrength = 0;
MML.racialAttributeBonuses["Wood Elf"].fitness = 0;
MML.racialAttributeBonuses["Wood Elf"].load = 5;

MML.fitnessModLookup = [];
MML.fitnessModLookup[6] = 2.1;
MML.fitnessModLookup[7] = 2.2;
MML.fitnessModLookup[8] = 2.3;
MML.fitnessModLookup[9] = 2.4;
MML.fitnessModLookup[10] = 2.5;
MML.fitnessModLookup[11] = 2.6;
MML.fitnessModLookup[12] = 2.7;
MML.fitnessModLookup[13] = 2.8;
MML.fitnessModLookup[14] = 2.9;
MML.fitnessModLookup[15] = 3.0;
MML.fitnessModLookup[16] = 3.2;
MML.fitnessModLookup[17] = 3.4;
MML.fitnessModLookup[18] = 3.6;
MML.fitnessModLookup[19] = 3.8;
MML.fitnessModLookup[20] = 4.0;
MML.fitnessModLookup[21] = 4.2;
MML.fitnessModLookup[22] = 4.5;
MML.fitnessModLookup[23] = 5.0;
MML.fitnessModLookup[24] = 5.5;
MML.fitnessModLookup[25] = 6.0;

MML.meleeDamageMods = [
	{low: 0, high: 19, value: -7},
	{low: 20, high: 24, value: -6},
	{low: 25, high: 29, value: -5},
	{low: 30, high: 34, value: -4},
	{low: 35, high: 39, value: -3},
	{low: 40, high: 44, value: -2},
	{low: 45, high: 54, value: -1},
	{low: 55, high: 64, value: 0},
	{low: 65, high: 74, value: 1},
	{low: 75, high: 90, value: 2},
	{low: 91, high: 105, value: 3},
	{low: 106, high: 120, value: 4},
	{low: 121, high: 999, value: 5},
];

MML.hitTables = {};
MML.hitTables.humanoid = {};
MML.hitTables.humanoid.A = [];
MML.hitTables.humanoid.A[1] = 1;
MML.hitTables.humanoid.A[2] = 1;
MML.hitTables.humanoid.A[3] = 2;
MML.hitTables.humanoid.A[4] = 3;
MML.hitTables.humanoid.A[5] = 3;
MML.hitTables.humanoid.A[6] = 4;
MML.hitTables.humanoid.A[7] = 4;
MML.hitTables.humanoid.A[8] = 5;
MML.hitTables.humanoid.A[9] = 5;
MML.hitTables.humanoid.A[10] = 6;
MML.hitTables.humanoid.A[11] = 7;
MML.hitTables.humanoid.A[12] = 8;
MML.hitTables.humanoid.A[13] = 8;
MML.hitTables.humanoid.A[14] = 8;
MML.hitTables.humanoid.A[15] = 8;
MML.hitTables.humanoid.A[16] = 9;
MML.hitTables.humanoid.A[17] = 9;
MML.hitTables.humanoid.A[18] = 9;
MML.hitTables.humanoid.A[19] = 9;
MML.hitTables.humanoid.A[20] = 10;
MML.hitTables.humanoid.A[21] = 10;
MML.hitTables.humanoid.A[22] = 11;
MML.hitTables.humanoid.A[23] = 11;
MML.hitTables.humanoid.A[24] = 11;
MML.hitTables.humanoid.A[25] = 11;
MML.hitTables.humanoid.A[26] = 12;
MML.hitTables.humanoid.A[27] = 12;
MML.hitTables.humanoid.A[28] = 13;
MML.hitTables.humanoid.A[29] = 13;
MML.hitTables.humanoid.A[30] = 13;
MML.hitTables.humanoid.A[31] = 13;
MML.hitTables.humanoid.A[32] = 14;
MML.hitTables.humanoid.A[33] = 14;
MML.hitTables.humanoid.A[34] = 14;
MML.hitTables.humanoid.A[35] = 15;
MML.hitTables.humanoid.A[36] = 15;
MML.hitTables.humanoid.A[37] = 16;
MML.hitTables.humanoid.A[38] = 16;
MML.hitTables.humanoid.A[39] = 17;
MML.hitTables.humanoid.A[40] = 17;
MML.hitTables.humanoid.A[41] = 17;
MML.hitTables.humanoid.A[42] = 18;
MML.hitTables.humanoid.A[43] = 18;
MML.hitTables.humanoid.A[44] = 19;
MML.hitTables.humanoid.A[45] = 19;
MML.hitTables.humanoid.A[46] = 19;
MML.hitTables.humanoid.A[47] = 19;
MML.hitTables.humanoid.A[48] = 20;
MML.hitTables.humanoid.A[49] = 20;
MML.hitTables.humanoid.A[50] = 21;
MML.hitTables.humanoid.A[51] = 21;
MML.hitTables.humanoid.A[52] = 21;
MML.hitTables.humanoid.A[53] = 22;
MML.hitTables.humanoid.A[54] = 22;
MML.hitTables.humanoid.A[55] = 23;
MML.hitTables.humanoid.A[56] = 23;
MML.hitTables.humanoid.A[57] = 23;
MML.hitTables.humanoid.A[58] = 24;
MML.hitTables.humanoid.A[59] = 24;
MML.hitTables.humanoid.A[60] = 25;
MML.hitTables.humanoid.A[61] = 25;
MML.hitTables.humanoid.A[62] = 26;
MML.hitTables.humanoid.A[63] = 26;
MML.hitTables.humanoid.A[64] = 27;
MML.hitTables.humanoid.A[65] = 27;
MML.hitTables.humanoid.A[66] = 27;
MML.hitTables.humanoid.A[67] = 28;
MML.hitTables.humanoid.A[68] = 28;
MML.hitTables.humanoid.A[69] = 29;
MML.hitTables.humanoid.A[70] = 29;
MML.hitTables.humanoid.A[71] = 29;
MML.hitTables.humanoid.A[72] = 30;
MML.hitTables.humanoid.A[73] = 30;
MML.hitTables.humanoid.A[74] = 31;
MML.hitTables.humanoid.A[75] = 31;
MML.hitTables.humanoid.A[76] = 32;
MML.hitTables.humanoid.A[77] = 32;
MML.hitTables.humanoid.A[78] = 33;
MML.hitTables.humanoid.A[79] = 34;
MML.hitTables.humanoid.A[80] = 34;
MML.hitTables.humanoid.A[81] = 35;
MML.hitTables.humanoid.A[82] = 35;
MML.hitTables.humanoid.A[83] = 35;
MML.hitTables.humanoid.A[84] = 36;
MML.hitTables.humanoid.A[85] = 36;
MML.hitTables.humanoid.A[86] = 36;
MML.hitTables.humanoid.A[87] = 37;
MML.hitTables.humanoid.A[88] = 37;
MML.hitTables.humanoid.A[89] = 38;
MML.hitTables.humanoid.A[90] = 38;
MML.hitTables.humanoid.A[91] = 39;
MML.hitTables.humanoid.A[92] = 39;
MML.hitTables.humanoid.A[93] = 40;
MML.hitTables.humanoid.A[94] = 40;
MML.hitTables.humanoid.A[95] = 41;
MML.hitTables.humanoid.A[96] = 42;
MML.hitTables.humanoid.A[97] = 43;
MML.hitTables.humanoid.A[98] = 44;
MML.hitTables.humanoid.A[99] = 45;
MML.hitTables.humanoid.A[100] = 46;
MML.hitTables.humanoid.B = [];
MML.hitTables.humanoid.B[1] = 1;
MML.hitTables.humanoid.B[2] = 1;
MML.hitTables.humanoid.B[3] = 2;
MML.hitTables.humanoid.B[4] = 3;
MML.hitTables.humanoid.B[5] = 3;
MML.hitTables.humanoid.B[6] = 4;
MML.hitTables.humanoid.B[7] = 4;
MML.hitTables.humanoid.B[8] = 5;
MML.hitTables.humanoid.B[9] = 5;
MML.hitTables.humanoid.B[10] = 6;
MML.hitTables.humanoid.B[11] = 7;
MML.hitTables.humanoid.B[12] = 8;
MML.hitTables.humanoid.B[13] = 8;
MML.hitTables.humanoid.B[14] = 8;
MML.hitTables.humanoid.B[15] = 8;
MML.hitTables.humanoid.B[16] = 9;
MML.hitTables.humanoid.B[17] = 9;
MML.hitTables.humanoid.B[18] = 10;
MML.hitTables.humanoid.B[19] = 10;
MML.hitTables.humanoid.B[20] = 11;
MML.hitTables.humanoid.B[21] = 11;
MML.hitTables.humanoid.B[22] = 12;
MML.hitTables.humanoid.B[23] = 12;
MML.hitTables.humanoid.B[24] = 13;
MML.hitTables.humanoid.B[25] = 13;
MML.hitTables.humanoid.B[26] = 13;
MML.hitTables.humanoid.B[27] = 13;
MML.hitTables.humanoid.B[28] = 14;
MML.hitTables.humanoid.B[29] = 14;
MML.hitTables.humanoid.B[30] = 14;
MML.hitTables.humanoid.B[31] = 14;
MML.hitTables.humanoid.B[32] = 15;
MML.hitTables.humanoid.B[33] = 15;
MML.hitTables.humanoid.B[34] = 16;
MML.hitTables.humanoid.B[35] = 16;
MML.hitTables.humanoid.B[36] = 17;
MML.hitTables.humanoid.B[37] = 17;
MML.hitTables.humanoid.B[38] = 18;
MML.hitTables.humanoid.B[39] = 18;
MML.hitTables.humanoid.B[40] = 19;
MML.hitTables.humanoid.B[41] = 19;
MML.hitTables.humanoid.B[42] = 19;
MML.hitTables.humanoid.B[43] = 19;
MML.hitTables.humanoid.B[44] = 20;
MML.hitTables.humanoid.B[45] = 21;
MML.hitTables.humanoid.B[46] = 21;
MML.hitTables.humanoid.B[47] = 22;
MML.hitTables.humanoid.B[48] = 22;
MML.hitTables.humanoid.B[49] = 23;
MML.hitTables.humanoid.B[50] = 23;
MML.hitTables.humanoid.B[51] = 24;
MML.hitTables.humanoid.B[52] = 24;
MML.hitTables.humanoid.B[53] = 25;
MML.hitTables.humanoid.B[54] = 26;
MML.hitTables.humanoid.B[55] = 26;
MML.hitTables.humanoid.B[56] = 26;
MML.hitTables.humanoid.B[57] = 26;
MML.hitTables.humanoid.B[58] = 27;
MML.hitTables.humanoid.B[59] = 27;
MML.hitTables.humanoid.B[60] = 28;
MML.hitTables.humanoid.B[61] = 28;
MML.hitTables.humanoid.B[62] = 29;
MML.hitTables.humanoid.B[63] = 29;
MML.hitTables.humanoid.B[64] = 30;
MML.hitTables.humanoid.B[65] = 30;
MML.hitTables.humanoid.B[66] = 31;
MML.hitTables.humanoid.B[67] = 31;
MML.hitTables.humanoid.B[68] = 31;
MML.hitTables.humanoid.B[69] = 31;
MML.hitTables.humanoid.B[70] = 32;
MML.hitTables.humanoid.B[71] = 32;
MML.hitTables.humanoid.B[72] = 32;
MML.hitTables.humanoid.B[73] = 33;
MML.hitTables.humanoid.B[74] = 34;
MML.hitTables.humanoid.B[75] = 34;
MML.hitTables.humanoid.B[76] = 34;
MML.hitTables.humanoid.B[77] = 35;
MML.hitTables.humanoid.B[78] = 35;
MML.hitTables.humanoid.B[79] = 35;
MML.hitTables.humanoid.B[80] = 35;
MML.hitTables.humanoid.B[81] = 36;
MML.hitTables.humanoid.B[82] = 36;
MML.hitTables.humanoid.B[83] = 36;
MML.hitTables.humanoid.B[84] = 36;
MML.hitTables.humanoid.B[85] = 37;
MML.hitTables.humanoid.B[86] = 37;
MML.hitTables.humanoid.B[87] = 37;
MML.hitTables.humanoid.B[88] = 38;
MML.hitTables.humanoid.B[89] = 38;
MML.hitTables.humanoid.B[90] = 38;
MML.hitTables.humanoid.B[91] = 39;
MML.hitTables.humanoid.B[92] = 39;
MML.hitTables.humanoid.B[93] = 40;
MML.hitTables.humanoid.B[94] = 40;
MML.hitTables.humanoid.B[95] = 41;
MML.hitTables.humanoid.B[96] = 42;
MML.hitTables.humanoid.B[97] = 43;
MML.hitTables.humanoid.B[98] = 44;
MML.hitTables.humanoid.B[99] = 45;
MML.hitTables.humanoid.B[100] = 46;
MML.hitTables.humanoid.C = [];
MML.hitTables.humanoid.C[1] = 1;
MML.hitTables.humanoid.C[2] = 1;
MML.hitTables.humanoid.C[3] = 2;
MML.hitTables.humanoid.C[4] = 3;
MML.hitTables.humanoid.C[5] = 3;
MML.hitTables.humanoid.C[6] = 4;
MML.hitTables.humanoid.C[7] = 4;
MML.hitTables.humanoid.C[8] = 5;
MML.hitTables.humanoid.C[9] = 5;
MML.hitTables.humanoid.C[10] = 6;
MML.hitTables.humanoid.C[11] = 7;
MML.hitTables.humanoid.C[12] = 8;
MML.hitTables.humanoid.C[13] = 8;
MML.hitTables.humanoid.C[14] = 8;
MML.hitTables.humanoid.C[15] = 8;
MML.hitTables.humanoid.C[16] = 8;
MML.hitTables.humanoid.C[17] = 9;
MML.hitTables.humanoid.C[18] = 9;
MML.hitTables.humanoid.C[19] = 9;
MML.hitTables.humanoid.C[20] = 9;
MML.hitTables.humanoid.C[21] = 10;
MML.hitTables.humanoid.C[22] = 10;
MML.hitTables.humanoid.C[23] = 10;
MML.hitTables.humanoid.C[24] = 11;
MML.hitTables.humanoid.C[25] = 11;
MML.hitTables.humanoid.C[26] = 12;
MML.hitTables.humanoid.C[27] = 12;
MML.hitTables.humanoid.C[28] = 12;
MML.hitTables.humanoid.C[29] = 12;
MML.hitTables.humanoid.C[30] = 13;
MML.hitTables.humanoid.C[31] = 13;
MML.hitTables.humanoid.C[32] = 13;
MML.hitTables.humanoid.C[33] = 14;
MML.hitTables.humanoid.C[34] = 14;
MML.hitTables.humanoid.C[35] = 14;
MML.hitTables.humanoid.C[36] = 14;
MML.hitTables.humanoid.C[37] = 14;
MML.hitTables.humanoid.C[38] = 15;
MML.hitTables.humanoid.C[39] = 15;
MML.hitTables.humanoid.C[40] = 16;
MML.hitTables.humanoid.C[41] = 17;
MML.hitTables.humanoid.C[42] = 18;
MML.hitTables.humanoid.C[43] = 18;
MML.hitTables.humanoid.C[44] = 19;
MML.hitTables.humanoid.C[45] = 20;
MML.hitTables.humanoid.C[46] = 20;
MML.hitTables.humanoid.C[47] = 21;
MML.hitTables.humanoid.C[48] = 21;
MML.hitTables.humanoid.C[49] = 21;
MML.hitTables.humanoid.C[50] = 21;
MML.hitTables.humanoid.C[51] = 21;
MML.hitTables.humanoid.C[52] = 22;
MML.hitTables.humanoid.C[53] = 23;
MML.hitTables.humanoid.C[54] = 23;
MML.hitTables.humanoid.C[55] = 24;
MML.hitTables.humanoid.C[56] = 24;
MML.hitTables.humanoid.C[57] = 24;
MML.hitTables.humanoid.C[58] = 25;
MML.hitTables.humanoid.C[59] = 26;
MML.hitTables.humanoid.C[60] = 26;
MML.hitTables.humanoid.C[61] = 26;
MML.hitTables.humanoid.C[62] = 26;
MML.hitTables.humanoid.C[63] = 26;
MML.hitTables.humanoid.C[64] = 27;
MML.hitTables.humanoid.C[65] = 27;
MML.hitTables.humanoid.C[66] = 27;
MML.hitTables.humanoid.C[67] = 27;
MML.hitTables.humanoid.C[68] = 27;
MML.hitTables.humanoid.C[69] = 28;
MML.hitTables.humanoid.C[70] = 29;
MML.hitTables.humanoid.C[71] = 30;
MML.hitTables.humanoid.C[72] = 30;
MML.hitTables.humanoid.C[73] = 30;
MML.hitTables.humanoid.C[74] = 30;
MML.hitTables.humanoid.C[75] = 31;
MML.hitTables.humanoid.C[76] = 32;
MML.hitTables.humanoid.C[77] = 32;
MML.hitTables.humanoid.C[78] = 32;
MML.hitTables.humanoid.C[79] = 32;
MML.hitTables.humanoid.C[80] = 33;
MML.hitTables.humanoid.C[81] = 34;
MML.hitTables.humanoid.C[82] = 35;
MML.hitTables.humanoid.C[83] = 35;
MML.hitTables.humanoid.C[84] = 35;
MML.hitTables.humanoid.C[85] = 35;
MML.hitTables.humanoid.C[86] = 36;
MML.hitTables.humanoid.C[87] = 37;
MML.hitTables.humanoid.C[88] = 37;
MML.hitTables.humanoid.C[89] = 37;
MML.hitTables.humanoid.C[90] = 37;
MML.hitTables.humanoid.C[91] = 38;
MML.hitTables.humanoid.C[92] = 39;
MML.hitTables.humanoid.C[93] = 39;
MML.hitTables.humanoid.C[94] = 40;
MML.hitTables.humanoid.C[95] = 41;
MML.hitTables.humanoid.C[96] = 42;
MML.hitTables.humanoid.C[97] = 43;
MML.hitTables.humanoid.C[98] = 44;
MML.hitTables.humanoid.C[99] = 45;
MML.hitTables.humanoid.C[100] = 46;MML.startCombat = function startCombat(input) {
    this.currentRound = 0;
    this.roundStarted = false;
    this.combatants = input.selectedCharNames; 

	if(this.combatants.length > 0){
		this.inCombat = true;
		
		_.each(this.combatants, function(charName){
			MML.processCommand({
		        type: "character",
		        who: charName,
		        triggeredFunction: "setApiCharAttribute",
		        input: {
		        	attribute: "ready",
		        	value: false
		        }
		    });
			MML.processCommand({
		        type: "character",
		        who: charName,
		        triggeredFunction: "updateCharacter",
		        input: {
		        	attribute: "initiative"
		        }
		    });
		}, this);
		
		MML.processCommand({
	        type: "GM",
	        triggeredFunction: "setTurnOrder",
	        input: {}
	    });

		Campaign().set("initiativepage", "true");

		MML.processCommand({
	        type: "GM",
	        triggeredFunction: "newRound",
	        input: {}
	    });
	}
	else{
		sendChat("", "&{template:charMenu} {{name=Error}} {{message=No tokens selected}}");
	}
};

MML.newRound = function newRound(){
	_.each(this.combatants, function(charName){
		MML.processCommand({
	        type: "character",
	        who: charName,
	        triggeredFunction: "newRoundUpdateCharacter",
	        input: {}
	    });
	}, this);
	_.each(state.MML.players, function(player){
		MML.processCommand({
	        type: "player",
	        who: player.name,
	        triggeredFunction: "newRoundUpdatePlayer",
	        input: {
	        	who: player.who
	        }
	    });
	});
};

MML.startRound = function startRound(){
	if(MML.checkReady.apply(this, [])){
		this.currentRound++;
		this.roundStarted = true;

		_.each(this.combatants, function(charName){
			MML.processCommand({
		        type: "character",
		        who: charName,
		        triggeredFunction: "updateCharacter",
		        input: {
		            attribute: "initiativeRoll"
		        }
		    });
			MML.processCommand({
		        type: "character",
		        who: charName,
		        triggeredFunction: "setApiCharAttribute",
		        input: {
		            attribute: "movementAvailable",
		            value: state.MML.characters[charName].movementRatio
		        }
		    });
		}, this);

		MML.processCommand({
	        type: "GM",
	        triggeredFunction: "setTurnOrder",
	        input: {}
	    });
		MML.processCommand({
	        type: "GM",
	        triggeredFunction: "startCombatMovement",
	        input: {}
	    });
	}
};

MML.startCombatMovement = function startCombatMovement(){
	if (MML.checkReady.apply(this, [])){
		this.actor = this.combatants[0];		
		var playerName = state.MML.characters[this.actor].player;
		
    	MML.processCommand({
	        type: "player",
	        who: playerName,
	        triggeredFunction: "menuCombatMovement",
	        input: {
	            who: this.actor
	        }
	    });
		MML.processCommand({
	        type: "player",
	        who: playerName,
	        triggeredFunction: "displayMenu",
	        input: {}
	    });
	}
};

MML.startAction = function startAction(){
	MML[this.action.getTargets].apply(this, []);
};

MML.setTargets = function selectTargets(){
	this.targets = this.characters[this.actor].action.targets;
	this.targetIndex = 0;
	this.currentTarget = this.targets[0];
};

MML.checkReady = function checkReady(){
	var everyoneReady = true;

	_.each(this.combatants, function(charName){
		if(state.MML.characters[charName].ready === false){
			everyoneReady = false;
		}
	});
		
	return everyoneReady;
};

// Rolls
MML.getSingleTarget = function getSingleTarget(){
	sendChat("", "&{template:selectTarget} {{charName=" + this.name + "}} {{triggeredMethod=setCurrentCharacterTargets}}");
};



MML.performAction = function performAction(){
	if(this.rollIndex !== "end"){
		this.menu = this.actionRolls[this.rollIndex];
		this.menu("entry");
	}
	else{
		this.rollIndex = "";
		this.rolls = {};
		this.targetIndex++;

		if(this.targetIndex < this.targets.length){
				this.currentTarget = this.targets[this.targetIndex];
				this.menu = MML.performAction;
				this.menu();
		}
		else{
			this.menu = MML.endAction;
			this.menu();
		}
	}
};

MML.getHitPositionRoll = function getHitPositionRoll(input){
	switch(input){
		case "entry":
			this.displayMenu(this.characters[this.actor].name, ["Roll Hit Position"]);
		break;
		case "Roll Hit Position":
			this.currentRoll = this.characters[this.actor].hitPositionRoll();
			this.displayRoll();
		break;
		case "result":
			this.rolls.hitPosition = this.currentRoll;
			this.rollIndex = "getWeaponDamageRoll";
			this.menu = MML.performAction;
			this.menu();
		break;
		default:
		break;
	}
};

MML.getWeaponDamageRoll = function getWeaponDamageRoll(input){
	switch(input){
		case "entry":
			this.displayMenu(this.characters[this.actor].name, ["Roll Damage"]);
		break;
		case "Roll Damage":
			this.currentRoll = this.characters[this.actor].weaponDamageRoll();
			this.displayRoll();
		break;
		case "result": 
			this.rolls.damage = this.currentRoll;
			this.rollIndex = "getKnockdownRoll";
			this.menu = MML.performAction;
			this.menu();
		break;
		default:
		break;
	}
};

MML.getKnockdownRoll = function getKnockdownRoll(input){
	switch(input){
		case "entry":
			if(this.characters[this.currentTarget].checkKnockdown()){
				this.displayMenu(this.characters[this.currentTarget].name, ["Roll Knockdown"]);
			}
			else{
				this.rollIndex = "getSensitiveAreaRoll";
				this.menu = MML.performAction;
				this.menu();
			}
		break;
		case "Roll Knockdown":
			this.currentRoll = this.characters[this.currentTarget].knockdownRoll();
			this.displayRoll();
		break;
		case "result":
			this.rolls.knockdown = this.currentRoll.result;
			if(this.rolls.knockdown === "Critical Success" || this.rolls.knockdown === "Success"){
				this.stumble = 1;
			}			
			else{
				sendChat("Game", this.characters[this.currentTarget].name + " is knocked to the ground");
				this.characters[this.currentTarget].currentMotion = "prone";
				this.characters[this.currentTarget].knockdown.current = this.characters[this.currentTarget].knockdown.max;
			}
			this.rollIndex = "getSensitiveAreaRoll";
			this.menu = MML.performAction;
			this.menu();
		break;
		default:
		break;
	}
};

MML.getSensitiveAreaRoll = function getSensitiveAreaRoll(input){
	switch(input){
		case "entry":
			if(this.characters[this.currentTarget].isSensitiveArea(this.rolls.hitPosition)){
				this.displayMenu(this.characters[this.currentTarget].name + " was hit in a sensitive area.", ["Sensitive Area Roll"]);
			}
			else{
				this.rollIndex = "getWoundRoll";
				this.menu = MML.performAction;
				this.menu();
			}
		break;
		case "Sensitive Area Roll":
			this.currentRoll = this.characters[this.currentTarget].sensitiveAreaRoll();
			this.displayRoll();
		break;
		case "result":
			this.rolls.sensitiveArea = this.currentRoll.result;
			if(this.rolls.sensitiveArea !== "Critical Success" || this.rolls.sensitiveArea !== "Success"){
				sendChat("", this.characters[this.currentTarget].name + " is in pain!");
				this.characters[this.currentTarget].sensitive = 1;
			}	
			this.rollIndex = "getWoundRoll";
			this.menu = MML.performAction;
			this.menu();
		break;
		default:
		break;
	}
};

//
MML.getMultiWoundRoll = function getMultiWoundRoll(input){
	switch(input){
		case "entry":
			this.rolls.multiWound = this.characters[this.currentTarget].setMultiWound();
			if(this.rolls.multiWound.type === "none"){
				this.rollIndex = "end";
				this.menu = MML.performAction;
				this.menu();
			}
			else{
				this.displayMenu(this.characters[this.currentTarget].name + " suffers wound fatigue.", ["Multiple Wounds Roll"]);
			}
		break;
		case "Multiple Wounds Roll":
			this.currentRoll = this.currentTarget.attributeCheckRoll("systemStrength", [0]);
			this.displayRoll();
		break;
		case "result":
			this.rolls.multiWound.result = this.currentRoll.result;
			
			if(this.rolls.multiWound.result === "Success" || this.rolls.multiWound.result === "Critical Success"){
				//this.characters[this.currentTarget].statusEffects.push(MML.woundFatigue);
				this.characters[this.currentTarget].multiWound.wound = true;
			}

			this.rollIndex = "end";
			this.menu = MML.performAction;
			this.menu();
		break;
		default:
		break;
	}
};

MML.getWoundRoll = function getWoundRoll(input){
	switch(input){
		case "entry":
			this.rolls.wound = this.characters[this.currentTarget].alterHP(this.rolls.hitPosition, this.rolls.damage, this.rolls.damage.type);
			if(this.rolls.wound.type === "none"){
				this.rollIndex = "getMultiWoundRoll";
				this.menu = MML.performAction;
				this.menu();
			}
			else{
				this.displayMenu(this.characters[this.currentTarget].name + " suffered a " + this.rolls.wound.type + " wound.", ["Wound Roll"]);
			}
		break;
		case "Wound Roll":
			this.currentRoll = this.characters[this.currentTarget].woundRoll(this.rolls.wound);
			this.displayRoll();
		break;
		case "result":
			this.rolls.wound = this.currentRoll;
			switch(this.rolls.wound.type){
				case "major":
					if(this.rolls.wound.result === "Failure"){
						this.characters[this.currentTarget][this.rolls.wound.bodyPart].wound.major.duration += this.rolls.wound.duration;
					}
				break;
				case "disabling":
					this.characters[this.currentTarget][this.rolls.wound.bodyPart].wound.disabling = true;
					
					if(this.rolls.wound.result === "Failure" ){
						this.characters[this.currentTarget].stun.duration += this.rolls.wound.duration;
					}
				break;
				case "mortal":
					this.characters[this.currentTarget][this.rolls.wound.bodyPart].wound.mortal = true;
				break;
			}
			this.rollIndex = "getMultiWoundRoll";
			this.menu = MML.performAction;
			this.menu();
		break;
		default:
		break;
	}
};
// Turn Order Functions
MML.setTurnOrder = function setTurnOrder(){
	var turnorder = [];

	var index;
	for (index in this.combatants){
		turnorder.push({
			id: MML.getTokenFromChar(this.combatants[index]).id,
			pr: state.MML.characters[this.combatants[index]].initiative,
			custom: ""
		});
    }
    
	turnorder.sort(function (a, b) {
		if (parseFloat(b.pr) === parseFloat(a.pr)) {
	    		if (a.custom !== "" && b.custom !== ""){
				return parseFloat(b.custom) - parseFloat(a.custom);
			}
			else{
	        	return 0;
			}            
		} 
		else {
			return parseFloat(b.pr) - parseFloat(a.pr);
		}
	});
	
	index = 0;
	for (index in this.combatants){
		//Orders the tokens based on initiative
		this.combatants[index] = MML.getCharFromToken(getObj("graphic", turnorder[index].id));
    }
    
    Campaign().set("turnorder", JSON.stringify(turnorder));
};

MML.changeRoll = function changeRoll(input){
	var value = input;
	var range = this.currentRoll.range.split("-");
	var low = parseInt(range[0]);
	var high = parseInt(range[1]);

	if(value >= low && value <= high){
		if(this.currentRoll.name === "damage"){
			this.currentRoll = -value;
		}
		else{
			this.currentRoll = value;
		}
	}
	else{
		sendChat("Error", "New roll value out of range.");
	}
	MML.processCommand({
        type: "character",
        who: this.who,
        triggeredFunction: this.currentRoll.getResult,
        input: {}
    });
};

// Action Functions
MML.actionHandler = function actionHandler(charName){
	switch(state.MML.GM.characters[charName].action.name){
        case "attack":
			MML.attackAction(charName);
            break;
		case "ready":
			MML.readyItemAction(charName);
			break;
		case "cast":
			MML.castSpellAction(charName);
			break;
		case "observe":
			MML.observeAction(charName);
			break;
	}
};

MML.AttackActionSteps = {
};

MML.AttackRolls = function AttackAction(){
	this.actionRolls = {
		getAttackRoll: MML.getAttackRoll,
		getDefenseRoll: MML.getDefenseRoll,
		getHitPositionRoll: MML.getHitPositionRoll,
		getWeaponDamageRoll: MML.getWeaponDamageRoll,
		getKnockdownRoll: MML.getKnockdownRoll,
		getSensitiveAreaRoll: MML.getSensitiveAreaRoll,
		getWoundRoll: MML.getWoundRoll,
		getMultiWoundRoll: MML.getMultiWoundRoll
	};

	this.rollIndex = "getAttackRoll";
};

MML.assignNewItem = function assignNewItem(input){
	MML.processCommand({
    	type: "character",
    	who: input.who,
    	triggeredFunction:"setApiCharAttributeJSON",
		input: {
	    	attribute: "inventory",
	    	index: generateRowID(),
	    	value: state.MML.GM.newItem
	  	}
    });
};

// var exampleCommand = {
//   type: "player",
//   who: state.MML.players[playerName],
//   triggeredFunction:"menuCommand",
//   input: {
//     rollResult: "Success"
//   }
// };

MML.processCommand = function(command){
	// log("Last Command");
	// log(state.MML.GM);
	// log(state.MML.players);
	// log(state.MML.characters);
	// log(command);

	switch(command.type){
		case "character":
			var character = state.MML.characters[command.who];
			MML[command.triggeredFunction].apply(character, [command.input]);
  			state.MML.characters[command.who] = character;
  			break;
  		case "player":
  			var player = state.MML.players[command.who];
  			MML[command.triggeredFunction].apply(player, [command.input]);
			state.MML.players[command.who] = player;
  			break;
  		case "GM":
  			MML[command.triggeredFunction].apply(state.MML.GM, [command.input]);
  			break;
  		default:
  			break;
	}
};


MML.parseCommand = function parseCommand(msg) {
    if(msg.type === "api"){
    	var command;

    	if(msg.content.indexOf("!selectTarget") !== -1) {
	        var input = msg.content.replace("!selectTarget ", "").split("|");
	        var character = input[0];
	        var target = input[1];
	        var methodName = input[2];

	        command = {
	        	type: "player",
				who: msg.who.replace(" (GM)", ""),
				triggeredFunction: methodName,
				input: {
					target: target,
					character: character
				}
	        };
	    }

	    else if(msg.content.indexOf("!changeRoll") !== -1) {
	        var value = parseInt(msg.content.replace("!changeRoll ", ""));
	        
	        if(!isNaN(value)){
	            command = {
	            	type: "player",
					who: state.MML.GM.player,
					triggeredFunction: "changeRoll",
					input: {
						value: value
					}
	            };
	        }
	        else{
	            sendChat("Error", "Please enter a numerical value.");
	        }       
	    }

	    else if(msg.content.indexOf("!acceptRoll") !== -1) {
	        if(state.MML.players[state.MML.GM.player].currentRoll.accepted === false){
	        	var player = state.MML.players[state.MML.GM.player];
	            state.MML.players[player.name].currentRoll.accepted = true;
	            command = {
	            	type: "character",
					who: player.who,
					triggeredFunction: player.currentRoll.applyResult,
					input: {
						value: value
					}
	            };
	        }
	    }

	    else if(msg.content.indexOf("!displayItemOptions") !== -1) {
	        var input = msg.content.replace("!displayItemOptions ", "").split("|");
	        var who = input[0];
	        var itemId = input[1];

	        command = {
	            	type: "player",
					who: msg.who.replace(" (GM)", ""),
					triggeredFunction: "displayItemOptions",
					input: {
						who: who,
						itemId: itemId
					}
	            };
	    }
    	else{
    		var i;
		    var hexes = msg.content.slice(1).match(/.{1,4}/g) || [];
		    command = "";
		    for(i = 0; i<hexes.length; i++) {
		        command += String.fromCharCode(parseInt(hexes[i], 16));
		    }
	        if(command === "" || isNaN(command) || _.isUndefined(command)){
                log(command);
                MML.error();
            }
            else{
                command = JSON.parse(command);
            }
	        command.input.selectedCharNames = MML.getSelectedCharNames(msg.selected);
    	}
    	
    	MML.processCommand(command);
    }
	    
};

on("ready", function() {
    MML.init();

    on("add:character", function(character) {
        var charName = character.get("name");
        MML.createAttribute("player", state.MML.GM.player, "", character);
        MML.createAttribute("name", charName, "", character);
        MML.createAttribute("race", "Human", "", character);
        MML.createAttribute("gender", "Male", "", character);
        MML.createAttribute("statureRoll", 6, "", character);
        MML.createAttribute("strengthRoll", 6, "", character);
        MML.createAttribute("coordinationRoll", 6, "", character);
        MML.createAttribute("healthRoll", 6, "", character);
        MML.createAttribute("beautyRoll", 6, "", character);
        MML.createAttribute("intellectRoll", 6, "", character);
        MML.createAttribute("reasonRoll", 6, "", character);
        MML.createAttribute("creativityRoll", 6, "", character);
        MML.createAttribute("presenceRoll", 6, "", character);

        state.MML.characters[charName] = new MML.characterConstructor(charName);

        MML.processCommand({
        	type: "character",
        	who: charName,
        	triggeredFunction:"updateCharacter",
			input: {
		    	attribute: "race"
		  	}
        });
    });

    on("add:attribute", function(attribute) {
        var characterObject = getObj("character", attribute.get("_characterid"));
        var charName = characterObject.get("name"); 
        var attrName = attribute.get("name");

        if(attrName.indexOf("repeating_skills") != -1){
        	log("update skills")
            MML.processCommand({
	        	type: "character",
	        	who: charName,
	        	triggeredFunction:"updateCharacter",
				input: {
			    	attribute: "skills"
			  	}
	        });
        }
        else if(attrName.indexOf("repeating_weaponskills") != -1){
            log("update weaponSkills");
            MML.processCommand({
	        	type: "character",
	        	who: charName,
	        	triggeredFunction:"updateCharacter",
				input: {
			    	attribute: "weaponSkills"
			  	}
	        });
        }
    });

    on("chat:message", function(msg) {
        MML.parseCommand(msg);
    });

    on("change:token", function(obj, prev) {
        if(obj.get("left") !== prev["left"] && obj.get("top") !== prev["top"] && state.MML.GM.inCombat === true){
            var charName = MML.getCharFromToken(obj);
            var character = state.MML.characters[charName];
            var left1 = prev["left"];
            var left2 = obj.get("left");
            var top1 = prev["top"];
            var top2 = obj.get("top");
            var distance = MML.getDistance(left1, left2, top1, top2);
            var distanceAvailable = MML.movementRates[character.race][character.movementPosition] * character.movementAvailable;

            if(state.MML.GM.actor === charName ){
                // If they move too far, move the maxium distance in the same direction
                if(distance > distanceAvailable){
                    left3 = Math.floor(((left2 - left1)/distance)*distanceAvailable + left1 + 0.5);
                    top3 = Math.floor(((top2 - top1)/distance)*distanceAvailable + top1 + 0.5);
                    obj.set("left", left3);
                    obj.set("top", top3);

                    distance = distanceAvailable;
                }
                MML.processCommand({
		        	type: "character",
		        	who: charName,
		        	triggeredFunction:"moveDistance",
					input: {
				    	distance: "distance"
				  	}
		        });
            }
            else{
                obj.set("left", prev["left"]);
                obj.set("top", prev["top"]);
            }
        }
    });

    on("change:character:name", function(changedCharacter) {
        var newName = changedCharacter.get("name");
        var characters = findObjs({
                _type: "character",
                archived: false,
                }, {caseInsensitive: false});
        var apiNames = _.keys(state.MML.characters);
        var characterNames = [];

        _.each(characters, function(character){
            characterNames.push(character.get("name"));
        });
        
        var oldName = _.difference(apiNames, characterNames)[0];

        state.MML.characters[newName] = state.MML.characters[oldName];
        delete state.MML.characters[oldName];
        state.MML.characters[newName].name = newName;
        MML.processCommand({
        	type: "character",
        	who: newName,
        	triggeredFunction:"updateCharacter",
			input: {
		    	attribute: "name"
		  	}
        });
    });

    on("change:attribute:current", function(attribute) {
        var characterObject = getObj("character", attribute.get("_characterid"));
        var charName = characterObject.get("name"); 
        var attrName = attribute.get("name");

        switch(attrName){
            case "statureRoll":
                var roll = parseFloat(attribute.get("current"));
                if(isNaN(roll) || roll < 6){
                    roll = 6;
                    MML.setCurrentAttribute(charName, attrName, roll);
                }
                MML.processCommand({
		        	type: "character",
		        	who: charName,
		        	triggeredFunction:"updateCharacter",
					input: {
				    	attribute: "stature"
				  	}
		        });
                break;
            case "strengthRoll":
                var roll = parseFloat(attribute.get("current"));
                if(isNaN(roll) || roll < 6){
                    roll = 6;
                    MML.setCurrentAttribute(charName, attrName, roll);
                }
                MML.processCommand({
		        	type: "character",
		        	who: charName,
		        	triggeredFunction:"updateCharacter",
					input: {
				    	attribute: "strength"
				  	}
		        });
                break;
            case "coordinationRoll":
                var roll = parseFloat(attribute.get("current"));
                if(isNaN(roll) || roll < 6){
                    roll = 6;
                    MML.setCurrentAttribute(charName, attrName, roll);
                }
                MML.processCommand({
		        	type: "character",
		        	who: charName,
		        	triggeredFunction:"updateCharacter",
					input: {
				    	attribute: "coordination"
				  	}
		        });
                break;
            case "healthRoll":
                var roll = parseFloat(attribute.get("current"));
                if(isNaN(roll) || roll < 6){
                    roll = 6;
                    MML.setCurrentAttribute(charName, attrName, roll);
                }
                MML.processCommand({
		        	type: "character",
		        	who: charName,
		        	triggeredFunction:"updateCharacter",
					input: {
				    	attribute: "health"
				  	}
		        });
                break;
            case "beautyRoll":
                var roll = parseFloat(attribute.get("current"));
                if(isNaN(roll) || roll < 6){
                    roll = 6;
                    MML.setCurrentAttribute(charName, attrName, roll);
                }
                MML.processCommand({
		        	type: "character",
		        	who: charName,
		        	triggeredFunction:"updateCharacter",
					input: {
				    	attribute: "beauty"
				  	}
		        });
                break;
            case "intellectRoll":
                var roll = parseFloat(attribute.get("current"));
                if(isNaN(roll) || roll < 6){
                    roll = 6;
                    MML.setCurrentAttribute(charName, attrName, roll);
                }
                MML.processCommand({
		        	type: "character",
		        	who: charName,
		        	triggeredFunction:"updateCharacter",
					input: {
				    	attribute: "intellect"
				  	}
		        });
                break;
            case "reasonRoll":
                var roll = parseFloat(attribute.get("current"));
                if(isNaN(roll) || roll < 6){
                    roll = 6;
                    MML.setCurrentAttribute(charName, attrName, roll);
                }
                MML.processCommand({
		        	type: "character",
		        	who: charName,
		        	triggeredFunction:"updateCharacter",
					input: {
				    	attribute: "reason"
				  	}
		        });
                break;
            case "creativityRoll":
                var roll = parseFloat(attribute.get("current"));
                if(isNaN(roll) || roll < 6){
                    roll = 6;
                    MML.setCurrentAttribute(charName, attrName, roll);
                }
                MML.processCommand({
		        	type: "character",
		        	who: charName,
		        	triggeredFunction:"updateCharacter",
					input: {
				    	attribute: "creativity"
				  	}
		        });
                break;
            case "presenceRoll":
                var roll = parseFloat(attribute.get("current"));
                if(isNaN(roll) || roll < 6){
                    roll = 6;
                    MML.setCurrentAttribute(charName, attrName, roll);
                }
                MML.processCommand({
		        	type: "character",
		        	who: charName,
		        	triggeredFunction:"updateCharacter",
					input: {
				    	attribute: "presence"
				  	}
		        });
                break;
            default:
                if(attrName.indexOf("repeating_items") != -1){
                    MML.processCommand({
			        	type: "character",
			        	who: charName,
			        	triggeredFunction:"updateCharacter",
						input: {
					    	attribute: "inventory"
					  	}
			        });
                }
                else if(attrName.indexOf("repeating_skills") != -1){
                    MML.processCommand({
			        	type: "character",
			        	who: charName,
			        	triggeredFunction:"updateCharacter",
						input: {
					    	attribute: "skills"
					  	}
			        });
                }
                else if(attrName.indexOf("repeating_weaponskills") != -1){
                	log("weaponSkills");
                    MML.processCommand({
			        	type: "character",
			        	who: charName,
			        	triggeredFunction:"updateCharacter",
						input: {
					    	attribute: "weaponSkills"
					  	}
			        });
                }
                else if(attrName != "tab"){
                	log(attrName);
                    MML.processCommand({
			        	type: "character",
			        	who: charName,
			        	triggeredFunction:"updateCharacter",
						input: {
					    	attribute: attrName
					  	}
			        });
                }
                break;
        }

    });
});// This file contains all menus and defines the player object class

MML.playerClass = {
    message: "", //
    buttons: {}, //{text: "Click Here", nextMenu: "mainMenu", triggeredMethod: MML.triggeredMethod}
    name: "",
    characters: [],
    characterIndex: 0,
    who: "",
    menu: ""
};

MML.menuCommand = function(input){
    var who = input.who;
    var buttonText = input.buttonText;
    var buttonInput;

    var button = _.findWhere(this.buttons, { text: buttonText });
    if(!_.isUndefined(button)){
        this.menu = button.nextMenu;
        log(button);
        MML.processCommand({
            type: "player",
	        who: this.name,
	        triggeredFunction: button.nextMenu,
	        input: {
	        	who: who
	        }
	    });

	    buttonInput = {
    		text: button.text,
    		selectedCharNames: input.selectedCharNames
    	};
        button.triggeredMethod.apply(this, [buttonInput]);
    }
};

MML.setApiPlayerAttribute = function(input){
	this[input.attribute] = input.value;
};

MML.newRoundUpdatePlayer = function(input){
	this.characterIndex = 0;
	this.who = this.characters[this.characterIndex];
	this.menu = "charMenuPrepareAction";
	MML.processCommand({
        type: "player",
        who: this.name,
        triggeredFunction: "charMenuPrepareAction",
        input: {
        	who: this.who
        }
    });
	MML.displayMenu.apply(this, []);
};

MML.prepareNextCharacter = function(input){
    this.characterIndex++;

    if(this.characterIndex < this.characters.length){
        MML.processCommand({
            type: "player",
            who: this.name,
            triggeredFunction: "charMenuPrepareAction",
            input: {
                who: this.characters[this.characterIndex],
            }   
        });
    }
    else if(this.name === state.MML.GM.player){
        MML.processCommand({
            type: "player",
            who: this.name,
            triggeredFunction: "GmMenuStartRound",
            input: {
                who: "GM",
            }   
        });
    }
    MML.processCommand({
        type: "player",
        who: this.name,
        triggeredFunction: "displayMenu",
        input: {}   
    });
};

MML.menuIdle = function menuIdle(input){
    this.who = input.who;
    this.message = "Menu Closed";
    this.buttons = [];
};

MML.GmMenuMain = function GmMenuMain(input){
    this.who = input.who;
    this.message = "Main Menu: ";
    this.buttons = [MML.menuButtons.combatMenu, 
    				MML.menuButtons.newCharacterMenu,
					MML.menuButtons.newItemMenu,
					MML.menuButtons.worldMenu,
					MML.menuButtons.utilitiesMenu
					];
};

MML.displayPlayerRoll = function rollMenu(input){
	this.who = input.who;
	this.message = this.currentRoll.message;
	this.buttons = [MML.menuButtons.acceptRoll];
};

MML.GmMenuCombat = function GmMenuCombat(input){
	this.who = input.who;
	this.message = "Select tokens and begin.";
	this.buttons = [MML.menuButtons.startCombat, 
					MML.menuButtons.toMainGmMenu,
					];
};

MML.GmMenuNewItem = function GmMenuNewItem(input){
	this.who = input.who;
	this.message = "Select item type:";
	this.buttons = [MML.menuButtons.newWeapon,
					MML.menuButtons.newShield, 
					MML.menuButtons.newArmor,
					MML.menuButtons.newSpellComponent,
					MML.menuButtons.newMiscItem
					];
};

MML.GmMenuNewWeapon = function GmMenuNewWeapon(input){
	this.who = input.who;
	this.message = "Select weapon type:";
	this.buttons = [];

	var index;
	for(index in MML.items){
		if(MML.items[index].type === "weapon"){
			var item = MML.items[index];
			this.buttons.push({
				text: item.name,
				nextMenu: "GmMenuItemQuality",
				triggeredMethod: function(input) {
					state.MML.GM.newItem = MML.items[input.text];
					MML.displayMenu.apply(this, []);
				}
			});
		}
	}
};

MML.GmMenuNewShield = function GmMenuNewShield(input){
	this.who = input.who;
	this.message = "Select shield type:";
	this.buttons = [];

	var index;
	for(index in MML.items){
		if(MML.items[index].type === "shield"){
			var item = MML.items[index];
			this.buttons.push({
				text: item.name,
				nextMenu: "GmMenuItemQuality",
				triggeredMethod: function(input) {
					state.MML.GM.newItem = MML.items[input.text];
					MML.displayMenu.apply(this, []);
				}
			});
		}
	}
};

MML.GmMenuNewArmor = function GmMenuNewArmor(input){
	this.who = input.who;
	this.message = "Select armor style:";
	this.buttons = [];

	var index;
	for(index in MML.items){
		if(MML.items[index].type === "armor"){
			var item = MML.items[index];
			this.buttons.push({
				text: item.name,
				nextMenu: "GmMenuArmorMaterial",
				triggeredMethod: function(input) {
					state.MML.GM.newItem = MML.items[input.text];
					MML.displayMenu.apply(this, []);
				}
			});
		}
	}
};

MML.GmMenuArmorMaterial = function GmMenuArmorMaterial(input){
	this.who = input.who;
	this.message = "Select armor material:";
	this.buttons = [];

	var index;
	for(index in MML.APVList){
		var material = MML.APVList[index];
		this.buttons.push({
			text: material.name,
			nextMenu: "GmMenuItemQuality",
			triggeredMethod: function(input) {
				var material = MML.APVList[input.text];
				state.MML.GM.newItem.material = material.name;
				state.MML.GM.newItem.weight = material.weightPerPosition * state.MML.GM.newItem.totalPostitions;
				state.MML.GM.newItem.name = material.name + " " + state.MML.GM.newItem.name;
				MML.displayMenu.apply(this, []);
			}
		});
	}
};

MML.GmMenuNewItemProperties = function GmMenuNewItemProperties(input){
	this.who = input.who;
	this.message = "Add new properties:";
	this.buttons = [MML.menuButtons.assignNewItem
					];
};

MML.GmMenuassignNewItem = function GmMenuassignNewItem(input){
	this.who = input.who;
	this.message = "Select character:";
	this.buttons = [];

	var index;
	for(index in state.MML.characters){
		this.buttons.push({
			text: index,
			nextMenu: "GmMenuMain",
			triggeredMethod: function(input){
				MML.displayMenu.apply(this, []);
			}
		});
	}
};

MML.GmMenuItemQuality = function GmMenuItemQuality(input){
	this.who = input.who;
	this.message = "Select a quality level:";
	this.buttons = [MML.menuButtons.itemQualityPoor, 
					MML.menuButtons.itemQualityStandard,
					MML.menuButtons.itemQualityExcellent,
					MML.menuButtons.itemQualityMasterWork];
};

MML.displayItemOptions = function displayItemOptions(input){
	var who = input.who;
	var itemId = input.itemId;
	var item = state.MML.characters[who].inventory[itemId];
    var buttons = [];
    var unequipButton;
    var hands;
    this.menu = "menuIdle";
    this.message =  "Item Menu";
    this.who = who;   
    
    if(item.type === "weapon"){
        //Weapon already equipped
        if(state.MML.characters[who].leftHand._id === itemId || state.MML.characters[who].rightHand._id === itemId){
            unequipButton = {
                text: "Unequip",
                nextMenu: "menuIdle"
            };

            if(state.MML.characters[who].leftHand._id === itemId && state.MML.characters[who].leftHand._id === itemId){
                unequipButton.triggeredMethod = function(text){
                    MML.processCommand({
		            	type: "character",
						who: who,
						triggeredFunction: "setApiCharAttribute",
						input: {
							attribute: "leftHand",
							value: {}
						}
					});
					MML.processCommand({
		            	type: "character",
						who: who,
						triggeredFunction: "setApiCharAttribute",
						input: {
							attribute: "rightHand",
							value: {}
						}
					});
                    MML.displayMenu.apply(this, []);
                    };
            }
            else if(state.MML.characters[who].leftHand._id === itemId){
                unequipButton.triggeredMethod = function(text){
                    MML.processCommand({
		            	type: "character",
						who: who,
						triggeredFunction: "setApiCharAttribute",
						input: {
							attribute: "leftHand",
							value: {}
						}
					});
                    MML.displayMenu.apply(this, []);
                    };
            }
            else{
                unequipButton.triggeredMethod = function(text){
                    MML.processCommand({
		            	type: "character",
						who: who,
						triggeredFunction: "setApiCharAttribute",
						input: {
							attribute: "rightHand",
							value: {}
						}
					});
                    MML.displayMenu.apply(this, []);
                    };
            }
            buttons.push(unequipButton);
        }
        else{
            _.each(item.grips, function(grip, gripName){
                if(gripName === "One Hand"){
                    buttons.push({
                        text: "Equip Left Hand",
                        nextMenu: "menuIdle",
                        triggeredMethod: function(text){
                            if(state.MML.characters[who].rightHand.grip !== "One Hand"){
                                MML.processCommand({
					            	type: "character",
									who: who,
									triggeredFunction: "setApiCharAttribute",
									input: {
										attribute: "rightHand",
										value: {
	                                        _id: itemId,
	                                        grip: gripName
	                                    }
									}
								});
                            }
                            MML.processCommand({
				            	type: "character",
								who: who,
								triggeredFunction: "setApiCharAttribute",
								input: {
									attribute: "leftHand",
									value: {
                                        _id: itemId,
                                        grip: gripName
                                    }
								}
							});

                            MML.displayMenu.apply(this, []);
                            }
                        });
                    buttons.push({
                        text: "Equip Right Hand",
                        nextMenu: "menuIdle",
                        triggeredMethod: function(text){
                            if(state.MML.characters[who].leftHand.grip !== "One Hand"){
                                MML.processCommand({
					            	type: "character",
									who: who,
									triggeredFunction: "setApiCharAttribute",
									input: {
										attribute: "leftHand",
										value: {
	                                        _id: itemId,
	                                        grip: gripName
	                                    }
									}
								});
                            }
                            MML.processCommand({
				            	type: "character",
								who: who,
								triggeredFunction: "setApiCharAttribute",
								input: {
									attribute: "rightHand",
									value: {
                                        _id: itemId,
                                        grip: gripName
                                    }
								}
							});
                            MML.displayMenu.apply(this, []);
                            }
                        });
                    }
                else{
                    buttons.push({
                        text: "Equip " + gripName,
                        nextMenu: "menuIdle",
                        triggeredMethod: function(text){
                            MML.processCommand({
				            	type: "character",
								who: who,
								triggeredFunction: "setApiCharAttribute",
								input: {
									attribute: "rightHand",
									value: {
                                        _id: itemId,
                                        grip: gripName
                                    }
								}
							});
							MML.processCommand({
				            	type: "character",
								who: who,
								triggeredFunction: "setApiCharAttribute",
								input: {
									attribute: "leftHand",
									value: {
                                        _id: itemId,
                                        grip: gripName
                                    }
								}
							});
                            MML.displayMenu.apply(this, []);
                            }
                        });
                    }
                });
            }
        }
    else if(item.type === "armor"){
        log(item.type); 
        }
    else if(item.type === "shield"){
        buttons.push({
            text: "Equip Left Hand",
            nextMenu: "menuIdle",
            triggeredMethod: function(text){
                MML.processCommand({
	            	type: "character",
					who: who,
					triggeredFunction: "setApiCharAttribute",
					input: {
						attribute: "leftHand",
						value: {
                            _id: itemId,
                            grip: "One Hand"
                        }
					}
				});
                MML.displayMenu.apply(this, []);
                }
            });
            buttons.push({
            text: "Equip Right Hand",
            nextMenu: "menuIdle",
            triggeredMethod: function(text){
                MML.processCommand({
	            	type: "character",
					who: who,
					triggeredFunction: "setApiCharAttribute",
					input: {
						attribute: "rightHand",
						value: {
                            _id: itemId,
                            grip: "One Hand"
                        }
					}
				});
                MML.displayMenu.apply(this, []);
                }
            });
        }
    else if(item.type === "spellComponent"){
        log(item.type);
        }
    else{
        log(item.type);
        }

    buttons.push({
        text: "Exit",
        nextMenu: "menuIdle",
        triggeredMethod: function(text){
            MML.displayMenu.apply(this, []);
            }
        });

    this.buttons = buttons;
    MML.displayMenu.apply(this, []);
};

// MML.GmMenupromptInitiativeRolls = function GmMenupromptInitiativeRolls(input){
// 	this.who = input.who;
// 	this.message = "Start round when all characters are ready.";
// 	this.buttons = [MML.menuButtons.startRound, 
// 					MML.menuButtons.endCombat];
// };
MML.GmMenuStartRound = function GmMenuStartRound(input){
	this.who = input.who;
	this.message = "Start round when all characters are ready.";
	this.buttons = [MML.menuButtons.startRound, 
					MML.menuButtons.endCombat];
};

// MML.GmMenuStartRound = function GmMenuStartRound(input){
// 	this.who = input.who;
// 	this.message = "Prepare actions and start the round";
// 	this.buttons = [MML.menuButtons.startRound, 
// 					MML.menuButtons.endCombat];
// };

MML.charMenuPrepareAction = function charMenuPrepareAction(input){
	this.who = input.who;
	this.message =  "Prepare " + this.who + "'s action";
	this.buttons = [MML.menuButtons.setActionAttack, 
					MML.menuButtons.setActionCast,
					MML.menuButtons.setActionReadyItem,
					MML.menuButtons.setActionObserve];
};
MML.charMenuAttack = function charMenuAttack(input){
	this.who = input.who;
	this.message =  "Attack Menu";
	var buttons = [{
		text: "Standard",
		nextMenu: "charMenuAttackCalledShot",
		triggeredMethod: function(input){
			MML.displayMenu.apply(this, []);
		}}];

	if (MML.isWieldingMissileWeapon(state.MML.characters[this.who])){
		buttons.push({
			text: "Shoot From Cover",
			nextMenu: "charMenuAttackCalledShot",
			triggeredMethod: function(input){
				state.MML.characters[this.who].action.modifiers.push("Shoot From Cover");
				MML.displayMenu.apply(this, []);
			}
		});
		buttons.push({
			text: "Aim",
			nextMenu: "charMenuPrepareAction",
			triggeredMethod: function(input){
				state.MML.characters[this.who].action.modifiers.push("Aim");
				MML.displayMenu.apply(this, []);
			}
		});
	}
	else {//Melee	
		buttons.push({
			text: "Sweep Attack",
			nextMenu: "charMenuAttackCalledShot",
			triggeredMethod: function(input){
				state.MML.characters[this.who].action.modifiers.push("Sweep Attack");
				MML.displayMenu.apply(this, []);
			}
		});
	}
	this.buttons = buttons;
};
MML.charMenuAttackCalledShot = function charMenuCalledShot(input){
	this.who = input.who;
	this.message =  "Called Shot Menu";
	var buttons = [{
		text: "None",
		triggeredMethod: function(input){
			MML.displayMenu.apply(this, []);
		}},
		{
		text: "Body Part",
		triggeredMethod: function(input){
			state.MML.characters[this.who].action.modifiers.push("Called Shot");
			MML.displayMenu.apply(this, []);
		}},
		{
		text: "Specific Hit Position",
		triggeredMethod: function(input){
			state.MML.characters[this.who].action.modifiers.push("Called Shot Specific");
			MML.displayMenu.apply(this, []);
		}}
	];

	if(MML.isWieldingMissileWeapon(state.MML.characters[this.who])){
		_.each(buttons, function(button){
			button.nextMenu = "charMenuInitiativeRoll";
		});
	}
	else{
		_.each(buttons, function(button){
			button.nextMenu = "charMenuAttackStance";
		});
	}
	this.buttons = buttons;
};
MML.charMenuAttackStance = function charMenuAttackStance(input){
	this.who = input.who;
	this.message =  "Attack Stance Menu";
	this.buttons = [{
		text: "Neutral",
		nextMenu: "charMenuInitiativeRoll",
		triggeredMethod: function(input){
			MML.displayMenu.apply(this, []);
		}},
		{
		text: "Defensive",
		nextMenu: "charMenuInitiativeRoll",
		triggeredMethod: function(input){
			state.MML.characters[this.who].action.modifiers.push("Defensive Stance");
			MML.displayMenu.apply(this, []);
		}},
		{
		text: "Aggressive",
		nextMenu: "charMenuInitiativeRoll",
		triggeredMethod: function(input){
			state.MML.characters[this.who].action.modifiers.push("Aggressive Stance");
			MML.displayMenu.apply(this, []);
		}}
	];
};

MML.charMenuInitiativeRoll = function charMenuInitiativeRoll(input){
	this.who = input.who;
	this.message =  "Roll initiative or change action for " + this.who;
	this.buttons = [MML.menuButtons.initiativeRoll,
					MML.menuButtons.changeAction];
};

MML.GmMenuStartAction = function GmMenuStartAction(input){
	this.who = input.who;
	this.message =  "Start " + state.MML.GM.actor + "'s action";
	this.buttons = [MML.menuButtons.startAction];
};
MML.menuCombatMovement = function menuCombatMovement(input){
	this.who = input.who;
	this.message =  "Move " + this.who + ".";
	this.buttons = [MML.menuButtons.setProne,
					MML.menuButtons.setStalk,
					MML.menuButtons.setCrawl,
					MML.menuButtons.setWalk,
					MML.menuButtons.setJog,
					MML.menuButtons.setRun,
					MML.menuButtons.endMovement];
};
MML.charMenuChooseTarget = function charMenuChooseTarget(input){
	this.who = input.who;
	this.message = "Select a token.";
	this.buttons = [];

	var index;
	for(index in state.MML.GM.combatants){
		this.buttons.push({
			text: state.MML.GM.combatants[index],
			nextMenu: state.MML.characters[this.who].action.roll,
			triggeredMethod: function(input){
				sendChat("", "&{template:selectTarget} {{charName=" + this.name + "}} {{triggeredMethod=setCurrentCharacterTargets}}");
			}
		});
	}
};
MML.setCurrentCharacterTargets = function setCurrentCharacterTargets(input){
	var targetArray;
	if(typeof input.who !== "undefined"){
		targetArray = [input.target];
	}
	else{
		targetArray = input.targets;
	}

	MML.processCommand({
    	type: "character",
    	who: input.character,
    	triggeredFunction: state.MML.characters[input.character].action.triggeredMethod,
		input: {
	    	targetArray: targetArray
	  	}
    });
};
MML.charMenuAttackRoll = function charMenuAttackRoll(input){
	this.who = input.who;
	this.message =  "Roll Attack.";
	this.buttons = [MML.menuButtons.rollDice];
};
MML.charMenuDefenseRoll = function charMenuDefenseRoll(input){
	this.who = input.who;

	var weapon = state.MML.characters[this.who].inventory.weapons[0];
    var weaponSkill = Math.round(state.MML.characters[this.who].skills[weapon.name]/2);
	var shieldMod = state.MML.characters[this.who].inventory.shield.defenseMod;
	var dodgeSkill = state.MML.characters[this.who].skills.dodge;
	var defaultMartialSkill = state.MML.characters[this.who].skills.defaultMartial;
	var defenseMod = state.MML.characters[this.who].modifiers.defense;
    var sitMod = state.MML.characters[this.who].modifiers.situational;
	var dodgeChance;
	var blockChance;
	
	if(weaponSkill >= defaultMartialSkill){
		blockChance = weapon.defense + weaponSkill + sitMod + defenseMod + shieldMod;
	}
	else{
		blockChance = weapon.defense + defaultMartialSkill + sitMod + defenseMod + shieldMod;
	}
	
	if(dodgeSkill >= defaultMartialSkill){
		dodgeChance = dodgeSkill + sitMod + defenseMod;
	}
	else{
		dodgeChance = defaultMartialSkill + sitMod + defenseMod;
	}

	this.message = "How will " + this.who + " defend? Block: "  + blockChance + " Dodge: " + dodgeChance;
	this.buttons = [MML.menuButtons.defenseBlock,
					MML.menuButtons.defenseDodge,
					MML.menuButtons.defenseTakeIt];
};

MML.menuButtons = {};
MML.menuButtons.GmMenuMain = {
	text: "GmMenuMain",
	nextMenu: "GmMenuMain",
	triggeredMethod: function(input){
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.combatMenu = {
	text: "Combat",
	nextMenu: "GmMenuCombat",
	triggeredMethod: function(input){
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.newCharacterMenu = {
	text: "New Character",
	nextMenu: "GmMenuNewCharacter",
	triggeredMethod: function(input){
		MML.displayMenu.apply(this, []);
	}
};

MML.menuButtons.newItemMenu = {
	text: "New Item",
	nextMenu: "GmMenuNewItem",
	triggeredMethod: function(input){
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.newWeapon = {
	text: "Weapon",
	nextMenu: "GmMenuNewWeapon",
	triggeredMethod: function(input){
		MML.displayMenu.apply(this, []);
	}
};

MML.menuButtons.newShield = {
	text: "Shield",
	nextMenu: "GmMenuNewShield",
	triggeredMethod: function(input){
		MML.displayMenu.apply(this, []);
	}
};

MML.menuButtons.newArmor = {
	text: "Armor",
	nextMenu: "GmMenuNewArmor",
	triggeredMethod: function(input){
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.newSpellComponent = {
	text: "Spell Component",
	nextMenu: "GmMenuNewSpellComponent",
	triggeredMethod: function(input){
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.newMiscItem = {
	text: "Misc",
	nextMenu: "GmMenuNewMiscItem",
	triggeredMethod: function(input){
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.itemQualityPoor = {
	text: "Poor",
	nextMenu: "GmMenuNewItemProperties",
	triggeredMethod: function(input){
		state.MML.GM.newItem.quality = input.text;
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.itemQualityStandard = {
	text: "Standard",
	nextMenu: "GmMenuNewItemProperties",
	triggeredMethod: function(input){
		state.MML.GM.newItem.quality = input.text;
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.itemQualityExcellent = {
	text: "Excellent",
	nextMenu: "GmMenuNewItemProperties",
	triggeredMethod: function(input){
		state.MML.GM.newItem.quality = input.text;
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.itemQualityMasterWork = {
	text: "Master Work",
	nextMenu: "GmMenuNewItemProperties",
	triggeredMethod: function(input){
		state.MML.GM.newItem.quality = input.text;
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.assignNewItem =  {
	text: "Assign Item",
	nextMenu: "GmMenuMain",
	triggeredMethod: function(input){
		sendChat("", "&{template:selectTarget} {{charName=" + this.name + "}} {{triggeredMethod=assignNewItem}}");
	}
};

MML.menuButtons.worldMenu = {
	text: "World",
	nextMenu: "GmMenuWorld",
	triggeredMethod: function(input){
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.utilitiesMenu = {
	text: "Utilities",
	nextMenu: "GmMenuUtilities",
	triggeredMethod: function(input){
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.startCombat = {
	text: "Start Combat",
	nextMenu: "charMenuPrepareAction",
	triggeredMethod: function(input){
		MML.processCommand({
	        type: "GM",
	        triggeredFunction: "startCombat",
	        input: input
	    });
	}
};
MML.menuButtons.toMainGmMenu = {
	text: "Back",
	nextMenu: "GmMenuMain",
	triggeredMethod: function(input){
		MML.displayMenu.apply(this, []);
	}
};

MML.menuButtons.startRound = {
	text: "Start Round",
	nextMenu: "GmMenuStartRound",
	triggeredMethod: function(input){
		MML.processCommand({
	        type: "GM",
	        triggeredFunction: "startRound",
	        input: {}
	    });
	}
};
MML.menuButtons.endCombat = {
	text: "End Combat",
	nextMenu: "GmMenuMain",
	triggeredMethod: function(input){
		MML.processCommand({
	        type: "GM",
	        triggeredFunction: "endCombat",
	        input: {}
	    });
	}
};
MML.menuButtons.setActionAttack = {
	text: "Attack",
	nextMenu: "charMenuAttack",
	triggeredMethod: function(input){
		state.MML.characters[this.who].action = {
			name: "Attack",
			getTargets: "getSingleTarget",
			triggeredMethod: "startAttackAction",
			modifiers: []
		};
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.setActionCast = {
	text: "Cast",
	nextMenu: "charMenuCast",
	triggeredMethod: function(input){
		state.MML.characters[this.who].action.name = input.text;
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.setActionReadyItem = {
	text: "Ready Item",
	nextMenu: "charMenuReadyItem",
	triggeredMethod: function(input){
		state.MML.characters[this.who].action.name = input.text;
		sendChat("", "Ready Item not ready...lol");
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.setActionObserve = {
	text: "Observe",
	nextMenu: "charMenuPrepareAction",
	triggeredMethod: function(input){
		state.MML.characters[this.who].action.name = input.text;
		sendChat("", "Observe");
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.changeAction = {
	text: "Change Action",
	nextMenu: "charMenuPrepareAction",
	triggeredMethod: function(input){
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.actionPrepared = {
	text: "Ready",
	nextMenu: "charMenuPrepareAction",
	triggeredMethod: function(input){
		state.MML.characters[this.who].ready = true;
		state.MML.characters[this.who].updateCharacter("ready");
		state.MML.characters[this.who].updateCharacter("action");
		this.characterIndex++;
		if(this.characterIndex < this.characters.length){
			MML.charMenuPrepareAction.apply(this, [this.characters[this.characterIndex]]);
			MML.displayMenu.apply(this, []);
		}
		else if(this.name === state.MML.GM.player){
			MML.GmMenuStartRound.apply(this, ["GM"]);
			MML.displayMenu.apply(this, []);
		}
		else{
			this.menu = "menuIdle";
			MML.displayMenu.apply(this, []);
		}
	}
};
MML.menuButtons.startAction = {
	text: "Start",
	nextMenu: "menuIdle",
	triggeredMethod: function(input){
		MML.startAction.apply(state.MML.GM, []);
	}
};
MML.menuButtons.chooseTargets = {
	text: "Choose Targets",
	nextMenu: "charMenuChooseTargets",
	triggeredMethod: function(input){
		MML.displayMenu.apply(this, []);
	}
};

MML.menuButtons.endAction = {
	text: "End Action",
	nextMenu: "charMenuPrepareAction",
	triggeredMethod: function(input){
		MML.endAction.apply(state.MML.GM, []);
	}
};
MML.menuButtons.rollDice = {
	text: "Roll",
	nextMenu: "menuIdle",
	triggeredMethod: function(input){
		state.MML.GM.currentRoll.getRoll();
	}
};
MML.menuButtons.initiativeRoll = {
	text: "Roll",
	nextMenu: "menuIdle",
	triggeredMethod: function(input){
		MML.processCommand({
	        type: "character",
	        who: this.who,
	        triggeredFunction: "initiativeRoll",
	        input: {}
	    });
	}
};


MML.menuButtons.acceptRoll = {
	text: "Accept",
	nextMenu: "menuIdle",
	triggeredMethod: function(input){
		MML[this.currentRoll.applyResult].apply(this, []);
	}
};

MML.menuButtons.changeRoll = {
	text: "Change",
	nextMenu: "menuIdle",
	triggeredMethod: function(input){
		MML.displayGmRoll.apply(this, []);
	}
};

MML.menuButtons.rollHitPosition = {
	text: "Roll",
	nextMenu: "charMenuRollDamage",
	triggeredMethod: function(input){
		MML.getHitPositionRoll.apply(state.MML.GM, []);
	}
};
MML.menuButtons.setProne = {
	text: "Prone",
	nextMenu: "menuCombatMovement",
	triggeredMethod: function(input){
		MML.processCommand({
	        type: "character",
	        who: this.who,
	        triggeredFunction: "setApiCharAttribute",
	        input: {
	            attribute: "movementPosition",
	            value: "Prone"
	        }
	    });
		MML.processCommand({
	        type: "character",
	        who: this.who,
	        triggeredFunction: "displayMovement",
	        input: {
	            display: true
	        }
	    });
	}
};
MML.menuButtons.setCrawl = {
	text: "Crawl",
	nextMenu: "menuCombatMovement",
	triggeredMethod: function(input){
		MML.processCommand({
	        type: "character",
	        who: this.who,
	        triggeredFunction: "setApiCharAttribute",
	        input: {
	            attribute: "movementPosition",
	            value: "Crawl"
	        }
	    });
		MML.processCommand({
	        type: "character",
	        who: this.who,
	        triggeredFunction: "displayMovement",
	        input: {
	            display: true
	        }
	    });
	}
};
MML.menuButtons.setStalk = {
	text: "Stalk",
	nextMenu: "menuCombatMovement",
	triggeredMethod: function(input){
		MML.processCommand({
	        type: "character",
	        who: this.who,
	        triggeredFunction: "setApiCharAttribute",
	        input: {
	            attribute: "movementPosition",
	            value: "Stalk"
	        }
	    });
		MML.processCommand({
	        type: "character",
	        who: this.who,
	        triggeredFunction: "displayMovement",
	        input: {
	            display: true
	        }
	    });
	}
};
MML.menuButtons.setWalk = {
	text: "Walk",
	nextMenu: "menuCombatMovement",
	triggeredMethod: function(input){
		MML.processCommand({
	        type: "character",
	        who: this.who,
	        triggeredFunction: "setApiCharAttribute",
	        input: {
	            attribute: "movementPosition",
	            value: "Walk"
	        }
	    });
		MML.processCommand({
	        type: "character",
	        who: this.who,
	        triggeredFunction: "displayMovement",
	        input: {
	            display: true
	        }
	    });
	}
};
MML.menuButtons.setJog = {
	text: "Jog",
	nextMenu: "menuCombatMovement",
	triggeredMethod: function(input){
		MML.processCommand({
	        type: "character",
	        who: this.who,
	        triggeredFunction: "setApiCharAttribute",
	        input: {
	            attribute: "movementPosition",
	            value: "Jog"
	        }
	    });
		MML.processCommand({
	        type: "character",
	        who: this.who,
	        triggeredFunction: "displayMovement",
	        input: {
	            display: true
	        }
	    });
	}
};
MML.menuButtons.setRun = {
	text: "Run",
	nextMenu: "menuCombatMovement",
	triggeredMethod: function(input){
		MML.processCommand({
	        type: "character",
	        who: this.who,
	        triggeredFunction: "setApiCharAttribute",
	        input: {
	            attribute: "movementPosition",
	            value: "Run"
	        }
	    });
		MML.processCommand({
	        type: "character",
	        who: this.who,
	        triggeredFunction: "displayMovement",
	        input: {
	            display: true
	        }
	    });
	}
};
MML.menuButtons.endMovement  = {
	text: "End Movement",
	nextMenu: "menuIdle",
	triggeredMethod: function(input){
		MML.processCommand({
	        type: "character",
	        who: this.who,
	        triggeredFunction: "displayMovement",
	        input: {
	            display: false
	        }
	    });
		MML.processCommand({
	        type: "character",
	        who: this.who,
	        triggeredFunction: "startAction",
	        input: {}
	    });
	}
};
MML.menuButtons.defenseBlock = {
	text: "Block",
	nextMenu: "menuIdle",
	triggeredMethod: function(input){
		state.MML.characters[this.who].defense.style = "Block";
		state.MML.characters[this.who].defense.number++;
		MML.getDefenseRoll.apply(state.MML.GM, []);
	}
};
MML.menuButtons.defenseDodge = {
	text: "Dodge",
	nextMenu: "menuIdle",
	triggeredMethod: function(input){
		state.MML.characters[this.who].defense.style = "Dodge";
		state.MML.characters[this.who].defense.number++;
		state.MML.characters[this.who].defense.dodge = true;
		MML.getDefenseRoll.apply(state.MML.GM, []);
	}
};
MML.menuButtons.defenseTakeIt = {
	text: "Take It",
	nextMenu: "menuIdle",
	triggeredMethod: function(input){
		state.MML.characters[this.who].defense.style = "Take It";
		MML.getDefenseRoll.apply(state.MML.GM, []);
	}
};

MML.endCombat = function endCombat(){
	if(this.combatants.length > 0){
		var index = 0;
		for (index in this.combatants){
			//remove token tints
			this.characters[this.combatants[index]].setReady(false);
		}
		this.inCombat = false;
		this.combatants = [];
		Campaign().set("initiativepage", "false");
	}
};

MML.movementPhase = function movementPhase(input){
	switch(input){
		case "entry":
			this.actor = this.combatants[0];

			var buttonArray = ["Perform Action"];
			
			this.displayMenu("Wait for characters to be ready", buttonArray);
		break;
		case "Perform Action":
			if (this.checkReady()) {
				this.actor = this.combatants[0];
				this.targets = this.characters[this.actor].action.targets;
				this.targetIndex = 0;
				this.currentTarget = this.targets[this.targetIndex];
				this.rolls = {};
				this.initRolls = this.characters[this.actor].action.rolls;
				this.initRolls();
				this.who = MML.performAction;
				this.who();
			}
		break;
		default:
		break;
	}
};



MML.endAction = function endAction(){
	this.characters[this.actor].initiative.action++;
	this.characters[this.actor].setInitiative();
	this.characters[this.actor].computeSitMods();

	var index;
	for(index in this.targets){
		this.characters[this.targets[index]].computeSitMods();
		this.characters[this.targets[index]].setInitiative();
	}
	this.setTurnOrder();

	if(this.characters[this.combatants[0]].initiative < 1){
		
	}
	else{
		this.who = MML.GmMenuCombat;
		this.who("Start Action");
	}
};

MML.nextAction = function nextAction(){
	if(this.checkReady() === true){
		this.actor = this.combatants[0];
		this.characters[this.actor].initiative.action++;
		this.characters[this.actor].computeSitMods();
		this.characters[this.actor].setInitiative();
		var index;
		for(index in this.targets){
			this.characters[this.targets[index]].computeSitMods();
			this.characters[this.targets[index]].setInitiative();
		}
		this.setTurnOrder();
		
		if(this.actor.initiative < 1){
			var index = 0;
			for (index in this.combatants){
				this.characters[this.combatants[index]].setReady(false);
				this.characters[this.combatants[index]].newRoundUpdate();
				this.characters[this.combatants[index]].computeSitMods();
			}
			// this.roundStarted = false;
			this.actor = "";
			// this.turnInfo.step = "newRound";
			// this.turnInfo.data = {};
			// sendChat("", "&{template:charMenu} {{button=[End Round](!main)}}");
			this.who = MML.GmMenuCombat;
			this.who("Next Round");
		}
		else{
			// this.turnInfo.charName = charName;
			// this.turnInfo.step = "action";
			// this.turnInfo.data = {};
			// this.turnInfo.data.targets = character.action.target;
			// sendChat("", "&{template:charMenu} {{button=[" + charName + "'s Turn](!main)}}");
			this.combatants[index].menu("entry");
			//MML.GmMenu.combat("Next Action");
		}
	}
	else{
		sendChat("", "&{template:charMenu} {{name=Ready characters}} {{button=[Next Turn](!main)}}");
	}
};


MML.GmMenuNewCharacter = function newCharacter(input){
	var character = {};
	var buttonArray = ["Name"];
	
	switch(input){
		case "entry":
			this.who = "newCharacter";
			this.displayMenu("Enter Character Name", buttonArray);
		break;
		case "Name":
			// character.name = input;
			this.whoInfo.character = character;
			MML.GmMenu.chooseRace("entry");
		break;
		default:
		break;			
	}
	
	
};

MML.GmMenuChooseRace = function chooseRace(input){
	var character = {};
	var buttonArray = ["Dwarf", "Gnome", "Human", "Hobbit", "Gray Elf", "Wood Elf"];
	
	switch(input){
		case "entry":
			this.who = "chooseRace";
			this.displayMenu("Choose a race", buttonArray);
		break;
		case "Dwarf":
			character.race = "Dwarf";
			MML.GmMenu.chooseGender("entry");
		break;
		case "Gnome":
			character.race = "Gnome";
			MML.GmMenu.chooseGender("entry");
		break;
		case "Human":
			character.race = "Human";
			MML.GmMenu.chooseGender("entry");
		break;
		case "Hobbit":
			character.race = "Hobbit";
			MML.GmMenu.chooseGender("entry");
		break;
		case "Gray Elf":
			character.race = "Gray Elf";
			MML.GmMenu.chooseGender("entry");
		break;
		case "Wood Elf":
			character.race = "Wood Elf";
			MML.GmMenu.chooseGender("entry");
		break;
		default:
		break;			
	}
	
	this.whoInfo.character = character;
};

MML.GmMenuChooseGender = function chooseGender(input){
	var character = this.whoInfo.character;
	var buttonArray = ["Female", "Male"];
	
	switch(input){
		case "entry":
			this.who = "chooseGender";
			this.displayMenu( "Choose a gender", buttonArray);
		break;
		case "Female":
			character.race = "Female";
			MML.GmMenu.rollAttributes("entry");
		break;
		case "Male":
			character.race = "Male";
			MML.GmMenu.rollAttributes("entry");
		break;
		default:
		break;			
	}
	this.whoInfo.character = character;
};
 
MML.GmMenuRollAttributes = function rollAttributes(input){
	var character = this.whoInfo.character; 
	var rollArray = this.whoInfo.rollArray;
	var buttonArray = ["Stature", "Strength", "Coordination", "Health", "Beauty", "Intellect", "Reason", "Creativity", "Presence"];
	var message;

	if (typeof(rollArray) === "undefined"){
		rollArray = [0, 0, 0, 0, 0, 0, 0, 0, 0];
		var index;
		for(index in rollArray){
			var roll = MML.rollDice(4, 6) - 4;
			while(roll < 6){
				roll = MML.rollDice(4, 6) - 4;
			}
			rollArray[index] = roll;
		}	
	}
	
	if(rollArray.length > 0){
		var index;
		for(index in rollArray){
			if(index === "0"){
				message = "Which attribute should be set to " + rollArray[index] + "? Remaining rolls: ";
			}
			else{
				message = message + rollArray[index] + ", ";
			}
		}

		switch(input){
			case "entry":
				this.who = "rollAttributes";
				this.displayMenu( message, buttonArray);
			break;
			case "Stature":
				if (typeof(character.stature) !== "undefined"){
					rollArray.push(character.stature);
				}
				character.stature = rollArray[0];
				if(rollArray.length > 1){
					rollArray.shift(); //Removes first element (current roll)
				}
				else{
					rollArray = [];
				}
				this.whoInfo.rollArray = rollArray;
				MML.GmMenu.rollAttributes("entry");
			break;
			case "Strength":
				if (typeof(character.strength) !== "undefined"){
					rollArray.push(character.strength);
				}
				character.strength = rollArray[0];
				if(rollArray.length > 1){
					rollArray.shift(); //Removes first element (current roll)
				}
				else{
					rollArray = [];
				}
				this.whoInfo.rollArray = rollArray;
				MML.GmMenu.rollAttributes("entry");
			break;
			case "Coordination":
				if (typeof(character.coordination) !== "undefined"){
					rollArray.push(character.coordination);
				}
				character.coordination = rollArray[0];
				if(rollArray.length > 1){
					rollArray.shift(); //Removes first element (current roll)
				}
				else{
					rollArray = [];
				}
				this.whoInfo.rollArray = rollArray;
				MML.GmMenu.rollAttributes("entry");
			break;
			case "Health":
				if (typeof(character.health) !== "undefined"){
					rollArray.push(character.health);
				}
				character.health = rollArray[0];
				if(rollArray.length > 1){
					rollArray.shift(); //Removes first element (current roll)
				}
				else{
					rollArray = [];
				}
				this.whoInfo.rollArray = rollArray;
				MML.GmMenu.rollAttributes("entry");
			break;
			case "Beauty":
				if (typeof(character.beauty) !== "undefined"){
					rollArray.push(character.beauty);
				}
				character.beauty = rollArray[0];
				if(rollArray.length > 1){
					rollArray.shift(); //Removes first element (current roll)
				}
				else{
					rollArray = [];
				}
				this.whoInfo.rollArray = rollArray;
				MML.GmMenu.rollAttributes("entry");
			break;
			case "Intellect":
				if (typeof(character.intellect) !== "undefined"){
					rollArray.push(character.intellect);
				}
				character.intellect = rollArray[0];
				if(rollArray.length > 1){
					rollArray.shift(); //Removes first element (current roll)
				}
				else{
					rollArray = [];
				}
				this.whoInfo.rollArray = rollArray;
				MML.GmMenu.rollAttributes("entry");
			break;
			case "Reason":
				if (typeof(character.reason) !== "undefined"){
					rollArray.push(character.reason);
				}
				character.reason = rollArray[0];
				if(rollArray.length > 1){
					rollArray.shift(); //Removes first element (current roll)
				}
				else{
					rollArray = [];
				}
				this.whoInfo.rollArray = rollArray;
				MML.GmMenu.rollAttributes("entry");
			break;
			case "Creativity":
				if (typeof(character.creativity) !== "undefined"){
					rollArray.push(character.creativity);
				}
				character.creativity = rollArray[0];
				if(rollArray.length > 1){
					rollArray.shift(); //Removes first element (current roll)
				}
				else{
					rollArray = [];
				}
				this.whoInfo.rollArray = rollArray;
				MML.GmMenu.rollAttributes("entry");
			break;
			case "Presence":
				if (typeof(character.presence) !== "undefined"){
					rollArray.push(character.presence);
				}
				character.presence = rollArray[0];
				if(rollArray.length > 1){
					rollArray.shift(); //Removes first element (current roll)
				}
				else{
					rollArray = [];
				}
				this.whoInfo.rollArray = rollArray;
				MML.GmMenu.rollAttributes("entry");
			break;
			default:
			break;			
		}
	}

	else{
		MML.GmMenu.chooseSkills("entry");
	}
	
	this.whoInfo.character = character;
};

MML.GmMenuChooseSkills = function chooseSkills(input){
	var character = this.whoInfo.character;
	var skillArray = [];
	var buttonArray = [];

	var index;
	for(index in MML.skills){
		buttonArray.push(MML.skills[index].name); //{ name: "Acrobatics", current: 0, attribute: "coordination", mods: [{ name: , value: }]};
	} 

	if(input === "entry"){
		this.who = "chooseSkills";
		this.displayMenu( "Choose Skills", buttonArray);
	}
	else{
		//character.skills = set here
	}
	this.whoInfo.character = character;
};

MML.GmMenuWorld = function world(input){
	//pass time, travel, other stuff
};

MML.GmMenuUtilities = function utilities(input){
	//edit states and other api stuff
};

// MML.initiativeRoll = {
// 	prompt: function(){

// 	},
// 	result: {},
// 	effect: function(){
// 		this.result;
// 	}
	 
// };
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
        if(MML.isWieldingMissileWeapon(this)){
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
MML.test = function test(){
    log("test");

    var GM = "{\"player\":\"Robot\",\"name\":\"GM\",\"currentAction\":{},\"inCombat\":true,\"currentRound\":1,\"roundStarted\":true,\"combatants\":[\"Thaddeus Clinch\",\"Remmy Denkin\"],\"actor\":\"Thaddeus Clinch\"}";
    var players = "{\"Robot\":{\"name\":\"Robot\",\"who\":\"Thaddeus Clinch\",\"menu\":\"menuIdle\",\"buttons\":[],\"characters\":[\"Thaddeus Clinch\",\"Remmy Denkin\"],\"characterIndex\":2,\"message\":\"Menu Closed\",\"currentRoll\":{\"who\":\"Remmy Denkin\",\"name\":\"initiative\",\"value\":2,\"getResult\":\"initiativeResult\",\"applyResult\":\"initiativeApply\",\"range\":\"1-10\",\"accepted\":true,\"rollResult\":17,\"message\":\"Roll: 2\\nResult: 17\\nRange: 1-10\"}},\"Andrew\":{\"name\":\"Andrew\",\"menu\":\"charMenuPrepareAction\",\"characters\":[],\"characterIndex\":0,\"message\":\"Prepare undefined's action\",\"buttons\":[{\"text\":\"Attack\",\"nextMenu\":\"charMenuAttack\"},{\"text\":\"Cast\",\"nextMenu\":\"charMenuCast\"},{\"text\":\"Ready Item\",\"nextMenu\":\"charMenuReadyItem\"},{\"text\":\"Observe\",\"nextMenu\":\"charMenuPrepareAction\"}]}}";
    var characters = "{\"Thaddeus Clinch\":{\"name\":\"Thaddeus Clinch\",\"player\":\"Robot\",\"race\":\"Human\",\"bodyType\":\"humanoid\",\"gender\":\"Male\",\"height\":\"5'7\",\"weight\":150,\"handedness\":\"\",\"stature\":22,\"strength\":20,\"coordination\":15,\"health\":19,\"beauty\":18,\"intellect\":7,\"reason\":7,\"creativity\":14,\"presence\":15,\"willpower\":16,\"evocation\":63,\"perception\":9,\"systemStrength\":18,\"fitness\":20,\"fitnessMod\":4,\"load\":88,\"overhead\":176,\"deadLift\":352,\"multiWoundMax\":29,\"multiWound\":29,\"headHPMax\":13,\"headHP\":13,\"chestHPMax\":16,\"chestHP\":16,\"abdomenHPMax\":21,\"abdomenHP\":21,\"leftArmHPMax\":21,\"leftArmHP\":21,\"rightArmHPMax\":21,\"rightArmHP\":21,\"leftLegHPMax\":21,\"leftLegHP\":21,\"rightLegHPMax\":21,\"rightLegHP\":21,\"epMax\":63,\"ep\":63,\"fatigueMax\":20,\"fatigue\":20,\"hpRecovery\":4,\"epRecovery\":8,\"inventory\":{\"kc439wkco1c9in3p573\":{\"name\":\"Shovel\",\"type\":\"weapon\",\"weight\":6,\"grips\":{\"Two Hands\":{\"family\":\"Bludgeoning\",\"hands\":2,\"primaryType\":\"Impact\",\"primaryTask\":35,\"primaryDamage\":\"\",\"secondaryType\":\"1d8\",\"secondaryTask\":0,\"secondaryDamage\":\"\",\"defense\":15,\"initiative\":4,\"rank\":1}},\"quality\":\"Standard\"}},\"totalWeightCarried\":6,\"knockdownMax\":23,\"knockdown\":false,\"apv\":[{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]}],\"leftHand\":{\"_id\":\"kc439wkco1c9in3p573\",\"grip\":\"Two Hands\"},\"rightHand\":{\"_id\":\"kc439wkco1c9in3p573\",\"grip\":\"Two Hands\"},\"hitTable\":\"[null,1,1,2,3,3,4,4,5,5,6,7,8,8,8,8,9,9,9,9,10,10,11,11,11,11,12,12,13,13,13,13,14,14,14,15,15,16,16,17,17,17,18,18,19,19,19,19,20,20,21,21,21,22,22,23,23,23,24,24,25,25,26,26,27,27,27,28,28,29,29,29,30,30,31,31,32,32,33,34,34,35,35,35,36,36,36,37,37,38,38,39,39,40,40,41,42,43,44,45,46]\",\"movementRatio\":4,\"movementAvailable\":4,\"movementPosition\":\"Walk\",\"situationalMod\":0,\"attributeDefenseMod\":13,\"meleeDefenseMod\":-50,\"missileDefenseMod\":-50,\"meleeAttackMod\":0,\"missileAttackMod\":-10,\"attributeMeleeAttackMod\":13,\"meleeDamageMod\":2,\"attributeMissileAttackMod\":8,\"attributeCastingMod\":-30,\"spellLearningMod\":-5,\"statureCheckMod\":0,\"strengthCheckMod\":0,\"coordinationCheckMod\":0,\"healthCheckMod\":0,\"beautyCheckMod\":0,\"intellectCheckMod\":0,\"reasonCheckMod\":0,\"creativityCheckMod\":0,\"presenceCheckMod\":0,\"willpowerCheckMod\":0,\"evocationCheckMod\":0,\"perceptionCheckMod\":0,\"systemStrengthCheckMod\":0,\"fitnessCheckMod\":0,\"statusEffects\":{},\"initiative\":22,\"initiativeRoll\":10,\"situationalInitBonus\":0,\"movementRatioInitBonus\":5,\"attributeInitBonus\":-1,\"senseInitBonus\":4,\"fomInitBonus\":0,\"firstActionInitBonus\":4,\"spentInitiative\":0,\"actionTempo\":-12,\"ready\":true,\"action\":{\"name\":\"Attack\",\"getTargets\":\"getSingleTarget\",\"triggeredMethod\":\"startAttackAction\",\"modifiers\":[],\"initBonus\":4},\"defensesThisRound\":0,\"dodgedThisRound\":false,\"meleeThisRound\":false,\"fatigueLevel\":0,\"roundsRest\":0,\"roundsExertion\":0,\"damagedThisRound\":false,\"skills\":{},\"weaponSkills\":{}},\"Remmy Denkin\":{\"name\":\"Remmy Denkin\",\"player\":\"Robot\",\"race\":\"Human\",\"bodyType\":\"humanoid\",\"gender\":\"Male\",\"height\":\"5'10\",\"weight\":165,\"handedness\":\"\",\"stature\":24,\"strength\":12,\"coordination\":14,\"health\":9,\"beauty\":8,\"intellect\":7,\"reason\":16,\"creativity\":10,\"presence\":6,\"willpower\":7,\"evocation\":49,\"perception\":11,\"systemStrength\":8,\"fitness\":11,\"fitnessMod\":2.6,\"load\":65,\"overhead\":130,\"deadLift\":260,\"multiWoundMax\":20,\"multiWound\":20,\"headHPMax\":9,\"headHP\":9,\"chestHPMax\":12,\"chestHP\":12,\"abdomenHPMax\":17,\"abdomenHP\":17,\"leftArmHPMax\":17,\"leftArmHP\":17,\"rightArmHPMax\":17,\"rightArmHP\":17,\"leftLegHPMax\":17,\"leftLegHP\":17,\"rightLegHPMax\":17,\"rightLegHP\":17,\"epMax\":49,\"ep\":49,\"fatigueMax\":11,\"fatigue\":11,\"hpRecovery\":0.5,\"epRecovery\":2,\"inventory\":{\"pj2mh7tir4zto6gigyr\":{\"name\":\"Cudgel, Light\",\"type\":\"weapon\",\"weight\":3,\"grips\":{\"One Hand\":{\"family\":\"Bludgeoning\",\"hands\":1,\"primaryType\":\"Impact\",\"primaryTask\":45,\"primaryDamage\":\"2d10\",\"secondaryType\":\"\",\"secondaryTask\":0,\"secondaryDamage\":\"\",\"defense\":15,\"initiative\":6,\"rank\":1}},\"quality\":\"Poor\"}},\"totalWeightCarried\":3,\"knockdownMax\":24,\"knockdown\":false,\"apv\":[{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]},{\"Surface\":[{\"value\":null,\"coverage\":100}],\"Cut\":[{\"value\":null,\"coverage\":100}],\"Chop\":[{\"value\":null,\"coverage\":100}],\"Pierce\":[{\"value\":null,\"coverage\":100}],\"Thrust\":[{\"value\":null,\"coverage\":100}],\"Impact\":[{\"value\":null,\"coverage\":100}],\"Flanged\":[{\"value\":null,\"coverage\":100}]}],\"leftHand\":{\"_id\":\"pj2mh7tir4zto6gigyr\",\"grip\":\"One Hand\"},\"rightHand\":{\"_id\":\"pj2mh7tir4zto6gigyr\",\"grip\":\"One Hand\"},\"hitTable\":\"[null,1,1,2,3,3,4,4,5,5,6,7,8,8,8,8,9,9,9,9,10,10,11,11,11,11,12,12,13,13,13,13,14,14,14,15,15,16,16,17,17,17,18,18,19,19,19,19,20,20,21,21,21,22,22,23,23,23,24,24,25,25,26,26,27,27,27,28,28,29,29,29,30,30,31,31,32,32,33,34,34,35,35,35,36,36,36,37,37,38,38,39,39,40,40,41,42,43,44,45,46]\",\"movementRatio\":4,\"movementAvailable\":4,\"movementPosition\":\"Walk\",\"situationalMod\":0,\"attributeDefenseMod\":6,\"meleeDefenseMod\":0,\"missileDefenseMod\":0,\"meleeAttackMod\":0,\"missileAttackMod\":0,\"attributeMeleeAttackMod\":6,\"meleeDamageMod\":1,\"attributeMissileAttackMod\":6,\"attributeCastingMod\":-20,\"spellLearningMod\":-5,\"statureCheckMod\":0,\"strengthCheckMod\":0,\"coordinationCheckMod\":0,\"healthCheckMod\":0,\"beautyCheckMod\":0,\"intellectCheckMod\":0,\"reasonCheckMod\":0,\"creativityCheckMod\":0,\"presenceCheckMod\":0,\"willpowerCheckMod\":0,\"evocationCheckMod\":0,\"perceptionCheckMod\":0,\"systemStrengthCheckMod\":0,\"fitnessCheckMod\":0,\"statusEffects\":{},\"initiative\":17,\"initiativeRoll\":2,\"situationalInitBonus\":0,\"movementRatioInitBonus\":5,\"attributeInitBonus\":0,\"senseInitBonus\":4,\"fomInitBonus\":0,\"firstActionInitBonus\":6,\"spentInitiative\":0,\"actionTempo\":-12,\"ready\":true,\"action\":{\"name\":\"Attack\",\"getTargets\":\"getSingleTarget\",\"triggeredMethod\":\"startAttackAction\",\"modifiers\":[],\"initBonus\":6},\"defensesThisRound\":0,\"dodgedThisRound\":false,\"meleeThisRound\":false,\"fatigueLevel\":0,\"roundsRest\":0,\"roundsExertion\":0,\"damagedThisRound\":false,\"skills\":{},\"weaponSkills\":{}}}";
    var command = '{"type":"character","who":"Thaddeus Clinch","triggeredFunction":"startAttackAction","input":{}}'; 

    // state.MML.GM = JSON.parse(GM);
    // state.MML.players = JSON.parse(players);
    // state.MML.characters = JSON.parse(characters);
    //MML.processCommand(JSON.parse(command));
    // MML.processCommand({
	   //      type: "character",
	   //      who: "Thaddeus Clinch",
	   //      triggeredFunction: "updateCharacter",
	   //      input: {
	   //      	attribute: "weaponSkills"
	   //      }
	   //  });
};

// Menu Macro = !{"type":"player","who":"Robot","triggeredFunction":"menuCommand","input":{"who":"GM","buttonText":"GmMenuMain"}}
// Character Functions
MML.getCharFromName = function getCharFromName(charName){
    var character = findObjs({
        _type: "character",
        archived: false,
        name: charName
    }, {caseInsensitive: false});
    
    return character[0];
};

// Attribute and Ability Functions
MML.createAttribute = function createAttribute(name, current, max, character){
    createObj("attribute", {
            name: name,
            current: current,
            max: max,
            characterid: character.id
        });
};

MML.createAttributesFromArray = function createAttributesFromArray(inputArray, character){
    _.each(inputArray, function(attribute){
        MML.createAttribute(attribute.name, attribute.current, attribute.max, character);
    });
};

MML.createAbility = function createAbility(name, action, istokenaction, character){
    createObj("ability", {
            name: name,
            action: action,
            istokenaction: istokenaction,
            characterid: character.id
        });
};

MML.getCharAttribute = function getCharAttribute(charName, attribute){
    var character = MML.getCharFromName(charName);
    
    var charAttribute = findObjs({
        _type: "attribute",
        _characterid: character.get("_id"),
        name: attribute
    }, {caseInsensitive: false})[0];
    
    if(typeof(charAttribute) === "undefined"){
        MML.createAttribute(attribute, "", "", MML.getCharFromName(charName));
        charAttribute = MML.getCharAttribute(charName, attribute);
    }

    return charAttribute;
};

MML.getCurrentAttribute = function getCurrentAttribute(charName, attribute){
    return MML.getCharAttribute(charName, attribute).get("current");
};

MML.getCurrentAttributeAsFloat = function getCurrentAttributeAsFloat(charName, attribute){
    var result = parseFloat(MML.getCurrentAttribute(charName, attribute));
    // log(result);
    if(isNaN(result)){
        MML.setCurrentAttribute(charName, attribute, 0);
        result = 0;
    }

    return result;
};

MML.getMaxAttributeAsFloat = function getMaxAttributeAsFloat(charName, attribute){
    var result =  parseFloat(MML.getCharAttribute(charName, attribute).get("max"));

    if(isNaN(result)){
        MML.setMaxAttribute(charName, attribute, 0);
        result = 0;
    }

    return result;
};

MML.getCurrentAttributeAsBool = function getCurrentAttributeAsBool(charName, attribute){
    var result = MML.getCurrentAttribute(charName, attribute);
    if(result === "true"){ return true; }
    else{ return false; }
};

MML.getCurrentAttributeJSON = function getCurrentAttributeJSON(charName, attribute){
    var result = MML.getCurrentAttribute(charName, attribute);

    if(result === "" || isNaN(result) || _.isUndefined(result)){
        MML.setCurrentAttribute(charName, attribute, "{}");
        result = MML.getCurrentAttribute(charName, attribute);
    }
    return JSON.parse(result);
};

MML.getSkillAttributes = function getSkillAttributes(charName, skillType){
    var character = MML.getCharFromName(charName);
    var attributes = findObjs({
        _type: "attribute",
        _characterid: character.get("_id")
    }, {caseInsensitive: false});
    var skills = {};
    var skill_data = {};
    
    _.each(attributes, function(attribute){
        var attributeName = attribute.get("name");

        if(attributeName.indexOf("repeating_" + skillType) !== -1){
            var attributeString = attributeName.split("_");
            var _id = attributeString[2];
            var property = attributeString[3];
            var value = attribute.get("current");
            _.each(skills, function(skill, key){
                if(key.toLowerCase() === _id){
                    _id = key;
                }
            });
            if(_.isUndefined(skill_data[_id])){
                skill_data[_id] = {name: "", input: 0, level: 0};
            }
            if(property === "name"){
                skill_data[_id][property] = value;
            }
            else if(isNaN(parseFloat(value))){
                skill_data[_id][property] = 0;
            }
            else{
                skill_data[_id][property] = parseFloat(value);
            }
        }
    });
    _.each(skill_data, function(skill, _id){
        if(skill.name !== ""){
            skills[skill.name] = {
                level: skill.level,
                input: skill.input,
                _id: _id
            }
        }
    });
    return skills;
};

MML.setCurrentAttribute = function setCurrentAttribute(charName, attribute, value){
    MML.getCharAttribute(charName, attribute).set("current", value);
};

MML.setMaxAttribute = function setMaxAttribute(charName, attribute, value){
    MML.getCharAttribute(charName, attribute).set("max", value);
};

MML.getAttributeTableValue = function getAttributeTableValue(attribute, inputValue, table){
    return table[inputValue][attribute];
};

// Token Functions
MML.getCharFromToken = function getCharFromToken(token){
    var tokenObject = getObj("graphic", token.id);
    var charName = getObj("character", tokenObject.get("represents"));
    charName = charName.get("name");
    return charName;
};

MML.getTokenFromChar = function getTokenFromChar(charName){
    var character = MML.getCharFromName(charName);
    
    var tokens = findObjs({                              
        _pageid: Campaign().get("playerpageid"),                              
        _type: "graphic",
        _subtype: "token",
        represents: character.get("_id")
        });
    
    return tokens[0];
};

MML.getSelectedTokens = function getSelectedTokens(selected){
    tokens = [];
    
    var index;
    for(index in selected){
        tokens.push(getObj("graphic", selected[index]._id));
    }
    return tokens;
};

MML.getSelectedCharNames = function getSelectedCharNames(selected){
    characters = [];
    
    var index;
    for(index in selected){
        characters.push(MML.getCharFromToken(getObj("graphic", selected[index]._id)));
    }
    return characters;
};

MML.getDistance = function getDistance(left1, left2, top1, top2){
    var pixelPerFoot = 14;
    var leftDistance = Math.abs(left2 - left1);
    var topDistance = Math.abs(top2 - top1);
    var distance = Math.sqrt(leftDistance*leftDistance + topDistance*topDistance)/pixelPerFoot;
    distance = Math.floor(distance + 0.5);
    return distance;
};

MML.getDistanceBetweenChars = function getDistanceBetweenChars(charName, targetName){
    var charToken = MML.getTokenFromChar(charName);
    var targetToken = MML.getTokenFromChar(targetName);
    
    return MML.getDistance(charToken.get("left"), targetToken.get("left"), charToken.get("top"), targetToken.get("top")); 
};

// Code borrowed from The Aaron from roll20.net forums
var generateUUID = (function() {
    "use strict";

    var a = 0, b = [];
    return function() {
        var c = (new Date()).getTime() + 0, d = c === a;
        a = c;
        for (var e = new Array(8), f = 7; 0 <= f; f--) {
            e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
            c = Math.floor(c / 64);
        }
        c = e.join("");
        if (d) {
            for (f = 11; 0 <= f && 63 === b[f]; f--) {
                b[f] = 0;
            }
            b[f]++;
        } else {
            for (f = 0; 12 > f; f++) {
                b[f] = Math.floor(64 * Math.random());
            }
        }
        for (f = 0; 12 > f; f++){
            c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
        }
        return c;
    };
}()),

generateRowID = function () {
    "use strict";
    return generateUUID().replace(/_/g, "Z");
};

// Rolling Functions
MML.rollDice = function rollDice(amount, size) {
    var value = 0;
    
    for (i = 0; i < amount; i++){
        value += randomInteger(size);
    }
    return value;
};

MML.rollDamage = function rollDamage(diceString, mods, crit, type){
    var diceArray = diceString.split("d");
    var amount = diceArray[0]*1;
    var size = diceArray[1]*1;
    var damageMod = 0;
    var roll = {};
    
    var mod;
    for(mod in mods){
        damageMod += mods[mod];
    }
    
    if(crit === "Critical Success"){
        roll = { name: "damage", value: -(MML.rollDice(amount, size) + amount*size + damageMod), type: type, range: "" + ((amount*size) + amount + damageMod) + "-" + (2*amount*size + damageMod) + "", accepted: false };
    }
    else{
        roll = { name: "damage", value: -(MML.rollDice(amount, size) + damageMod), type: type, range: "" + amount + "-" + (amount*size + damageMod) + "", accepted: false };
    }
    return roll;
};

MML.universalRoll = function universalRoll(mods){
    var target = 0;

    var mod;
    for(mod in mods){
        target += mods[mod];
    }
    
    var roll = { name: "universal", player: this.player, value: MML.rollDice(1, 100), range: "1-100", target: target, result: "", accepted: false };
    
    roll = MML.universalRollResult(roll);
    
    return roll;
};

MML.universalRollResult = function universalRollResult(roll){       
    if (roll.value > 94){
        roll.result = "Critical Failure";
    }
    else {
        if (roll.value <= roll.target){
            if (roll.value <= Math.round(roll.target/10)){
                roll.result = "Critical Success";
            }
            else {
                roll.result = "Success";
            }
        }
        else {
            roll.result = "Failure";
        }
    }
    
    return roll;
};

MML.attributeCheckRoll = function attributeCheckRoll(attribute, mods){
    var target = this[attribute];
    
    var mod;
    for(mod in mods){
        target += mods[mod];
    }
    
    var roll = { name: "attribute", player: this.player, value: MML.rollDice(1, 20), range: "1-20", target: target, result: "", accepted: false };
    
    roll = MML.attributeCheckResult(roll);
    log(attribute + ": " +roll.result);
    return roll;
};

MML.attributeCheckResult = function attributeCheckResult(roll){       
    if ((roll.value <= roll.target || roll.value === 1) && (roll.value !== 20)){
        roll.result = "Success";        
    }
    else {
        roll.result = "Failure";
    }
    return roll;
};

MML.displayGmRoll = function displayGmRoll(input){
    sendChat(this.name, '/w "' + this.name + '" &{template:rollMenu} {{title=' + this.currentRoll.message + "}}");
    // if(this.currentRoll.name === "damage"){
    //     sendChat(this.name, '/w "' + this.player + '" &{template:damage} {{title=' + this.currentRoll.title + "}} {{value=" + this.currentRoll.value + "}} {{type=" + this.currentRoll.type + "}} {{range=" + this.currentRoll.range + "}} ");
    // }
    // else if(this.currentRoll.name === "universal" || this.currentRoll.name === "attribute"){
    //     sendChat(this.name, '/w "' + this.player + '" &{template:universal} {{title=' + this.currentRoll.title + "}} {{result=" + this.currentRoll.result + "}} {{target=" + this.currentRoll.target + "}} {{range=" + this.currentRoll.range + "}} {{value=" + this.currentRoll.value + "}} ");
    // }
    // else if(this.currentRoll.name === "hitPosition"){
    //     sendChat(this.name, '/w "' + this.player + '" &{template:hitPosition} {{title=' + this.currentRoll.title + "}} {{result=" + this.currentRoll.result + "}} {{range=" + this.currentRoll.range + "}} {{value=" + this.currentRoll.value + "}} ");
    // }
    
};

//Menu Functions
MML.displayMenu = function displayMenu(input){
    var toChat = '/w "' + this.name + '" &{template:charMenu} {{name=' + this.message + '}} ';

    _.each(this.buttons, function(button){
        var noSpace = button.text.replace(/\s+/g, '');
        var command = JSON.stringify({
                type: "player",
                who: this.name,
                input: {
                    who: this.who,
                    buttonText: button.text
                },
                triggeredFunction: "menuCommand"
            });

        // JSON strings screw up Command Buttons, convert to hex
        var hex, i;
        var result = "";
        for (i=0; i<command.length; i++){
            result += ("000"+command.charCodeAt(i).toString(16)).slice(-4);
        }

        
        toChat = toChat + '{{' + noSpace + '=[' + button.text + '](!' + result + ')}} ';
    }, this);
    sendChat(this.name, toChat, null, {noarchive: false}); //Change to true this when they fix the bug
};

// MML.displayMenu = function displayMenu(){
//     var toChat = '/w "' + this.name + '" &{template:charMenu} {{name=' + this.message + '}} ';
//     _.each(this.buttons, function(button){
//         var noSpace = button.text.replace(/\s+/g, '');
//         toChat = toChat + '{{' + noSpace + '=[' + button.text + '](!menu ' +  button.text + ')}} ';
//     }, this);
//     sendChat(this.name, toChat, null, {noarchive: false}); //Change to true this when they fix the bug
// };

// NEEDS WORK. Attacks from above and below need to be added. Use arrays instead of switches on the hit positions for cleaner code
MML.rollHitPosition = function rollHitPosition(){
    var position;
    var defender = state.MML.GM.characters[this.action.targets[0]];
      
    switch(this.action.calledShot){            
        
        case "head":
            positionArray = [1, 2, 3, 4, 5, 6, 7];
            position = positionArray[MML.rollDice(1, 7) - 1];
            break;
        case "chest":
            positionArray = [9, 10, 11, 12, 15, 16, 17, 18];
            position = positionArray[MML.rollDice(1, 8) - 1];
            break;
        case "abdomen":
            positionArray = [21, 22, 23, 24, 27, 28, 29, 30, 33];
            position = positionArray[MML.rollDice(1, 9) - 1];
            break;
        case "leftArm":
            positionArray = [13, 19, 25, 31, 34];
            position = positionArray[MML.rollDice(1, 5) - 1];
            break;
        case "rightArm":
            positionArray = [8, 14, 20, 26, 32];
            position = positionArray[MML.rollDice(1, 5) - 1];
            break;  
        case "leftLeg":
            positionArray = [36, 38, 40, 42, 44, 46];
            position = positionArray[MML.rollDice(1, 6) - 1];
            break;  
        case "rightLeg":
            positionArray = [35, 37, 39, 41, 43, 45];
            position = positionArray[MML.rollDice(1, 6) - 1];
            break;  
        default: // Use this for targeting specific hit positions
            position = this.action.calledShot;
            break;
    }
    
    // Deal with elevation here
    return { name: "hitPosition", range: "1-46",  result: MML.hitPositions[position].name, value: position };

};