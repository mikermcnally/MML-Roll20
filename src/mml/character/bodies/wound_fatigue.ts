import * as Rx from "rxjs";
import { HitPoints, PrimaryAttributes } from "./hit_points";
import { Integer } from "../../../utilities/integer";
import { IAttribute } from "../attributes/attribute";
import { map, switchMap, mergeMap, reduce, exhaustMap } from "rxjs/operators";
import { SystemStrength } from "../attributes/secondary/system_strength";

export function foundFatigueCheck({ max, current }: WoundFatigue, system_strength: SystemStrength) {
  return Rx.combineLatest(max, current).pipe(exhaustMap(function ([max, current]) {
    if (current < 0) {
      await MML.displayMenu(player, character.name + '\'s Wound Fatigue Roll', ['Roll']);
      const result = await MML.attributeCheckRoll(player, system_strength);
      if (result === 'Failure') {
        MML.addStatusEffect(character, 'Wound Fatigue', {});
      }
    }
    return Rx.empty();
  }));
}

export class WoundFatigue implements IAttribute {
  max: Rx.Observable<Integer.Unsigned>;
  current: Rx.Observable<Integer.Unsigned>;

  constructor({ health, stature, willpower }: PrimaryAttributes, hit_points: HitPoints[]) {
    this.max = Rx.combineLatest(health.max, stature.max, willpower.max).pipe(
      map(([health_max, stature_max, willpower_max]) => Math.round((health_max + stature_max + willpower_max) / 2))
    );

    this.current = this.max.pipe(switchMap(function (wound_fatigue_max) {
      return Rx.from(hit_points).pipe(
        mergeMap(({ max, current }) => Rx.combineLatest(max, current)),
        map(([max, current]) => current < Math.round(max / 2) ? Math.round(-0.5 * max) : current - max),
        reduce((remaining_wound_fatigue, minor_wounds) => remaining_wound_fatigue + minor_wounds, wound_fatigue_max)
      );
    }));
  }
}