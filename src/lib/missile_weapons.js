const bow_weapons = {
  "Composite Horsebow": {
    "weapon_name": "Composite Horsebow",
    "weapon_type": "Bow",
    "range": "25",
    "missile_tn": "7",
    "damage": "5 p",
    "required_strength": "4",
    "special": "Cavalry Bow 3",
    "weight": "0",
    "cost": "6 sp"
  },
  "Composite Warbow": {
    "weapon_name": "Composite Warbow",
    "weapon_type": "Bow",
    "range": "30",
    "missile_tn": "7",
    "damage": "6 p",
    "required_strength": "5",
    "special": "Cavalry Bow 2",
    "weight": "0.5",
    "cost": "8 sp"
  },
  "Horsebow": {
    "weapon_name": "Horsebow",
    "weapon_type": "Bow",
    "range": "20",
    "missile_tn": "7",
    "damage": "4 p",
    "required_strength": "3",
    "special": "Cavalry Bow 3",
    "weight": "0",
    "cost": "2 sp"
  },
  "Longbow": {
    "weapon_name": "Longbow",
    "weapon_type": "Bow",
    "range": "25",
    "missile_tn": "7",
    "damage": "5 p",
    "required_strength": "4",
    "special": "-",
    "weight": "0.5",
    "cost": "3 sp"
  },
  "Warbow": {
    "weapon_name": "Warbow",
    "weapon_type": "Bow",
    "range": "30",
    "missile_tn": "7",
    "damage": "6 p",
    "required_strength": "6",
    "special": "-",
    "weight": "0.5",
    "cost": "4 sp"
  },
  "Zellish Wheelbow": {
    "weapon_name": "Zellish Wheelbow",
    "weapon_type": "Bow",
    "range": "30",
    "missile_tn": "7",
    "damage": "7 p",
    "required_strength": "5",
    "special": "Easy to Aim",
    "weight": "3",
    "cost": "5 gp"
  }
};

var crossbows = {
  "Arbalest": {
    "weapon_name": "Arbalest",
    "weapon_type": "Crossbow",
    "range": "20",
    "missile_tn": "6",
    "damage": "12p",
    "span": "25",
    "spanning_tool": "Crank, Windlass",
    "special": "Easy to Aim",
    "weight": "3",
    "cost": "2 gp"
  },
  "Hand Crossbow": {
    "weapon_name": "Hand Crossbow",
    "weapon_type": "Crossbow",
    "range": "5",
    "missile_tn": "5",
    "damage": "4p",
    "span": "2",
    "spanning_tool": "Lever, Screw",
    "special": "Easy to Aim",
    "weight": "0",
    "cost": "5 sp"
  },
  "Heavy Crossbow": {
    "weapon_name": "Heavy Crossbow",
    "weapon_type": "Crossbow",
    "range": "15",
    "missile_tn": "6",
    "damage": "10p",
    "span": "10",
    "spanning_tool": "Hand, Lever, Stirrup, Crank",
    "special": "Easy to Aim",
    "weight": "2",
    "cost": "1 gp"
  },
  "Hunting Crossbow": {
    "weapon_name": "Hunting Crossbow",
    "weapon_type": "Crossbow",
    "range": "10",
    "missile_tn": "6",
    "damage": "8p",
    "span": "6",
    "spanning_tool": "Hand, Lever, Stirrup",
    "special": "Easy to Aim",
    "weight": "1",
    "cost": "15 sp"
  },
  "Light Crossbow": {
    "weapon_name": "Light Crossbow",
    "weapon_type": "Crossbow",
    "range": "10",
    "missile_tn": "6",
    "damage": "6p",
    "span": "4",
    "spanning_tool": "Lever",
    "special": "Easy to Aim",
    "weight": "1",
    "cost": "10 sp"
  },
  "Manuballista / Samostrel": {
    "weapon_name": "Manuballista / Samostrel",
    "weapon_type": "Crossbow",
    "range": "25",
    "missile_tn": "10(7)~",
    "damage": "15p",
    "span": "40",
    "spanning_tool": "Winch",
    "special": "Easy to Aim",
    "weight": "5",
    "cost": "5 gp"
  }
};

var firearms = {
  "Arquebus": {
    "weapon_name": "Arquebus",
    "weapon_type": "Firearm",
    "range": "10",
    "missile_tn": "7",
    "damage": "8p",
    "load": "20",
    "ammunition": "Ball, Shot",
    "special": "Easy to Aim",
    "weight": "1",
    "cost": "12 sp"
  },
  "Blunderbuss": {
    "weapon_name": "Blunderbuss",
    "weapon_type": "Firearm",
    "range": "3",
    "missile_tn": "6",
    "damage": "8p",
    "load": "18",
    "ammunition": "Ball, Heavy Shot",
    "special": "Easy to Aim",
    "weight": "1",
    "cost": "12 sp"
  },
  "Deck Gun / Abus Gun": {
    "weapon_name": "Deck Gun / Abus Gun",
    "weapon_type": "Firearm",
    "range": "25",
    "missile_tn": "10(7)",
    "damage": "20p",
    "load": "50",
    "ammunition": "Ball, Heavy Shot, Spike",
    "special": "Easy to Aim",
    "weight": "10",
    "cost": "100 sp"
  },
  "Dragon": {
    "weapon_name": "Dragon",
    "weapon_type": "Firearm",
    "range": "2",
    "missile_tn": "6",
    "damage": "7p",
    "load": "10",
    "ammunition": "Ball, Shot",
    "special": "Easy to Aim",
    "weight": "0.5",
    "cost": "18 sp"
  },
  "Hand Bombard": {
    "weapon_name": "Hand Bombard",
    "weapon_type": "Firearm",
    "range": "8",
    "missile_tn": "8",
    "damage": "14p",
    "load": "30",
    "ammunition": "Ball, Shot, Spike",
    "special": "-",
    "weight": "2",
    "cost": "10 sp"
  },
  "Hand Gonne": {
    "weapon_name": "Hand Gonne",
    "weapon_type": "Firearm",
    "range": "5",
    "missile_tn": "8",
    "damage": "8p",
    "load": "20",
    "ammunition": "Ball",
    "special": "Easy to Aim",
    "weight": "1",
    "cost": "8 sp"
  },
  "Musket": {
    "weapon_name": "Musket",
    "weapon_type": "Firearm",
    "range": "15",
    "missile_tn": "7",
    "damage": "10p",
    "load": "20",
    "ammunition": "Ball, Shot, Buck and Ball",
    "special": "Easy to Aim",
    "weight": "2",
    "cost": "20 sp"
  },
  "Pistol": {
    "weapon_name": "Pistol",
    "weapon_type": "Firearm",
    "range": "5",
    "missile_tn": "7",
    "damage": "7p",
    "load": "12",
    "ammunition": "Ball, Shot",
    "special": "Easy to Aim",
    "weight": "0",
    "cost": "10 sp"
  },
  "Rifle": {
    "weapon_name": "Rifle",
    "weapon_type": "Firearm",
    "range": "20",
    "missile_tn": "7",
    "damage": "12p",
    "load": "25",
    "ammunition": "Ball, Rifle Ball",
    "special": "Easy to Aim",
    "weight": "1",
    "cost": "40 sp"
  }
};

var arrows = {
  "Barbed Broadhead": {
    "ammunition_name": "Barbed Broadhead",
    "special": "Winged 2",
    "catch_chance": "10 / 10",
    "cost": "4 sp / 20"
  },
  "Bodkin": {
    "ammunition_name": "Bodkin",
    "special": "+ 10 Range, Narrow",
    "catch_chance": "1 / 10",
    "cost": "1 sp / 20"
  },
  "Bludgeon / Stun": {
    "ammunition_name": "Bludgeon / Stun",
    "special": "Bludgeon, Shock 2, -5 Range",
    "catch_chance": "0 / 10",
    "cost": "10 cp / 20"
  },
  "Broadhead": {
    "ammunition_name": "Broadhead",
    "special": "+ 1 Damage, Winged 2",
    "catch_chance": "5 / 10",
    "cost": "2 sp / 20"
  },
  "Fire Arrow": {
    "ammunition_name": "Fire Arrow",
    "special": "- 1 Damage, +1 Missile TN, -5 Range, Flaming 1",
    "catch_chance": "5 / 10",
    "cost": "2 sp / 20"
  },
  "Heavy Broadhead": {
    "ammunition_name": "Heavy Broadhead",
    "special": "+ 2 Damage, Winged 2, -5 Range",
    "catch_chance": "5 / 10",
    "cost": "3 sp / 20"
  },
  "Lozenge - Head": {
    "ammunition_name": "Lozenge - Head",
    "special": "- 5 Range, AP 2",
    "catch_chance": "2 / 10",
    "cost": "2 sp / 20"
  },
  "Swallowtail": {
    "ammunition_name": "Swallowtail",
    "special": "- 1 Required STR, Winged 1",
    "catch_chance": "8 / 10",
    "cost": "4 sp / 20"
  }
};

var bullets = {
  "Ball": {
    "ammunition_name": "Ball",
    "special": "AP 4",
    "catch_chance": "9/10",
    "cost": "1 cp/10"
  },
  "Buck and Ball": {
    "ammunition_name": "Buck and Ball",
    "special": "AP 2 (first hit only), Scatter 3/6",
    "catch_chance": "9/10",
    "cost": "1 cp/10"
  },
  "Heavy Shot": {
    "ammunition_name": "Heavy Shot",
    "special": "Scatter 8/6",
    "catch_chance": "9/10",
    "cost": "3 cp/10"
  },
  "Rifle Ball": {
    "ammunition_name": "Rifle Ball",
    "special": "AP 4, -1 Missile TN, -10 Load",
    "catch_chance": "8/10",
    "cost": "6 cp/10"
  },
  "Shot": {
    "ammunition_name": "Shot",
    "special": "Scatter 6/6",
    "catch_chance": "9/10",
    "cost": "1 cp/10"
  },
  "Spike": {
    "ammunition_name": "Spike",
    "special": "+2 Damage, -1 Missile TN, +3 Range, +10 Load",
    "catch_chance": "1/10",
    "cost": "1 cp/Ea"
  }
};

var spanning_tools = {
  "Crank (Crannequin)": {
    "tool_name": "Crank (Crannequin)",
    "span_bonus": "3",
    "store_span": true,
    "weight": "0",
    "cost": "1 sp"
  },
  "Hand": {
    "tool_name": "Hand",
    "span_bonus": "0",
    "store_span": false,
    "weight": "0",
    "cost": "-"
  },
  "Lever": {
    "tool_name": "Lever",
    "span_bonus": "2",
    "store_span": false,
    "weight": "0",
    "cost": "5 cp"
  },
  "Screw": {
    "tool_name": "Screw",
    "span_bonus": "0",
    "store_span": true,
    "weight": "0",
    "cost": "1 sp"
  },
  "Stirrup": {
    "tool_name": "Stirrup",
    "span_bonus": "5",
    "store_span": false,
    "weight": "1",
    "cost": "5 cp"
  },
  "Windlass": {
    "tool_name": "Windlass",
    "span_bonus": "4",
    "store_span": true,
    "weight": "1",
    "cost": "2 sp"
  },
  "Winch": {
    "tool_name": "Winch",
    "span_bonus": "6",
    "store_span": true,
    "weight": "2",
    "cost": "3 sp"
  }
};


var capacities = {
  "Double": {
    "capacity_name": "Double",
    "shots": "2",
    "special": "Can be fired twice before reloading, or both barrels can be fired simultaneously. Declare a single Shot normally, resolve the second Shot with the same amount of dice as the first. Each attack hits and is resolved separately. Each chamber must be reloaded separately. This weapon can now use Rapid Shot.",
    "weight": "-",
    "cost": "+50%"
  },
  "Single": {
    "capacity_name": "Single",
    "shots": "1",
    "special": "Standard for most weapons.",
    "weight": "-",
    "cost": "-"
  },
  "Magazine (X)": {
    "capacity_name": "Magazine (X)",
    "shots": "X+1",
    "special": "This weapon now has an internal magazine that chambers X rounds (plus the one loaded into the chamber already), and loads them into the weapon one at a time as they are fired. After firing a round, the next round can be fired without Reloading until all the rounds in the magazine have been fired. Each purchase of this Capacity increases X by 1, to a maximum of 15. When performing the Reload Maneuver, it is possible to reload more than 1 round into the magazine. If the successes rolled on the Reload are higher than the Load value of the weapon, then for every 2 points of Load over the Load Value, an additional round is reloaded. This weapon can now Rapid Fire. This weapon can only load Brass or Paper Mache cartridges.",
    "weight": "1",
    "cost": "+2,000% base, +50% per X"
  },
  "Multishot (X)": {
    "capacity_name": "Multishot (X)",
    "shots": "X+1",
    "special": "This weapon now has X additional rounds that fire simultaneously. Declare a single Shot normally, then resolve the other X with the same amount of dice as the first. Each attack hits and is resolved separately. However, any attack made with this weapon suffers an CP reduction equal to X due to increased recoil. Each chamber must be reloaded separately. Each purchase of this Capacity increases X by 1, to a maximum of 10. This weapon cannot use Rapid Shot, as the barrels do not fire sequentially.",
    "weight": "0.5",
    "cost": "+50%"
  },
  "Revolver (X)": {
    "capacity_name": "Revolver (X)",
    "shots": "X+1",
    "special": "Can be fired X additional times before reloading. Each chamber must be reloaded separately. Each purchase of this Capacity increases X by 1, to a maximum of 10. After the first purchase, additional purchases do not further increase the weapon’s Weight. This weapon can now use Rapid Shot.",
    "weight": "0.5",
    "cost": "+100% per X"
  },
  "High Caliber (X)": {
    "capacity_name": "High Caliber (X)",
    "shots": "-",
    "special": "This modification changes the size and power of the weapon’s ammunition instead of the weapon’s capacity. This can be applied to any weapon, and if combined with other Ammunition Capacity options, affects all loads in the weapon. Weapon Damage is increased by X. Missile TN is increased by X.",
    "weight": "0",
    "cost": "+25%"
  }
};


const loading_mechanism = {
  "Brass Cartridge": {
    "loading_mechanism": "Brass Cartridge",
    "load_bonus": "+10",
    "ammunition_cost_modifier": "1000%"
  },
  "Manual": {
    "loading_mechanism": "Manual",
    "load_bonus": "0",
    "ammunition_cost_modifier": "100%"
  },
  "Paper Cartridge": {
    "loading_mechanism": "Paper Cartridge",
    "load_bonus": "+3",
    "ammunition_cost_modifier": "200%"
  },
  "Papier-Mâché Cartridge": {
    "loading_mechanism": "Papier-Mâché Cartridge",
    "load_bonus": "+5",
    "ammunition_cost_modifier": "300%"
  }
};

const throwing_weapons = {
  "Axe": {
    "weapon_name": "Axe",
    "weapon_type": "Thrown",
    "range": "10",
    "missile_tn": "8",
    "damage": "+3c/+1b",
    "special": "-",
    "stuck_chance": "5/10",
    "weight": "-",
    "cost": "-"
  },
  "Chakram": {
    "weapon_name": "Chakram",
    "weapon_type": "Thrown",
    "range": "15",
    "missile_tn": "7",
    "damage": "+1c",
    "special": "Winged 2",
    "stuck_chance": "0/10",
    "weight": "0",
    "cost": "1 sp"
  },
  "Club": {
    "weapon_name": "Club",
    "weapon_type": "Thrown",
    "range": "10",
    "missile_tn": "7",
    "damage": "+1b",
    "special": "-",
    "stuck_chance": "0/10",
    "weight": "-",
    "cost": "-"
  },
  "Hammer": {
    "weapon_name": "Hammer",
    "weapon_type": "Thrown",
    "range": "10",
    "missile_tn": "7",
    "damage": "+2b",
    "special": "AP 1",
    "stuck_chance": "0/10",
    "weight": "-",
    "cost": "-"
  },
  "Heavy Dart": {
    "weapon_name": "Heavy Dart",
    "weapon_type": "Thrown",
    "range": "20",
    "missile_tn": "8",
    "damage": "+2p",
    "special": "AP 1",
    "stuck_chance": "6/10",
    "weight": "0",
    "cost": "1 sp"
  },
  "Javelin (Heavy)": {
    "weapon_name": "Javelin (Heavy)",
    "weapon_type": "Thrown",
    "range": "10",
    "missile_tn": "8",
    "damage": "+3p",
    "special": "AP 1",
    "stuck_chance": "5/10",
    "weight": "1",
    "cost": "2 sp"
  },
  "Javelin (Lead)": {
    "weapon_name": "Javelin (Lead)",
    "weapon_type": "Thrown",
    "range": "5",
    "missile_tn": "8",
    "damage": "+4p",
    "special": "AP 2, Shield Stick",
    "stuck_chance": "10/10",
    "weight": "1",
    "cost": "3 sp"
  },
  "Javelin (Light)": {
    "weapon_name": "Javelin (Light)",
    "weapon_type": "Thrown",
    "range": "15",
    "missile_tn": "7",
    "damage": "+2p",
    "special": "-",
    "stuck_chance": "5/10",
    "weight": "0",
    "cost": "1 sp"
  },
  "Knife": {
    "weapon_name": "Knife",
    "weapon_type": "Thrown",
    "range": "5",
    "missile_tn": "8",
    "damage": "+1p/+0c",
    "special": "-",
    "stuck_chance": "4/10",
    "weight": "0",
    "cost": "-"
  },
  "Knife (Throwing)": {
    "weapon_name": "Knife (Throwing)",
    "weapon_type": "Thrown",
    "range": "10",
    "missile_tn": "7",
    "damage": "+1p/+0c",
    "special": "-",
    "stuck_chance": "4/10",
    "weight": "0",
    "cost": "8 cp"
  },
  "Metal Weight": {
    "weapon_name": "Metal Weight",
    "weapon_type": "Thrown",
    "range": "10",
    "missile_tn": "7",
    "damage": "+2b",
    "special": "-",
    "stuck_chance": "0/10",
    "weight": "1",
    "cost": "1 cp"
  },
  "Pole-Sling": {
    "weapon_name": "Pole-Sling",
    "weapon_type": "Thrown",
    "range": "25",
    "missile_tn": "7",
    "damage": "+3b",
    "special": "-",
    "stuck_chance": "0/10",
    "weight": "2",
    "cost": "5 cp"
  },
  "Rock": {
    "weapon_name": "Rock",
    "weapon_type": "Thrown",
    "range": "15",
    "missile_tn": "7",
    "damage": "+1b",
    "special": "-",
    "stuck_chance": "0/10",
    "weight": "0",
    "cost": "-"
  },
  "Sling (Light)": {
    "weapon_name": "Sling (Light)",
    "weapon_type": "Thrown",
    "range": "15",
    "missile_tn": "7",
    "damage": "+1b",
    "special": "-",
    "stuck_chance": "0/10",
    "weight": "0",
    "cost": "1 cp"
  },
  "Sling (Long)": {
    "weapon_name": "Sling (Long)",
    "weapon_type": "Thrown",
    "range": "20",
    "missile_tn": "7",
    "damage": "+2b",
    "special": "-",
    "stuck_chance": "0/10",
    "weight": "0",
    "cost": "2 cp"
  },
  "Soliferrum": {
    "weapon_name": "Soliferrum",
    "weapon_type": "Thrown",
    "range": "5",
    "missile_tn": "8",
    "damage": "+3p",
    "special": "AP 3, Shield Stick",
    "stuck_chance": "8/10",
    "weight": "1",
    "cost": "4 sp"
  },
  "Spear": {
    "weapon_name": "Spear",
    "weapon_type": "Thrown",
    "range": "10",
    "missile_tn": "7",
    "damage": "+2p",
    "special": "-",
    "stuck_chance": "5/10",
    "weight": "-",
    "cost": "-"
  },
  "Sword": {
    "weapon_name": "Sword",
    "weapon_type": "Thrown",
    "range": "5",
    "missile_tn": "8",
    "damage": "+3p",
    "special": "-",
    "stuck_chance": "8/10",
    "weight": "-",
    "cost": "-"
  }
};

const missile_weapon_special_qualities = {
  "AP [X]": {
    "quality": "AP [X]",
    "effect": "Armor Piercing [X]. Inflicts X additional damage against any Armor, up to the AV of the Armor.. Has no effect on Armor with the Bulletproof quality."
  },
  "Bleed [X]": {
    "quality": "Bleed [X]",
    "effect": "Any Wounds inflicted by this missile cause X additional Bleeding damage."
  },
  "Bludgeon": {
    "quality": "Bludgeon",
    "effect": "Inflicts Bludgeoning damage regardless of the weapon’s damage type."
  },
  "Cavalry Bow [X]": {
    "quality": "Cavalry Bow [X]",
    "effect": "This bow is easier to use while riding horseback. The penalty for shooting from horseback while moving (4 CP normally) is reduced by X for this weapon."
  },
  "Flaming [X]": {
    "quality": "Flaming [X]",
    "effect": "On hit inflicts X/TN 5 Burn for 3 Rounds to Hit Location."
  },
  "Narrow": {
    "quality": "Narrow",
    "effect": "This weapon gains AP 4 against armor with the Mail special quality."
  },
  "Scatter [X/Y]": {
    "quality": "Scatter [X/Y]",
    "effect": "In addition to the primary Shot, which resolves normally, you automatically hit with a number of additional attacks equal to X (roll for Hit Location with each) at Damage Y. Attacks that hit the same Hit Location combine their Damage before subtracting AV and TOU, unless the Hit Location is protected by Bulletproof armor, in which case the attacks resolve separately. No special rules apply to these additional attacks unless they are listed after X/Y. Scattered attacks do not gain BS as damage. Weapons with Scatter do not suffer the normal penalties for Range. Instead, each Range increment past the first reduces X by 1. Once X is 0, the next Range increment renders the weapon totally ineffective. It may be possible (GM’s discretion) to hit multiple opponents with Scatter (see Scatterfire in the Combat chapter). Voids made against attacks with Scatter (if they can be made at all, i.e. with Stains of Time) have an additional Activation Cost equal to X."
  },
  "Shield Stick": {
    "quality": "Shield Stick",
    "effect": "If a Fling attempt made by this missile is blocked, or if it hits an area protected by a shield’s passive AV, it becomes ‘stuck’ in the shield. The shield’s Block TN is increased by 2, and its Weight is increased by 2 as well. Removing the missile is very difficult, requiring several minutes of work that cannot be done in combat."
  },
  "Shock [X]": {
    "quality": "Shock [X]",
    "effect": "Successful hit inflicts Stun equal to X."
  },
  "Winged [X]": {
    "quality": "Winged [X]",
    "effect": "When this weapon hits, it inflicts 1 bonus damage per X BS scored. This damage is not inflicted if the missile hits Hard armor."
  }
};
