import * as Roll20 from "./roll20";

export class Handout implements Roll20.IObject, Roll20.IHandout {
  readonly type = Roll20.ObjectType.Handout;
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

export interface IHandout {

}