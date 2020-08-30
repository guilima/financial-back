import { Context } from "koa";
import { WalletData, productsByName, manufacturersByName, categoriesByName, registerPayment, detailByPaymentId, paymentsByWalletId, tagsByName, customersByName, cardsByCustomerId } from "@data/wallet.data"
import { SearchType } from "@enums/search.enum";
import { PaymentType } from "@root/src/enums/payment.enum";
import { CardType, CardAssociation } from "@root/src/enums/card.enum";
import { utc } from "moment";

interface IdName {id?: number, name: string}
interface Card {typeId?: CardType, associationId?: CardAssociation, id?: number, dueDate?: Date, closingDate?: Date};
interface Payment {
  date: Date,
  price: string,
  installment: number,
  typeId: PaymentType,
  product: IdName,
  category: IdName,
  customer: {id?:number, name: string},
  bank: number,
  card: Card,
  manufacturer: IdName,
  tags: IdName[],
}
const WalletBusiness = {
  get: async (ctx: Context) => {
    const userId: number = ctx.state.user.sub;
    try {
      const listWallet = await WalletData.selectByUserId(userId);
      return ctx.body = { data: listWallet };
    } catch (error) {
      ctx.throw(error);
    }
  },
  post: async (ctx: Context) => {
    const request: {name: string, description?: string} = ctx.request.body;
    const userId: number = ctx.state.user.sub;
    try {
      const id = await WalletData.insert({...request, userId});
      const response = { id, ...request};
      return ctx.body = { data: response };
    } catch (error) {
      ctx.throw(error);
    }
  },
}

const PaymentBusiness = {
  post: async (ctx: Context) => {
    const request = ctx.request.body;
    const { id } = ctx.params;
    try {
      const response = await [].concat(request).reduce(async (acc, payment) => {
        return [
          ...(await acc),
          await registerPayment(id, await formatPayment(id, payment))
        ];
      }, []);
      return ctx.body = { data: response };
    } catch (error) {
      ctx.throw(error);
    }
  }
}

const search = async (ctx: Context) => {
  const request: { type: number, term: string } = ctx.request.body;
  const { id } = ctx.params;
  try {
    const response = await searchByTerm(id, request);
    return ctx.body = { data: response };
  } catch (error) {
    ctx.throw(error);
  }
}

const cards = async (ctx: Context) => {
  const request: { customerId: number, bankId: number } = ctx.request.body;
  try {
    const response = await cardsByCustomerId(request);
    return ctx.body = { data: response };
  } catch (error) {
    ctx.throw(error);
  }
}

const walletPayment = async (ctx: Context) => {
  interface Payment {id: number, date: Date, price: string | number, installment: number, typeId: PaymentType, product: string, manufacturer: string}; 
  const { id } = ctx.params;
  const installmentPrice = (price: string | number, installment: number) => (Math.round(((Number(price) / (installment || 1)) + Number.EPSILON) * 100 ) / 100).toFixed(2);
  try {
    const listPayment: Payment[] = await paymentsByWalletId(id);
    const payments: {[key: string]: {[key: string]: Payment[]}} = listPayment
      .map(item => ({...item, price: installmentPrice(item.price, item.installment)}))
      .reduce((arr, item) => {
        if(!item.installment) {
          return arr.concat(item);
        }
        for (let i = 1; i <= item.installment; i++) {
          const date = utc(item.date).add(i, 'M');
          const installment = `${i}/${item.installment}`;
          arr = arr.concat({...item, date, installment});
        }
        return arr;
      }, [])
      .sort((a, b) => b.date - a.date)
      .reduce((obj, item) => {
        const year = new Date(item.date).getFullYear();
        const month = new Date(item.date).getMonth();
        obj[year] = obj[year] || {};
        obj[year][month] = (obj[year][month] || []).concat(item);
        return obj;
      }, {});
    const total: string = listPayment.reduce((total, { price }) => total + Number(price), 0).toFixed(2);
    const response = { payments, total };
    return ctx.body = { data: response};
  } catch (error) {
    ctx.throw(error);
  }
}

const detailPayment = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    const response = await detailByPaymentId(id);
    return ctx.body = { data: response };
  } catch (error) {
    ctx.throw(error);
  }
}

const choosePaymentType = (bank: number, card: any): PaymentType => {
  if(card.id || card.new) return PaymentType.Card;
  if(bank) return PaymentType.BankTransference;
  return PaymentType.Cash;
}

const searchByTerm: (id: number, {type, term}:{type: SearchType, term: string}) => Promise<IdName[]> = async (id, {type, term}) => {
  var searchBy = {
    [SearchType.Product]: productsByName,
    [SearchType.Category]: categoriesByName,
    [SearchType.Manufacturer]: manufacturersByName,
    [SearchType.Tag]: tagsByName,
    [SearchType.Customer]: customersByName,
    'default': () => { throw "Busca não existente" }
  };
  return await (searchBy[type] || searchBy['default'])(id, term.replace(/[!@#$%^&*()+=\-[\]\\';,./{}|":<>?~_|\s]/g, '\\$&'));
}

const formatPayment = async (id: number, payment): Promise<Payment> => {
  const { 
    product: _product,
    category: _category,
    manufacturer: _manufacturer,
    tags: _tags,
    customer: _customer,
    bank: _bankId,
    card: _card,
    card: { info: { closingDate: _closingDate, dueDate: _dueDate } } 
  } = payment;
  const typeId = choosePaymentType(_bankId, _card);

  const tags: IdName[] = await Promise.all(_tags.map(async (name: string) => {
    const [result] = await searchByTerm(id, {type: SearchType.Tag, term: name});
    return result || {name};
  }));
  const [product, category, manufacturer, customer] = await Promise.all<IdName>([
    _product.id ? _product : (await searchByTerm(id, {type: SearchType.Product, term: _product.name}))[0] || _product,
    _category.id ? _category : (await searchByTerm(id, {type: SearchType.Category, term: _category.name}))[0] || _category,
    _manufacturer.id ? _manufacturer : (await searchByTerm(id, {type: SearchType.Manufacturer, term: _manufacturer.name}))[0] || _manufacturer,
    _customer.id ? _customer : (await searchByTerm(id, {type: SearchType.Customer, term: _customer.name}))[0] || _customer
  ]);

  let card = _card.id && { id: _card.id };
  if(_card.new) {
    const searchResults: Card[] = customer.id ? await cardsByCustomerId({customerId: customer.id, bankId: _bankId}) : [];
    card = searchResults.find((result) => (_closingDate && Number(_closingDate)) === result?.closingDate?.getDate()
      && (_dueDate && Number(_dueDate)) === result?.dueDate?.getDate()
      && Number(_card.info.associationId) === result.associationId
      && Number(_card.info.typeId) === result.typeId) || {
        ..._card.info,
        closingDate: _closingDate && utc().set({month: 0, date: _closingDate, h:0, m:0, s:0, ms:0}),
        dueDate: _dueDate && utc().set({month: 0, date: _dueDate, h:0, m:0, s:0, ms:0})
      };
  }

  const data: Payment = {
    ...payment,
    product,
    category,
    manufacturer,
    customer,
    typeId,
    card,
    tags,
  };

  return data;
}

export {
  WalletBusiness,
  PaymentBusiness,
  search,
  walletPayment,
  detailPayment,
  cards,
}
