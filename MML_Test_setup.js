MML.processCommand = function(command){
	if(command.callback === MML.testedFunction){
		MML.testResult = command;
	}
	else {
		try{
			switch(command.type){
				case "character":
					var character = MML.characters[command.who];
					MML[command.callback].apply(character, [command.input]);
		  			MML.characters[command.who] = character;
		  			break;
		  		case "player":
		  			var player = MML.players[command.who];
		  			MML[command.callback].apply(player, [command.input]);
					MML.players[command.who] = player;
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
