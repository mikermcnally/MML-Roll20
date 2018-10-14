import * as Rx from "rxjs";
import { filter, switchMapTo, takeWhile } from "rxjs/operators";

export function listenForRoute(route: Routes) {
  return function (router: Rx.Observable<Routes>) {
    return router.pipe(
      takeWhile(new_route => new_route.startsWith(route.slice(0, route.lastIndexOf('/') + 1))),
      filter(new_route => new_route === route)
    );
  };
};

export enum Routes {
  CharacterIndex = '/character/',
  CharacterAction = '/character/action' ,
  CharacterActionType = '/character/action/type',
  CharacterActionAttack = '/character/action/attack',
  CharacterActionAim = '/character/action/aim',
  CharacterActionObserve = '/character/action/observe',
  CharacterActionReadyItem = '/character/action/ready_item',
  CharacterActionCast = '/character/action/cast',
  CharacterActionCalledShot = '/character/action/called_shot',
  CharacterActionCalledShotNone = '/character/action/called_shot/none',
  CharacterActionCalledShotBodyPart = '/character/action/called_shot/body_part',
  CharacterActionCalledShotSpecific = '/character/action/called_shot/specific',
  CharacterActionStance = '/character/action/stance',
  CharacterActionStanceAggressive = '/character/action/stance/aggressive',
  CharacterActionStanceNeutral = '/character/action/stance/neutral',
  CharacterActionStanceDefensive = '/character/action/stance/defensive',
  CharacterActionMetaMagic = '/character/action/meta_magic',
}