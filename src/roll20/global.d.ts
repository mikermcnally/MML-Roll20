import * as Roll20 from "./roll20";
import { Integer } from "../utilities/aliases";
import Point from "../utilities/coordinate";
import * as _ from "underscore";

declare global {
  function Campaign(): Roll20.ICampaign;
  function createObj(type: Roll20.ObjectType, attributes: object): 
    Roll20.IAbility |
    Roll20.IAttribute |
    Roll20.ICharacter |
    Roll20.ICard |
    Roll20.ICustomFX |
    Roll20.IDeck |
    Roll20.IToken |
    Roll20.ICardGraphic |
    Roll20.IHand |
    Roll20.IHandout |
    Roll20.IMacro |
    Roll20.IPage |
    Roll20.IPath |
    Roll20.IPlayer |
    Roll20.IRollableTable |
    Roll20.ITableItem |
    Roll20.IText;

  function filterObjs(callback: (obj: Roll20.IObject) => boolean):
    Array<Roll20.IAbility> |
    Array<Roll20.IAttribute> |
    Array<Roll20.ICharacter> |
    Array<Roll20.ICard> |
    Array<Roll20.ICustomFX> |
    Array<Roll20.IDeck> |
    Array<Roll20.IToken> |
    Array<Roll20.ICardGraphic> |
    Array<Roll20.IHand> |
    Array<Roll20.IHandout> |
    Array<Roll20.IMacro> |
    Array<Roll20.IPage> |
    Array<Roll20.IPath> |
    Array<Roll20.IPlayer> |
    Array<Roll20.IRollableTable> |
    Array<Roll20.ITableItem> |
    Array<Roll20.IText>;

  function findObjs(attrs: object, options?: object): 
    Array<Roll20.IAbility> |
    Array<Roll20.IAttribute> |
    Array<Roll20.ICharacter> |
    Array<Roll20.ICard> |
    Array<Roll20.ICustomFX> |
    Array<Roll20.IDeck> |
    Array<Roll20.IToken> |
    Array<Roll20.ICardGraphic> |
    Array<Roll20.IHand> |
    Array<Roll20.IHandout> |
    Array<Roll20.IMacro> |
    Array<Roll20.IPage> |
    Array<Roll20.IPath> |
    Array<Roll20.IPlayer> |
    Array<Roll20.IRollableTable> |
    Array<Roll20.ITableItem> |
    Array<Roll20.IText>;

  function getAllObjs(): Array<Roll20.IObject>;

  function getAttrByName(character_id: Roll20.Id, attribute_name: string, value_type ? : Roll20.AttributeProperties.Current | Roll20.AttributeProperties.Max): string;

  function getObj(type: Roll20.ObjectType, id: Roll20.Id):
    Roll20.IAbility |
    Roll20.IAttribute |
    Roll20.ICharacter |
    Roll20.ICard |
    Roll20.ICustomFX |
    Roll20.IDeck |
    Roll20.IToken |
    Roll20.ICardGraphic |
    Roll20.IHand |
    Roll20.IHandout |
    Roll20.IMacro |
    Roll20.IPage |
    Roll20.IPath |
    Roll20.IPlayer |
    Roll20.IRollableTable |
    Roll20.ITableItem |
    Roll20.IText;

  function log(message: string): void;

  function on(event: Roll20.Event.Add, callback: (obj: Roll20.IObject) => void): void;

  function on(event: Roll20.Event.Change, callback: (obj: Roll20.IObject, prev: object) => void): void;

  function on(event: Roll20.Event.Destroy, callback: (obj: Roll20.IObject) => void): void;

  function on(event: Roll20.Event.ChatMessage, callback: (message: Roll20.ChatMessage) => void): void;

  function on(event: Roll20.Event.Ready, callback: () => void): void;

  function onSheetWorkerCompleted(callback: () => void): void;

  function playerIsGM(player_id: Roll20.Id): boolean;

  function sendChat(speaking_as: string, message: string, callback?: (messages: Array <Roll20.ChatMessage>) => void, options?: { noarchive?: boolean, use3d?: boolean }): void;

  function sendPing(left: Point['left'], top: Point['top'], page_id: Roll20.Id, player_id?: Roll20.Id, move_all?: boolean): void;

  function spawnFx(left: Point['left'], top: Point['top'], type: Roll20.PointEffectType['type'] | Roll20.Id, page_id?: Roll20.Id): void;

  function spawnFxBetweenPoints(start: { x: Point['left'], y: Point['top'] }, end: { x: Point['left'], y: Point['top'] }, type: Roll20.LineEffectType['type'] | Roll20.Id, page_id?: Roll20.Id): void;

  function spawnFxWithDefinition(left: Point['left'], top: Point['top'], definition: Roll20.ICustomFX, page_id?: Roll20.Id): void;

  function randomInteger(max: Integer.Unsigned): Integer.Unsigned;

  function toBack(graphic: Roll20.IToken | Roll20.IPath | Roll20.ICard): void;

  function toFront(graphic: Roll20.IToken | Roll20.IPath | Roll20.ICard): void;

  var state: {
    MML: {}
  };
  // const _: _;
}
