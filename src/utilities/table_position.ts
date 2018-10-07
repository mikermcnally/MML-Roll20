import { Integer } from "./aliases";

export default class TablePosition {
  top: Integer.Positive;
  left: Integer.Positive;
  constructor(top: Integer.Positive, left: Integer.Positive) {
    this.top = top;
    this.left = left;
  }
}