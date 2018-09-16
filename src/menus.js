MML.displayMenu = function displayMenu(player, message, buttons) {
  return Rx.defer(function () {
    const whisper = '/w "' + player.name +'"';
    const message_string = ' &{template:charMenu} {{name=' + message + '}} ';
    const button_string = buttons.map(button => '{{' + button.replace(/\s+/g, '') + '=[' + button + '](!MML|' + button + ')}}')
      .join(' ');

    sendChat(player.name, whisper + message_string + button_string, null, {
      noarchive: true
    });

    return MML.buttonPressed.pipe(
      filter(message => player.name === message.who && buttons.includes(message.content)),
      take(1)
    );
  });
};

// IDEAR: build an array of previous menus as an optional parameter to allow for backtracking
// MML.displayMenu = function displayMenu(player, message, buttons) {
//   MML.sendChatMenu(player, message, buttons);
//   return MML.setMenuButtons(player, buttons);
// };

// MML.initializeMenu = Rx.merge(
//   MML.buttonPressed.pipe(
//     filter(message => message.content === 'initializeMenu'),
//     take(1)
//   )
// );

// function initializeMenu(player) {
//   await MML.setMenuButtons(player, ['initializeMenu']);
//   if (player.name === state.MML.GM.name) {
//     return await MML.menuMainGm(player);
//   } else {
//     return await MML.menuMainPlayer(player);
//   }
// };

function initializeMenu(player) {
  if (playerIsGM(player.id)) {
    return MML.menuMainGm(player);
  } else {
    return MML.menuMainPlayer(player);
  }
};

MML.menuMainGm = function menuMainGm(player) {
  return MML.displayMenu(player.name, 'Main Menu: ', ['Combat']).pipe(
    switchMap(function ({content}) {
      switch (content) {
        case 'Combat':
          return MML.menuGmCombat(player);
        default:
          return Rx.throwError('NANI?!');
      }
    })
  );
};

// button clicks

// display next menu
// update internal menu state
// 

// function menuMainGm(player) {
//   const {pressedButton} = 
//   switch (pressedButton) {
//     case 'Combat':
//       return MML.menuGmCombat(player);
//     case 'Roll Dice':
//       return MML.menuselectDieSize(player);
//   }
// };

MML.menuGmCombat = function menuGmCombat(player) {
  const message = 'Select tokens and begin.';
  const buttons = ['Start Combat', 'Back'];
  return MML.displayMenu(player, message, buttons).pipe(
    switchMap(function ({ content, selected }) {
      switch (content) {
        case 'Start Combat':
          if (selected.length > 0) {
            return MML.startCombat(selected);
          } else {
            sendChat('', '&{template:charMenu} {{name=Error}} {{message=No tokens selected}}');
            return MML.menuGmCombat(player);
          }
        case 'Back':
          return MML.menuMainGm(player);
        default:
          return Rx.throwError('NANI?!');
      }
    })
  );
};

MML.startCombat = MML.menuGmCombat.pipe(
  switchMapTo(MML.buttonPressed),
  filter(message => message.content === 'Start Combat' && message.selected.length > 0)
);
