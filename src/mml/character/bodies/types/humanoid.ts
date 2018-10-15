import * as Rx from "rxjs";
import { IBody, IBodyPart, IHitTable, IHitPoints, IHitPosition } from "../bodies";

export class Humanoid implements IBody {
  readonly name: 'Humanoid';
  readonly body_parts: { [name: string]: IBodyPart };
  readonly multiple_wounds: IHitPoints;
  readonly hit_table: IHitTable;

  constructor() {
    this.body_parts = {
      'Left Arm': {
        readonly hp: Rx.Observable<Integer.Unsigned>,
        readonly hp_max: Rx.Observable<Integer.Unsigned>;
        readonly hit_positions: {
          13: { name: "Left Shoulder" },
          19: { name: "Left Upper Arm" },
          25: { name: "Left Elbow" },
          31: { name: "Left Forearm" },
          34: { name: "Left Hand/Wrist" },
        }
    }
  }
}
