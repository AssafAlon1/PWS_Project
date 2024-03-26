import Joi from 'joi';

export type PaymentInformation = {
    cc: string,
    holder: string,
    cvv: string,
    exp: string,
    charge: number
}

export const paymentInformationSchema = Joi.object({
    cc: Joi.string().creditCard().required(),
    holder: Joi.string().required(),
    cvv: Joi.string().length(3).required(),
    exp: Joi.string().required(),
    charge: Joi.number().min(0).required()
});