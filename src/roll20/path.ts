import * as Roll20 from "./roll20";
import { Integer, Float } from "../utilities/aliases";
import Point from "../utilities/coordinate";

export class Path implements Roll20.IObject, Roll20.IPath {
  readonly type = Roll20.ObjectType.Path;
  readonly _type: Roll20.ObjectType.Path; //	"path"	Can be used to identify the object type or search for the object. Read-only.
  readonly id: Roll20.Id;
  readonly _id: Roll20.Id; //	A unique ID for this object. Globally unique across all objects in this game. Read-only.
  readonly pageid: Roll20.Id;
  readonly _pageid: Roll20.Id; //	ID of the page the object is in. Read-only.
  readonly path: string;
  readonly _path: string; // A JSON string describing the lines in the path. Read-only, except when creating a new path. See Objects/Path for more information.
  fill: string; //	"transparent"	Fill color. Use the string "transparent" or a hex color as a string, for example "#000000"
  stroke: string; //	"#000000"	Stroke (border) color.
  rotation: number; //	0	Rotation (in degrees).
  layer: Roll20.Layers; //	""	Current layer, one of "gmlayer", "objects", "map", or "walls". The walls layer is used for dynamic lighting, and paths on the walls layer will block light.
  stroke_width: Integer.Positive; //	5	
  width: Integer.Positive; //	0	
  height: Integer.Positive; //	0	
  top: Point['top']; //	0	Y-coordinate for the center of the path
  left: Point['left']; //	0	X-coordinate for the center of the path
  scaleX: Float.Positive; //	1	
  scaleY: Float.Positive; //	1	
  controlledby: string; //	""	Comma-delimited list of player IDs who can control the path. Controlling players may delete the path. If the path was created by a player, that player is automatically included in the list.

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

export interface IPath {
  readonly _type?: Roll20.ObjectType.Path;
  readonly _id?: Roll20.Id;
  readonly _pageid?: Roll20.Id;
  readonly _path?: string;
  fill?: string;
  stroke?: string;
  rotation?: number;
  layer?: Roll20.Layers;
  stroke_width?: Integer.Positive;
  width?: Integer.Positive;
  height?: Integer.Positive;
  top?: Point['top'];
  left?: Point['left'];
  scaleX?: Float.Positive;
  scaleY?: Float.Positive;
  controlledby?: string;
}