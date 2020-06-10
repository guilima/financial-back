import Router from '@koa/router';
import { WalletBusiness, search, addPayment, detailPayment, walletPayment } from '@business/wallet.business';
import { DefaultState, Context } from 'koa';
import jwt from '@middleware/authValidator';
import authRenewer from '@middleware/authRenewer';
const routes = new Router<DefaultState, Context>();

routes
  .get('/wallet', jwt, authRenewer, WalletBusiness.get)
  .post('/wallet', jwt, authRenewer, WalletBusiness.post)
  .get('/wallet/:id', jwt, authRenewer, walletPayment)
  .post('/wallet/:id/payment', jwt, authRenewer, addPayment)
  .get('/wallet/:id/search', jwt, authRenewer, search)
  .get('/wallet/:id/payment/:id', jwt, authRenewer, detailPayment);

export default routes;