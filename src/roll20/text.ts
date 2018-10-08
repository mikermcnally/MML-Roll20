import * as Roll20 from "./roll20";

export class Text implements Roll20.IObject, Roll20.IText {
  readonly type = Roll20.ObjectType.Text;
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

export interface IText {

}