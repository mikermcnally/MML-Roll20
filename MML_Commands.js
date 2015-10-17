MML.menuClass = {
    display: function display(){
    	this.displayMenu(this.message, buttons);
    },
    message: "",
    buttons: {}
    
};

MML.GmMenuMain = function GmMenuMain(input){
    var buttonArray = ["Combat", "New Character", "World", "Utilities"];
    
	switch(input){
		case "entry":
			//this.displayMenu(this.player, this.player, "Main Menu:", buttonArray);
			this.displayMenu("Main Menu:", buttonArray);
		break;
		case "Combat":
			this.menu = MML.GmMenuCombat;
			this.menu("entry");
		break;
		case "New Character":
			this.menu = MML.GmMenuNewCharacter;
			this.menu("entry");
		break;
		case "World":
			this.menu = MML.GmMenuWorld;
			this.menu("entry");
		break;
		case "Utilities":
			this.menu = MML.GmMenuUtilities;
			this.menu("entry");
		break;
		default:
		break;			
	}

};

MML.GmMenuMain = {
	display: function display(){

     },
     buttons: [""]

MML.GmMenuCombat = function GmMenuCombat(input){
	//select tokens and begin
	switch(input){
		case "entry":
			var buttonArray = ["Start Combat", "Back"];
			
			this.displayMenu("Select tokens and begin", buttonArray);
		break;
		case "Start Combat":
			this.menu = MML.startCombat;
			this.menu();
		break;
		case "End Combat":
			this.menu = MML.endCombat;
			this.menu();
		break;
		case "Start Action":
			this.menu = MML.startAction;
			this.menu("entry");
			//go to self or new round
		break;
		case "Next Round":
			this.menu = MML.nextRound;
			this.menu();
		break;
		default:
		break;
			
	}
};

MML.startCombat = function startCombat() {
    this.currentRound = 0;
    this.roundStarted = false;
	this.combatants = this.selectedCharacters; 

	if(this.combatants.length > 0){
		this.inCombat = true;
		var index;
		for (index in this.combatants){
			//set token to red for "not ready"
			this.characters[this.combatants[index]].setReady(false);
			this.characters[this.combatants[index]].initiative.value = 0;
		}
		
		this.setTurnOrder(); //Puts combatants in the initiativepage
		//this.turnInfo = { charName: this.combatants[0], step: "newRound", currentRoll: {}, accepted: false };
		Campaign().set("initiativepage", "true");
		this.menu = MML.GmMenuCombat;
		this.menu("Next Round");
	}
	else{
		sendChat("", "&{template:charMenu} {{name=Error}} {{message=No tokens selected}}");
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

MML.startAction = function startAction(input){
	switch(input){
		case "entry":
			state.MML.waitingForUser = this.player;
			this.actor = this.combatants[0];

			var buttonArray = ["Start Action"];
			
			this.displayMenu("Wait for characters to be ready", buttonArray);
		break;
		case "Start Action":
			if (this.checkReady()) {
				this.actor = this.combatants[0];
				this.targets = this.characters[this.actor].action.targets;
				this.targetIndex = 0;
				this.currentTarget = this.targets[this.targetIndex];
				this.rolls = {};
				this.initRolls = this.characters[this.actor].action.rolls;
				this.initRolls();
				this.menu = MML.performAction;
				this.waitingForUser = this.characters[this.actor].player;
			}
		break;
		default:
		break;
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
}

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
		var index = 0;
		for (index in this.combatants){
			this.characters[this.combatants[index]].setReady(false);
			this.characters[this.combatants[index]].newRoundUpdate();
			this.characters[this.combatants[index]].computeSitMods();
		}
		// this.roundStarted = false;
		
		// sendChat("", "&{template:charMenu} {{button=[End Round](!main)}}");
		this.menu = MML.GmMenuCombat;
		this.menu("Next Round");
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

MML.nextRound = function nextRound(){
	if(this.checkReady() === true){
		var index;
		for(index in this.combatants){
			this.characters[this.combatants[index]].computeSitMods();
			this.characters[this.combatants[index]].rollInitiative();
		}
		this.setTurnOrder();
		this.currentRound++;
		this.roundStarted = true;

		this.menu = MML.GmMenuCombat;
		this.menu("Start Action");
	}
	else{
		var buttonArray = ["Next Round", "End Combat"];
		
		this.displayMenu("Prepare actions and start the round", buttonArray);
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

state.MML.GM.checkReady = function checkReady(){
	var everyoneReady = true;
	
	var charName;
	var index;
	for(index in this.combatants){
		if(this.characters[this.combatants[index]].ready === false){
			everyoneReady = false;
		}
	}
	return everyoneReady;
};

// Turn Order Functions
state.MML.GM.setTurnOrder = function setTurnOrder(){
	var turnorder = [];

	var index;
	for (index in this.combatants){
		turnorder.push({
			id: MML.getTokenFromChar(this.combatants[index]).id,
			pr: this.characters[this.combatants[index]].initiative.value,
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


state.MML.GM.changeRoll = function changeRoll(value){
	var range = this.currentRoll.range.split("-");
	var low = range[0]*1;
	var high = range[1]*1;
	
	if(value >= low && value <= high){
		switch(this.currentRoll.name){
			case "damage":
				this.currentRoll.value = -value;
				break;
			case "universal":
				this.currentRoll.value = value;
				this.currentRoll = MML.universalRollResult(this.currentRoll);
				break;
			case "attribute":
				this.currentRoll.value = value;
				this.currentRoll = MML.attributeCheckResult(this.currentRoll);
				break;
			case "hitPosition":
				state.MML.GM.currentRoll.value = value;
				state.MML.GM.currentRoll.result = MML.hitPositions[value].name;
				break;
			default:
				sendChat("Error", "Roll name not recognized.");
		}
	}
	else{
		sendChat("Error", "New roll value out of range.");
	}
};


MML.parseCommand = function parseCommand(msg) {
	log(msg.content);
	if(msg.type === "api" && msg.content.indexOf("!test") !== -1) {
        MML.test();
    }

	else if(msg.type === "api" && msg.content.indexOf("!main") !== -1) {
		MML.main();
    }
	
	else if(msg.type === "api" && msg.content.indexOf("!changeRoll") !== -1) {
		var rollArray = msg.content.replace("!changeRoll ", "").split("|");
		var charName = rollArray[0];
		var menuInput = rollArray[1];
		var value = rollArray[2]*1;
		
		if(typeof value === "number"){
			state.MML.GM.changeRoll(value);
			state.MML.GM.displayRoll();
		}
		else{
			sendChat("Error", "Please enter a numerical value.");
		}		
    }
	
	else if(msg.type === "api" && msg.content.indexOf("!acceptRoll") !== -1) {
		//var input = msg.content.replace("!acceptRoll ", "").split("|");
		// var charName = input[0];
		// var menuInput = input[1];
		if(state.MML.GM.currentRoll.accepted === false){
			state.MML.GM.currentRoll.accepted = true;
			state.MML.GM.menu("result");
		}
    }
	
	// else if(msg.type === "api" && msg.content.indexOf("!startCombat") !== -1) {
 //        MML.startCombat(msg.selected);
	// 	MML.main();
 //    }    
    
 //    else if(msg.type === "api" && msg.content.indexOf("!ready") !== -1) {
 //        state.MML.GM.characters[msg.content.replace("!ready ", "")].setReady(true);
	// 	state.MML.GM.characters[msg.content.replace("!ready ", "")].menu = MML.characterMenuAttackAction;
 //    }
    
	else if(msg.type === "api" && msg.content.indexOf("!characterMenu") !== -1) {
		var input = msg.content.split("|");
		if(state.MML.waitingForUser === msg.who || state.MML.waitingForUser === ""){
			state.MML.waitingForUser = "";
			state.MML.GM.characters[input[1]].menu(input[2]);
		}
		
    }

	else if(msg.type === "api" && msg.content.indexOf("!gmMenu") !== -1) {
		var input = msg.content.split("|");
		state.MML.GM.selectedCharacters = [];
		tokens = MML.getSelectedTokens(msg.selected);

		var index;
		for(index in tokens){
			state.MML.GM.selectedCharacters[index] = MML.getCharFromToken(tokens[index]);
		}

		if(state.MML.waitingForUser === msg.who || state.MML.waitingForUser === ""){
			state.MML.waitingForUser = "";
			state.MML.GM.menu(input[1]);
		}
    }
	
	else if(msg.type === "api" && msg.content.indexOf("!selectTarget") !== -1) {
		var input = msg.content.replace("!selectTarget ", "").split("|");
		state.MML.GM.characters[input[0]].action.target = [input[1]];
		state.MML.GM.characters[input[0]].menu("entry");
    }
};

on("ready", function() {
    on("add:character", function(character) {
        MML.createAttributesFromArray(MML.charTraits, character);
        MML.createAttributesFromArray(MML.primaryAttributes, character);
        MML.createAttributesFromArray(MML.secondaryAttributes, character);
        MML.createAttributesFromArray(MML.hitPoints, character);
        MML.createAttributesFromArray(MML.movement, character);
		MML.createAttributesFromArray(MML.combatAttributes, character);
    });

    on("chat:message", function(msg) {
        var chatCmd = MML.parseCommand(msg);
        if (typeof chatCmd === 'undefined') {
            return;
        }
    });

    on("change:token", function(obj, prev) {
    	if(obj.get("left") !== prev["left"] && obj.get("top") !== prev["top"] && state.MML.GM.inCombat === true){
    		var charName = MML.getCharFromToken(obj);

    		if(state.MML.GM.actor === charName){
    			var distance = MML.getDistance(obj.get("left"), prev["left"], obj.get("top"), prev["top"]);
    			state.MML.GM.characters[charName].moveDistance(distance);
    		}
    		else{
    			obj.set("left", prev["left"]);
    			obj.set("top", prev["top"]);
    		}


    	}
    });
});
