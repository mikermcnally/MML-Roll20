import * as Roll20 from "./roll20";

export class Hand implements Roll20.IObject, Roll20.IHand {
  readonly type = Roll20.ObjectType.Hand;
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

export interface IHand {

}