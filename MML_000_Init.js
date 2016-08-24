/* jshint -W069 */
var MML = MML || {};

MML.init = function init(){
    state.MML = state.MML || {};
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
        buttons:[MML.menuButtons.GmMenuMain],
        characters: [],
        characterIndex: 0
    };
    state.MML.players["Andrew"] = {
        name: "Andrew",
        who: "",
        menu: "",
        characters: [],
        characterIndex: 0
    };
    _.each(state.MML.players, function(player){
		//Clear players' list of characters
		player.characters = [];
	});

	var characters = {};
	var characterObjects = findObjs({
        _type: "character",
        archived: false
    }, {caseInsensitive: false});

    _.each(characterObjects, function(character){
    	var charName = character.get("name");
    	characters[charName] = new MML.characterConstructor(charName);
    	//Add to player's list of characters
		state.MML.players[characters[charName].player].characters.push(charName);
    });
	state.MML.characters = characters;

    TokenCollisions = {
        "Layer": "gmlayer"
    };

    log(TokenCollisions);
// var data = [
// ,,,];


// state.MML.GM = data[0];
// state.MML.players = data[1];
// state.MML.characters =data[2];
// MML.processCommand(data[3]);
};
