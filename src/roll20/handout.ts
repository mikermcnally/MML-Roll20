import * as Roll20 from "./roll20";

export interface IHandout extends Roll20.IObject {
  readonly type?: Roll20.ObjectType.Handout;
  readonly _type?: Roll20.ObjectType.Handout;
  get(property: HandoutProperties): string;
  set(property: HandoutProperties, value: any): void;
  setWithWorker(properties: {[property in HandoutProperties]}): void;
}

export enum HandoutProperties {

}