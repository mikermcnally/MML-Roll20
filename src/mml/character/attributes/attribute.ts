import * as Rx from "rxjs";

export interface IAttribute {
  readonly max: Rx.Observable<any>; 
  readonly current: Rx.Observable<any>;
  [key: string]: any;
}