import * as Roll20 from "./roll20";

export interface ChatMessage {
  who: string, //	The display name of the player or character that sent the message.
  playerid: Roll20.Id, //		The ID of the player that sent the message.
  type: Roll20.MessageType, //	"general"	One of "general", "rollresult", "gmrollresult", "emote", "whisper", "desc", or "api".
  content: string, //	""	The contents of the chat message. If type is "rollresult", this will be a JSON string of data about the roll.
  origRoll?: string, //		(type "rollresult" or "gmrollresult" only) The original text of the roll, eg: "2d10+5 fire damage" when the player types "/r 2d10+5 fire damage". This is equivalent to the use of content on messages with types other than "rollresult" or "gmrollresult".
  inlinerolls?: Array<object>, //		(content contains one or more inline rolls only) An array of objects containing information about all inline rolls in the message.
  rolltemplate?: string, //		(content contains one or more roll templates only) The name of the template specified.
  target?: Roll20.Id, //		(type "whisper" only) The player ID of the person the whisper is sent to. If the whisper was sent to the GM without using his or her display name (ie, "/w gm text" instead of "/w Riley text" when Riley is the GM), or if the whisper was sent to a character without any controlling players, the value will be "gm".
  target_name?: string, //		(type "whisper" only) The display name of the player or character the whisper was sent to.
  selected?: Array<Roll20.Id>, //		(type "api" only) An array of objects the user had selected when the command was entered.
};

export enum MessageType {
  General = "general",
  RollResult = "rollresult",
  GMRollResult = "gmrollresult",
  Emote = "emote",
  Whisper = "whisper",
  Desc = "desc",
  API = "api"
}