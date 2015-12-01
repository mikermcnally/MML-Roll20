// This file contains all menus and defines the player object class

MML.playerClass = {
    displayMenu: MML.displayMenu,
    trigger: function trigger(input){
    	if(typeof(buttons[input]) !== "undefined"){
    		state.MML.players[this.player].setMenu(this.buttons[input].nextMenu, this.menu);
    		this.buttons[input].triggeredMethod();
    	}
    },
    message: "", //
    buttons: {}, //{text: "Click Here", nextMenu: MML.mainMenu, triggeredMethod: MML.triggeredMethod}
    name: "",
    characters: [],
    characterIndex: 0,
    menu: ""
};

MML.GmMenuMain = function GmMenuMain(){
	this.menu = "GM";
	this.message = "Main Menu: ";
	this.buttons = [MML.menuButtons.combatMenu, 
					MML.menuButtons.newCharacterMenu,
					MML.menuButtons.newItemMenu,
					MML.menuButtons.worldMenu,
					MML.menuButtons.utilitiesMenu
					];
};

MML.GmMenuChangeRoll = function GmMenuChangeRoll(){
	this.menu = "GM";
	this.message = "Change roll";
	this.buttons = [MML.menuButtons.acceptRoll, 
					MML.menuButtons.changeRoll];
};

MML.GmMenuCombat = function GmMenuCombat(){
	this.menu = "GM";
	this.message = "Select tokens and begin.";
	this.buttons = [MML.menuButtons.startCombat, 
					MML.menuButtons.toMainGmMenu,
					];
};

MML.GmMenuNewItem = function GmMenuNewItem(){
	this.menu = "GM";
	this.message = "Select item type:";
	this.buttons = [MML.menuButtons.newWeapon, 
					MML.menuButtons.newArmor,
					MML.menuButtons.newSpellComponent,
					MML.menuButtons.newMiscItem
					];
};

MML.GmMenuNewWeapon = function GmMenuNewWeapon(){
	this.menu = "GM";
	this.message = "Select weapon type:";
	this.buttons = [];

	var index;
	for(index in MML.items){
		if(MML.items[index].type === "weapon"){
			var item = MML.items[index];
			this.buttons.push({
				text: item.name,
				nextMenu: MML.GmMenuItemQuality,
			});
		}
	}

	index = 0;
	for(index in this.buttons){
		log(this.buttons[index].text);
		this.buttons[index].triggeredMethod = function() {
			state.MML.GM.newItem = MML.items[this.buttons[index].text];
			this.displayMenu();
		}
	}
};

MML.GmMenuNewItemProperties = function GmMenuNewItemProperties(){
	this.menu = "GM";
	this.message = "Add new properties:";
	this.buttons = [MML.menuButtons.assignItem
					];
};

MML.GmMenuAssignItem = function GmMenuAssignItem(){
	this.menu = "GM";
	this.message = "Select character:";
	this.buttons = [];

	var index;
	for(index in state.MML.GM.characters){
		this.buttons.push({
			text: index,
			nextMenu: MML.GmMenuMain,
			triggeredMethod: function triggeredMethod(){
				this.displayMenu();
			}
		});
	}
};

MML.GmMenuItemQuality = function GmMenuItemQuality(){
	this.menu = "GM";
	this.message = "Select a quality level:";
	this.buttons = [MML.menuButtons.itemQualityPoor, 
					MML.menuButtons.itemQualityStandard,
					MML.menuButtons.itemQualityExcellent,
					MML.menuButtons.itemQualityMasterWork];
};

MML.GmMenuStartRound = function GmMenuStartRound(){
	this.menu = "GM";
	this.message = "Start round when all characters are ready.";
	this.buttons = [MML.menuButtons.startRound, 
					MML.menuButtons.endCombat];
};

// MML.GmMenuStartRound = function GmMenuStartRound(){
// 	this.menu = "GM";
// 	this.message = "Prepare actions and start the round";
// 	this.buttons = [MML.menuButtons.startRound, 
// 					MML.menuButtons.endCombat];
// };

MML.charMenuPrepareAction = function menuPrepareAction(){
	this.menu = this.characters[this.characterIndex];
	this.message =  "Prepare " + this.menu + "'s action";
	this.buttons = [MML.menuButtons.setActionAttack, 
					MML.menuButtons.setActionCast,
					MML.menuButtons.setActionReadyItem,
					MML.menuButtons.setActionObserve,
					MML.menuButtons.actionPrepared];
};
MML.GmMenuStartAction = function GmMenuStartAction(){
	this.menu = "GM";
	this.message =  "Start " + state.MML.GM.actor + "'s action";
	this.buttons = [MML.menuButtons.startAction];
};
MML.charMenuMovement = function charMenuMovement(){
	this.menu = state.MML.GM.actor;
	this.message =  "Move " + state.MML.GM.actor + " and choose targets.";
	this.buttons = [MML.menuButtons.setProne,
					MML.menuButtons.setStalk,
					MML.menuButtons.setCrawl,
					MML.menuButtons.setWalk,
					MML.menuButtons.setJog,
					MML.menuButtons.setRun,
					MML.menuButtons.chooseTargets,
					MML.menuButtons.endAction];
};
MML.charMenuChooseTargets = function charMenuChooseTargets(){
	this.menu = state.MML.GM.actor;
	this.message = "Select from available targets.";
	this.buttons = [];

	var index;
	for(index in state.MML.GM.combatants){
		this.buttons.push({
			text: state.MML.GM.combatants[index],
			nextMenu: state.MML.GM.characters[this.menu].action.roll,
			triggeredMethod: function triggeredMethod(){
				this.displayMenu();
			}
		});
	}
};
MML.charMenuAttackRoll = function charMenuAttackRoll(){
	this.menu = state.MML.GM.actor;
	this.message =  "Roll Attack.";
	this.buttons = [MML.menuButtons.rollDice];
};
MML.charMenuDefenseRoll = function charMenuDefenseRoll(){
	this.menu = state.MML.GM.currentTarget;

	var weapon = state.MML.GM.characters[this.menu].inventory.weapons[0];
    var weaponSkill = Math.round(state.MML.GM.characters[this.menu].skills[weapon.name].value/2);
	var shieldMod = state.MML.GM.characters[this.menu].inventory.shield.defenseMod;
	var dodgeSkill = state.MML.GM.characters[this.menu].skills.dodge.value;
	var defaultMartialSkill = state.MML.GM.characters[this.menu].skills.defaultMartial.value;
	var defenseMod = state.MML.GM.characters[this.menu].modifiers.defense;
    var sitMod = state.MML.GM.characters[this.menu].modifiers.situational;
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

	this.message = "How will " + this.menu + " defend? Block: "  + blockChance + " Dodge: " + dodgeChance;
	this.buttons = [MML.menuButtons.defenseBlock,
					MML.menuButtons.defenseDodge,
					MML.menuButtons.defenseTakeIt];
};



MML.menuButtons = {};
MML.menuButtons.combatMenu = {
	text: "Combat",
	nextMenu: MML.GmMenuCombat,
	triggeredMethod: function triggeredMethod(){
		this.displayMenu();
	}
};
MML.menuButtons.newCharacterMenu = {
	text: "New Character",
	nextMenu: MML.GmMenuNewCharacter,
	triggeredMethod: function triggeredMethod(){
		this.displayMenu();
	}
};

MML.menuButtons.newItemMenu = {
	text: "New Item",
	nextMenu: MML.GmMenuNewItem,
	triggeredMethod: function triggeredMethod(){
		this.displayMenu();
	}
};
MML.menuButtons.newWeapon = {
	text: "Weapon",
	nextMenu: MML.GmMenuNewWeapon,
	triggeredMethod: function triggeredMethod(){
		this.displayMenu();
	}
};

MML.menuButtons.newArmor = {
	text: "Armor",
	nextMenu: MML.GmMenuNewArmor,
	triggeredMethod: function triggeredMethod(){
		this.displayMenu();
	}
};
MML.menuButtons.newSpellComponent = {
	text: "Spell Component",
	nextMenu: MML.GmMenuNewSpellComponent,
	triggeredMethod: function triggeredMethod(){
		this.displayMenu();
	}
};
MML.menuButtons.newMiscItem = {
	text: "Misc",
	nextMenu: MML.GmMenuNewMiscItem,
	triggeredMethod: function triggeredMethod(){
		this.displayMenu();
	}
};
MML.menuButtons.itemQualityPoor = {
	text: "Poor",
	nextMenu: MML.GmMenuNewItemProperties,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.newItem.quality = "Poor";
		this.displayMenu();
	}
};
MML.menuButtons.itemQualityStandard = {
	text: "Standard",
	nextMenu: MML.GmMenuNewItemProperties,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.newItem.quality = "Standard";
		this.displayMenu();
	}
};
MML.menuButtons.itemQualityExcellent = {
	text: "Excellent",
	nextMenu: MML.GmMenuNewItemProperties,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.newItem.quality = "Excellent";
		this.displayMenu();
	}
};
MML.menuButtons.itemQualityMasterWork = {
	text: "Master Work",
	nextMenu: MML.GmMenuNewItemProperties,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.newItem.quality = "Master Work";
		this.displayMenu();
	}
};
MML.menuButtons.assignItem =  {
	text: "Assign Item",
	nextMenu: MML.GmMenuMain,
	triggeredMethod: function triggeredMethod(){
		sendChat("", "&{template:selectTarget} {{charName=" + this.name + "}} {{triggeredMethod=assignItem}}");
	}
};

MML.menuButtons.worldMenu = {
	text: "World",
	nextMenu: MML.GmMenuWorld,
	triggeredMethod: function triggeredMethod(){
		this.displayMenu();
	}
};
MML.menuButtons.utilitiesMenu = {
	text: "Utilities",
	nextMenu: MML.GmMenuUtilities,
	triggeredMethod: function triggeredMethod(){
		this.displayMenu();
	}
};
MML.menuButtons.startCombat = {
	text: "Start Combat",
	nextMenu: MML.menuPrepareAction,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.startCombat();
	}
};
MML.menuButtons.toMainGmMenu = {
	text: "Back",
	nextMenu: MML.GmMenuMain,
	triggeredMethod: function triggeredMethod(){
		this.displayMenu();
	}
};
MML.menuButtons.combatMenu = {
	text: "Combat",
	nextMenu: MML.GmMenuCombat,
	triggeredMethod: function triggeredMethod(){
		this.displayMenu();
	}
};
MML.menuButtons.startRound = {
	text: "Start Round",
	nextMenu: MML.GmMenuStartRound,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.startRound();
	}
};
MML.menuButtons.endCombat = {
	text: "End Combat",
	nextMenu: MML.GmMenuMain,
	triggeredMethod: function triggeredMethod(){
		this.endCombat();
	}
};
MML.menuButtons.setActionAttack = {
	text: "Attack",
	nextMenu: MML.charMenuAttack,
	triggeredMethod: function triggeredMethod(){
		this.displayMenu();
	}
};
MML.menuButtons.setActionCast = {
	text: "Cast",
	nextMenu: MML.charMenuCast,
	triggeredMethod: function triggeredMethod(){
		this.displayMenu();
	}
};
MML.menuButtons.setActionReadyItem = {
	text: "Ready Item",
	nextMenu: MML.charMenuReadyItem,
	triggeredMethod: function triggeredMethod(){
		sendChat("", "Ready Item not ready...lol");
		this.displayMenu();
	}
};
MML.menuButtons.setActionObserve = {
	text: "Observe",
	nextMenu: MML.menuPrepareAction,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.characters[this.character].action.name = "observe";
		sendChat("", "Observe");
		this.displayMenu();
	}
};
MML.menuButtons.actionPrepared = {
	text: "Ready",
	nextMenu: MML.charMenuPrepareAction,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.characters[this.menu].setReady(true);
		this.characterIndex++;
		if(this.characterIndex < this.characters.length){
			this.displayMenu();
		}
		else if(this.name === state.MML.GM.player){
			this.setMenu = MML.GmMenuStartRound;
			this.displayMenu();
		}
	}
};
MML.menuButtons.startAction = {
	text: "Start",
	nextMenu: MML.GmMenuStartAction,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.startAction();
	}
};
MML.menuButtons.chooseTargets = {
	text: "Choose Targets",
	nextMenu: MML.charMenuChooseTargets,
	triggeredMethod: function triggeredMethod(){
		this.displayMenu();
	}
};

MML.menuButtons.endAction = {
	text: "End Action",
	nextMenu: MML.charMenuPrepareAction,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.endAction();
	}
};
MML.menuButtons.rollDice = {
	text: "Roll",
	nextMenu: MML.charMenuIdle,
	triggeredMethod: function triggeredMethod(){
		log(state.MML.GM.currentRoll);
		state.MML.GM.currentRoll.getRoll();
	}
};
MML.menuButtons.rollHitPosition = {
	text: "Roll",
	nextMenu: MML.charMenuRollDamage,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.getHitPositionRoll();
	}
};
MML.menuButtons.setProne = {
	text: "Prone",
	nextMenu: MML.charMenuMovement,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.characters[this.menu].movement.position = "Prone";
		state.MML.GM.characters[this.menu].displayMovement(true);
	}
};
MML.menuButtons.setCrawl = {
	text: "Crawl",
	nextMenu: MML.charMenuMovement,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.characters[this.menu].movement.position = "Crawl";
		state.MML.GM.characters[this.menu].displayMovement(true);
	}
};
MML.menuButtons.setStalk = {
	text: "Stalk",
	nextMenu: MML.charMenuMovement,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.characters[this.menu].movement.position = "Stalk";
		state.MML.GM.characters[this.menu].displayMovement(true);
	}
};
MML.menuButtons.setWalk = {
	text: "Walk",
	nextMenu: MML.charMenuMovement,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.characters[this.menu].movement.position = "Walk";
		state.MML.GM.characters[this.menu].displayMovement(true);
	}
};
MML.menuButtons.setJog = {
	text: "Jog",
	nextMenu: MML.charMenuMovement,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.characters[this.menu].movement.position = "Jog";
		state.MML.GM.characters[this.menu].movement.displayMovement(true);
	}
};
MML.menuButtons.setRun = {
	text: "Run",
	nextMenu: MML.charMenuMovement,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.characters[this.menu].movement.position = "Run";
		state.MML.GM.characters[this.menu].displayMovement(true);
	}
};
MML.menuButtons.defenseBlock = {
	text: "Block",
	nextMenu: MML.charMenuIdle,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.characters[this.menu].defense.style = "Block";
		state.MML.GM.characters[this.menu].defense.number++;
		state.MML.GM.getDefenseRoll();
	}
};
MML.menuButtons.defenseDodge = {
	text: "Dodge",
	nextMenu: MML.charMenuIdle,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.characters[this.menu].defense.style = "Dodge";
		state.MML.GM.characters[this.menu].defense.number++;
		state.MML.GM.characters[this.menu].defense.dodge = true;
		state.MML.GM.getDefenseRoll();
	}
};
MML.menuButtons.defenseTakeIt = {
	text: "Take It",
	nextMenu: MML.charMenuIdle,
	triggeredMethod: function triggeredMethod(){
		state.MML.GM.characters[this.menu].defense.style = "Take It";
		state.MML.GM.getDefenseRoll();
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
				this.menu = MML.performAction;
				this.menu();
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

	if(this.characters[this.combatants[0]].initiative.value < 1){
		
	}
	else{
		this.menu = MML.GmMenuCombat;
		this.menu("Start Action");
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
		
		if(this.actor.initiative.value < 1){
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
			this.menu = MML.GmMenuCombat;
			this.menu("Next Round");
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
			this.menu = "newCharacter";
			this.displayMenu("Enter Character Name", buttonArray);
		break;
		case "Name":
			// character.name = input;
			this.menuInfo.character = character;
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
			this.menu = "chooseRace";
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
	
	this.menuInfo.character = character;
};

MML.GmMenuChooseGender = function chooseGender(input){
	var character = this.menuInfo.character;
	var buttonArray = ["Female", "Male"];
	
	switch(input){
		case "entry":
			this.menu = "chooseGender";
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
	this.menuInfo.character = character;
};
 
MML.GmMenuRollAttributes = function rollAttributes(input){
	var character = this.menuInfo.character; 
	var rollArray = this.menuInfo.rollArray;
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
				this.menu = "rollAttributes";
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
				this.menuInfo.rollArray = rollArray;
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
				this.menuInfo.rollArray = rollArray;
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
				this.menuInfo.rollArray = rollArray;
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
				this.menuInfo.rollArray = rollArray;
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
				this.menuInfo.rollArray = rollArray;
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
				this.menuInfo.rollArray = rollArray;
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
				this.menuInfo.rollArray = rollArray;
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
				this.menuInfo.rollArray = rollArray;
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
				this.menuInfo.rollArray = rollArray;
				MML.GmMenu.rollAttributes("entry");
			break;
			default:
			break;			
		}
	}

	else{
		MML.GmMenu.chooseSkills("entry");
	}
	
	this.menuInfo.character = character;
};

MML.GmMenuChooseSkills = function chooseSkills(input){
	var character = this.menuInfo.character;
	var skillArray = [];
	var buttonArray = [];

	var index;
	for(index in MML.skills){
		buttonArray.push(MML.skills[index].name); //{ name: "Acrobatics", current: 0, attribute: "coordination", mods: [{ name: , value: }]};
	} 

	if(input === "entry"){
		this.menu = "chooseSkills";
		this.displayMenu( "Choose Skills", buttonArray);
	}
	else{
		//character.skills = set here
	}
	this.menuInfo.character = character;
};

MML.GmMenuWorld = function world(input){
	//pass time, travel, other stuff
};

MML.GmMenuUtilities = function utilities(input){
	//edit states and other api stuff
};


