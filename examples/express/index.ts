import express from 'express';
import morgan from 'morgan';

import { getProductPrice, payForProduct } from './pay';
import { InvalidCVC, UknownProduct, MissingCardNumber } from './errors';

interface PaymentRequestBody {
  cardNumber: string;
  cvc: string;
  productId: string;
}

const app = express();
const logger = morgan('combined');
app.use(logger);
app.use(express.json());

app.post<{ Body: PaymentRequestBody }>('/payments', async (req, reply) => {
  const { cardNumber, cvc, productId } = req.body;

  const paymentResult = getProductPrice(productId).map((price) =>
    payForProduct(cardNumber, cvc, price)
  );

  return paymentResult
    .map((successResult) => {
      reply.status(200).send({ message: successResult });
    })
    .mapErr(InvalidCVC, () => {
      reply.status(422).send({ message: 'Invalid card CVC' });
    })
    .mapErr(UknownProduct, () => {
      reply.status(404).send({ message: `Product '${productId}' not found` });
    })
    .mapErr(MissingCardNumber, () => {
      reply
        .status(400)
        .send({ message: `Invalid card number: '${cardNumber}'` });
    })
    .promise();
});

// Run the server!
app.listen(3000, () => {
  console.info(`server listening on 3000`);
});
