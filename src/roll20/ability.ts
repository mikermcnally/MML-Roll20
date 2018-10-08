import * as Roll20 from "./roll20";

export class Ability implements Roll20.IObject, Roll20.IAbility {
  readonly type: Roll20.ObjectType.Ability;
  readonly id: Roll20.Id;

  get(property: string) {
    return this[property];
  }

  remove() { }

  set(property: string, value: any) {
    this[property] = value;
  }

  setWithWorker(properties: object) {
    Object.assign(this, properties);
  }
}

export interface IAbility {

}