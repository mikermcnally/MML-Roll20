import * as Roll20 from "./roll20";

export interface IPlayer extends Roll20.IObject {
  readonly type: Roll20.ObjectType.Player;
  readonly _type: Roll20.ObjectType.Player;
  get(property: PlayerProperties): string;
  set(property: PlayerProperties, value: any): void;
  setWithWorker(properties: {[property in PlayerProperties]}): void;
}

export enum PlayerProperties {

}