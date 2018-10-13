import { Id, IObject, ObjectType } from "./roll20";

export interface IPlayer extends IObject {
  readonly type: ObjectType.Player;
  readonly _type: ObjectType.Player;
  readonly _d20userid: string;
  readonly d20userid: string;
  readonly _displayname: string;
  readonly displayname: string;
  readonly _online: boolean;
  readonly online: boolean;
  readonly _lastpage: Id;
  readonly lastpage: Id;
  readonly _macrobar: string; 
  readonly macrobar: string;
  speakingas: string;
  color: string;
  showmacrobar: boolean;
  get(property: PlayerProperties): string;
  set(property: PlayerProperties, value: any): void;
  setWithWorker(properties: {[property in PlayerProperties]}): void;
}

export enum PlayerProperties {
  D20UserId = '_d20userid',
  DisplayName = '_displayname',
  Online = '_online',
  LastPage = '_lastpage',
  MacroBar = '_macrobar',
  SpeakingAs = 'speakingas',
  Color = 'color',
  ShowMacroBar = 'showmacrobar',
}