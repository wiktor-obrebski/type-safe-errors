import { Injectable } from '@nestjs/common';
import { InvalidCVC, UknownProduct, MissingCardNumber } from './errors';
import { Err, Ok } from 'type-safe-errors';

const supportedProductId = '123';
const supportedCVC = '456';

@Injectable()
export class PayService {
  payForProduct(cardNumber: string, cvc: string, productPrice: number) {
    if (cvc !== supportedCVC) {
      return Err.of(new InvalidCVC());
    }

    if (!cardNumber) {
      return Err.of(new MissingCardNumber());
    }

    return Ok.of(`Success. Payed ${productPrice}`);
  }

  getProductPrice(productId: string) {
    return productId === supportedProductId
      ? Ok.of(12.5)
      : Err.of(new UknownProduct());
  }
}
