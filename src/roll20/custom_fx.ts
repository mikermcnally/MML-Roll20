import * as Roll20 from "./roll20";

export enum PointEffectName {
  Bomb = 'bomb',
  Bubbling = 'bubbling',
  Burn = 'burn',
  Burst = 'burst',
  Explode = 'explode',
  Glow = 'glow',
  Missile = 'missile',
  Nova = 'nova'
}

export enum LineEffectName {
  Beam = 'beam',
  Bomb = 'bomb',
  Breath = 'breath',
  Bubbling = 'bubbling',
  Burn = 'burn',
  Burst = 'burst',
  Explode = 'explode',
  Glow = 'glow',
  Missile = 'missile',
  Nova = 'nova',
  Splatter = 'splatter'
}

export enum EffectColor {
  Acid = 'acid',
  Blood = 'blood',
  Charm = 'charm',
  Death = 'death',
  Fire = 'fire',
  Frost = 'frost',
  Holy = 'holy',
  Magic = 'magic',
  Slime = 'slime',
  Smoke = 'smoke',
  Water = 'water'
}

export class PointEffectType {
  readonly type: string
  constructor(type: Roll20.PointEffectName, color: Roll20.EffectColor) {
    this.type = type + '-' + color;
  }
}

export class LineEffectType {
  readonly type: string
  constructor(type: Roll20.LineEffectName, color: Roll20.EffectColor) {
    this.type = type + '-' + color;
  }
}

export interface ICustomFX extends Roll20.IObject {
  _id?: Roll20.Id;
  _type?: Roll20.ObjectType.CustomFX;
  name?: string;
  definition?: Roll20.ICustomFXDefinition;
  get(property: CustomFXProperties): string;
  set(property: CustomFXProperties, value: any): void;
  setWithWorker(properties: {[property in CustomFXProperties]}): void;
}

export interface ICustomFXDefinition {
  angle?: number; //	This is the angle at which the particle are ejected from the spawn point (your cursor). The angle is measured in degrees starting with 0 pointing to the right, so 90 is straight down, 180 is to the left, 270 is straight up. If you enter -1 for this value the system will ask you to "aim" it every time you use it. This is useful when you want to fire an effect in a different direction each time you use it.
  duration?: number; //	This is how long the effect will last, even if the mouse is held down. This is mostly used with, and required for (if it's not set, or is -1 it will be defaulted to 25), aimed and for onDeath effects, since the mouse can't be held down, so they will last for the duration. The max duration in these instances is 50, which is just about 2 seconds. It can also be useful if you want the effect just to be a single burst of particles, like in the Bomb and Nova effects where the duration is just 10. If you set the duration to -1 the effect will last as long as you hold down the mouse button, otherwise the effect will stop after the duration has finished even if you hold down the button.
  emissionRate?: number; //	This is a measure of how quickly particles are created and fired from the origin. This attribute ties closely with the maxParticles attribute because if that limit is reached the system will stop creating particles, so make sure that you set the max hight enough to support your emission rate.
  gravity?: object; //	This attribute is the only one that has 2 "sub-attributes", x and y. It has these 2 options because you are able to have the "gravity" work in any direction. You cannot use the 0 value for either of these attributes, so use 0.01 for "no gravity". X and Y both accept positive and negative values, a positive Y would pull the particles down where as a negative value would pull the particles up and it works the same way with X and left and right.
  lifeSpan?: number; //	lifeSpan defines how long, in a measure of time, a particle will last before it disappears. This attribute, combined with speed, will decide how far the particle will fly before it is destroyed.
  maxParticles?: number; //	maxParticles defines the total number of particles, for that specific effect, that can be on the board at one time. Once this max is reached the particles will stop being generated until some of already existing particles reach the end of their "life".
  size?: number; //	size defines the relative size of the particles that are created.
  speed?: number; // speed defines the speed at which the particles will move away from the origin.
  startColour?: Array<number>; //	start/endColour defines the color of the particle when it is created and right before it is destroyed, respectively, using an array [Red, Green, Blue, Alpha]. The colors, RGB, use values between 0-255 and the Alpha channel is a decimal between 0-1. If you're looking for a specific color you can look up "hex color picker" in your favorite search engine and that should give you the numbers you're looking for. The colors will fade from the start value to the end value over the course of their life span. Since all of the particles are piled on top of each other to begin with the colors tend to be much lighter, turning into a ball of white, than you expect so you will want to use darker colors at least in the startColour block. There are a bunch of color examples at the end of this page, if you're looking for inspiration.
  endColour?: Array<number>;
  angleRandom?: number;
  durationRandom?: number;
  emissionRateRandom?: number;
  gravityRandom?: object;
  lifeSpanRandom?: number;
  maxParticlesRandom?: number;
  sizeRandom?: number;
  speedRandom?: number;	// Many of the effects have an option to randomize the value, using [effect]Random. The value given here will define the range in which the randomized values can fall within. The range is defined as the base +/- the random value. So if your starting point is 100, and the random is 20, then the range is between 80-120 where all values are equally possible. Example: You want to fire a 30 degree cone to the right from the origin. angle: 0, angleRandom: 15. This works the same way with the colors, only it has to be formatted in the same way the colors are [R, G, B, A], this way you can define the specific random range for each of the 3 colors. So if you wanted different shades of red you would use something like [30, 0, 0, 0].
  startColourRandom?: Array<number>;
  endColourRandom?: Array<number>;
  onDeath?: string; //This is the only value that accepts a string, so make sure if you use it to wrap the value in "quotes" or it won't let you save. This is used, like in the Burst effect, to spawn an additional effect as soon as the original one finishes. The Burst effect is basically just the Burn effect with "onDeath": "explosion", so the Burn effect lasts until you let go of the mouse, after which it will spawn the Explosion effect at the same location. This the effect that is spawned in the onDeath sequence cannot be an "aimed" effect and must have a duration. If it has a -1 for either of these it will either be given a default or not work as intended. This also only works for other Custom FX, if multiple FX have the same name you are referencing it will only select the first one on the list.
}

export enum CustomFXProperties {
  Name = 'name',
  Definition = 'definition',
}