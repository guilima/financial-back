import { object, array, ref, date, number, string, boolean } from "@hapi/joi";

const routeSchemas = {
  get: [
    ["/series", object({
      idGroup: array().items(number()).single().unique().required(),
      dateInitial: date().iso().max('now').required().raw(),
      dateEnd: date().iso().max('now').min(ref('dateInitial')).required().raw()
    })],
    ["/userExist", object({
      email: string().email({ tlds: { allow: false } }).required()
    })]
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
    })]
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