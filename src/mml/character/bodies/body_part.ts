import { HitPoints } from "./hit_points";

export interface IBodyPart {
  readonly name: string;
  // readonly hit_positions: { [number: Integer.Unsigned], IHitPosition };
  readonly hp: HitPoints;
}
