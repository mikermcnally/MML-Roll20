state.MML = state.MML || {};
state.MML.waitingForUser = "";
state.MML.GM = {};
state.MML.GM.player = "Robot";
state.MML.GM.name = "GM";
state.MML.GM.menu = MML.GmMenuMain;
state.MML.GM.displayMenu = MML.displayMenu;
state.MML.GM.displayRoll = MML.displayRoll;
state.MML.GM.menuInfo = {};
state.MML.GM.characters = state.MML.GM.characters || [];

// Character Creation
MML.CharacterConstructor = function CharacterConstructor(charName){
    this.menu = MML.characterMenuStart;
    
    //Attributes
    this.name = charName;
    this.race = MML.getCharAttribute(charName, "race").get("current");
    this.gender = MML.getCharAttribute(charName, "gender").get("current");
    this.height = MML.getCharAttribute(charName, "height").get("current");
    this.weight = MML.getCharAttribute(charName, "weight").get("current");
	this.handedness = MML.getCharAttribute(charName, "handedness").get("current");
	this.stature = MML.getCurrentAttributeAsInt(charName, "stature");
    this.strength = MML.getCurrentAttributeAsInt(charName, "strength");
    this.coordination = MML.getCurrentAttributeAsInt(charName, "coordination");
    this.health = MML.getCurrentAttributeAsInt(charName, "health");
    this.beauty = MML.getCurrentAttributeAsInt(charName, "beauty");
    this.intellect = MML.getCurrentAttributeAsInt(charName, "intellect");
    this.reason = MML.getCurrentAttributeAsInt(charName, "reason");
    this.creativity = MML.getCurrentAttributeAsInt(charName, "creativity");
    this.presence = MML.getCurrentAttributeAsInt(charName, "presence");
	this.willpower = MML.getCurrentAttributeAsInt(charName, "willpower");
    this.evocation = MML.getCurrentAttributeAsInt(charName, "evocation");
    this.perception = MML.getCurrentAttributeAsInt(charName, "perception");
    this.systemStrength = MML.getCurrentAttributeAsInt(charName, "systemStrength");
    this.fitness = MML.getCurrentAttributeAsInt(charName, "fitness");
	this.fitnessMod = MML.getCurrentAttributeAsInt(charName, "fitnessMod");
	this.load = MML.getCurrentAttributeAsInt(charName, "load");
    this.overhead = MML.getCurrentAttributeAsInt(charName, "overhead");
    this.deadLift = MML.getCurrentAttributeAsInt(charName, "deadLift");
	
	// HP stuff
	this.multiWound = { current: MML.getCurrentAttributeAsInt(charName, "multiWound"), max: MML.getMaxAttributeAsInt(charName, "multiWound"), wound: false };
	this.hpHead = { current: MML.getCurrentAttributeAsInt(charName, "hpHead"), max: MML.getMaxAttributeAsInt(charName, "hpHead"), wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    this.hpChest = { current: MML.getCurrentAttributeAsInt(charName, "hpChest"), max: MML.getMaxAttributeAsInt(charName, "hpChest"), wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    this.hpAb = { current: MML.getCurrentAttributeAsInt(charName, "hpAb"), max: MML.getMaxAttributeAsInt(charName, "hpAb"), wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    this.hpLA = { current: MML.getCurrentAttributeAsInt(charName, "hpLA"), max: MML.getMaxAttributeAsInt(charName, "hpLA"), wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    this.hpRA = { current: MML.getCurrentAttributeAsInt(charName, "hpRA"), max: MML.getMaxAttributeAsInt(charName, "hpRA"), wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    this.hpLL = { current: MML.getCurrentAttributeAsInt(charName, "hpLL"), max: MML.getMaxAttributeAsInt(charName, "hpLL"), wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
    this.hpRL = { current: MML.getCurrentAttributeAsInt(charName, "hpRL"), max: MML.getMaxAttributeAsInt(charName, "hpRL"), wound: { major: { value: false, duration: 0 }, disabling: false, mortal: false } };
	
	// Inventory stuff
	this.totalWeightCarried = MML.getCurrentAttributeAsInt(charName, "totalWeightCarried");
	this.knockdown = { current: MML.getCurrentAttributeAsInt(charName, "knockdown"), max: MML.getMaxAttributeAsInt(charName, "knockdown") };
	this.movement.movementRatio = MML.getCurrentAttributeAsInt(charName, "movement.movementRatio");
	this.inventory = { inPack: [], armor: [], weapons: [], shield: MML.shieldStats["None"] };
	this.apv = [];
	
	// Roll storage
	this.currentRoll = { accepted: false };
	
	// combat stuff
	this.ready = false;
	this.action = {}; // name: "observe", skill: 0, target: [], style: "standard", calledShot: "standard", stance: "neutral", weapon: "primary", elevation: "level", flanking: "none" };
	this.defense = { hitTable: "A", number: 0, style: "Block", dodge: false};
	this.initiative = { value: 0, roll: 0, situational: 0, movementRatio: 0, attribute: 0, sense: 0, fom: 0, action: 0, tempo: 0 };
	this.modifiers = { situational: 0, attack: 0, defense: 0, casting: 0 };
	this.fatigue = { inMelee: false, rest: 0, level: 0, exertion: 0 };
	this.damaged = false;
	this.stun = {};
	this.sensitive = -1;
	this.stumble = -1;
	this.defenseRoll = MML.defenseRoll;
	
	// skills
	
	// spells
	
	this.setReady = MML.setReady;
};

MML.initChar = function initChar(charName){
    MML.setStature(charName);
    state.MML.GM.characters[charName].willpower = Math.round((2*state.MML.GM.characters[charName].presence + state.MML.GM.characters[charName].health)/3);    
    state.MML.GM.characters[charName].evocation = Math.round(state.MML.GM.characters[charName].health + state.MML.GM.characters[charName].intellect + state.MML.GM.characters[charName].reason + state.MML.GM.characters[charName].creativity + state.MML.GM.characters[charName].willpower);	
    state.MML.GM.characters[charName].perception = Math.round((state.MML.GM.characters[charName].intellect + state.MML.GM.characters[charName].reason + state.MML.GM.characters[charName].creativity)/3);    
    state.MML.GM.characters[charName].systemStrength = Math.round((state.MML.GM.characters[charName].presence + 2*state.MML.GM.characters[charName].health)/3);    
    state.MML.GM.characters[charName].fitness = Math.round((state.MML.GM.characters[charName].health + state.MML.GM.characters[charName].strength)/2);    
    state.MML.GM.characters[charName].fitnessMod = MML.getAttributeTableValue("mod", state.MML.GM.characters[charName].fitness, MML.fitnessModLookup);
    state.MML.GM.characters[charName].load = Math.round(state.MML.GM.characters[charName].fitnessMod * state.MML.GM.characters[charName].stature);
    state.MML.GM.characters[charName].overhead =  Math.round(2 * state.MML.GM.characters[charName].fitnessMod * state.MML.GM.characters[charName].stature);
    state.MML.GM.characters[charName].deadLift = Math.round(4 * state.MML.GM.characters[charName].fitnessMod * state.MML.GM.characters[charName].stature);
    
	state.MML.GM.characters[charName].multiWound = { current: Math.round((state.MML.GM.characters[charName].health + state.MML.GM.characters[charName].stature + state.MML.GM.characters[charName].willpower)/2), max: Math.round((state.MML.GM.characters[charName].health + state.MML.GM.characters[charName].stature + state.MML.GM.characters[charName].willpower)/2) };
    MML.setHP(charName, "hpHead", Math.round(state.MML.GM.characters[charName].health + state.MML.GM.characters[charName].stature/3));
    MML.setHP(charName, "hpChest", Math.round(state.MML.GM.characters[charName].health + state.MML.GM.characters[charName].stature + state.MML.GM.characters[charName].strength));
    MML.setHP(charName, "hpAb", Math.round(state.MML.GM.characters[charName].health + state.MML.GM.characters[charName].stature));
    MML.setHP(charName, "hpLA", Math.round(state.MML.GM.characters[charName].health + state.MML.GM.characters[charName].stature));
    MML.setHP(charName, "hpRA", Math.round(state.MML.GM.characters[charName].health + state.MML.GM.characters[charName].stature));
    MML.setHP(charName, "hpLL", Math.round(state.MML.GM.characters[charName].health + state.MML.GM.characters[charName].stature));
    MML.setHP(charName, "hpRL", Math.round(state.MML.GM.characters[charName].health + state.MML.GM.characters[charName].stature));

	//MML.updateInventory(charName);
    //MML.setMoveRatioAndKnockdown(charName);
	MML.setAPVs(charName);
	//MML.setStaticInitiativeBonuses(charName);
};

MML.updateCharacterSheet = function updateCharacterSheet(charName){
	var character = state.MML.GM.characters[charName];
	
	MML.setCurrentAttribute(charName, "race", character.race);
	MML.setCurrentAttribute(charName, "gender", character.gender);
	MML.setCurrentAttribute(charName, "height", character.height);
	MML.setCurrentAttribute(charName, "weight", character.weight);
	MML.setCurrentAttribute(charName, "handedness", character.handedness);
	MML.setCurrentAttribute(charName, "stature", character.stature);
    MML.setCurrentAttribute(charName, "strength", character.strength);
    MML.setCurrentAttribute(charName, "coordination", character.coordination);
    MML.setCurrentAttribute(charName, "health", character.health);
    MML.setCurrentAttribute(charName, "beauty", character.beauty);
    MML.setCurrentAttribute(charName, "intellect", character.intellect);
    MML.setCurrentAttribute(charName, "reason", character.reason);
    MML.setCurrentAttribute(charName, "creativity", character.creativity);
    MML.setCurrentAttribute(charName, "presence", character.presence);
	MML.setCurrentAttribute(charName, "willpower", character.willpower);
    MML.setCurrentAttribute(charName, "evocation", character.evocation);
    MML.setCurrentAttribute(charName, "perception", character.perception);
    MML.setCurrentAttribute(charName, "systemStrength", character.systemStrength);
    MML.setCurrentAttribute(charName, "fitness", character.fitness);
	MML.setCurrentAttribute(charName, "fitnessMod", character.fitnessMod);
	MML.setCurrentAttribute(charName, "load", character.load); 
    MML.setCurrentAttribute(charName, "overhead", character.overhead);
    MML.setCurrentAttribute(charName, "deadLift", character.deadLift);
	
	// HP stuff
	MML.setCurrentAttribute(charName, "multiWound", character.multiWound.current);
	MML.setMaxAttribute(charName, "multiWound", character.multiWound.max);
	MML.setCurrentAttribute(charName, "hpHead", character.hpHead.current);
	MML.getMaxAttributeAsInt(charName, "hpHead", character.hpHead.max);
    MML.setCurrentAttribute(charName, "hpChest", character.hpChest.current);
	MML.getMaxAttributeAsInt(charName, "hpChest", character.hpChest.max);
    MML.setCurrentAttribute(charName, "hpAb", character.hpAb.current);
	MML.getMaxAttributeAsInt(charName, "hpAb", character.hpAb.max);
    MML.setCurrentAttribute(charName, "hpLA", character.hpLA.current);
	MML.getMaxAttributeAsInt(charName, "hpLA", character.hpLA.max);
    MML.setCurrentAttribute(charName, "hpRA", character.hpRA.current);
	MML.getMaxAttributeAsInt(charName, "hpRA", character.hpRA.max);
    MML.setCurrentAttribute(charName, "hpLL", haracter.hpLL.current);
	MML.getMaxAttributeAsInt(charName, "hpLL", haracter.hpLL.max);
    MML.setCurrentAttribute(charName, "hpRL", character.hpRL.current);
	MML.getMaxAttributeAsInt(charName, "hpRL", character.hpRL.max);
	
	MML.setCurrentAttribute(charName, "totalWeightCarried", character.totalWeightCarried);
	MML.setCurrentAttribute(charName, "knockdown", character.knockdown.current);
	MML.setMaxAttribute(charName, "knockdown", character.knockdown.max);
	MML.setCurrentAttribute(charName, "movement.movementRatio", character.movement.movementRatio);
	
};

MML.setStature = function setStature(charName){
    var statureRoll  = state.MML.GM.characters[charName].stature;
    
    if (state.MML.GM.characters[charName].race === "Human"){ //Table 2B.5 page 45
        if (state.MML.GM.characters[charName].gender === "Male"){
			state.MML.GM.characters[charName].height = MML.getAttributeTableValue("height", statureRoll, MML.statureTableHumanMale);
			state.MML.GM.characters[charName].weight = MML.getAttributeTableValue("weight", statureRoll, MML.statureTableHumanMale);
			state.MML.GM.characters[charName].stature = MML.getAttributeTableValue("stature", statureRoll, MML.statureTableHumanMale);		
        }
        
        else if (state.MML.GM.characters[charName].gender === "Female"){
			state.MML.GM.characters[charName].height = MML.getAttributeTableValue("height", statureRoll, MML.statureTableHumanFemale);
			state.MML.GM.characters[charName].weight = MML.getAttributeTableValue("weight", statureRoll, MML.statureTableHumanFemale);
			state.MML.GM.characters[charName].stature = MML.getAttributeTableValue("stature", statureRoll, MML.statureTableHumanFemale);
        }
    }
    
    else if (state.MML.GM.characters[charName].race === "Dwarf"){ //Table 2B.1 page 43
        if (state.MML.GM.characters[charName].gender === "Male"){
			state.MML.GM.characters[charName].height = MML.getAttributeTableValue("height", statureRoll, MML.statureTableDwarfMale);
			state.MML.GM.characters[charName].weight = MML.getAttributeTableValue("weight", statureRoll, MML.statureTableDwarfMale);
			state.MML.GM.characters[charName].stature = MML.getAttributeTableValue("stature", statureRoll, MML.statureTableDwarfMale);
        }
        
        else if (state.MML.GM.characters[charName].gender === "Female"){
			state.MML.GM.characters[charName].height = MML.getAttributeTableValue("height", statureRoll, MML.statureTableDwarfFemale);
			state.MML.GM.characters[charName].weight = MML.getAttributeTableValue("weight", statureRoll, MML.statureTableDwarfFemale);
			state.MML.GM.characters[charName].stature = MML.getAttributeTableValue("stature", statureRoll, MML.statureTableDwarfFemale);
        }
    }
    
    else if (state.MML.GM.characters[charName].race === "Gnome"){ //Table 2B.1 page 43
        if (state.MML.GM.characters[charName].gender === "Male"){
			state.MML.GM.characters[charName].height = MML.getAttributeTableValue("height", statureRoll, MML.statureTableGnomeMale);
			state.MML.GM.characters[charName].weight = MML.getAttributeTableValue("weight", statureRoll, MML.statureTableGnomeMale);
			state.MML.GM.characters[charName].stature = MML.getAttributeTableValue("stature", statureRoll, MML.statureTableGnomeMale);
        }
        
        else if (state.MML.GM.characters[charName].gender === "Female"){
			state.MML.GM.characters[charName].height = MML.getAttributeTableValue("height", statureRoll, MML.statureTableGnomeFemale);
			state.MML.GM.characters[charName].weight = MML.getAttributeTableValue("weight", statureRoll, MML.statureTableGnomeFemale);
			state.MML.GM.characters[charName].stature = MML.getAttributeTableValue("stature", statureRoll, MML.statureTableGnomeFemale);
        }
    }
    
    else if (state.MML.GM.characters[charName].race === "Gray Elf"){ //Table 2B.1 page 43
        if (state.MML.GM.characters[charName].gender === "Male"){
			state.MML.GM.characters[charName].height = MML.getAttributeTableValue("height", statureRoll, MML.statureTableGrayElfMale);
			state.MML.GM.characters[charName].weight = MML.getAttributeTableValue("weight", statureRoll, MML.statureTableGrayElfMale);
			state.MML.GM.characters[charName].stature = MML.getAttributeTableValue("stature", statureRoll, MML.statureTableGrayElfMale);
        }
        
        else if (state.MML.GM.characters[charName].gender === "Female"){
			state.MML.GM.characters[charName].height = MML.getAttributeTableValue("height", statureRoll, MML.statureTableGrayElfFemale);
			state.MML.GM.characters[charName].weight = MML.getAttributeTableValue("weight", statureRoll, MML.statureTableGrayElfFemale);
			state.MML.GM.characters[charName].stature = MML.getAttributeTableValue("stature", statureRoll, MML.statureTableGrayElfFemale);
        }
    }
    
    else if (state.MML.GM.characters[charName].race === "Hobbit"){ //Table 2B.1 page 43
        if (state.MML.GM.characters[charName].gender === "Male"){
			state.MML.GM.characters[charName].height = MML.getAttributeTableValue("height", statureRoll, MML.statureTableHobbitMale);
			state.MML.GM.characters[charName].weight = MML.getAttributeTableValue("weight", statureRoll, MML.statureTableHobbitMale);
			state.MML.GM.characters[charName].stature = MML.getAttributeTableValue("stature", statureRoll, MML.statureTableHobbitMale);
        }
        
        else if (state.MML.GM.characters[charName].gender === "Female"){
			state.MML.GM.characters[charName].height = MML.getAttributeTableValue("height", statureRoll, MML.statureTableHobbitFemale);
			state.MML.GM.characters[charName].weight = MML.getAttributeTableValue("weight", statureRoll, MML.statureTableHobbitFemale);
			state.MML.GM.characters[charName].stature = MML.getAttributeTableValue("stature", statureRoll, MML.statureTableHobbitFemale);
        }
    }
    
    else if (state.MML.GM.characters[charName].race === "Wood Elf"){ //Table 2B.1 page 43
        if (state.MML.GM.characters[charName].gender === "Male"){
			state.MML.GM.characters[charName].height = MML.getAttributeTableValue("height", statureRoll, MML.statureTableWoodElfMale);
			state.MML.GM.characters[charName].weight = MML.getAttributeTableValue("weight", statureRoll, MML.statureTableWoodElfMale);
			state.MML.GM.characters[charName].stature = MML.getAttributeTableValue("stature", statureRoll, MML.statureTableWoodElfMale);
        }
        
        else if (state.MML.GM.characters[charName].gender === "Female"){
			state.MML.GM.characters[charName].height = MML.getAttributeTableValue("height", statureRoll, MML.statureTableWoodElfFemale);
			state.MML.GM.characters[charName].weight = MML.getAttributeTableValue("weight", statureRoll, MML.statureTableWoodElfFemale);
			state.MML.GM.characters[charName].stature = MML.getAttributeTableValue("stature", statureRoll, MML.statureTableWoodElfFemale);
        }
    }
    
};

MML.setHP = function setHP(charName, bodyPart, inputValue){
    if (state.MML.GM.characters[charName].race === "Human"){ 
        state.MML.GM.characters[charName][bodyPart].current = MML.getAttributeTableValue("hp", inputValue, MML.HPTableHuman);
        state.MML.GM.characters[charName][bodyPart].max = MML.getAttributeTableValue("hp", inputValue, MML.HPTableHuman);
    }
    
    else if (state.MML.GM.characters[charName].race === "Dwarf"){
        state.MML.GM.characters[charName][bodyPart].current = MML.getAttributeTableValue("hp", inputValue, MML.HPTableDwarf);
        state.MML.GM.characters[charName][bodyPart].max = MML.getAttributeTableValue("hp", inputValue, MML.HPTableDwarf);
    }
    
    else if (state.MML.GM.characters[charName].race === "Gnome"){
        state.MML.GM.characters[charName][bodyPart].current = MML.getAttributeTableValue("hp", inputValue, MML.HPTableGnome);
        state.MML.GM.characters[charName][bodyPart].max = MML.getAttributeTableValue("hp", inputValue, MML.HPTableGnome);
    }
    
    else if (state.MML.GM.characters[charName].race === "Gray Elf"){
        state.MML.GM.characters[charName][bodyPart].current = MML.getAttributeTableValue("hp", inputValue, MML.HPTableGrayElf);
        state.MML.GM.characters[charName][bodyPart].max = MML.getAttributeTableValue("hp", inputValue, MML.HPTableGrayElf);
    }
    
    else if (state.MML.GM.characters[charName].race === "Hobbit"){
        state.MML.GM.characters[charName][bodyPart].current = MML.getAttributeTableValue("hp", inputValue, MML.HPTableHobbit);
        state.MML.GM.characters[charName][bodyPart].max = MML.getAttributeTableValue("hp", inputValue, MML.HPTableHobbit);
    }
    
    else if (state.MML.GM.characters[charName].race === "Wood Elf"){
        state.MML.GM.characters[charName][bodyPart].current = MML.getAttributeTableValue("hp", inputValue, MML.HPTableWoodElf);
        state.MML.GM.characters[charName][bodyPart].max = MML.getAttributeTableValue("hp", inputValue, MML.HPTableWoodElf);
    }
};

MML.setSkills = function setSkills(charName){
	var character = state.MML.GM.characters[charName];
	
};

// Equipment Functions
MML.setMoveRatioAndKnockdown = function setMoveRatioAndKnockdown(charName){
    state.MML.GM.characters[charName].totalWeightCarried = 0;
    armor = state.MML.GM.characters[charName].inventory.armor;
	weapons = state.MML.GM.characters[charName].inventory.weapons;
	shield = state.MML.GM.characters[charName].inventory.shield; 
	
	//Add weight of armor
    if (armor !== []){       
        var piece;
		for (piece in armor){
            state.MML.GM.characters[charName].totalWeightCarried += MML.armorStyleList[armor.style].totalPostitions * MML.APVList[armor.material].weightPerPosition;
        } 
    }
    //Add weight of melee weapons
    if (weapons !== []){
        var weapon;
		for (weapon in weapons){  
            if (typeof MML.weaponStats[weapons[weapon].name] !== "undefined"){
				state.MML.GM.characters[charName].totalWeightCarried += MML.weaponStats[weapons[weapon]].weight;
			}
        }    
    }
    //Add weight of shield
    state.MML.GM.characters[charName].totalWeightCarried += MML.shieldStats[state.MML.GM.characters[charName].inventory.shield].weight;
	//Need other items on person

    if (state.MML.GM.characters[charName].load/state.MML.GM.characters[charName].totalWeightCarried > 4.0){
        state.MML.GM.characters[charName].movement.movement.movementRatio = 4.0;
    }
    else {
        state.MML.GM.characters[charName].movement.movement.movementRatio = Math.round(state.MML.GM.characters[charName].load/state.MML.GM.characters[charName].totalWeightCarried*10)/10;
    }
    state.MML.GM.characters[charName].knockdown.current = Math.round(state.MML.GM.characters[charName].stature + (state.MML.GM.characters[charName].totalWeightCarried/10));
    state.MML.GM.characters[charName].knockdown.max = Math.round(state.MML.GM.characters[charName].stature + (state.MML.GM.characters[charName].totalWeightCarried/10));
};

MML.setAPVs = function setAPVs(charName){
    var armor = state.MML.GM.characters[charName].inventory.armor;
	var mat = [];
    
    // Initialize APV Matrix
	var position;
    for (position in MML.hitPositions){
        mat[position] = { Surface: [{ value: 0, coverage: 100}], Cut: [{ value: 0, coverage: 100}], Chop: [{ value: 0, coverage: 100}], Pierce: [{ value: 0, coverage: 100}], Thrust: [{ value: 0, coverage: 100}], Impact: [{ value: 0, coverage: 100}], Flanged: [{ value: 0, coverage: 100}] };
    }
    
	//Creates raw matrix of individual pieces of armor (no layering or partial coverage)
    if (armor !== []){    
        for(var piece in armor){
            var style = MML.armorStyleList[armor[piece].style];
            var material = MML.APVList[armor[piece].material];
            
			var index;
            for(index in style.coverage){
                mat[style.coverage[index].position].Surface.push({ value: material.surface, coverage: style.coverage[index].coverage });
                mat[style.coverage[index].position].Cut.push({ value: material.cut, coverage: style.coverage[index].coverage });
                mat[style.coverage[index].position].Chop.push({ value: material.chop, coverage: style.coverage[index].coverage });
                mat[style.coverage[index].position].Pierce.push({ value: material.pierce, coverage: style.coverage[index].coverage });
                mat[style.coverage[index].position].Thrust.push({ value: material.thrust, coverage: style.coverage[index].coverage });
                mat[style.coverage[index].position].Impact.push({ value: material.impact, coverage: style.coverage[index].coverage });
                mat[style.coverage[index].position].Flanged.push({ value: material.flanged, coverage: style.coverage[index].coverage });
            }
        }
    }
    
	//This loop accounts for layered armor and partial coverage and outputs final APVs
	position = 0;
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
            coverageArray = coverageArray.sort(function(a,b){return a-b});
            
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
                apvToLayerArray = apvToLayerArray.sort(function(a,b){return b-a});
                
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
	state.MML.GM.characters[charName].apv = mat;
};

MML.updateInventory = function updateInventory(charName){
    //Armor
	var armor = [];
	var item = MML.getCharAttribute(charName, "repeating_armor_0_armorStyleName");
    var index = 0;
	while(typeof item !== "undefined"){
		armor[index] = { style: MML.getCharAttribute(charName, "repeating_armor_" + index + "_armorStyleName").get("current"), material: MML.getCharAttribute(charName, "repeating_armor_" + index + "_armorMaterial").get("current"), quality: MML.getCharAttribute(charName, "repeating_armor_" + index + "_armorQuality").get("current") };
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
MML.setStaticInitiativeBonuses = function setStaticInitiativeBonuses(charName){
    var armorList = state.MML.GM.characters[charName].inventory.armor;    
    
    //Senses
	var bitsOfHelm = ["Barbute Helm", "Bascinet Helm", "Camail", "Camail-Conical", "Cap", "Cheeks", "Conical Helm", "Duerne Helm", "Dwarven War Hood", "Face Plate", "Great Helm", "Half-Face Plate", "Hood", "Nose Guard", "Pot Helm", "Sallet Helm", "Throat Guard", "War Hat"];
    var senseArray = [];
	
	var bit;
    for (bit in bitsOfHelm){
		var piece;
        for (piece in armor){
            if (bitsOfHelm[bit] === armor[piece].style){
                senseArray.push(bitsOfHelm[bit]);
            }
        }
    }
    //no shit on head
    if (senseArray.length === 0){
        state.MML.GM.characters[charName].initiative.sense = 4;
    }
    else {
        //Head fully encased in metal
        if (senseArray.indexOf("Great Helm") !== -1 || (senseArray.indexOf("Sallet Helm") !== -1 && senseArray.indexOf("Throat Guard") !== -1)){
            state.MML.GM.characters[charName].initiative.sense = -2;
        }
        //wearing a helm
        else if (senseArray.indexOf("Barbute Helm") !== -1 || senseArray.indexOf("Sallet Helm") !== -1 || senseArray.indexOf("Bascinet Helm") !== -1 || senseArray.indexOf("Duerne Helm") !== -1 || senseArray.indexOf("Cap") !== -1 || senseArray.indexOf("Pot Helm") !== -1 || senseArray.indexOf("Conical Helm") !== -1 || senseArray.indexOf("War Hat") !== -1){
            //Has faceplate
            if (senseArray.indexOf("Face Plate") !== -1 ){
                //Enclosed Sides
                if (senseArray.indexOf("Barbute Helm") !== -1 || senseArray.indexOf("Bascinet Helm") !== -1 || senseArray.indexOf("Duerne Helm") !== -1){
                    state.MML.GM.characters[charName].initiative.sense = -2;
                }
                else {
                    state.MML.GM.characters[charName].initiative.sense = -1;
                }
            }
            //These types of helms or half face plate
            else if (senseArray.indexOf("Barbute Helm") !== -1 || senseArray.indexOf("Sallet Helm") !== -1 || senseArray.indexOf("Bascinet Helm") !== -1 || senseArray.indexOf("Duerne Helm") !== -1 || senseArray.indexOf("Half-Face Plate") !== -1){
                state.MML.GM.characters[charName].initiative.sense = 0;
            }
            //has camail or cheeks
            else if (senseArray.indexOf("Camail") !== -1 || senseArray.indexOf("Camail-Conical") !== -1 || senseArray.indexOf("Cheeks") !== -1){
                state.MML.GM.characters[charName].initiative.sense = 1;
            }
            //Wearing a hood
            else if (senseArray.indexOf("Dwarven War Hood") !== -1 || senseArray.indexOf("Hood") !== -1){
                var piece = 0;
                for (piece in armorList){
                    if (armorList[piece][0] === "Dwarven War Hood" || armorList[piece][0] === "Hood"){
                        if (MML.APVList[armorList[piece][1]].family === "Cloth"){
                            state.MML.GM.characters[charName].initiative.sense = 2;
                        }
                        else {
                            state.MML.GM.characters[charName].initiative.sense = 1;
                        }
                    }
                }
            }  
            //has nose guard
            else if (senseArray.indexOf("Nose Guard") !== -1){
                state.MML.GM.characters[charName].initiative.sense = 2;
            }
            // just some shit on the top of the head
            else {
                state.MML.GM.characters[charName].initiative.sense = 3;
            }
        }
        //Wearing a hood
        else if (senseArray.indexOf("Dwarven War Hood") !== -1 || senseArray.indexOf("Hood") !== -1){
            var piece;
            for (piece in armorList){
                if (armorList[piece][0] === "Dwarven War Hood" || armorList[piece][0] === "Hood"){
                    if (MML.APVList[armorList[piece][1]].family === "Cloth"){
                        state.MML.GM.characters[charName].initiative.sense = 2;
                    }
                    else {
                        state.MML.GM.characters[charName].initiative.sense = 1;
                    }
                }
            }
        }
    }
        
    //Move Ratio
    if (state.MML.GM.characters[charName].movement.movementRatio > 0.5 && state.MML.GM.characters[charName].movement.movementRatio < 0.7){
        state.MML.GM.characters[charName].initiative.movement.movementRatio = -4;
    }
    else if (state.MML.GM.characters[charName].movement.movementRatio >= 0.7 && state.MML.GM.characters[charName].movement.movementRatio <= 0.8){
        state.MML.GM.characters[charName].initiative.movement.movementRatio = -3;
    }
    else if (state.MML.GM.characters[charName].movement.movementRatio > 0.8 && state.MML.GM.characters[charName].movement.movementRatio <= 1.0){
        state.MML.GM.characters[charName].initiative.movement.movementRatio = -2;
    }
    else if (state.MML.GM.characters[charName].movement.movementRatio > 1.0 && state.MML.GM.characters[charName].movement.movementRatio <= 1.2){
        state.MML.GM.characters[charName].initiative.movement.movementRatio = -1;
    }
    else if (state.MML.GM.characters[charName].movement.movementRatio > 1.2 && state.MML.GM.characters[charName].movement.movementRatio <= 1.4){
        state.MML.GM.characters[charName].initiative.movement.movementRatio = 0;
    }
    else if (state.MML.GM.characters[charName].movement.movementRatio > 1.4 && state.MML.GM.characters[charName].movement.movementRatio <= 1.7){
        state.MML.GM.characters[charName].initiative.movement.movementRatio = 1;
    }
    else if (state.MML.GM.characters[charName].movement.movementRatio > 1.7 && state.MML.GM.characters[charName].movement.movementRatio <= 2.0){
        state.MML.GM.characters[charName].initiative.movement.movementRatio = 2;
    }
    else if (state.MML.GM.characters[charName].movement.movementRatio > 2.0 && state.MML.GM.characters[charName].movement.movementRatio <= 2.5){
        state.MML.GM.characters[charName].initiative.movement.movementRatio = 3;
    }
    else if (state.MML.GM.characters[charName].movement.movementRatio > 2.5 && state.MML.GM.characters[charName].movement.movementRatio <= 3.2){
        state.MML.GM.characters[charName].initiative.movement.movementRatio = 4;
    }
    else if (state.MML.GM.characters[charName].movement.movementRatio > 3.2){
        state.MML.GM.characters[charName].initiative.movement.movementRatio = 5;
    }
    
    //Ranking Attribute
	var attributeArray = [state.MML.GM.characters[charName].strength, state.MML.GM.characters[charName].coordination, state.MML.GM.characters[charName].reason, state.MML.GM.characters[charName].perception];
    var rankingAttribute = attributeArray.sort(function(a,b){return a-b})[0];
	
    if (rankingAttribute <= 9){
        state.MML.GM.characters[charName].initiative.attribute = -1;
    }
    else if (rankingAttribute === 10 || rankingAttribute === 11){
        state.MML.GM.characters[charName].initiative.attribute = 0;
    }
    else if (rankingAttribute === 12 || rankingAttribute === 13){
        state.MML.GM.characters[charName].initiative.attribute = 1;
    }
    else if (rankingAttribute === 14 || rankingAttribute === 15){
        state.MML.GM.characters[charName].initiative.attribute = 2;
    }
    else if (rankingAttribute === 16 || rankingAttribute === 17){
        state.MML.GM.characters[charName].initiative.attribute = 3;
    }
    else if (rankingAttribute === 18 || rankingAttribute === 19){ 
		state.MML.GM.characters[charName].initiative.attribute = 4;
    }
    else if (rankingAttribute >= 20){
        state.MML.GM.characters[charName].initiative.attribute = 5;
    }
};

//ToDo: Check if wielding 2 weapons
MML.setAttackTempo = function setAttackTempo(charName){
	var tempo;
	
	if (state.MML.GM.characters[charName].action.skill < 30){
		tempo = 0;
	}
	else if (state.MML.GM.characters[charName].action.skill < 40){
		tempo = 1;
	}
	else if (state.MML.GM.characters[charName].action.skill < 50){
		tempo = 2;
	}
	else if (state.MML.GM.characters[charName].action.skill < 60){
		tempo = 3;
	}
	else if (state.MML.GM.characters[charName].action.skill < 70){
		tempo = 4;
	}
	else{
		tempo = 5;
	}
	
	if (state.MML.GM.characters[charName].action.name === "attack" && state.MML.GM.characters[charName].inventory.weapons.length === 2){
		if (state.MML.GM.characters[charName].skills[twoWeaponFighting].value > 19 && state.MML.GM.characters[charName].skills[twoWeaponFighting].value < 40){
			tempo += 1;
		}
		else if (state.MML.GM.characters[charName].skills[twoWeaponFighting].value >= 40 && state.MML.GM.characters[charName].skills[twoWeaponFighting].value < 60){
			tempo += 2;
		}
		else if (state.MML.GM.characters[charName].skills[twoWeaponFighting].value >= 60){
			tempo += 3;
		}
		if (state.MML.GM.characters[charName].inventory.weapons.name === state.MML.GM.characters[charName].inventory.equipped.rightHand.name){
			tempo += 1;
		}	
	}
	state.MML.GM.characters[charName].initiative.tempo = MML.attackTempoTable[tempo];
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
				initiative  += weaponInits.sort(function(a,b){return b-a})[0];
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
			initiative  += MML.getInitiativeSkillBonus(this.skills[this.action.spell.school].value);
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

MML.setInitiative = function setInitiative(){
	var initiative = this.initiative.roll + this.initiative.situational + this.initiative.movementRatio + this.initiative.attribute + this.initiative.sense + this.initiative.fom + (this.initiative.action * this.initiative.tempo);
	
	if(this.hpHead.wound.mortal === true ||
	this.hpChest.wound.mortal === true ||
    this.hpAb.wound.mortal === true ||
    this.hpLA.wound.mortal === true ||
    this.hpRA.wound.mortal === true ||
    this.hpLL.wound.mortal === true ||
    this.hpRL.wound.mortal === true ||
	this.defense.dodge === true ||
	this.movement.movementRatio <= 0.5 ||
	initiative < 1)
	{ //If mortally wounded, dodged, too encumbered, or mods make initiative less than 1
		this.initiative.value = 0;
	}
	else{
		this.initiative.value = initiative;
	}
};

MML.rollInitiative = function rollInitiative(){	
	this.initiative.roll = MML.rollDice(1, 10);
	this.setInitiative();
};

MML.newRoundUpdate = function newRoundUpdate(){ 
	//Update wound counters, only major wounds have temporary effects. Disabling wound stun is handled with the .stun.duration property
	var i;
	for(i in MML.hitPoints){
		if(MML.hitPoints[i].name !== "multiWound"){
			if(this[MML.hitPoints[i].name].wound.major.duration > 0){
				this[MML.hitPoints[i].name].wound.major.duration--;
			}
		}
	}
	if(this.stun.duration > 0){ //if stun === -1, then stun is over
		this.stun.duration--;
	}
	
	// Handle fatigue don't use the fitness score to track fatigue, just use the combat state
	if (this.fatigue.inMelee === true){ // Character acted in melee
		this.fatigue.exertion++;
		this.fatigue.rest = 0;
		
		if (this.fatigue.level < 1){
			if (this.fatigue.exertion > this.fitness){
				if (MML.attributeCheckRoll(charName, "fitness", [0])){
					this.fatigue.level++;
					this.fatigue.exertion = 0;
				}
			}
		}
		else {
			if (this.fatigue.exertion > Math.round(this.fitness/2)){
				if (MML.attributeCheckRoll(charName, "fitness", [-4])){
					this.fatigue.level++;
					this.fatigue.exertion = 0;
				}
			}
		}
		this.fatigue.inMelee = false;
	}
	else if (this.fatigue.level > 0){
		this.fatigue.rest++;
		if (this.fatigue.rest >= 6 && this.attributeCheckRoll("health", [0])){
			this.fatigue.rest = 0;
			this.fatigue.level--;
			this.fatigue.exertion = 0;
		}
	}
	
	// Reset number of defenses counter
	this.defense.number = 0;
	this.defense.dodge = false;
	// Reset knockdown number
	this.knockdown.current = this.knockdown.max;
	// Decrement stumble effect
	this.stumble--;
	// Decrement sensitive area effect
	this.sensitive--;
	// Reset action counter
	this.initiative.action = 0;
	// Reset currentRoll
	this.currentRoll = { accepted:false };
};

MML.setReady = function setReady(ready){
	this.ready = ready;

	if(state.MML.GM.inCombat === true && ready === false){
		MML.getTokenFromChar(this.name).set("tint_color", "#FF0000");
	}
	else{
		MML.getTokenFromChar(this.name).set("tint_color", "transparent");
	}
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
	
	if (this.movement.position !== "Prone"){
		this.knockdown.current += damage;
		
	    if (this.knockdown.current < 0) {
	        return true;
	    }		
		else{
			return false;
		}
	}
};

MML.knockdownRoll = function knockdownRoll(){
	var roll;

	if(this.stumble !== 1){
		roll = this.attributeCheckRoll("systemStrength", [0]);
	}	
	else{//victim saved first hit, harder to save 2nd time
		roll = this.attributeCheckRoll("systemStrength", [-5]);
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

MML.characterMenuStart = function characterMenuStart(input){
	if(state.MML.GM.inCombat === true){
		this.menu = MML.characterMenuCombat;
	}
	else{
		this.menu = MML.characterMenuMain;
	}
	this.menu("entry");
};

MML.characterMenuCombat = function characterMenuCombat(input){
	var message;
	switch(input){
		case "entry":
			if(state.MML.GM.roundStarted === true){
				message = "Change " + this.name + "'s action for -10 Initiative";			
			}
			else{
				message = "Choose an action for " + this.name;	
			}
			this.setReady(false);
			this.displayMenu(message, ["Attack", "Cast", "Ready Item", "Observe", "Ready"]);
		break;
		case "Attack":
			this.menu = MML.characterMenuAttack;
			this.menu("entry");
		break;
		case "Cast":
			this.menu = MML.characterMenuCast;
			this.menu("entry");
		break;
		case "Ready Item":
			this.menu = MML.characterMenuReadyItem;
			this.menu("entry");
		break;
		case "Observe":
			this.menu = MML.characterMenuObserve;
			this.menu("entry");
		break;
		case "Ready":
			this.setReady(true);
		break;
		default:
		break;			
	}
};

MML.characterMenuMain = function characterMenuMain(input){
	sendChat("","Feature Not Implemented");
};

MML.characterMenuAttack = function characterMenuAttack(input){
	if (this.inventory.weapons[0].family === "MWD" || //Ranged
	this.inventory.weapons[0].family === "MWM" ||
	this.inventory.weapons[0].family === "TWH" || 
	this.inventory.weapons[0].family === "TWK" ||
	this.inventory.weapons[0].family === "TWS" ||
	this.inventory.weapons[0].family === "SLI" ){
		switch(input){
			case "entry":
				this.action.style = "standard";
				this.action.calledShot = "standard";
				this.displayMenu("Ranged Attack Options: ", ["Target", "Called Shot", "Style", "Ready"]);
			break;
			case "Target":
				sendChat("", "&{template:selectTarget} {{charName=" + this.name + "}}");
			break;
			case "Called Shot":
				this.menu = MML.characterMenuCalledShot;
				this.menu("entry");
			break;
			case "Style":
				this.menu = MML.characterMenuAttackStyle;
				this.menu("entry");
			break;
			case "Ready":
				this.setReady(true);
			break;
			default:
			break;			
		}
	}
	else {//Melee	
			switch(input){
			case "entry":
				this.action.style = "standard";
				this.action.calledShot = "standard";
				this.action.stance = "neutral";
				this.displayMenu("Melee Attack Options: ", ["Target", "Called Shot", "Style", "Stance", "Ready"]);
			break;
			case "Target":
				sendChat("", "&{template:selectTarget} {{charName=" + this.name + "}}");
			break;
			case "Called Shot":
				this.menu = MML.characterMenuCalledShot;
				this.menu("entry");
			break;
			case "Style":
				this.menu = MML.characterMenuAttackStyle;
				this.menu("entry");
			break;
			case "Stance":
				this.menu = MML.characterMenuAttackStance;
				this.menu("entry");
			break;
			case "Ready":
				this.menu = MML.characterMenuAttackAction;
				this.setReady(true);
			break;
			default:
			break;			
		}
	}
};

MML.characterMenuAttackStyle = function characterMenuAttackStyle(input){
    if (this.inventory.weapons[0].family === "MWD" || //Ranged
	this.inventory.weapons[0].family === "MWM" ||
	this.inventory.weapons[0].family === "TWH" || 
	this.inventory.weapons[0].family === "TWK" ||
	this.inventory.weapons[0].family === "TWS" ||
	this.inventory.weapons[0].family === "SLI" ){
		switch(input){
			case "entry":
				this.menu = MML.characterMenuAttackStyle;
				this.displayMenu("Style Options:", ["Standard", "Shoot from Cover"]);
			break;
			case "Standard":
				this.action.style = "standard";
				this.menu = MML.characterMenuAttack;
				this.menu("entry");
			break;
			case "Shoot from Cover":
				this.action.style = "fromCover";
				this.menu = MML.characterMenuAttack;
				this.menu("entry");
			break;
			default:
			break;			
		}
	}
	else {//Melee
			switch(input){
			case "entry":
				this.menu = MML.characterMenuAttackStyle;
				this.displayMenu("Style Options:", ["Standard", "Sweep"]);
			break;
			case "Standard":
				this.action.style = "standard";
				this.menu = MML.characterMenuAttack;
				this.menu("entry");
			break;
			case "Sweep":
				this.action.style = "sweep";
				this.menu = MML.characterMenuAttack;
				this.menu("entry");
			break;
			default:
			break;			
		}
	}
};

// generalize this. characters need an list of body parts, read from the list when calling shots 
MML.characterMenuCalledShot = function characterMenuCalledShot(input){
	switch(input){
			case "entry":
				this.menu = MML.characterMenuCalledShot;
				this.displayMenu("Pick a Body Part to Attack:", ["Head", "Chest", "Abdomen", "Left Arm", "Right Arm", "Left Leg", "Right Leg"]);
			break;
			case "Head":
				this.action.calledShot = "head";
				this.menu = MML.characterMenuAttack;
				this.menu("entry");
			break;
			case "Chest":
				this.action.calledShot = "chest";
				this.menu = MML.characterMenuAttack;
				this.menu("entry");
			break;
			case "Abdomen":
				this.action.calledShot = "abdomen";
				this.menu = MML.characterMenuAttack;
				this.menu("entry");
			break;
			case "Left Arm":
				this.action.calledShot = "leftArm";
				this.menu = MML.characterMenuAttack;
				this.menu("entry");
			break;
			case "Right Arm":
				this.action.calledShot = "rightArm";
				this.menu = MML.characterMenuAttack;
				this.menu("entry");
			break;
			case "Left Leg":
				this.action.calledShot = "leftLeg";
				this.menu = MML.characterMenuAttack;
				this.menu("entry");
			break;
			case "Right Leg":
				this.action.calledShot = "rightLeg";
				this.menu = MML.characterMenuAttack;
				this.menu("entry");
			break;
			default:
			break;			
		}
};

MML.characterMenuAttackStance = function characterMenuAttackStance(input){
	switch(input){
			case "entry":
				this.menu = MML.characterMenuAttackStance;
				this.displayMenu("Attack Stances:", ["Aggressive", "Neutral", "Defensive"]);
			break;
			case "Aggressive":
				this.action.stance = "aggressive";
				this.menu = MML.characterMenuAttack;
				this.menu("entry");
			break;
			case "Neutral":
				this.action.stance = "neutral";
				this.menu = MML.characterMenuAttack;
				this.menu("entry");
			break;
			case "Defensive":
				this.action.stance = "defensive";
				this.menu = MML.characterMenuAttack;
				this.menu("entry");
			break;
			default:
			break;			
		}
};

MML.meleeDefenseMenu = function meleeDefenseMenu(input){
	var roll = {};
	var weapon = this.inventory.weapons[0];
    var weaponSkill = Math.round(this.skills[weapon.name].value/2);
	var shieldMod = this.inventory.shield.defenseMod;
	var dodgeSkill = this.skills.dodge.value;
	var defaultMartialSkill = this.skills.defaultMartial.value;
	var defenseMod = this.modifiers.defense;
    var sitMod = this.modifiers.situational;
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

	switch(input){
		case "entry":
			this.displayMenu("How will " + this.name + " defend? Block: "  + blockChance + " Dodge: " + dodgeChance, ["Block", "Dodge", "Take It"]);
		break;
		case "Block":
			this.defense.style = input;
			this.setReady(true);
			this.menu = MML.characterMenuStart;
		break;
		case "Dodge":
			this.defense.style = input;
			this.setReady(true);
			this.menu = MML.characterMenuStart;
		break;
		case "Take It":
			this.defense.style = input;
			this.setReady(true);
			this.menu = MML.characterMenuStart;
		break;
		default:
		break;
	}
};

MML.moveDistance = function moveDistance(distance){
	log("here");
	//this.movement.available -= (distance)/(this.movement.rates[this.movement.position]);
	//this.displayMovementAura();
};
