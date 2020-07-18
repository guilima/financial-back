import { Context } from "koa";
import { WalletData, productsByName, manufacturersByName, categoriesByName, registerPayment, detailByPaymentId, paymentsByWalletId, tagsByName } from "@data/wallet.data"
import { SearchType } from "@enums/search.enum";
import { PaymentType } from "@root/src/enums/payment.enum";
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
      return ctx.body = { data: id };
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
      customer: {id?:number, name: string, bank: number, card?: any},
      manufacturer: IdName,
      tags: IdName[],
    }
    const { id } = ctx.params;
    const body = ctx.request.body;
    const data: Payment = {
      ...body,
      typeId: choosePaymentType(body.customer),
      tags: body.tags.map((name: string) => ({name}))
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

const walletPayment = async (ctx: Context) => {
  interface Payment {id: number, date: Date, price: string | number, installment: number, typeId: PaymentType, product: string, manufacturer: string}; 
  const roundPrice = (price: string | number, installment: number) => (Math.round(((Number(price) / (installment || 1)) + Number.EPSILON) * 100 ) / 100).toFixed(2);
  const { id } = ctx.params;
  try {
    const listPayment: Payment[] = await paymentsByWalletId(id);
    const listPaymentWithInstallment: {[key: string]: {[key: string]: Payment[]}} = listPayment.reduce((arr, item) => {
      const price = roundPrice(item.price, item.installment);
      if(!item.installment) {
        return arr.concat({...item, price});
      }
      for (let i = 1; i <= item.installment; i++) {
        const date = utc(item.date).add(i, 'M');
        const installment = `${i}/${item.installment}`;
        arr = arr.concat({...item, date, installment, price});
      }
      return arr;
    }, [])
    .sort((a, b) => b.date - a.date)
    .reduce((obj, item) => {
      const year = new Date(item.date).getFullYear();
      const month = new Date(item.date).getMonth();
      if(!obj[year]) {
        obj[year] = {}
      }
      if(!obj[year][month]) {
        obj[year][month] = []
      }
      obj[year][month] = obj[year][month].concat(item);
      return obj;
    }, {});
    const total: string = roundPrice(listPayment.reduce((num, item) => (num + Number(item.price)), 0), 0);
    return ctx.body = { data: { payments: listPaymentWithInstallment, total }};
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
  if(!bank && !card) return PaymentType.Cash;
  if(bank && !card) return PaymentType["BankTransference"];
  if(card) return PaymentType.Card;
}

const searchByTerm: (id: number, {type, term}:{type: SearchType, term: string}) => Promise<IdName[]> = async (id, {type, term}) => {
  var searchBy = {
    [SearchType.Product]: productsByName,
    [SearchType.Category]: categoriesByName,
    [SearchType.Manufacturer]: manufacturersByName,
    [SearchType.Tag]: tagsByName,
    'default': () => { throw "Busca não existente" }
  };
  return await (searchBy[type] || searchBy['default'])(id, term.replace(/\s/g, '&'));
}

export {
  WalletBusiness,
  PaymentBusiness,
  search,
  walletPayment,
  detailPayment,
}
