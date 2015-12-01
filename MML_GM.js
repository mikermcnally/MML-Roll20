state.MML = state.MML || {};
state.MML.GM = {};
state.MML.GM.player = "Robot";
state.MML.GM.name = "GM";
state.MML.GM.menu = MML.GmMenuMain;
state.MML.GM.displayMenu = MML.displayMenu;
state.MML.GM.displayRoll = MML.displayRoll;
state.MML.GM.menuInfo = {};
state.MML.GM.characters = state.MML.GM.characters || [];
state.MML.Combat = state.MML.Combat || { inCombat: false, currentRound: 0, roundStarted: false, tokens: [], turnInfo: {} };

state.MML.GM.startCombat = function startCombat() {
    this.currentRound = 0;
    this.roundStarted = false;
	this.combatants = this.selectedCharacters; 

	if(this.combatants.length > 0){
		this.inCombat = true;
		var player;
		for(player in state.MML.players){
			//Clear players' list of characters
			state.MML.players[player].characters = [];
		}
		var index;
		for (index in this.combatants){
			//set characters to not ready
			this.characters[this.combatants[index]].setReady(false);
			//set characters initiative to 0
			this.characters[this.combatants[index]].initiative.value = 0;
			//Populate players list of characters
			state.MML.players[this.characters[this.combatants[index]].player].characters.push(this.characters[this.combatants[index]].name);
		}
		
		this.setTurnOrder(); //Puts combatants in the initiativepage
		//this.turnInfo = { charName: this.combatants[0], step: "newRound", currentRoll: {}, accepted: false };
		Campaign().set("initiativepage", "true");
		this.newRound();
	}
	else{
		sendChat("", "&{template:charMenu} {{name=Error}} {{message=No tokens selected}}");
	}
};

state.MML.GM.newRound = function newRound(){
	var index = 0;
	for (index in this.combatants){
		this.characters[this.combatants[index]].setReady(false);
		this.characters[this.combatants[index]].newRoundUpdate();
		this.characters[this.combatants[index]].computeSitMods();
	}
	var player;
	for(player in state.MML.players){
		state.MML.players[player].characterIndex = 0;
		state.MML.players[player].menu = state.MML.players[player].characters[state.MML.players[player].characterIndex];
		state.MML.players[player].setMenu = MML.charMenuPrepareAction;
		state.MML.players[player].displayMenu();
	}
};

state.MML.GM.startRound = function startRound(){
	if(this.checkReady()){
		var index;
		for(index in this.combatants){
			this.characters[this.combatants[index]].computeSitMods();
			this.characters[this.combatants[index]].rollInitiative();
		}

		this.setTurnOrder();
		this.currentRound++;
		this.roundStarted = true;
		this.startAction();
	}
};

state.MML.GM.startAction = function startAction(){
	if (this.checkReady()) {
		this.actor = this.combatants[0];		
		this.rolls = {};
		//this.initRolls = this.characters[this.actor].action.rolls;
		//this.initRolls();
		state.MML.players[this.characters[this.actor].player].setMenu = MML.charMenuMovement;
		state.MML.players[this.characters[this.actor].player].displayMenu();
	}
};

MML.setTargets = function selectTargets(){
	this.targets = this.characters[this.actor].action.targets;
	this.targetIndex = 0;
	this.currentTarget = this.targets[this.targetIndex];
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

// Rolls
state.MML.GM.getAttackRoll = function getAttackRoll(){
	this.currentRoll = this.characters[this.actor].attackRoll();
	this.displayRoll();
};

state.MML.GM.attackRollResult = function attackRollResult(){
	this.rolls.attack = this.currentRoll.result;
	if(this.rolls.attack === "Critical Success" || this.rolls.attack === "Success"){
		var player = state.MML.GM.characters[this.currentTarget].player;
		state.MML.players[player].setMenu = MML.charMenuDefense;
		state.MML.players[player].displayMenu();
	}
	else{
		this.endAction();
	}
};

state.MML.GM.getDefenseRoll = function getDefenseRoll(){
	this.currentRoll = this.characters[this.currentTarget].defenseRoll();
	this.displayRoll();
};

state.MML.GM.defenseRollResult = function defenseRollResult(){
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
			this.rolls.hitPosition = this.currentRoll.value;
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
			this.rolls.wound = this.characters[this.currentTarget].alterHP(this.rolls.hitPosition, this.rolls.damage.value, this.rolls.damage.type);
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

state.MML.GM.assignItem = function assignItem(gmName, charName){
	var index = 0;
	while(typeof(MML.getCharAttribute(charName, "repeating_items_" + index + "_itemName")) != "undefined"){
		index++;
	}

	MML.createAttribute("repeating_items_" + index + "_itemName", this.newItem.name, "", MML.getCharFromName(charName));
	MML.createAttribute("repeating_items_" + index + "_itemProperties", JSON.stringify(this.newItem), "", MML.getCharFromName(charName));
};


MML.parseCommand = function parseCommand(msg) {
	// log(msg.content);
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
			state.MML.GM.currentRoll.triggeredMethod();
		}
    }
	
	// else if(msg.type === "api" && msg.content.indexOf("!startCombat") !== -1) {
 //        MML.startCombat(msg.selected);
	// 	MML.main();
 //    }    
    
 //    else if(msg.type === "api" && msg.content.indexOf("!ready") !== -1) {
 //        state.MML.GM.characters[msg.content.replace("!ready ", "")].setReady(true);
	// 	state.MML.GM.characters[msg.content.replace("!ready ", "")].menu = MML.charMenuAttackAction;
 //    }
    
	else if(msg.type === "api" && msg.content.indexOf("!menu") !== -1) {
		var input = msg.content.split("|");
		var tokens = MML.getSelectedTokens(msg.selected);
		var player = msg.who.replace(" (GM)", "");
		state.MML.GM.selectedCharacters = [];

		if(player === state.MML.GM.player){
			var index;
			for(index in tokens){
				state.MML.GM.selectedCharacters[index] = MML.getCharFromToken(tokens[index]);
			}
		}

		var index;
		for(index in state.MML.players[player].buttons){
			if(state.MML.players[player].buttons[index].text === input[2]){
				state.MML.players[player].setMenu = state.MML.players[player].buttons[index].nextMenu;
				state.MML.players[player].triggeredMethod = state.MML.players[player].buttons[index].triggeredMethod;
				state.MML.players[player].triggeredMethod();
				break;
			}
		}
    }
	
	else if(msg.type === "api" && msg.content.indexOf("!selectTarget") !== -1) {
		var input = msg.content.replace("!selectTarget ", "").split("|");
		state.MML.GM[input[2]](input[0], input[1]);
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
    		var distance = MML.getDistance(obj.get("left"), prev["left"], obj.get("top"), prev["top"]);
    		if(state.MML.GM.actor === charName){
    			if((distance)/(state.MML.GM.characters[charName].movement.rates[state.MML.GM.characters[charName].movement.position]) > 
    			state.MML.GM.characters[charName].movement.available){
    				//change this later
    				obj.set("left", prev["left"]);
    				obj.set("top", prev["top"]);
    				//("Moved too far add vector math later, move them back for now")
    			}
    			else{
    				state.MML.GM.characters[charName].moveDistance(distance);
    			}
    		}
    		else{
    			obj.set("left", prev["left"]);
    			obj.set("top", prev["top"]);
    		}


    	}
    });

    on("change:attribute:current", function(attribute) {
    	var character = getObj("character", attribute.get("_characterid"));
    	var charName = character.get("name"); 
    	var attrName = attribute.get("name");	 
log(attrName);
    	switch(attrName){
    		case "statureRoll":
    			state.MML.GM.characters[charName].set("stature");
    			break;
    		case "strengthRoll":
    			state.MML.GM.characters[charName].set("strength");
    			break;
    		case "coordinationRoll":
    			state.MML.GM.characters[charName].set("coordination");
    			break;
    		case "healthRoll":
    			state.MML.GM.characters[charName].set("health");
    			break;
    		case "intellectRoll":
    			state.MML.GM.characters[charName].set("intellect");
    			break;
    		case "reasonRoll":
    			state.MML.GM.characters[charName].set("reason");
    			break;
    		case "creativityRoll":
    			state.MML.GM.characters[charName].set("creativity");
    			break;
    		case "presenceRoll":
    			state.MML.GM.characters[charName].set("presence");
    			break;
    		default:
    			if(attrName.indexOf("repeating_items") != -1){
    				log(attrName);
    			}
    			else{
    				state.MML.GM.characters[charName].set(attrName);
    			}
    			break;
    	}

    });
});
