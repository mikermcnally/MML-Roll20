import * as Rx from "rxjs";
import { filter, takeWhile } from "rxjs/operators";

export function listenForRoute(route: IRoute) {
  return function (router: Rx.Observable<IRoute>) {
    return router.pipe(
      takeWhile(new_route => new_route.path.startsWith(new_route.path.slice(0, new_route.path.lastIndexOf('/') + 1))),
      filter(new_route => new_route === route)
    );
  };
};

export interface IRoute {}

export class CharacterRoute implements IRoute {
  path: string;
  constructor(path: string) {
    this.path = path;
  }
}

export class Routes {
  static character_index = '/character/' as IRoute;
  static character_action = '/character/action' as IRoute;
  static character_action_type = '/character/action/type'as IRoute;
  static character_action_attack = '/character/action/attack'as IRoute;
  static character_action_aim = '/character/action/aim'as IRoute;
  static character_action_observe = '/character/action/observe'as IRoute;
  static character_action_ready_item = '/character/action/ready_item'as IRoute;
  static character_action_cast = '/character/action/cast'as IRoute;
  static character_action_called_shot = '/character/action/called_shot'as IRoute;
  static character_action_called_shot_none = '/character/action/called_shot/none'as IRoute;
  static character_action_called_shot_body_part = '/character/action/called_shot/body_part'as IRoute;
  static character_action_called_shot_specific = '/character/action/called_shot/specific'as IRoute;
  static character_action_stance = '/character/action/stance'as IRoute;
  static character_action_stance_aggressive = '/character/action/stance/aggressive'as IRoute;
  static character_action_stance_neutral = '/character/action/stance/neutral'as IRoute;
  static character_action_stance_defensive = '/character/action/stance/defensive'as IRoute;
  static character_action_meta_magic = '/character/action/meta_magic'as IRoute;
}