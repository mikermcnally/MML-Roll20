import * as Roll20 from "./roll20";

export interface Object {
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
  Graphic = 'graphic',
  Handout = 'handout',
  Macro = 'macro',
  Path = 'path',
  Player = 'player',
  Rollabletable = 'rollabletable',
  Tableitem = 'tableitem',
  Text = 'text',
}