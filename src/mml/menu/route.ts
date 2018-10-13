import * as Rx from "rxjs";
import { filter, switchMapTo, takeWhile } from "rxjs/operators";

export type Route = string & { __type: Route };

export function listenForRoute(router: Rx.Observable<Route>, route: Route) {
  return function (source: Rx.Observable<any>) {
    return source.pipe(switchMapTo(
      router.pipe(
        takeWhile(new_route => new_route.startsWith(route.slice(0, route.lastIndexOf('/') + 1))),
        filter(new_route => new_route === route)
      )
    ))
  };
};