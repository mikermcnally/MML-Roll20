import { IBodyPart } from "./body_parts";


export interface IBody {
  readonly body_parts: { [name: string]: IBodyPart };
  readonly multiple_wounds: HP;
}

export class Humanoid implements IBody {
  
}

export const RaceBodyTypes = {
  "Dwarf": Humanoid,
  "Gnome": Humanoid,
  "Gray Elf": Humanoid,
  "Human": Humanoid,
  "Hobbit": Humanoid,
  "Wood Elf": Humanoid,
};
