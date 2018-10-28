import { Integer } from "../../../utilities/integer";

export interface IHitTable {
  [roll_value: number]: Integer.Unsigned;
}
