import { object, array, ref, date, number, string, boolean, when } from "@hapi/joi";
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
    ["/cards", object({
      customerId: number().required(),
      bankId: number().required(),
    })],
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
      date: date().iso().required().raw(),
      price: number().required(),
      installment: number().required(),
      description: string().allow('').allow(null).default('').max(255),
      product: object({
        name: string().max(30).required(),
        id: number().optional()
      }).required(),
      category: object({
        name: string().max(30).required(),
        id: number().optional(),
      }).required(),
      customer: object({
        name: string().max(30).required(),
        id: number().optional(),
        bank: number().default(0).valid(...Object.values(Banks).filter(item => Number.isInteger(item))),
        card: object({
          new: boolean().required(),
          id: number().optional(),
          info: when('new', {is: true, then: object({
            dueDate: number(),
            closingDate: number(),
            typeId: number().required(),
            associationId: number().required()
          }).required(), otherwise: object().default({})})
        }).optional(),
      }).required(),
      manufacturer: object({
        name: string().max(30).required(),
        id: number().optional()
      }).required(),
      tags: array().items(string().max(30))
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