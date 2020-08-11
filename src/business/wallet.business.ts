import { Context } from "koa";
import { WalletData, productsByName, manufacturersByName, categoriesByName, registerPayment, detailByPaymentId, paymentsByWalletId, tagsByName, customersByName, cardsByCustomerId } from "@data/wallet.data"
import { SearchType } from "@enums/search.enum";
import { PaymentType } from "@root/src/enums/payment.enum";
import { CardType, CardAssociation } from "@root/src/enums/card.enum";
import { utc } from "moment";

interface IdName {id?: number, name: string}
const WalletBusiness = {
  get: async (ctx: Context) => {
    try {
      const listWallet = await WalletData.selectByUserId(ctx.state.user.sub);
      return ctx.body = { data: listWallet };
    } catch (error) {
      ctx.throw(error);
    }
  },
  post: async (ctx: Context) => {
    const data: {name: string, description?: string} = ctx.request.body;
    const userId: number = ctx.state.user.sub;
    try {
      const id = await WalletData.insert({...data, userId});
      return ctx.body = { data: {id, ...data} };
    } catch (error) {
      ctx.throw(error);
    }
  },
}

const PaymentBusiness = {
  post: async (ctx: Context) => {
    interface Payment {
      date: Date,
      price: string,
      installment: number,
      typeId: PaymentType,
      product: IdName,
      category: IdName,
      customer: {id?:number, name: string, bank: number, card?: {due?: number, close?: number, type: CardType, association: CardAssociation} | {id: number}},
      manufacturer: IdName,
      tags: IdName[],
    }
    const { id } = ctx.params;
    const { body, body: { tags, customer, customer: { card, card: { info: { closingDate, dueDate } } } } } = ctx.request;
    const typeId = choosePaymentType(customer);
    let customerCard = undefined;
    if(typeId === PaymentType.Card) {
      customerCard = card.new ? {
        ...card.info,
        closingDate: utc().set({month: 0, date: closingDate, h:0, m:0, s:0, ms:0}),
        dueDate: utc().set({month: 0, date: dueDate, h:0, m:0, s:0, ms:0}),
      } : { id: card.id };
    }
    const data: Payment = {
      ...body,
      typeId,
      tags: tags.map((name: string) => ({name})),
      customer: {
        ...customer,
        card: customerCard
      }
    };
    
    data.tags = await Promise.all(data.tags.map(async (tag) => {
      if(tag.id) {
        return tag;
      }
      const [searchResult]: IdName[] = await searchByTerm(id, {type: SearchType.Tag, term: tag.name});
      return {...searchResult, ...tag};
    }));
    if(!data.product.id) {
      const [searchResult]: IdName[] = await searchByTerm(id, {type: SearchType.Product, term: data.product.name});
      data.product = {...data.product, ...searchResult};
    }
    if(!data.category.id) {
      const [searchResult]: IdName[] = await searchByTerm(id, {type: SearchType.Category, term: data.category.name});
      data.category = {...data.category, ...searchResult};
    }
    if(!data.manufacturer.id) {
      const [searchResult]: IdName[] = await searchByTerm(id, {type: SearchType.Manufacturer, term: data.manufacturer.name});
      data.manufacturer = {...data.manufacturer, ...searchResult};
    }
    if(!data.customer.id) {
      const [searchResult]: IdName[] = await searchByTerm(id, {type: SearchType.Customer, term: data.customer.name});
      data.customer = {...data.customer, ...searchResult};
    }
    try {
      const listWallet = await registerPayment(id, data);
      return ctx.body = { data: listWallet };
    } catch (error) {
      ctx.throw(error);
    }
  }
}

const search = async (ctx: Context) => {
  const { id } = ctx.params;
  const { type, term } = ctx.request.body;
  try {
    const searchResults = await searchByTerm(id, {type, term});
    return ctx.body = { data: searchResults };
  } catch (error) {
    ctx.throw(error);
  }
}

const cards = async (ctx: Context) => {
  const params = ctx.request.body;
  try {
    const searchResults = await cardsByCustomerId(params);
    return ctx.body = { data: searchResults };
  } catch (error) {
    ctx.throw(error);
  }
}

const walletPayment = async (ctx: Context) => {
  interface Payment {id: number, date: Date, price: string | number, installment: number, typeId: PaymentType, product: string, manufacturer: string}; 
  const installmentPrice = (price: string | number, installment: number) => (Math.round(((Number(price) / (installment || 1)) + Number.EPSILON) * 100 ) / 100).toFixed(2);
  const { id } = ctx.params;
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
    return ctx.body = { data: { payments, total }};
  } catch (error) {
    ctx.throw(error);
  }
}

const detailPayment = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    const payment = await detailByPaymentId(id);
    return ctx.body = { data: payment };
  } catch (error) {
    ctx.throw(error);
  }
}

const choosePaymentType = (customer: {name: string, bank: number, card?: any}): PaymentType => {
  const {bank, card} = customer;
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

export {
  WalletBusiness,
  PaymentBusiness,
  search,
  walletPayment,
  detailPayment,
  cards,
}
