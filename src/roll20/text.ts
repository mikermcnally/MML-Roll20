import { IR20Object, ObjectType } from "./roll20";

export interface IR20Text extends IR20Object {
  readonly type?: ObjectType.Text;
  readonly _type?: ObjectType.Text;
  get(property: TextProperties): string;
  set(property: TextProperties, value: any): void;
  setWithWorker(properties: {[property in TextProperties]}): void;
}

export enum TextProperties {

}