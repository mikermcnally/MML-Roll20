import {
  AttributeProperties,
  Id,
  IR20Campaign,
  IR20Card,
  IR20ChatMessage,
  IR20Object,
  IR20Path,
  LineEffectType,
  ObjectType,
  PointEffectType,
  R20Event,
  IR20CustomFX,
  IR20Token
} from "./roll20/roll20";
import { Point, Integer } from "./utilities/utilities";
import * as _ from "underscore";

declare global {
  function Campaign(): IR20Campaign;
  function createObj(type: ObjectType, attributes: object): IR20Object;
  function filterObjs(callback: (obj: IR20Object) => boolean): IR20Object;
  function findObjs(attrs: object, options?: object): Array<IR20Object>;
  function getAllObjs(): Array<IR20Object>;
  function getAttrByName(character_id: Id, attribute_name: string, value_type?: AttributeProperties.Current | AttributeProperties.Max): string;
  function getObj(type: ObjectType, id: Id): IR20Object;
  function log(message: string): void;
  function on(event: R20Event, callback: (any) => void): void;
  function onSheetWorkerCompleted(callback: () => void): void;
  function playerIsGM(player_id: Id): boolean;
  function sendChat(speaking_as: string, message: string, callback?: (messages: Array<IR20ChatMessage>) => void, options?: { noarchive?: boolean, use3d?: boolean }): void;
  function sendPing(left: Point['left'], top: Point['top'], page_id: Id, player_id?: Id, move_all?: boolean): void;
  function spawnFx(left: Point['left'], top: Point['top'], type: PointEffectType['type'] | Id, page_id?: Id): void;
  function spawnFxBetweenPoints(start: { x: Point['left'], y: Point['top'] }, end: { x: Point['left'], y: Point['top'] }, type: LineEffectType['type'] | Id, page_id?: Id): void;
  function spawnFxWithDefinition(left: Point['left'], top: Point['top'], definition: IR20CustomFX, page_id?: Id): void;
  function randomInteger(max: Integer.Unsigned): Integer.Unsigned;
  function toBack(graphic: IR20Token | IR20Path | IR20Card): void;
  function toFront(graphic: IR20Token | IR20Path | IR20Card): void;

  var state: {
    MML: {}
  };
  // const _: _;
}
