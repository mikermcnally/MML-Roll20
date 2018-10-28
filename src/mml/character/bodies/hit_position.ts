import { IBodyPart } from "./body_part";
import { Integer } from "../../../utilities/integer";

export interface IHitPosition {
  name: string;
  body_part: IBodyPart;
  number: Integer.Unsigned;
}
