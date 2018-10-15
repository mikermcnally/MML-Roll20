import { Id } from "../../roll20/object";
import { Float } from "../../utilities/float";

export interface Item {
  readonly id: Id;
  readonly weight: Float.Unsigned; 
}