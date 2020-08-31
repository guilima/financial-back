import { psqlKnex } from './../../db';

const WalletData = {
  selectByUserId: async (id: number) => {
    try {
      const listWallet = await psqlKnex.select('WAL.id', 'WAL.name', 'WAL.description')
        .from('wallets AS WAL')
        .where('WAL.user_id', '=', id);
      return listWallet;
    } catch (err) {
      throw err;
    }
  },
  insert: async (data: {userId: number, name: string, description?: string}) => {
    try {
      const [walletId] = await psqlKnex('wallets').insert(data, 'id');
      return walletId;
    } catch (err) {
      throw err;
    }
  },
}

const paymentsByWalletId = async (id: number) => {
  try {
    const listPayment = await psqlKnex.select('PAY.id', 'PAY.date', 'PAY.price', 'PAY.installment', 'TRA.type_id', psqlKnex.raw('to_json(PRO.name) as product'), psqlKnex.raw('to_json(CAT.name) as category'), psqlKnex.raw('to_json(MAN.name) as manufacturer'))
      .from('payments AS PAY')
      .innerJoin('transactions AS TRA', 'TRA.id', '=', 'PAY.id')
      .innerJoin('products_manufacturers AS PROMAN', 'PROMAN.id', '=', 'PAY.product_manufacturer_id')
      .innerJoin('products AS PRO', 'PRO.id', '=', 'PROMAN.product_id')
      .innerJoin('manufacturers AS MAN', 'MAN.id', '=', 'PROMAN.manufacturer_id')
      .leftJoin('categories AS CAT', 'CAT.id', '=', 'PAY.category_id')
      .where('PAY.wallet_id', '=', id)
      .orderBy('PAY.date', 'asc');
    return listPayment;
  } catch (err) {
    throw err;
  }
}

const detailByPaymentId = async (id: number) => {
  try {
    const detailPayment = await psqlKnex.select('PAY.date', 'PAY.price', 'PAY.installment', 'PRO.id', 'PRO.name', 'TRA.bank_id', 'TRA.type_id', psqlKnex.raw('to_json(MAN.*) as manufacturer'), psqlKnex.raw('to_json(CAT.*) as category'), psqlKnex.raw('to_json(TAG.*) as tag'), psqlKnex.raw('to_json(CUS.*) as customer'), psqlKnex.raw('to_json(CAR.*) as card'))
      .from('payments AS PAY')
      .innerJoin('products_manufacturers AS PROMAN', 'PROMAN.id', '=', 'PAY.product_manufacturer_id')
      .innerJoin('products AS PRO', 'PRO.id', '=', 'PROMAN.product_id')
      .innerJoin('manufacturers AS MAN', 'MAN.id', '=', 'PROMAN.manufacturer_id')
      .innerJoin('transactions AS TRA', 'TRA.payment_id', '=', 'PAY.id')
      .leftJoin('transactions_cards AS TRACAR', 'TRACAR.transaction_id', '=', 'TRA.id')
      .leftJoin('customers AS CUS', 'CUS.id', '=', 'TRA.customer_id')
      .leftJoin('cards AS CAR', 'CAR.id', '=', 'TRACAR.card_id')
      .leftJoin('payments_tags AS PAYTAG', 'PAY.id', '=', 'PAYTAG.payment_id')
      .leftJoin('tags AS TAG', 'TAG.id', '=', 'PAYTAG.payment_id')
      .leftJoin('categories AS CAT', 'CAT.id', '=', 'PAY.category_id')
      .where('PAY.id', '=', id).first();
    return detailPayment;
  } catch (err) {
    throw err;
  }
}

const registerPayment = async (walletId: number, { date, price, installment, typeId, customer, product, category, manufacturer, bank: bankId, card, tags, }) => {
  const trxProvider = psqlKnex.transactionProvider();
  const trx = await trxProvider();
  try {
    const [categoryId] = category.id ? [category.id] : await trx('categories').insert(category, 'id');
    const tagIdsPartial = tags.filter(tag => tag.id).map(tag => tag.id);
    const tagIds = tags.every(tag => tag.id) ? tags.map(tag => tag.id) : (await trx('tags').insert(tags.filter(tag => !tag.id), 'id')).concat(tagIdsPartial);
    const [manufacturerId] = manufacturer.id ? [manufacturer.id] : await trx('manufacturers').insert(manufacturer, 'id');
    const [productId] = product.id ? [product.id] : await trx('products').insert(product, 'id');
    const [productManufacturer] = await trx('products_manufacturers').where('product_id', productId).andWhere('manufacturer_id', manufacturerId);
    const [productManufacturerId] = productManufacturer ? [productManufacturer.id] : await trx('products_manufacturers').insert({ product_id: productId, manufacturer_id: manufacturerId }, 'id');
    const [hasCustomer] = await trx('customers').where({name: customer.name});
    const [customerId] = hasCustomer ? [hasCustomer.id] : await trx('customers').insert({name: customer.name}, 'id');
    const [paymentId] = await trx('payments').insert(Object.assign({date, price, installment}, {wallet_id: walletId, product_manufacturer_id: productManufacturerId, category_id: categoryId}), 'id');
    const [transactionId] = await trx('transactions').insert({bankId, paymentId, customerId, typeId}, 'id');
    if(card) {
      const [cardId] = (card.id && [card.id]) || await trx('cards').insert(card, 'id');
      await trx('transactions_cards').insert({transactionId, cardId});
    }
    await trx('payments_tags').insert(tagIds.map((tagId: number) => ({ payment_id: paymentId, tag_id: tagId })));
    await trx.commit();
    return paymentId;
  } catch (err) {
    await trx.rollback()
    throw err;
  }
}

const productsByName = async (walletId: number, name: string) => {
  try {
    const products = await psqlKnex.distinct('PRO.*')
      .from('payments AS PAY')
      .innerJoin('products_manufacturers AS PROMAN', 'PROMAN.id', '=', 'PAY.product_manufacturer_id')
      .innerJoin('products AS PRO', 'PRO.id', '=', 'PROMAN.product_id')
      .whereRaw("PAY.wallet_id = ? AND to_tsquery('simple', '??:*') @@ to_tsvector('simple', PRO.name)", [walletId, name])
      .limit(10);
    return products;
  } catch (err) {
    throw err;
  }
}

const manufacturersByName = async (walletId: number, name: string) => {
  try {
    const manufacturers = await psqlKnex.distinct('MAN.*')
      .from('payments AS PAY')
      .innerJoin('products_manufacturers AS PROMAN', 'PROMAN.id', '=', 'PAY.product_manufacturer_id')
      .innerJoin('manufacturers AS MAN', 'MAN.id', '=', 'PROMAN.manufacturer_id')
      .whereRaw("PAY.wallet_id = ? AND to_tsquery('simple', '??:*') @@ to_tsvector('simple', MAN.name)", [walletId, name])
      .limit(10);
    return manufacturers;
  } catch (err) {
    throw err;
  }
}

const categoriesByName = async (walletId: number, name: string) => {
  try {
    const categories = await psqlKnex.distinct('CAT.*')
      .from('payments AS PAY')
      .leftJoin('categories AS CAT', 'CAT.id', '=', 'PAY.category_id')
      .whereRaw("PAY.wallet_id = ? AND to_tsquery('simple', '??:*') @@ to_tsvector('simple', CAT.name)", [walletId, name])
      .limit(10);
    return categories;
  } catch (err) {
    throw err;
  }
}

const tagsByName = async (walletId: number, name: string) => {
  try {
    const tags = await psqlKnex.distinct('TAG.*')
      .from('payments AS PAY')
      .leftJoin('payments_tags AS PAYTAG', 'PAYTAG.payment_id', '=', 'PAY.id')
      .leftJoin('tags AS TAG', 'TAG.id', '=', 'PAYTAG.tag_id')
      .whereRaw("PAY.wallet_id = ? AND to_tsquery('simple', '??:*') @@ to_tsvector('simple', TAG.name)", [walletId, name])
      .limit(10);
    return tags;
  } catch (err) {
    throw err;
  }
}

const customersByName = async (walletId: number, name: string) => {
  try {
    const categories = await psqlKnex.distinct('CUS.*')
      .from('payments AS PAY')
      .leftJoin('transactions AS TRA', 'TRA.payment_id', '=', 'PAY.id')
      .leftJoin('customers AS CUS', 'CUS.id', '=', 'TRA.customer_id')
      .whereRaw("PAY.wallet_id = ? AND to_tsquery('simple', '??:*') @@ to_tsvector('simple', CUS.name)", [walletId, name])
      .limit(10);
    return categories;
  } catch (err) {
    throw err;
  }
}

const cardsByCustomerId = async ({customerId, bankId}) => {
  try {
    const categories = await psqlKnex.distinct('CAR.*')
      .from('transactions AS TRA')
      .rightJoin('transactions_cards AS TRACAR', 'TRACAR.transaction_id', '=', 'TRA.id')
      .leftJoin('cards AS CAR', 'CAR.id', '=', 'TRACAR.card_id')
      .where('TRA.customer_id', customerId)
      .andWhere('TRA.bank_id', bankId)
      .limit(10);
    return categories;
  } catch (err) {
    throw err;
  }
}

export {
    WalletData,
    paymentsByWalletId,
    detailByPaymentId,
    registerPayment,
    productsByName,
    manufacturersByName,
    categoriesByName,
    tagsByName,
    customersByName,
    cardsByCustomerId,
}