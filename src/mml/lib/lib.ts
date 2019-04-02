MML.attackTempoTable = [-25, -22, -18, -16, -14, -12, -11, -10, -9, -9];

MML.weaponRanks = [
	{ low: 0, high: 2 },
	{ low: 2, high: 5 },
	{ low: 5, high: 8 },
	{ low: 8, high: 12 },
	{ low: 12, high: 15 },
	{ low: 15, high: 18 },
	{ low: 18, high: 21 },
	{ low: 21, high: 24 },
];







MML.raceSizes = {};
MML.raceSizes["Human"] = { size: "Medium", radius: 1 };
MML.raceSizes["Dwarf"] = { size: "Medium", radius: 1 };
MML.raceSizes["Gnome"] = { size: "Medium", radius: 1 };
MML.raceSizes["Hobbit"] = { size: "Medium", radius: 0.75 };
MML.raceSizes["Gray Elf"] = { size: "Medium", radius: 1 };
MML.raceSizes["Wood Elf"] = { size: "Medium", radius: 1 };



MML.meleeDamageMods = [
	{ low: 0, high: 19, value: -7 },
	{ low: 20, high: 24, value: -6 },
	{ low: 25, high: 29, value: -5 },
	{ low: 30, high: 34, value: -4 },
	{ low: 35, high: 39, value: -3 },
	{ low: 40, high: 44, value: -2 },
	{ low: 45, high: 54, value: -1 },
	{ low: 55, high: 64, value: 0 },
	{ low: 65, high: 74, value: 1 },
	{ low: 75, high: 90, value: 2 },
	{ low: 91, high: 105, value: 3 },
	{ low: 106, high: 120, value: 4 },
	{ low: 121, high: 999, value: 5 },
];

MML.unarmedAttacks = {};
MML.unarmedAttacks["Grapple"] = { name: "Grapple", family: "Unarmed", initiative: 10, task: 35, defenseMod: 35, damage: "None", damageType: "None" };
MML.unarmedAttacks["Takedown"] = { name: "Takedown", family: "Unarmed", initiative: 10, task: 15, defenseMod: 25, damage: "None", damageType: "None" };
MML.unarmedAttacks["Place a Hold, Head, Arm, Leg"] = { name: "Place a Hold, Head, Arm, Leg", family: "Unarmed", initiative: 10, task: 0, defenseMod: 15, damage: "None", damageType: "None" };
MML.unarmedAttacks["Place a Hold, Chest, Abdomen"] = { name: "Place a Hold, Chest, Abdomen", family: "Unarmed", initiative: 10, task: 15, defenseMod: 25, damage: "None", damageType: "None" };
MML.unarmedAttacks["Break a Hold"] = { name: "Break a Hold", family: "Unarmed", initiative: 10, task: 0, defenseMod: 0, damage: "None", damageType: "None" };
MML.unarmedAttacks["Break Grapple"] = { name: "Break Grapple", family: "Unarmed", initiative: 10, task: 15, defenseMod: 25, damage: "None", damageType: "None" };
MML.unarmedAttacks["Regain Feet"] = { name: "Regain Feet", family: "Unarmed", initiative: 10, task: 15, defenseMod: 25, damage: "None", damageType: "None" };
MML.unarmedAttacks["Punch"] = { name: "Punch", family: "Unarmed", initiative: 10, task: 25, defenseMod: 15, damage: "1d4", damageType: "Impact" };
MML.unarmedAttacks["Punch, Padded"] = { name: "Punch, Padded", family: "Unarmed", initiative: 10, task: 25, defenseMod: 15, damage: "1d2", damageType: "Impact" };
MML.unarmedAttacks["Punch, Mail, Studs"] = { name: "Punch, Mail, Studs", family: "Unarmed", initiative: 10, task: 25, defenseMod: 15, damage: "1d6", damageType: "Impact" };
MML.unarmedAttacks["Punch, Plate"] = { name: "Punch, Plate", family: "Unarmed", initiative: 10, task: 25, defenseMod: 15, damage: "1d6", damageType: "Impact" };
MML.unarmedAttacks["Kick"] = { name: "Kick", family: "Unarmed", initiative: 10, task: 15, defenseMod: 15, damage: "1d4", damageType: "Impact" };
MML.unarmedAttacks["Kick, Heavy Boots"] = { name: "Kick, Heavy Boots", family: "Unarmed", initiative: 10, task: 15, defenseMod: 15, damage: "1d6", damageType: "Impact" };
MML.unarmedAttacks["Kick, Plate"] = { name: "Kick, Plate", family: "Unarmed", initiative: 10, task: 15, defenseMod: 15, damage: "1d8", damageType: "Impact" };
MML.unarmedAttacks["Head Butt"] = { name: "Head Butt", family: "Unarmed", initiative: 10, task: 25, defenseMod: 0, damage: "1d6", damageType: "Impact" };
MML.unarmedAttacks["Bite"] = { name: "Bite", family: "Unarmed", initiative: 10, task: 25, defenseMod: 15, damage: "1d3", damageType: "Thrust" };

MML.epModifiers = {};
MML.epModifiers["Wizardry"] = {};
MML.epModifiers["Wizardry"][3] = [3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
MML.epModifiers["Wizardry"][5] = [4, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 1];
MML.epModifiers["Wizardry"][10] = [9, 7, 6, 5, 5, 4, 3, 3, 3, 2, 2, 2, 1];
MML.epModifiers["Wizardry"][12] = [11, 9, 7, 6, 5, 5, 4, 4, 3, 3, 2, 2, 2];
MML.epModifiers["Wizardry"][14] = [12, 10, 9, 7, 6, 5, 5, 4, 4, 3, 2, 2, 2];
MML.epModifiers["Wizardry"][15] = [13, 11, 9, 8, 7, 6, 5, 4, 4, 3, 3, 2, 2];
MML.epModifiers["Wizardry"][16] = [14, 12, 10, 8, 7, 6, 5, 5, 4, 3, 3, 3, 2];
MML.epModifiers["Wizardry"][18] = [16, 13, 11, 9, 8, 7, 6, 5, 5, 4, 3, 3, 2];
MML.epModifiers["Wizardry"][20] = [18, 14, 12, 10, 9, 8, 7, 6, 5, 4, 4, 3, 3];
MML.epModifiers["Wizardry"][22] = [19, 16, 13, 11, 10, 9, 7, 6, 6, 5, 4, 4, 3];
MML.epModifiers["Wizardry"][24] = [21, 17, 15, 12, 11, 9, 8, 7, 6, 5, 4, 4, 4];
MML.epModifiers["Wizardry"][25] = [22, 18, 15, 13, 11, 10, 9, 7, 6, 5, 4, 4, 4];
MML.epModifiers["Wizardry"][28] = [25, 20, 17, 15, 13, 11, 10, 8, 7, 6, 5, 5, 4];
MML.epModifiers["Wizardry"][30] = [26, 22, 18, 16, 14, 12, 10, 9, 8, 6, 5, 5, 5];
MML.epModifiers["Wizardry"][33] = [29, 24, 20, 17, 15, 13, 11, 10, 8, 7, 6, 6, 5];
MML.epModifiers["Wizardry"][35] = [31, 25, 21, 18, 16, 14, 12, 10, 9, 7, 6, 6, 5];
MML.epModifiers["Wizardry"][40] = [35, 29, 24, 21, 18, 16, 14, 12, 10, 8, 7, 6, 6];
MML.epModifiers["Elementalism"] = {};
MML.epModifiers["Elementalism"][3] = [3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0];
MML.epModifiers["Elementalism"][5] = [5, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 1, 1];
MML.epModifiers["Elementalism"][10] = [10, 9, 8, 8, 7, 6, 6, 5, 5, 4, 4, 2, 1];
MML.epModifiers["Elementalism"][12] = [11, 11, 10, 9, 8, 8, 7, 6, 6, 5, 4, 2, 1];
MML.epModifiers["Elementalism"][14] = [13, 12, 11, 11, 10, 9, 8, 7, 7, 6, 5, 3, 1];
MML.epModifiers["Elementalism"][15] = [14, 13, 12, 11, 10, 9, 9, 8, 7, 6, 6, 4, 2];
MML.epModifiers["Elementalism"][16] = [15, 14, 13, 12, 11, 10, 9, 8, 7, 7, 6, 4, 3];
MML.epModifiers["Elementalism"][18] = [17, 16, 15, 14, 12, 11, 10, 9, 8, 8, 7, 5, 3];
MML.epModifiers["Elementalism"][20] = [19, 18, 16, 15, 14, 13, 11, 10, 9, 8, 7, 5, 4];
MML.epModifiers["Elementalism"][22] = [21, 19, 18, 17, 15, 14, 13, 11, 10, 9, 8, 6, 4];
MML.epModifiers["Elementalism"][24] = [23, 21, 20, 18, 17, 15, 14, 12, 11, 10, 9, 7, 5];
MML.epModifiers["Elementalism"][25] = [24, 23, 24, 20, 18, 17, 15, 14, 12, 10, 9, 7, 5];
MML.epModifiers["Elementalism"][28] = [27, 25, 23, 21, 19, 18, 16, 15, 13, 12, 10, 8, 6];
MML.epModifiers["Elementalism"][30] = [29, 27, 24, 23, 21, 19, 17, 16, 14, 13, 11, 9, 7];
MML.epModifiers["Elementalism"][33] = [32, 29, 27, 25, 23, 21, 19, 17, 15, 14, 12, 10, 8];
MML.epModifiers["Elementalism"][35] = [33, 31, 29, 26, 24, 22, 20, 18, 16, 15, 13, 11, 9];
MML.epModifiers["Elementalism"][40] = [38, 35, 33, 30, 28, 25, 23, 22, 19, 17, 15, 12, 10];
MML.epModifiers["Symbolism"] = {};
MML.epModifiers["Symbolism"][5] = [5, 5, 4, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2];
MML.epModifiers["Symbolism"][10] = [10, 9, 9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4];
MML.epModifiers["Symbolism"][12] = [12, 11, 10, 10, 9, 9, 8, 7, 7, 6, 5, 5, 4];
MML.epModifiers["Symbolism"][15] = [15, 14, 13, 12, 12, 11, 10, 9, 9, 8, 7, 6, 5];
MML.epModifiers["Symbolism"][18] = [17, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6];
MML.epModifiers["Symbolism"][20] = [19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 7, 6];
MML.epModifiers["Symbolism"][23] = [22, 21, 20, 19, 18, 17, 15, 14, 13, 12, 11, 10, 8];
MML.epModifiers["Symbolism"][25] = [24, 23, 22, 21, 19, 18, 17, 16, 14, 13, 12, 11, 9];
MML.epModifiers["Symbolism"][28] = [27, 26, 24, 23, 22, 20, 19, 17, 16, 15, 13, 12, 11];
MML.epModifiers["Symbolism"][30] = [29, 28, 26, 25, 23, 22, 20, 19, 17, 16, 14, 13, 11];
MML.epModifiers["Target Size"] = {};
MML.epModifiers["Target Size"]["Very Small"] = 0.25;
MML.epModifiers["Target Size"]["Small"] = 0.5;
MML.epModifiers["Target Size"]["Medium"] = 1;
MML.epModifiers["Target Size"]["Large"] = 2;
MML.epModifiers["Target Size"]["Very Large"] = 3;
MML.epModifiers["Target Size"]["Huge"] = 5;
MML.epModifiers["Target Size"]["Massive"] = 8;

MML.metaMagic = {};