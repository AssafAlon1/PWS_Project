import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { BUY_PATH, PAYMENT_PROVIDER_URL, REFUND_PATH } from "./const.js";
import { PaymentInformation, RefundInformation, paymentInformationSchema, refundInformationSchema } from './types.js';
import axios from 'axios';
import { PublisherChannel } from './publisher-channel.js';

// const axiosInstance = axios.create({ withCredentials: true, baseURL: PAYMER_PROVIDER_URL });
const axiosPayment = axios.create({ baseURL: PAYMENT_PROVIDER_URL });


export const buyTickets = async (req: Request, res: Response) => {
    console.log("POST " + BUY_PATH);
    try {
        const publisherChannel: PublisherChannel = req.publisherChannel;
        const postData = req.body as PaymentInformation;
        const { error } = paymentInformationSchema.validate(postData);

        if (error) {
            console.error("Missing required fields.");
            console.error(error);
            res.status(StatusCodes.BAD_REQUEST).send({ message: "Missing required fields." });
            return;
        }

        const paymentResult = await axiosPayment.post("/_functions/pay", postData);
        const orderId = paymentResult.data.paymentToken;

        const orderData = {
            username: postData.username,
            event_id: postData.event_id,
            ticket_name: postData.ticket_name,
            ticket_amount: postData.ticket_amount,
            purchase_id: orderId,
            purchase_time: new Date(),
        };
        publisherChannel.sendBuyEvent(JSON.stringify(orderData));

        res.status(StatusCodes.OK).send({ order_id: orderId });
    }
    catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
    }
}

export const refundTickets = async (req: Request, res: Response) => {
    console.log("POST " + REFUND_PATH);
    try {
        const postData = req.body as RefundInformation;
        const publisherChannel: PublisherChannel = req.publisherChannel;

        const { error } = refundInformationSchema.validate(postData);

        if (error) {
            console.error("Missing required fields.");
            console.error(error);
            res.status(StatusCodes.BAD_REQUEST).send({ message: "Missing required fields." });
            return;
        }

        await axiosPayment.post("/_functions/refund", { orderId: postData.purchase_id });

        const refundData = {
            event_id: postData.event_id,
            ticket_name: postData.ticket_name,
            ticket_amount: postData.ticket_amount,
        };
        publisherChannel.sendRefundEvent(JSON.stringify(refundData));

        res.status(StatusCodes.OK).send({ message: "Refund successful" });
    }
    catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
    }
}

