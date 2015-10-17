state.MML.Combat = state.MML.Combat || { inCombat: false, currentRound: 0, roundStarted: false, tokens: [], turnInfo: {} };



// Action Functions
MML.actionHandler = function actionHandler(charName){
	switch(state.MML.GM.characters[charName].action.name){
        case "attack":
			MML.attackAction(charName);
            break;
		case "ready":
			MML.readyItemAction(charName);
			break;
		case "cast":
			MML.castSpellAction(charName);
			break;
		case "observe":
			MML.observeAction(charName);
			break;
	}
};

MML.AttackActionSteps = function AttackActionSteps(){
	this.actionSteps = {
		movement
		getAttackRoll: MML.getAttackRoll,
		getDefenseRoll: MML.getDefenseRoll,
		getHitPositionRoll: MML.getHitPositionRoll,
		getWeaponDamageRoll: MML.getWeaponDamageRoll,
		getKnockdownRoll: MML.getKnockdownRoll,
		getSensitiveAreaRoll: MML.getSensitiveAreaRoll,
		getWoundRoll: MML.getWoundRoll,
		getMultiWoundRoll: MML.getMultiWoundRoll
	};

	this.rollIndex = "getAttackRoll";
};

MML.AttackRolls = function AttackAction(){
	this.actionRolls = {
		getAttackRoll: MML.getAttackRoll,
		getDefenseRoll: MML.getDefenseRoll,
		getHitPositionRoll: MML.getHitPositionRoll,
		getWeaponDamageRoll: MML.getWeaponDamageRoll,
		getKnockdownRoll: MML.getKnockdownRoll,
		getSensitiveAreaRoll: MML.getSensitiveAreaRoll,
		getWoundRoll: MML.getWoundRoll,
		getMultiWoundRoll: MML.getMultiWoundRoll
	};

	this.rollIndex = "getAttackRoll";
};

MML.getAttackRoll = function getAttackRoll(input){
	switch(input){
		case "entry":
			this.displayMenu(this.characters[this.actor].name + "'s turn.", ["Roll to Hit"]);
		break;
		case "Roll to Hit":
			this.currentRoll = this.characters[this.actor].attackRoll();
			this.displayRoll();
		break;
		case "result":
			this.rolls.attack = this.currentRoll.result;
			if(this.rolls.attack === "Critical Success" || this.rolls.attack === "Success"){
				this.rollIndex = "getDefenseRoll";
			}
			else{
				this.rollIndex = "end";
			}
			this.menu = MML.performAction;
			this.menu();
		break;
	}
};

MML.getDefenseRoll = function getDefenseRoll(input){
	switch(input){
		case "entry":
			this.characters[this.currentTarget].setReady(false);
			this.characters[this.currentTarget].menu = MML.meleeDefenseMenu;
			this.characters[this.currentTarget].menu("entry");
			this.displayMenu("Wait for " + this.characters[this.currentTarget].name + " to choose a defense.", ["Roll to Defend"]);
		break;
		case "Roll to Defend":
			if(this.checkReady()){
				this.currentRoll = this.characters[this.currentTarget].defenseRoll();
				this.displayRoll();
			}
		break;
		case "result":
			this.rolls.defense = this.currentRoll.result;
			this.characters[this.currentTarget].fatigue.inMelee = true;
			if(this.rolls.defense === "Critical Success" || this.rolls.defense === "Success"){
				//for trading actions for defenses add an option in the defense roll and check it here
				this.rollIndex = "end";
			}
			else{
				this.rollIndex = "getHitPositionRoll";

			}
			this.menu = MML.performAction;
			this.menu();
		break;
		default:
		break;
	}	
};

MML.getHitPositionRoll = function getHitPositionRoll(input){
	switch(input){
		case "entry":
			this.displayMenu(this.characters[this.actor].name, ["Roll Hit Position"]);
		break;
		case "Roll Hit Position":
			this.currentRoll = this.characters[this.actor].hitPositionRoll();
			this.displayRoll();
		break;
		case "result":
			this.rolls.hitPosition = this.currentRoll.value;
			this.rollIndex = "getWeaponDamageRoll";
			this.menu = MML.performAction;
			this.menu();
		break;
		default:
		break;
	}
};

MML.getWeaponDamageRoll = function getWeaponDamageRoll(input){
	switch(input){
		case "entry":
			this.displayMenu(this.characters[this.actor].name, ["Roll Damage"]);
		break;
		case "Roll Damage":
			this.currentRoll = this.characters[this.actor].weaponDamageRoll();
			this.displayRoll();
		break;
		case "result": 
			this.rolls.damage = this.currentRoll;
			this.rollIndex = "getKnockdownRoll";
			this.menu = MML.performAction;
			this.menu();
		break;
		default:
		break;
	}
};

MML.getKnockdownRoll = function getKnockdownRoll(input){
	switch(input){
		case "entry":
			if(this.characters[this.currentTarget].checkKnockdown()){
				this.displayMenu(this.characters[this.currentTarget].name, ["Roll Knockdown"]);
			}
			else{
				this.rollIndex = "getSensitiveAreaRoll";
				this.menu = MML.performAction;
				this.menu();
			}
		break;
		case "Roll Knockdown":
			this.currentRoll = this.characters[this.currentTarget].knockdownRoll();
			this.displayRoll();
		break;
		case "result":
			this.rolls.knockdown = this.currentRoll.result;
			if(this.rolls.knockdown === "Critical Success" || this.rolls.knockdown === "Success"){
				this.stumble = 1;
			}			
			else{
				sendChat("Game", this.characters[this.currentTarget].name + " is knocked to the ground");
				this.characters[this.currentTarget].currentMotion = "prone";
				this.characters[this.currentTarget].knockdown.current = this.characters[this.currentTarget].knockdown.max;
			}
			this.rollIndex = "getSensitiveAreaRoll";
			this.menu = MML.performAction;
			this.menu();
		break;
		default:
		break;
	}
};

MML.getSensitiveAreaRoll = function getSensitiveAreaRoll(input){
	switch(input){
		case "entry":
			if(this.characters[this.currentTarget].isSensitiveArea(this.rolls.hitPosition)){
				this.displayMenu(this.characters[this.currentTarget].name + " was hit in a sensitive area.", ["Sensitive Area Roll"]);
			}
			else{
				this.rollIndex = "getWoundRoll";
				this.menu = MML.performAction;
				this.menu();
			}
		break;
		case "Sensitive Area Roll":
			this.currentRoll = this.characters[this.currentTarget].sensitiveAreaRoll();
			this.displayRoll();
		break;
		case "result":
			this.rolls.sensitiveArea = this.currentRoll.result;
			if(this.rolls.sensitiveArea !== "Critical Success" || this.rolls.sensitiveArea !== "Success"){
				sendChat("", this.characters[this.currentTarget].name + " is in pain!");
				this.characters[this.currentTarget].sensitive = 1;
			}	
			this.rollIndex = "getWoundRoll";
			this.menu = MML.performAction;
			this.menu();
		break;
		default:
		break;
	}
};

//
MML.getMultiWoundRoll = function getMultiWoundRoll(input){
	switch(input){
		case "entry":
			this.rolls.multiWound = this.characters[this.currentTarget].setMultiWound();
			if(this.rolls.multiWound.type === "none"){
				this.rollIndex = "end";
				this.menu = MML.performAction;
				this.menu();
			}
			else{
				this.displayMenu(this.characters[this.currentTarget].name + " suffers wound fatigue.", ["Multiple Wounds Roll"]);
			}
		break;
		case "Multiple Wounds Roll":
			this.currentRoll = this.currentTarget.attributeCheckRoll("systemStrength", [0]);
			this.displayRoll();
		break;
		case "result":
			this.rolls.multiWound.result = this.currentRoll.result;
			
			if(this.rolls.multiWound.result === "Success" || this.rolls.multiWound.result === "Critical Success"){
				//this.characters[this.currentTarget].statusEffects.push(MML.woundFatigue);
				this.characters[this.currentTarget].multiWound.wound = true;
			}

			this.rollIndex = "end";
			this.menu = MML.performAction;
			this.menu();
		break;
		default:
		break;
	}
};

MML.getWoundRoll = function getWoundRoll(input){
	switch(input){
		case "entry":
			this.rolls.wound = this.characters[this.currentTarget].alterHP(this.rolls.hitPosition, this.rolls.damage.value, this.rolls.damage.type);
			if(this.rolls.wound.type === "none"){
				this.rollIndex = "getMultiWoundRoll";
				this.menu = MML.performAction;
				this.menu();
			}
			else{
				this.displayMenu(this.characters[this.currentTarget].name + " suffered a " + this.rolls.wound.type + " wound.", ["Wound Roll"]);
			}
		break;
		case "Wound Roll":
			this.currentRoll = this.characters[this.currentTarget].woundRoll(this.rolls.wound);
			this.displayRoll();
		break;
		case "result":
			this.rolls.wound = this.currentRoll;
			switch(this.rolls.wound.type){
				case "major":
					if(this.rolls.wound.result === "Failure"){
						this.characters[this.currentTarget][this.rolls.wound.bodyPart].wound.major.duration += this.rolls.wound.duration;
					}
				break;
				case "disabling":
					this.characters[this.currentTarget][this.rolls.wound.bodyPart].wound.disabling = true;
					
					if(this.rolls.wound.result === "Failure" ){
						this.characters[this.currentTarget].stun.duration += this.rolls.wound.duration;
					}
				break;
				case "mortal":
					this.characters[this.currentTarget][this.rolls.wound.bodyPart].wound.mortal = true;
				break;
			}
			this.rollIndex = "getMultiWoundRoll";
			this.menu = MML.performAction;
			this.menu();
		break;
		default:
		break;
	}
};


//Give weapons functions and set character's getAttackRoll equal to it
MML.attackRoll = function attackRoll(){
	var roll;
	
	if (this.inventory.weapons.length === 0){
		roll = this.unarmedAttack();
	}
	else if (this.inventory.weapons[0].family === "MWD" || this.inventory.weapons[0].family === "MWM"){
		roll = this.missileAttack();
	}
	else if(this.inventory.weapons[0].family === "TWH" || 
	this.inventory.weapons[0].family === "TWK" ||
	this.inventory.weapons[0].family === "TWS" ||
	this.inventory.weapons[0].family === "SLI"){
		roll = this.thrownAttack();
	}
	else if(this.inventory.weapons.length === 2){
		roll = this.dualWieldAttack();
	}
	else {
		roll = this.meleeAttack();
	}
	this.fatigue.inMelee = true;

	return roll;
};

MML.weaponDamageRoll = function weaponDamageRoll(crit){
    var weapon = this.inventory.weapons[0];
    var weaponDamage;
	var damageType;
	var bonusDamage = 0; // Strength, weapon, and other bonuses
	var roll;
	
	if (this.inventory.weapons.length === 0){
		log("unarmed");//unarmed damage
	}
	else if (this.inventory.weapons[0].family === "MWD" || this.inventory.weapons[0].family === "MWM"){
		log("missile");//missile damage
	}
	else if(this.inventory.weapons[0].family === "TWH" || 
	this.inventory.weapons[0].family === "TWK" ||
	this.inventory.weapons[0].family === "TWS" ||
	this.inventory.weapons[0].family === "SLI" ){
		log("thrown"); //thrown damage
	}
	else if(this.inventory.weapons.length === 2){
		log("dual"); //dual wield damage
	}
	else {//Melee Damage
		//Primary or secondary attack
		if (this.action.damageType === "primary"){
			weaponDamage = weapon.primaryDamage;
			damageType = weapon.primaryType;
		}
		else {
			weaponDamage = weapon.secondaryDamage;
			damageType = weapon.secondaryType;
		}
	}
	roll = MML.rollDamage(weaponDamage, [bonusDamage], crit, damageType);
	return roll;
};


// Todo: Add sweep attack
MML.meleeAttack = function meleeAttack(){ 
    this.currentWeapon = this.inventory.weapons[0];
    var weapon = this.currentWeapon;
    var skill = this.action.skill;
	var attackMod = this.modifiers.attack;
	var sitMod = this.modifiers.situational;
	
	var roll;
    //Primary or secondary attack
	if (this.action.damageType === "primary"){
		roll = this.universalRoll([weapon.primaryTask, skill, sitMod, attackMod]);
	}
	else {
		roll = this.universalRoll([weapon.secondaryTask, skill, sitMod, attackMod]);
	}
	
	return roll;
};
// Check if missle weapon and maybe magic
MML.defenseRoll = function defenseRoll(){
	var roll = {};
	var weapon = this.inventory.weapons[0];
    var weaponSkill = Math.round(this.skills[weapon.name].value/2);
	var shieldMod = this.inventory.shield.defenseMod;
	var dodgeSkill = this.skills.dodge.value;
	var defaultMartialSkill = this.skills.defaultMartial.value;
	var defenseMod = this.modifiers.defense;
    var sitMod = this.modifiers.situational;
	var dodgeChance;
	var blockChance;
	
	if(weaponSkill >= defaultMartialSkill){
		blockChance = weapon.defense + weaponSkill + sitMod + defenseMod + shieldMod;
	}
	else{
		blockChance = weapon.defense + defaultMartialSkill + sitMod + defenseMod + shieldMod;
	}
	
	if(dodgeSkill >= defaultMartialSkill){
		dodgeChance = dodgeSkill + sitMod + defenseMod;
	}
	else{
		dodgeChance = defaultMartialSkill + sitMod + defenseMod;
	}

	switch(this.defense.style){
		case "Block":
			this.defense.number++;
			roll = this.universalRoll([blockChance]);
		break;
		case "Dodge":
			this.defense.number++;
			this.defense.dodge = true;
			roll = this.universalRoll([dodgeChance]);
		break;
		case "Take It":
			roll = {value: 100, player: this.player, result: "Failure", target: 1};
		break;
		default:
		break;
	}

	return roll;
};

MML.missileAttack = function missileAttack(){
	var weapon = this.inventory.weapons[0];
	var skill = this.action.skill;
	var attackMod = this.modifiers.attack;
	var attackerSitMod = this.modifiers.situational;
	// var range = MML.getDistanceBetweenChars(this.name, this.);
	var task;
	//var damageDice;
	
	// Get task and damage from range
	if ( range <= attackerWeapon.range.pointBlank.range ){
		task = attackerWeapon.range.pointBlank.task;
		//damageDice = attackerWeapon.range.pointBlank.damage;
	}
	else if ( range <= attackerWeapon.range.effective.range ){
		task = attackerWeapon.range.effective.task;
		//damageDice = attackerWeapon.range.effective.damage;
	}
	else if ( range <= attackerWeapon.range.long.range ){
		task = attackerWeapon.range.long.task;
		//damageDice = attackerWeapon.range.long.damage;
	}
	else {
		task = attackerWeapon.range.extreme.task;
		//damageDice = attackerWeapon.range.extreme.damage;
	}
	
	// // Determine dodge or shield
	// if (defenderDodgeSkill > (defaultMartialSkill + shieldDefenseMod)){
		// defenderSkill = defenderDodgeSkill;
	// }
	// else {
		// defenderSkill = defaultMartialSkill + shieldDefenseMod;
	// }

	//var position = MML.rollHitPosition(state.MML.GM.characters[charName].action.elevation, defender, target);
	state.MML.Combat.turnInfo.currentRoll = this.universalRoll([task, skill, attackerSitMod, attackMod]);

};

MML.unarmedAttack = function unarmedAttack(charName){};

MML.readyItemAction = function readyItemAction(charName){};

MML.castSpellAction = function castSpellAction(charName){};

MML.observeAction = function observeAction(charName){};
