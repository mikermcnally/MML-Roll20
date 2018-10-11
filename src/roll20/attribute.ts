import * as Roll20 from "./roll20";

export interface IAttribute extends Roll20.IObject {
  readonly type: Roll20.ObjectType.Attribute;
  readonly _type: Roll20.ObjectType.Attribute;
  readonly _characterid: Roll20.Id;
  name: string;
  max?: string;
  current?: string;
  get(property: AttributeProperties): string;
  set(property: AttributeProperties, value: any): void;
  setWithWorker(properties: {[property in AttributeProperties]}): void;
}

export enum AttributeProperties {
  CharacterId = 'characterid',
  Name = 'name',
  Max = 'max',
  Current = 'current',
}