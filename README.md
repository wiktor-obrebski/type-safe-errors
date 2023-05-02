# Type-safe errors in TypeScript

## Overview
`type-safe-errors` provides type-safe domain-specific errors to Typescript.  

The library offers an async promise-like interface and ensures type safety with easy-to-handle errors.

## Table Of Contents

* [Installation](#installation)
* [Philosophy](#philosophy)
* [Examples](./examples)
* [API Reference](./docs/REFERENCE.md)
* [Inspiration](#inspiration)
* [Troubleshooting](#troubleshooting)

## Installation

```sh
npm i type-safe-errors
```

### Basic example

```ts
import { Ok, Err } from 'type-safe-errors';

class InvalidCredentialsError extends Error {
  name = 'InvalidCredentialsError' as const;
}

// Function to authorize a user based on their username and password
function authorizeUser(username: string, password: string) {
  if (username === 'admin' && password === 'admin') {
    return Ok.of({
      name: 'admin',
      isAdmin: true,
    });
  } else {
    return Err.of(new InvalidCredentialsError());
  }
}

authorizeUser('admin', 'admin')
  // Handle successful authorization
  .map((user) => {
    console.log('authorized! hello ', user.name);
  })
  // Handle error in case of invalid credentials
  .mapErr(InvalidCredentialsError, (err) => {
    // err is fully typed err object (InvalidCredentialsError class instance)
    console.log('Invalid credentials!', err);
  });
```

### Async basic example
It's common to start a result chain with an async call, such as a call to your database or an external API.

There are a few ways to handle this, but the simplest is to use the dedicated helper function: [Result.from](./docs/REFERENCE.md#resultfromresultfactory).

```ts
import { Ok, Err, Result } from 'type-safe-errors';

class InvalidCredentialsError extends Error {
  name = 'InvalidCredentialsError' as const;
}

async function authorizeUser(username: string, password: string) {
  // simulate async call
  const storedPassword = await Promise.resolve('admin');
  if (username === 'admin' && password === storedPassword) {
    return Ok.of({
      name: 'admin',
      isAdmin: true,
    });
  } else {
    return Err.of(new InvalidCredentialsError());
  }
}

Result.from(() => authorizeUser('admin', 'admin'))
  .map((user) => {
    console.log('authorized! hello ', user.name);
  })
  .mapErr(InvalidCredentialsError, (err) => {
    // err is fully typed err object (InvalidCredentialsError class instance)
    console.log('Invalid credentials!', err);
  });

```
## Description
If you work with rich business logic, it's common to use exceptions in JavaScript to represent different states of the application. The problem with this solution and TypeScript is that when you catch an exception, you lose information about its types.

Let consider this simplified example from an [express](https://expressjs.com/) controller:

```ts
try {
  await payForProduct(userCard, product);
} catch (err) {
  res.send(500, "Internal server error");
}
```

By looking at this code, you cannot determine what kind of exception can happen.
Of course, you can check the `payForProduct` body, but what if it's called by other functions? And they call more? For rich business logic, it's unmaintainable to follow all possible custom exceptions just by reading the code.  

Because of this, it's common to just return `500` in such cases (`express` does it by default). However, there can be many errors that should be handled differently than a `500` status code. For example:

 - Maybe the user did not set any address data yet?
 - Maybe the user's cart has expired?
 - Maybe the user provided an invalid CVC number?

In each of these cases, the server should return a different status code along with specific error details. The client app should be informed of the reason, for example, by a `400` status code and error details in the response body. But first, to properly handle the errors, the developer must be aware of what errors can happen.
This is the problem that `type-safe-errors` library is trying to solve.  

![screen-gif](./docs/basic-example.gif)

(Full example: [./examples/basic-example](./examples/basic-example))

## Philosophy

### Minimal API
Keeping the API minimal reduces the learning curve and makes it easier for developers to understand and use the library effectively.

Learning and using `type-safe-errors` should be simple and straightforward. To achieve this, the API must be as simple and intuitive as possible.

It's one of the reasons why the result class is always async (for example, [neverthrow](https://github.com/supermacro/neverthrow) has two different result types, one for synchronous and one for asynchronous results handling).

The long-term goal is not to handle every possible use case. Instead, it's to do one thing well - providing a way to handle domain exceptions in a strong-typed, future-proof way.

### Practical API
Using `type-safe-erros` should be similar in feel to work with traditional js [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). You can [map](./docs/REFERENCE.md#okmapcallback) any success result (same like you can [then](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) fulfilled promise) or [mapAnyErr](./docs/REFERENCE.md#errmapanyerrcallback) (same as you can [catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch) rejected promise).

You may notice that the `type-safe-error` project is somehow based on [Either](https://github.com/sanctuary-js/sanctuary-either) concept from functional programming. But the goal was not to follow the idea closely but to provide an easy-to-use API in practical js work, focused on async programming.

## Inspiration
 - [Expressive error handling in TypeScript and benefits for domain-driven design](https://medium.com/inato/expressive-error-handling-in-typescript-and-benefits-for-domain-driven-design-70726e061c86)
 - [STOP throwing Exceptions! Start being Explicit](https://www.youtube.com/watch?v=4UEanbBaJy4&t=5s)
 - [200 OK! Error Handling in GraphQL](https://www.youtube.com/watch?v=A5-H6MtTvqk)
 - [neverthrow](https://github.com/supermacro/neverthrow)
 - [Khalil Stemmler: Flexible Error Handling w/ the Result Class](https://khalilstemmler.com/articles/enterprise-typescript-nodejs/handling-errors-result-class/)
 - [Functional Error Handling with Express.js and DDD](https://khalilstemmler.com/articles/enterprise-typescript-nodejs/functional-error-handling/)
 - [Either](https://github.com/sanctuary-js/sanctuary-either)

## Troubleshooting

### Errors seem not to be caught by `.mapErr(...)` function

Quick fix: Update your `tsconfig.json` file [`compilerOptions.target`](https://www.typescriptlang.org/tsconfig#target) option to at least `es6`.

The `type-safe-errors` library depends on `instanceof` standard JS feature.
The `instanceof` feature allows checking if an object is an instance of a particular class or constructor. In the context of `type-safe-errors`, it is used to verify if an error object is an instance of a specific error class.

However, extending the JavaScript [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) does not work correctly for TypeScript compilation targets `es5` and below. This issue is explained on [TypeScript wiki](https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work).

One option is to update `tsconfig.json` file [`compilerOptions.target`](https://www.typescriptlang.org/tsconfig#target) to `es6` or a higher version.
An alternative is to abstain from extending by JavaScript [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) class, e.g.

```ts
// original
class InvalidCredentialsError extends Error {
  name = 'InvalidCredentials' as const;
}

// without Error parent
class InvalidCredentialsError {
  name = 'InvalidCredentials' as const;
}
```

This works for most cases, but be aware that sometimes it can result in a rejection of a non-Error JavaScript object (instance of your class). This may interfere with some other tools (for example, Mocha can sometimes show cryptic error messages when a test fails).
