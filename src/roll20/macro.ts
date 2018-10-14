import * as Roll20 from "./roll20";

export interface IR20Macro extends Roll20.IR20Object {
  readonly type?: Roll20.ObjectType.Macro;
  readonly _type?: Roll20.ObjectType.Macro;
  get(property: MacroProperties): string;
  set(property: MacroProperties, value: any): void;
  setWithWorker(properties: {[property in MacroProperties]}): void;
}

export enum MacroProperties {

}