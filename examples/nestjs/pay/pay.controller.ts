import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';

import { InvalidCVC, UknownProduct, MissingCardNumber } from './errors';
import { PayService } from './pay.service';

class PaymentDto {
  cardNumber!: string;
  cvc!: string;
  productId!: string;
}

@Controller('/payments')
export class PayController {
  constructor(private readonly payService: PayService) {}

  @Post()
  createPayment(@Res() res: Response, @Body() payment: PaymentDto) {
    const { cardNumber, cvc, productId } = payment;

    const paymentResult = this.payService
      .getProductPrice(productId)
      .map((price) => this.payService.payForProduct(cardNumber, cvc, price));

    return paymentResult
      .map((successResult) => {
        res.status(200).send({ message: successResult });
      })
      .mapErr(InvalidCVC, () => {
        res.status(422).send({ message: 'Invalid card CVC' });
      })
      .mapErr(UknownProduct, () => {
        res.status(404).send({ message: `Product '${productId}' not found` });
      })
      .mapErr(MissingCardNumber, () => {
        res
          .status(400)
          .send({ message: `Invalid card number: '${cardNumber}'` });
      })
      .promise();
  }
}
