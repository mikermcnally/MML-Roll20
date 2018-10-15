import { IBody, Humanoid } from "./bodies/bodies";

export enum Race {
  Dwarf = "Dwarf",
  Gnome = "Gnome",
  GrayElf = "Gray Elf",
  Human = "Human",
  Hobbit = "Hobbit",
  WoodElf = "Wood Elf",
}

export const RaceBodyTypes: { [name in Race]: IBody } = {
  [Race.Dwarf]: Humanoid,
  [Race.Gnome]: Humanoid,
  [Race.GrayElf]: Humanoid,
  [Race.Human]: Humanoid,
  [Race.Hobbit]: Humanoid,
  [Race.WoodElf]: Humanoid,
};