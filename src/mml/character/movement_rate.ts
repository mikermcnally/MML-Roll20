import { Float } from "../../utilities/float";

export interface IMovementRate {
  prone: Float.Positive;
  crawl: Float.Positive;
  stalk: Float.Positive;
  walk: Float.Positive;
  jog: Float.Positive;
  run: Float.Positive;
}
