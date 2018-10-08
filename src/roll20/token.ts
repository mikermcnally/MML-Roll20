import * as Roll20 from "./roll20";

export class Token extends Roll20.Graphic {
  readonly type = Roll20.ObjectType.Graphic;
  readonly id: Roll20.Id;

  get(property: string) {
    return this[property];
  }

  remove() {}

  set(property: string, value: any) {
    this[property] = value;
  }

  setWithWorker(properties: object) {
    Object.assign(this, properties);
  }
}

export interface IToken {

}