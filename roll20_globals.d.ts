declare function Campaign(): object;
declare function createObj(type: string, attributes: object);
declare function filterObjs(callback): Array<object>;
declare function findObjs(attrs: object, options?: object);
declare function toFront(graphic:any): void;
declare function sendChat(speaking_as: string, message: string, callback?: Function, options?: object): void;
declare function getAttrByName(character_id: string, attribute_name: string, value_type: string);
declare function getObj(type: string, id: string);
declare function getAllObjs();
declare function getAttrByName(character_id, attribute_name, value_type);
declare function randomInteger(max: number): number;

declare var state: object;
declare const _: object;
