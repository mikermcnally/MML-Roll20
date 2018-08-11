MML.sendChatMenu = function sendChatMenu(name, message, buttons) {
  var toChat = '/w "' + name +
    '" &{template:charMenu} {{name=' + message + '}} ' +
    buttons.map(function(button) {
      return '{{' + button.replace(/\s+/g, '') + '=[' + button + '](!MML|' + button + ')}}';
    }).join(' ');

  sendChat(name, toChat, null, {
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

// IDEAR: build an array of previous menus as an optional parameter to allow for backtracking
MML.displayMenu = function displayMenu(player, message, buttons) {
  MML.sendChatMenu(player, message, buttons);
  return MML.setMenuButtons(player, buttons);
};

MML.initializeMenu = Rx.merge(
  MML.buttonPressed.pipe(
    filter(message => message.content === 'initializeMenu'),
    take(1)
  )
);

// function initializeMenu(player) {
//   await MML.setMenuButtons(player, ['initializeMenu']);
//   if (player.name === state.MML.GM.name) {
//     return await MML.menuMainGm(player);
//   } else {
//     return await MML.menuMainPlayer(player);
//   }
// };

MML.menuMainGm = MML.initializeMenu.pipe(
  tap(message => MML.displayMenu(message.who, 'Main Menu: ', ['Combat', 'Roll Dice'])),
  switchMapTo(MML.buttonPressed)
);

// function menuMainGm(player) {
//   const {pressedButton} = 
//   switch (pressedButton) {
//     case 'Combat':
//       return MML.menuGmCombat(player);
//     case 'Roll Dice':
//       return MML.menuselectDieSize(player);
//   }
// };

MML.menuGmCombat = MML.menuMainGm.pipe(
  filter(message => message.content === 'Combat'),
  tap(message => MML.displayMenu(message.who, 'Select tokens and begin.', ['Start Combat', 'Back']))
);

MML.startCombat = MML.menuGmCombat.pipe(
  switchMapTo(MML.buttonPressed),
  filter(message => message.content === 'Start Combat' && message.selected.length > 0)
);

MML.startCombat.subscribe(() => log('start'));

// async function menuGmCombat(player) {
//   try {
//     const message = 'Select tokens and begin.';
//     const buttons = ['Start Combat', 'Back'];
//     const {pressedButton, selectedIds} = await MML.displayMenu(player, message, buttons);
//     switch (pressedButton) {
//       case 'Start Combat':
//         if (selectedIds.length > 0) {
//           return MML.startCombat(selectedIds);
//         } else {
//           sendChat('', '&{template:charMenu} {{name=Error}} {{message=No tokens selected}}');
//           return MML.menuGmCombat(player);
//         }
//       case 'Back':
//         return MML.menuMainGm(player);
//     }
//   } catch (error) {
//     log(error);
//   }
// };
