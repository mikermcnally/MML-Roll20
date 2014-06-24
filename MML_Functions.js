MML.createAttribute = function createAttribute(name, current, max, character){
    createObj("attribute", {
            name: name,
            current: current,
            max: max,
            characterid: character.id
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

MML.createAttributesFromArray = function createAttributesFromArray(inputArray, character){
    for (var index in inputArray) {
        MML.createAttribute(inputArray[index].name, inputArray[index].current, inputArray[index].max, character);
    }
};

MML.getCharFromName = function getCharFromName(charName){
    var character = findObjs({
        _type: "character",
        archived: false,
        name: charName
    }, {caseInsensitive: false});
    
    return character;
};

MML.getCharAttribute = function getCharAttribute(charName, attribute){
    var character = MML.getCharFromName(charName);
    
    var charAttribute = findObjs({
        _type: "attribute",
        _characterid: character[0].get("_id"),
        name: attribute
    }, {caseInsensitive: false});
    
    return charAttribute[0];
};

MML.getAttributesFromArray = function getAttributesFromArray(inputArray, character){
    var outputArray = [];    
    for (var index in inputArray) {
        var attribute =  MML.getCharAttribute(character, inputArray[index].name);
        outputArray[attribute.get("name")] = attribute;
    }
    return outputArray;
};

MML.setAttributeFromTable = function setAttributeFromTable(attributeArray, attributeProperty, tablePropertyArray, inputValue, table){
    for (i = 0; i < attributeArray.length; i++ ){
        attributeArray[i].set(attributeProperty, table[inputValue][tablePropertyArray[i]]);
    }
};

MML.createAPVAttributes = function createAPVAttributes(character){
    apvArray = [];
	for (var index in MML.hitPositions) {
        apvArray.push({ name: index + " Surface" , current: 0, max: 0 });
		apvArray.push({ name: index + " Cut" , current: 0, max: 0 });
		apvArray.push({ name: index + " Chop" , current: 0, max: 0 });
		apvArray.push({ name: index + " Pierce" , current: 0, max: 0 });
		apvArray.push({ name: index + " Thrust" , current: 0, max: 0 });
		apvArray.push({ name: index + " Impact" , current: 0, max: 0 });
		apvArray.push({ name: index + " Flanged" , current: 0, max: 0 });
    }
	
	MML.createAttributesFromArray(apvArray, character);
}

MML.getAttributeAsInt = function getAttributeAsInt(charName, attribute){
    result = MML.getCharAttribute(charName, attribute).get("current")*1;
    return result;
};

MML.equipmentStringToArray = function equipmentStringToArray(equipment){
    equipmentArray = equipment.split("; ");
    
    for (var item in equipmentArray){
        equipmentArray[item] = equipmentArray[item].split(":");
    }
    
    return equipmentArray;
};

MML.initChar = function initChar(character){
    primary = MML.getAttributesFromArray(MML.primaryAttributes, character);
    secondary = MML.getAttributesFromArray(MML.secondaryAttributes, character);
    hitPoints = MML.getAttributesFromArray(MML.hitPoints, character);
    movement = MML.getAttributesFromArray(MML.movement, character);
    skills = MML.getAttributesFromArray(MML.skills, character);
    
    MML.setStature(character);
    stature = primary["Stature"].get("current")*1;
    strength = primary["Strength"].get("current")*1;
    coordination = primary["Coordination"].get("current")*1;
    health = primary["Health"].get("current")*1;
    beauty = primary["Beauty"].get("current")*1;
    intellect = primary["Intellect"].get("current")*1;
    reason = primary["Reason"].get("current")*1;
    creativity = primary["Creativity"].get("current")*1;
    presence = primary["Presence"].get("current")*1;
    
    willpower = Math.round((2*presence + health)/3);
    secondary["Willpower"].set("current", willpower);
    
    evocation = Math.round(health + intellect + reason + creativity + willpower);
    secondary["Evocation"].set("current", evocation);
    
    perception = Math.round((intellect + reason + creativity)/3);
    secondary["Perception"].set("current", perception);
    
    systemStrength = Math.round((presence + 2*health)/3);
    secondary["System Strength"].set("current", systemStrength);
    
    fitness = Math.round((health + strength)/2);
    secondary["Fitness"].set("current", fitness);
    
    MML.setAttributeFromTable([secondary["Fitness Modifier"]], "current", ["mod"], fitness, MML.fitnessModLookup);
    fitnessMod = secondary["Fitness Modifier"].get("current");
    
    load = Math.round(fitnessMod * stature);
    secondary["Load"].set("current", load);
    
    overhead =  Math.round(2 * fitnessMod * stature);
    secondary["Maximum Overhead Lift"].set("current", overhead);
    
    deadlift = Math.round(4 * fitnessMod * stature);
    secondary["Maximum Dead Lift"].set("current", deadlift);
    
    multipleWounds = Math.round((health + stature + willpower)/2);
    hitPoints["Multiple Wounds"].set("current", multipleWounds);
    hitPoints["Multiple Wounds"].set("max", multipleWounds);
    
    headHP = MML.setHP(character, MML.getCharAttribute(character, "Head HP"), Math.round(health + stature/3));
    chestHP = MML.setHP(character, MML.getCharAttribute(character, "Chest HP"), Math.round(health + stature + strength));
    abHP = MML.setHP(character, MML.getCharAttribute(character, "Abdomen HP"), Math.round(health + stature));
    laHP = MML.setHP(character, MML.getCharAttribute(character, "Left Arm HP"), Math.round(health + stature));
    raHP = MML.setHP(character, MML.getCharAttribute(character, "Right Arm HP"), Math.round(health + stature));
    llHP = MML.setHP(character, MML.getCharAttribute(character, "Left Leg HP"), Math.round(health + stature));
    rlHP = MML.setHP(character, MML.getCharAttribute(character, "Right Leg HP"), Math.round(health + stature));
		
    MML.SetAPVs(character);
   
};

MML.setStature = function setStature(character){
    stature = MML.getCharAttribute(character, "Stature");
    race = MML.getCharAttribute(character, "Race");
    gender = MML.getCharAttribute(character, "Gender");
    height = MML.getCharAttribute(character, "Height");
    weight = MML.getCharAttribute(character, "Weight");
    
    stature.set("max", stature.get("current"));
    
    if (race.get("current") === "Human"){ //Table 2B.5 page 45
        if (gender.get("current") === "Male"){
            MML.setAttributeFromTable([height, weight, stature], "current", ["height", "weight", "stature"], stature.get("max"), MML.statureTableHumanMale);
        }
        
        else if (gender.get("current") === "Female"){
            MML.setAttributeFromTable([height, weight, stature], "current", ["height", "weight", "stature"], stature.get("max"), MML.statureTableHumanFemale);
        }
    }
    
    else if (race.get("current") === "Dwarf"){ //Table 2B.1 page 43
        if (gender.get("current") === "Male"){
            MML.setAttributeFromTable([height, weight, stature], "current", ["height", "weight", "stature"], stature.get("max"), MML.statureTableDwarfMale);
        }
        
        else if (gender.get("current") === "Female"){
            MML.setAttributeFromTable([height, weight, stature], "current", ["height", "weight", "stature"], stature.get("max"), MML.statureTableDwarfFemale);
        }
    }
    
    else if (race.get("current") === "Gnome"){ //Table 2B.1 page 43
        if (gender.get("current") === "Male"){
            MML.setAttributeFromTable([height, weight, stature], "current", ["height", "weight", "stature"], stature.get("max"), MML.statureTableGnomeMale);
        }
        
        else if (gender.get("current") === "Female"){
            MML.setAttributeFromTable([height, weight, stature], "current", ["height", "weight", "stature"], stature.get("max"), MML.statureTableGnomeFemale);
        }
    }
    
    else if (race.get("current") === "Gray Elf"){ //Table 2B.1 page 43
        if (gender.get("current") === "Male"){
            MML.setAttributeFromTable([height, weight, stature], "current", ["height", "weight", "stature"], stature.get("max"), MML.statureTableGrayElfMale);
        }
        
        else if (gender.get("current") === "Female"){
            MML.setAttributeFromTable([height, weight, stature], "current", ["height", "weight", "stature"], stature.get("max"), MML.statureTableGrayElfFemale);
        }
    }
    
    else if (race.get("current") === "Hobbit"){ //Table 2B.1 page 43
        if (gender.get("current") === "Male"){
            MML.setAttributeFromTable([height, weight, stature], "current", ["height", "weight", "stature"], stature.get("max"), MML.statureTableHobbitMale);
        }
        
        else if (gender.get("current") === "Female"){
            MML.setAttributeFromTable([height, weight, stature], "current", ["height", "weight", "stature"], stature.get("max"), MML.statureTableHobbitFemale);
        }
    }
    
    else if (race.get("current") === "Wood Elf"){ //Table 2B.1 page 43
        if (gender.get("current") === "Male"){
            MML.setAttributeFromTable([height, weight, stature], "current", ["height", "weight", "stature"], stature.get("max"), MML.statureTableWoodElfMale);
        }
        
        else if (gender.get("current") === "Female"){
            MML.setAttributeFromTable([height, weight, stature], "current", ["height", "weight", "stature"], stature.get("max"), MML.statureTableWoodElfFemale);
        }
    }
    
};

MML.setHP = function setHP(character, bodyPart, inputValue){
    race = MML.getCharAttribute(character, "Race");
    
    if (race.get("current") === "Human"){ 
        MML.setAttributeFromTable([bodyPart], "current", ["hp"], inputValue, MML.HPTableHuman);
        MML.setAttributeFromTable([bodyPart], "max", ["hp"], inputValue, MML.HPTableHuman);
    }
    
    else if (race.get("current") === "Dwarf"){
         MML.setAttributeFromTable([bodyPart], "current",  ["hp"], inputValue, MML.HPTableDwarf);
         MML.setAttributeFromTable([bodyPart], "max",  ["hp"], inputValue, MML.HPTableDwarf);
    }
    
    else if (race.get("current") === "Gnome"){
         MML.setAttributeFromTable([bodyPart], "current",  ["hp"], inputValue, MML.HPTableGnome);
         MML.setAttributeFromTable([bodyPart], "max",  ["hp"], inputValue, MML.HPTableGnome);
    }
    
    else if (race.get("current") === "Gray Elf"){
         MML.setAttributeFromTable([bodyPart], "current", ["hp"], inputValue, MML.HPTableGrayElf);
         MML.setAttributeFromTable([bodyPart], "max", ["hp"], inputValue, MML.HPTableGrayElf);
    }
    
    else if (race.get("current") === "Hobbit"){
         MML.setAttributeFromTable([bodyPart], "current",  ["hp"], inputValue, MML.HPTableHobbit);
         MML.setAttributeFromTable([bodyPart], "max",  ["hp"], inputValue, MML.HPTableHobbit);
    }
    
    else if (race.get("current") === "Wood Elf"){
         MML.setAttributeFromTable([bodyPart], "current",  ["hp"], inputValue, MML.HPTableWoodElf);
         MML.setAttributeFromTable([bodyPart], "max",  ["hp"], inputValue, MML.HPTableWoodElf);
    }
};

MML.setEquipmentStats = function setEquipmentStats(charName){
    MML.SetAPVs(charName);
    MML.setMoveRatioAndKnockdown(charName);
    MML.setArmorInitiativeBonuses(charName);
    //spell casting adjustments
};

//needs shield support. Both stats intimately related, only one function needed
MML.setMoveRatioAndKnockdown = function setMoveRatioAndKnockdown(charName){
    moveRatio = MML.getCharAttribute(charName, "Movement Ratio");
    knockdown = MML.getCharAttribute(charName, "Knockdown");
    stature = MML.getAttributeAsInt(charName, "Stature");
    load = MML.getAttributeAsInt(charName, "Load");
    armorList = MML.equipmentStringToArray(MML.getCharAttribute(charName, "Equipped Armor").get("current"));
    weaponList = MML.equipmentStringToArray(MML.getCharAttribute(charName, "Equipped Weapons").get("current"));
    shield = MML.getCharAttribute(charName, "Equipped Shield").get("current");
    totalWeight = 0;
    
    if (armorList[0][0] !== "None"){       
        for (var piece in armorList){
            var style = armorList[piece][0];
            var material = armorList[piece][1];
            
            totalWeight += MML.armorStyleList[style].totalPostitions * MML.APVList[material].weightPerPosition;
        } 
    }
    
    if (weaponList[0][0] !== "None"){
        for (var weapon in weaponList){  
            totalWeight += MML.meleeWeaponStats[weaponList[weapon][0]].weight;
        }    
    }
        
    //totalWeight += MML.shieldStats[shield].weight;
    if (load/totalWeight > 4.0){
        moveRatio.set("current", 4.0);
    }
    else {
        moveRatio.set("current", Math.round(load/totalWeight*10)/10);
    }
    knockdown.set("current", Math.round(stature + (totalWeight/10)));
};

MML.SetAPVs = function SetAPVs(character){
    armorArray = MML.equipmentStringToArray(MML.getCharAttribute(character, "Equipped Armor").get("current"));
    mat = [];
    
    //Initialize APV Matrix: [Position [Damage Type [APVs [Value, Coverage]]]]
    for (i=0; i<46; i++){
        mat.push([ [[0, 100]], [[0, 100]], [[0, 100]], [[0, 100]], [[0, 100]], [[0, 100]], [[0, 100]] ]);
    }
    
	//Creates raw matrix of individual pieces of armor (no layering or partial coverage)
    if (armorArray[0][0] !== "None"){    
        for(var piece in armorArray){
            style = MML.armorStyleList[armorArray[piece][0]];
            material = MML.APVList[armorArray[piece][1]];
            
            for(var position in style.coverage){
                mat[style.coverage[position][0]-1][0].push([material.surface, style.coverage[position][1]]);
                mat[style.coverage[position][0]-1][1].push([material.cut, style.coverage[position][1]]);
                mat[style.coverage[position][0]-1][2].push([material.chop, style.coverage[position][1]]);
                mat[style.coverage[position][0]-1][3].push([material.pierce, style.coverage[position][1]]);
                mat[style.coverage[position][0]-1][4].push([material.thrust, style.coverage[position][1]]);
                mat[style.coverage[position][0]-1][5].push([material.impact, style.coverage[position][1]]);
                mat[style.coverage[position][0]-1][6].push([material.flanged, style.coverage[position][1]]);
            }
        }
    }
    
	//This loop accounts for layered armor and partial coverage and outputs final APVs
    for (var position in mat){
        for (var type in mat[position]){
            rawAPVArray = mat[position][type];
            apvFinalArray = [];
            coverageArray = [];
            
            //Creates an array of armor coverage in ascending order.
            for (var apv in rawAPVArray){
                if (coverageArray.indexOf(rawAPVArray[apv][1]) === -1){
                    coverageArray.push(rawAPVArray[apv][1]);
                }
            }
            coverageArray = coverageArray.sort(function(a,b){return a-b});
            
            //Creates APV array per damage type per position
            for (var value in coverageArray){
                apvToLayerArray = [];
                apvValue = 0;
                coverageValue = coverageArray[value];
                
                //Builds an array of APVs that meet or exceed the coverage value
                for (var apv in rawAPVArray){
                    if (rawAPVArray[apv][1] >= coverageValue){
                        apvToLayerArray.push(rawAPVArray[apv][0]);
                    }
                }
                apvToLayerArray = apvToLayerArray.sort(function(a,b){return b-a});
                
                //Adds the values at coverage value with diminishing returns on layered armor
                for (var value in apvToLayerArray){
                    apvValue += apvToLayerArray[value] * Math.pow(2, -value);
                    apvValue = Math.round(apvValue);
                }
                //Puts final APV and associated Coverage into final APV array for that damage type.
                apvFinalArray.push([apvValue, coverageValue]);
            }
            mat[position][type] = apvFinalArray;
        }
    }
    
	damageTypeArray = [" Surface", " Cut", " Chop", " Pierce", " Thrust", " Impact", " Flanged"];
	//APV attribute format "value,coverage;value,coverage"
	for (var position in mat){
		for (var type in damageTypeArray){
			attributeString = "";
			if (mat[position][type].length > 1){
				for (var apv in mat[position][type]){
					attributeString += mat[position][type][apv].toString() + ";";
				}
				attributeString = attributeString.slice(0, attributeString.length-1);
			}
			else {
				attributeString = mat[position][type].toString();
			}
			
			positionName = position*1 + 1;
			positionName = positionName + damageTypeArray[type];
			
			apvAttribute = MML.getCharAttribute(character, positionName);
			apvAttribute.set("current", attributeString);
		}
	}
};

//Need Freedom of Movement Bonus. Do it manually for now
MML.setArmorInitiativeBonuses = function setArmorInitativeBonuses(charName){
    senseBonus = MML.getCharAttribute(charName, "Sense Initiative Bonus");
    fomBonus = MML.getCharAttribute(charName, "FoM Initiative Bonus");
    armorList = MML.equipmentStringToArray(MML.getCharAttribute(charName, "Equipped Armor").get("current"));
    bitsOfHelm = ["Barbute Helm", "Bascinet Helm", "Camail", "Camail-Conical", "Cap", "Cheeks", "Conical Helm", "Duerne Helm", "Dwarven War Hood", "Face Plate", "Great Helm", "Half-Face Plate", "Hood", "Nose Guard", "Pot Helm", "Sallet Helm", "Throat Guard", "War Hat"];
    senseArray = [];
    fomArray = [];
    
    //Senses
    for (var bit in bitsOfHelm){
        for (var piece in armorList){
            if (bitsOfHelm[bit] === armorList[piece][0]){
                senseArray.push(bitsOfHelm[bit]);
            }
        }
    }
    //no shit on head
    if (senseArray.length === 0){
        senseBonus.set("current", 4);
    }
    else {
        //Head fully encased in metal
        if (senseArray.indexOf("Great Helm") !== -1 || (senseArray.indexOf("Sallet Helm") !== -1 && senseArray.indexOf("Throat Guard") !== -1)){
            senseBonus.set("current", -2);
        }
        //wearing a helm
        else if (senseArray.indexOf("Barbute Helm") !== -1 || senseArray.indexOf("Sallet Helm") !== -1 || senseArray.indexOf("Bascinet Helm") !== -1 || senseArray.indexOf("Duerne Helm") !== -1 || senseArray.indexOf("Cap") !== -1 || senseArray.indexOf("Pot Helm") !== -1 || senseArray.indexOf("Conical Helm") !== -1 || senseArray.indexOf("War Hat") !== -1){
            //Has faceplate
            if (senseArray.indexOf("Face Plate") !== -1 ){
                //Enclosed Sides
                if (senseArray.indexOf("Barbute Helm") !== -1 || senseArray.indexOf("Bascinet Helm") !== -1 || senseArray.indexOf("Duerne Helm") !== -1){
                    senseBonus.set("current", -2);
                }
                else {
                    senseBonus.set("current", -1);
                }
            }
            //These types of helms or half face plate
            else if (senseArray.indexOf("Barbute Helm") !== -1 || senseArray.indexOf("Sallet Helm") !== -1 || senseArray.indexOf("Bascinet Helm") !== -1 || senseArray.indexOf("Duerne Helm") !== -1 || senseArray.indexOf("Half-Face Plate") !== -1){
                senseBonus.set("current", 0);
            }
            //has camail or cheeks
            else if (senseArray.indexOf("Camail") !== -1 || senseArray.indexOf("Camail-Conical") !== -1 || senseArray.indexOf("Cheeks") !== -1){
                senseBonus.set("current", 1);
            }
            //Wearing a hood
            else if (senseArray.indexOf("Dwarven War Hood") !== -1 || senseArray.indexOf("Hood") !== -1){
                for (var piece in armorList){
                    if (armorList[piece][0] === "Dwarven War Hood" || armorList[piece][0] === "Hood"){
                        if (MML.APVList[armorList[piece][1]].family === "Cloth"){
                            senseBonus.set("current", 2);
                        }
                        else {
                            senseBonus.set("current", 1);
                        }
                    }
                }
            }  
            //has nose guard
            else if (senseArray.indexOf("Nose Guard") !== -1){
                senseBonus.set("current", 2);
            }
            // just some shit on the top of the head
            else {
                senseBonus.set("current", 3);
            }
        }
        //Wearing a hood
        else if (senseArray.indexOf("Dwarven War Hood") !== -1 || senseArray.indexOf("Hood") !== -1){
            for (var piece in armorList){
                if (armorList[piece][0] === "Dwarven War Hood" || armorList[piece][0] === "Hood"){
                    if (MML.APVList[armorList[piece][1]].family === "Cloth"){
                        senseBonus.set("current", 2);
                    }
                    else {
                        senseBonus.set("current", 1);
                    }
                }
            }
        }
    }
    
    
};

MML.universalRoll = function universalRoll(mods){
    roll = randomInteger(100);
    totalTarget = 0;
    
    for(var mod in mods){
        totalTarget += mods[mod];
    }
    
    sendChat("", "Roll Result: " + roll + " <= " + totalTarget);    
    if (roll <= totalTarget){
        sendChat("", "Success!");
        return true;        
    }
    else {
        sendChat("", "Failure!");
        return false;
    }
};

MML.attributeCheckRoll = function attributeCheckRoll(attribute, mods){
    roll = randomInteger(20);
    totalTarget = attribute;
    
    for(var mod in mods){
        totalTarget += mods[mod];
    }
    
    sendChat("", "Roll Result: " + roll + " <= " + totalTarget);    
    if (roll <= totalTarget){
        sendChat("", "Success!");
        return true;        
    }
    else {
        sendChat("", "Failure!");
        return false;
    }
};

MML.rollDice = function rollDice(amount, size) {
    value = 0;
    
    for (i = 0; i < amount; i++){
        value += randomInteger(size);
    }
    return value;
};

MML.rollInitiative = function rollInitiative(character, action, situationMods){
    weapons = MML.equipmentStringToArray(MML.getCharAttribute(character, "Equipped Weapons").get("current"));
    attributeArray = [MML.getAttributeAsInt(character, "Strength"), MML.getAttributeAsInt(character, "Coordination"), MML.getAttributeAsInt(character, "Reason"), MML.getAttributeAsInt(character, "Perception")];
    rankingAttribute = attributeArray.sort(function(a,b){return a-b})[0];
    moveRatio = MML.getAttributeAsInt(character, "Movement Ratio");
    weaponSkill = MML.getAttributeAsInt(character, "Current Weapon Skill");
    totalBonus = MML.getAttributeAsInt(character, "Sense Initiative Bonus") + MML.getAttributeAsInt(character, "FoM Initiative Bonus");
    log(MML.getAttributeAsInt(character, "Movement Ratio"));
    //Weapon
    if (action === "Attack"){
        //Unarmed
        if (weapons[0][0] === "None"){
            totalBonus += 10;
        }
        //One Weapon
        else if (weapons.length === 1){
            totalBonus += MML.meleeWeaponStats[weapons[0][0]].initiative;
        }
        //Dual Wield, take slower weapon
        else if (weapons.length === 2){
            weaponInits = [MML.meleeWeaponStats[weapons[0][0]].initiative, MML.meleeWeaponStats[weapons[0][0]].initiative];
            totalBonus += weaponInits.sort(function(a,b){return b-a})[0];
        }
        else {
            sendChat("", "ERROR!!! TOO MANNY WEAPON!!!");
        }
    }
    else {
        totalBonus += 10;
    }
    
    //Move Ratio
    if (moveRatio <= 0.5){
        totalBonus = -11; //no combat. result of roll will always be negative so no action.
        return totalBonus;
    }
    else if (moveRatio > 0.5 && moveRatio < 0.7){
        totalBonus += -4;
    }
    else if (moveRatio >= 0.7 && moveRatio <= 0.8){
        totalBonus += -3;
    }
    else if (moveRatio > 0.8 && moveRatio <= 1.0){
        totalBonus += -2;
    }
    else if (moveRatio > 1.0 && moveRatio <= 1.2){
        totalBonus += -1;
    }
    else if (moveRatio > 1.2 && moveRatio <= 1.4){
        totalBonus += 0;
    }
    else if (moveRatio > 1.4 && moveRatio <= 1.7){
        totalBonus += 1;
    }
    else if (moveRatio > 1.7 && moveRatio <= 2.0){
        totalBonus += 2;
    }
    else if (moveRatio > 2.0 && moveRatio <= 2.5){
        totalBonus += 3;
    }
    else if (moveRatio > 2.5 && moveRatio <= 3.2){
        totalBonus += 4;
    }
    else if (moveRatio > 3.2){
        totalBonus += 5;
    }
    
    //Ranking Attribute
    if (rankingAttribute <= 9){
        totalBonus += -1; //no combat. result of roll will always be negative so no action.
    }
    else if (rankingAttribute === 10 || rankingAttribute === 11){
        totalBonus += 0;
    }
    else if (rankingAttribute === 12 || rankingAttribute === 13){
        totalBonus += 1;
    }
    else if (rankingAttribute === 14 || rankingAttribute === 15){
        totalBonus += 2;
    }
    else if (rankingAttribute === 16 || rankingAttribute === 17){
        totalBonus += 3;
    }
    else if (rankingAttribute === 18 || rankingAttribute === 19){
        totalBonus += 4;
    }
    else if (rankingAttribute >= 20){
        totalBonus += 5;
    }
    
    //Weapon Skill
    if (weaponSkill <= 9){
        totalBonus += 0;
        return totalBonus;
    }
    else if (weaponSkill > 9 && weaponSkill <= 19){
        totalBonus += 1;
    }
    else if (weaponSkill > 19 && weaponSkill <= 29){
        totalBonus += 2;
    }
    else if (weaponSkill > 29 && weaponSkill <= 39){
        totalBonus += 3;
    }
    else if (weaponSkill > 39 && weaponSkill <= 49){
        totalBonus += 4;
    }
    else if (weaponSkill > 49 && weaponSkill <= 59){
        totalBonus += 5;
    }
    else if (weaponSkill > 59){
        totalBonus += 6;
    }
    
    for (var mod in situationMods){
        totalBonus += situationMods[mod];
    }
    
    roll = MML.rollDice(1, 10);
    initiative = roll + totalBonus;
    sendChat("", "Initiative = 1d10 + bonus = " + roll + " + " + totalBonus + " = " + initiative);
    return initiative;
};

MML.trackInitiative = function trackInitiative(){};

//NEEDS WORK. Attacks from above and below need to be added. Level is good to go.
MML.rollHitPosition = function rollHitPosition(elevation, defender){
    var position;
    var defenderEquipment;
    defenderWeapons = MML.equipmentStringToArray(MML.getCharAttribute(defender, "Equipped Weapons").get("current"));
    defenderShield = MML.equipmentStringToArray(MML.getCharAttribute(defender, "Equipped Shield").get("current"));
    
    //This looks at the defenders stuff and decides which column to use (A, B, or C)
    //Defender has a shield
    if (defenderShield !== "None"){ 
        defenderEquipment = "C";
    }
    //Dual wield or two hander
    else if (defenderWeapons.length > 1 || defenderWeapons[0][1] === "Both"){ 
        defenderEquipment = "B";
    }
    else {
        defenderEquipment = "A";
    }
    
    //change the values to match the tables
    switch(elevation){
        case "above":
            break;            
        case "level":
            switch (defenderEquipment){
                case "A":
                    switch (randomInteger(100)) {
                        case 1:
                        case 2:
                            position = 1;
                            break;
                        case 3:
                            position = 2;
                            break;
                        case 4:
                        case 5:
                            position = 3;
                            break;
                        case 6:
                        case 7:
                            position = 4;
                            break;
                        case 8:
                        case 9:
                            position = 5;
                            break;
                        case 10:
                            position = 6;
                            break;
                        case 11:
                            position = 7;
                            break;
                        case 12:
                        case 13:
                        case 14:
                        case 15:
                            position = 8;
                            break;
                        case 16:
                        case 17:
                        case 18:
                        case 19:
                            position = 9;
                            break;
                        case 20:
                        case 21:
                            position = 10;
                            break;
                        case 22:
                        case 23:
                        case 24:
                        case 25:
                            position = 11;
                            break;
                        case 26:
                        case 27:
                            position = 12;
                            break;
                        case 28:
                        case 29:
                        case 30:
                        case 31:
                            position = 13;
                            break;
                        case 32:
                        case 33:
                        case 34:
                            position = 14;
                            break;
                        case 35:
                        case 36:
                            position = 15;
                            break;
                        case 37:
                        case 38:
                            position = 16;
                            break;
                        case 39:
                        case 40:
                        case 41:
                            position = 17;
                            break;
                        case 42:
                        case 43:
                            position = 18;
                            break;
                        case 44:
                        case 45:
                        case 46:
                        case 47:
                            position = 19;
                            break;
                        case 48:
                        case 49:
                            position = 20;
                            break;
                        case 50:
                        case 51:
                        case 52:
                            position = 21;
                            break;
                        case 53:
                        case 54:
                            position = 22;
                            break;
                        case 55:
                        case 56:
                        case 57:
                            position = 23;
                            break;
                        case 58:
                        case 59:
                            position = 24;
                            break;
                        case 60:
                        case 61:
                            position = 25;
                            break;
                        case 62:
                        case 63:
                            position = 26;
                            break;
                        case 64:
                        case 65:
                        case 66:
                            position = 27;
                            break;
                        case 67:
                        case 68:
                            position = 28;
                            break;
                        case 69:
                        case 70:
                        case 71:
                            position = 29;
                            break;
                        case 72:
                        case 73:
                            position = 30;
                            break;
                        case 74:
                        case 75:
                            position = 31;
                            break;
                        case 76:
                        case 77:
                            position = 32;
                            break;
                        case 78:
                            position = 33;
                            break;
                        case 79:
                        case 80:
                            position = 34;
                            break;
                        case 81:
                        case 82:
                        case 83:
                            position = 35;
                            break;
                        case 84:
                        case 85:
                        case 86:
                            position = 36;
                            break;
                        case 87:
                        case 88:
                            position = 37;
                            break;
                        case 89:
                        case 90:
                            position = 38;
                            break;
                        case 91:
                        case 92:
                            position = 39;
                            break;
                        case 93:
                        case 94:
                            position = 40;
                            break;
                        case 95:
                            position = 41;
                            break;
                        case 96:
                            position = 42;
                            break;
                        case 97:
                            position = 43;
                            break;
                        case 98:
                            position = 44;
                            break;
                        case 99:
                            position = 45;
                            break;
                        case 100:
                            position = 46;
                            break;
                        default:
                            log("wut?");
                    }
                    break;
                case "B":
                    switch (randomInteger(100)) {
                        case 1:
                        case 2:
                            position = 1;
                            break;
                        case 3:
                            position = 2;
                            break;
                        case 4:
                        case 5:
                            position = 3;
                            break;
                        case 6:
                        case 7:
                            position = 4;
                            break;
                        case 8:
                        case 9:
                            position = 5;
                            break;
                        case 10:
                            position = 6;
                            break;
                        case 11:
                            position = 7;
                            break;
                        case 12:
                        case 13:
                        case 14:
                        case 15:
                            position = 8;
                            break;
                        case 16:
                        case 17:
                            position = 9;
                            break;
                        case 18:
                        case 19:
                            position = 10;
                            break;
                        case 20:
                        case 21:
                            position = 11;
                            break;
                        case 22:
                        case 23:
                            position = 12;
                            break;
                        case 24:
                        case 25:
                        case 26:
                        case 27:
                            position = 13;
                            break;
                        case 28:
                        case 29:
                        case 30:
                        case 31:
                            position = 14;
                            break;
                        case 32:
                        case 33:
                            position = 15;
                            break;
                        case 34:                        
                        case 35:
                            position = 16;
                            break;
                        case 36:
                        case 37:
                            position = 17;
                            break;
                        case 38:                            
                        case 39:
                            position = 18;
                            break;
                        case 40:
                        case 41:                            
                        case 42:
                        case 43:
                            position = 19;
                            break;
                        case 44:
                            position = 20;
                            break;
                        case 45:
                        case 46:
                            position = 21;
                            break;
                        case 47:                            
                        case 48:
                            position = 22;
                            break;
                        case 49:                            
                        case 50:
                            position = 23;
                            break;
                        case 51:
                        case 52:
                            position = 24;
                            break;
                        case 53:
                            position = 25;
                            break;
                        case 54:
                        case 55:
                        case 56:
                        case 57:
                            position = 26;
                            break;
                        case 58:
                        case 59:
                            position = 27;
                            break;
                        case 60:
                        case 61:
                            position = 28;
                            break;
                        case 62:
                        case 63:
                            position = 29;
                            break;
                        case 64:
                        case 65:
                            position = 30;
                            break;
                        case 66:
                        case 67:
                        case 68:
                        case 69:
                            position = 31;
                            break;
                        case 70:
                        case 71:
                        case 72:
                            position = 32;
                            break;
                        case 73:
                            position = 33;
                            break;
                        case 74:
                        case 75:
                        case 76:
                            position = 34;
                            break;
                        case 77:
                        case 78:
                        case 79:
                        case 80:
                            position = 35;
                            break;
                        case 81:
                        case 82:
                        case 83:
                        case 84:
                            position = 36;
                            break;
                        case 85:
                        case 86:
                        case 87:
                            position = 37;
                            break;
                        case 88:
                        case 89:
                        case 90:
                            position = 38;
                            break;
                        case 91:
                        case 92:
                            position = 39;
                            break;
                        case 93:
                        case 94:
                            position = 40;
                            break;
                        case 95:
                            position = 41;
                            break;
                        case 96:
                            position = 42;
                            break;
                        case 97:
                            position = 43;
                            break;
                        case 98:
                            position = 44;
                            break;
                        case 99:
                            position = 45;
                            break;
                        case 100:
                            position = 46;
                            break;
                        default:
                            log("wut?");
                    }
                    break;
                case "C":
                    switch (randomInteger(100)) {
                        case 1:
                        case 2:
                            position = 1;
                            break;
                        case 3:
                            position = 2;
                            break;
                        case 4:
                        case 5:
                            position = 3;
                            break;
                        case 6:
                        case 7:
                            position = 4;
                            break;
                        case 8:
                        case 9:
                            position = 5;
                            break;
                        case 10:
                            position = 6;
                            break;
                        case 11:
                            position = 7;
                            break;
                        case 12:
                        case 13:
                        case 14:
                        case 15:
                        case 16:
                            position = 8;
                            break;
                        case 17:
                        case 18:
                        case 19:
                        case 20:
                            position = 9;
                            break;
                        case 21:
                        case 22:
                        case 23:
                            position = 10;
                            break;
                        case 24:
                        case 25:
                            position = 11;
                            break;
                        case 26:
                        case 27:
                        case 28:
                        case 29:
                            position = 12;
                            break;
                        case 30:
                        case 31:
                        case 32:
                            position = 13;
                            break;
                        case 33:
                        case 34:
                        case 35:
                        case 36:
                        case 37:
                            position = 14;
                            break;
                        case 38:
                        case 39:
                            position = 15;
                            break;
                        case 40:
                            position = 16;
                            break;
                        case 41:
                            position = 17;
                            break;
                        case 42:
                        case 43:
                            position = 18;
                            break;
                        case 44:
                            position = 19;
                            break;
                        case 45:
                        case 46:
                            position = 20;
                            break;
                        case 47:
                        case 48:
                        case 49:
                        case 50:
                        case 51:
                            position = 21;
                            break;
                        case 52:
                            position = 22;
                            break;
                        case 53:
                        case 54:
                            position = 23;
                            break;
                        case 55:
                        case 56:
                        case 57:
                            position = 24;
                            break;
                        case 58:
                            position = 25;
                            break;
                        case 59:
                        case 60:
                        case 61:
                        case 62:
                        case 63:
                            position = 26;
                            break;
                        case 64:
                        case 65:
                        case 66:
                        case 67:
                        case 68:
                            position = 27;
                            break;
                        case 69:
                            position = 28;
                            break;
                        case 70:
                            position = 29;
                            break;
                        case 71:
                        case 72:
                        case 73:
                        case 74:
                            position = 30;
                            break;
                        case 75:
                            position = 31;
                            break;
                        case 76:
                        case 77:
                        case 78:
                        case 79:
                            position = 32;
                            break;
                        case 80:
                            position = 33;
                            break;
                        case 81:
                            position = 34;
                            break;
                        case 82:
                        case 83:
                        case 84:
                        case 85:
                            position = 35;
                            break;
                        case 86:
                            position = 36;
                            break;
                        case 87:
                        case 88:
                        case 89:
                        case 90:                            
                            position = 37;
                            break;
                        case 91:
                            position = 38;
                            break;
                        case 92:
                        case 93:
                            position = 39;
                            break;
                        case 94:
                            position = 40;
                            break;
                        case 95:
                            position = 41;
                            break;
                        case 96:
                            position = 42;
                            break;
                        case 97:
                            position = 43;
                            break;
                        case 98:
                            position = 44;
                            break;
                        case 99:
                            position = 45;
                            break;
                        case 100:
                            position = 46;
                            break;
                        default:
                            log("wut?");
                    }
                    break;
            }
            break;
        case "below":
            
            break;
    }
    
    return position;
};

//Probably not needed due to APVs as attributes
MML.damageTypeToNumber = function damageTypeToNumber(type) {
    //***could be replaced with enum in database***
	
    switch(type) {
        case "Surface":
            number =  0;
            break;
        case "Cut":
            number =  1;
            break;
        case "Chop":
            number =  2;
            break;
        case "Pierce":
            number =  3;
            break;
        case "Thrust":
            number =  4;
            break;
        case "Impact":
            number =  5;
            break;
        case "Flanged":
            number =  6;
            break;
    }
    return number;
};

MML.apvAttributeToArray = function apvAttributeToArray(defender, position, type) {
	apvArray = MML.getCharAttribute(defender, position + " " + type).get("current").split(";");
    for (var apv in apvArray){
        apvArray[apv] = apvArray[apv].split(",");
		apvArray[apv][0] = apvArray[apv][0]*1; //Convert string to int
		apvArray[apv][1] = apvArray[apv][1]*1; //Convert string to int
    }    
    return apvArray;
}

MML.armorPenetration = function armorPenetration(defender, position, damage, type) {
    //type = MML.damageTypeToNumber(type);
	damageApplied = false; //Accounts for partial coverage, once true the loop stops
    coverageRoll = randomInteger(100);    
	
    //iterates over apv values at given position (accounting for partial coverage)
    for (var apv in MML.apvAttributeToArray(defender, position, type)){ //state.MML.characterAPVList[MML.getCharFromName(defender).id][position-1][type]
        if (damageApplied === false){
            if (coverageRoll <= MML.apvAttributeToArray(defender, position, type)[apv][1]) { //if coverage roll is less than apv coverage
                damageDeflected = MML.apvAttributeToArray(defender, position, type)[apv][0];
                
                //If all damage is deflected, do blunt trauma. Modifies damage variable for next if statement
                if (damage <= damageDeflected){
                    //If surface, cut, or pierce, cut in half and apply as impact
                    if (type === "Surface" || type === "Cut" || type === "Pierce"){                        
                        damage = Math.round(damage/2);
                        damageDeflected = MML.apvAttributeToArray(defender, position, "Impact")[apv][0];
                        
                        if (damage <= damageDeflected){
                            damage = 0;
                        }
                    }
                    //If chop, or thrust, apply 3/4 as impact
                    if (type === "Chop" || type === "Thrust"){
                        damage = Math.round(damage*0.75);
                        damageDeflected = MML.apvAttributeToArray(defender, position, "Impact")[apv][0];
                        
                        if (damage <= damageDeflected){
                            damage = 0;
                        }
                    }
                    //If impact or flanged, no damage
                    else {
                        damage = 0;
                    }
                }
                
                // if damage gets through, subtract amount deflected by armor
                if (damage > 0){
                    damage -= damageDeflected;
                }
                
                sendChat("", "in the " + MML.hitPositions[position].name + " for " + damage + "! " + defender + "'s armor blocked " + damageDeflected + "!");
                damageApplied = true;
            }
        }
    }    
    return damage;
};

MML.applyDamage = function applyDamage(defender, position, damage, type){
    currentHP = MML.getCharAttribute(defender, MML.hitPositions[position].part).get("current")*1;
    maxHP = MML.getCharAttribute(defender, MML.hitPositions[position].part).get("max")*1;
    multiWound = MML.getCharAttribute(defender, "Multiple Wounds").get("current")*1;
    damage = MML.armorPenetration(defender, position, damage, type);
    
    currentHP -= damage;
    multiWound -= damage;
    
    MML.getCharAttribute(defender, MML.hitPositions[position].part).set("current", currentHP);
    MML.getCharAttribute(defender, "Multiple Wounds").set("current", multiWound);
    
    if (currentHP < maxHP && currentHP >= Math.round(maxHP/2)) {
        sendChat("", defender + "'s " + MML.hitPositions[position].name + " is minorly wounded!");
        //state.MML.combat[defender].wounds[part] = "Minor";
    }
    else if (currentHP < Math.round(maxHP/2) && currentHP >= Math.round(maxHP/2)) {
        sendChat("", defender + "'s " + MML.hitPositions[position].name + " is majorly wounded!");
        roundsOfEffect = Math.round(maxHP/2) - currentHP; //how long the situation mod lasts
        //state.MML.combat[defender].wounds[part] = "Major";
        //initMod -= 5;
        //situationMod -= 10;
    }
    else if (currentHP < 0 && currentHP >= -1*maxHP) {
        sendChat("", defender + "'s " + MML.hitPositions[position].name + " is disabled!");
        MML.checkStun(defender);
        roundsOfEffect = Math.round(maxHP/2) - currentHP; //how long the situation mod lasts
        //state.MML.combat[defender].wounds[part] = "Disabled";
        //initMod -= 5;
        //situationMod -= 25;
    }
    else {
        sendChat("", defender + "'s " + MML.hitPositions[position].name + " is mortally wounded!");
        
        if (MML.attributeCheckRoll(MML.getCharAttribute(defender, "System Strength").get("current")*1, 0) === false){
            sendChat(defender + " falls unconscious!");
        }
        //state.MML.combat[defender].wounds[part] = "Mortal";
    }
};

//Needs work. comments inside.
MML.checkKnockdown = function checkKnockdown(defender, damage) {
    mods = 0; //place holder use something like state.combat[defender].knockdownSituationMod
    
    if (damage > MML.getCharAttribute(defender, "Knockdown").get("current")*1) {
        //defender resists knockdown. System strength check
        if (MML.attributeCheckRoll(MML.getCharAttribute(defender, "System Strength").get("current")*1, mods)){
            sendChat("", defender + " remains standing!");
            //state.combat[defender].knockdownSituationMod += -5;
            //state.combat[defender].initiativeSituationMod += -5;
            //Defender stumbles. Not sure what that affects...
        }
        
        else {
            sendChat("", defender + " is knocked down!");
            //state.combat[defender].position = "prone";
        }
    }
};

MML.checkStun = function checkStun(defender) {    
    if (MML.attributeCheckRoll(MML.getCharAttribute(defender, "Willpower").get("current")*1, 0) === false) { //the 0 might need to vary
        sendChat("", defender + " is stunned!");
        //state.MML.combat[defender].conditions.push("Stunned");
    }
};

MML.meleeAttack = function meleeAttack(attacker, defender, attSituationMod, defSituationMod, attackType, elevation){
    //Add attribute bonuses and situation modifiers. Compute mods outside this function. 
    //Figure out how to account for secondary attacks
    attackWeapon = MML.meleeWeaponStats[MML.getCharAttribute(attacker, "Equipped Weapons").get("current").split(":")[0]];
    attackSkill = MML.getAttributeAsInt(attacker, "Current Weapon Skill");
    defendWeapon = MML.meleeWeaponStats[MML.getCharAttribute(defender, "Equipped Weapons").get("current").split(":")[0]];
	log(attackWeapon);
	log(defendWeapon);
    defendSkill = Math.round(MML.getAttributeAsInt(defender, "Current Weapon Skill")/2);
    
    sendChat("", attacker + " attacks " + defender + " with a " + attackWeapon.name + "!");
    
    //if attacker hits. 
    //Account for crits
    if (MML.universalRoll([attackWeapon.primaryTask, attackSkill])){
        //if defender parries
        sendChat("", defender + " attempts to parry " + attacker + "'s blow!");
        if (MML.universalRoll([defendWeapon.defence, defendSkill])){
            sendChat("", defender + " parries!");
            //add to number of attacks defended this round
            //account for critical success and failure
        }
        //attacker hits
        else{
            sendChat("", attacker + "'s hits " + defender);
            damageArray = attackWeapon.primaryDamage.split("d"); //[number of dice, size of dice]
            damage = MML.rollDice(damageArray[0]*1, damageArray[1]*1);
            position = MML.rollHitPosition(elevation, defender);
            
            MML.applyDamage(defender, position, damage, attackWeapon.primaryType);
            MML.checkKnockdown(defender, damage);
            //if defender hit in face, throat or nuts
            if (position === 2 || position === 6 || position === 33) {
                MML.checkStun(defender);
            }
        }
    }
    
    //attacker misses
    else{
        sendChat("", attacker + " misses!");
    }
    //note that the characters acted in melee for fatigue purposes
};

MML.parseCommand = function parseCommand(msg) {
    if(msg.type === "api" && msg.content.indexOf("!test") !== -1) {
        MML.unitTest();
    }
    
    if(msg.type === "api" && msg.content.indexOf("!init ") !== -1) {
        MML.initChar(msg.content.replace("!init ", ""));
    }
    
    
};

on("ready", function() {
    on("add:character", function(character) {
        MML.createAttributesFromArray(MML.charTraits, character);
        MML.createAttributesFromArray(MML.primaryAttributes, character);
        MML.createAttributesFromArray(MML.secondaryAttributes, character);
        MML.createAttributesFromArray(MML.hitPoints, character);
        MML.createAttributesFromArray(MML.inventoryAttributes, character);
        MML.createAttributesFromArray(MML.movement, character);		
        MML.createAttribute("Initiative Bonus", 0, 0, character);
        MML.createAttribute("Sense Initiative Bonus", 0, 0, character);
        MML.createAttribute("FoM Initiative Bonus", 0, 0, character);
        MML.createAttributesFromArray(MML.skills, character);
		MML.createAPVAttributes(character);
        //MML.createAbility("Init", "!init " + character.get("name"), false, character);
    });

    on("chat:message", function(msg) {
        var chatCmd = MML.parseCommand(msg);
        if (typeof chatCmd === 'undefined') {
            return;
        }
    });
});
