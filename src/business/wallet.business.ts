import { Context } from "koa";
import { WalletData, productsByName, manufacturersByName, categoriesByName, registerPayment, detailByPaymentId, paymentsByWalletId, tagsByName, customersByName, cardsByCustomerId } from "@data/wallet.data"
import { SearchType } from "@enums/search.enum";
import { PaymentType } from "@root/src/enums/payment.enum";
import { CardType, CardAssociation } from "@root/src/enums/card.enum";
import { utc } from "moment";

interface IdName {id?: number, name: string}
interface Card {typeId: CardType, associationId: CardAssociation, id?: number, dueDate?: Date, closingDate?: Date};
interface Payment {
  date: Date,
  price: string,
  installment: number,
  typeId: PaymentType,
  product: IdName,
  category: IdName,
  customer: {id?:number, name: string, bank: number, card?: Card},
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
      if(Array.isArray(request)) {
        const response = request.reduce(async (acc, payment) => {
          return [
            ...(await acc),
            await registerPayment(id, await formatPayment(id, payment))
          ];
        }, []);
        return ctx.body = { data: await response };
      } else {
        const paymentFormatted = await formatPayment(id, request);
        const response = await registerPayment(id, paymentFormatted);
        return ctx.body = { data: response };
      }
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

const formatPayment = async (id: number, payment): Promise<Payment> => {
  const { tags, customer, customer: { card, card: { info: { closingDate, dueDate } } } } = payment;
  const paymentTypeId = choosePaymentType(customer);
  let customerCard = undefined;
  if(paymentTypeId === PaymentType.Card) {
    customerCard = card.new ? {
      ...card.info,
      closingDate: closingDate && utc().set({month: 0, date: closingDate, h:0, m:0, s:0, ms:0}),
      dueDate: dueDate && utc().set({month: 0, date: dueDate, h:0, m:0, s:0, ms:0}),
    } : { id: card.id };
  }
  const data: Payment = {
    ...payment,
    typeId: paymentTypeId,
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
  if(paymentTypeId === PaymentType.Card && !data.customer.card.id && data.customer.id) {
    const searchResults: Card[] = await cardsByCustomerId({customerId: data.customer.id, bankId: data.customer.bank});
    const cardResult = searchResults.find((result) => Number(closingDate) || null === (result.closingDate && result.closingDate.getDate())
      && Number(dueDate) || null === (result.dueDate && result.dueDate.getDate())
      && Number(card.info.associationId) === result.associationId
      && Number(card.info.typeId) === result.typeId) || {id: undefined };
    data.customer.card = {...data.customer.card, ...cardResult};
  }

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
