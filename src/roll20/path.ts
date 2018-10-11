import * as Roll20 from "./roll20";
import { Integer, Float } from "../utilities/aliases";
import Point from "../utilities/coordinate";

export interface IPath extends Roll20.IObject {
  readonly type?: Roll20.ObjectType.Path;
  readonly _type?: Roll20.ObjectType.Path;
  readonly _pageid?: Roll20.Id;
  readonly _path?: string;
  fill?: string;
  stroke?: string;
  rotation?: number;
  layer?: Roll20.Layers;
  stroke_width?: Integer.Unsigned;
  width?: Integer.Unsigned;
  height?: Integer.Unsigned;
  top?: Point['top'];
  left?: Point['left'];
  scaleX?: Float.Unsigned;
  scaleY?: Float.Unsigned;
  controlledby?: string;
  get(property: PathProperties): string;
  set(property: PathProperties, value: any): void;
  setWithWorker(properties: {[property in PathProperties]}): void;
}

export enum PathProperties {

}