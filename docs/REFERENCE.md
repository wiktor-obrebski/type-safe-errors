# API Reference

`type-safe-errors` expose only three class-like abstraction: `Ok`, `Err` and `Result`.

## Ok
`Ok` objects represents a valid result of an action.

### Ok.of(...)

Create new `Ok` result. Static function (can be called only on imported `Ok` namespace, not on `Ok` results).

The operation is the results version of [Promise.resolve](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve) function.

**Signature:**

```typescript
Ok.of<TValue>(value: TValue): Ok<TValue>
```

**Examples:**

```typescript
import { Ok } from 'type-safe-errors';

const okResult = Ok.of({
  name: "John",
  surname: "Doe"
});
```

---

### ok.map(callback)

Map `Ok` result to a different result.
Interface common for both types of results: [result.map(callback)](#resultmapcallback)

The operation is the results version of [Promise.prototype.then](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) function.
---

### ok.mapErr(ErrorClass, callback)

Do nothing for `Ok` results.
Interface common for both types of results: [result.mapErr(ErrorClass, callback)](#resultmaperrerrorclass-callback)

---

### ok.mapAnyErr(callback)

Do nothing for `Ok` results.
Interface common for both types of results: [result.mapAnyErr(callback)](#resultmapanyerrcallback)

The operation is the results version of [Promise.prototype.catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch) function.
---

### ok.unsafePromise()

Map `Ok` to a fulfilled [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). 
Interface common for both types of results: [result.unsafePromise()](#resultunsafePromise)

---

### ok.promise()

Map an `Ok` result to a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). The promise will resolve with origin `Ok` result value.

This is only one function that is not available for `Err` results by design.
It's purpose is to allow to detect unhandled `Err` results that can appear in the results chain in the future.

**Signature:**

```typescript
Ok<TOk>.promise(): Promise<TOk>
```

**Examples:**

```typescript
import { Ok, Err } from 'type-safe-errors';
import { UserNotFound } from './errors';

async function promiseResolver() {
  const number5 = await Ok.of(5).promise();

  // the line below will not compile, giving you fast feedback about the problem
  await Err.of(new UserNotFound()).promise();
}
```

---


## Err
`Err` represents an invalid result of an action.

### Err.of(...)

Create new `Err` result. Static function (can be called only on imported `Err` namespace, not on `Err` results).

The operation is the results version of [Promise.reject](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject) function.

**Signature:**

```typescript
Err.of<TError>(value: TError): Err<TError>
```

**Examples:**

```typescript
import { Err } from 'type-safe-errors';

class UserNotFound {
  __brand!: "UserNotFound"
}

const errResult = Err.of(new UserNotFound());
```

---

### err.map(callback)

Do nothing for `Err` results.
Interface common for both types of results: [result.map(callback)](#resultmapcallback)

---

### err.mapErr(ErrorClass, callback)

Map `Err` result of specified class to a different result.
Interface common for both types of results: [result.mapErr(ErrorClass, callback)](#resultmaperrerrorclass-callback)

---

### err.mapAnyErr(callback)

Map `Err` result to a different result.
Interface common for both types of results: [result.mapAnyErr(callback)](#resultmapanyerrcallback)

---

### err.unsafePromise()

Map `Err` to a rejected [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). 
Interface common for both types of results: [result.unsafePromise()](#resultunsafePromise)

---

## Result

`Result` provide static utility functions to work with multiple results.

### Result.combine([result1, result2, ...])

 Combine provided results list into single result. If all provided results are `Ok`, returned result will be `Ok` of array of provided results values: `[Ok<A>, Ok<B>] -> Ok<[A, B]>`  
If provided results list have at least one `Err` result, returned result will be `Err` of first `Err` result value found in the array.

The operation is the results version of [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) function.

**Signature:**

```typescript
Result.combine(results: [Result<A>, Result<B>, ...]): Result<[A, B, ...]>
```

**Examples:**

```typescript
import { Ok, Result } from 'type-safe-errors';

const ok1Result = Ok.of(5);
const ok2Result = Ok.of(9);
const okSumResult = Result.combine([ok1Result, ok2Result]).map(
  ([val1, val2]) => val1 + val2
)
```

---

## Results common interface
`Ok` and `Err` are both results and share common interface.

### result.map(callback)

Map given `Ok` result to another result. 

**Signature:**

```typescript
// if `callback` return a value, the `map` function will return Ok.of(value)
Ok<TOk>.map<TReturn>(callback: (value: TOk) => TReturn): Ok<TReturn>

// if `callback` return a `Result`, the `map` function will return given `Result`
Ok<TOk>.map<TReturnResult>(callback: (value: TOk) => TReturnResult): TReturnResult

// called on an `Err` `map` function will return origin `Err` (the `callback` won't be called)
Err<TErr>.map<unknown>(callback: (value: never) => never): Err<TErr>;
```

**Examples:**

```typescript
import { Ok, Err } from 'type-safe-errors';

class UserNotFound {
  __brand: "UserNotFound"
}

const okOfNumber5 = Ok.of(10).map(value => value / 2);

const errOfUserNotFound = Ok.of(10).map(value => Err.of(new UserNotFound()));

const originErr = Err.of(new UserNotFound());
const sameOriginErr = originErr.map(val => val + 5);
```

---

### result.mapErr(ErrorClass, callback)

Map `Err` result of given class to another result. 

**Signature:**

```typescript
// if `Err` is instance of `classType` and the `callback` return a value, the `mapErr` function will return Ok.of(value)
Err<TErr>.mapErr<TClass, TReturn>(classType: TClass, callback: (value: TErr) => TReturn): Ok<TReturn>

// if `Err` is instance of `classType` and the `callback` return a `Result`, the `mapErr` function will return given `Result`
Err<TErr>.mapErr<TClass, TReturnResult>(classType: TClass, callback: (value: TErr) => TReturnResult): TReturnResult

// called on an `Ok` result, the `mapErr` function will return origin `Ok` (the `callback` won't be called)
Ok<TOk>.mapErr<unknown>(classType: unknown, callback: (value: never) => never): Ok<TOk>
```

**Examples:**

```typescript
import { Ok, Err } from 'type-safe-errors';
import { UserNotFound, Http404Error } from './errors';

const defaultUser = {
  name: 'John Doe',
}

const okOfDefaultUser = Err.of(new UserNotFound())
  .mapErr(UserNotFound, err => defaultUser);

const errOfHttp404 = Err.of(new UserNotFound())
  .mapErr(UserNotFound, err => Err.of(new Http404Error()));

const errOfUserNotFound = Err.of(new UserNotFound())
  .mapErr(Http404Error, err => 123);

const originOk = Ok.of(5);
const okOfNumber5 = originOk.mapErr(UserNotFound, err => null);
```

---

### result.mapAnyErr(callback)

Map `Err` result to another result. 

**Signature:**

```typescript
// if `callback` return a value, the `mapAnyErr` function will return Ok.of(value)
Err<TErr>.mapAnyErr<TReturn>(callback: (value: TErr) => TReturn): Ok<TReturn>

// if `callback` return a `Result`, the `mapAnyErr` function will return given `Result`
Err<TErr>.mapAnyErr<TReturnResult>(callback: (value: TErr) => TReturnResult): TReturnResult

// called on an `Ok` result, the `mapAnyErr` function will return origin `Ok` (the `callback` won't be called)
Ok<TOk>.mapAnyErr<unknown>(callback: (value: never) => never): Ok<TOk>
```

**Examples:**

```typescript
import { Ok, Err } from 'type-safe-errors';
import { UserNotFound, Http404Error } from './errors';

const defaultUser = {
  name: 'John Doe',
}

const okOfDefaultUser = Err.of(new UserNotFound())
  .mapAnyErr(err => defaultUser);

const errOfHttp404 = Err.of(new UserNotFound())
  .mapAnyErr(err => Err.of(new Http404Error()));

const originOk = Ok.of(5);
const okOfNumber5 = originOk.mapAnyErr(err => 123);
```

---

### result.unsafePromise()

Map any result to a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). 
`Ok` result will resolve the promise, `Err` will reject it.  

WARNING: the function is not recommended, as the operation will lost information about types of errors. Consider using of [ok.promise()](#okpromise) instead.

**Signature:**

```typescript
// called on an `Ok` result, the `unsafePromise` function will return promise that will resolve with `Ok` result value
Ok<TOk>.unsafePromise(): Promise<TOk>

// called on an `Err` result, the `unsafePromise` function will return promise that will reject with `Err` result value
Err<TErr>.unsafePromise(): Promise<never>


```

**Examples:**

```typescript
import { Ok, Err } from 'type-safe-errors';
import { UserNotFound } from './errors';

async function promiseResolver() {
  const number5 = await Ok.of(5).unsafePromise();

  // the line below will throw `UserNotFound` exception,
  // as the promise will reject
  await Err.of(new UserNotFound()).unsafePromise();
}
```

---
