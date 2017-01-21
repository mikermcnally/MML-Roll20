var MML = MML || {};

MML.init = function init() {
  state.MML = state.MML || {};
  state.MML.GM = state.MML.GM || {
    player: "Robot",
    name: "GM",
    currentAction: {},
    inCombat: false,
    currentRound: 0,
    roundStarted: false
  };
  var playerObjects = findObjs({
    _type: "player",
    online: true
  }, {
    caseInsensitive: false
  });
  state.MML.players = {};
  state.MML.players[state.MML.GM.player] = {
    name: state.MML.GM.player,
    who: "GM",
    menu: "GmMenuMain",
    buttons: [MML.menuButtons.GmMenuMain],
    characters: [],
    characterIndex: 0
  };

  _.each(playerObjects, function (player) {
    if (player.get("displayname") !== state.MML.GM.player) {
      state.MML.players[player.get("displayname")] = {
        name: player.get("displayname"),
        who: "",
        menu: "menuIdle",
        characters: [],
        characterIndex: 0
      };
    }
  });

  var characters = {};
  var characterObjects = findObjs({
    _type: "character",
    archived: false
  }, {
    caseInsensitive: false
  });

  _.each(characterObjects, function(character) {
    var charName = character.get("name");
    characters[charName] = new MML.characterConstructor(charName);
    //Add to player's list of characters
    if (_.isUndefined(state.MML.players[characters[charName].player])) {
      characters[charName].player = state.MML.GM.player;
    }
    state.MML.players[characters[charName].player].characters.push(charName);
  });
  state.MML.characters = characters;

  TokenCollisions = {
    "Layer": "gmlayer"
  };
  // var data = [
  // ,,,];


  // state.MML.GM = data[0];
  // state.MML.players = data[1];
  // state.MML.characters =data[2];
  // MML.processCommand(data[3]);
};
