import * as Roll20 from "./roll20";

export interface IText extends Roll20.IObject {
  readonly type?: Roll20.ObjectType.Text;
  readonly _type?: Roll20.ObjectType.Text;
  get(property: TextProperties): string;
  set(property: TextProperties, value: any): void;
  setWithWorker(properties: {[property in TextProperties]}): void;
}

export enum TextProperties {

}