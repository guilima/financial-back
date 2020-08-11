import Router from '@koa/router';
import { WalletBusiness, search, PaymentBusiness, detailPayment, walletPayment, cards } from '@business/wallet.business';
import { DefaultState, Context } from 'koa';
import schemaValidator from '@middleware/schemaValidator';
import jwt from '@middleware/authValidator';
import authRenewer from '@middleware/authRenewer';
const routes = new Router<DefaultState, Context>();

routes
  .get('/wallet', schemaValidator, jwt, authRenewer, WalletBusiness.get)
  .post('/wallet', schemaValidator, jwt, authRenewer, WalletBusiness.post)
  .get('/wallet/:id', schemaValidator, jwt, authRenewer, walletPayment)
  .post('/wallet/:id/payment', schemaValidator, jwt, authRenewer, PaymentBusiness.post)
  .get('/cards', schemaValidator, jwt, authRenewer, cards)
  .get('/wallet/:id/search', schemaValidator, jwt, authRenewer, search)
  .get('/wallet/:id/payment/:id', schemaValidator, jwt, authRenewer, detailPayment);

export default routes;