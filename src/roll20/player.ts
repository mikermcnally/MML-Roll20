import * as Roll20 from "./roll20";

export class Player implements Roll20.Object {
  readonly type = Roll20.ObjectType.Player;
  readonly id: Roll20.Id;

  get(property: string) {
    return this[property];
  }

  set(property: string, value: any) {
    this[property] = value;
  }

  setWithWorker(properties: object) {
    Object.assign(this, properties);
  }
}