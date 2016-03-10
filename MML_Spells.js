MML.Spells["Blind"] = { 
	school: "Abrogation",
	components : ["spoken", "physical"],
	actions : 2,
	difficulty : 35,
	baseEP : 28,
	range: 0,
	description: "",
	effect: function blind(charName){
		//blind
	}
};

MML.Spells["Hail of Stones"] = { 
	school: "Earth", 
	components : ["spoken", "physical"],
	actions : 2,
	difficulty : 35,
	baseEP : 30,
	range : 75,
	description: "",
	effect: function hailOfStones(charName){
		//MML.AoEAttack(10);
	}
};

//Element:Air
MML.Spells["Breathe Without Air"] = { 
	school: "Air",
	components : ["spoken"],
	actions : 1,
	difficulty : 35,
	baseEP : 25,
	range : 0,
	description: "This spell allows the caster to breathe normally in environments that may be low on oxygen, filled with smoke, etc.. If the caster makes a willpower roll with a +4 modifier, he will be able to remain underwater for the duration of the spell.",
	effect: function breathe(charName){
		//breathe
	}
};

MML.Spells["Call or Calm Winds"] = { 
	school: "Air",
	components : ["spoken", "physical"],
	actions : 3,
	difficulty : 35,
	baseEP : 20,
	range : 30,
	description: "This spell allows the Elementalist to increase or reduce the local wind speed by up to 15 MPH. The effect extends to a 30’ diameter circle, centered on the caster. Beyond this, the wind speed gradually changes to the ambient condition.",
	effect: function callCalmWinds(charName){
			//MML.AoESelf(30)
	}
};

MML.Spells["Clear the Air"] = { 
	school: "Air",
	components : ["spoken", "physical"],
	actions : 2,
	difficulty : 55,
	baseEP : 16,
	range : 25,
	description: "This spell will remove all dust, smoke and concentrated toxins from the air in a volume of about 300 cubic yards (that is a volume equivalent to a 20’x20’x20’cube). The spell will not prevent new contaminates from entering the area, so it is best used in enclosed spaces; i.e. this spell would be useless in a dust storm.",
	effect: function clearAir(charName){
			//MML.AoESelf()
	}
};

MML.Spells["Dart"] = { 
	school: "Air",
	components : ["spoken", "physical", "substantive"],
	actions : 1,
	difficulty : 55,
	baseEP : 14,
	range : 100,
	description: "This spell requires a small hand dart. As the spell is cast, the dart is hurled from the caster’s hand and is magically sped to its target. If the spell is successfully cast, this dart will strike the caster’s intended target. The dart is propelled with such speed that it is virtually impossible to dodge. For dodge attempts, the dart counts as if it were launched from mechanical missile weapon; see paragraph 05.09.14 “Defending Against Missile and Thrown Weapons (Ducking and Dodging)” for details. The dart inflicts 3d6 of piercing damage upon a successful strike.",
	effect: function dart(charName){
			//MML.missleAttack(charName)
	}
};

MML.Spells["Deflect Missiles"] = { 
	school: "Air",
	components : ["spoken", "physical"],
	actions : 1,
	difficulty : 55,
	baseEP : 18,
	range : 5,
	duration: "2d20 minutes", 
	description: "This spell creates a number of small, unpredictable air currents surrounding the caster. The caster and those within 5’ of him will be somewhat harder to hit with all manner of missiles; arrows, darts, spears, etc. While this spell is in effect, all such missile attacks are made with a situational modifier of -20%.",
	effect: function deflectMissiles(charName){
			//MML.AoESelf(5)
	}
};

MML.Spells["Dust Devil"] = { 
	school: "Air",
	components : ["spoken", "physical"],
	actions : 2,
	difficulty : 45,
	baseEP : 25,
	range : <=100,
	duration: "2d20 minutes", 
	description: "This spell calls forth a whirlwind which picks up all loose matter in its path. It sweeps forth originating at the Mystics location and traveling up to 300 feet away at a rate of 50 feet per round. This travel is in a straight line or in conformance with major terrain features that would alter the path (GM’s discretion).  This whirlwind is up to 8’ wide and 15’ tall. All in the dust devil’s path are subject to an attack with a Knockdown equivalent of 40. Those who are knocked down are thrown 2d6 feet in a random direction and suffer 2d6 points of impacts damage at 1d3 randomly located positions. Those who are caught in the whirwind’s path and manage to stand upright may not take an action for the rest of the round in which they are struck and suffer an initiative modifier of -10 in the following round.",
	effect: function dustDevil(charName){
		//MML.missleAttack(<=100)
	}
};

MML.Spells["Gust of Wind"] = { 
	school: "Air",
	components : ["spoken", "physical"],
	actions : 1,
	difficulty : 55,
	baseEP : 10,
	range : 30,
	duration: "1 round", 
	description: "This spell creates a strong gust of wind that emanates in front of the caster and travels to a distance of 30 feet. This gust gradually decreases in strength as it moves away from the caster. The area affected increases from several feet across as the gust starts near the caster and increases to approximately 15 feet wide when the gust reaches the maximum range of 30 feet. The initial gust is strong enough to knock over unstable objects or to lift loose dirt from the ground. Those caught in the gust’s path are subject to a buffet with a Knockdown value of 15.",
	effect: function gustOfWind(charName){
		//MML.coneAttack(30,)
	}
};
