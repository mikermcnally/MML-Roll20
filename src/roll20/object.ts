import * as Roll20 from "./roll20";

export interface IObject {
  readonly type: Roll20.ObjectType;
  readonly id: Roll20.Id;
  readonly get: (string) => any;
  readonly remove?: () => void;
  readonly set: (string, any) => void;
  readonly setWithWorker: (object) => void;
  [property: string]: any;
}

export type Id = string;

export enum ObjectType {
  Ability = 'ability',
  Attribute = 'attribute',
  Character = 'character',
  Campaign = 'campaign',
  Card = 'card',
  CustomFX = 'custfx',
  Deck = 'deck',
  Graphic = 'graphic',
  Hand = 'hand',
  Handout = 'handout',
  Macro = 'macro',
  Map = 'map',
  Page = 'page',
  Path = 'path',
  Player = 'player',
  Text = 'text',
  RollableTable = 'rollabletable',
  TableItem = 'tableitem',
}
