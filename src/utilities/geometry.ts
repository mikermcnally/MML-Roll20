import { CampaignProperties, IPath, IToken, Layers, ObjectType, TokenProperties } from "../roll20/roll20";
import { Integer } from "./integer";
import { Float } from "./float";

export class Point {
  top: Integer.Unsigned;
  left: Integer.Unsigned;
  constructor(top: Integer.Unsigned, left: Integer.Unsigned) {
    this.top = top;
    this.left = left;
  }

  static getDistance(point_a: Point, point_b: Point): Distance {
    return new Distance(point_a, point_b);
  }
}

export class Distance {
  readonly pixels: Integer.Unsigned;
  readonly feet: Float.Unsigned;

  constructor(point_a: Point, point_b: Point) {
    const left_distance = Math.abs(point_b.left - point_a.left);
    const top_distance = Math.abs(point_b.top - point_a.top);
    this.pixels = Math.sqrt(Math.pow(left_distance, 2) + Math.pow(top_distance, 2)) as Integer.Unsigned;
    this.feet = this.pixels / 14 as Float.Unsigned;
  }
}

export function getDistanceBetweenTokens(a: IToken, b: IToken) {
  const top_a = parseInt(a.get(TokenProperties.Top)) as Integer.Signed;
  const left_a = parseInt(a.get(TokenProperties.Left)) as Integer.Signed;
  const point_a = new Point(top_a, left_a);

  const top_b = parseInt(b.get(TokenProperties.Top)) as Integer.Signed;
  const left_b = parseInt(b.get(TokenProperties.Left)) as Integer.Signed;
  const point_b = new Point(top_b, left_b);

  return Point.getDistance(point_a, point_b);
}

export function drawCirclePath(left: Point['top'], top: Point['left'], radiusInFeet: Distance) {
  const radius = radiusInFeet.pixels;
  const pathArray = [
    ['M', left - radius, top],
    ['C', left - radius, top - (radius / 2), left - (radius / 2), top - radius, left, top - radius],
    ['C', left + (radius / 2), top - radius, left + radius, top - (radius / 2), left + radius, top],
    ['C', left + radius, top + (radius / 2), left + (radius / 2), top + radius, left, top + radius],
    ['C', left - (radius / 2), top + radius, left - radius, top + (radius / 2), left - radius, top]
  ];
  const path = createObj(ObjectType.Path, {
    _path: JSON.stringify(pathArray),
    _pageid: Campaign().get(CampaignProperties.Playerpageid),
    layer: Layers.Map,
    stroke: '#FFFF00',
    width: radius * 2 as Integer.Unsigned,
    height: radius * 2 as Integer.Unsigned,
    top: top,
    left: left,
  }) as IPath;
  toFront(path);
  return path;
}

export function rotateAxes(point: Point, angle: Float.Unsigned) {
  const left_new = point.left * Math.cos(angle * Math.PI / 180) + point.top * Math.sin(angle * Math.PI / 180) as Integer.Unsigned;
  const top_new = -point.left * Math.sin(angle * Math.PI / 180) + point.top * Math.cos(angle * Math.PI / 180) as Integer.Unsigned;
  return new Point(left_new, top_new);
}