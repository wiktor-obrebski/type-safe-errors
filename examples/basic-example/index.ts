import { payForProduct } from './pay';
import { MissingPrice, InvalidCVC } from './types';

const userCard = {
  number: '1234',
  cvc: Math.random() > 0.5 ? '456' : '',
};

const product = {
  price: Math.random() > 0.5 ? 12.5 : null,
};

const paymentResult = payForProduct(userCard, product);

const handledCVCResult = paymentResult.mapErr(InvalidCVC, () => {
  return 'Your card do not have proper CVC code';
});

const handledAllResult = handledCVCResult.mapErr(MissingPrice, () => {
  return 'Product do not have price';
});

handledAllResult.promise().then((resultText) => console.log(resultText));
