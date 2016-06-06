// This file contains all menus and defines the player object class

MML.playerClass = {
    message: "", //
    buttons: {}, //{text: "Click Here", nextMenu: "mainMenu", triggeredFunction: MML.triggeredFunction}
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
        //log(button);
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
        button.triggeredFunction.apply(this, [buttonInput]);
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
				triggeredFunction: function(input) {
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
				triggeredFunction: function(input) {
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
				triggeredFunction: function(input) {
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
			triggeredFunction: function(input) {
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
			triggeredFunction: function(input){
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
                unequipButton.triggeredFunction = function(text){
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
                unequipButton.triggeredFunction = function(text){
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
                unequipButton.triggeredFunction = function(text){
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
                        triggeredFunction: function(text){
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
                        triggeredFunction: function(text){
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
                        triggeredFunction: function(text){
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
            triggeredFunction: function(text){
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
            triggeredFunction: function(text){
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
        triggeredFunction: function(text){
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
		triggeredFunction: function(input){
			MML.displayMenu.apply(this, []);
		}}];

	if (MML.isWieldingRangedWeapon(state.MML.characters[this.who])){
		buttons.push({
			text: "Shoot From Cover",
			nextMenu: "charMenuAttackCalledShot",
			triggeredFunction: function(input){
				state.MML.characters[this.who].action.modifiers.push("Shoot From Cover");
				MML.displayMenu.apply(this, []);
			}
		});
		buttons.push({
			text: "Aim",
			nextMenu: "charMenuPrepareAction",
			triggeredFunction: function(input){
				state.MML.characters[this.who].action.modifiers.push("Aim");
				MML.displayMenu.apply(this, []);
			}
		});
	}
	else {//Melee	
		buttons.push({
			text: "Sweep Attack",
			nextMenu: "charMenuAttackCalledShot",
			triggeredFunction: function(input){
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
		triggeredFunction: function(input){
			MML.displayMenu.apply(this, []);
		}},
		{
		text: "Body Part",
		triggeredFunction: function(input){
			state.MML.characters[this.who].action.modifiers.push("Called Shot");
			MML.displayMenu.apply(this, []);
		}},
		{
		text: "Specific Hit Position",
		triggeredFunction: function(input){
			state.MML.characters[this.who].action.modifiers.push("Called Shot Specific");
			MML.displayMenu.apply(this, []);
		}}
	];

	if(MML.isWieldingRangedWeapon(state.MML.characters[this.who])){
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
		triggeredFunction: function(input){
			MML.displayMenu.apply(this, []);
		}},
		{
		text: "Defensive",
		nextMenu: "charMenuInitiativeRoll",
		triggeredFunction: function(input){
			state.MML.characters[this.who].action.modifiers.push("Defensive Stance");
			MML.displayMenu.apply(this, []);
		}},
		{
		text: "Aggressive",
		nextMenu: "charMenuInitiativeRoll",
		triggeredFunction: function(input){
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
			triggeredFunction: function(input){
				input.charName = this.name;
				input.triggeredFunction = "setCurrentCharacterTargets";

				MML.displayTargetSelection(input);
			}
		});
	}
};
MML.setCurrentCharacterTargets = function setCurrentCharacterTargets(input){
	var targetArray;

	if(typeof input.target !== "undefined"){
		targetArray = [input.target];
	}
	else{
		targetArray = input.targets;
	}
	
	state.MML.GM.currentAction.targetArray = targetArray;
	state.MML.GM.currentAction.targetIndex = 0;

	MML.processCommand({
    	type: "character",
    	who: input.charName,
    	triggeredFunction: state.MML.characters[input.charName].action.triggeredFunction,
		input: {}
    });
};
MML.charMenuSelectBodyPart = function charMenuSelectBodyPart(input){
	this.who = input.who;
	this.message =  "Choose a Body Part.";
	this.buttons = [];

	var bodyParts = MML.getBodyParts(state.MML.characters[state.MML.GM.currentAction.targetArray[state.MML.GM.currentAction.targetIndex]]);

	_.each(bodyParts, function(part){
		this.buttons.push({
			text: part,
			nextMenu: "menuIdle",
			triggeredFunction: function(input){
				state.MML.GM.currentAction.calledShot = input.text;

				MML.processCommand({
			    	type: "character",
			    	who: this.who,
			    	triggeredFunction: "processAttack",
					input: {}
			    });
			}
		});
	}, this);
};
MML.charMenuSelectHitPosition = function charMenuSelectHitPosition(input){
	this.who = input.who;
	this.message =  "Choose a Hit Position.";
	this.buttons = [];

	var hitPositions = MML.getHitPositionNames(state.MML.characters[state.MML.GM.currentAction.targetArray[state.MML.GM.currentAction.targetIndex]]);

	_.each(hitPositions, function(position){
		this.buttons.push({
			text: position,
			nextMenu: "menuIdle",
			triggeredFunction: function(input){
				state.MML.GM.currentAction.calledShot = input.text;

				MML.processCommand({
			    	type: "character",
			    	who: this.who,
			    	triggeredFunction: "processAttack",
					input: {}
			    });
			}
		});
	}, this);
};
MML.charMenuSelectDamageType = function charMenuSelectDamageType(input){
    this.who = input.who;
	this.message =  "Choose a Damage Type.";
	this.buttons = [];

	this.buttons.push({
		text: "Primary",
		nextMenu: "charMenuAttackRoll",
		triggeredFunction: function(input){
			state.MML.GM.currentAction.weaponType = "primary";

			MML.processCommand({
		    	type: "character",
		    	who: this.who,
		    	triggeredFunction: "meleeAttackRoll",
				input: {}
		    });
		}
	});

	this.buttons.push({
		text: "Secondary",
		nextMenu: "charMenuAttackRoll",
		triggeredFunction: function(input){
			state.MML.GM.currentAction.weaponType = "secondary";

			MML.processCommand({
		    	type: "character",
		    	who: this.who,
		    	triggeredFunction: "meleeAttackRoll",
				input: {}
		    });
		}
	});
};
MML.charMenuAttackRoll = function charMenuAttackRoll(input){
	this.who = input.who;
	this.message =  "Roll Attack.";
	this.buttons = [MML.menuButtons.rollDice];
};
MML.charMenuDefenseRoll = function charMenuDefenseRoll(input){
	var blockChance = input.blockChance;
	var dodgeChance = input.dodgeChance;

	this.who = input.who;
	this.message = "How will " + this.who + " defend?";
	this.buttons = [{
		text: "Dodge: " + dodgeChance + "%",
		nextMenu: "menuIdle",
		triggeredFunction: function(input){
			MML.processCommand({
				type: "character",
		    	who: this.who,
		    	triggeredFunction: "meleeDodgeRoll",
				input: {
					dodgeChance: dodgeChance
				}
			});
		}},
		{
		text: "Block: " + blockChance + "%",
		nextMenu: "menuIdle",
		triggeredFunction: function(input){
			MML.processCommand({
				type: "character",
		    	who: this.who,
		    	triggeredFunction: "meleeBlockRoll",
				input: {
					blockChance: blockChance
				}
			});
		}},
		{
		text: "Take it",
		nextMenu: "menuIdle",
		triggeredFunction: function(input){
			MML.processCommand({
				type: "character",
		    	who: state.MML.GM.currentAction.who,
		    	triggeredFunction: "rollHitPosition",
				input: {}
			});
		}}
	];
};

MML.menuButtons = {};
MML.menuButtons.GmMenuMain = {
	text: "GmMenuMain",
	nextMenu: "GmMenuMain",
	triggeredFunction: function(input){
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.combatMenu = {
	text: "Combat",
	nextMenu: "GmMenuCombat",
	triggeredFunction: function(input){
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.newCharacterMenu = {
	text: "New Character",
	nextMenu: "GmMenuNewCharacter",
	triggeredFunction: function(input){
		MML.displayMenu.apply(this, []);
	}
};

MML.menuButtons.newItemMenu = {
	text: "New Item",
	nextMenu: "GmMenuNewItem",
	triggeredFunction: function(input){
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.newWeapon = {
	text: "Weapon",
	nextMenu: "GmMenuNewWeapon",
	triggeredFunction: function(input){
		MML.displayMenu.apply(this, []);
	}
};

MML.menuButtons.newShield = {
	text: "Shield",
	nextMenu: "GmMenuNewShield",
	triggeredFunction: function(input){
		MML.displayMenu.apply(this, []);
	}
};

MML.menuButtons.newArmor = {
	text: "Armor",
	nextMenu: "GmMenuNewArmor",
	triggeredFunction: function(input){
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.newSpellComponent = {
	text: "Spell Component",
	nextMenu: "GmMenuNewSpellComponent",
	triggeredFunction: function(input){
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.newMiscItem = {
	text: "Misc",
	nextMenu: "GmMenuNewMiscItem",
	triggeredFunction: function(input){
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.itemQualityPoor = {
	text: "Poor",
	nextMenu: "GmMenuNewItemProperties",
	triggeredFunction: function(input){
		state.MML.GM.newItem.quality = input.text;
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.itemQualityStandard = {
	text: "Standard",
	nextMenu: "GmMenuNewItemProperties",
	triggeredFunction: function(input){
		state.MML.GM.newItem.quality = input.text;
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.itemQualityExcellent = {
	text: "Excellent",
	nextMenu: "GmMenuNewItemProperties",
	triggeredFunction: function(input){
		state.MML.GM.newItem.quality = input.text;
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.itemQualityMasterWork = {
	text: "Master Work",
	nextMenu: "GmMenuNewItemProperties",
	triggeredFunction: function(input){
		state.MML.GM.newItem.quality = input.text;
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.assignNewItem =  {
	text: "Assign Item",
	nextMenu: "GmMenuMain",
	triggeredFunction: function(input){
		input.charName = this.name;
		input.triggeredFunction = "assignNewItem";
		MML.displayTargetSelection(input);
	}
};

MML.menuButtons.worldMenu = {
	text: "World",
	nextMenu: "GmMenuWorld",
	triggeredFunction: function(input){
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.utilitiesMenu = {
	text: "Utilities",
	nextMenu: "GmMenuUtilities",
	triggeredFunction: function(input){
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.startCombat = {
	text: "Start Combat",
	nextMenu: "charMenuPrepareAction",
	triggeredFunction: function(input){
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
	triggeredFunction: function(input){
		MML.displayMenu.apply(this, []);
	}
};

MML.menuButtons.startRound = {
	text: "Start Round",
	nextMenu: "GmMenuStartRound",
	triggeredFunction: function(input){
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
	triggeredFunction: function(input){
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
	triggeredFunction: function(input){
		state.MML.characters[this.who].action = {
			name: "Attack",
			getTargets: "getSingleTarget",
			triggeredFunction: "startAttackAction",
			modifiers: []
		};
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.setActionCast = {
	text: "Cast",
	nextMenu: "charMenuCast",
	triggeredFunction: function(input){
		state.MML.characters[this.who].action.name = input.text;
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.setActionReadyItem = {
	text: "Ready Item",
	nextMenu: "charMenuReadyItem",
	triggeredFunction: function(input){
		state.MML.characters[this.who].action.name = input.text;
		sendChat("", "Ready Item not ready...lol");
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.setActionObserve = {
	text: "Observe",
	nextMenu: "charMenuPrepareAction",
	triggeredFunction: function(input){
		state.MML.characters[this.who].action.name = input.text;
		sendChat("", "Observe");
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.changeAction = {
	text: "Change Action",
	nextMenu: "charMenuPrepareAction",
	triggeredFunction: function(input){
		MML.displayMenu.apply(this, []);
	}
};
MML.menuButtons.actionPrepared = {
	text: "Ready",
	nextMenu: "charMenuPrepareAction",
	triggeredFunction: function(input){
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
// MML.menuButtons.startAction = {
// 	text: "Start",
// 	nextMenu: "menuIdle",
// 	triggeredFunction: function(input){
// 		MML.startAction.apply(state.MML.GM, [input]);
// 	}
// };
MML.menuButtons.chooseTargets = {
	text: "Choose Targets",
	nextMenu: "charMenuChooseTargets",
	triggeredFunction: function(input){
		MML.displayMenu.apply(this, []);
	}
};

MML.menuButtons.endAction = {
	text: "End Action",
	nextMenu: "charMenuPrepareAction",
	triggeredFunction: function(input){
		MML.endAction.apply(state.MML.GM, []);
	}
};
MML.menuButtons.rollDice = {
	text: "Roll",
	nextMenu: "menuIdle",
	triggeredFunction: function(input){
		state.MML.GM.currentRoll.getRoll();
	}
};
MML.menuButtons.initiativeRoll = {
	text: "Roll",
	nextMenu: "menuIdle",
	triggeredFunction: function(input){
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
	triggeredFunction: function(input){
		MML[this.currentRoll.applyResult].apply(this, []);
	}
};

MML.menuButtons.changeRoll = {
	text: "Change",
	nextMenu: "menuIdle",
	triggeredFunction: function(input){
		MML.displayGmRoll.apply(this, []);
	}
};

MML.menuButtons.rollHitPosition = {
	text: "Roll",
	nextMenu: "charMenuRollDamage",
	triggeredFunction: function(input){
		MML.getHitPositionRoll.apply(state.MML.GM, []);
	}
};
MML.menuButtons.setProne = {
	text: "Prone",
	nextMenu: "menuCombatMovement",
	triggeredFunction: function(input){
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
	triggeredFunction: function(input){
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
	triggeredFunction: function(input){
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
	triggeredFunction: function(input){
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
	triggeredFunction: function(input){
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
	triggeredFunction: function(input){
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
	triggeredFunction: function(input){
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
	triggeredFunction: function(input){
		state.MML.characters[this.who].defense.style = "Block";
		state.MML.characters[this.who].defense.number++;
		MML.getDefenseRoll.apply(state.MML.GM, []);
	}
};
MML.menuButtons.defenseDodge = {
	text: "Dodge",
	nextMenu: "menuIdle",
	triggeredFunction: function(input){
		state.MML.characters[this.who].defense.style = "Dodge";
		state.MML.characters[this.who].defense.number++;
		state.MML.characters[this.who].defense.dodge = true;
		MML.getDefenseRoll.apply(state.MML.GM, []);
	}
};
MML.menuButtons.defenseTakeIt = {
	text: "Take It",
	nextMenu: "menuIdle",
	triggeredFunction: function(input){
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
