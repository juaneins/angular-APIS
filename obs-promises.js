const { Observable } = require("rxjs");
const { filter } = require("rxjs/operators");

const doSomething = () => {
  return new Promise((resolve) => {
    // resolve("value 1");
    // resolve("value 2");
    setTimeout(() => {
      resolve("value 3");
    }, 3000);
  });
};

const doSomething$ = () => {
  return new Observable((observer) => {
    observer.next("value 1$");
    observer.next("value 2$");
    observer.next("value 3$");
    observer.next(null);
    setTimeout(() => {
      observer.next("value 4$");
    }, 5000);
    setTimeout(() => {
      observer.next(null);
    }, 6000);
    setTimeout(() => {
      observer.next("value 5$");
    }, 8000);
  });
};

(async () => {
  const rta = await doSomething();
  console.log(rta);
})();

(() => {
  const obs$ = doSomething$();
  obs$.pipe(filter((value) => value !== null)).subscribe((rta) => {
    console.log(rta);
  });
})();
