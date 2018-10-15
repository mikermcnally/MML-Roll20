import { Integer } from "../../../utilities/integer";
import { Float } from "../../../utilities/float";

export interface IArmorStyle {
  readonly name: string;
  readonly covered_positions: Array<{ hit_position: Integer.Unsigned, coverage: Integer.Unsigned }>;
  readonly total_positions: Float.Positive;
}

export const ArmorStyles: { [name: string]: IArmorStyle } = {
  'Barbute Helm': {
    name: 'Barbute Helm',
    covered_positions: [{
      hit_position: 1,
      coverage: 100
    }, {
      hit_position: 2,
      coverage: 85
    }, {
      hit_position: 3,
      coverage: 100
    }, {
      hit_position: 5,
      coverage: 100
    }, {
      hit_position: 4,
      coverage: 100
    }],
    total_positions: 4.85
  },
  'Bascinet Helm': {
    name: 'Bascinet Helm',
    covered_positions: [{
      hit_position: 1,
      coverage: 100
    }, {
      hit_position: 3,
      coverage: 100
    }, {
      hit_position: 4,
      coverage: 100
    }, {
      hit_position: 5,
      coverage: 100
    }],
    total_positions: 4
  },
  'Camail': {
    name: 'Camail',
    covered_positions: [{
      hit_position: 6,
      coverage: 100
    }, {
      hit_position: 7,
      coverage: 100
    }],
    total_positions: 2
  },
  'Camail-Conical': {
    name: 'Camail-Conical',
    covered_positions: [{
      hit_position: 3,
      coverage: 100
    }, {
      hit_position: 4,
      coverage: 100
    }, {
      hit_position: 5,
      coverage: 100
    }],
    total_positions: 3
  },
  'Cap': {
    name: 'Cap',
    covered_positions: [{
      hit_position: 1,
      coverage: 100
    }, {
      hit_position: 3,
      coverage: 100
    }, {
      hit_position: 4,
      coverage: 100
    }, {
      hit_position: 5,
      coverage: 100
    }],
    total_positions: 4
  },
  'Cheeks': {
    name: 'Cheeks',
    covered_positions: [{
      hit_position: 2,
      coverage: 40
    }, {
      hit_position: 4,
      coverage: 100
    }, {
      hit_position: 5,
      coverage: 100
    }],
    total_positions: 2.4
  },
  'Collar': {
    name: 'Collar',
    covered_positions: [{
      hit_position: 6,
      coverage: 100
    }, {
      hit_position: 7,
      coverage: 100
    }],
    total_positions: 2
  },
  'Conical Helm': {
    name: 'Conical Helm',
    covered_positions: [{
      hit_position: 1,
      coverage: 100
    }],
    total_positions: 1
  },
  'Duerne Helm': {
    name: 'Duerne Helm',
    covered_positions: [{
      hit_position: 1,
      coverage: 100
    }, {
      hit_position: 3,
      coverage: 100
    }, {
      hit_position: 4,
      coverage: 100
    }, {
      hit_position: 5,
      coverage: 100
    }],
    total_positions: 4
  },
  'Dwarven War Hood': {
    name: 'Dwarven War Hood',
    covered_positions: [{
      hit_position: 1,
      coverage: 100
    }, {
      hit_position: 2,
      coverage: 100
    }, {
      hit_position: 3,
      coverage: 100
    }, {
      hit_position: 4,
      coverage: 100
    }, {
      hit_position: 5,
      coverage: 100
    }, {
      hit_position: 6,
      coverage: 100
    }, {
      hit_position: 7,
      coverage: 100
    }],
    total_positions: 7
  },
  'Face Plate': {
    name: 'Face Plate',
    covered_positions: [{
      hit_position: 2,
      coverage: 100
    }],
    total_positions: 1
  },
  'Great Helm': {
    name: 'Great Helm',
    covered_positions: [{
      hit_position: 1,
      coverage: 100
    }, {
      hit_position: 2,
      coverage: 100
    }, {
      hit_position: 3,
      coverage: 100
    }, {
      hit_position: 4,
      coverage: 100
    }, {
      hit_position: 5,
      coverage: 100
    }],
    total_positions: 5
  },
  'Half-Face Plate': {
    name: 'Half-Face Plate',
    covered_positions: [{
      hit_position: 2,
      coverage: 40
    }],
    total_positions: 0.4
  },
  'Hood': {
    name: 'Hood',
    covered_positions: [{
      hit_position: 1,
      coverage: 100
    }, {
      hit_position: 3,
      coverage: 100
    }, {
      hit_position: 4,
      coverage: 100
    }, {
      hit_position: 5,
      coverage: 100
    }, {
      hit_position: 6,
      coverage: 100
    }, {
      hit_position: 7,
      coverage: 100
    }],
    total_positions: 6
  },
  'Nose Guard': {
    name: 'Nose Guard',
    covered_positions: [{
      hit_position: 2,
      coverage: 25
    }],
    total_positions: 0.25
  },
  'Pot Helm': {
    name: 'Pot Helm',
    covered_positions: [{
      hit_position: 1,
      coverage: 100
    }],
    total_positions: 1
  },
  'Sallet Helm': {
    name: 'Sallet Helm',
    covered_positions: [{
      hit_position: 1,
      coverage: 100
    }, {
      hit_position: 2,
      coverage: 70
    }, {
      hit_position: 3,
      coverage: 100
    }, {
      hit_position: 4,
      coverage: 100
    }, {
      hit_position: 5,
      coverage: 100
    }, {
      hit_position: 7,
      coverage: 100
    }],
    total_positions: 5.7
  },
  'Throat Guard': {
    name: 'Throat Guard',
    covered_positions: [{
      hit_position: 2,
      coverage: 30
    }, {
      hit_position: 6,
      coverage: 100
    }],
    total_positions: 1.3
  },
  'War Hat': {
    name: 'War Hat',
    covered_positions: [{
      hit_position: 1,
      coverage: 100
    }, {
      hit_position: 2,
      coverage: 25
    }, {
      hit_position: 3,
      coverage: 25
    }, {
      hit_position: 4,
      coverage: 25
    }, {
      hit_position: 5,
      coverage: 25
    }],
    total_positions: 2
  },
  'Breast Plate': {
    name: 'Breast Plate',
    covered_positions: [{
      hit_position: 9,
      coverage: 100
    }, {
      hit_position: 10,
      coverage: 100
    }, {
      hit_position: 11,
      coverage: 100
    }, {
      hit_position: 12,
      coverage: 100
    }, {
      hit_position: 15,
      coverage: 100
    }, {
      hit_position: 16,
      coverage: 100
    }, {
      hit_position: 17,
      coverage: 100
    }, {
      hit_position: 18,
      coverage: 100
    }, {
      hit_position: 21,
      coverage: 100
    }, {
      hit_position: 22,
      coverage: 100
    }, {
      hit_position: 23,
      coverage: 100
    }, {
      hit_position: 24,
      coverage: 100
    }],
    total_positions: 12
  },
  'Byrnie': {
    name: 'Byrnie',
    covered_positions: [{
      hit_position: 8,
      coverage: 100
    }, {
      hit_position: 9,
      coverage: 100
    }, {
      hit_position: 10,
      coverage: 100
    }, {
      hit_position: 11,
      coverage: 100
    }, {
      hit_position: 12,
      coverage: 100
    }, {
      hit_position: 13,
      coverage: 100
    }, {
      hit_position: 14,
      coverage: 100
    }, {
      hit_position: 15,
      coverage: 100
    }, {
      hit_position: 16,
      coverage: 100
    }, {
      hit_position: 17,
      coverage: 100
    }, {
      hit_position: 18,
      coverage: 100
    }, {
      hit_position: 19,
      coverage: 100
    }, {
      hit_position: 21,
      coverage: 100
    }, {
      hit_position: 22,
      coverage: 100
    }, {
      hit_position: 23,
      coverage: 100
    }, {
      hit_position: 24,
      coverage: 100
    }, {
      hit_position: 27,
      coverage: 100
    }, {
      hit_position: 28,
      coverage: 100
    }, {
      hit_position: 29,
      coverage: 100
    }, {
      hit_position: 30,
      coverage: 100
    }, {
      hit_position: 33,
      coverage: 50
    }],
    total_positions: 20.5
  },
  'Hauberk': {
    name: 'Hauberk',
    covered_positions: [{
      hit_position: 8,
      coverage: 100
    }, {
      hit_position: 9,
      coverage: 100
    }, {
      hit_position: 10,
      coverage: 100
    }, {
      hit_position: 11,
      coverage: 100
    }, {
      hit_position: 12,
      coverage: 100
    }, {
      hit_position: 13,
      coverage: 100
    }, {
      hit_position: 14,
      coverage: 100
    }, {
      hit_position: 15,
      coverage: 100
    }, {
      hit_position: 16,
      coverage: 100
    }, {
      hit_position: 17,
      coverage: 100
    }, {
      hit_position: 18,
      coverage: 100
    }, {
      hit_position: 19,
      coverage: 100
    }, {
      hit_position: 20,
      coverage: 100
    }, {
      hit_position: 21,
      coverage: 100
    }, {
      hit_position: 22,
      coverage: 100
    }, {
      hit_position: 23,
      coverage: 100
    }, {
      hit_position: 24,
      coverage: 100
    }, {
      hit_position: 25,
      coverage: 100
    }, {
      hit_position: 26,
      coverage: 100
    }, {
      hit_position: 27,
      coverage: 100
    }, {
      hit_position: 28,
      coverage: 100
    }, {
      hit_position: 29,
      coverage: 100
    }, {
      hit_position: 30,
      coverage: 100
    }, {
      hit_position: 31,
      coverage: 100
    }, {
      hit_position: 33,
      coverage: 100
    }, {
      hit_position: 35,
      coverage: 100
    }, {
      hit_position: 36,
      coverage: 100
    }, {
      hit_position: 37,
      coverage: 100
    }, {
      hit_position: 38,
      coverage: 100
    }],
    total_positions: 29
  },
  'Shirt': {
    name: 'Shirt',
    covered_positions: [{
      hit_position: 8,
      coverage: 100
    }, {
      hit_position: 9,
      coverage: 100
    }, {
      hit_position: 10,
      coverage: 100
    }, {
      hit_position: 11,
      coverage: 100
    }, {
      hit_position: 12,
      coverage: 100
    }, {
      hit_position: 13,
      coverage: 100
    }, {
      hit_position: 15,
      coverage: 100
    }, {
      hit_position: 16,
      coverage: 100
    }, {
      hit_position: 17,
      coverage: 100
    }, {
      hit_position: 18,
      coverage: 100
    }, {
      hit_position: 21,
      coverage: 100
    }, {
      hit_position: 22,
      coverage: 100
    }, {
      hit_position: 23,
      coverage: 100
    }, {
      hit_position: 24,
      coverage: 100
    }],
    total_positions: 14
  },
  'Shirt with Arms': {
    name: 'Shirt with Arms',
    covered_positions: [{
      hit_position: 8,
      coverage: 100
    }, {
      hit_position: 9,
      coverage: 100
    }, {
      hit_position: 10,
      coverage: 100
    }, {
      hit_position: 11,
      coverage: 100
    }, {
      hit_position: 12,
      coverage: 100
    }, {
      hit_position: 13,
      coverage: 100
    }, {
      hit_position: 14,
      coverage: 100
    }, {
      hit_position: 15,
      coverage: 100
    }, {
      hit_position: 16,
      coverage: 100
    }, {
      hit_position: 17,
      coverage: 100
    }, {
      hit_position: 18,
      coverage: 100
    }, {
      hit_position: 19,
      coverage: 100
    }, {
      hit_position: 20,
      coverage: 100
    }, {
      hit_position: 21,
      coverage: 100
    }, {
      hit_position: 22,
      coverage: 100
    }, {
      hit_position: 23,
      coverage: 100
    }, {
      hit_position: 24,
      coverage: 100
    }, {
      hit_position: 25,
      coverage: 100
    }, {
      hit_position: 26,
      coverage: 100
    }, {
      hit_position: 31,
      coverage: 100
    }],
    total_positions: 20
  },
  'Breech': {
    name: 'Breech',
    covered_positions: [{
      hit_position: 33,
      coverage: 100
    }],
    total_positions: 1
  },
  'Pants': {
    name: 'Pants',
    covered_positions: [{
      hit_position: 27,
      coverage: 100
    }, {
      hit_position: 28,
      coverage: 100
    }, {
      hit_position: 29,
      coverage: 100
    }, {
      hit_position: 30,
      coverage: 100
    }, {
      hit_position: 33,
      coverage: 100
    }, {
      hit_position: 35,
      coverage: 100
    }, {
      hit_position: 36,
      coverage: 100
    }, {
      hit_position: 37,
      coverage: 100
    }, {
      hit_position: 38,
      coverage: 100
    }, {
      hit_position: 39,
      coverage: 100
    }, {
      hit_position: 40,
      coverage: 100
    }, {
      hit_position: 41,
      coverage: 100
    }, {
      hit_position: 42,
      coverage: 100
    }, {
      hit_position: 43,
      coverage: 100
    }, {
      hit_position: 43,
      coverage: 100
    }, {
      hit_position: 44,
      coverage: 100
    }],
    total_positions: 15
  },
  'Arms': {
    name: 'Arms',
    covered_positions: [{
      hit_position: 14,
      coverage: 100
    }, {
      hit_position: 19,
      coverage: 100
    }, {
      hit_position: 20,
      coverage: 100
    }, {
      hit_position: 25,
      coverage: 100
    }, {
      hit_position: 26,
      coverage: 100
    }, {
      hit_position: 31,
      coverage: 100
    }],
    total_positions: 6
  },
  'Forearms': {
    name: 'Forearms',
    covered_positions: [{
      hit_position: 26,
      coverage: 100
    }, {
      hit_position: 31,
      coverage: 100
    }],
    total_positions: 2
  },
  'Gauntlets, Finger (or Glove)': {
    name: 'Gauntlets, Finger (or Glove)',
    covered_positions: [{
      hit_position: 32,
      coverage: 100
    }, {
      hit_position: 34,
      coverage: 100
    }],
    total_positions: 2
  },
  'Gauntlets, Mitten': {
    name: 'Gauntlets, Mitten',
    covered_positions: [{
      hit_position: 32,
      coverage: 100
    }, {
      hit_position: 34,
      coverage: 100
    }],
    total_positions: 2
  },
  'Half-Arms': {
    name: 'Half-Arms',
    covered_positions: [{
      hit_position: 20,
      coverage: 100
    }, {
      hit_position: 25,
      coverage: 100
    }, {
      hit_position: 26,
      coverage: 100
    }, {
      hit_position: 31,
      coverage: 100
    }],
    total_positions: 4
  },
  'Half-Legs': {
    name: 'Half-Legs',
    covered_positions: [{
      hit_position: 35,
      coverage: 50
    }, {
      hit_position: 36,
      coverage: 50
    }, {
      hit_position: 37,
      coverage: 50
    }, {
      hit_position: 38,
      coverage: 50
    }, {
      hit_position: 39,
      coverage: 50
    }, {
      hit_position: 40,
      coverage: 50
    }, {
      hit_position: 41,
      coverage: 50
    }, {
      hit_position: 42,
      coverage: 50
    }, {
      hit_position: 43,
      coverage: 50
    }, {
      hit_position: 43,
      coverage: 50
    }, {
      hit_position: 44,
      coverage: 50
    }],
    total_positions: 5
  },
  'Legs': {
    name: 'Legs',
    covered_positions: [{
      hit_position: 35,
      coverage: 100
    }, {
      hit_position: 36,
      coverage: 100
    }, {
      hit_position: 37,
      coverage: 100
    }, {
      hit_position: 38,
      coverage: 100
    }, {
      hit_position: 39,
      coverage: 100
    }, {
      hit_position: 40,
      coverage: 100
    }, {
      hit_position: 41,
      coverage: 100
    }, {
      hit_position: 42,
      coverage: 100
    }, {
      hit_position: 43,
      coverage: 100
    }, {
      hit_position: 43,
      coverage: 100
    }, {
      hit_position: 44,
      coverage: 100
    }],
    total_positions: 10
  },
  'Shin Guards': {
    name: 'Shin Guards',
    covered_positions: [{
      hit_position: 39,
      coverage: 50
    }, {
      hit_position: 40,
      coverage: 50
    }, {
      hit_position: 41,
      coverage: 50
    }, {
      hit_position: 42,
      coverage: 50
    }, {
      hit_position: 43,
      coverage: 50
    }, {
      hit_position: 43,
      coverage: 50
    }, {
      hit_position: 44,
      coverage: 50
    }],
    total_positions: 3
  },
  'Shoe Guards': {
    name: 'Shoe Guards',
    covered_positions: [{
      hit_position: 45,
      coverage: 100
    }, {
      hit_position: 46,
      coverage: 100
    }],
    total_positions: 2
  },
  'Elbow Guards': {
    name: 'Elbow Guards',
    covered_positions: [{
      hit_position: 20,
      coverage: 100
    }, {
      hit_position: 25,
      coverage: 100
    }],
    total_positions: 2
  },
  'Hip Guards': {
    name: 'Hip Guards',
    covered_positions: [{
      hit_position: 27,
      coverage: 100
    }, {
      hit_position: 28,
      coverage: 100
    }, {
      hit_position: 29,
      coverage: 100
    }, {
      hit_position: 30,
      coverage: 100
    }],
    total_positions: 4
  },
  'Knee Guards': {
    name: 'Knee Guards',
    covered_positions: [{
      hit_position: 39,
      coverage: 100
    }, {
      hit_position: 40,
      coverage: 100
    }],
    total_positions: 2
  },
  'Shoulder Guards': {
    name: 'Shoulder Guards',
    covered_positions: [{
      hit_position: 8,
      coverage: 100
    }, {
      hit_position: 13,
      coverage: 100
    }],
    total_positions: 2
  },
  'Socks': {
    name: 'Socks',
    covered_positions: [{
      hit_position: 45,
      coverage: 100
    }, {
      hit_position: 46,
      coverage: 100
    }],
    total_positions: 2
  }
};