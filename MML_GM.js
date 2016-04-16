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
	        if(command === "" || _.isUndefined(command)){
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
});