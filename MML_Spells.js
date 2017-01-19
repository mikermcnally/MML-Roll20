MML.spells = {};
MML.spells["Flame Bolt"] = {
  name: "Flame Bolt",
  family: "Fire",
  components: ["Spoken"],
  actions: 1,
  task: 45,
  ep: 20,
  range: 0,
  duration: 0,
  target: [15, 1],
  targetSizeMatters: false,
  metaMagic: ["Increase Potency", "Increase Dimension"],
  process: function () {

  }
};
MML.spells["Dart"] = {
  name: "Dart",
  family: "Air",
  components: ["Spoken", "Physical", "Substantive"],
  actions: 1,
  task: 55,
  ep: 14,
  range: 100,
  duration: 0,
  target: "Single",
  targetSizeMatters: false,
  metaMagic: ["Increase Range", "Increase Potency", "Increase Targets", "Called Shot", "Called Shot Specific"],
  process: function () {
    var currentAction = state.MML.GM.currentAction;
    var character = currentAction.character;
    var parameters = currentAction.parameters;
    var casterSkill = parameters.casterSkill;
    var spell = parameters.spell;
    var target = parameters.target;
    var range = parameters.range;
    var epCost = parameters.epCost;
    var epModified = parameters.epModified;
    var metaMagic = parameters.metaMagic;
    var rolls = currentAction.rolls;

    if (_.isUndefined(rolls.attackRoll)) {
      MML.castingRoll("castingRoll", character, spell.task, casterSkill, _.reduce(_.pluck(metaMagic, "castingMod"), function(memo, num){ return memo + num; }));
    } else if (_.isUndefined(rolls.defenseRoll)) {
      if (rolls.attackRoll === "Critical Success" || rolls.attackRoll === "Success") {
        MML.rangedDefense(target, {family: "MWM"}, range);
      } else if (rolls.attackRoll === "Critical Failure") {
        MML.endAction();
      } else {
        MML.endAction();
      }
    } else if (_.isUndefined(rolls.hitPositionRoll)) {
      if (rolls.defenseRoll === "Critical Success") {
        MML.processCommand({
          type: "character",
          who: target.name,
          callback: "criticalDefense",
          input: {}
        });
      } else if (rolls.defenseRoll === "Success") {
        MML.endAction();
      } else {
        MML.hitPositionRoll(character);
      }
    } else if (_.isUndefined(rolls.damageRoll)) {
      if (rolls.attackRoll === "Critical Success") {
        MML.missileDamageRoll(character, {damageType: "Pierce", damage: _.has(metaMagic, "Increase Potency") ? (3*metaMagic["Increase Potency"].level) + "d6" : "3d6"}, true);
      } else {
        MML.missileDamageRoll(character, {damageType: "Pierce", damage: _.has(metaMagic, "Increase Potency") ? (3*metaMagic["Increase Potency"].level) + "d6" : "3d6"}, false);
      }
    } else if (epModified !== true) {
      state.MML.GM.currentAction.parameters.epModified = true;
      MML.processCommand({
        type: "character",
        who: character.name,
        callback: "alterEP",
        input: {
          epAmount: -1 * epCost * _.reduce(_.pluck(metaMagic, "epMod"), function(memo, num){ return memo * num; })
        }
      });
    } else {
      if (_.isUndefined(state.MML.GM.currentAction.targetArray[state.MML.GM.currentAction.targetIndex + 1])) {
        MML.damageTargetAction("endAction");
      } else {
        MML.damageTargetAction("nextTarget");
      }
    }
  }
};
