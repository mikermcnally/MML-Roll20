import { IHitPoints, IHitPosition, IHitTable } from "../bodies";
import { Integer } from "../../../../utilities/integer";

export interface IBody {
  readonly name: string;
  readonly body_parts: { [name: string]: IBodyPart };
  readonly multiple_wounds: IHitPoints;
  readonly hit_table: IHitTable;
}

export interface IBodyPart {
  readonly name: string;
  readonly hit_positions: { [number: Integer.Unsigned], IHitPosition };
  readonly hp: IHitPoints;
}

export enum BodyTypes {
  Humanoid = 'Humanoid',
}

export * from "./humanoid"