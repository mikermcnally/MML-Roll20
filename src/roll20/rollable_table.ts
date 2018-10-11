import * as Roll20 from "./roll20";

export interface IRollableTable extends Roll20.IObject {
  readonly type?: Roll20.ObjectType.RollableTable;
  readonly _type?: Roll20.ObjectType.RollableTable;
  get(property: RollableTableProperties): string;
  set(property: RollableTableProperties, value: any): void;
  setWithWorker(properties: {[property in RollableTableProperties]}): void;
}

export enum RollableTableProperties {

}