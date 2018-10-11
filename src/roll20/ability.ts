import * as Roll20 from "./roll20";

export interface IAbility extends Roll20.IObject {
  readonly type?: Roll20.ObjectType.Ability;
  readonly _type?: Roll20.ObjectType.Ability;
  get(property: AbilityProperties): string;
  set(property: AbilityProperties, value: any): void;
  setWithWorker(properties: {[property in AbilityProperties]}): void;
}

export enum AbilityProperties {

}