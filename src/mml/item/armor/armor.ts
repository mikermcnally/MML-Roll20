import * as Rx from 'rxjs';
import { IItem, IItemModifiers } from "../item";
import { IArmorStyle } from "./armor_styles";
import { IArmorMaterial } from "./armor_materials";
import { generateRowID } from "../../mml";
import { Id } from '../../../roll20/object';

export class Armor implements IItem {
  readonly id: Id;
  readonly name: Rx.Observable<string>;
  readonly style: IArmorStyle['name'];
  modifiers?: Array<IItemModifiers>;
  constructor(style: IArmorStyle, material: IArmorMaterial, modifiers?: Array<IItemModifiers>) {
    this.id = generateRowID();
    this.name = 
  }

  updateCharacterSheet() {

  }
}