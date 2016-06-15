_ = require('underscore');
roll20 = require('../Roll20 Emulation/Roll20');

state = roll20.state;
log = roll20.log;
sendChat = roll20.sendChat;
createObj = roll20.createObj;
getObj = roll20.getObj;
findObjs = roll20.findObj;
randomInteger = roll20.randomInteger;
Campaign = roll20.Campaign;
on = function(event) {};

var MML = require('./MML_test').MML;
hitPositionRoll_0_hitTable_A();

function hitPositionRoll_0_hitTable_A(){
    // state.MML.players
}

function test_setup() {
    state.MML = {};
    state.MML.GM = state.MML.GM || {
        player: "Robot",
        name: "GM",
        currentAction: {},
        inCombat: false,
        currentRound: 0,
        roundStarted: false
    };

    state.MML.players = {};
    state.MML.players["Robot"] = {
        name: "Robot",
        who: "GM",
        menu: "GmMenuMain",
        buttons: [MML.menuButtons.GmMenuMain],
        characters: [],
        characterIndex: 0
    };
    _.each(state.MML.players, function(player) {
        //Clear players' list of characters
        player.characters = [];
    });

    state.MML.characters = {};

    _.each(["test1", "test2"], function(charName) {
        var character = createObj("character", {
            name: charName,
            "bio": "",
            "gmnotes": "",
            "_defaulttoken": "",
            "archived": false,
            "inplayerjournals": "",
            "controlledby": "",
            "avatar": ""
        });
        MML.createAttribute("player", state.MML.GM.player, "", character);
        MML.createAttribute("name", charName, "", character);
        MML.createAttribute("race", "Human", "", character);
        MML.createAttribute("gender", "Male", "", character);
        MML.createAttribute("statureRoll", 20, "", character);
        MML.createAttribute("strengthRoll", 20, "", character);
        MML.createAttribute("coordinationRoll", 20, "", character);
        MML.createAttribute("healthRoll", 20, "", character);
        MML.createAttribute("beautyRoll", 20, "", character);
        MML.createAttribute("intellectRoll", 20, "", character);
        MML.createAttribute("reasonRoll", 20, "", character);
        MML.createAttribute("creativityRoll", 20, "", character);
        MML.createAttribute("presenceRoll", 20, "", character);
        MML.createAttribute("fomInitBonus", 6, "", character);
        MML.createAttribute("rightHand", JSON.stringify({
            _id: "emptyHand"
        }), "", character);
        MML.createAttribute("leftHand", JSON.stringify({
            _id: "emptyHand"
        }), "", character);

        // console.log(character.id);
        // console.log(MML.getCharAttribute(charName, "race"));

        state.MML.characters[charName] = new MML.characterConstructor(charName);

        MML.processCommand({
            type: "character",
            who: charName,
            triggeredFunction: "updateCharacter",
            input: {
                attribute: "race"
            }
        });
    });
    // console.log(state.MML.players);
    // _.each(state.MML.characters, function(character) {
    //     console.log(character);
    //     state.MML.players[character.player].characters.push(charName);
    // });
}

test_setup();

getHitTableHumanoid_unarmed();
getHitTableHumanoid_meleeLeft();
getHitTableHumanoid_meleeRight();
getHitTableHumanoid_thrown();
getHitTableHumanoid_missile();
getHitTableHumanoid_dualWield();
getHitTableHumanoid_twohander();
getHitTableHumanoid_shieldWeapon();
getHitTableHumanoid_shieldOnly();
getHitPostionHumanoid_A_1();
getHitPostionHumanoid_A_50();
getHitPostionHumanoid_A_100();
getHitPostionHumanoid_A_101();
getHitPostionHumanoid_A_0();
getHitPostionHumanoid_B_1();
getHitPostionHumanoid_B_50();
getHitPostionHumanoid_B_100();
getHitPostionHumanoid_C_1();
getHitPostionHumanoid_C_50();
getHitPostionHumanoid_C_100();
getBodyParts_humanoid();
getBodyParts_NonexistantBodyType();
getCalledShotHitPositionHumanoid_head_1();
getCalledShotHitPositionHumanoid_head_7();
getCalledShotHitPositionHumanoid_head_8();
getCalledShotHitPositionHumanoid_head_0();
getCalledShotHitPositionHumanoid_plumbus();
getHitPositionNames_humanoid();
getHitPositionNames_NonexistantBodyType();
rollHitPosition_humanoid_default();
rollHitPosition_humanoid_calledshot();
rollHitPosition_humanoid_calledshotSpecific();

function rollHitPosition_humanoid_default() {
    state.MML.characters.target = {
        inventory: {
            emptyHand: {
                type: "empty",
                weight: 0
            }
        },
        leftHand: {
            _id: "emptyHand"
        },
        rightHand: {
            _id: "emptyHand"
        },
        bodyType: "humanoid",
        hitTable: "A"
    };
    var actor = {
        name: "actor",
        player: "Robot",
        statusEffects: {}
    };
    var input = {};
    state.MML.GM.currentAction = {
        targetArray: ["target"],
        targetIndex: 0
    };

    try {
        MML.hitPositionRoll.apply(actor, [input]);
        var result = state.MML.players["Robot"].currentRoll;
        var expected = {
            character: "actor",
            type: "hitPosition",
            rollResultFunction: "hitPositionRollResult",
            player: "Robot",
            range: "1-46",
            accepted: false
        };

        if (_.isMatch(result, expected) &&
            _.has(result.result, "name") &&
            _.has(result.result, "hp") &&
            _.has(result.result, "bodyPart") &&
            _.isNumber(result.value)) {
            console.log("rollHitPosition_humanoid_default passed!");
        } else {
            console.log("rollHitPosition_humanoid_default failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("rollHitPosition_humanoid_default");
        console.log(error);
    }
}

function rollHitPosition_humanoid_calledshot() {
    state.MML.characters.target = {
        inventory: {
            emptyHand: {
                type: "empty",
                weight: 0
            }
        },
        leftHand: {
            _id: "emptyHand"
        },
        rightHand: {
            _id: "emptyHand"
        },
        bodyType: "humanoid",
        hitTable: "A"
    };
    var actor = {
        name: "actor",
        player: "Robot",
        statusEffects: {
            "Called Shot": {}
        }
    };
    var input = {};
    state.MML.GM.currentAction = {
        targetArray: ["target"],
        targetIndex: 0,
        calledShot: "Head"
    };

    try {
        MML.hitPositionRoll.apply(actor, [input]);
        var result = state.MML.players["Robot"].currentRoll;
        var expected = {
            character: "actor",
            type: "hitPosition",
            rollResultFunction: "hitPositionRollResult",
            player: "Robot",
            range: "1-7",
            accepted: false
        };

        if (_.isMatch(result, expected) &&
            _.has(result.result, "name") &&
            result.result.hp === "hpHead" &&
            result.result.bodyPart === "Head" &&
            _.isNumber(result.value)) {
            console.log("rollHitPosition_humanoid_calledshot passed!");
        } else {
            console.log("rollHitPosition_humanoid_calledshot failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("rollHitPosition_humanoid_calledshot");
        console.log(error);
    }
}

function rollHitPosition_humanoid_calledshotSpecific() {
    state.MML.characters.target = {
        inventory: {
            emptyHand: {
                type: "empty",
                weight: 0
            }
        },
        leftHand: {
            _id: "emptyHand"
        },
        rightHand: {
            _id: "emptyHand"
        },
        bodyType: "humanoid",
        hitTable: "A"
    };
    var actor = {
        name: "actor",
        player: "Robot",
        statusEffects: {
            "Called Shot Specific": {}
        }
    };
    var input = {};
    state.MML.GM.currentAction = {
        targetArray: ["target"],
        targetIndex: 0,
        calledShot: "Top of Head"
    };

    try {
        MML.hitPositionRoll.apply(actor, [input]);
        var result = state.MML.players["Robot"].currentRoll;
        var expected = {
            character: "actor",
            type: "hitPosition",
            rollResultFunction: "hitPositionRollResult",
            player: "Robot",
            range: "1-1",
            accepted: false
        };

        if (_.isMatch(result, expected) &&
            result.result.name === "Top of Head" &&
            result.result.hp === "hpHead" &&
            result.result.bodyPart === "Head" &&
            result.value === 1) {
            console.log("rollHitPosition_humanoid_calledshotSpecific passed!");
        } else {
            console.log("rollHitPosition_humanoid_calledshotSpecific failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("rollHitPosition_humanoid_calledshotSpecific");
        console.log(error);
    }
}

function getHitTableHumanoid_unarmed() {
    var character = {
        inventory: {
            emptyHand: {
                type: "empty",
                weight: 0
            }
        },
        leftHand: {
            _id: "emptyHand"
        },
        rightHand: {
            _id: "emptyHand"
        },
        bodyType: "humanoid"
    };

    try {
        var result = MML.getHitTable(character);
        var expected = "A";

        if (_.isEqual(result, expected)) {
            console.log("getHitTableHumanoid_unarmed passed!");
        } else {
            console.log("getHitTableHumanoid_unarmed failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitTableHumanoid_unarmed");
        console.log(error);
    }
}

function getHitTableHumanoid_meleeLeft() {
    var character = {
        inventory: {
            emptyHand: {
                type: "empty",
                weight: 0
            },
            id: MML.items["Knife"]
        },
        leftHand: {
            _id: "id",
            grip: "One Hand"
        },
        rightHand: {
            _id: "emptyHand"
        },
        bodyType: "humanoid"
    };

    try {
        var result = MML.getHitTable(character);
        var expected = "A";

        if (_.isEqual(result, expected)) {
            console.log("getHitTableHumanoid_meleeLeft passed!");
        } else {
            console.log("getHitTableHumanoid_meleeLeft failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitTableHumanoid_meleeLeft");
        console.log(error);
    }
}

function getHitTableHumanoid_meleeRight() {
    var character = {
        inventory: {
            emptyHand: {
                type: "empty",
                weight: 0
            },
            id: MML.items["Knife"]
        },
        leftHand: {
            _id: "emptyHand"
        },
        rightHand: {
            _id: "id",
            grip: "One Hand"
        },
        bodyType: "humanoid"
    };

    try {
        var result = MML.getHitTable(character);
        var expected = "A";

        if (_.isEqual(result, expected)) {
            console.log("getHitTableHumanoid_meleeRight passed!");
        } else {
            console.log("getHitTableHumanoid_meleeRight failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitTableHumanoid_meleeRight");
        console.log(error);
    }
}

function getHitTableHumanoid_thrown() {
    var character = {
        inventory: {
            emptyHand: {
                type: "empty",
                weight: 0
            },
            id: MML.items["Battle Axe, Thrown"]
        },
        leftHand: {
            _id: "emptyHand"
        },
        rightHand: {
            _id: "id",
            grip: "One Hand"
        },
        bodyType: "humanoid"
    };

    try {
        var result = MML.getHitTable(character);
        var expected = "A";

        if (_.isEqual(result, expected)) {
            console.log("getHitTableHumanoid_thrown passed!");
        } else {
            console.log("getHitTableHumanoid_thrown failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitTableHumanoid_thrown");
        console.log(error);
    }
}

function getHitTableHumanoid_missile() {
    var character = {
        inventory: {
            emptyHand: {
                type: "empty",
                weight: 0
            },
            id: MML.items["Heavy Cross Bow"]
        },
        leftHand: {
            _id: "id",
            grip: "Two Hands"
        },
        rightHand: {
            _id: "id",
            grip: "Two Hands"
        },
        bodyType: "humanoid"
    };

    try {
        var result = MML.getHitTable(character);
        var expected = "A";

        if (_.isEqual(result, expected)) {
            console.log("getHitTableHumanoid_missile passed!");
        } else {
            console.log("getHitTableHumanoid_missile failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitTableHumanoid_missile");
        console.log(error);
    }
}

function getHitTableHumanoid_dualWield() {
    var character = {
        inventory: {
            emptyHand: {
                type: "empty",
                weight: 0
            },
            id: MML.items["Knife"],
            id2: MML.items["Knife"]
        },
        leftHand: {
            _id: "id",
            grip: "One Hand"
        },
        rightHand: {
            _id: "id2",
            grip: "One Hand"
        },
        bodyType: "humanoid"
    };

    try {
        var result = MML.getHitTable(character);
        var expected = "B";

        if (_.isEqual(result, expected)) {
            console.log("getHitTableHumanoid_dualWield passed!");
        } else {
            console.log("getHitTableHumanoid_dualWield failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitTableHumanoid_dualWield");
        console.log(error);
    }
}

function getHitTableHumanoid_twohander() {
    var character = {
        inventory: {
            emptyHand: {
                type: "empty",
                weight: 0
            },
            id: MML.items["Pole Axe"]
        },
        leftHand: {
            _id: "id",
            grip: "Two Hands"
        },
        rightHand: {
            _id: "id",
            grip: "Two Hands"
        },
        bodyType: "humanoid"
    };

    try {
        var result = MML.getHitTable(character);
        var expected = "B";

        if (_.isEqual(result, expected)) {
            console.log("getHitTableHumanoid_twohander passed!");
        } else {
            console.log("getHitTableHumanoid_twohander failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitTableHumanoid_twohander");
        console.log(error);
    }
}

function getHitTableHumanoid_shieldWeapon() {
    var character = {
        inventory: {
            emptyHand: {
                type: "empty",
                weight: 0
            },
            id: MML.items["Knife"],
            id2: MML.items["Round Target Shield"]
        },
        leftHand: {
            _id: "id",
            grip: "One Hand"
        },
        rightHand: {
            _id: "id2"
        },
        bodyType: "humanoid"
    };

    try {
        var result = MML.getHitTable(character);
        var expected = "C";

        if (_.isEqual(result, expected)) {
            console.log("getHitTableHumanoid_shieldWeapon passed!");
        } else {
            console.log("getHitTableHumanoid_shieldWeapon failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitTableHumanoid_shieldWeapon");
        console.log(error);
    }
}

function getHitTableHumanoid_shieldOnly() {
    var character = {
        inventory: {
            emptyHand: {
                type: "empty",
                weight: 0
            },
            id: MML.items["Round Target Shield"]
        },
        leftHand: {
            _id: "id",
            grip: "One Hand"
        },
        rightHand: {
            _id: "emptyHand"
        },
        bodyType: "humanoid"
    };

    try {
        var result = MML.getHitTable(character);
        var expected = "C";

        if (_.isEqual(result, expected)) {
            console.log("getHitTableHumanoid_shieldOnly passed!");
        } else {
            console.log("getHitTableHumanoid_shieldOnly failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitTableHumanoid_shieldOnly");
        console.log(error);
    }
}

function getHitPostionHumanoid_A_1() {
    var character = {
        hitTable: "A",
        bodyType: "humanoid"
    };
    var rollValue = 1;
    try {
        var result = MML.getHitPosition(character, rollValue);
        var expected = MML.hitPositions.humanoid[1];

        if (_.isEqual(result, expected)) {
            console.log("getHitPostionHumanoid_A_1 passed!");
        } else {
            console.log("getHitPostionHumanoid_A_1 failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitPostionHumanoid_A_1");
        console.log(error);
    }

}

function getHitPostionHumanoid_A_50() {
    var character = {
        hitTable: "A",
        bodyType: "humanoid"
    };
    var rollValue = 50;
    try {
        var result = MML.getHitPosition(character, rollValue);
        var expected = MML.hitPositions.humanoid[21];

        if (_.isEqual(result, expected)) {
            console.log("getHitPostionHumanoid_A_50 passed!");
        } else {
            console.log("getHitPostionHumanoid_A_50 failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitPostionHumanoid_A_50");
        console.log(error);
    }
}

function getHitPostionHumanoid_A_100() {
    var character = {
        hitTable: "A",
        bodyType: "humanoid"
    };
    var rollValue = 100;
    try {
        var result = MML.getHitPosition(character, rollValue);
        var expected = MML.hitPositions.humanoid[46];

        if (_.isEqual(result, expected)) {
            console.log("getHitPostionHumanoid_A_100 passed!");
        } else {
            console.log("getHitPostionHumanoid_A_100 failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitPostionHumanoid_A_100");
        console.log(error);
    }
}

function getHitPostionHumanoid_A_101() {
    var character = {
        hitTable: "A",
        bodyType: "humanoid"
    };
    var rollValue = 0;
    try {
        var result = MML.getHitPosition(character, rollValue);
        var expected = "Error: Value out of range";

        if (_.isEqual(result, expected)) {
            console.log("getHitPostionHumanoid_A_101 passed!");
        } else {
            console.log("getHitPostionHumanoid_A_101 failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitPostionHumanoid_A_101");
        console.log(error);
    }
}

function getHitPostionHumanoid_A_0() {
    var character = {
        hitTable: "A",
        bodyType: "humanoid"
    };
    var rollValue = 0;
    try {
        var result = MML.getHitPosition(character, rollValue);
        var expected = "Error: Value out of range";

        if (_.isEqual(result, expected)) {
            console.log("getHitPostionHumanoid_A_0 passed!");
        } else {
            console.log("getHitPostionHumanoid_A_0 failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitPostionHumanoid_A_0");
        console.log(error);
    }
}

function getHitPostionHumanoid_A_undefined() {
    var character = {
        hitTable: "A",
        bodyType: "humanoid"
    };

    try {
        var result = MML.getHitPosition(character, rollValue);
        var expected = "Error: Value is not a number";

        if (_.isEqual(result, expected)) {
            console.log("getHitPostionHumanoid_A_0 passed!");
        } else {
            console.log("getHitPostionHumanoid_A_0 failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitPostionHumanoid_A_undefined");
        console.log(error);
    }
}

function getHitPostionHumanoid_B_1() {
    var character = {
        hitTable: "B",
        bodyType: "humanoid"
    };
    var rollValue = 1;
    try {
        var result = MML.getHitPosition(character, rollValue);
        var expected = MML.hitPositions.humanoid[1];

        if (_.isEqual(result, expected)) {
            console.log("getHitPostionHumanoid_B_1 passed!");
        } else {
            console.log("getHitPostionHumanoid_B_1 failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitPostionHumanoid_B_1");
        console.log(error);
    }

}

function getHitPostionHumanoid_B_50() {
    var character = {
        hitTable: "B",
        bodyType: "humanoid"
    };
    var rollValue = 50;
    try {
        var result = MML.getHitPosition(character, rollValue);
        var expected = MML.hitPositions.humanoid[23];

        if (_.isEqual(result, expected)) {
            console.log("getHitPostionHumanoid_B_50 passed!");
        } else {
            console.log("getHitPostionHumanoid_B_50 failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitPostionHumanoid_B_50");
        console.log(error);
    }
}

function getHitPostionHumanoid_B_100() {
    var character = {
        hitTable: "B",
        bodyType: "humanoid"
    };
    var rollValue = 100;
    try {
        var result = MML.getHitPosition(character, rollValue);
        var expected = MML.hitPositions.humanoid[46];

        if (_.isEqual(result, expected)) {
            console.log("getHitPostionHumanoid_B_100 passed!");
        } else {
            console.log("getHitPostionHumanoid_B_100 failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitPostionHumanoid_B_100");
        console.log(error);
    }
}

function getHitPostionHumanoid_C_1() {
    var character = {
        hitTable: "C",
        bodyType: "humanoid"
    };
    var rollValue = 1;
    try {
        var result = MML.getHitPosition(character, rollValue);
        var expected = MML.hitPositions.humanoid[1];

        if (_.isEqual(result, expected)) {
            console.log("getHitPostionHumanoid_C_1 passed!");
        } else {
            console.log("getHitPostionHumanoid_C_1 failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitPostionHumanoid_C_1");
        console.log(error);
    }

}

function getHitPostionHumanoid_C_50() {
    var character = {
        hitTable: "C",
        bodyType: "humanoid"
    };
    var rollValue = 50;
    try {
        var result = MML.getHitPosition(character, rollValue);
        var expected = MML.hitPositions.humanoid[21];

        if (_.isEqual(result, expected)) {
            console.log("getHitPostionHumanoid_C_50 passed!");
        } else {
            console.log("getHitPostionHumanoid_C_50 failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitPostionHumanoid_C_50");
        console.log(error);
    }
}

function getHitPostionHumanoid_C_100() {
    var character = {
        hitTable: "C",
        bodyType: "humanoid"
    };
    var rollValue = 100;
    try {
        var result = MML.getHitPosition(character, rollValue);
        var expected = MML.hitPositions.humanoid[46];

        if (_.isEqual(result, expected)) {
            console.log("getHitPostionHumanoid_C_100 passed!");
        } else {
            console.log("getHitPostionHumanoid_C_100 failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitPostionHumanoid_C_100");
        console.log(error);
    }
}

function getBodyParts_humanoid() {
    var character = {
        bodyType: "humanoid"
    };

    try {
        var result = MML.getBodyParts(character);
        var expected = ["Head", "Chest", "Abdomin", "Right Arm", "Right Leg", "Left Arm", "Left Leg"];

        if (_.isEmpty(_.difference(result, expected)) && result.length === expected.length) {
            console.log("getBodyParts_humanoid passed!");
        } else {
            console.log("getBodyParts_humanoid failed!");
            console.log(result);
            console.log(expected);
            console.log(_.difference(result, expected));
        }
    } catch (error) {
        console.log("getBodyParts_humanoid");
        console.log(error);
    }
}

function getBodyParts_NonexistantBodyType() {
    var character = {
        bodyType: ""
    };

    try {
        var result = MML.getBodyParts(character);
        var expected = "Error: Body type not found";

        if (result === expected) {
            console.log("getBodyParts_humanoid passed!");
        } else {
            console.log("getBodyParts_humanoid failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getBodyParts_humanoid");
        console.log(error);
    }
}

function getCalledShotHitPositionHumanoid_head_1() {
    var character = {
        bodyType: "humanoid"
    };
    var rollValue = 1;
    var bodyPart = "Head";

    try {
        var result = MML.getCalledShotHitPosition(character, rollValue, bodyPart);
        var expected = MML.hitPositions.humanoid[1];

        if (_.isEqual(result, expected)) {
            console.log("getCalledShotHitPositionHumanoid_head_1 passed!");
        } else {
            console.log("getCalledShotHitPositionHumanoid_head_1 failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getCalledShotHitPositionHumanoid_head_1");
        console.log(error);
    }
}

function getCalledShotHitPositionHumanoid_head_7() {
    var character = {
        bodyType: "humanoid"
    };
    var rollValue = 7;
    var bodyPart = "Head";

    try {
        var result = MML.getCalledShotHitPosition(character, rollValue, bodyPart);
        var expected = MML.hitPositions.humanoid[7];

        if (_.isEqual(result, expected)) {
            console.log("getCalledShotHitPositionHumanoid_head_7 passed!");
        } else {
            console.log("getCalledShotHitPositionHumanoid_head_7 failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getCalledShotHitPositionHumanoid_head_7");
        console.log(error);
    }
}

function getCalledShotHitPositionHumanoid_head_8() {
    var character = {
        bodyType: "humanoid"
    };
    var rollValue = 8;
    var bodyPart = "Head";

    try {
        var result = MML.getCalledShotHitPosition(character, rollValue, bodyPart);
        var expected = "Error: Value out of range";

        if (_.isEqual(result, expected)) {
            console.log("getCalledShotHitPositionHumanoid_head_8 passed!");
        } else {
            console.log("getCalledShotHitPositionHumanoid_head_8 failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getCalledShotHitPositionHumanoid_head_8");
        console.log(error);
    }
}

function getCalledShotHitPositionHumanoid_head_0() {
    var character = {
        bodyType: "humanoid"
    };
    var rollValue = 0;
    var bodyPart = "Head";

    try {
        var result = MML.getCalledShotHitPosition(character, rollValue, bodyPart);
        var expected = "Error: Value out of range";

        if (_.isEqual(result, expected)) {
            console.log("getCalledShotHitPositionHumanoid_head_0 passed!");
        } else {
            console.log("getCalledShotHitPositionHumanoid_head_0 failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getCalledShotHitPositionHumanoid_head_0");
        console.log(error);
    }
}

function getCalledShotHitPositionHumanoid_plumbus() {
    var character = {
        bodyType: "humanoid"
    };
    var rollValue = 1;
    var bodyPart = "Plumbus";

    try {
        var result = MML.getCalledShotHitPosition(character, rollValue, bodyPart);
        var expected = "Error: No hit positions found";

        if (_.isEqual(result, expected)) {
            console.log("getCalledShotHitPositionHumanoid_plumbus passed!");
        } else {
            console.log("getCalledShotHitPositionHumanoid_plumbus failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getCalledShotHitPositionHumanoid_plumbus");
        console.log(error);
    }
}

function getHitPositionNames_humanoid() {
    var character = {
        bodyType: "humanoid"
    };

    try {
        var result = MML.getHitPositionNames(character);
        var expected = ['Top of Head',
            'Face',
            'Rear of Head',
            'Right Side of Head',
            'Left Side of Head',
            'Neck, Throat',
            'Rear of Neck',
            'Right Shoulder',
            'Right Upper Chest',
            'Right Upper Back',
            'Left Upper Chest',
            'Left Upper Back',
            'Left Shoulder',
            'Right Upper Arm',
            'Right Lower Chest',
            'Right Mid Back',
            'Left Lower Chest',
            'Left Mid Back',
            'Left Upper Arm',
            'Right Elbow',
            'Right Abdomen',
            'Right Lower Back',
            'Left Abdomen',
            'Left Lower Back',
            'Left Elbow',
            'Right Forearm',
            'Right Hip',
            'Right Buttock',
            'Left Hip',
            'Left Buttock',
            'Left Forearm',
            'Right Hand/Wrist',
            'Groin',
            'Left Hand/Wrist',
            'Right Upper Thigh',
            'Left Upper Thigh',
            'Right Lower Thigh',
            'Left Lower Thigh',
            'Right Knee',
            'Left Knee',
            'Right Upper Shin',
            'Left Upper Shin',
            'Right Lower Shin',
            'Left Lower Shin',
            'Right Foot/Ankle',
            'Left Foot/Ankle'
        ];

        if (_.isEmpty(_.difference(result, expected)) && result.length === expected.length) {
            console.log("getHitPositionNames_humanoid passed!");
        } else {
            console.log("getHitPositionNames_humanoid failed!");
            console.log(result);
            console.log(expected);
            console.log(_.difference(result, expected));
        }
    } catch (error) {
        console.log("getHitPositionNames_humanoid");
        console.log(error);
    }
}

function getHitPositionNames_NonexistantBodyType() {
    var character = {
        bodyType: ""
    };

    try {
        var result = MML.getHitPositionNames(character);
        var expected = "Error: Body type not found";

        if (result === expected) {
            console.log("getHitPositionNames_NonexistantBodyType passed!");
        } else {
            console.log("getHitPositionNames_NonexistantBodyType failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitPositionNames_NonexistantBodyType");
        console.log(error);
    }
}

function attackAction_Melee_Standard_NoCalledshot(){
    state.MML.GM.currentAction = {
        character: {},
        parameters: {},
        rolls: {},
        triggeredFunction: "meleeAttack"
    };

    try {
        var result = MML.getHitPositionNames(character);
        var expected = "Error: Body type not found";

        if (result === expected) {
            console.log("getHitPositionNames_NonexistantBodyType passed!");
        } else {
            console.log("getHitPositionNames_NonexistantBodyType failed!");
            console.log(result);
            console.log(expected);
        }
    } catch (error) {
        console.log("getHitPositionNames_NonexistantBodyType");
        console.log(error);
    }
}

MML.meleeAttack = function meleeAttack(){
    var currentAction = state.MML.GM.currentAction;
    var character = currentAction.character;
    var parameters = currentAction.parameters;
    var target = parameters.target;
    var attackerWeapon = parameters.attackerWeapon;
    var targetWeapon = parameters.targetWeapon;
    var rolls = currentAction.rolls;

    if(_.isUndefined(rolls.attackRoll)){
        MML.meleeAttackRoll(character, attackerWeapon, sitMods, attackMods);
    }
    else if(_.isUndefined(rolls.defenseRoll)){
        if (rolls.attackRoll === "Critical Success" || rolls.attackRoll === "Success") {
            MML.meleeDefenseRoll(target, targetWeapon);
        }
        else if (rolls.attackRoll === "Critical Failure"){
            MML.endAction();
        }
        else {
            MML.endAction();
        }
    }
    else if(_.isUndefined(rolls.hitPositionRoll)){
        if (rolls.defenseRoll === "Critical Success" || rolls.defenseRoll === "Success") {
            MML.endAction(target, targetWeapon);
        }
        else if (rolls.defenseRoll === "Critical Failure"){
            MML.hitPositionRoll();
        }
        else {
            MML.hitPositionRoll();
        }
    }
    else if(_.isUndefined(rolls.damageRoll)){
        if (rolls.attackRoll === "Critical Success") {
            MML.meleeDamageRoll(character, attackerWeapon, true);
        }
        else {
            MML.meleeDamageRoll(character, attackerWeapon, false);
        }
    }
    else if(!_.isUndefined(parameters.wound)){
        MML.woundRoll();
    }
    else if(!_.isUndefined(parameters.multiWound)){
        MML.multiWoundRoll();
    }
    else if(!_.isUndefined(parameters.sensitiveArea)){
        MML.sensitiveAreaRoll();
    }
    else if(!_.isUndefined(parameters.knockDown)){
        MML.knockdownRoll();
    }
    else {
      MML.endAction();
    }
};
