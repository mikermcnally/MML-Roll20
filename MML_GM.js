MML.startCombat = function startCombat(input) {
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
MML.getSingleTarget = function getSingleTarget(input){
	input.charName = this.name;
	input.triggeredFunction = "setCurrentCharacterTargets";
	MML.displayTargetSelection(input);
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
	var value = input.value;
	var range = this.currentRoll.range.split("-");
	var low = parseInt(range[0]);
	var high = parseInt(range[1]);
	log(this.currentRoll.rollResultFunction);
	if(value >= low && value <= high){
		if(this.currentRoll.type === "damage"){
			this.currentRoll.value = -value;
			this.currentRoll.message = "Roll: " + value + "\nRange: " + this.currentRoll.range;
		}
		else{
			this.currentRoll.value = value;
			if(this.currentRoll.type === "universal"){
				this.currentRoll = MML.universalRollResult(this.currentRoll);
			}
			else if(this.currentRoll.type === "attribute"){
				this.currentRoll = MML.attributeRollResult(this.currentRoll);
			}
		}
	}
	else{
		sendChat("Error", "New roll value out of range.");
	}
	MML.processCommand({
        type: "character",
        who: this.currentRoll.character,
        triggeredFunction: this.currentRoll.rollResultFunction,
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
    	who: input.target,
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

MML.processCommand = function processCommand(command){
	try{
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
	}
	catch(error){
		sendChat("", "processCommand failed");
		// log(state.MML.GM);
		// log(state.MML.players);
		// log(state.MML.characters);
		log(command);
		log(error.message);
		log(error.stack);
	}		
};

MML.parseCommand = function parseCommand(msg) {
    if(msg.type === "api" && msg.content.indexOf("!MML|") !== -1){
    	var command = "parse failed";
    	var content = msg.content.replace("!MML|", "");

    	if(content.indexOf("selectTarget") !== -1) {
	        var stringIn = content.replace("selectTarget ", "").split("|");
	        var character = stringIn[0];
	        var target = stringIn[1];
	        var hexedInput = stringIn[2];
	     
	        var i;
		    var hexes = hexedInput.match(/.{1,4}/g) || [];
		    input = "";
		    for(i = 0; i<hexes.length; i++) {
		        input += String.fromCharCode(parseInt(hexes[i], 16));
		    }
	        try {
	        	input = JSON.parse(input);
			}
			catch (e) {
			 	command = "selectTarget parse failed";
			 	sendChat("", command);
			 	log(stringIn);
			 	log(input);
                MML.error();
			}
            input.target = target;

	        command = {
	        	type: "player",
				who: msg.who.replace(" (GM)", ""),
				triggeredFunction: input.triggeredFunction,
				input: input
	        };
	    }

	    else if(content.indexOf("changeRoll") !== -1) {
	        var value = parseInt(content.replace("changeRoll ", ""));
	        
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

	    else if(content.indexOf("acceptRoll") !== -1) {
	        if(state.MML.players[state.MML.GM.player].currentRoll.accepted === false){
	        	var player = state.MML.players[state.MML.GM.player];
	            state.MML.players[player.name].currentRoll.accepted = true;
	            
	            command = {
	            	type: "character",
					who: player.who,
					triggeredFunction: player.currentRoll.rollResultFunction,
					input: {}
	            };
	        }
	    }

	    else if(content.indexOf("displayItemOptions") !== -1) {
	        var input = content.replace("displayItemOptions ", "").split("|");
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
		    var hexes = content.match(/.{1,4}/g) || [];
		    command = "";
		    for(i = 0; i<hexes.length; i++) {
		        command += String.fromCharCode(parseInt(hexes[i], 16));
		    }
	        try {
	        	command = JSON.parse(command);
			}
			catch (e) {
			 	log(command);
			 	log(content);
                sendChat("", "JSON parse failed");
			}

	        command.input.selectedCharNames = MML.getSelectedCharNames(msg.selected);
    	}
    	
    	MML.processCommand(command);
    }
	    
};
