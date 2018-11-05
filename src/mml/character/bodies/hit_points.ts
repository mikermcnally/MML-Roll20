import * as Rx from "rxjs";
import { Integer } from "../../../utilities/integer";
import { IPrimaryAttributes } from "../attributes/primary/primary_attributes";
import { IEventAlterHP } from "../../game_events/alter_hp";
import { ICreature } from "../creatures/creature";
import { map, switchMap, mergeScan } from "rxjs/operators";

export class HitPoints {
  readonly body_part: string;
  readonly max: Rx.Observable<Integer.Unsigned>;
  readonly current: Rx.Observable<Integer.Unsigned>;

  constructor(
    body_part: string, 
    alter_hp_events: Rx.Observable<IEventAlterHP>,
    hp_table: ICreature['hp_table'],
    primary_attributes: IPrimaryAttributes, 
    deriveMax: function(IPrimaryAttributes): Rx.Observable<Integer.Unsigned>,
  ) {
    this.body_part = body_part;
    this.max = deriveMax(primary_attributes).pipe(map(value => hp_table[value]));
    this.current = alter_hp_events.pipe(mergeScan(function (value, hp_change) {
      return;
      this.max.pipe(switchMap(function (max) {
      }));
    }))
  }
}





'Head': MML.HPTables[Rx.race][Math.round(health + stature / 3)],
'Chest': MML.HPTables[Rx.race][Math.round(health + stature + strength)],
'Abdomen': MML.HPTables[Rx.race][Math.round(health + stature)],
'Left Arm': MML.HPTables[Rx.race][Math.round(health + stature)],
'Right Arm': MML.HPTables[Rx.race][Math.round(health + stature)],
'Left Leg': MML.HPTables[Rx.race][Math.round(health + stature)],
'Right Leg': MML.HPTables[Rx.race][Math.round(health + stature)],
