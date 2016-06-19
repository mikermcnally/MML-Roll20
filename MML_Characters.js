/* jshint -W069 */
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

    if(_.has(this.statusEffects, "Stumbling")){
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
                character: this.name,
                name: "initiative",
                value: rollValue,
                rollResultFunction: "initiativeResult",
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
    var currentRoll = state.MML.players[this.player].currentRoll;

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

    if(this.player === state.MML.GM.player){
        if(currentRoll.accepted === false){
            MML.processCommand({
                type: "player",
                who: this.player,
                triggeredFunction: "displayGmRoll",
                input: {
                    currentRoll: currentRoll
                }
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
            who: this.player,
            triggeredFunction: "displayPlayerRoll",
            input: {
                    currentRoll: currentRoll
                }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "initiativeApply",
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

MML.startAction = function startAction(input){
    state.MML.GM.currentAction = {
        who: this.name
    };

    if(!_.isUndefined(this.action.getTargets)){
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: this.action.getTargets,
            input: {}
        });
    }
    else{
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: this.action.triggeredFunction,
            input: {}
        });
    }
};

MML.startAttackAction = function startAttackAction(input){
    if(_.has(this.statusEffects, "Called Shot")){
        MML.processCommand({
            type: "player",
            who: this.player,
            triggeredFunction: "charMenuSelectBodyPart",
            input: {
                who: this.name,
            }
        });
        MML.processCommand({
            type: "player",
            who: this.player,
            triggeredFunction: "displayMenu",
            input: {}
        });
    }
    else if(_.has(this.statusEffects, "Called Shot Specific")){
        MML.processCommand({
            type: "player",
            who: this.player,
            triggeredFunction: "charMenuSelectHitPosition",
            input: {
                who: this.name,
            }
        });
        MML.processCommand({
            type: "player",
            who: this.player,
            triggeredFunction: "displayMenu",
            input: {}
        });
    }
    else if(_.contains(this.action.modifiers, ["Aim"])){
        if(_.has(this.statusEffects, "Taking Aim")){
            this.statusEffects["Taking Aim"].level++;
        }
        else{
            this.statusEffects["Taking Aim"] = { name: "Taking Aim", level: 1, target: input.target };
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

    if(MML.isUnarmed(this)){
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "unarmedAttack",
            input: {}
        });
    }
    else if(MML.isDualWielding(this)){
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "dualWieldAttack",
            input: {}
        });
    }
    else if (MML.getWeaponFamily(this, "leftHand") === "MWD" || MML.getWeaponFamily(this, "leftHand") === "MWM"){
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "missileAttack",
            input: {}
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
            input: {}
        });
    }
    else {
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "meleeAttack",
            input: {}
        });
    }
};

MML.meleeAttack = function meleeAttack(input){
    var itemId;
    var grip;

    if(MML.getWeaponFamily(this, "rightHand") !== "unarmed"){
        itemId = this.rightHand._id;
        grip = this.rightHand.grip;
    }
    else{
        itemId = this.leftHand._id;
        grip = this.leftHand.grip;
    }

    var attackerWeapon = this.inventory[itemId];

    var currentAction = {
        attackerWeapon: attackerWeapon,
        attackerGrip: grip,
        skill: MML.getWeaponSkill(this, attackerWeapon),
        attackMod: this.meleeAttackMod + this.attributeMeleeAttackMod,
        sitMod: this.situationalMod
    };

    state.MML.GM.currentAction = _.extend(state.MML.GM.currentAction, currentAction);

    if(attackerWeapon.grips[grip].secondaryType !== ""){
        MML.processCommand({
            type: "player",
            who: this.player,
            triggeredFunction: "charMenuSelectDamageType",
            input: {
                who: this.name
            }
        });

        MML.processCommand({
            type: "player",
            who: this.player,
            triggeredFunction: "displayMenu",
            input: {}
        });
    }
    else{
        state.MML.GM.currentAction.weaponType = "primary";

        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "meleeAttackRoll",
            input: {}
        });
    }
};

MML.meleeAttackRoll = function meleeAttackRoll(character,task, skill, sitMod, attackMod){
    // var action = state.MML.GM.currentAction;
    // var mods;
    // if (action.weaponType === "primary"){
    //     mods = [action.attackerWeapon.grips[action.attackerGrip].primaryTask, action.skill, action.sitMod, action.attackMod];
    // }
    // else{
    //     mods = [action.attackerWeapon.grips[action.attackerGrip].secondaryTask, action.skill, action.sitMod, action.attackMod];
    // }

    MML.processCommand({
        type: "character",
        who: character.name,
        triggeredFunction: "universalRoll",
        input: {
            rollResultFunction: "attackRollResult",
            mods: [task, skill, sitMod, attackMod]
        }
    });
};

MML.attackRollResult = function attackRollResult(input){
    var currentRoll = state.MML.players[this.player].currentRoll;

    if(this.player === state.MML.GM.player){
        if(currentRoll.accepted === false){
            MML.processCommand({
                type: "player",
                who: this.player,
                triggeredFunction: "displayGmRoll",
                input: {
                    currentRoll: currentRoll
                }
            });
        }
        else{
            if(_.contains(this.action.modifiers, ["Called Shot Specific"]) && currentRoll.value - currentRoll.target < 11){
                this.action.modifiers = _.without(this.action.modifiers, 'Called Shot Specific');
                this.action.modifiers.push("Called Shot");
                currentRoll.result = "Success";
            }
            MML.processCommand({
                type: "character",
                who: this.name,
                triggeredFunction: "attackRollApply",
                input: currentRoll
            });
        }
    }
    else{
        MML.processCommand({
            type: "player",
            who: this.player,
            triggeredFunction: "displayPlayerRoll",
            input: {
                currentRoll: currentRoll
            }
        });
        if(_.contains(this.action.modifiers, ["Called Shot Specific"]) && currentRoll.value - currentRoll.target < 11){
            this.action.modifiers = _.without(this.action.modifiers, 'Called Shot Specific');
            this.action.modifiers.push("Called Shot");
            currentRoll.result = "Success";
        }
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "attackRollApply",
            input: currentRoll
        });
    }
};

MML.attackRollApply = function attackRollApply(input){
    var result = input.result;
    state.MML.GM.currentAction.attackRollResult = result;
    var action = state.MML.GM.currentAction;

    if(result === "Critical Success" || result === "Success"){
        MML.processCommand({
            type: "character",
            who: action.targetArray[action.targetIndex],
            triggeredFunction: "meleeDefense",
            input: {
                attackerWeapon: action.attackerWeapon,
                attackerGrip: action.attackerGrip
            }
        });
    }
    else if(result === "Critical Failure"){
        MML.processCommand({
            type: "GM",
            triggeredFunction: "attackCriticalFailure",
            input: action
        });
    }
    else{
        MML.processCommand({
            type: "player",
            who: this.player,
            triggeredFunction: "endAction",
            input: action
        });
    }
};

MML.hitPositionRoll = function hitPositionRoll(input){
    var rollValue;
    var range;
    var result;
    var action = state.MML.GM.currentAction;
    var target = state.MML.characters[action.targetArray[action.targetIndex]];

    if (_.has(this.statusEffects, "Called Shot Specific")){
        rollValue = +_.findKey(MML.hitPositions[target.bodyType], function(hitPosition){ return hitPosition.name === action.calledShot; });
        range = rollValue + "-" + rollValue;
        result = MML.hitPositions[target.bodyType][rollValue];
    }
    else if (_.has(this.statusEffects, "Called Shot")){
        var rangeUpper = MML.getAvailableHitPositions(target, action.calledShot).length;
        rollValue = MML.rollDice(1, rangeUpper);
        range = "1-" + rangeUpper;
        result = MML.getCalledShotHitPosition(target, rollValue, action.calledShot);
    }
    else {
        range = "1-" + _.keys(MML.hitPositions[target.bodyType]).length;
        result = MML.getHitPosition(target, MML.rollDice(1, 100));
        rollValue = +_.findKey(MML.hitPositions[target.bodyType], function(hitPosition){ return hitPosition.name === result.name; });
    }

    MML.processCommand({
        type: "player",
        who: this.player,
        triggeredFunction: "setApiPlayerAttribute",
        input: {
            attribute: "currentRoll",
            value: {
                type: "hitPosition",
                character: this.name,
                player: this.player,
                rollResultFunction: "hitPositionRollResult",
                range: range,
                result: result,
                value: rollValue,
                accepted: false
            }
        }
    });

    MML.processCommand({
        type: "character",
        who: this.name,
        triggeredFunction: "hitPositionRollResult",
        input: {}
    });
};

MML.hitPositionRollResult = function hitPositionRollResult(input){
    var currentRoll = state.MML.players[this.player].currentRoll;
    var action = state.MML.GM.currentAction;
    var target = state.MML.characters[action.targetArray[action.targetIndex]];

    if (_.has(this.statusEffects, "Called Shot")){
        currentRoll.result = MML.getCalledShotHitPosition(target, currentRoll.value, action.calledShot);
    }
    else {
        currentRoll.result = MML.hitPositions[target.bodyType][currentRoll.value];
    }

    currentRoll.message = "Roll: " + currentRoll.value +
                        "\nResult: " + currentRoll.result.name +
                        "\nRange: " + currentRoll.range;

    if(this.player === state.MML.GM.player){
        if(currentRoll.accepted === false){
            MML.processCommand({
                type: "player",
                who: this.player,
                triggeredFunction: "displayGmRoll",
                input: {
                    currentRoll: currentRoll
                }
            });
        }
        else{
            MML.processCommand({
                type: "character",
                who: this.name,
                triggeredFunction: "hitPositionRollApply",
                input: currentRoll
            });
        }
    }
    else{
        MML.processCommand({
            type: "player",
            who: this.player,
            triggeredFunction: "displayPlayerRoll",
            input: {
                currentRoll: currentRoll
            }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "hitPositionRollApply",
            input: {
                result: currentRoll.result
            }
        });
    }
};

MML.hitPositionRollApply = function hitPositionRollApply(input){
    state.MML.GM.currentAction.hitPosition = input.result;

    MML.processCommand({
        type: "character",
        who: this.name,
        triggeredFunction: input.triggeredFunction,
        input: {}
    });
};

MML.meleeDefense = function meleeDefense(input){
    var weaponId;
    var shieldId;
    var grip;
    var skill;
    var defenderWeapon;
    var dodgeChance;
    var blockChance;
    var defaultMartialSkill = this.weaponSkills["Default Martial"].level;
    var shieldMod = MML.getShieldDefenseBonus(this);
    var defenseMod = this.meleeDefenseMod + this.attributeDefenseMod;
    var sitMod = this.situationalMod;

    this.statusEffects["Melee This Round"] = {};

    if(!_.isUndefined(this.skills["Dodge"]) && this.skills["Dodge"].level >= defaultMartialSkill){
        dodgeChance = this.weaponSkills["Dodge"].level + defenseMod + sitMod;
    }
    else{
        dodgeChance = defaultMartialSkill + defenseMod + sitMod;
    }

    if(input.attackerWeapon.grips[input.attackerGrip].initiative < 6){
        dodgeChance += 15;
    }

    if(MML.isDualWielding(this)){
        log("Dual Wield defense");
    }
    else if(MML.isUnarmed(this) || MML.isWieldingRangedWeapon(this)){
        blockChance = 0;
    }
    else if(MML.getWeaponFamily(this, "rightHand") !== "unarmed"){
        itemId = this.rightHand._id;
        grip = this.rightHand.grip;
    }
    else{
        itemId = this.leftHand._id;
        grip = this.leftHand.grip;
    }

    defenderWeapon = this.inventory[itemId];
    defenderSkill = Math.round(MML.getWeaponSkill(this, defenderWeapon)/2);

    MML.processCommand({
        type: "player",
        who: this.player,
        triggeredFunction: "charMenuDefenseRoll",
        input: {
            defenderWeapon: defenderWeapon,
            defenderGrip: grip,
            defenderSkill: defenderSkill,
            who: this.name,
            dodgeChance: dodgeChance,
            blockChance: defenderWeapon.grips[grip].defense + defaultMartialSkill + sitMod + defenseMod + shieldMod
        }
    });
    MML.processCommand({
        type: "player",
        who: this.player,
        triggeredFunction: "displayMenu",
        input: {}
    });
};

MML.meleeBlockRoll = function meleeBlockRoll(input){
    MML.processCommand({
        type: "character",
        who: this.name,
        triggeredFunction: "universalRoll",
        input: {
            rollResultFunction: "meleeBlockRollResult",
            mods: [input.blockChance]
        }
    });
};

MML.meleeBlockRollResult = function meleeBlockRollResult(input){
    var currentRoll = state.MML.players[this.player].currentRoll;

    if(this.player === state.MML.GM.player){
        if(currentRoll.accepted === false){
            MML.processCommand({
                type: "player",
                who: this.player,
                triggeredFunction: "displayGmRoll",
                input: {
                    currentRoll: currentRoll
                }
            });
        }
        else{
            MML.processCommand({
                type: "character",
                who: this.name,
                triggeredFunction: "meleeBlockRollApply",
                input: currentRoll
            });
        }
    }
    else{
        MML.processCommand({
            type: "player",
            who: this.player,
            triggeredFunction: "displayPlayerRoll",
            input: {
                currentRoll: currentRoll
            }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "meleeBlockRollApply",
            input: currentRoll
        });
    }
};

MML.meleeBlockRollApply = function meleeBlockRollApply(input){
    // log("meleeBlockRollApply");
    // log(input);
    var result = input.result;
    state.MML.GM.currentAction.defenseRollResult = result;
    var action = state.MML.GM.currentAction;

    if(result === "Critical Success" || result === "Success"){
        if(result === "Success"){
           if(_.has("Number of Defenses")){
                this.statusEffects["Number of Defenses"].number++;
            }
            else{
                this.statusEffects["Number of Defenses"] = { number: 1 };
            }

            if(action.attackRollResult === "Critical Success"){
                MML.processCommand({
                    type: "character",
                    who: this.name,
                    triggeredFunction: "equipmentFailure",
                    input: {}
                });
            }
        }

        MML.processCommand({
            type: "character",
            who: action.who,
            triggeredFunction: "endAction",
            input: {}
        });
    }
    else{
        MML.processCommand({
            type: "character",
            who: action.who,
            triggeredFunction: "hitPositionRoll",
            input: {}
        });
    }
};

MML.meleeDodgeRoll = function meleeDodgeRoll(input){
    MML.processCommand({
        type: "character",
        who: this.name,
        triggeredFunction: "universalRoll",
        input: {
            rollResultFunction: "meleeDodgeRollResult",
            mods: [input.dodgeChance]
        }
    });
};

MML.equipmentFailure = function equipmentFailure(input){
    log("equipmentFailure");
};

MML.meleeDamageRoll = function meleeDamageRoll(input){
    var action = state.MML.GM.currentAction;
    var weapon = action.attackerWeapon;
    var weaponDamage;
    var damageType;
    var bonusDamage = 0;

    //Primary or secondary attack
    if (action.weaponType === "primary"){
        weaponDamage = weapon.grips[action.attackerGrip].primaryDamage;
        damageType = weapon.grips[action.attackerGrip].primaryType;
    }
    else {
        weaponDamage = weapon.grips[action.attackerGrip].secondaryDamage;
        damageType = weapon.grips[action.attackerGrip].secondaryType;
    }

    MML.processCommand({
        type: "character",
        who: this.name,
        triggeredFunction: "rollDamage",
        input: {
            rollResultFunction: "meleeDamageResult",
            attackRollResult: action.attackRollResult,
            weaponDamage: weaponDamage,
            damageType: damageType,
            mods: [this.meleeDamageMod, bonusDamage]
        }
    });
};

MML.meleeDamageResult = function meleeDamageResult(input){
    var currentRoll = state.MML.players[this.player].currentRoll;

    if(this.player === state.MML.GM.player){
        if(currentRoll.accepted === false){
            MML.processCommand({
                type: "player",
                who: this.player,
                triggeredFunction: "displayGmRoll",
                input: {
                    currentRoll: currentRoll
                }
            });
        }
        else{
            MML.processCommand({
                type: "character",
                who: this.name,
                triggeredFunction: "meleeDamageRollApply",
                input: currentRoll
            });
        }
    }
    else{
        MML.processCommand({
            type: "player",
            who: this.player,
            triggeredFunction: "displayPlayerRoll",
            input: {
                currentRoll: currentRoll
            }
        });
        MML.processCommand({
            type: "character",
            who: this.name,
            triggeredFunction: "meleeDamageRollApply",
            input: currentRoll
        });
    }
};

MML.meleeDamageRollApply = function meleeDamageRollApply(input){

};

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

//  //var position = MML.rollHitPosition(state.MML.characters[charName].action.elevation, defender, target);
//  state.MML.Combat.turnInfo.currentRoll = this.universalRoll([task, skill, attackerSitMod, attackMod]);

// };

MML.unarmedAttack = function unarmedAttack(charName){};

MML.readyItemAction = function readyItemAction(charName){};

MML.castSpellAction = function castSpellAction(charName){};

MML.observeAction = function observeAction(charName){};
