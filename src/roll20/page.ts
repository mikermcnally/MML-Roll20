import * as Roll20 from "./roll20";

export interface IR20Page extends Roll20.IR20Object {
  readonly type?: Roll20.ObjectType.Page;
  readonly _type?: Roll20.ObjectType.Page;
  get(property: PageProperties): string;
  set(property: PageProperties, value: any): void;
  setWithWorker(properties: {[property in PageProperties]}): void;
}

export enum PageProperties {

}