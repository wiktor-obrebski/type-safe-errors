# Type-safe errors in TypeScript

## Description

`type-safe-errors` is a library that provide type-safe domain errors to Typescript.  

Basic example

```ts
import { Ok, Err } from '../index';

class InvalidCredentials extends Error {
  __brand!: 'InvalidCredentials';
}

authorizeUser('admin', 'admin')
  .map((user) => {
    // user is full typed object {name: string, isAdmin: boolean}
    console.log('authorized! hello ', user.name);
  })
  .mapErr(InvalidCredentials, (err) => {
    // err is fully typed err object (InvalidCredentials class instance)
    console.log('Invalid credentials!', err);
  });

function authorizeUser(username: string, password: string) {
  if (username !== 'admin' || password !== 'admin') {
    return Err.of(new InvalidCredentials());
  }

  return Ok.of({
    name: 'admin',
    isAdmin: true,
  });
}
```

## Table Of Contents

* [Installation](#installation)
* [Philosphy](#philosphy)
* [API Reference](./docs/REFERENCE.md)
* [Inspiration](#inspiration)

## Installation

```sh
npm i type-safe-errors
```

```ts
import { Ok } from 'type-safe-errors';

const okValue = Ok.of(5);
okValue
    .map(val => 2 * val)
    .map((val) => console.log(val));
```

## Philosphy
[Describe the project philosphy: minimal API, practical API, async]



## Inspiration
[Reference `Khalil` ("https://khalilstemmler.com/"), `neverthrow` and others]
