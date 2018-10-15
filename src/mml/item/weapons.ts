import { IItem } from "./item";

export class Weapon implements IItem {
  constructor(name, weight, mods, description, grips) {
    super(name, weight, 'weapon', mods, description);
    this.grips = grips;
  }

  wield(grip) {
    Object.assign(this, this.grips[grip]);
  }
}

Object.assign(MML.items, {
  "Hand Axe": function (mods, description) {
    return new Weapon("Hand Axe", 3, mods, description, {
      "One Hand": {
        "skill": "Hand Axe",
        "family": "Axe",
        "hands": 1,
        "primary_type": "Chop",
        "primary_task": 35,
        "primary_damage": "1d20",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 6,
        "rank": 1
      }
    });
  },
  "Battle Axe": function (mods, description) {
    return new Weapon("Battle Axe", 5, mods, description, {
      "One Hand": {
        "family": "Axe",
        "skill": "Battle Axe",
        "hands": 1,
        "primary_type": "Chop",
        "primary_task": 35,
        "primary_damage": "3d10",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 5,
        "rank": 1
      },
      "Throw": {
        "family": "TWH",
        "skill": "Battle Axe, Thrown",
        "hands": 1,
        "initiative": 3,
        "accuracyMod": -8,
        "primary_type": "Chop",
        "range": {
          "pointBlank": {
            "task": 35,
            "loadDivider": 8,
            "damage": "2d12"
          },
          "effective": {
            "task": 45,
            "loadDivider": 4,
            "damage": "2d10"
          },
          "long": {
            "task": 25,
            "loadDivider": 3,
            "damage": "2d6"
          },
          "extreme": {
            "task": 0,
            "loadDivider": 2,
            "damage": "1d6"
          }
        }
      }
    });
  },
  "Pick": function (mods, description) {
    return new Weapon("Pick", 6, mods, description, {
      "Two Hands": {
        "family": "Axe",
        "skill": "Pick",
        "hands": 2,
        "primary_type": "Flanged",
        "primary_task": 25,
        "primary_damage": "1d20",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 4,
        "rank": 1
      }
    });
  },
  "Two-Handed Axe": function (mods, description) {
    return new Weapon("Two-Handed Axe", 6.5, mods, description, {
      "Two Hands": {
        "family": "Axe",
        "skill": "Two-Handed Axe",
        "hands": 2,
        "primary_type": "Chop",
        "primary_task": 25,
        "primary_damage": "4d10",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 4,
        "rank": 2
      }
    });
  },
  "Bardiche": function (mods, description) {
    return new Weapon("Bardiche", 7.5, mods, description, {
      "Two Hands": {
        "family": "Axe",
        "skill": "Bardiche",
        "hands": 2,
        "primary_type": "Chop",
        "primary_task": 25,
        "primary_damage": "5d10",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 3,
        "rank": 2
      }
    });
  },
  "Pole Axe": function (mods, description) {
    return new Weapon("Pole Axe", 7, mods, description, {
      "Two Hands": {
        "family": "Axe",
        "skill": "Pole Axe",
        "hands": 2,
        "primary_type": "Chop",
        "primary_task": 25,
        "primary_damage": "4d12",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 3,
        "rank": 2
      }
    });
  },
  "Club": function (mods, description) {
    return new Weapon("Club", 2, mods, description, {
      "One Hand": {
        "family": "Bludgeoning",
        "skill": "Club",
        "hands": 1,
        "primary_type": "Impact",
        "primary_task": 45,
        "primary_damage": "2d8",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 7,
        "rank": 1
      }
    });
  },
  "Cudgel, Light": function (mods, description) {
    return new Weapon("Cudgel, Light", 3, mods, description, {
      "One Hand": {
        "family": "Bludgeoning",
        "hands": 1,
        "primary_type": "Impact",
        "primary_task": 45,
        "primary_damage": "2d10",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 6,
        "rank": 1
      }
    });
  },
  "Cudgel, Heavy": function (mods, description) {
    return new Weapon("Cudgel, Heavy", 7, mods, description, {
      "Two Hands": {
        "family": "Bludgeoning",
        "hands": 2,
        "primary_type": "Impact",
        "primary_task": 35,
        "primary_damage": "4d8",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 4,
        "rank": 2
      }
    });
  },
  "Mace": function (mods, description) {
    return new Weapon("Mace", 5, mods, description, {
      "One Hand": {
        "family": "Bludgeoning",
        "hands": 1,
        "primary_type": "Flanged",
        "primary_task": 45,
        "primary_damage": "2d10",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 5,
        "rank": 1
      }
    });
  },
  "Maul": function (mods, description) {
    return new Weapon("Maul", 9, mods, description, {
      "Two Hands": {
        "family": "Bludgeoning",
        "hands": 2,
        "primary_type": "Impact",
        "primary_task": 25,
        "primary_damage": "4d10",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 4,
        "rank": 2
      }
    });
  },
  "Morningstar": function (mods, description) {
    return new Weapon("Morningstar", 5, mods, description, {
      "One Hand": {
        "family": "Bludgeoning",
        "hands": 1,
        "primary_type": "Thrust",
        "primary_task": 45,
        "primary_damage": "3d10",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 5,
        "rank": 1
      }
    });
  },
  "War Hammer": function (mods, description) {
    return new Weapon("War Hammer", 5.5, mods, description, {
      "One Hand": {
        "family": "Bludgeoning",
        "hands": 1,
        "primary_type": "Impact",
        "primary_task": 35,
        "primary_damage": "3d10",
        "secondary_type": "Flanged",
        "secondary_task": 25,
        "secondary_damage": "2d8",
        "defense": 15,
        "initiative": 5,
        "rank": 1
      }
    });
  },
  "Ball & Chain, Footman's": function (mods, description) {
    return new Weapon("Ball & Chain, Footman's", 5, mods, description, {
      "Two Hands": {
        "family": "Flexible",
        "hands": 2,
        "primary_type": "Impact",
        "primary_task": 15,
        "primary_damage": "3d12",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 4,
        "rank": 2
      }
    });
  },
  "Ball & Chain, Horseman's": function (mods, description) {
    return new Weapon("Ball & Chain, Horseman's", 3.5, mods, description, {
      "One Hand": {
        "family": "Flexible",
        "hands": 1,
        "primary_type": "Impact",
        "primary_task": 25,
        "primary_damage": "2d12",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 0,
        "initiative": 5,
        "rank": 1
      }
    });
  },
  "Flail, Footman's": function (mods, description) {
    return new Weapon("Flail, Footman's", 5, mods, description, {
      "Two Hands": {
        "family": "Flexible",
        "hands": 2,
        "primary_type": "Impact",
        "primary_task": 25,
        "primary_damage": "3d10",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 4,
        "rank": 2
      }
    });
  },
  "Flail, Horseman's": function (mods, description) {
    return new Weapon("Flail, Horseman's", 2.5, mods, description, {
      "One Hand": {
        "family": "Flexible",
        "hands": 1,
        "primary_type": "Impact",
        "primary_task": 35,
        "primary_damage": "1d20",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 0,
        "initiative": 5,
        "rank": 1
      }
    });
  },
  "Mace & Chain": function (mods, description) {
    return new Weapon("Mace & Chain", 3.5, mods, description, {
      "One Hand": {
        "family": "Flexible",
        "hands": 1,
        "primary_type": "Flanged",
        "primary_task": 25,
        "primary_damage": "2d12",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 0,
        "initiative": 5,
        "rank": 1
      }
    });
  },
  "Morningstar & Chain": function (mods, description) {
    return new Weapon("Morningstar & Chain", 4, mods, description, {
      "One Hand": {
        "family": "Flexible",
        "hands": 1,
        "primary_type": "Thrust",
        "primary_task": 25,
        "primary_damage": "3d12",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 0,
        "initiative": 5,
        "rank": 1
      }
    });
  },
  "Boot Knife": function (mods, description) {
    return new Weapon("Boot Knife", 0.5, mods, description, {
      "One Hand": {
        "family": "Knives",
        "hands": 1,
        "primary_type": "Thrust",
        "primary_task": 15,
        "primary_damage": "1d8",
        "secondary_type": "Cut",
        "secondary_task": 15,
        "secondary_damage": "1d6",
        "defense": 0,
        "initiative": 10,
        "rank": 1
      }
    });
  },
  "Dagger": function (mods, description) {
    return new Weapon("Dagger", 1, mods, description, {
      "One Hand": {
        "family": "Knives",
        "hands": 1,
        "primary_type": "Thrust",
        "primary_task": 15,
        "primary_damage": "2d6",
        "secondary_type": "Cut",
        "secondary_task": 15,
        "secondary_damage": "1d8",
        "defense": 0,
        "initiative": 10,
        "rank": 1
      }
    });
  },
  "Knife": function (mods, description) {
    return new Weapon("Knife", 1.5, mods, description, {
      "One Hand": {
        "family": "Knives",
        "hands": 1,
        "primary_type": "Cut",
        "primary_task": 25,
        "primary_damage": "2d6",
        "secondary_type": "Thrust",
        "secondary_task": 15,
        "secondary_damage": "2d6",
        "defense": 0,
        "initiative": 10,
        "rank": 1
      }
    });
  },
  "Dirk": function (mods, description) {
    return new Weapon("Dirk", 1.5, mods, description, {
      "One Hand": {
        "family": "Knives",
        "hands": 1,
        "primary_type": "Cut",
        "primary_task": 25,
        "primary_damage": "2d8",
        "secondary_type": "Thrust",
        "secondary_task": 15,
        "secondary_damage": "2d6",
        "defense": 15,
        "initiative": 9,
        "rank": 1
      }
    });
  },
  "Fauchard": function (mods, description) {
    return new Weapon("Fauchard", 5, mods, description, {
      "Two Hands": {
        "family": "Pole Arms",
        "hands": 2,
        "primary_type": "Cut",
        "primary_task": 15,
        "primary_damage": "2d12",
        "secondary_type": "Thrust",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 4,
        "rank": 2
      }
    });
  },
  "Bill": function (mods, description) {
    return new Weapon("Bill", 5, mods, description, {
      "Two Hands": {
        "family": "Pole Arms",
        "hands": 2,
        "primary_type": "Cut",
        "primary_task": 25,
        "primary_damage": "2d12",
        "secondary_type": "Thrust",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 4,
        "rank": 2
      }
    });
  },
  "Glaive": function (mods, description) {
    return new Weapon("Glaive", 6, mods, description, {
      "Two Hands": {
        "family": "Pole Arms",
        "hands": 2,
        "primary_type": "Chop",
        "primary_task": 25,
        "primary_damage": "3d20",
        "secondary_type": "Thrust",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 4,
        "rank": 2
      }
    });
  },
  "Halberd": function (mods, description) {
    return new Weapon("Halberd", 6, mods, description, {
      "Two Hands": {
        "family": "Pole Arms",
        "hands": 2,
        "primary_type": "Chop",
        "primary_task": 25,
        "primary_damage": "3d20",
        "secondary_type": "Thrust",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 4,
        "rank": 2
      }
    });
  },
  "Pole Hammer": function (mods, description) {
    return new Weapon("Pole Hammer", 6, mods, description, {
      "Two Hands": {
        "family": "Pole Hammers",
        "hands": 2,
        "primary_type": "Flanged",
        "primary_task": 25,
        "primary_damage": "3d10",
        "secondary_type": "Thrust",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 4,
        "rank": 2
      }
    });
  },
  "War Spear": function (mods, description) {
    return new Weapon("War Spear", 2, mods, description, {
      "One Hand": {
        "family": "Spears",
        "hands": 1,
        "primary_type": "Thrust",
        "primary_task": 35,
        "primary_damage": "2d8",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 3,
        "rank": 1
      },
      "Two Hands": {
        "family": "Spears",
        "hands": 2,
        "primary_type": "Thrust",
        "primary_task": 45,
        "primary_damage": "3d8",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 5,
        "rank": 2
      }
    });
  },
  "Boar Spear": function (mods, description) {
    return new Weapon("Boar Spear", 3.5, mods, description, {
      "One Hand": {
        "family": "Spears",
        "hands": 1,
        "primary_type": "Thrust",
        "primary_task": 25,
        "primary_damage": "2d10",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 2,
        "rank": 1
      },
      "Two Hands": {
        "family": "Spears",
        "hands": 2,
        "primary_type": "Thrust",
        "primary_task": 45,
        "primary_damage": "3d10",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 4,
        "rank": 2
      }
    });
  },
  "Military Fork": function (mods, description) {
    return new Weapon("Military Fork", 3.5, mods, description, {
      "One Hand": {
        "family": "Spears",
        "hands": 1,
        "primary_type": "Thrust",
        "primary_task": 15,
        "primary_damage": "2d12",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 2,
        "rank": 1
      },
      "Two Hands": {
        "family": "Spears",
        "hands": 2,
        "primary_type": "Thrust",
        "primary_task": 35,
        "primary_damage": "3d10",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 4,
        "rank": 2
      }
    });
  },
  "Spetum": function (mods, description) {
    return new Weapon("Spetum", 4, mods, description, {
      "Two Hands": {
        "family": "Spears",
        "hands": 2,
        "primary_type": "Thrust",
        "primary_task": 35,
        "primary_damage": "3d10",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 4,
        "rank": 2
      }
    });
  },
  "Quarter Staff": function (mods, description) {
    return new Weapon("Quarter Staff", 2, mods, description, {
      "Two Hands": {
        "family": "Staves",
        "hands": 2,
        "primary_type": "Impact",
        "primary_task": 45,
        "primary_damage": "3d8",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 35,
        "initiative": 9,
        "rank": 2
      }
    });
  },
  "Scimitar": function (mods, description) {
    return new Weapon("Scimitar", 3.5, mods, description, {
      "One Hand": {
        "family": "Swords",
        "hands": 1,
        "primary_type": "Cut",
        "primary_task": 35,
        "primary_damage": "2d12",
        "secondary_type": "Thrust",
        "secondary_task": 25,
        "secondary_damage": "2d6",
        "defense": 35,
        "initiative": 7,
        "rank": 1
      }
    });
  },
  "Short Sword": function (mods, description) {
    return new Weapon("Short Sword", 3.5, mods, description, {
      "One Hand": {
        "family": "Swords",
        "hands": 1,
        "primary_type": "Thrust",
        "primary_task": 35,
        "primary_damage": "3d8",
        "secondary_type": "Cut",
        "secondary_task": 35,
        "secondary_damage": "3d6",
        "defense": 35,
        "initiative": 1,
        "rank": 1
      }
    });
  },
  "Long Sword": function (mods, description) {
    return new Weapon("Long Sword", 3, mods, description, {
      "One Hand": {
        "family": "Swords",
        "hands": 1,
        "primary_type": "Cut",
        "primary_task": 45,
        "primary_damage": "3d10",
        "secondary_type": "Thrust",
        "secondary_task": 35,
        "secondary_damage": "2d6",
        "defense": 25,
        "initiative": 5,
        "rank": 1
      }
    });
  },
  "Falchion": function (mods, description) {
    return new Weapon("Falchion", 3.5, mods, description, {
      "One Hand": {
        "family": "Swords",
        "hands": 1,
        "primary_type": "Chop",
        "primary_task": 35,
        "primary_damage": "4d8",
        "secondary_type": "Thrust",
        "secondary_task": 25,
        "secondary_damage": "3d6",
        "defense": 25,
        "initiative": 5,
        "rank": 1
      }
    });
  },
  "Bastard Sword": function (mods, description) {
    return new Weapon("Bastard Sword", 6, mods, description, {
      "One Hand": {
        "family": "Swords",
        "hands": 1,
        "primary_type": "Cut",
        "primary_task": 25,
        "primary_damage": "5d6",
        "secondary_type": "Thrust",
        "secondary_task": 15,
        "secondary_damage": "3d6",
        "defense": 15,
        "initiative": 4,
        "rank": 1
      },
      "Two Hands": {
        "family": "Swords",
        "hands": 2,
        "primary_type": "Cut",
        "primary_task": 35,
        "primary_damage": "4d10",
        "secondary_type": "Thrust",
        "secondary_task": 25,
        "secondary_damage": "4d6",
        "defense": 25,
        "initiative": 5,
        "rank": 1
      }
    });
  },
  "Broadsword": function (mods, description) {
    return new Weapon("Broadsword", 5, mods, description, {
      "One Hand": {
        "family": "Swords",
        "hands": 1,
        "primary_type": "Chop",
        "primary_task": 25,
        "primary_damage": "3d12",
        "secondary_type": "Thrust",
        "secondary_task": 15,
        "secondary_damage": "1d12",
        "defense": 15,
        "initiative": 4,
        "rank": 1
      }
    });
  },
  "Two-Handed Broadsword": function (mods, description) {
    return new Weapon("Two-Handed Broadsword", 7.5, mods, description, {
      "Two Hands": {
        "family": "Swords",
        "hands": 2,
        "primary_type": "Chop",
        "primary_task": 35,
        "primary_damage": "4d12",
        "secondary_type": "Thrust",
        "secondary_task": 25,
        "secondary_damage": "1d20",
        "defense": 25,
        "initiative": 3,
        "rank": 1
      }
    });
  },
  "Great Sword": function (mods, description) {
    return new Weapon("Great Sword", 13, mods, description, {
      "Two Hands": {
        "family": "Swords",
        "hands": 2,
        "primary_type": "Chop",
        "primary_task": 15,
        "primary_damage": "6d10",
        "secondary_type": "Thrust",
        "secondary_task": 15,
        "secondary_damage": "3d10",
        "defense": 35,
        "initiative": 2,
        "rank": 2
      }
    });
  },
  "Whip": function (mods, description) {
    return new Weapon("Whip", 1, mods, description, {
      "One Hand": {
        "family": "Whip",
        "hands": 1,
        "primary_type": "Surface",
        "primary_task": 35,
        "primary_damage": "2d4",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 0,
        "initiative": 8,
        "rank": 3
      }
    });
  },
  "Cleaver": function (mods, description) {
    return new Weapon("Cleaver", 2, mods, description, {
      "One Hand": {
        "family": "Axe",
        "hands": 1,
        "primary_type": "Chop",
        "primary_task": 25,
        "primary_damage": "1d10",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 0,
        "initiative": 8,
        "rank": 1
      }
    });
  },
  "Hatchet": function (mods, description) {
    return new Weapon("Hatchet", 2.5, mods, description, {
      "One Hand": {
        "family": "Axe",
        "hands": 1,
        "primary_type": "Chop",
        "primary_task": 25,
        "primary_damage": "1d12",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 0,
        "initiative": 7,
        "rank": 1
      }
    });
  },
  "Hoe": function (mods, description) {
    return new Weapon("Hoe", 4, mods, description, {
      "Two Hands": {
        "family": "Axe",
        "hands": 2,
        "primary_type": "Flanged",
        "primary_task": 35,
        "primary_damage": "1d10",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 4,
        "rank": 1
      }
    });
  },
  "Wood Axe": function (mods, description) {
    return new Weapon("Wood Axe", 3, mods, description, {
      "Two Hands": {
        "family": "Axe",
        "hands": 2,
        "primary_type": "Chop",
        "primary_task": 35,
        "primary_damage": "2d12",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 4,
        "rank": 1
      }
    });
  },
  "Hammer, Medium": function (mods, description) {
    return new Weapon("Hammer, Medium", 2.5, mods, description, {
      "One Hand": {
        "family": "Bludgeoning",
        "hands": 1,
        "primary_type": "Impact",
        "primary_task": 25,
        "primary_damage": "1d10",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 0,
        "initiative": 7,
        "rank": 1
      }
    });
  },
  "Shovel": function (mods, description) {
    return new Weapon("Shovel", 6, mods, description, {
      "Two Hands": {
        "family": "Bludgeoning",
        "hands": 2,
        "primary_type": "Impact",
        "primary_task": 35,
        "primary_damage": "1d8",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 4,
        "rank": 1
      }
    });
  },
  "Skinning Knife": function (mods, description) {
    return new Weapon("Skinning Knife", 0.5, mods, description, {
      "One Hand": {
        "family": "Knives",
        "hands": 1,
        "primary_type": "Cut",
        "primary_task": 15,
        "primary_damage": "1d8",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 0,
        "initiative": 9,
        "rank": 1
      }
    });
  },
  "Butcher's Knife": function (mods, description) {
    return new Weapon("Butcher's Knife", 1, mods, description, {
      "One Hand": {
        "family": "Knives",
        "hands": 1,
        "primary_type": "Cut",
        "primary_task": 15,
        "primary_damage": "2d6",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 0,
        "initiative": 9,
        "rank": 1
      }
    });
  },
  "Pitch Fork": function (mods, description) {
    return new Weapon("Pitch Fork", 3, mods, description, {
      "Two Hands": {
        "family": "Spears",
        "hands": 2,
        "primary_type": "Thrust",
        "primary_task": 35,
        "primary_damage": "2d10",
        "secondary_type": "",
        "secondary_task": 0,
        "secondary_damage": "",
        "defense": 15,
        "initiative": 3,
        "rank": 1
      }
    });
  },
  "Wind Sword": function (mods, description) {
    return new Weapon("Wind Sword", 3, mods, description, {
      "One Hand": {
        "family": "Swords",
        "hands": 1,
        "primary_type": "Cut",
        "primary_task": 45,
        "primary_damage": "3d10",
        "secondary_type": "Thrust",
        "secondary_task": 45,
        "secondary_damage": "2d4",
        "defense": 25,
        "initiative": 6,
        "rank": 1
      },
      "Two Hands": {
        "family": "Swords",
        "hands": 2,
        "primary_type": "Cut",
        "primary_task": 45,
        "primary_damage": "4d10",
        "secondary_type": "Thrust",
        "secondary_task": 45,
        "secondary_damage": "3d8",
        "defense": 35,
        "initiative": 8,
        "rank": 1
      }
    });
  },
  "Short Bow": function (mods, description) {
    return new Weapon("Short Bow", 2, mods, description, {
      "Two Hands": {
        "family": "MWD",
        "hands": 2,
        "pull": 45,
        "initiative": 8,
        "reload": 1,
        "primary_type": "Pierce",
        "range": {
          "pointBlank": {
            "task": 15,
            "range": 74,
            "damage": "3d6"
          },
          "effective": {
            "task": 45,
            "range": 149,
            "damage": "2d8"
          },
          "long": {
            "task": 25,
            "range": 299,
            "damage": "2d6"
          },
          "extreme": {
            "task": 0,
            "range": 300,
            "damage": "1d6"
          }
        }
      }
    });
  },
  "Medium Bow": function (mods, description) {
    return new Weapon("Medium Bow", 2, mods, description, {
      "Two Hands": {
        "family": "MWD",
        "hands": 2,
        "pull": 60,
        "initiative": 7,
        "reload": 1,
        "primary_type": "Pierce",
        "range": {
          "pointBlank": {
            "task": 15,
            "range": 89,
            "damage": "3d8"
          },
          "effective": {
            "task": 45,
            "range": 179,
            "damage": "2d10"
          },
          "long": {
            "task": 25,
            "range": 449,
            "damage": "2d8"
          },
          "extreme": {
            "task": 0,
            "range": 450,
            "damage": "1d8"
          }
        }
      }
    });
  },
  "Long Bow": function (mods, description) {
    return new Weapon("Long Bow", 2.5, mods, description, {
      "Two Hands": {
        "family": "MWD",
        "hands": 2,
        "pull": 80,
        "initiative": 6,
        "reload": 1,
        "primary_type": "Pierce",
        "range": {
          "pointBlank": {
            "task": 15,
            "range": 149,
            "damage": "3d10"
          },
          "effective": {
            "task": 45,
            "range": 269,
            "damage": "3d8"
          },
          "long": {
            "task": 25,
            "range": 599,
            "damage": "3d6"
          },
          "extreme": {
            "task": 0,
            "range": 600,
            "damage": "1d10"
          }
        }
      }
    });
  },
  "Heavy Long Bow": function (mods, description) {
    return new Weapon("Heavy Long Bow", 3, mods, description, {
      "Two Hands": {
        "family": "MWD",
        "hands": 2,
        "pull": 100,
        "initiative": 4,
        "reload": 1,
        "primary_type": "Pierce",
        "range": {
          "pointBlank": {
            "task": 15,
            "range": 179,
            "damage": "3d12"
          },
          "effective": {
            "task": 45,
            "range": 299,
            "damage": "3d10"
          },
          "long": {
            "task": 25,
            "range": 674,
            "damage": "3d8"
          },
          "extreme": {
            "task": 0,
            "range": 675,
            "damage": "1d10"
          }
        }
      }
    });
  },
  "Short Composite Bow": function (mods, description) {
    return new Weapon("Short Composite Bow", 1, mods, description, {
      "Two Hands": {
        "family": "MWD",
        "hands": 2,
        "pull": 60,
        "initiative": 7,
        "reload": 1,
        "primary_type": "Pierce",
        "range": {
          "pointBlank": {
            "task": 15,
            "range": 89,
            "damage": "3d8"
          },
          "effective": {
            "task": 45,
            "range": 179,
            "damage": "2d10"
          },
          "long": {
            "task": 25,
            "range": 449,
            "damage": "2d8"
          },
          "extreme": {
            "task": 0,
            "range": 450,
            "damage": "1d8"
          }
        }
      }
    });
  },
  "Medium Composite Bow": function (mods, description) {
    return new Weapon("Medium Composite Bow", 2, mods, description, {
      "Two Hands": {
        "family": "MWD",
        "hands": 2,
        "pull": 80,
        "initiative": 6,
        "reload": 1,
        "primary_type": "Pierce",
        "range": {
          "pointBlank": {
            "task": 15,
            "range": 149,
            "damage": "3d10"
          },
          "effective": {
            "task": 45,
            "range": 269,
            "damage": "3d8"
          },
          "long": {
            "task": 25,
            "range": 599,
            "damage": "3d6"
          },
          "extreme": {
            "task": 0,
            "range": 600,
            "damage": "1d10"
          }
        }
      }
    });
  },
  "Light Cross Bow": function (mods, description) {
    return new Weapon("Light Cross Bow", 2, mods, description, {
      "Two Hands": {
        "family": "MWM",
        "hands": 2,
        "pull": 80,
        "initiative": 10,
        "reload": 4,
        "primary_type": "Pierce",
        "range": {
          "pointBlank": {
            "task": 15,
            "range": 179,
            "damage": "3d10"
          },
          "effective": {
            "task": 45,
            "range": 299,
            "damage": "3d8"
          },
          "long": {
            "task": 25,
            "range": 674,
            "damage": "3d6"
          },
          "extreme": {
            "task": 0,
            "range": 675,
            "damage": "1d10"
          }
        }
      }
    });
  },
  "Medium Cross Bow": function (mods, description) {
    return new Weapon("Medium Cross Bow", 3, mods, description, {
      "Two Hands": {
        "family": "MWM",
        "hands": 2,
        "pull": 100,
        "initiative": 10,
        "reload": 6,
        "primary_type": "Pierce",
        "range": {
          "pointBlank": {
            "task": 15,
            "range": 224,
            "damage": "3d12"
          },
          "effective": {
            "task": 45,
            "range": 374,
            "damage": "3d10"
          },
          "long": {
            "task": 25,
            "range": 899,
            "damage": "3d8"
          },
          "extreme": {
            "task": 0,
            "range": 900,
            "damage": "1d10"
          }
        }
      }
    });
  },
  "Heavy Cross Bow": function (mods, description) {
    return new Weapon("Heavy Cross Bow", 4, mods, description, {
      "Two Hands": {
        "family": "MWM",
        "hands": 2,
        "pull": 120,
        "initiative": 8,
        "reload": 12,
        "primary_type": "Pierce",
        "range": {
          "pointBlank": {
            "task": 15,
            "range": 269,
            "damage": "4d10"
          },
          "effective": {
            "task": 45,
            "range": 449,
            "damage": "3d12"
          },
          "long": {
            "task": 25,
            "range": 1199,
            "damage": "3d10"
          },
          "extreme": {
            "task": 0,
            "range": 1200,
            "damage": "1d12"
          }
        }
      }
    });
  }
});
