import * as Roll20 from "./roll20";

export class Deck implements Roll20.IObject, Roll20.IDeck {
  readonly type = Roll20.ObjectType.Deck;
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

export interface IDeck {

}