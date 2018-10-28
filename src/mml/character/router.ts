import { Character } from "./character";
import { ButtonPressed } from "../mml";
import * as Rx from "rxjs";
import { filter, map } from "rxjs/operators";
import { Routes, listenForRoute, IRoute} from "../routes";

export class CharacterRouter {
  readonly idle: Rx.Observable<IRoute>;
  readonly action_menu: Rx.Observable<IRoute>;
  readonly stance_menu: Rx.Observable<IRoute>;
  readonly called_shot_menu: Rx.Observable<IRoute>;
  readonly meta_magic_menu: Rx.Observable<IRoute>;

  constructor(id: Character['id']) {
    const router = ButtonPressed.pipe(
      filter(({ content }) => content.startsWith(id)),
      map(message => message.content.replace(id, '') as Routes)
    );

    this.idle = router.pipe(listenForRoute(Routes.character_index));
    this.action_menu = this.idle.pipe(listenForRoute(Routes.character_action));
    this.stance_menu = this.action_menu.pipe(listenForRoute(Routes.character_action_stance));
    this.called_shot_menu = this.action_menu.pipe(listenForRoute(Routes.character_action_called_shot));
    this.meta_magic_menu = this.action_menu.pipe(listenForRoute(Routes.character_action_meta_magic));
  }
}