/**
 * Callbacks are terrible. This file lets us actually use events
 */

const r20_ready = Rxify('ready').pipe(take(1));
const character_added = r20_ready.pipe(switchMapTo(Rxify('add:character')));
const attribute_added = r20_ready.pipe(switchMapTo(Rxify('add:attribute')));
const chat = r20_ready.pipe(switchMapTo(Rxify('chat:message')));
const token_changed = r20_ready.pipe(switchMapTo(Rxify('change:token')));
const character_name_changed = r20_ready.pipe(switchMapTo(Rxify('change:character:name')));
const current_attribute_changed_global = r20_ready.pipe(switchMapTo(Rxify('change:attribute:current')));
const player_online_changed = r20_ready.pipe(switchMapTo(Rxify('change:player:_online')));

function Rxify(event_name) {
  return Rx.Observable.create(function (observer) {
      on(event_name, function (event) {
        observer.next(event);
      });
    })
    .pipe(share());
}
