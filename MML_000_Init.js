var MML = MML || {};

MML.init = function() {
  state.MML = state.MML || {};
  state.MML.GM = state.MML.GM || {
    player: 'Robot',
    name: 'GM',
    currentAction: {},
    inCombat: false,
    currentRound: 0,
    roundStarted: false
  };
  var playerObjects = findObjs({
    _type: 'player',
    online: true
  }, {
    caseInsensitive: false
  });
  MML.players = {};
  MML.players[state.MML.GM.name] = {
    name: state.MML.GM.name,
    who: 'GM',
    menu: 'GmMenuMain',
    buttons: [MML.menuButtons.GmMenuMain],
    characters: [],
    characterIndex: 0
  };

  _.each(playerObjects, function(player) {
    if (player.get('displayname') !== state.MML.GM.name) {
      MML.players[player.get('displayname')] = {
        name: player.get('displayname'),
        who: '',
        menu: 'menuIdle',
        characters: [],
        characterIndex: 0
      };
    }
  });

  var characters = {};
  var characterObjects = findObjs({
    _type: 'character',
    archived: false
  }, {
    caseInsensitive: false
  });

  _.each(characterObjects, function(character) {
    var charName = character.get('name');
    characters[charName] = new MML.Character(charName);
    //Add to player's list of characters
    if (_.isUndefined(MML.players[characters[charName].player])) {
      characters[charName].player.name = state.MML.GM.name;
    }
    MML.players[characters[charName].player].characters.push(charName);
  });
  MML.characters = characters;

  TokenCollisions = {
    'Layer': 'gmlayer'
  };
  // var data = [
  // ,,,];


  // state.MML.GM = data[0];
  // MML.players = data[1];
  // MML.characters =data[2];
  // MML.processCommand(data[3]);
};
