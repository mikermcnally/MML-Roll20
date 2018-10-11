import { Float, Integer } from "./aliases";

export default class Point {
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
    this.feet = this.pixels/14 as Float.Unsigned;
  }
}