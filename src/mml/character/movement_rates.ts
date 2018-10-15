import { Race } from "./races";
import { Float } from "../../utilities/float";

export interface IMovementRate {
  prone: Float.Positive;
  crawl: Float.Positive;
  stalk: Float.Positive;
  walk: Float.Positive;
  jog: Float.Positive;
  run: Float.Positive;
}

export const MovementRates: { [race in Race]: IMovementRate } = {
  [Race.Dwarf]: {
    prone: 0,
    crawl: 1.75,
    stalk: 1.75,
    walk: 6,
    jog: 14,
    run: 34
  },
  [Race.Gnome]: {
    prone: 0,
    crawl: 1.75,
    stalk: 1.75,
    walk: 6,
    jog: 14,
    run: 32
  },
  [Race.GrayElf]: {
    prone: 0,
    crawl: 2,
    stalk: 2,
    walk: 8,
    jog: 20,
    run: 36
  },
  [Race.Hobbit]: {
    prone: 0,
    crawl: 2,
    stalk: 2,
    walk: 5,
    jog: 8,
    run: 18
  },
  [Race.Human]: {
    prone: 0,
    crawl: 1.75,
    stalk: 1.75,
    walk: 6,
    jog: 16,
    run: 28
  },
  [Race.WoodElf]: {
    prone: 0,
    crawl: 2,
    stalk: 2,
    walk: 8,
    jog: 20,
    run: 34
  },
}