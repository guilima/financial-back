import { Context } from "koa";
import { WalletData, productsByName, manufacturersByName, categoriesByName, registerPayment, detailByPaymentId, paymentsByWalletId } from "@data/wallet.data"
import { SearchType } from "@enums/search.enum";
import { PaymentType } from "@root/src/enums/payment.enum";
import { utc } from "moment";

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

const addPayment = async (ctx: Context) => {
  interface Payment {
    cardId: number,
    payment: {date: Date, price: string, installment: number, typeId: PaymentType},
    product: {name: string, description: string},
    category: {name: string},
    manufacturer: {name: string, description: string},
  }
  const { id } = ctx.params;
  const { data }: {data: Payment} = ctx.request.body;
  try {
    const listWallet = await registerPayment(id, data);
    return ctx.body = { data: listWallet };
  } catch (error) {
    ctx.throw(error);
  }
}

const search = async (ctx: Context) => {
  const { id } = ctx.params;
  const { type, term } = ctx.request.body;
  try {
    let searchByTerm: (id: number, term: string) => Promise<any[]>;
    switch (type) {
      case SearchType.Product:
        searchByTerm = productsByName;
        break;
      case SearchType.Category:
        searchByTerm = categoriesByName;
        break;
      case SearchType.Manufacturer:
        searchByTerm = manufacturersByName;
        break;
      default:
        throw "Busca não existente";
    }
    const listProduct = await searchByTerm(id, term);
    return ctx.body = { data: listProduct };
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

export {
  WalletBusiness,
  search,
  addPayment,
  walletPayment,
  detailPayment,
}
