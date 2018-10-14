import * as Rx from "rxjs";
import { Integer } from "../../../utilities/integer";
import { IHitPosition } from "./hit_position";

export interface IBodyPart {
  readonly name: string;
  readonly hit_positions: { [number: Integer.Unsigned], IHitPosition };
}

export class LeftArm {
  readonly hp: Rx.Observable<Integer.Unsigned>;
  readonly hp_max: Rx.Observable<Integer.Unsigned>;
  readonly hit_positions: { 
    13: { name: "Left Shoulder", number: 13 },
    19: { name: "Left Upper Arm", number: 19 },
    25: { name: "Left Elbow", number: 25 },
    31: { name: "Left Forearm", number: 31 },
    34: { name: "Left Hand/Wrist", number: 34 },  
  };

  constructor() {
    
  }
}

clas

export const BodyParts = {
  'Humanoid': {
    'Left Arm'
  } as Ib
}