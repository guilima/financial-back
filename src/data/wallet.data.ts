import { postgres } from '@root/db';

const WalletData = {
  selectByUserId: async (id: number) => {
    const knex = await postgres();
    try {
      const listWallet = await knex.select('W.id', 'w.name', 'w.description')
        .from('wallets AS W')
        .where('W.user_id', '=', id);
      return listWallet;
    } catch (err) {
      throw err;
    }
  },
  insert: async (data: {userId: number, name: string, description?: string}) => {
    const knex = await postgres();
    try {
      const walletId = await knex('wallets').insert(data);
      return walletId;
    } catch (err) {
      throw err;
    }
  },
}

const paymentsByWalletId = async (id: number) => {
  const knex = await postgres();
  try {
    const listPayment = await knex.select('P.id', 'P.date', 'P.price', 'P.installment', 'P.type_id', knex.raw('to_json(PR.name) as product'), knex.raw('to_json(CA.name) as category'), knex.raw('to_json(M.name) as manufacturer'))
      .from('payments AS P')
      .innerJoin('products AS PR', 'PR.id', '=', 'P.product_id')
      .leftJoin('products_manufacturers AS PMA', 'PR.id', '=', 'PMA.manufacturer_id')
      .leftJoin('manufacturers AS M', 'M.id', '=', 'PMA.manufacturer_id')
      .leftJoin('products_categories AS PCA', 'PR.id', '=', 'PCA.category_id')
      .leftJoin('categories AS CA', 'CA.id', '=', 'PCA.category_id')
      .where('P.wallet_id', '=', id)
      .orderBy('P.date', 'asc');
    return listPayment;
  } catch (err) {
    throw err;
  }
}

const detailByPaymentId = async (id: number) => {
  const knex = await postgres();
  try {
    const detailPayment = await knex.select('P.date', 'P.price', 'P.installment', 'P.type_id', 'PR.id', 'PR.name', knex.raw('to_json(M.*) as manufacturer'), knex.raw('to_json(CA.*) as category'), knex.raw('to_json(M.*) as manufacturer'), knex.raw('to_json(C.*) as card'))
      .from('payments AS P')
      .leftJoin('payments_cards AS PC', 'P.id', '=', 'PC.payment_id')
      .leftJoin('cards AS C', 'C.id', '=', 'PC.card_id')
      .innerJoin('products AS PR', 'PR.id', '=', 'P.product_id')
      .leftJoin('products_manufacturers AS PMA', 'PR.id', '=', 'PMA.manufacturer_id')
      .leftJoin('manufacturers AS M', 'M.id', '=', 'PMA.manufacturer_id')
      .leftJoin('products_categories AS PCA', 'PR.id', '=', 'PCA.product_id')
      .leftJoin('categories AS CA', 'CA.id', '=', 'PCA.category_id')
      .where('P.id', '=', id).first();
    return detailPayment;
  } catch (err) {
    throw err;
  }
}

const registerPayment = async (walletId: number, { payment, product, category, manufacturer, cardId }) => {
  const knex = await postgres();
  const trxProvider = knex.transactionProvider();
  const trx = await trxProvider();
  try {
    const [categoryId] = category.id || await trx('manufacturers').insert(category);
    const [manufacturerId] = manufacturer.id || await trx('manufacturers').insert(manufacturer);
    const [productId] = product.id || await trx('products').insert(product);
    await trx('products_categories').insert({ product_id: productId, category_id: categoryId });
    await trx('products_manufacturers').insert({ product_id: productId, manufacturer_id: manufacturerId });
    const [paymentId] = await trx('payments').insert(Object.assign(payment, {product_id: productId, wallet_id: walletId}));
    if(cardId) {
      await trx('payments_cards').insert({ payment_id: paymentId, card_id: cardId });
    }
    await trx.commit();
    return paymentId;
  } catch (err) {
    await trx.rollback()
    throw err;
  }
}

const productsByName = async (walletId: number, name: string) => {
  const knex = await postgres();
  try {
    const products = await knex.select('PR.*', knex.raw('to_json(M.*) as manufacturer'), knex.raw('to_json(CA.*) as category'))
      .from('payments AS P')
      .innerJoin('products AS PR', 'PR.id', '=', 'P.product_id')
      .leftJoin('products_manufacturers AS PMA', 'PR.id', '=', 'PMA.manufacturer_id')
      .leftJoin('manufacturers AS M', 'M.id', '=', 'PMA.manufacturer_id')
      .leftJoin('products_categories AS PCA', 'PR.id', '=', 'PCA.category_id')
      .leftJoin('categories AS CA', 'CA.id', '=', 'PCA.category_id')
      .whereRaw("P.wallet_id = ? AND to_tsquery('simple', '??:*') @@ to_tsvector('simple', PR.name)", [walletId, name]);
    return products;
  } catch (err) {
    throw err;
  }
}

const manufacturersByName = async (walletId: number, name: string) => {
  const knex = await postgres();
  try {
    const products = await knex.select('M.*')
      .from('payments AS P')
      .innerJoin('products AS PR', 'PR.id', '=', 'P.product_id')
      .innerJoin('products_manufacturers AS PMA', 'PR.id', '=', 'PMA.manufacturer_id')
      .innerJoin('manufacturers AS M', 'M.id', '=', 'PMA.manufacturer_id')
      .whereRaw("P.wallet_id = ? AND to_tsquery('simple', '??:*') @@ to_tsvector('simple', M.name)", [walletId, name]);
    return products;
  } catch (err) {
    throw err;
  }
}

const categoriesByName = async (walletId: number, name: string) => {
  const knex = await postgres();
  try {
    const products = await knex.select('CA.*')
      .from('payments AS P')
      .innerJoin('products AS PR', 'PR.id', '=', 'P.product_id')
      .innerJoin('products_categories AS PCA', 'PR.id', '=', 'PCA.category_id')
      .innerJoin('categories AS CA', 'CA.id', '=', 'PCA.category_id')
      .whereRaw("P.wallet_id = ? AND to_tsquery('simple', '??:*') @@ to_tsvector('simple', CA.name)", [walletId, name]);
    return products;
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
}