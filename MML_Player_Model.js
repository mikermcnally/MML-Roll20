MML.Player = function(name, isGM) {
  this.menuCommand = function(who, buttonText, selectedCharNames) {
    var button = _.findWhere(this.buttons, {
      text: buttonText
    });
    if (!_.isUndefined(button)) {
      this.menu = button.nextMenu;
      this[button.nextMenu](who);
      button.callback.apply(this, [button.text, selectedCharNames]);
    }
  };

  this.displayMenu = function() {
    var toChat = '/w "' + this.name + '" &{template:charMenu} {{name=' + this.message + '}} ';

    _.each(this.buttons, function(button) {
      var noSpace = button.text.replace(/\s+/g, '');
      var command = JSON.stringify({
        type: "player",
        who: this.name,
        input: [this.who, button.text],
        callback: "menuCommand"
      });

      toChat = toChat + '{{' + noSpace + '=[' + button.text + '](!MML|' + MML.hexify(command) + ')}} ';
    }, this);
    sendChat(this.name, toChat, null, {
      noarchive: false
    }); //Change to true this when they fix the bug
  };
  this.displayGmRoll = function() {
    sendChat(this.name, '/w "' + this.name + '" &{template:rollMenuGM} {{title=' + this.currentRoll.message + "}}");
  };
  this.displayPlayerRoll = function() {
    sendChat(this.name, '/w "' + this.name + '" &{template:rollMenu} {{title=' + this.currentRoll.message + "}}");
  };
  this.changeRoll = function(value) {
    var range = this.currentRoll.range.split('-');
    var low = parseInt(range[0]);
    var high = parseInt(range[1]);

    if (value >= low && value <= high) {
      if (this.currentRoll.type === 'damage') {
        this.currentRoll.value = -value;
        this.currentRoll.result = -value;
        this.currentRoll.message = 'Roll: ' + value + '\nRange: ' + this.currentRoll.range;
      } else {
        this.currentRoll.value = value;
        if (this.currentRoll.type === 'universal') {
          this.currentRoll = MML.universalRollResult(this.currentRoll);
        } else if (this.currentRoll.type === 'attribute') {
          this.currentRoll = MML.attributeCheckResult(this.currentRoll);
        } else if (this.currentRoll.type === 'generic') {
          this.currentRoll = MML.genericRollResult(this.currentRoll);
        }
      }
    } else {
      sendChat('Error', 'New roll value out of range.');
    }
    MML.characters[this.currentRoll.character][this.currentRoll.callback]();
  };
  this.setApiPlayerAttribute = function(attribute, value) {
    this[attribute] = value;
  };
  this.newRoundUpdatePlayer = function() {
    this.characterIndex = 0;
    this.who = this.combatants[0];
    this.menu = 'charMenuPrepareAction';
    var character = MML.characters[this.who];

    if (this.combatants.length > 0) {
      if (_.has(character.statusEffects, 'Stunned')) {
        character.applyStatusEffects();
        this.charMenuFinalizeAction(this.who);
      } else if (character.situationalInitBonus !== 'No Combat') {
        this.charMenuPrepareAction(this.who);
        this.displayMenu();
      } else {
        character.setReady(true);
        this.prepareNextCharacter();
      }
    } else if (this.name === state.MML.GM.name) {
      this.GmMenuStartRound('GM');
      this.displayMenu();
    }
  };
  this.prepareNextCharacter = function() {
    this.characterIndex++;
    var character = MML.characters[this.combatants[this.characterIndex]];

    if (this.characterIndex < this.combatants.length) {
      if (_.has(character.statusEffects, 'Stunned')) {
        character.applyStatusEffects();
        this.charMenuFinalizeAction(character.name);
        this.displayMenu();
      } else if (character.situationalInitBonus !== 'No Combat') {
        this.charMenuPrepareAction(character.name);
        this.displayMenu();
      } else {
        character.setReady(true);
        this.prepareNextCharacter();
      }
    } else if (this.name === state.MML.GM.name) {
      this.GmMenuStartRound('GM');
      this.displayMenu();
    } else {
      this.nextMenu = 'menuIdle';
      this.displayMenu();
    }
  };
  this.menuIdle = function(who) {
    this.who = who;
    this.message = 'Menu Closed';
    this.buttons = [];
    if (state.MML.GM.name === this.name && !state.MML.GM.inCombat) {
      this.menu = 'GmMenuMain';
      this.buttons = [this.menuButtons.GmMenuMain];
    }
  };
  this.menuPause = function() {};
  this.GmMenuMain = function(who) {
    this.who = who;
    this.message = 'Main Menu: ';
    this.buttons = [this.menuButtons.combatMenu,
      this.menuButtons.newItemMenu,
      this.menuButtons.worldMenu,
      this.menuButtons.utilitiesMenu
    ];
  };
  this.GmMenuAssignStatusEffect = function(who) {
    this.who = who;
    this.message = 'Choose a Status Effect: ';
    this.buttons = [];

    _.each(MML.statusEffects, function(effect, effectName) {
      this.buttons.push({
        text: effectName,
        nextMenu: 'GmMenuItemQuality',
        callback: function(text) {
          state.MML.GM.newItem = MML.items[text];
          this.displayMenu();
        }
      });
    });
  };

  this.GmMenuCombat = function(who) {
    this.who = who;
    this.message = 'Select tokens and begin.';
    this.buttons = [this.menuButtons.startCombat,
      this.menuButtons.toMainGmMenu,
    ];
  };
  this.GmMenuNewItem = function(who) {
    this.who = who;
    this.message = 'Select item type:';
    this.buttons = [this.menuButtons.newWeapon,
      this.menuButtons.newShield,
      this.menuButtons.newArmor,
      this.menuButtons.newSpellComponent,
      this.menuButtons.newMiscItem,
      this.menuButtons.toMainGmMenu
    ];
  };

  this.GmMenuNewWeapon = function(who) {
    this.who = who;
    this.message = 'Select weapon type:';
    this.buttons = [];

    _.each(MML.items, function(item) {
      if (item.type === 'weapon') {
        this.buttons.push({
          text: item.name,
          nextMenu: 'GmMenuItemQuality',
          callback: function(text) {
            state.MML.GM.newItem = MML.items[text];
            this.displayMenu();
          }
        });
      }
    }, this);
  };
  this.GmMenuNewShield = function(who) {
    this.who = who;
    this.message = 'Select shield type:';
    this.buttons = [];

    _.each(MML.items, function(item) {
      if (item.type === 'shield') {
        this.buttons.push({
          text: item.name,
          nextMenu: 'GmMenuItemQuality',
          callback: function(text) {
            state.MML.GM.newItem = MML.items[text];
            this.displayMenu();
          }
        });
      }
    }, this);
  };
  this.GmMenuNewArmor = function(who) {
    this.who = who;
    this.message = 'Select armor style:';
    this.buttons = [];

    _.each(MML.items, function(item) {
      if (item.type === 'armor') {
        this.buttons.push({
          text: item.name,
          nextMenu: 'GmMenuArmorMaterial',
          callback: function(text) {
            state.MML.GM.newItem = MML.items[text];
            this.displayMenu();
          }
        });
      }
    }, this);
  };
  this.GmMenuArmorMaterial = function(who) {
    this.who = who;
    this.message = 'Select armor material:';
    this.buttons = [];

    _.each(MML.APVList, function(material) {
      this.buttons.push({
        text: material.name,
        nextMenu: 'GmMenuItemQuality',
        callback: function(text) {
          var material = MML.APVList[text];
          state.MML.GM.newItem.material = material.name;
          state.MML.GM.newItem.weight = material.weightPerPosition * state.MML.GM.newItem.totalPostitions;
          state.MML.GM.newItem.name = material.name + ' ' + state.MML.GM.newItem.name;
          this.displayMenu();
        }
      });
    }, this);
  };
  this.GmMenuNewItemProperties = function(who) {
    this.who = who;
    this.message = 'Add new properties:';
    this.buttons = [this.menuButtons.assignNewItem];
  };
  this.GmMenuassignNewItem = function(who) {
    this.who = who;
    this.message = 'Select character:';
    this.buttons = [];

    _.each(MML.characters, function(character) {
      this.buttons.push({
        text: index,
        nextMenu: 'GmMenuMain',
        callback: function() {
          this.displayMenu();
        }
      });
    }, this);
  };
  this.GmMenuItemQuality = function(who) {
    this.who = who;
    this.message = 'Select a quality level:';
    this.buttons = [this.menuButtons.itemQualityPoor,
      this.menuButtons.itemQualityStandard,
      this.menuButtons.itemQualityExcellent,
      this.menuButtons.itemQualityMasterWork
    ];
  };
  this.displayItemOptions = function(who, itemId) {
    var character = MML.characters[who];
    var item = character.inventory[itemId];
    var buttons = [];
    var unequipButton;
    var hands;
    this.menu = 'menuIdle';
    this.message = 'Item Menu';
    this.who = who;

    if (item.type === 'weapon') {
      //Weapon already equipped
      if (character.leftHand._id === itemId || character.rightHand._id === itemId) {
        unequipButton = {
          text: 'Unequip',
          nextMenu: 'menuIdle'
        };

        if (character.leftHand._id === itemId && character.rightHand._id === itemId) {
          unequipButton.callback = function() {
            character.leftHand = { _id: 'emptyHand', grip: 'unarmed' };
            character.rightHand = { _id: 'emptyHand', grip: 'unarmed' };
            this.displayMenu();
          };
        } else if (character.leftHand._id === itemId) {
          unequipButton.callback = function() {
            character.leftHand = { _id: 'emptyHand', grip: 'unarmed' };
            this.displayMenu();
          };
        } else {
          unequipButton.callback = function() {
            character.rightHand = { _id: 'emptyHand', grip: 'unarmed' };
            this.displayMenu();
          };
        }
        buttons.push(unequipButton);
      } else {
        _.each(item.grips, function(grip, gripName) {
          if (gripName === 'One Hand') {
            buttons.push({
              text: 'Equip Left Hand',
              nextMenu: 'menuIdle',
              callback: function(text) {
                character.leftHand = { _id: itemId, grip: gripName };
                this.displayMenu();
              }
            });
            buttons.push({
              text: 'Equip Right Hand',
              nextMenu: 'menuIdle',
              callback: function(text) {
                character.rightHand = { _id: itemId, grip: gripName };
                this.displayMenu();
              }
            });
          } else {
            buttons.push({
              text: 'Equip ' + gripName,
              nextMenu: 'menuIdle',
              callback: function(text) {
                character.leftHand = { _id: itemId, grip: gripName };
                character.rightHand = { _id: itemId, grip: gripName };
                this.displayMenu();
              }
            });
          }
        });
      }
    } else if (item.type === 'armor') {
      log(item.type);
    } else if (item.type === 'shield') {
      buttons.push({
        text: 'Equip Left Hand',
        nextMenu: 'menuIdle',
        callback: function(text) {
          character.leftHand = { _id: itemId, grip: 'One Hand' };
          this.displayMenu();
        }
      });
      buttons.push({
        text: 'Equip Right Hand',
        nextMenu: 'menuIdle',
        callback: function(text) {
          character.rightHand = { _id: itemId, grip: 'One Hand' };
          this.displayMenu();
        }
      });
    } else if (item.type === 'spellComponent') {
      log(item.type);
    } else {
      log(item.type);
    }

    buttons.push({
      text: 'Exit',
      nextMenu: 'menuIdle',
      callback: function(text) {
        this.displayMenu();
      }
    });

    this.buttons = buttons;
    this.displayMenu();
  };

  this.GmMenuStartRound = function(who) {
    this.who = who;
    this.message = 'Start round when all characters are ready.';
    this.buttons = [this.menuButtons.startRound,
      this.menuButtons.endCombat
    ];
  };

  this.charMenuPrepareAction = function(who) {
    this.who = who;
    this.message = 'Prepare ' + who + '\'s action';
    var character = MML.characters[who];
    var buttons = [this.menuButtons.setActionAttack,
      this.menuButtons.setActionObserve,
      this.menuButtons.setActionMovement
    ];

    if (!_.contains(character.action.modifiers, 'Ready Item')) {
      buttons.push(this.menuButtons.setActionReadyItem);
      character.action.weapon = MML.getEquippedWeapon(character);
    } else {
      var weapon = _.find(character.action.items, function (item) {
        return this.inventory[item.itemId].type === 'weapon';
      }, character);
      if (_.isUndefined(weapon)) {
        character.action.weapon = 'unarmed';
      } else {
        if (weapon.grip === 'Right' || weapon.grip === 'Left') {
          character.action.weapon = MML.buildWeaponObject(character.inventory[weapon.itemId], 'One Hand');
        } else {
          character.action.weapon = MML.buildWeaponObject(character.inventory[weapon.itemId], weapon.grip);
        }
      }
    }

    if (!_.isUndefined(character.action.weapon) && MML.isRangedWeapon(character.action.weapon)) {
      if (character.action.weapon.family !== 'MWM' || character.action.weapon.loaded === character.action.weapon.reload) {
        buttons.push({
          text: 'Aim',
          nextMenu: 'charMenuFinalizeAction',
          callback: function(input) {
            _.extend(MML.characters[this.who].action, {
              name: 'Aim',
              getTargets: 'getSingleTarget',
              callback: 'startAimAction'
            });
            this.displayMenu();
          }
        });
      } else {
        buttons.push({
          text: 'Reload',
          nextMenu: 'charMenuFinalizeAction',
          callback: function(input) {
            _.extend(MML.characters[this.who].action, {
              name: 'Reload',
              callback: 'reloadAction'
            });
            this.displayMenu();
          }
        });
      }
    }

    if ((_.has(character.statusEffects, 'Holding') ||
        (_.has(character.statusEffects, 'Grappled') && character.statusEffects['Grappled'].targets.length === 1)) &&
      !_.has(character.statusEffects, 'Held') &&
      !_.contains(character.action.modifiers, 'Release Opponent')
    ) {
      buttons.push({
        text: 'Release Opponent',
        nextMenu: 'charMenuPrepareAction',
        callback: function(input) {
          character.action.modifiers.push('Release Opponent');
          this.displayMenu();
        }
      });
    }
    if (character.spells.length > 0) {
      buttons.push(this.menuButtons.setActionCast);
    }
    if (!_.isUndefined(character.previousAction.spell) && character.previousAction.spell.actions > 0) {
      buttons.push({
        text: 'Continue Casting',
        nextMenu: 'charMenuFinalizeAction',
        callback: function(input) {
          character.action = MML.clone(character.previousAction);
          this.displayMenu();
        }
      });
    }
    this.buttons = buttons;
  };
  this.charMenuAttack = function(who) {
    this.who = who;
    this.message = 'Attack Menu';
    var buttons = [];
    var character = MML.characters[who];
    var weapon = character.action.weapon;
    if (weapon !== 'unarmed' &&
      (weapon.family !== 'MWM' || weapon.loaded === character.action.weapon.reload) &&
      ((!_.has(character.statusEffects, 'Grappled') &&
          !_.has(character.statusEffects, 'Holding') &&
          !_.has(character.statusEffects, 'Held') &&
          !_.has(character.statusEffects, 'Taken Down') &&
          !_.has(character.statusEffects, 'Pinned') &&
          !_.has(character.statusEffects, 'Overborne')) ||
        (!MML.isRangedWeapon(weapon) && weapon.rank < 2))
    ) {
      buttons.push({
        text: 'Standard',
        nextMenu: 'charMenuAttackCalledShot',
        callback: function() {
          this.displayMenu();
        }
      });
      if (MML.isRangedWeapon(weapon)) {
        buttons.push({
          text: 'Shoot From Cover',
          nextMenu: 'charMenuAttackCalledShot',
          callback: function(input) {
            character.action.modifiers.push('Shoot From Cover');
            this.displayMenu();
          }
        });
      } //else if (!_.has(character.statusEffects, 'Grappled') &&
      //   !_.has(character.statusEffects, 'Holding') &&
      //   !_.has(character.statusEffects, 'Held') &&
      //   !_.has(character.statusEffects, 'Taken Down') &&
      //   !_.has(character.statusEffects, 'Pinned') &&
      //   !_.has(character.statusEffects, 'Overborne')
      // ) {
      //   buttons.push({
      //     text: 'Sweep Attack',
      //     nextMenu: 'charMenuAttackCalledShot',
      //     callback: function() {
      //       character.action.modifiers.push('Sweep Attack');
      //       this.displayMenu();
      //     }
      //   });
      // }
    }

    buttons.push({
      text: 'Punch',
      nextMenu: 'menuPause',
      callback: function() {
        character.action.weaponType = 'Punch';
        this.charMenuAttackCalledShot(who);
        this.displayMenu();
      }
    });
    buttons.push({
      text: 'Kick',
      nextMenu: 'menuPause',
      callback: function() {
        character.action.weaponType = 'Kick';
        this.charMenuAttackCalledShot(who);
        this.displayMenu();
      }
    });
    if (!_.contains(character.action.modifiers, 'Release Opponent')) {
      if (!_.has(character.statusEffects, 'Grappled') &&
        !_.has(character.statusEffects, 'Holding') &&
        !_.has(character.statusEffects, 'Held') &&
        !_.has(character.statusEffects, 'Taken Down') &&
        !_.has(character.statusEffects, 'Pinned') &&
        !_.has(character.statusEffects, 'Overborne')
      ) {
        buttons.push({
          text: 'Grapple',
          nextMenu: 'menuPause',
          callback: function() {
            character.action.weaponType = 'Grapple';
            this.charMenuAttackStance(who);
            this.displayMenu();
          }
        });
      }
      if (((_.has(character.statusEffects, 'Grappled') || _.has(character.statusEffects, 'Held') || _.has(character.statusEffects, 'Holding')) &&
          character.movementPosition === 'Prone') ||
        ((_.has(character.statusEffects, 'Taken Down') || _.has(character.statusEffects, 'Overborne')) && !_.has(character.statusEffects, 'Pinned'))
      ) {
        buttons.push({
          text: 'Regain Feet',
          nextMenu: 'menuPause',
          callback: function() {
            character.action.weaponType = 'Regain Feet';
            this.charMenuAttackStance(who);
            this.displayMenu();
          }
        });
      }
      if (!_.has(character.statusEffects, 'Holding') &&
        !_.has(character.statusEffects, 'Held') &&
        !_.has(character.statusEffects, 'Pinned') &&
        (!_.has(character.statusEffects, 'Grappled') || character.statusEffects['Grappled'].targets.length === 1)
      ) {
        buttons.push({
          text: 'Place a Hold',
          nextMenu: 'menuPause',
          callback: function(input) {
            character.action.weaponType = 'Place a Hold';
            this.charMenuAttackStance(who);
            this.displayMenu();
          }
        });
      }
      if (_.has(character.statusEffects, 'Held') || _.has(character.statusEffects, 'Pinned')) {
        buttons.push({
          text: 'Break a Hold',
          nextMenu: 'menuPause',
          callback: function() {
            character.action.weaponType = 'Break a Hold';
            this.charMenuAttackStance(who);
            this.displayMenu();
          }
        });
      }
      if ((_.has(character.statusEffects, 'Grappled')) &&
        !_.has(character.statusEffects, 'Pinned') &&
        !_.has(character.statusEffects, 'Held')
      ) {
        buttons.push({
          text: 'Break Grapple',
          nextMenu: 'menuPause',
          callback: function() {
            character.action.weaponType = 'Break Grapple';
            this.charMenuAttackStance(who);
            this.displayMenu();
          }
        });
      }
      if ((_.has(character.statusEffects, 'Holding') ||
          (_.has(character.statusEffects, 'Grappled') && character.statusEffects['Grappled'].targets.length === 1) ||
          (_.has(character.statusEffects, 'Held') && character.statusEffects['Held'].targets.length === 1)) &&
        !(_.has(character.statusEffects, 'Grappled') && _.has(character.statusEffects, 'Held')) &&
        character.movementPosition !== 'Prone'
      ) {
        buttons.push({
          text: 'Takedown',
          nextMenu: 'menuPause',
          callback: function() {
            character.action.weaponType = 'Takedown';
            this.charMenuAttackStance(who);
            this.displayMenu();
          }
        });
      }
      if (_.has(character.statusEffects, 'Held') ||
        _.has(character.statusEffects, 'Grappled') ||
        _.has(character.statusEffects, 'Holding') ||
        _.has(character.statusEffects, 'Taken Down') ||
        _.has(character.statusEffects, 'Pinned') ||
        _.has(character.statusEffects, 'Overborne')
      ) {
        if (_.has(character.statusEffects, 'Held') && _.filter(character.statusEffects['Held'].targets, function(target) { return target.bodyPart === 'Head'; }).length === 0) {
          buttons.push({
            text: 'Head Butt',
            nextMenu: 'menuPause',
            callback: function() {
              character.action.weaponType = 'Head Butt';
              this.charMenuAttackStance(who);
              this.displayMenu();
            }
          });
        }
        buttons.push({
          text: 'Bite',
          nextMenu: 'menuPause',
          callback: function() {
            character.action.weaponType = 'Bite';
            this.charMenuAttackCalledShot(who);
            this.displayMenu();
          }
        });
      }
    }
    this.buttons = buttons;
  };
  this.charMenuAttackCalledShot = function(who) {
    var character = MML.characters[this.who];
    this.who = who;
    this.message = 'Called Shot Menu';
    var buttons = [{
      text: 'None',
      callback: function() {
        this.displayMenu();
      }
    }, {
      text: 'Body Part',
      callback: function() {
        character.action.modifiers.push('Called Shot');
        this.displayMenu();
      }
    }, {
      text: 'Specific Hit Position',
      callback: function() {
        character.action.modifiers.push('Called Shot Specific');
        this.displayMenu();
      }
    }];

    if (MML.isWieldingRangedWeapon(character)) {
      _.each(buttons, function(button) {
        button.nextMenu = 'charMenuFinalizeAction';
      });
    } else {
      _.each(buttons, function(button) {
        button.nextMenu = 'charMenuAttackStance';
      });
    }
    this.buttons = buttons;
  };
  this.charMenuAttackStance = function(who) {
    this.who = who;
    this.message = 'Attack Stance Menu';
    var character = MML.characters[who];
    var buttons = [{
      text: 'Neutral',
      callback: function(input) {
        this.displayMenu();
      }
    }, {
      text: 'Defensive',
      callback: function(input) {
        character.action.modifiers.push('Defensive Stance');
        this.displayMenu();
      }
    }, {
      text: 'Aggressive',
      callback: function(input) {
        character.action.modifiers.push('Aggressive Stance');
        this.displayMenu();
      }
    }];

    if (['Punch', 'Kick', 'Head Butt', 'Bite', 'Grapple', 'Place a Hold', 'Break a Hold', 'Break Grapple', 'Takedown', 'Regain Feet'].indexOf(character.action.weaponType) > -1) {
      _.each(buttons, function(button) {
        button.nextMenu = 'charMenuFinalizeAction';
      });
    } else if (!MML.isUnarmed(character) && character.action.weapon.secondaryType !== '') {
      _.each(buttons, function(button) {
        button.nextMenu = 'charMenuSelectDamageType';
      });
    } else {
      character.action.weaponType = 'primary';
      _.each(buttons, function(button) {
        button.nextMenu = 'charMenuFinalizeAction';
      });
    }
    this.buttons = buttons;
  };

  this.charMenuCast = function(who) {
    this.who = who;
    this.message = 'Choose a spell';
    this.buttons = [];
    var character = MML.characters[who];
    _.each(character.spells, function(spellName) {
      if (_.isUndefined(MML.spells[spellName].requiredItem) ||
        (_.isUndefined(character.action.items) &&
          (character.inventory[character.rightHand._id].name === MML.spells[spellName].requiredItem || character.inventory[character.leftHand._id].name === MML.spells[spellName].requiredItem)) ||
        (!_.isUndefined(character.action.items) &&
          _.filter(character.action.items, function (item) { return character.inventory[item.itemId].name === MML.spells[spellName].requiredItem; }, character).length > 0)
      ) {
        this.buttons.push({
          text: spellName,
          nextMenu: 'menuPause',
          callback: function() {
            _.extend(character.action, {
              name: 'Cast',
              spell: MML.spells[spellName],
              callback: 'startCastAction',
            });
            this.charMenuMetaMagicInitiative(who);
            this.displayMenu();
          }
        });
      }
    }, this);
  };
  this.charMenuMetaMagicInitiative = function(who) {
    this.who = who;
    this.message = 'Choose meta magic';
    this.buttons = [];
    var character = MML.characters[who];

    if (_.contains(character.action.spell.metaMagic, 'Called Shot')) {
      this.buttons.push({
        text: 'Called Shot',
        nextMenu: 'menuPause',
        callback: function() {
          if (_.contains(character.action.modifiers, 'Called Shot')) {
            character.action.modifiers = _.without(character.action.modifiers, 'Called Shot');
          } else {
            character.action.modifiers = _.without(character.action.modifiers, 'Called Shot Specific');
            character.action.modifiers.push('Called Shot');
          }
          this.charMenuMetaMagicInitiative(who);
          this.displayMenu();
        }
      });
      this.buttons.push({
        text: 'Called Shot Specific',
        nextMenu: 'menuPause',
        callback: function() {
          if (_.contains(character.action.modifiers, 'Called Shot Specific')) {
            character.action.modifiers = _.without(character.action.modifiers, 'Called Shot Specific');
          } else {
            character.action.modifiers = _.without(character.action.modifiers, 'Called Shot');
            character.action.modifiers.push('Called Shot Specific');
          }
          this.charMenuMetaMagicInitiative(who);
          this.displayMenu();
        }
      });
    }
    this.buttons.push({
      text: 'Ease Spell',
      nextMenu: 'menuPause',
      callback: function() {
        if (_.contains(character.action.modifiers, 'Ease Spell')) {
          character.action.modifiers = _.without(character.action.modifiers, 'Ease Spell');
        } else {
          character.action.modifiers = _.without(character.action.modifiers, 'Hasten Spell');
          character.action.modifiers.push('Ease Spell');
        }
        this.charMenuMetaMagicInitiative(who);
        this.displayMenu();
      }
    });
    this.buttons.push({
      text: 'Hasten Spell',
      nextMenu: 'menuPause',
      callback: function() {
        if (_.contains(character.action.modifiers, 'Hasten Spell')) {
          character.action.modifiers = _.without(character.action.modifiers, 'Hasten Spell');
        } else {
          character.action.modifiers = _.without(character.action.modifiers, 'Ease Spell');
          character.action.modifiers.push('Hasten Spell');
        }
        this.charMenuMetaMagicInitiative(who);
        this.displayMenu();
      }
    });
    this.buttons.push({
      text: 'Next Menu',
      nextMenu: 'charMenuFinalizeAction',
      callback: function() {
        this.displayMenu();
      }
    });
  };
  this.charMenuMetaMagic = function(who) {
    this.who = who;
    this.message = 'Choose meta magic';
    this.buttons = [];
    var character = MML.characters[who];

    _.each(_.without(character.action.spell.metaMagic, 'Called Shot', 'Called Shot Specific'), function(metaMagicName) {
      this.buttons.push({
        text: metaMagicName,
        nextMenu: 'menuPause',
        callback: function(input) {
          if (_.contains(character.action.modifiers, metaMagicName)) {
            delete state.MML.GM.currentAction.metaMagic[metaMagicName];
            this.charMenuMetaMagic(who);
          } else {
            this['charMenu' + metaMagicName.replace(/\s/g, '')](who);
          }
          this.displayMenu();
        }
      });
    }, this);
    this.buttons.push({
      text: 'Cast Spell',
      nextMenu: 'menuPause',
      callback: function() {
        character.chooseSpellTargets();
      }
    });
  };
  this.charMenuAddTarget = function(who) {
    this.who = who;
    this.buttons = [];
    var character = MML.characters[who];
    state.MML.GM.currentAction.parameters.metaMagic['Increase Targets'] = { epMod: state.MML.GM.currentAction.targetArray.length, castingMod: -10 * state.MML.GM.currentAction.targetArray.length };
    var parameters = state.MML.GM.currentAction.parameters;
    var epProduct = _.reduce(_.pluck(parameters.metaMagic, 'epMod'), function(memo, num) { return memo * num; }) * parameters.epCost;
    this.message = 'Current EP Cost: ' + epProduct + '\nAdd another target or cast spell:';

    if (character.ep > epProduct) {
      this.buttons.push({
        text: 'Add Target',
        nextMenu: 'menuPause',
        callback: function() {
          character.chooseSpellTargets();
        }
      });
    }
    this.buttons.push({
      text: 'Cast Spell',
      nextMenu: 'menuPause',
      callback: function() {
        character[character.action.callback]();
      }
    });
  };
  this.charMenuIncreasePotency = function(who) {
    this.who = who;
    this.message = 'Increase potency by how many times?';
    this.buttons = [];
    var character = MML.characters[who];
    var parameters = state.MML.GM.currentAction.parameters;
    var epProduct = _.reduce(_.pluck(parameters.metaMagic, 'epMod'), function(memo, num) { return memo * num; }) * parameters.epCost;
    var i = 2;

    while (character.ep > Math.pow(2, i - 1) * epProduct) {
      this.buttons.push({
        text: 'Times: ' + i + ' EP Cost: ' + Math.pow(2, i - 1) * epProduct,
        nextMenu: 'menuPause',
        callback: function() {
          state.MML.GM.currentAction.parameters.metaMagic['Increase Potency'] = { epMod: Math.pow(2, i - 1), castingMod: -10, level: i };
          this.charMenuMetaMagic(who);
          this.displayMenu();
        }
      });
      i++;
    }
    this.buttons.push({
      text: 'Back',
      nextMenu: 'menuPause',
      callback: function() {
        character.charMenuMetaMagic();
      }
    });
  };
  this.charMenuIncreaseDuration = function(who) {
    this.who = who;
    this.message = 'Increase duration by how many times?';
    this.buttons = [];
    var character = MML.characters[who];
    var parameters = state.MML.GM.currentAction.parameters;
    var epProduct = _.reduce(_.pluck(parameters.metaMagic, 'epMod'), function(memo, num) { return memo * num; }) * parameters.epCost;
    var i = 2;

    while (character.ep > i * epProduct) {
      this.buttons.push({
        text: 'Times: ' + i + ' EP Cost: ' + i * epProduct,
        nextMenu: 'menuPause',
        callback: function() {
          state.MML.GM.currentAction.parameters.metaMagic['Increase Duration'] = { epMod: i, castingMod: 0, level: i };
          this.charMenuMetaMagic(who);
          this.displayMenu();
        }
      });
      i++;
    }
    this.buttons.push({
      text: 'Back',
      nextMenu: 'menuPause',
      callback: function() {
        character.charMenuMetaMagic();
      }
    });
  };

  this.charMenuReadyItem = function(who) {
    this.who = who;
    this.message = 'Choose item or items for ' + this.who;
    var buttons = [];
    var character = MML.characters[who];

    _.each(character.inventory, function(item, _id) {
      if (['weapon', 'spellComponent', 'shield', 'potion', 'misc'].indexOf(item.type) > -1 &&
        character.rightHand._id !== _id &&
        character.leftHand._id !== _id
      ) {
        buttons.push({
          text: item.name,
          nextMenu: 'menuPause',
          callback: function() {
            this.charMenuChooseHands(who, item, _id);
            this.displayMenu();
          }
        });
      }
    });
    buttons.push({
      text: 'Back',
      nextMenu: 'charMenuPrepareAction',
      callback: function() {
        this.displayMenu();
      }
    });
    this.buttons = buttons;
  };
  this.charMenuChooseHands = function(who, item, itemId) {
    this.who = who;
    this.message = 'Choose item or items for' + who;
    var buttons = [];
    var character = MML.characters[who];

    if (['spellComponent', 'shield', 'potion', 'misc'].indexOf(item.type) > -1 ||
      (item.type === 'weapon' && _.has(item.grips, 'One Hand'))
    ) {
      buttons.push({
        text: 'Left',
        nextMenu: 'charMenuReadyAdditionalItem',
        callback: function() {
          character.action.items = [{
            itemId: itemId,
            grip: 'Left'
          }];
          this.charMenuReadyAdditionalItem(who, 'Right', itemId);
          this.displayMenu();
        }
      });
      buttons.push({
        text: 'Right',
        nextMenu: 'charMenuReadyAdditionalItem',
        callback: function() {
          character.action.items = [{
            itemId: itemId,
            grip: 'Right'
          }];
          this.charMenuReadyAdditionalItem(who, 'Left', itemId);
          this.displayMenu();
        }
      });
    }
    if (item.type === 'weapon') {
      _.each(item.grips, function(grip, name) {
        if (name !== 'One Hand') {
         buttons.push({
            text: name,
            nextMenu: 'menuIdle',
            callback: function() {
              character.action.items = [{
                itemId: itemId,
                grip: name
              }];
              this.charMenuPrepareAction(who);
              this.displayMenu();
            }
          });
        }
      });
    }
    this.buttons = buttons;
  };
  this.charMenuReadyAdditionalItem = function(who, hand, previousItemId) {
    this.who = who;
    this.message = 'Choose another item or finalize action for ' + this.who;
    var buttons = [];
    var character = MML.characters[who];

    _.each(character.inventory, function(item, _id) {
      if (['weapon', 'spellComponent', 'shield', 'potion', 'misc'].indexOf(item.type) > -1 &&
        character.rightHand._id !== _id &&
        character.leftHand._id !== _id &&
        previousItemId !== _id
      ) {
        buttons.push({
          text: item.name,
          nextMenu: 'menuIdle',
          callback: function() {
            character.action.items.push({ itemId: _id, grip: hand });
            this.charMenuPrepareAction(who);
            this.displayMenu();
          }
        });
      }
    });

    buttons.push({
      text: 'Next Menu',
      nextMenu: 'charMenuPrepareAction',
      callback: function() {
        this.displayMenu();
      }
    });
    this.buttons = buttons;
  };

  this.charMenuFinalizeAction = function(who) {
    this.who = who;

    if (state.MML.GM.roundStarted === true) {
      this.message = 'Accept or change action for ' + who;
      this.buttons = [
        this.menuButtons.acceptAction,
        this.menuButtons.editAction
      ];
    } else if (_.has(MML.characters[this.who].statusEffects, 'Stunned')) {
      this.message =  who + ' is stunned and can only move. Roll initiative';
      this.buttons = [
        this.menuButtons.initiativeRoll
      ];
    } else {
      this.message = 'Roll initiative or change action for ' + who;
      this.buttons = [
        this.menuButtons.initiativeRoll,
        this.menuButtons.editAction
      ];
    }
  };

  this.charMenuStartAction = function(who, validAction) {
    this.who = who;
    var character = MML.characters[who];

    if (_.has(character.statusEffects, 'Stunned') || _.has(character.statusEffects, 'Dodged This Round')) {
      this.message = 'Start ' + state.MML.GM.actor + '\'s action';
      this.buttons = [this.menuButtons.startAction];
    } else if (validAction) {
      this.message = 'Start or change ' + state.MML.GM.actor + '\'s action';
      this.buttons = [this.menuButtons.startAction, this.menuButtons.changeAction];
    } else {
      sendChat('GM', '/w "' + this.name + '"' + who + '\'s action no longer valid.');
      this.message = 'Change ' + state.MML.GM.actor + '\'s action';
      this.charMenuPrepareAction(who);
    }
  };
  this.menuCombatMovement = function(who) {
    this.who = who;
    this.message = 'Move ' + who + '.';
    this.buttons = [this.menuButtons.setProne,
      this.menuButtons.setStalk,
      this.menuButtons.setCrawl,
      this.menuButtons.setWalk,
      this.menuButtons.setJog,
      this.menuButtons.setRun,
      this.menuButtons.endMovement
    ];
    MML.displayThreatZones(true);
  };

  this.charMenuPlaceSpellMarker = function(who) {
    this.who = who;
    this.message = 'Move and resize spell marker.';
    this.buttons = [{
      text: 'Accept',
      nextMenu: 'menuPause',
      callback: function() {
        var spellMarker = MML.getTokenFromName(state.MML.GM.currentAction.parameters.spellMarker);
        var targets = MML.getAoESpellTargets(spellMarker);
        _.each(MML.characters, function (character) {
          MML.getTokenFromChar(character.name).set('tint_color', 'transparent');
        });
        spellMarker.remove();
        this.setCurrentCharacterTargets(targets);
        character[character.action.callback]();
      }
    }];
  };
  this.charMenuSelectBodyPart = function(who) {
    this.who = who;
    this.message = 'Choose a Body Part.';
    this.buttons = [];

    var bodyParts = MML.getBodyParts(MML.characters[state.MML.GM.currentAction.targetArray[state.MML.GM.currentAction.targetIndex]]);

    _.each(bodyParts, function(part) {
      this.buttons.push({
        text: part,
        nextMenu: 'menuIdle',
        callback: function(text) {
          state.MML.GM.currentAction.calledShot = text;
          MML.characters[this.who].processAttack();
        }
      });
    }, this);
  };
  this.charMenuSelectHitPosition = function(who) {
    this.who = who;
    this.message = 'Choose a Hit Position.';
    this.buttons = [];

    var hitPositions = MML.getHitPositionNames(MML.characters[state.MML.GM.currentAction.targetArray[state.MML.GM.currentAction.targetIndex]]);

    _.each(hitPositions, function(position) {
      this.buttons.push({
        text: position,
        nextMenu: 'menuIdle',
        callback: function(input) {
          state.MML.GM.currentAction.calledShot = input.text;

          MML.processCommand({
            type: 'character',
            who: this.who,
            callback: 'processAttack',
            input: {}
          });
        }
      });
    }, this);
  };
  this.charMenuSelectDamageType = function(who) {
    this.who = who;
    var character = MML.characters[who];
    this.message = 'Choose a Damage Type.';
    this.buttons = [];

    this.buttons.push({
      text: 'Primary',
      nextMenu: 'charMenuFinalizeAction',
      callback: function() {
        character.action.weaponType = 'primary';
        this.displayMenu();
      }
    });

    this.buttons.push({
      text: 'Secondary',
      nextMenu: 'charMenuFinalizeAction',
      callback: function(input) {
        character.action.weaponType = 'secondary';
        this.displayMenu();
      }
    });
  };
  this.charMenuAttackRoll = function(who) {
    this.who = who;
    this.message = 'Roll Attack.';
    this.buttons = [this.menuButtons.rollDice];
  };
  this.charMenuMeleeDefenseRoll = function(who, blockChance, dodgeChance) {
    var character = MML.characters[who];
    this.who = who;
    this.message = 'How will ' + who + ' defend?';
    this.buttons = [];
    if (!MML.isUnarmed(character) || MML.isUnarmed(state.MML.GM.currentAction.character)) {
      this.buttons.push({
        text: 'Block: ' + blockChance + '%',
        nextMenu: 'menuIdle',
        callback: function() {
          character.statusEffects['Melee This Round'] = { id: generateRowID(), name: 'Melee This Round' };
          character.meleeBlockRoll(blockChance);
        }
      });
    }
    this.buttons.push({
      text: 'Dodge: ' + dodgeChance + '%',
      nextMenu: 'menuIdle',
      callback: function() {
        character.statusEffects['Melee This Round'] = { id: generateRowID(), name: 'Melee This Round' };
        character.meleeDodgeRoll(dodgeChance);
      }
    });
    this.buttons.push({
      text: 'Take it',
      nextMenu: 'menuIdle',
      callback: function() {
        character.forgoDefense('defenseRoll');
      }
    });
  };
  this.charMenuRangedDefenseRoll = function(who, defenseChance) {
    var character = MML.characters[who];
    this.who = who;
    this.message = 'How will ' + who + ' defend?';
    this.buttons = [{
      text: 'Defend: ' + defenseChance + '%',
      nextMenu: 'menuIdle',
      callback: function() {
        character.statusEffects['Melee This Round'] = { id: generateRowID(), name: 'Melee This Round' };
        character.rangedDefenseRoll(defenseChance);
      }
    }, {
      text: 'Take it',
      nextMenu: 'menuIdle',
      callback: function() {
        character.forgoDefense('defenseRoll');
      }
    }];
  };
  this.charMenuGrappleDefenseRoll = function(who, brawlChance, attackChance) {
    var character = MML.characters[who];
    this.who = who;
    this.message = 'How will ' + who + ' defend?';
    var buttons = [];

    if (!_.isUndefined(attackChance)) {
      buttons.push({
        text: 'With Weapon: ' + attackChance + '%',
        nextMenu: 'menuIdle',
        callback: function() {
          character.grappleDefenseWeaponRoll(attackChance);
        }
      });
    }
    buttons.push({
      text: 'Brawl: ' + brawlChance + '%',
      nextMenu: 'menuIdle',
      callback: function() {
        character.grappleDefenseBrawlRoll(brawlChance);
      }
    });
    buttons.push({
      text: 'Take it',
      nextMenu: 'menuIdle',
      callback: function() {
        character.forgoDefense(brawlDefenseRoll);
      }
    });
    this.buttons = buttons;
  };
  this.charMenuResistRelease = function(who, attacker) {
    this.who = who;
    this.message = 'Allow ' + attacker.name + ' to release grapple?';

    var buttons = [{
      text: 'Yes',
      nextMenu: 'menuIdle',
      callback: function() {
        state.MML.GM.currentAction.parameters.targetAgreed = true;
        MML.releaseOpponentAction();
      }
    }, {
      text: 'No',
      nextMenu: 'menuIdle',
      callback: function() {
        state.MML.GM.currentAction.parameters.targetAgreed = false;
        MML.releaseOpponentAction();
      }
    }];
    this.buttons = buttons;
  };
  this.charMenuMajorWoundRoll = function(who) {
    this.who = who;
    this.message = 'Major Wound Roll.';
    this.buttons = [{
      text: 'Roll Willpower',
      nextMenu: 'menuIdle',
      callback: function() {
        MML.characters[this.who].majorWoundRoll();
      }
    }];
  };
  this.charMenuDisablingWoundRoll = function(who) {
    this.who = who;
    this.message = 'Disabling Wound Roll.';
    this.buttons = [{
      text: 'Roll System Strength',
      nextMenu: 'menuIdle',
      callback: function() {
        MML.characters[this.who].disablingWoundRoll();
      }
    }];
  };
  this.charMenuWoundFatigueRoll = function(who) {
    this.who = who;
    this.message = 'Wound Fatigue Roll.';
    this.buttons = [{
      text: 'Roll System Strength',
      nextMenu: 'menuIdle',
      callback: function() {
        MML.characters[this.who].multiWoundRoll();
      }
    }];
  };
  this.charMenuSensitiveAreaRoll = function(who) {
    this.who = who;
    this.message = 'Sensitive Area Roll.';
    this.buttons = [{
      text: 'Roll Willpower',
      nextMenu: 'menuIdle',
      callback: function() {
        MML.characters[this.who].sensitiveAreaRoll();
      }
    }];
  };
  this.charMenuKnockdownRoll = function(who) {
    this.who = who;
    this.message = 'Knockdown Roll.';
    this.buttons = [{
      text: 'Roll System Strength',
      nextMenu: 'menuIdle',
      callback: function() {
        MMML.characters[this.who].knockdownRoll();
      }
    }];
  };
  this.charMenuFatigueCheckRoll = function(who) {
    this.who = who;
    this.message = 'Fatigue Roll.';
    this.buttons = [{
      text: 'Roll Fitness',
      nextMenu: 'menuIdle',
      callback: function() {
        MML.characters[this.who].fatigueCheckRoll();
      }
    }];
  };
  this.charMenuFatigueRecoveryRoll = function(who) {
    this.who = who;
    this.message = 'Fatigue Recovery Roll.';
    this.buttons = [{
      text: 'Roll Health',
      nextMenu: 'menuIdle',
      callback: function(input) {
        MML.characters[this.who].fatigueRecoveryRoll();
      }
    }];
  };
  this.charMenuholdAimRoll = function(who) {
    this.who = who;
    this.message = 'Aim Hold Roll.';
    this.buttons = [{
      text: 'Roll Strength',
      nextMenu: 'menuIdle',
      callback: function() {
        MML.characters[who].holdAimRoll();
      }
    }];
  };
  this.charMenuGenericRoll = function(who, message, dice, name, callback) {
    this.who = who;
    this.message = message;
    this.buttons = [{
      text: 'Roll ' + rollDice,
      nextMenu: 'menuIdle',
      callback: function() {
        MML.characters[this.who].genericRoll(name, dice, callback);
      }
    }];
  };
  this.charMenuObserveAction = function(who) {
    this.who = who;
    this.message = this.who + ' observes the situation.';
    this.buttons = [this.menuButtons.endAction];
  };
  this.charMenuAimAction = function(who) {
    this.who = who;
    this.message = this.who + ' aims at ' + state.MML.GM.currentAction.targetArray[state.MML.GM.currentAction.targetIndex] + '.';
    this.buttons = [this.menuButtons.endAction];
  };
  this.charMenuReloadAction = function(who) {
    this.who = who;
    this.message = this.who + ' reloads. ' + state.MML.GM.currentAction.parameters.attackerWeapon.loaded + '/' + state.MML.GM.currentAction.parameters.attackerWeapon.reload + ' done.';
    this.buttons = [this.menuButtons.endAction];
  };
  this.charMenuContinueCasting = function(who) {
    this.who = who;
    this.message = this.who + '\' starts casting a spell.';
    this.buttons = [this.menuButtons.endAction];
  };

  this.setCurrentCharacterTargets = function(input) {
    var targetArray;

    if (!_.isUndefined(input.target)) {
      targetArray = [input.target];
    } else {
      targetArray = input.targets;
    }
    state.MML.GM.currentAction.targetArray = targetArray;
    state.MML.GM.currentAction.targetIndex = 0;
    state.MML.GM.currentAction.character[state.MML.GM.currentAction.character.action.callback]();
  };

  this.menuButtons = {};
  this.menuButtons.GmMenuMain = {
    text: 'GmMenuMain',
    nextMenu: 'GmMenuMain',
    callback: function() {
      this.displayMenu();
    }
  };
  this.menuButtons.combatMenu = {
    text: 'Combat',
    nextMenu: 'GmMenuCombat',
    callback: function() {
      this.displayMenu();
    }
  };
  this.menuButtons.newCharacterMenu = {
    text: 'New Character',
    nextMenu: 'GmMenuNewCharacter',
    callback: function() {
      this.displayMenu();
    }
  };

  this.menuButtons.newItemMenu = {
    text: 'New Item',
    nextMenu: 'GmMenuNewItem',
    callback: function() {
      this.displayMenu();
    }
  };
  this.menuButtons.newWeapon = {
    text: 'Weapon',
    nextMenu: 'GmMenuNewWeapon',
    callback: function() {
      this.displayMenu();
    }
  };

  this.menuButtons.newShield = {
    text: 'Shield',
    nextMenu: 'GmMenuNewShield',
    callback: function() {
      this.displayMenu();
    }
  };
  this.menuButtons.newArmor = {
    text: 'Armor',
    nextMenu: 'GmMenuNewArmor',
    callback: function() {
      this.displayMenu();
    }
  };
  this.menuButtons.newSpellComponent = {
    text: 'Spell Component',
    nextMenu: 'GmMenuNewSpellComponent',
    callback: function() {
      this.displayMenu();
    }
  };
  this.menuButtons.newMiscItem = {
    text: 'Misc',
    nextMenu: 'GmMenuNewMiscItem',
    callback: function() {
      this.displayMenu();
    }
  };
  this.menuButtons.itemQualityPoor = {
    text: 'Poor',
    nextMenu: 'GmMenuNewItemProperties',
    callback: function(text) {
      state.MML.GM.newItem.quality = text;
      this.displayMenu();
    }
  };
  this.menuButtons.itemQualityStandard = {
    text: 'Standard',
    nextMenu: 'GmMenuNewItemProperties',
    callback: function(text) {
      state.MML.GM.newItem.quality = text;
      this.displayMenu();
    }
  };
  this.menuButtons.itemQualityExcellent = {
    text: 'Excellent',
    nextMenu: 'GmMenuNewItemProperties',
    callback: function(text) {
      state.MML.GM.newItem.quality = text;
      this.displayMenu();
    }
  };
  this.menuButtons.itemQualityMasterWork = {
    text: 'Master Work',
    nextMenu: 'GmMenuNewItemProperties',
    callback: function(text) {
      state.MML.GM.newItem.quality = text;
      this.displayMenu();
    }
  };
  this.menuButtons.assignNewItem = {
    text: 'Assign Item',
    nextMenu: 'GmMenuMain',
    callback: function(input) {
      input.charName = this.name;
      input.callback = 'assignNewItem';
      MML.displayTargetSelection(input);
    }
  };

  this.menuButtons.worldMenu = {
    text: 'World',
    nextMenu: 'GmMenuWorld',
    callback: function() {
      this.displayMenu();
    }
  };
  this.menuButtons.utilitiesMenu = {
    text: 'Utilities',
    nextMenu: 'GmMenuUtilities',
    callback: function() {
      this.displayMenu();
    }
  };
  this.menuButtons.startCombat = {
    text: 'Start Combat',
    nextMenu: 'GmMenuMain',
    callback: function(text, selectedCharNames) {
      MML.startCombat(selectedCharNames);
    }
  };
  this.menuButtons.toMainGmMenu = {
    text: 'Back',
    nextMenu: 'GmMenuMain',
    callback: function() {
      this.displayMenu();
    }
  };

  this.menuButtons.startRound = {
    text: 'Start Round',
    nextMenu: 'GmMenuStartRound',
    callback: function() {
      MML.startRound();
    }
  };
  this.menuButtons.endCombat = {
    text: 'End Combat',
    nextMenu: 'GmMenuMain',
    callback: function() {
      MML.endCombat();
    }
  };
  this.menuButtons.setActionAttack = {
    text: 'Attack',
    nextMenu: 'charMenuAttack',
    callback: function() {
      var character = MML.characters[this.who];
      _.extend(character.action, {
        name: 'Attack',
        getTargets: 'getSingleTarget',
        callback: 'startAttackAction'
      });
      this.displayMenu();
    }
  };
  this.menuButtons.setActionCast = {
    text: 'Cast',
    nextMenu: 'charMenuCast',
    callback: function(text) {
      _.extend(MML.characters[this.who].action, {
        name: text,
        getTargets: 'getSingleTarget',
        callback: 'startCastAction'
      });
      this.displayMenu();
    }
  };
  this.menuButtons.setActionReadyItem = {
    text: 'Ready Item',
    nextMenu: 'charMenuReadyItem',
    callback: function() {
      MML.characters[this.who].action.modifiers.push('Ready Item');
      this.displayMenu();
    }
  };
  this.menuButtons.setActionObserve = {
    text: 'Observe',
    nextMenu: 'charMenuFinalizeAction',
    callback: function(input) {
      _.extend(MML.characters[this.who].action, {
        name: 'Observe',
        callback: 'observeAction'
      });
      this.displayMenu();
    }
  };
  this.menuButtons.setActionMovement = {
    text: 'Movement Only',
    nextMenu: 'charMenuFinalizeAction',
    callback: function(input) {
      _.extend(MML.characters[this.who].action, {
        name: 'Movement Only',
        callback: 'endAction'
      });
      delete MML.characters[this.who].action.getTargets;
      this.displayMenu();
    }
  };
  this.menuButtons.changeAction = {
    text: 'Change Action',
    nextMenu: 'charMenuPrepareAction',
    callback: function() {
      MML.characters[this.who].action = { modifiers: [] };
      if (_.has(character.statusEffects, 'Changed Action')) {
        character.statusEffects['Changed Action'].level++;
      } else {
        character.addStatusEffect('Changed Action', {
          id: generateRowID(),
          name: 'Changed Action',
          level: 1
        });
      }
      this.displayMenu();
    }
  };
  this.menuButtons.editAction = {
    text: 'Edit Action',
    nextMenu: 'charMenuPrepareAction',
    callback: function() {
      MML.characters[this.who].action = { modifiers: [] };
      this.displayMenu();
    }
  };
  this.menuButtons.actionPrepared = {
    text: 'Ready',
    nextMenu: 'charMenuPrepareAction',
    callback: function() {
      var character = MML.characters[this.who];
      character.setReady(true);
      character.setAction();
      this.characterIndex++;
      if (this.characterIndex < this.combatants.length) {
        this.charMenuPrepareAction(this.combatants[this.characterIndex]);
        this.displayMenu();
      } else if (this.name === state.MML.GM.name) {
        this.GmMenuStartRound('GM');
        this.displayMenu();
      } else {
        this.menu = 'menuIdle';
        this.displayMenu();
      }
    }
  };

  this.menuButtons.chooseTargets = {
    text: 'Choose Targets',
    nextMenu: 'charMenuChooseTargets',
    callback: function() {
      this.displayMenu();
    }
  };
  this.menuButtons.acceptAction = {
    text: 'Accept',
    nextMenu: 'menuIdle',
    callback: function() {
      var character = MML.characters[this.who];
      character.setReady(true);
      character.setAction();
      MML.nextAction();
    }
  };
  this.menuButtons.startAction = {
    text: 'Start Action',
    nextMenu: 'menuCombatMovement',
    callback: function() {
      this.displayMenu();
    }
  };
  this.menuButtons.endAction = {
    text: 'End Action',
    nextMenu: 'charMenuPrepareAction',
    callback: function() {
      MML.endAction();
    }
  };
  this.menuButtons.initiativeRoll = {
    text: 'Roll',
    nextMenu: 'menuIdle',
    callback: function() {
      MML.characters[this.who].initiativeRoll();
    }
  };

  this.menuButtons.acceptRoll = {
    text: 'Accept',
    nextMenu: 'menuIdle',
    callback: function() {
      this[this.currentRoll.applyResult]();
    }
  };

  this.menuButtons.setProne = {
    text: 'Prone',
    nextMenu: 'menuCombatMovement',
    callback: function() {
      MML.characters[this.who].movementPosition = 'Prone';
      MML.characters[this.who].displayMovement();
    }
  };
  this.menuButtons.setCrawl = {
    text: 'Crawl',
    nextMenu: 'menuCombatMovement',
    callback: function() {
      MML.characters[this.who].movementPosition = 'Crawl';
      MML.characters[this.who].displayMovement();
    }
  };
  this.menuButtons.setStalk = {
    text: 'Stalk',
    nextMenu: 'menuCombatMovement',
    callback: function() {
      MML.characters[this.who].movementPosition = 'Stalk';
      MML.characters[this.who].displayMovement();
    }
  };
  this.menuButtons.setWalk = {
    text: 'Walk',
    nextMenu: 'menuCombatMovement',
    callback: function() {
      MML.characters[this.who].movementPosition = 'Walk';
      MML.characters[this.who].displayMovement();
    }
  };
  this.menuButtons.setJog = {
    text: 'Jog',
    nextMenu: 'menuCombatMovement',
    callback: function() {
      MML.characters[this.who].movementPosition = 'Jog';
      MML.characters[this.who].displayMovement();
    }
  };
  this.menuButtons.setRun = {
    text: 'Run',
    nextMenu: 'menuCombatMovement',
    callback: function() {
      MML.characters[this.who].movementPosition = 'Run';
      MML.characters[this.who].displayMovement();
    }
  };
  this.menuButtons.endMovement = {
    text: 'End Movement',
    nextMenu: 'menuIdle',
    callback: function() {
      var path = getObj('path', MML.characters[this.who].pathID);
      if (!_.isUndefined(path)) {
        path.remove();
      }
      MML.displayThreatZones(false);
      MML.characters[this.who].startAction();
    }
  };

  this.GmMenuWorld = function(input) {
    //pass time, travel, other stuff
  };

  this.GmMenuUtilities = function(input) {
    //edit states and other api stuff
  };
  this.name = name;
  this.who = name;
  this.menu = isGM ? 'GmMenuMain' : 'menuPause';
  this.buttons = isGM ? [this.menuButtons.GmMenuMain] : [];
  this.characters = [];
  this.characterIndex = 0;
};
