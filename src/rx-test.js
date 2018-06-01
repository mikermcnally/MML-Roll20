import "rxjs";
import * from 'rxjs/operators';

const test = Observable.create(function (observer) {
  observer.next(1);
  observer.complete();
});

test.subscribe(console.log);
