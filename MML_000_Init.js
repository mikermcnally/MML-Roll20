var MML = MML || {};

MML.init = function() {
  state.MML = state.MML || {};
  state.MML.GM = state.MML.GM || {
    player: new MML.Player('Robot', true),
    name: 'Robot',
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
  MML.players[state.MML.GM.name] = state.MML.GM.player;

  _.each(playerObjects, function(player) {
    if (player.get('displayname') !== state.MML.GM.name) {
      MML.players[player.get('displayname')] = new MML.Player(player.get('displayname'), false);
    }
  });

  var characterObjects = findObjs({
    _type: 'character',
    archived: false
  }, {
    caseInsensitive: false
  });

  MML.characters = {};
  _.each(characterObjects, function(characterObject) {
    log(characterObject.get('name'));
    var character = new MML.Character(characterObject.get('name'), characterObject.id);
    character.setPlayer();
    MML.characters[character.name] = character;
  });
};
