import { Integer } from "./integer";

export interface IDice {
  amount: Integer.Unsigned;
  size: Integer.Unsigned;
}

export class D {
  static two(amount: Integer.Unsigned = 1) {
    return { amount, size: 2 } as IDice;
  }
  static three(amount: Integer.Unsigned = 1) {
    return { amount, size: 3 } as IDice;
  }
  static four(amount: Integer.Unsigned = 1) {
    return { amount, size: 4 } as IDice;
  }
  static six(amount: Integer.Unsigned = 1) {
    return { amount, size: 6 } as IDice;
  }
  static eight(amount: Integer.Unsigned = 1) {
    return { amount, size: 8 } as IDice;
  }
  static ten(amount: Integer.Unsigned = 1) {
    return { amount, size: 10 } as IDice;
  }
  static twelve(amount: Integer.Unsigned = 1) {
    return { amount, size: 12 } as IDice;
  }
  static twenty(amount: Integer.Unsigned = 1) {
    return { amount, size: 20 } as IDice;
  }
  static hundred(amount: Integer.Unsigned = 1) {
    return { amount, size: 100 } as IDice;
  }
}

export interface IRoll {
  modifiers: RollModifier[];
  value: Integer.Signed;
  dice: IDice[];
  description?: string;

  getResult(): number;
  displayResult(): void;
}

export class RollModifier {
  readonly value: Integer.Unsigned;
  readonly description: string;

  constructor(value: Integer.Unsigned, description?: string) {
    this.value = value;
    this.description = description ? description + ': ' + value.toString() : value.toString();
  }
}

export const RollStyle = {
  PhysicalDice: '',
  ThreeD: '3d',
}

MML.rollDice = function rollDice(amount: Integer.Unsigned, size: Integer.Unsigned) {
  switch (state.MML.rollStyle) {
    case 'physicalDice':
      break;
    case '3d':
      break;
    default:
      return Rx.range(amount).pipe(
        map(() => randomInteger(size)),
        reduce((sum, value) => sum + value, 0)
      );
  }
};

MML.parseDice = function parseDice(dice) {
  const diceArray = dice.split('d').map(num => parseInt(num));
  return {
    amount: diceArray[0],
    size: diceArray[1]
  };
};

MML.sumModifiers = function sumModifiers(modifiers) {
  return modifiers ? modifiers.reduce((sum, value) => sum + value, 0) : 0;
};