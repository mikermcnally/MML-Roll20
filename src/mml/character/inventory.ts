import * as Rx from "rxjs";
import { IItem } from "../item/item";

export class  Inventory {
  readonly items: Rx.Observable<IItem>;
}