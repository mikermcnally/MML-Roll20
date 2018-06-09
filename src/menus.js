SoS.displayMenu = function displayMenu(player, message, buttons) {
  var toChat = '/w "' + player.name +
    '" &{template:charMenu} {{name=' + message + '}} ' +
    buttons.map(function(button) {
      return '{{' + button.replace(/\s+/g, '') + '=[' + button + '](!SoS|' + button + ')}}';
    }).join(' ');

  sendChat(player.name, toChat, null, {
    noarchive: true
  });
  return player;
};

SoS.setMenuButtons = function setMenuButtons(player, buttons) {
  return new Promise(function(resolve, reject) {
    player.buttonPressed = function(pressedButton, selectedIds) {
      if (_.contains(buttons, pressedButton)) {
        resolve({pressedButton, selectedIds});
      }
    };
  });
};

// IDEA-R: build an array of previous menus as an optional parameter to allow for backtracking
SoS.goToMenu = function goToMenu(player, message, buttons) {
  SoS.displayMenu(player, message, buttons);
  return SoS.setMenuButtons(player, buttons);
};

SoS.initializeMenu = async function initializeMenu(player) {
  await SoS.setMenuButtons(player, ['initializeMenu']);
  if (player.name === state.SoS.GM.name) {
    return await SoS.menuMainGm(player);
  } else {
    return await SoS.menuMainPlayer(player);
  }
};

SoS.menuMainGm = async function menuMainGm(player) {
  const {pressedButton} = await SoS.goToMenu(player, 'Main Menu: ', ['Combat', 'Roll Dice'])
  switch (pressedButton) {
    case 'Combat':
      return await SoS.menuGmCombat(player);
    case 'Roll Dice':
      return await SoS.menuselectDieSize(player);
  }
};


SoS.menuGmCombat = async function menuGmCombat(player) {
  try {
    const message = 'Select tokens and begin.';
    const buttons = ['Start Combat', 'Back'];
    const {pressedButton, selectedIds} = await SoS.goToMenu(player, message, buttons);
    switch (pressedButton) {
      case 'Start Combat':
        if (selectedIds.length > 0) {
          return SoS.startCombat(selectedIds);
        } else {
          sendChat('', '&{template:charMenu} {{name=Error}} {{message=No tokens selected}}');
          return SoS.menuGmCombat(player);
        }
      case 'Back':
        return SoS.menuMainGm(player);
    }
  } catch (error) {
    log(error);
  }
};
