import * as Roll20 from "./roll20";
import { Integer } from "../utilities/aliases";
import Point from "../utilities/coordinate";
import * as _ from "underscore";

declare global {
  function Campaign(): Roll20.Campaign;
  function createObj(type: Roll20.ObjectType.Ability, attributes: Roll20.IAbility): Roll20.Ability;
  function createObj(type: Roll20.ObjectType.Attribute, attributes: Roll20.IAttribute): Roll20.Attribute;
  function createObj(type: Roll20.ObjectType.Character, attributes: Roll20.ICharacter): Roll20.Character;
  function createObj(type: Roll20.ObjectType.Card, attributes: Roll20.ICard): Roll20.Card;
  function createObj(type: Roll20.ObjectType.CustomFX, attributes: Roll20.ICustomFX): Roll20.CustomFX;
  function createObj(type: Roll20.ObjectType.Deck, attributes: Roll20.IDeck): Roll20.Deck;
  function createObj(type: Roll20.ObjectType.Graphic, attributes: Roll20.IToken): Roll20.Token;
  function createObj(type: Roll20.ObjectType.Graphic, attributes: Roll20.ICardGraphic): Roll20.CardGraphic;
  function createObj(type: Roll20.ObjectType.Hand, attributes: Roll20.IHand): Roll20.Hand;
  function createObj(type: Roll20.ObjectType.Handout, attributes: Roll20.IHandout): Roll20.Handout;
  function createObj(type: Roll20.ObjectType.Macro, attributes: Roll20.IMacro): Roll20.Macro;
  function createObj(type: Roll20.ObjectType.Page, attributes: Roll20.IPage): Roll20.Page;
  function createObj(type: Roll20.ObjectType.Path, attributes: Roll20.IPath): Roll20.Path;
  function createObj(type: Roll20.ObjectType.Player, attributes: Roll20.IPlayer): Roll20.Player;
  function createObj(type: Roll20.ObjectType.RollableTable, attributes: Roll20.IRollableTable): Roll20.RollableTable;
  function createObj(type: Roll20.ObjectType.TableItem, attributes: Roll20.ITableItem): Roll20.TableItem;
  function createObj(type: Roll20.ObjectType.Text, attributes: Roll20.IText): Roll20.Text;
  function filterObjs(callback: (obj: Roll20.IObject) => boolean): Array<Roll20.IObject>;
  function findObjs(attrs: object, options?: object): Array<Roll20.IObject>;
  function getAllObjs(): Array<Roll20.IObject>;
  function getAttrByName(character_id: Roll20.Character['id'], attribute_name: string, value_type?: Roll20.AttributeValueType): Roll20.Attribute;
  function getObj(type: Roll20.AttributeValueType, id: Roll20.Id): Roll20.IObject;
  function log(message: string): void;
  function on(event: Roll20.Event.Add, callback: (obj: Roll20.IObject) => void): void;
  function on(event: Roll20.Event.Change, callback: (obj: Roll20.IObject, prev: object) => void): void;
  function on(event: Roll20.Event.Destroy, callback: (obj: Roll20.IObject) => void): void;
  function on(event: Roll20.Event.Chat, callback: (message: Roll20.ChatMessage) => void): void;
  function on(event: Roll20.Event.Ready, callback: () => void): void;
  function onSheetWorkerCompleted(callback: () => void): void;
  function playerIsGM(player_id: Roll20.Player['id']): boolean;
  function sendChat(speaking_as: string, message: string, callback?: (messages: Array<Roll20.ChatMessage>) => void, options?: { noarchive?: boolean, use3d?: boolean }): void;
  function sendPing(left: Point['left'], top: Point['top'], page_id: Roll20.Id, player_id?: Roll20.Id, move_all?: boolean): void;
  function spawnFx(left: Point['left'], top: Point['top'], type: Roll20.PointEffectType['type'] | Roll20.Id, page_id?: Roll20.Id): void;
  function spawnFxBetweenPoints(start: { x: Point['left'], y: Point['top'] }, end: { x: Point['left'], y: Point['top'] }, type: Roll20.LineEffectType['type'] | Roll20.Id, page_id?: Roll20.Id): void;
  function spawnFxWithDefinition(left: Point['left'], top: Point['top'], definition: Roll20.CustomFX, page_id?: Roll20.Id): void;
  function randomInteger(max: Integer.Positive): Integer.Positive;
  function toBack(graphic: Roll20.Graphic|Roll20.Path): void;
  function toFront(graphic: Roll20.Graphic|Roll20.Path): void;

  var state: object;
  const _: _;
}
