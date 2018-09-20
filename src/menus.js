class Button {
  constructor(text, route) {
    this.text = text;
    this.no_spaces = text.replace(/\s+/g, '');
    this.route = route;
  }
  toString() {
    return '{{' + this.no_spaces + '=[' + this.text + '](!MML|' + this.route + ')}}';
  }
}

MML.displayMenu = function displayMenu(name, message, buttons) {
  const whisper = '/w "' + name + '"';
  const message_string = ' &{template:charMenu} {{name=' + message + '}} ';
  const button_string = buttons.map(button => button.toString()).join(' ');

  sendChat(name, whisper + message_string + button_string, null, { noarchive: true });
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
//   if (player.name === state.MML.gm.name) {
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

MML.characterMenu = function characterMenu(character_id, button_pressed) {
  // this isn't real code. just seeing if data structures make sense
  return MML.someMenu().pipe(
    switchMap(function (button) {
      switch (button) {
        case 'button':
          return button_pressed.pipe(filter(button => buttons.includes(button)));
      }
    }),
    switchMap(function (button) {
      switch (button) {
        case 'button':
          return MML.someOtherMenu(button_pressed);
      }
    }),
    switchMapTo(Rx.from({
      id: character_id,
      attribute: 'fatigue',
      value: Rx.combineLatest(character.fatigue).pipe(map(fatigue => fatigue + 1))
    }, {
      id: character_id,
      attribute: 'hp',
      value: Rx.of(10)
    }))
  );
}
