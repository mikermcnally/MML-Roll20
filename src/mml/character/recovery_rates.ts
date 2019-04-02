import { Float } from "../../utilities/utilities";

export const HealthRecoveryRates: { [health: number]: Float.Positive } = {
  6: 0.33,
  7: 0.33,
  8: 0.5,
  9: 0.5,
  10: 1,
  11: 1,
  12: 1,
  13: 1.5,
  14: 1.5,
  15: 2,
  16: 2,
  17: 3,
  18: 3,
  19: 4,
  20: 4,
  21: 5,
  22: 5,
  23: 5,
  24: 5,
  25: 5,
}

export const EvocationRecoveryRates: { [health: number]: Float.Positive } = {
  6: 1,
  7: 1,
  8: 2,
  9: 2,
  10: 3,
  11: 3,
  12: 3,
  13: 4,
  14: 4,
  15: 5,
  16: 5,
  17: 6,
  18: 6,
  19: 8,
  20: 8,
  21: 10,
  22: 10,
  23: 10,
  24: 10,
  25: 10,
}