import { fastify } from 'fastify';
import { Err, Ok } from 'type-safe-errors';

const supportedProductId = '123';
const supportedCVC = '456';

const app = fastify({ logger: true });

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
      reply.status(404).send({ message: `Product "${productId}" not found.` });
    })
    .promise();
});

// Run the server!
app.listen(3000, function (err, address) {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});

interface PaymentRequestBody {
  cardNumber: string;
  cvc: string;
  productId: string;
}

function payForProduct(cardNumber: string, cvc: string, productPrice: number) {
  if (cvc !== supportedCVC) {
    return Err.of(new InvalidCVC());
  }

  return Ok.of(`Success. Payed ${productPrice}`);
}

function getProductPrice(productId: string) {
  return productId === supportedProductId
    ? Ok.of(12.5)
    : Err.of(new UknownProduct());
}

class InvalidCVC {
  __brand!: 'InvalidCVC';
}

class UknownProduct {
  __brand!: 'UknownProduct';
}
