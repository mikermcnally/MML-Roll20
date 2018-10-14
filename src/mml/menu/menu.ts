import { UserName } from "../mml";
import Button from "./button";

export default class Menu {
  readonly player_name: UserName;
  readonly message: string;
  readonly buttons: Array<Button>;
  constructor(player_name: UserName, message: string, buttons: Array<Button>) {
    this.player_name = player_name;
    this.message = message;
    this.buttons = buttons;
  }

  display() {
    const whisper = '/w "' + this.player_name + '"';
    const message_string = ' &{template:charMenu} {{name=' + this.message + '}} ';
    const button_string = this.buttons.map(button => button.toString()).join(' ');

    sendChat(this.player_name, whisper + message_string + button_string, null, { noarchive: true });
  }
}
