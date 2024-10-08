import Joi from 'joi';

export const paymentInformationSchema = Joi.object({
    cc: Joi.string().required(),
    holder: Joi.string().required(),
    cvv: Joi.string().required(),
    exp: Joi.string().required(),
    charge: Joi.number().min(0).required(),
    username: Joi.string().required(),
    event_id: Joi.string().required(),
    ticket_name: Joi.string().required(),
    ticket_amount: Joi.number().min(1).required(),
});

export type PaymentInformation = {
    cc: string;
    holder: string;
    cvv: string;
    exp: string;
    charge: number; // the total price of the purchase
    username: string;
    event_id: string;
    ticket_name: string;
    ticket_amount: number;
}

export type LockInformation = {
    username: string;
    eventId: string;
    ticketName: string;
    quantity: number;
}
