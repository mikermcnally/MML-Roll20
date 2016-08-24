/* jshint -W069 */
MML.processCommand = function processCommand(command){
	if(command.callback === MML.testedFunction){
		MML.testResult = command;
	}
	else {
		try{
			switch(command.type){
				case "character":
					var character = state.MML.characters[command.who];
					MML[command.callback].apply(character, [command.input]);
		  			state.MML.characters[command.who] = character;
		  			break;
		  		case "player":
		  			var player = state.MML.players[command.who];
		  			MML[command.callback].apply(player, [command.input]);
					state.MML.players[command.who] = player;
		  			break;
		  		case "GM":
		  			MML[command.callback].apply(state.MML.GM, [command.input]);
		  			break;
		  		default:
		  			break;
			}
		}
		catch(error){
			console.log(command);
			console.log(error.message);
			console.log(error.stack);
		}
	}
};

 module.exports = {
 	MML: MML
 };
