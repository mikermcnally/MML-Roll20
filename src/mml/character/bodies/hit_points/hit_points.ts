import * as Rx from "rxjs";
import { Integer } from "../../../../utilities/integer";

export interface IHitPoints {
  current: Rx.Observable<Integer.Unsigned>;
  max: Rx.Observable<Integer.Unsigned>;
}