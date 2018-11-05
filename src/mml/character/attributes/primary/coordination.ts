import * as Rx from "rxjs";
import { IAttribute } from "../attribute";
import { Integer } from "../../../../utilities/integer";

export class Coordination implements IAttribute {
  max: Rx.Observable<Integer.Unsigned>;
  current: Rx.Observable<Integer.Unsigned>;

  constructor() {

  }
}