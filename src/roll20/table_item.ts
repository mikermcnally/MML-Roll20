import * as Roll20 from "./roll20";

export interface ITableItem extends Roll20.IR20Object {
  readonly type?: Roll20.ObjectType.TableItem;
  readonly _type?: Roll20.ObjectType.TableItem;
  get(property: TableItemProperties): string;
  set(property: TableItemProperties, value: any): void;
  setWithWorker(properties: {[property in TableItemProperties]}): void;
}

export enum TableItemProperties {

}