MML.initializeMenu = async function initializeMenu(player) {
  try {
    await MML.setMenuButtons(player, ['initializeMenu']);
    console.log("SHOW ME WHAT YOU GOT");
    if (player.name === state.MML.GM.name) {
      return MML.menuMainGm(player);
    } else {
      return MML.menuMainPlayer(player);
    }
  } catch (err) {
    log(err);
  }
};

MML.menuMainGm = async function menuMainGm(player) {
  const {pressedButton} = await MML.goToMenu(player, 'Main Menu: ', ['Combat', 'Roll Dice'])
  switch (pressedButton) {
    case 'Combat':
      return MML.menuGmCombat(player);
    case 'Roll Dice':
      return MML.menuselectDieSize(player);
  }
};

MML.menuGmCombat = async function menuGmCombat(player) {
  const message = 'Select tokens and begin.';
  const buttons = ['Start Combat', 'Back'];

  const {pressedButton} = await MML.goToMenu(player, message, buttons);
  switch (pressedButton) {
    case 'Start Combat':
      return MML.startCombat(player);
    case 'Back':
      return MML.menuMainGm(player);
  }
};

MML.menuPrepareAction = function menuPrepareAction(player, character, action) {
  return {
    message: 'Prepare ' + character.name + '\'s action',
    buttons: function() {
      var buttons = ['Movement Only', 'Observe', 'Ready Item', 'Attack'];

      if (!_.isUndefined(action.weapon) && MML.isRangedWeapon(action.weapon)) {
        if (action.weapon.family !== 'MWM' || action.weapon.loaded === action.weapon.reload) {
          buttons.push('Aim');
        } else {
          buttons.push('Reload');
        }
      }

      if ((_.has(character.statusEffects, 'Holding') ||
        (_.has(character.statusEffects, 'Grappled') && character.statusEffects['Grappled'].targets.length === 1)) &&
        !_.has(character.statusEffects, 'Held') &&
        !_.contains(action.modifiers, 'Release Opponent')
      ) {
        buttons.push('Release Opponent');
      }

      if (character.spells.length > 0) {
        buttons.push('Cast');
      }

      if (!_.isUndefined(character.previousAction.spell) && character.previousAction.spell.actions > 0) {
        buttons.push('Continue Casting');
      }
      return buttons;
    }()
  };
};

MML.menuchooseAttackType = function menuchooseAttackType(player, character, action) {
  return {
    message: 'Attack Menu',
    buttons: function() {
      var buttons = [];
      var weapon = action.weapon;
      var notSomeKindOfGrappled = _.isEmpty(_.intersection(_.keys(character.statusEffects),
        ['Grappled',
        'Held',
        'Taken Down',
        'Pinned',
        'Overborne']));

      if (weapon !== 'unarmed' &&
        (weapon.family !== 'MWM' || weapon.loaded === weapon.reload) &&
        (notSomeKindOfGrappled || (!MML.isRangedWeapon(weapon) && weapon.rank < 2))
      ) {
        buttons.push('Standard');
        if (MML.isRangedWeapon(weapon)) {
          buttons.push('Shoot From Cover');
        // } else {
        //   buttons.push('Sweep Attack');
        }
      }

      buttons.push('Punch');
      buttons.push('Kick');
      if (!_.contains(action.modifiers, 'Release Opponent')) {
        if (!MML.hasStatusEffects(character, ['Grappled', 'Holding', 'Held', 'Taken Down', 'Pinned', 'Overborne'])) {
          buttons.push('Grapple');
        }
        if ((MML.hasStatusEffects(character, ['Grappled', 'Holding', 'Held']) && character.movementType === 'Prone') ||
          (MML.hasStatusEffects(character, ['Taken Down', 'Overborne']) && !_.has(character.statusEffects, 'Pinned'))
        ) {
          buttons.push('Regain Feet');
        }
        if (!MML.hasStatusEffects(character, ['Holding', 'Held', 'Pinned']) &&
          (!_.has(character.statusEffects, 'Grappled') || character.statusEffects['Grappled'].targets.length === 1)
        ) {
          buttons.push('Place a Hold');
        }
        if (MML.hasStatusEffects(character, ['Held', 'Pinned'])) {
          buttons.push('Break a Hold');
        }
        if ((_.has(character.statusEffects, 'Grappled')) && !MML.hasStatusEffects(character, ['Held', 'Pinned'])) {
          buttons.push('Break Grapple');
        }
        if ((_.has(character.statusEffects, 'Holding') ||
            (_.has(character.statusEffects, 'Grappled') && character.statusEffects['Grappled'].targets.length === 1) ||
            (_.has(character.statusEffects, 'Held') && character.statusEffects['Held'].targets.length === 1)) &&
          !(_.has(character.statusEffects, 'Grappled') && _.has(character.statusEffects, 'Held')) &&
          character.movementType !== 'Prone'
        ) {
          buttons.push('Takedown');
        }
        if (MML.hasStatusEffects(character, ['Grappled', 'Holding', 'Held', 'Taken Down', 'Pinned', 'Overborne'])) {
          if (_.has(character.statusEffects, 'Held') && _.filter(character.statusEffects['Held'].targets, function(target) {
              return target.bodyPart === 'Head';
            }).length === 0) {
            buttons.push('Head Butt');
          }
          buttons.push('Bite');
        }
      }
      return buttons;
    }()
  };
};

MML.menuChooseMeleeDefense = function menuChooseMeleeDefense(character, dodgeMods, blockMods, attackerWeapon) {
  var message = 'How will ' + character.name + ' defend?';
  var buttons = ['Dodge: ' + MML.sumModifiers(dodgeMods) + '%', 'Take it'];
  if (!MML.isUnarmed(character) || attackerWeapon.family === "Unarmed") {
    buttons.unshift('Block: ' + MML.sumModifiers(blockMods) + '%');
  }
  return {
    message: message,
    buttons: buttons
  };
};

MML.menuassignStatusEffect = function menuassignStatusEffect(player, character) {
  var message = 'Choose a Status Effect: ';
  var buttons = [];

  _.each(MML.statusEffects, function(effect, effectName) {
    buttons.push(effectName);
  });
  return {message: message, buttons: buttons};
};

MML.menuchooseSpell = function menuchooseSpell(player, character, action) {
  var message = 'Choose a spell';
  var buttons = [];
  _.each(character.spells, function(spellName) {
    if (_.isUndefined(MML.spells[spellName].requiredItem) ||
      (_.isUndefined(action.items) &&
        (character.inventory[character.rightHand._id].name === MML.spells[spellName].requiredItem || character.inventory[character.leftHand._id].name === MML.spells[spellName].requiredItem)) ||
      (!_.isUndefined(action.items) &&
        _.filter(action.items, function(item) {
          return character.inventory[item.itemId].name === MML.spells[spellName].requiredItem;
        }, character).length > 0)
    ) {
      buttons.push(spellName);
    }
  });
  return {message: message, buttons: buttons};
};

MML.menuchooseMetaMagicInitiative = function menuchooseMetaMagicInitiative(player, character, action) {
  var message = 'Choose meta magic';
  var buttons = ['Next Menu'];

  if (_.contains(action.spell.metaMagic, 'Called Shot')) {
    if (_.contains(action.modifiers, 'Called Shot')) {
      buttons.push('Remove Called Shot');
    } else {
      buttons.push('Called Shot');
    }

    if (_.contains(action.modifiers, 'Called Shot Specific')) {
      buttons.push('Remove Called Shot Specific');
    } else {
      buttons.push('Called Shot Specific');
    }
  }

  if (_.contains(action.modifiers, 'Ease Spell')) {
    buttons.push('Remove Ease Spell');
  } else {
    buttons.push('Ease Spell');
  }

  if (_.contains(action.modifiers, 'Ease Spell')) {
    buttons.push('Remove Hasten Spell');
  } else {
    buttons.push('Hasten Spell');
  }
  return {message: message, buttons: buttons};
};

MML.menuchooseMetaMagic = function menuchooseMetaMagic(action) {
  var message = 'Choose meta magic';
  var buttons = ['Cast Spell'];

  _.each(_.without(action.spell.metaMagic, 'Called Shot', 'Called Shot Specific'), function(metaMagicName) {
    if (_.contains(action.modifiers, metaMagicName)) {
      buttons.push('Remove ' + metaMagicName);
    } else {
      buttons.push(metaMagicName);
    }
  });
  return {message: message, buttons: buttons};
};

MML.menucombatMovement = function menucombatMovement(player, character) {
  var message = 'Move ' + character.name + '.';
  var buttons = ['Prone', 'Stalk', 'Crawl', 'Walk', 'Jog', 'Run', 'End Movement'];
  return {
    message: message,
    buttons: buttons
  };
};

MML.menufinalizeAction = function menufinalizeAction(player, character, action) {
  var message;
  var buttons;
  if (state.MML.GM.roundStarted === true) {
    message = 'Accept or edit action for ' + character.name;
    buttons = [
      'Accept',
      'Edit Action'
    ];
  } else if (_.has(character.statusEffects, 'Stunned')) {
    message = character.name + ' is stunned and can only move. Roll initiative';
    buttons = [
      'Roll'
    ];
  } else {
    message = 'Roll initiative or edit action for ' + character.name;
    buttons = [
      'Roll',
      'Edit Action'
    ];
  }
  return {
    message: message,
    buttons: buttons
  };
};

MML.menustartAction = function menustartAction(player, character, validAction) {
  var message;
  var buttons = ['Movement Only'];
  if (_.has(character.statusEffects, 'Stunned') || _.has(character.statusEffects, 'Dodged This Round')) {
    message = character.name + ' cannot act.';
  } else if (validAction) {
    if (character.initiative - 10 > 0) {
      message = 'Start or change ' + character.name + '\'s action';
      buttons.unshift('Change Action');
      buttons.unshift('Start Action');
    } else {
      message = 'Start ' + character.name + '\'s action';
      buttons.unshift('Start Action');
    }
  } else {
    message = character.name + '\'s action no longer valid.';
    if (character.initiative - 10 > 0) {
      buttons.unshift('Change Action');
    }
  }
  return {
    message: message,
    buttons: buttons
  };
};
