import * as Roll20 from "./roll20";

export interface IHand extends Roll20.IObject {
  readonly type?: Roll20.ObjectType.Hand;
  readonly _type?: Roll20.ObjectType.Hand;
  get(property: HandProperties): string;
  set(property: HandProperties, value: any): void;
  setWithWorker(properties: {[property in HandProperties]}): void;
}

export enum HandProperties {

}