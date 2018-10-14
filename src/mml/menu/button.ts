import { Routes } from "./routes";

export default class Button {
  readonly text: string;
  readonly route: Routes;
  private no_spaces: string;
  constructor(text, route) {
    this.text = text;
    this.no_spaces = text.replace(/\s+/g, '');
    this.route = route;
  }
  toString() {
    return '{{' + this.no_spaces + '=[' + this.text + '](!MML|' + this.route + ')}}';
  }
}