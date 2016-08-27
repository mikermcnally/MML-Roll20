/* jshint -W069 */
// This file contains all menus and defines the player object class

MML.playerClass = {
    message: "", //
    buttons: {}, //{text: "Click Here", nextMenu: "mainMenu", callback: MML.callback}
    name: "",
    characters: [],
    combatants: [],
    characterIndex: 0,
    who: "",
    menu: ""
};

MML.menuCommand = function(input) {
    var who = input.who;
    var buttonText = input.buttonText;
    var buttonInput;

    var button = _.findWhere(this.buttons, {
        text: buttonText
    });
    if (!_.isUndefined(button)) {
        this.menu = button.nextMenu;
        //log(button);
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: button.nextMenu,
            input: {
                who: who
            }
        });

        buttonInput = {
            text: button.text,
            selectedCharNames: input.selectedCharNames
        };
        button.callback.apply(this, [buttonInput]);
    }
};

MML.setApiPlayerAttribute = function(input) {
    this[input.attribute] = input.value;
};

MML.newRoundUpdatePlayer = function(input) {
    this.characterIndex = 0;
    this.combatants = _.intersection(this.characters, state.MML.GM.combatants);
    this.who = this.combatants[0];
    this.menu = "charMenuPrepareAction";

    if (this.combatants.length > 0){
        if (state.MML.characters[this.who].situationalInitBonus !== "No Combat") {
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "charMenuPrepareAction",
                input: {
                    who: this.who
                }
            });
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
            });
        } else {
            MML.processCommand({
                type: "character",
                who: this.who,
                callback: "setApiCharAttribute",
                input: {
                    attribute: "ready",
                    value: true
                }
            });
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "prepareNextCharacter",
                input: {}
            });
        }
    }
};

MML.prepareNextCharacter = function(input) {
    this.characterIndex++;
    var charName = this.combatants[this.characterIndex];

    if (this.characterIndex < this.combatants.length) {
        if (state.MML.characters[charName].situationalInitBonus !== "No Combat") {
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "charMenuPrepareAction",
                input: {
                    who: charName
                }
            });
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
            });
        } else {
            MML.processCommand({
                type: "character",
                who: charName,
                callback: "setApiCharAttribute",
                input: {
                    attribute: "ready",
                    value: true
                }
            });
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "prepareNextCharacter",
                input: {}
            });
        }
    } else if (this.name === state.MML.GM.player) {
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "GmMenuStartRound",
            input: {
                who: "GM",
            }
        });
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};

MML.menuIdle = function menuIdle(input) {
    this.who = input.who;
    this.message = "Menu Closed";
    this.buttons = [];
};

MML.GmMenuMain = function GmMenuMain(input) {
    this.who = input.who;
    this.message = "Main Menu: ";
    this.buttons = [MML.menuButtons.combatMenu,
        MML.menuButtons.newItemMenu,
        MML.menuButtons.worldMenu,
        MML.menuButtons.utilitiesMenu
    ];
};

MML.GmMenuAssignStatusEffect = function GmMenuAssignStatusEffect(input) {
    this.who = input.who;
    this.message = "Choose a Status Effect: ";
    this.buttons = [];

    _.each(MML.statusEffects, function(effect, effectName) {
        this.buttons.push({
            text: effectName,
            nextMenu: "GmMenuItemQuality",
            callback: function(input) {
                state.MML.GM.newItem = MML.items[input.text];
                MML.processCommand({
                    type: "player",
                    who: this.name,
                    callback: "displayMenu",
                    input: {}
                });
            }
        });
    });
};

MML.displayPlayerRoll = function displayPlayerRoll(input) {
    this.who = input.who;
    this.message = this.currentRoll.message;
    this.buttons = [MML.menuButtons.acceptRoll];
};

MML.GmMenuCombat = function GmMenuCombat(input) {
    this.who = input.who;
    this.message = "Select tokens and begin.";
    this.buttons = [MML.menuButtons.startCombat,
        MML.menuButtons.toMainGmMenu,
    ];
};

MML.GmMenuNewItem = function GmMenuNewItem(input) {
    this.who = input.who;
    this.message = "Select item type:";
    this.buttons = [MML.menuButtons.newWeapon,
        MML.menuButtons.newShield,
        MML.menuButtons.newArmor,
        MML.menuButtons.newSpellComponent,
        MML.menuButtons.newMiscItem
    ];
};

MML.GmMenuNewWeapon = function GmMenuNewWeapon(input) {
    this.who = input.who;
    this.message = "Select weapon type:";
    this.buttons = [];

    _.each(MML.items, function(item) {
        if (item.type === "weapon") {
            this.buttons.push({
                text: item.name,
                nextMenu: "GmMenuItemQuality",
                callback: function(input) {
                    state.MML.GM.newItem = MML.items[input.text];
                    MML.processCommand({
                        type: "player",
                        who: this.name,
                        callback: "displayMenu",
                        input: {}
                    });
                }
            });
        }
    }, this);
};

MML.GmMenuNewShield = function GmMenuNewShield(input) {
    this.who = input.who;
    this.message = "Select shield type:";
    this.buttons = [];

    _.each(MML.items, function(item) {
        if (item.type === "shield") {
            this.buttons.push({
                text: item.name,
                nextMenu: "GmMenuItemQuality",
                callback: function(input) {
                    state.MML.GM.newItem = MML.items[input.text];
                    MML.processCommand({
                        type: "player",
                        who: this.name,
                        callback: "displayMenu",
                        input: {}
                    });
                }
            });
        }
    }, this);
};

MML.GmMenuNewArmor = function GmMenuNewArmor(input) {
    this.who = input.who;
    this.message = "Select armor style:";
    this.buttons = [];

    _.each(MML.items, function(item) {
        if (item.type === "armor") {
            this.buttons.push({
                text: item.name,
                nextMenu: "GmMenuArmorMaterial",
                callback: function(input) {
                    state.MML.GM.newItem = MML.items[input.text];
                    MML.processCommand({
                        type: "player",
                        who: this.name,
                        callback: "displayMenu",
                        input: {}
                    });
                }
            });
        }
    }, this);
};

MML.GmMenuArmorMaterial = function GmMenuArmorMaterial(input) {
    this.who = input.who;
    this.message = "Select armor material:";
    this.buttons = [];

    _.each(MML.APVList, function(material) {
        this.buttons.push({
            text: material.name,
            nextMenu: "GmMenuItemQuality",
            callback: function(input) {
                var material = MML.APVList[input.text];
                state.MML.GM.newItem.material = material.name;
                state.MML.GM.newItem.weight = material.weightPerPosition * state.MML.GM.newItem.totalPostitions;
                state.MML.GM.newItem.name = material.name + " " + state.MML.GM.newItem.name;
                MML.processCommand({
                    type: "player",
                    who: this.name,
                    callback: "displayMenu",
                    input: {}
                });
            }
        });
    }, this);
};

MML.GmMenuNewItemProperties = function GmMenuNewItemProperties(input) {
    this.who = input.who;
    this.message = "Add new properties:";
    this.buttons = [MML.menuButtons.assignNewItem];
};

MML.GmMenuassignNewItem = function GmMenuassignNewItem(input) {
    this.who = input.who;
    this.message = "Select character:";
    this.buttons = [];

    _.each(state.MML.characters, function(character) {
        this.buttons.push({
            text: index,
            nextMenu: "GmMenuMain",
            callback: function(input) {
                MML.processCommand({
                    type: "player",
                    who: this.name,
                    callback: "displayMenu",
                    input: {}
                });
            }
        });
    }, this);
};

MML.GmMenuItemQuality = function GmMenuItemQuality(input) {
    this.who = input.who;
    this.message = "Select a quality level:";
    this.buttons = [MML.menuButtons.itemQualityPoor,
        MML.menuButtons.itemQualityStandard,
        MML.menuButtons.itemQualityExcellent,
        MML.menuButtons.itemQualityMasterWork
    ];
};

MML.displayItemOptions = function displayItemOptions(input) {
    var who = input.who;
    var itemId = input.itemId;
    var item = state.MML.characters[who].inventory[itemId];
    var buttons = [];
    var unequipButton;
    var hands;
    this.menu = "menuIdle";
    this.message = "Item Menu";
    this.who = who;

    if (item.type === "weapon") {
        //Weapon already equipped
        if (state.MML.characters[who].leftHand._id === itemId || state.MML.characters[who].rightHand._id === itemId) {
            unequipButton = {
                text: "Unequip",
                nextMenu: "menuIdle"
            };

            if (state.MML.characters[who].leftHand._id === itemId && state.MML.characters[who].leftHand._id === itemId) {
                unequipButton.callback = function(text) {
                    MML.processCommand({
                        type: "character",
                        who: who,
                        callback: "setApiCharAttribute",
                        input: {
                            attribute: "leftHand",
                            value: {
                                _id: "emptyHand"
                            }
                        }
                    });
                    MML.processCommand({
                        type: "character",
                        who: who,
                        callback: "setApiCharAttribute",
                        input: {
                            attribute: "leftHand",
                            value: {
                                _id: "emptyHand"
                            }
                        }
                    });
                    MML.processCommand({
                        type: "character",
                        who: who,
                        callback: "setApiCharAttribute",
                        input: {
                            attribute: "rightHand",
                            value: {
                                _id: "emptyHand"
                            }
                        }
                    });
                    MML.processCommand({
                        type: "player",
                        who: this.name,
                        callback: "displayMenu",
                        input: {}
                    });
                };
            } else if (state.MML.characters[who].leftHand._id === itemId) {
                unequipButton.callback = function(text) {
                    MML.processCommand({
                        type: "character",
                        who: who,
                        callback: "setApiCharAttribute",
                        input: {
                            attribute: "leftHand",
                            value: {
                                _id: "emptyHand"
                            }
                        }
                    });
                    MML.processCommand({
                        type: "player",
                        who: this.name,
                        callback: "displayMenu",
                        input: {}
                    });
                };
            } else {
                unequipButton.callback = function(text) {
                    MML.processCommand({
                        type: "character",
                        who: who,
                        callback: "setApiCharAttribute",
                        input: {
                            attribute: "rightHand",
                            value: {
                                _id: "emptyHand"
                            }
                        }
                    });
                    MML.processCommand({
                        type: "player",
                        who: this.name,
                        callback: "displayMenu",
                        input: {}
                    });
                };
            }
            buttons.push(unequipButton);
        } else {
            _.each(item.grips, function(grip, gripName) {
                if (gripName === "One Hand") {
                    buttons.push({
                        text: "Equip Left Hand",
                        nextMenu: "menuIdle",
                        callback: function(text) {
                            // if(state.MML.characters[who].rightHand.grip !== "One Hand"){
                            //     MML.processCommand({
                            //     	type: "character",
                            // 		who: who,
                            // 		callback: "setApiCharAttribute",
                            // 		input: {
                            // 			attribute: "rightHand",
                            // 			value: {
                            //                 _id: itemId,
                            //                 grip: gripName
                            //             }
                            // 		}
                            // 	});
                            // }
                            MML.processCommand({
                                type: "character",
                                who: who,
                                callback: "setApiCharAttribute",
                                input: {
                                    attribute: "leftHand",
                                    value: {
                                        _id: itemId,
                                        grip: gripName
                                    }
                                }
                            });

                            MML.processCommand({
                                type: "player",
                                who: this.name,
                                callback: "displayMenu",
                                input: {}
                            });
                        }
                    });
                    buttons.push({
                        text: "Equip Right Hand",
                        nextMenu: "menuIdle",
                        callback: function(text) {
                            // if(state.MML.characters[who].leftHand.grip !== "One Hand"){
                            //     MML.processCommand({
                            //     	type: "character",
                            // 		who: who,
                            // 		callback: "setApiCharAttribute",
                            // 		input: {
                            // 			attribute: "leftHand",
                            // 			value: {
                            //                 _id: itemId,
                            //                 grip: gripName
                            //             }
                            // 		}
                            // 	});
                            // }
                            MML.processCommand({
                                type: "character",
                                who: who,
                                callback: "setApiCharAttribute",
                                input: {
                                    attribute: "rightHand",
                                    value: {
                                        _id: itemId,
                                        grip: gripName
                                    }
                                }
                            });
                            MML.processCommand({
                                type: "player",
                                who: this.name,
                                callback: "displayMenu",
                                input: {}
                            });
                        }
                    });
                } else {
                    buttons.push({
                        text: "Equip " + gripName,
                        nextMenu: "menuIdle",
                        callback: function(text) {
                            MML.processCommand({
                                type: "character",
                                who: who,
                                callback: "setApiCharAttribute",
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
                                callback: "setApiCharAttribute",
                                input: {
                                    attribute: "leftHand",
                                    value: {
                                        _id: itemId,
                                        grip: gripName
                                    }
                                }
                            });
                            MML.processCommand({
                                type: "player",
                                who: this.name,
                                callback: "displayMenu",
                                input: {}
                            });
                        }
                    });
                }
            });
        }
    } else if (item.type === "armor") {
        log(item.type);
    } else if (item.type === "shield") {
        buttons.push({
            text: "Equip Left Hand",
            nextMenu: "menuIdle",
            callback: function(text) {
                MML.processCommand({
                    type: "character",
                    who: who,
                    callback: "setApiCharAttribute",
                    input: {
                        attribute: "leftHand",
                        value: {
                            _id: itemId,
                            grip: "One Hand"
                        }
                    }
                });
                MML.processCommand({
                    type: "player",
                    who: this.name,
                    callback: "displayMenu",
                    input: {}
                });
            }
        });
        buttons.push({
            text: "Equip Right Hand",
            nextMenu: "menuIdle",
            callback: function(text) {
                MML.processCommand({
                    type: "character",
                    who: who,
                    callback: "setApiCharAttribute",
                    input: {
                        attribute: "rightHand",
                        value: {
                            _id: itemId,
                            grip: "One Hand"
                        }
                    }
                });
                MML.processCommand({
                    type: "player",
                    who: this.name,
                    callback: "displayMenu",
                    input: {}
                });
            }
        });
    } else if (item.type === "spellComponent") {
        log(item.type);
    } else {
        log(item.type);
    }

    buttons.push({
        text: "Exit",
        nextMenu: "menuIdle",
        callback: function(text) {
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
            });
        }
    });

    this.buttons = buttons;
    MML.processCommand({
        type: "player",
        who: this.name,
        callback: "displayMenu",
        input: {}
    });
};

MML.GmMenuStartRound = function GmMenuStartRound(input) {
    this.who = input.who;
    this.message = "Start round when all characters are ready.";
    this.buttons = [MML.menuButtons.startRound,
        MML.menuButtons.endCombat
    ];
};

MML.charMenuPrepareAction = function charMenuPrepareAction(input) {
    this.who = input.who;
    this.message = "Prepare " + this.who + "'s action";
    this.buttons = [MML.menuButtons.setActionAttack,
        MML.menuButtons.setActionCast,
        MML.menuButtons.setActionReadyItem,
        MML.menuButtons.setActionObserve
    ];

};
MML.charMenuAttack = function charMenuAttack(input) {
    this.who = input.who;
    this.message = "Attack Menu";
    var buttons = [{
        text: "Standard",
        nextMenu: "charMenuAttackCalledShot",
        callback: function(input) {
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
            });
        }
    }];

    if (MML.isWieldingRangedWeapon(state.MML.characters[this.who])) {
        buttons.push({
            text: "Shoot From Cover",
            nextMenu: "charMenuAttackCalledShot",
            callback: function(input) {
                state.MML.characters[this.who].action.modifiers.push("Shoot From Cover");
                MML.processCommand({
                    type: "player",
                    who: this.name,
                    callback: "displayMenu",
                    input: {}
                });
            }
        });
        buttons.push({
            text: "Aim",
            nextMenu: "charMenuPrepareAction",
            callback: function(input) {
                state.MML.characters[this.who].action.modifiers.push("Aim");
                MML.processCommand({
                    type: "player",
                    who: this.name,
                    callback: "displayMenu",
                    input: {}
                });
            }
        });
    } else { //Melee
        buttons.push({
            text: "Sweep Attack",
            nextMenu: "charMenuAttackCalledShot",
            callback: function(input) {
                state.MML.characters[this.who].action.modifiers.push("Sweep Attack");
                MML.processCommand({
                    type: "player",
                    who: this.name,
                    callback: "displayMenu",
                    input: {}
                });
            }
        });
    }
    this.buttons = buttons;
};
MML.charMenuAttackCalledShot = function charMenuCalledShot(input) {
    this.who = input.who;
    this.message = "Called Shot Menu";
    var buttons = [{
        text: "None",
        callback: function(input) {
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
            });
        }
    }, {
        text: "Body Part",
        callback: function(input) {
            state.MML.characters[this.who].action.modifiers.push("Called Shot");
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
            });
        }
    }, {
        text: "Specific Hit Position",
        callback: function(input) {
            state.MML.characters[this.who].action.modifiers.push("Called Shot Specific");
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
            });
        }
    }];

    if (MML.isWieldingRangedWeapon(state.MML.characters[this.who])) {
        _.each(buttons, function(button) {
            button.nextMenu = "charMenuFinalizeAction";
        });
    } else {
        _.each(buttons, function(button) {
            button.nextMenu = "charMenuAttackStance";
        });
    }
    this.buttons = buttons;
};
MML.charMenuAttackStance = function charMenuAttackStance(input) {
    this.who = input.who;
    this.message = "Attack Stance Menu";
    var buttons = [{
        text: "Neutral",
        callback: function(input) {
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
            });
        }
    }, {
        text: "Defensive",
        callback: function(input) {
            state.MML.characters[this.who].action.modifiers.push("Defensive Stance");
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
            });
        }
    }, {
        text: "Aggressive",
        callback: function(input) {
            state.MML.characters[this.who].action.modifiers.push("Aggressive Stance");
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
            });
        }
    }];

    if (MML.isWieldingRangedWeapon(state.MML.characters[this.who])) {
        _.each(buttons, function(button) {
            button.nextMenu = "charMenuFinalizeAction";
        });
    } else {
        _.each(buttons, function(button) {
            button.nextMenu = "charMenuAttackStance";
        });
    }
    this.buttons = buttons;
};
MML.charMenuAttackStance = function charMenuAttackStance(input) {
    this.who = input.who;
    this.message = "Attack Stance Menu";
    var buttons = [{
        text: "Neutral",
        callback: function(input) {
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
            });
        }
    }, {
        text: "Defensive",
        callback: function(input) {
            state.MML.characters[this.who].action.modifiers.push("Defensive Stance");
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
            });
        }
    }, {
        text: "Aggressive",
        callback: function(input) {
            state.MML.characters[this.who].action.modifiers.push("Aggressive Stance");
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
            });
        }
    }];

    if (MML.getMeleeWeapon(state.MML.characters[this.who]).secondaryType !== "") {
        _.each(buttons, function(button) {
            button.nextMenu = "charMenuSelectDamageType";
        });
    } else {
        state.MML.characters[this.who].action.weaponType = "primary";
        _.each(buttons, function(button) {
            button.nextMenu = "charMenuFinalizeAction";
        });
    }
    this.buttons = buttons;
};

MML.charMenuFinalizeAction = function charMenuFinalizeAction(input) {
    this.who = input.who;
    log(state.MML.characters[this.who].action.modifiers);
    if (state.MML.GM.roundStarted === true) {
        this.message = "Accept or change action for " + this.who;
        this.buttons = [
            MML.menuButtons.acceptAction,
            MML.menuButtons.changeAction
        ];
    } else {
        this.message = "Roll initiative or change action for " + this.who;
        this.buttons = [
            MML.menuButtons.initiativeRoll,
            MML.menuButtons.changeAction
        ];
    }
};

MML.GmMenuStartAction = function GmMenuStartAction(input) {
    this.who = input.who;
    this.message = "Start " + state.MML.GM.actor + "'s action";
    this.buttons = [MML.menuButtons.startAction];
};
MML.menuCombatMovement = function menuCombatMovement(input) {
    this.who = input.who;
    this.message = "Move " + this.who + ".";
    this.buttons = [MML.menuButtons.setProne,
        MML.menuButtons.setStalk,
        MML.menuButtons.setCrawl,
        MML.menuButtons.setWalk,
        MML.menuButtons.setJog,
        MML.menuButtons.setRun,
        MML.menuButtons.endMovement
    ];
};
MML.setCurrentCharacterTargets = function setCurrentCharacterTargets(input) {
    var targetArray;

    if (typeof input.target !== "undefined") {
        targetArray = [input.target];
    } else {
        targetArray = input.targets;
    }

    state.MML.GM.currentAction.targetArray = targetArray;
    state.MML.GM.currentAction.targetIndex = 0;

    MML.processCommand({
        type: "character",
        who: input.charName,
        callback: state.MML.characters[input.charName].action.callback,
        input: {}
    });
};
MML.charMenuSelectBodyPart = function charMenuSelectBodyPart(input) {
    this.who = input.who;
    this.message = "Choose a Body Part.";
    this.buttons = [];

    var bodyParts = MML.getBodyParts(state.MML.characters[state.MML.GM.currentAction.targetArray[state.MML.GM.currentAction.targetIndex]]);

    _.each(bodyParts, function(part) {
        this.buttons.push({
            text: part,
            nextMenu: "menuIdle",
            callback: function(input) {
                state.MML.GM.currentAction.calledShot = input.text;

                MML.processCommand({
                    type: "character",
                    who: this.who,
                    callback: "processAttack",
                    input: {}
                });
            }
        });
    }, this);
};
MML.charMenuSelectHitPosition = function charMenuSelectHitPosition(input) {
    this.who = input.who;
    this.message = "Choose a Hit Position.";
    this.buttons = [];

    var hitPositions = MML.getHitPositionNames(state.MML.characters[state.MML.GM.currentAction.targetArray[state.MML.GM.currentAction.targetIndex]]);

    _.each(hitPositions, function(position) {
        this.buttons.push({
            text: position,
            nextMenu: "menuIdle",
            callback: function(input) {
                state.MML.GM.currentAction.calledShot = input.text;

                MML.processCommand({
                    type: "character",
                    who: this.who,
                    callback: "processAttack",
                    input: {}
                });
            }
        });
    }, this);
};
MML.charMenuSelectDamageType = function charMenuSelectDamageType(input) {
    this.who = input.who;
    this.message = "Choose a Damage Type.";
    this.buttons = [];

    this.buttons.push({
        text: "Primary",
        nextMenu: "charMenuFinalizeAction",
        callback: function(input) {
            state.MML.characters[this.who].action.weaponType = "primary";
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
            });
        }
    });

    this.buttons.push({
        text: "Secondary",
        nextMenu: "charMenuFinalizeAction",
        callback: function(input) {
            state.MML.characters[this.who].action.weaponType = "secondary";
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
            });
        }
    });
};
MML.charMenuAttackRoll = function charMenuAttackRoll(input) {
    this.who = input.who;
    this.message = "Roll Attack.";
    this.buttons = [MML.menuButtons.rollDice];
};
MML.charMenuMeleeDefenseRoll = function charMenuMeleeDefenseRoll(input) {
    var blockChance = input.blockChance;
    var dodgeChance = input.dodgeChance;

    this.who = input.who;
    this.message = "How will " + this.who + " defend?";
    this.buttons = [{
        text: "Dodge: " + dodgeChance + "%",
        nextMenu: "menuIdle",
        callback: function(input) {
            MML.processCommand({
                type: "character",
                who: this.who,
                callback: "meleeDodgeRoll",
                input: {
                    dodgeChance: dodgeChance
                }
            });
        }
    }, {
        text: "Block: " + blockChance + "%",
        nextMenu: "menuIdle",
        callback: function(input) {
            MML.processCommand({
                type: "character",
                who: this.who,
                callback: "meleeBlockRoll",
                input: {
                    blockChance: blockChance
                }
            });
        }
    }, {
        text: "Take it",
        nextMenu: "menuIdle",
        callback: function(input) {
            MML.processCommand({
                type: "character",
                who: this.who,
                callback: "forgoDefense",
                input: {}
            });
        }
    }];
};
MML.charMenuRangedDefenseRoll = function charMenuRangedDefenseRoll(input) {
    var defenseChance = input.defenseChance;

    this.who = input.who;
    this.message = "How will " + this.who + " defend?";
    this.buttons = [{
        text: "Defend: " + defenseChance + "%",
        nextMenu: "menuIdle",
        callback: function(input) {
            MML.processCommand({
                type: "character",
                who: this.who,
                callback: "rangedDefenseRoll",
                input: {
                    defenseChance: defenseChance
                }
            });
        }
    }, {
        text: "Take it",
        nextMenu: "menuIdle",
        callback: function(input) {
            MML.processCommand({
                type: "character",
                who: this.who,
                callback: "forgoDefense",
                input: {}
            });
        }
    }];
};

MML.menuButtons = {};
MML.menuButtons.GmMenuMain = {
    text: "GmMenuMain",
    nextMenu: "GmMenuMain",
    callback: function(input) {
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.combatMenu = {
    text: "Combat",
    nextMenu: "GmMenuCombat",
    callback: function(input) {
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.newCharacterMenu = {
    text: "New Character",
    nextMenu: "GmMenuNewCharacter",
    callback: function(input) {
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};

MML.menuButtons.newItemMenu = {
    text: "New Item",
    nextMenu: "GmMenuNewItem",
    callback: function(input) {
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.newWeapon = {
    text: "Weapon",
    nextMenu: "GmMenuNewWeapon",
    callback: function(input) {
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};

MML.menuButtons.newShield = {
    text: "Shield",
    nextMenu: "GmMenuNewShield",
    callback: function(input) {
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.newArmor = {
    text: "Armor",
    nextMenu: "GmMenuNewArmor",
    callback: function(input) {
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.newSpellComponent = {
    text: "Spell Component",
    nextMenu: "GmMenuNewSpellComponent",
    callback: function(input) {
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.newMiscItem = {
    text: "Misc",
    nextMenu: "GmMenuNewMiscItem",
    callback: function(input) {
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.itemQualityPoor = {
    text: "Poor",
    nextMenu: "GmMenuNewItemProperties",
    callback: function(input) {
        state.MML.GM.newItem.quality = input.text;
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.itemQualityStandard = {
    text: "Standard",
    nextMenu: "GmMenuNewItemProperties",
    callback: function(input) {
        state.MML.GM.newItem.quality = input.text;
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.itemQualityExcellent = {
    text: "Excellent",
    nextMenu: "GmMenuNewItemProperties",
    callback: function(input) {
        state.MML.GM.newItem.quality = input.text;
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.itemQualityMasterWork = {
    text: "Master Work",
    nextMenu: "GmMenuNewItemProperties",
    callback: function(input) {
        state.MML.GM.newItem.quality = input.text;
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.assignNewItem = {
    text: "Assign Item",
    nextMenu: "GmMenuMain",
    callback: function(input) {
        input.charName = this.name;
        input.callback = "assignNewItem";
        MML.displayTargetSelection(input);
    }
};

MML.menuButtons.worldMenu = {
    text: "World",
    nextMenu: "GmMenuWorld",
    callback: function(input) {
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.utilitiesMenu = {
    text: "Utilities",
    nextMenu: "GmMenuUtilities",
    callback: function(input) {
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.startCombat = {
    text: "Start Combat",
    nextMenu: "charMenuPrepareAction",
    callback: function(input) {
        MML.processCommand({
            type: "GM",
            callback: "startCombat",
            input: input
        });
    }
};
MML.menuButtons.toMainGmMenu = {
    text: "Back",
    nextMenu: "GmMenuMain",
    callback: function(input) {
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};

MML.menuButtons.startRound = {
    text: "Start Round",
    nextMenu: "GmMenuStartRound",
    callback: function(input) {
        MML.processCommand({
            type: "GM",
            callback: "startRound",
            input: {}
        });
    }
};
MML.menuButtons.endCombat = {
    text: "End Combat",
    nextMenu: "GmMenuMain",
    callback: function(input) {
        MML.processCommand({
            type: "GM",
            callback: "endCombat",
            input: {}
        });
    }
};
MML.menuButtons.setActionAttack = {
    text: "Attack",
    nextMenu: "charMenuAttack",
    callback: function(input) {
        MML.processCommand({
            type: "character",
            who: this.who,
            callback: "setApiCharAttribute",
            input: {
                attribute: "action",
                value: {
                    name: "Attack",
                    getTargets: "getSingleTarget",
                    callback: "startAttackAction",
                    modifiers: []
                }
            }
        });
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.setActionCast = {
    text: "Cast",
    nextMenu: "charMenuCast",
    callback: function(input) {
        state.MML.characters[this.who].action.name = input.text;
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.setActionReadyItem = {
    text: "Ready Item",
    nextMenu: "charMenuReadyItem",
    callback: function(input) {
        state.MML.characters[this.who].action.name = input.text;
        sendChat("", "Ready Item not ready...lol");
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.setActionObserve = {
    text: "Observe",
    nextMenu: "charMenuPrepareAction",
    callback: function(input) {
        state.MML.characters[this.who].action.name = input.text;
        sendChat("", "Observe");
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.changeAction = {
    text: "Change Action",
    nextMenu: "charMenuPrepareAction",
    callback: function(input) {
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.actionPrepared = {
    text: "Ready",
    nextMenu: "charMenuPrepareAction",
    callback: function(input) {
        state.MML.characters[this.who].ready = true;
        state.MML.characters[this.who].updateCharacter("ready");
        state.MML.characters[this.who].updateCharacter("action");
        this.characterIndex++;
        if (this.characterIndex < this.combatants.length) {
            MML.charMenuPrepareAction.apply(this, [this.combatants[this.characterIndex]]);
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
            });
        } else if (this.name === state.MML.GM.player) {
            MML.GmMenuStartRound.apply(this, ["GM"]);
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
            });
        } else {
            this.menu = "menuIdle";
            MML.processCommand({
                type: "player",
                who: this.name,
                callback: "displayMenu",
                input: {}
            });
        }
    }
};

MML.menuButtons.chooseTargets = {
    text: "Choose Targets",
    nextMenu: "charMenuChooseTargets",
    callback: function(input) {
        MML.processCommand({
            type: "player",
            who: this.name,
            callback: "displayMenu",
            input: {}
        });
    }
};
MML.menuButtons.acceptAction = {
    text: "Accept",
    nextMenu: "menuIdle",
    callback: function(input) {
        MML.processCommand({
            type: "character",
            who: this.who,
            callback: "setApiCharAttribute",
            input: {
                attribute: "ready",
                value: true
            }
        });
        MML.processCommand({
            type: "character",
            who: this.who,
            callback: "updateCharacter",
            input: {
                attribute: "action"
            }
        });
        MML.processCommand({
            type: "GM",
            callback: "nextAction",
            input: {}
        });
    }
};
MML.menuButtons.endAction = {
    text: "End Action",
    nextMenu: "charMenuPrepareAction",
    callback: function(input) {
        MML.endAction();
    }
};
MML.menuButtons.rollDice = {
    text: "Roll",
    nextMenu: "menuIdle",
    callback: function(input) {
        state.MML.GM.currentRoll.getRoll();
    }
};
MML.menuButtons.initiativeRoll = {
    text: "Roll",
    nextMenu: "menuIdle",
    callback: function(input) {
        MML.processCommand({
            type: "character",
            who: this.who,
            callback: "initiativeRoll",
            input: {}
        });
    }
};

MML.menuButtons.acceptRoll = {
    text: "Accept",
    nextMenu: "menuIdle",
    callback: function(input) {
        MML[this.currentRoll.applyResult].apply(this, []);
    }
};

MML.menuButtons.changeRoll = {
    text: "Change",
    nextMenu: "menuIdle",
    callback: function(input) {
        MML.displayGmRoll.apply(this, []);
    }
};

MML.menuButtons.rollHitPosition = {
    text: "Roll",
    nextMenu: "charMenuRollDamage",
    callback: function(input) {
        MML.getHitPositionRoll.apply(state.MML.GM, []);
    }
};
MML.menuButtons.setProne = {
    text: "Prone",
    nextMenu: "menuCombatMovement",
    callback: function(input) {
        MML.processCommand({
            type: "character",
            who: this.who,
            callback: "setApiCharAttribute",
            input: {
                attribute: "movementPosition",
                value: "Prone"
            }
        });
        MML.processCommand({
            type: "character",
            who: this.who,
            callback: "displayMovement",
            input: {}
        });
    }
};
MML.menuButtons.setCrawl = {
    text: "Crawl",
    nextMenu: "menuCombatMovement",
    callback: function(input) {
        MML.processCommand({
            type: "character",
            who: this.who,
            callback: "setApiCharAttribute",
            input: {
                attribute: "movementPosition",
                value: "Crawl"
            }
        });
        MML.processCommand({
            type: "character",
            who: this.who,
            callback: "displayMovement",
            input: {}
        });
    }
};
MML.menuButtons.setStalk = {
    text: "Stalk",
    nextMenu: "menuCombatMovement",
    callback: function(input) {
        MML.processCommand({
            type: "character",
            who: this.who,
            callback: "setApiCharAttribute",
            input: {
                attribute: "movementPosition",
                value: "Stalk"
            }
        });
        MML.processCommand({
            type: "character",
            who: this.who,
            callback: "displayMovement",
            input: {}
        });
    }
};
MML.menuButtons.setWalk = {
    text: "Walk",
    nextMenu: "menuCombatMovement",
    callback: function(input) {
        MML.processCommand({
            type: "character",
            who: this.who,
            callback: "setApiCharAttribute",
            input: {
                attribute: "movementPosition",
                value: "Walk"
            }
        });
        MML.processCommand({
            type: "character",
            who: this.who,
            callback: "displayMovement",
            input: {}
        });
    }
};
MML.menuButtons.setJog = {
    text: "Jog",
    nextMenu: "menuCombatMovement",
    callback: function(input) {
        MML.processCommand({
            type: "character",
            who: this.who,
            callback: "setApiCharAttribute",
            input: {
                attribute: "movementPosition",
                value: "Jog"
            }
        });
        MML.processCommand({
            type: "character",
            who: this.who,
            callback: "displayMovement",
            input: {}
        });
    }
};
MML.menuButtons.setRun = {
    text: "Run",
    nextMenu: "menuCombatMovement",
    callback: function(input) {
        MML.processCommand({
            type: "character",
            who: this.who,
            callback: "setApiCharAttribute",
            input: {
                attribute: "movementPosition",
                value: "Run"
            }
        });
        MML.processCommand({
            type: "character",
            who: this.who,
            callback: "displayMovement",
            input: {}
        });
    }
};
MML.menuButtons.endMovement = {
    text: "End Movement",
    nextMenu: "menuIdle",
    callback: function(input) {
        var path = getObj('path', state.MML.characters[this.who].pathID);
        if (!_.isUndefined(path)) {
            path.remove();
        }
        MML.processCommand({
            type: "character",
            who: this.who,
            callback: "startAction",
            input: {}
        });
    }
};
MML.menuButtons.defenseBlock = {
    text: "Block",
    nextMenu: "menuIdle",
    callback: function(input) {
        state.MML.characters[this.who].defense.style = "Block";
        state.MML.characters[this.who].defense.number++;
        MML.getDefenseRoll.apply(state.MML.GM, []);
    }
};
MML.menuButtons.defenseDodge = {
    text: "Dodge",
    nextMenu: "menuIdle",
    callback: function(input) {
        state.MML.characters[this.who].defense.style = "Dodge";
        state.MML.characters[this.who].defense.number++;
        state.MML.characters[this.who].defense.dodge = true;
        MML.getDefenseRoll.apply(state.MML.GM, []);
    }
};
MML.menuButtons.defenseTakeIt = {
    text: "Take It",
    nextMenu: "menuIdle",
    callback: function(input) {
        state.MML.characters[this.who].defense.style = "Take It";
        MML.getDefenseRoll.apply(state.MML.GM, []);
    }
};

MML.GmMenuWorld = function world(input) {
    //pass time, travel, other stuff
};

MML.GmMenuUtilities = function utilities(input) {
    //edit states and other api stuff
};
