MML.processCommand = function processCommand(command){
	state.MML.processCommandValue = command;
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
		
	}		
};

 module.exports = {
 	MML: MML
 };
