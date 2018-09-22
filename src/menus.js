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

MML.listenForRoute = function listenForRoute(router, route) {
  return function (source) {
    return source.pipe(switchMapTo(
      router.pipe(
        takeWhile(new_route => new_route.startsWith(route.slice(0, route.lastIndexOf('/') + 1))),
        filter(new_route => new_route === route)
      )
    ))
  };
};
