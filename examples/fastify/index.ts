import { fastify } from 'fastify';
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

const app = fastify({ logger: true });

app.post<{ Body: PaymentRequestBody }>('/payments', async (req, reply) => {
  const { cardNumber, cvc, productId } = req.body;

  return Result.from(() => getProductPrice(productId))
    .map((price) => payForProduct(cardNumber, cvc, price))
    .map((successResult) => {
      reply.status(200).send({ message: successResult });
    })
    .mapErr(InvalidCVCError, () => {
      reply.status(422).send({ message: 'Invalid card CVC' });
    })
    .mapErr(UknownProductError, () => {
      reply.status(404).send({ message: `Product '${productId}' not found` });
    })
    .mapErr(MissingCardNumberError, () => {
      reply
        .status(400)
        .send({ message: `Invalid card number: '${cardNumber}'` });
    })
    .promise();
});

// Run the server!
app.listen({ port: 3000 }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
