import * as Rx from "rxjs";
import { Integer } from "../../../utilities/integer";

export class HitPoints {
  readonly max: Rx.Observable<Integer.Unsigned>;
  readonly current: Rx.Observable<Integer.Unsigned>;

  constructor(max: Rx.Observable<Integer.Unsigned>, current: Rx.Observable<Integer.Unsigned>) {
    this.max = max;
    this.current = current;
  }
}