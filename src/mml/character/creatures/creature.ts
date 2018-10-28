import { IMovementRate } from "../movement_rate";
import { Float } from "../../../utilities/float";
import { Integer } from "../../../utilities/integer";
import Dwarf from "./humanoid/dwarf";
import Gnome from "./humanoid/gnome";
import WoodElf from "./humanoid/wood_elf";
import GrayElf from "./humanoid/gray_elf";
import Human from "./humanoid/human";
import Hobbit from "./humanoid/hobbit";
import { IBodyPart } from "../bodies/body_part";
import { HitPoints } from "../bodies/hit_points";
import { IHitTable } from "../bodies/hit_table";
import { Gender } from "../genders";
import { d20 } from "../../../utilities/dice";
import { IHitPosition } from "../bodies/hit_position";
import * as Rx from "rxjs";

export const CreatureList: { [name: string]: ICreature } = {
  'Dwarf': Dwarf,
  'Gnome': Gnome,
  'Gray Elf': GrayElf,
  'Human': Human,
  'Hobbit': Hobbit,
  'Wood Elf': WoodElf,
}

export enum CreatureSize {
  'Very Small',
  'Small',
  'Medium',
  'Large',
  'Very Large',
  'Huge',
  'Massive',
}

export interface ICreature {
  body_parts(): { [name: string]: IBodyPart };
  hit_positions(): { [number: number]: IHitPosition };
  multiple_wounds(): HitPoints;
  hit_table(): Rx.Observable<IHitTable>;
  size: CreatureSize;
  radius: Float.Positive;
  movement_rates: IMovementRate;
  hp_table: { [attribute_average: number]: Integer.Unsigned };
  stature_table: { [gender in Gender]: { [value in d20]: { height: string, weight: number, stature: number } } };
  sensitive_areas: HitPosition[];
}