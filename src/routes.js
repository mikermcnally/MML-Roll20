const EventEmitter = require('events');
const Rx = require('rxjs');

const {
  audit,
  auditTime,
  buffer,
  bufferCount,
  bufferTime,
  bufferToggle,
  bufferWhen,
  catchError,
  combineAll,
  combineLatest,
  concat,
  concatAll,
  concatMap,
  concatMapTo,
  count,
  debounce,
  debounceTime,
  defaultIfEmpty,
  delay,
  delayWhen,
  dematerialize,
  distinct,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  elementAt,
  endWith,
  every,
  exhaust,
  exhaustMap,
  expand,
  filter,
  finalize,
  find,
  findIndex,
  first,
  groupBy,
  ignoreElements,
  isEmpty,
  last,
  map,
  mapTo,
  materialize,
  max,
  merge,
  mergeAll,
  mergeMap,
  flatMap,
  mergeMapTo,
  mergeScan,
  min,
  multicast,
  observeOn,
  onErrorResumeNext,
  pairwise,
  partition,
  pluck,
  publish,
  publishBehavior,
  publishLast,
  publishReplay,
  race,
  reduce,
  repeat,
  repeatWhen,
  retry,
  retryWhen,
  refCount,
  sample,
  sampleTime,
  scan,
  sequenceEqual,
  share,
  shareReplay,
  single,
  skip,
  skipLast,
  skipUntil,
  skipWhile,
  startWith,
  subscribeOn,
  switchAll,
  switchMap,
  switchMapTo,
  take,
  takeLast,
  takeUntil,
  takeWhile,
  tap,
  throttle,
  throttleTime,
  throwIfEmpty,
  timeInterval,
  timeout,
  timeoutWith,
  timestamp,
  toArray,
  window,
  windowCount,
  windowTime,
  windowToggle,
  windowWhen,
  withLatestFrom,
  zip,
  zipAll
} = require('rxjs/operators');

const emitter = new EventEmitter();

class Namespace {
  constructor(paths) {
    Object.assign(this, paths);
  }
}

function navigate(routes, route) {
  const endpoint = route.reduce((obj, key) => obj[key] ? obj[key] : {}, routes);
  return endpoint instanceof Namespace ? endpoint[''] : endpoint;
}

const button_pressed = Rx.fromEvent(emitter, 'button_pressed');

const menu_idle = button_pressed.pipe(
  filter(({
    content
  }) => ['initializeMenu'].includes(content)),
  mapTo(['gm'])
);

const gm_main = button_pressed.pipe(
  filter(({
    content
  }) => ['Combat'].includes(content)),
  map(function (message) {
    switch (message.content) {
      case 'Combat':
        return ['gm', 'combat'];
      case 'Exit':
        return [];
    }
  })
);

const select_combatants = button_pressed.pipe(
  filter(({
    content
  }) => ['Start Combat', 'Back'].includes(content)),
  map(function (message) {
    switch (message.content) {
      case 'Start Combat':
        return ['gm', 'combat', 'prepare_actions'];
      case 'Back':
        return ['gm'];
    }
  })
);

const routes = new Namespace({
  '': menu_idle,
  'gm': new Namespace({
    '': gm_main,
    'combat': new Namespace({
      '': select_combatants,
      'prepare_actions': Rx.of([]),
    })
  })
});

const router = Rx.of([]).pipe(
  expand(function (route) {
    return Rx.merge(
        navigate(routes, route)
      )
      .pipe(
        take(1),
        catchError(() => Rx.of([]))
      );
  })
);


router.pipe(
    tap(value => console.log(JSON.stringify(value)), error => console.log(), () => console.log()),
    zip(Rx.from([{
        content: 'initializeMenu'
      },
      {
        content: 'Combat'
      },
      {
        content: 'Back'
      },
      {
        content: 'Combat'
      },
      {
        content: 'Start Combat'
      }
    ])),
    map(([route, button]) => button),
    tap(value => console.log(JSON.stringify(value)), error => console.log(), () => console.log())
  )
  .subscribe(button => emitter.emit('button_pressed', button));