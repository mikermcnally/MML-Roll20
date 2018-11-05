import { Stature } from "./stature";
import { Strength } from "./strength";
import { Coordination } from "./coordination";
import { Health } from "./health";
import { Beauty } from "./beauty";
import { Intellect } from "./intellect";
import { Reason } from "./reason";
import { Creativity } from "./creativity";
import { Presence } from "./presence";

export interface IPrimaryAttributes {
  stature: Stature;
  strength: Strength;
  coordination: Coordination;
  health: Health;
  beauty: Beauty;
  intellect: Intellect;
  reason: Reason;
  creativity: Creativity;
  presence: Presence;
}