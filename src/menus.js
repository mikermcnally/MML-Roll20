MML.displayMenu = function displayMenu(player, message, buttons) {
  var toChat = '/w "' + player.name +
    '" &{template:charMenu} {{name=' + message + '}} ' +
    buttons.map(function(button) {
      return '{{' + button.replace(/\s+/g, '') + '=[' + button + '](!MML|' + button + ')}}';
    }).join(' ');

  sendChat(player.name, toChat, null, {
    noarchive: true
  });
};

MML.setMenuButtons = function setMenuButtons(player, buttons) {
  return new Promise(function(resolve, reject) {
    player.buttonPressed = function(pressedButton, selectedIds) {
      if (_.contains(buttons, pressedButton)) {
        resolve({pressedButton, selectedIds});
      }
    };
  });
};

// IDEA-R: build an array of previous menus as an optional parameter to allow for backtracking
MML.goToMenu = function goToMenu(player, message, buttons) {
  MML.displayMenu(player, message, buttons);
  return MML.setMenuButtons(player, buttons);
};

MML.initializeMenu = async function initializeMenu(player) {
  await MML.setMenuButtons(player, ['initializeMenu']);
  if (player.name === state.MML.GM.name) {
    return await MML.menuMainGm(player);
  } else {
    return await MML.menuMainPlayer(player);
  }
};

MML.menuMainGm = async function menuMainGm(player) {
  const {pressedButton} = await MML.goToMenu(player, 'Main Menu: ', ['Combat', 'Roll Dice'])
  switch (pressedButton) {
    case 'Combat':
      return await MML.menuGmCombat(player);
    case 'Roll Dice':
      return await MML.menuselectDieSize(player);
  }
};


MML.menuGmCombat = async function menuGmCombat(player) {
  try {
    const message = 'Select tokens and begin.';
    const buttons = ['Start Combat', 'Back'];
    const {pressedButton, selectedIds} = await MML.goToMenu(player, message, buttons);
    switch (pressedButton) {
      case 'Start Combat':
        if (selectedIds.length > 0) {
          return MML.startCombat(selectedIds);
        } else {
          sendChat('', '&{template:charMenu} {{name=Error}} {{message=No tokens selected}}');
          return MML.menuGmCombat(player);
        }
      case 'Back':
        return MML.menuMainGm(player);
    }
  } catch (error) {
    log(error);
  }
};
