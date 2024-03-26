import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { BUY_PATH, PAYMER_PROVIDER_URL, REFUND_PATH } from "./const.js";
import { PaymentInformation, paymentInformationSchema } from './types.js';
import axios from 'axios';

// const axiosInstance = axios.create({ withCredentials: true, baseURL: PAYMER_PROVIDER_URL });
const axiosPayment = axios.create({ baseURL: PAYMER_PROVIDER_URL });


export const buyTickets = async (req: Request, res: Response) => {
    console.log("POST " + BUY_PATH);
    try {
        const postData = req.body as PaymentInformation;
        const { error } = paymentInformationSchema.validate(postData);

        if (error) {
            console.error("Missing required fields.")
            res.status(StatusCodes.BAD_REQUEST).send({ message: "Missing required fields." });
            return;
        }

        const paymentResult = await axiosPayment.post("/_functions/pay", postData);
        // TODO - Notify rabbit

        res.status(StatusCodes.OK).send({ order_id: paymentResult.data.paymentToken });
    }
    catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
    }
}

export const refundTickets = async (req: Request, res: Response) => {
    console.log("POST " + REFUND_PATH);
    try {
        const postData = req.body as { order_id: string };
        if (!postData.order_id) {
            console.error("Missing required fields.")
            res.status(StatusCodes.BAD_REQUEST).send({ message: "Missing required fields." });
            return;
        }

        await axiosPayment.post("/_functions/refund", { orderId: postData.order_id });
        // TODO - Notify rabbit

        res.status(StatusCodes.OK).send({ message: "Refund successful" });
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
    }
}

