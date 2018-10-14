import * as Roll20 from "./roll20";

export interface IR20RollableTable extends Roll20.IR20Object {
  readonly type?: Roll20.ObjectType.RollableTable;
  readonly _type?: Roll20.ObjectType.RollableTable;
  get(property: RollableTableProperties): string;
  set(property: RollableTableProperties, value: any): void;
  setWithWorker(properties: {[property in RollableTableProperties]}): void;
}

export enum RollableTableProperties {

}