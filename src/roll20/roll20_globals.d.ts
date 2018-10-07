import * as Roll20 from "./roll20";
import { Integer } from "../utilities/aliases";
import TablePosition from "../utilities/table_position";

declare function Campaign(): Roll20.Campaign;
declare function createObj(type: Roll20.ObjectType, attributes: object): Roll20.Object;
declare function filterObjs(callback: (Roll20.Object) => boolean): Array<Roll20.Object>;
declare function findObjs(attrs: object, options?: object): Array<Roll20.Object>;
declare function getAllObjs(): Array<Roll20.Object>;
declare function getAttrByName(character_id: Roll20.Id, attribute_name: string, value_type: Roll20.AttributeValueType): Roll20.Attribute;
declare function getObj(type: Roll20.AttributeValueType, id: Roll20.Id): Roll20.Object;
declare function log(message: string): void;
declare function on(event: Roll20.EventName, callback: (...any) => void): void;
declare function onSheetWorkerCompleted(callback: (...any) => void): void;
declare function playerIsGM(player_id: Roll20.Id): boolean;
declare function playJukeboxPlaylist(playlist_id: Roll20.Id): void;
declare function sendChat(speaking_as: string, message: string, callback?: (...any) => void, options?: object): void;
declare function sendPing(left: TablePosition['left'], top: TablePosition['top'], page_id: Roll20.Id, player_id?: Roll20.Id, move_all?: boolean): void;
declare function randomInteger(max: Integer.Positive): Integer.Positive;
declare function toBack(graphic: Roll20.Token): void;
declare function toFront(graphic: Roll20.Token): void;
declare function getObj(type: string, id: string);

declare var state: object;
declare const _: object;
