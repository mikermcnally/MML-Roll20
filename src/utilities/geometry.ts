import { CampaignProperties, IR20Path, IR20Token, Layers, ObjectType, TokenProperties } from "../roll20/roll20";
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
  readonly feet: Float.Positive;

  constructor(point_a: Point, point_b: Point) {
    const left_distance = Math.abs(point_b.left - point_a.left);
    const top_distance = Math.abs(point_b.top - point_a.top);
    this.pixels = Math.sqrt(Math.pow(left_distance, 2) + Math.pow(top_distance, 2));
    this.feet = this.pixels / 14;
  }
}

export function getDistanceBetweenTokens(a: IR20Token, b: IR20Token) {
  const top_a = parseInt(a.get(TokenProperties.Top));
  const left_a = parseInt(a.get(TokenProperties.Left));
  const point_a = new Point(top_a, left_a);

  const top_b = parseInt(b.get(TokenProperties.Top));
  const left_b = parseInt(b.get(TokenProperties.Left));
  const point_b = new Point(top_b, left_b);

  return Point.getDistance(point_a, point_b);
}

export function drawCirclePath(left: Point['top'], top: Point['left'], radius: Distance) {
  const r = radius.pixels;
  const pathArray = [
    ['M', left - r, top],
    ['C', left - r, top - (r / 2), left - (r / 2), top - r, left, top - r],
    ['C', left + (r / 2), top - r, left + r, top - (r / 2), left + r, top],
    ['C', left + r, top + (r / 2), left + (r / 2), top + r, left, top + r],
    ['C', left - (r / 2), top + r, left - r, top + (r / 2), left - r, top]
  ];
  const path = createObj(ObjectType.Path, {
    _path: JSON.stringify(pathArray),
    _pageid: Campaign().get(CampaignProperties.Playerpageid),
    layer: Layers.Map,
    stroke: '#FFFF00',
    width: r * 2,
    height: r * 2,
    top: top,
    left: left,
  }) as IR20Path;
  toFront(path);
  return path;
}

export function rotateAxes(point: Point, angle: Float.Any) {
  const left_new = point.left * Math.cos(angle * Math.PI / 180) + point.top * Math.sin(angle * Math.PI / 180);
  const top_new = -point.left * Math.sin(angle * Math.PI / 180) + point.top * Math.cos(angle * Math.PI / 180);
  return new Point(left_new, top_new);
}