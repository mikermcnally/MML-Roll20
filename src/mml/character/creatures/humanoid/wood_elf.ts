import Humanoid from "./humanoid";
import { ICreature, CreatureSize } from "../creature";
import { Gender } from "../../genders";

export default class WoodElf extends Humanoid implements ICreature {
  readonly radius: 1;
  readonly size: CreatureSize.Medium;
  readonly movement_rates: {
    prone: 0,
    crawl: 2,
    stalk: 2,
    walk: 8,
    jog: 20,
    run: 34
  };

  readonly hp_table: {
    13: 7,
    14: 7,
    15: 8,
    16: 8,
    17: 9,
    18: 9,
    19: 10,
    20: 11,
    21: 11,
    22: 12,
    23: 12,
    24: 13,
    25: 13,
    26: 13,
    27: 14,
    28: 15,
    29: 15,
    30: 16,
    31: 16,
    32: 17,
    33: 17,
    34: 18,
    35: 18,
    36: 19,
    37: 19,
    38: 20,
    39: 20,
    40: 21,
    41: 22,
    42: 22,
    43: 23,
    44: 23,
    45: 24,
    46: 24,
    47: 25,
    48: 25,
    49: 26,
    50: 26,
    51: 27,
    52: 27,
    53: 28,
    54: 28,
    55: 29,
    56: 29,
    57: 30,
    58: 30,
    59: 31,
    60: 32,
    61: 32,
    62: 33,
    63: 33,
    64: 34,
    65: 34,
    66: 35,
    67: 35,
    68: 36,
    69: 36,
  };

  readonly stature_table: {
    [Gender.Male]: {
      1: { height: "5'4", weight: 125, stature: 20 },
      2: { height: "5'4", weight: 125, stature: 20 },
      3: { height: "5'5", weight: 128, stature: 20 },
      4: { height: "5'5", weight: 128, stature: 20 },
      5: { height: "5'6", weight: 130, stature: 20 },
      6: { height: "5'6", weight: 130, stature: 20 },
      7: { height: "5'7", weight: 135, stature: 21 },
      8: { height: "5'8", weight: 140, stature: 21 },
      9: { height: "5'9", weight: 145, stature: 22 },
      10: { height: "5'10", weight: 150, stature: 22 },
      11: { height: "5'11", weight: 155, stature: 23 },
      12: { height: "6'0", weight: 160, stature: 23 },
      13: { height: "6'1", weight: 165, stature: 24 },
      14: { height: "6'2", weight: 170, stature: 24 },
      15: { height: "6'3", weight: 175, stature: 26 },
      16: { height: "6'4", weight: 180, stature: 26 },
      17: { height: "6'5", weight: 190, stature: 27 },
      18: { height: "6'5", weight: 190, stature: 27 },
      19: { height: "6'6", weight: 200, stature: 28 },
      20: { height: "6'6", weight: 200, stature: 28 },
    },
    [Gender.Female]: {
      1: { height: "5'1", weight: 110, stature: 16 },
      2: { height: "5'1", weight: 110, stature: 16 },
      3: { height: "5'2", weight: 113, stature: 17 },
      4: { height: "5'2", weight: 113, stature: 17 },
      5: { height: "5'3", weight: 115, stature: 17 },
      6: { height: "5'3", weight: 115, stature: 17 },
      7: { height: "5'4", weight: 118, stature: 18 },
      8: { height: "5'5", weight: 120, stature: 18 },
      9: { height: "5'6", weight: 123, stature: 19 },
      10: { height: "5'7", weight: 125, stature: 19 },
      11: { height: "5'8", weight: 128, stature: 20 },
      12: { height: "5'9", weight: 130, stature: 20 },
      13: { height: "5'10", weight: 133, stature: 21 },
      14: { height: "5'11", weight: 135, stature: 21 },
      15: { height: "6'0", weight: 140, stature: 22 },
      16: { height: "6'1", weight: 145, stature: 22 },
      17: { height: "6'2", weight: 150, stature: 23 },
      18: { height: "6'2", weight: 150, stature: 23 },
      19: { height: "6'3", weight: 155, stature: 23 },
      20: { height: "6'3", weight: 155, stature: 23 },
    }
  };
}