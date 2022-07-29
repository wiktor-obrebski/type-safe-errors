import { Injectable } from '@nestjs/common';
import { Err, Ok } from 'type-safe-errors';
import {
  InvalidCVCError,
  UknownProductError,
  MissingCardNumberError,
} from './errors';

const supportedProductId = '123';
const supportedCVC = '456';

@Injectable()
export class PayService {
  async payForProduct(cardNumber: string, cvc: string, productPrice: number) {
    // simulate fetching data
    await sleep(10);

    if (cvc !== supportedCVC) {
      return Err.of(new InvalidCVCError());
    }

    if (!cardNumber) {
      return Err.of(new MissingCardNumberError());
    }

    return Ok.of(`Success. Payed ${productPrice}`);
  }

  async getProductPrice(productId: string) {
    // simulate fetching data
    await sleep(10);

    return productId === supportedProductId
      ? Ok.of(12.5)
      : Err.of(new UknownProductError());
  }
}

function sleep(sleepMs: number) {
  return new Promise((resolve) => setTimeout(resolve, sleepMs));
}
