var _ = require('underscore');
var Roll20 = require('Roll20');

MML.test = function test() {
		log("test");

		{
			"charName": "Thaddeus Clinch",
			"triggeredFunction": "setCurrentCharacterTargets",
			"target": "Remmy Denkin",
			"targetArray": ["Remmy Denkin"],
			"attackMod": 13,
			"sitMod": 0,
			"attackerWeapon": {
				"name": "Shovel",
				"type": "weapon",
				"weight": 6,
				"grips": {
					"Two Hands": {
						"family": "Bludgeoning",
						"hands": 2,
						"primaryType": "Impact",
						"primaryTask": 35,
						"primaryDamage": "1d8",
						"secondaryType": "",
						"secondaryTask": 0,
						"secondaryDamage": "",
						"defense": 15,
						"initiative": 4,
						"rank": 1
					}
				},
				"quality": "Standard"
			},
			"attackerGrip": "Two Hands",
			"skill": 26,
			"who": "Thaddeus Clinch",
			"damageType": "primary",
			"mods": [35, 26, 0, 13],
			"rollResultFunction": "attackRollResult",
			"character": "Thaddeus Clinch"
		}
		

		// Menu Macro = !{"type":"player","who":"Robot","triggeredFunction":"menuCommand","input":{"who":"GM","buttonText":"GmMenuMain"}}