# `type-safe-errors` fastify example

The program presents simple [express](https://expressjs.com/) server with one endpoint supported by `type-safe-errors` library.

Run instructions:
```bash
npm i
npm start
```

## Test scenarios

### Missing card number

```bash
echo '{"productId":"123", "cvc": "456"}' | \
  curl --header "Content-Type: application/json" \
    --request POST \
    --data-binary @- \
    http://localhost:3000/payments
```

### Invalid cvc

```bash
echo '{"productId":"123", "cvc": "999", "cardNumber": "123456789"}' | \
  curl --header "Content-Type: application/json" \
    --request POST \
    --data-binary @- \
    http://localhost:3000/payments
```

### Product not found

```bash
echo '{"productId":"404", "cvc": "456", "cardNumber": "123456789"}' | \
  curl --header "Content-Type: application/json" \
    --request POST \
    --data-binary @- \
    http://localhost:3000/payments
```

### Payment successful

```bash
echo '{"productId":"123", "cvc": "456", "cardNumber": "123456789"}' | \
  curl --header "Content-Type: application/json" \
    --request POST \
    --data-binary @- \
    http://localhost:3000/payments
```
