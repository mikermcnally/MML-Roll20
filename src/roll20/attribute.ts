import * as Roll20 from "./roll20";

export class Attribute implements Roll20.Object {
  readonly type = Roll20.ObjectType.Attribute;
  readonly id: Roll20.Id;
  private max: string;
  private current: string;

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

export enum AttributeValueType {
  Max = 'max',
  Current = 'current'
}
