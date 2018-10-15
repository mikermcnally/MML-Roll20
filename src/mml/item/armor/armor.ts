import * as Rx from 'rxjs';
import { IItem, IItemModifier } from "../item";
import { IArmorStyle } from "./armor_styles";
import { IArmorMaterial } from "./armor_materials";
import { generateRowID, Character } from "../../mml";
import { Id } from '../../../roll20/roll20';
import { Float, Integer } from '../../../utilities/utilities';

export interface APV extends IArmorMaterial {
  readonly hit_position: Integer.Unsigned;
  readonly coverage: Integer.Unsigned;
}

export class Armor implements IItem {
  readonly id: Id;
  readonly character_id: Rx.Observable<Character['id']>;
  readonly name: Rx.Observable<string>;
  readonly weight: Float.Positive;
  readonly style: IArmorStyle['name'];
  readonly material: IArmorMaterial['name'];
  readonly metallic: IArmorMaterial['metallic'];
  readonly protection: Rx.Observable<Array<APV>>;
  readonly modifiers?: Rx.Observable<Array<IItemModifier>>;

  constructor(style: IArmorStyle, material: IArmorMaterial, modifiers?: Array<IItemModifier>) {
    this.id = generateRowID();
    this.name = Rx.of(style.name + ' of ' + material.name);
    this.weight = style.total_positions * material.weight_per_position;
    this.style = style.name;
    this.material = material.name;
    this.metallic = material.metallic;
    this.protection = Rx.of(style.covered_positions.map(({ hit_position, coverage }) => {
      return {
        name: material.name,
        family: material.family,
        metallic: material.metallic,
        surface: material.surface,
        cut: material.cut,
        chop: material.chop,
        pierce: material.pierce,
        thrust: material.thrust,
        impact: material.impact,
        flanged: material.flanged,
        weight_per_position: material.weight_per_position,
        hit_position,
        coverage
      };
    }));
  }

  updateCharacterSheet() {

  }
}
