import { IItem } from "./item";
import { Integer } from "../../utilities/integer";

export interface IShield extends IItem {
  attack_mod: Integer.Signed;
  defense_mod: Integer.Signed;
}

class RoundTargetShield implements IShield {
  name: "Round Target Shield";
  weight: 1.6;
  attackMod: 0;
  defenseMod: 10;
}

class SmallRoundShield implements IShield {
  name: "Small Round Shield";
  weight: 4.3;
  attackMod: 0;
  defenseMod: 20;
}

class MediumRoundShield implements IShield {
  name: "Medium Round Shield";
  weight: 11.3;
  attackMod: -10;
  defenseMod: 35;
}

class LargeRoundShield implements IShield {
  name: "Large Round Shield";
  weight: 16.4;
  attackMod: -16;
  defenseMod: 43;
}

class SmallRectangularShield implements IShield {
  name: "Small Rectangular Shield";
  weight: 4;
  attackMod: 0;
  defenseMod: 19;
}

class MediumRectangularShield implements IShield {
  name: "Medium Rectangular Shield";
  weight: 11.1;
  attackMod: -10;
  defenseMod: 35;
}

class LargeRectangularShield implements IShield {
  name: "Large Rectangular Shield";
  weight: 16.6;
  attackMod: -15;
  defenseMod: 39;
}

class HeaterShield implements IShield {
  name: "Heater Shield";
  weight: 10.6;
  attackMod: -10;
  defenseMod: 33;
}

export class ShieldFactory {
  static "Round Target Shield" = () => new RoundTargetShield();
  static "Small Round Shield" = () => new SmallRoundShield();
  static "Medium Round Shield" = () => new MediumRoundShield();
  static "Large Round Shield" = () => new LargeRoundShield();
  static "Small Rectangular Shield" = () => new SmallRectangularShield();
  static "Medium Rectangular Shield" = () => new MediumRectangularShield();
  static "Large Rectangular Shield" = () => new LargeRectangularShield();
  static "Heater Shield" = () => new HeaterShield();
}
