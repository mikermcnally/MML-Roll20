import * as Rx from "rxjs";
import { IAttribute } from "../attribute";
import { Integer } from "../../../../utilities/integer";

export class SystemStrength implements IAttribute {
  max: Rx.Observable<Integer.Unsigned>;
  current: Rx.Observable<Integer.Unsigned>;

  constructor() {

  }
}