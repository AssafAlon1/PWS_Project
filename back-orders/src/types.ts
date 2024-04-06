import Joi from 'joi';

export type PaymentInformation = {
    cc: string,
    holder: string,
    cvv: string,
    exp: string,
    charge: number, // the total price of the purchase
    username: string,
    event_id: string,
    ticket_name: string,
    ticket_amount: number,
}

export type RefundInformation = {
    purchase_id: string,
    event_id: string,
    ticket_name: string,
    ticket_amount: number,
    username: string,
}

export const paymentInformationSchema = Joi.object({
    cc: Joi.string().required(),
    // cc: Joi.string().creditCard().required(), // <<<--- F*** THIS!!
    holder: Joi.string().required(),
    cvv: Joi.string().length(3).required(),
    exp: Joi.string().required(),
    charge: Joi.number().min(0).required(),
    username: Joi.string().required(),
    event_id: Joi.string().required(),
    ticket_name: Joi.string().required(),
    ticket_amount: Joi.number().integer().min(1).required(),
});

export const refundInformationSchema = Joi.object({
    purchase_id: Joi.string().required(),
    event_id: Joi.string().required(),
    ticket_name: Joi.string().required(),
    ticket_amount: Joi.number().integer().min(1).required(),
    username: Joi.string().required(),
});