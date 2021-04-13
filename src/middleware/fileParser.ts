import { Context, Next, Middleware } from 'koa';
import { parseFile } from '@fast-csv/parse';

export async function csvToJson(ctx: Context, next: Next): Promise<Middleware> {
    const data = [];
    const { files } = ctx.request;
    const json = new Promise((resolve, reject) => {
        parseFile(files.import.path, { skipRows: 1 })
            .transform(
                ([date, price , product , category , manufacturer , tags , description , customer , bank , installment , typeId , closingDate , dueDate , associationId ]: any): any => {
                    const data = {
                        date: date,
                        price: parseFloat(price) || '',
                        installment: installment,
                        description: description,
                        product: {
                            name: product
                        },
                        manufacturer: {
                            name: manufacturer
                        },
                        category: {
                            name: category
                        },
                        customer: {
                            name: customer,
                        },
                        bank: Number(bank),
                        card: {
                            new: Boolean(typeId && associationId),
                            info: typeId && associationId ? {
                                closingDate: closingDate || undefined,
                                dueDate: dueDate || undefined,
                                typeId: typeId,
                                associationId: associationId
                            } : undefined
                        },
                        tags: tags = (tags.split(',') || []).map((tag: string) => tag.trim())
                    };
                    return data;
                },
            )
            .on('error', error => reject(error))
            .on('data', row => {
                data.push(row)
            })
            .on('end', () => {
                resolve(data)
            });
    });
    ctx.request.body = await json;
    ctx.request.files = undefined;
    return await next();
}