import * as Roll20 from "./roll20";

export class Path implements Roll20.Object {
  readonly type = Roll20.ObjectType.Path;
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