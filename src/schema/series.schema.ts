import { object, array, ref, date, number, string, boolean } from "@hapi/joi";
import { SearchType } from "@enums/search.enum";
import { Banks } from "@enums/bank.enum";

const routeSchemas = {
  get: [
    ["/series", object({
      idGroup: array().items(number()).single().unique().required(),
      dateInitial: date().iso().max('now').required().raw(),
      dateEnd: date().iso().max('now').min(ref('dateInitial')).required().raw()
    })],
    ["/userExist", object({
      email: string().email({ tlds: { allow: false } }).required()
    })],
    ["/wallet", object({})],
    ["/wallet/:id", object({})],
    ["/wallet/:id/search", object({
      type: number().valid(...Object.values(SearchType).filter(item => Number.isInteger(item))),
      term: string().required()
    })],
    ["/wallet/:id/payment/:id", object({})],
  ],
  post: [
    ["/series", object({
      idGroup: array().items(number()).single().unique().required(),
      date: object({
        initial: date().iso().max('now').required().raw(),
        end: date().iso().max('now').min(ref('initial')).required().raw()
      })
    })],
    ["/login", object({
      recaptchaToken: string().required(),
      email: string().max(256).required(),
      password: string().required()
    })],
    ["/logout", object({})],
    ["/authverify", object({})],
    ["/register", object({
      recaptchaToken: string().required(),
      userName: string().max(30).required(),
      fullName: string().max(100).required(),
      email: string().email({ tlds: { allow: false } }).max(256).required(),
      password: string().required()
    })],
    ["/wallet", object({
      name: string().max(50).required(),
      description: string().max(255),
    })],
    ["/wallet/:id/payment", object({
      payment: {
        date: date().iso().required().raw(),
        price: number().required(),
        installment: number().required(),
        description: string().max(255),
      },
      product: {
        name: string().max(30).required(),
        id: number()
      },
      category: {
        name: string().max(30).required(),
        id: number(),
      },
      customer: {
        name: string().max(30).required(),
        id: number(),
        bank: number().valid(...Object.values(Banks).filter(item => Number.isInteger(item))),
      },
      manufacturer: {
        name: string().max(30).required(),
        id: number()
      },
      tags: array().items(string().max(30).required())
    })],
  ]
};
const IGetValoresSeriesJSONResponse = array().items(
  object({
    ID: number().required(),
    item: array().items(
      object({
        data: string().regex(/^\d+\/\d+$/, 'MM/YYYY').required(),
        valor: number().precision(2).allow("").required(),
        bloqueado: boolean().required()
      })
    ).single().unique().required(),
  })
).single().unique().required();

export {
  routeSchemas,
  IGetValoresSeriesJSONResponse
}