import * as Roll20 from "./roll20";

export class Attribute implements Roll20.IObject, Roll20.IAttribute {
  readonly id: Roll20.Id;
  readonly _id: Roll20.Id;
  readonly type: Roll20.ObjectType.Attribute;
  readonly _type: Roll20.ObjectType.Attribute;
  readonly _characterid: Roll20.ICharacter['id'];
  name: string;
  max: string;
  current: string;

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

export enum AttributeValueType {
  Max = 'max',
  Current = 'current'
}

export interface IAttribute {
  _characterid:	Roll20.ICharacter['id'];
  name:	string;
}