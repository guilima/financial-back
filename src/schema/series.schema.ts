import { SearchType } from "./../enums/search.enum";
import { Banks } from "./../enums/bank.enum";
import Joi from "joi";

const payment = Joi.object({
  date: Joi.date().iso().required().raw(),
  price: Joi.number().required(),
  installment: Joi.number().required(),
  description: Joi.string().allow('').allow(null).default('').max(255),
  product: Joi.object({
    name: Joi.string().required().max(100),
    id: Joi.number().optional()
  }).required(),
  category: Joi.object({
    name: Joi.string().required().max(30),
    id: Joi.number().optional(),
  }).required(),
  customer: Joi.object({
    name: Joi.string().max(30).required(),
    id: Joi.number().optional(),
  }).required(),
  bank: Joi.number().default(0).valid(...Object.values(Banks).filter(item => Number.isInteger(item))),
  card: Joi.object({
    new: Joi.boolean().required(),
    id: Joi.number().optional(),
    info: Joi.when('new', {is: true, then: Joi.object({
      dueDate: Joi.number(),
      closingDate: Joi.number(),
      typeId: Joi.number().required(),
      associationId: Joi.number().required()
    }).required(), otherwise: Joi.object().default({})})
  }).optional(),
  manufacturer: Joi.object({
    name: Joi.string().max(30).required(),
    id: Joi.number().optional()
  }).required(),
  tags: Joi.array().items(Joi.string().max(30))
});

const routeSchemas = {
  get: [
    ["/series", Joi.object({
      idGroup: Joi.array().items(Joi.number()).single().unique().required(),
      dateInitial: Joi.date().iso().max('now').required().raw(),
      dateEnd: Joi.date().iso().max('now').min(Joi.ref('dateInitial')).required().raw()
    })],
    ["/userExist", Joi.object({
      email: Joi.string().email({ tlds: { allow: false } }).required()
    })],
    ["/wallet", Joi.object({})],
    ["/wallet/:id", Joi.object({})],
    ["/wallet/:id/search", Joi.object({
      type: Joi.number().valid(...Object.values(SearchType).filter(item => Number.isInteger(item))),
      term: Joi.string().required()
    })],
    ["/wallet/:id/payment/:id", Joi.object({})],
    ["/cards", Joi.object({
      customerId: Joi.number().required(),
      bankId: Joi.number().required(),
    })],
  ],
  post: [
    ["/series", Joi.object({
      idGroup: Joi.array().items(Joi.number()).single().unique().required(),
      date: Joi.object({
        initial: Joi.date().iso().max('now').required().raw(),
        end: Joi.date().iso().max('now').min(Joi.ref('initial')).required().raw()
      })
    })],
    ["/login", Joi.object({
      recaptchaToken: Joi.string().required(),
      email: Joi.string().max(256).required(),
      password: Joi.string().required()
    })],
    ["/logout", Joi.object({})],
    ["/authverify", Joi.object({})],
    ["/register", Joi.object({
      recaptchaToken: Joi.string().required(),
      userName: Joi.string().max(30).required(),
      fullName: Joi.string().max(100).required(),
      email: Joi.string().email({ tlds: { allow: false } }).max(256).required(),
      password: Joi.string().required()
    })],
    ["/wallet", Joi.object({
      name: Joi.string().max(50).required(),
      description: Joi.string().max(255),
    })],
    ["/wallet/:id/import", Joi.array().items(payment)],
    ["/wallet/:id/payment", payment],
  ]
};
const IGetValoresSeriesJSONResponse = Joi.array().items(
  Joi.object({
    ID: Joi.number().required(),
    item: Joi.array().items(
      Joi.object({
        data: Joi.string().regex(/^\d+\/\d+$/, 'MM/YYYY').required(),
        valor: Joi.number().precision(2).allow("").required(),
        bloqueado: Joi.boolean().required()
      })
    ).single().unique().required(),
  })
).single().unique().required();

export {
  routeSchemas,
  IGetValoresSeriesJSONResponse
}