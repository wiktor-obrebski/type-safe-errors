import express from 'express';
import morgan from 'morgan';
import { Result } from 'type-safe-errors';

import { getProductPrice, payForProduct } from './pay';
import {
  InvalidCVCError,
  UknownProductError,
  MissingCardNumberError,
} from './errors';

interface PaymentRequestBody {
  cardNumber: string;
  cvc: string;
  productId: string;
}

const app = express();
const logger = morgan('combined');
app.use(logger);
app.use(express.json());

app.post<{ Body: PaymentRequestBody }>('/payments', async (req, res) => {
  const { cardNumber, cvc, productId } = req.body;

  return Result.from(() => getProductPrice(productId))
    .map((price) => payForProduct(cardNumber, cvc, price))
    .map((successResult) => {
      res.status(200).send({ message: successResult });
    })
    .mapErr(InvalidCVCError, () => {
      res.status(422).send({ message: 'Invalid card CVC' });
    })
    .mapErr(UknownProductError, () => {
      res.status(404).send({ message: `Product '${productId}' not found` });
    })
    .mapErr(MissingCardNumberError, () => {
      res.status(400).send({ message: `Invalid card number: '${cardNumber}'` });
    })
    .promise();
});

// Run the server!
app.listen(3000, () => {
  console.info(`server listening on 3000`);
});
