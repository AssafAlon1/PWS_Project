import React, { useState } from 'react';
import { Button, Card, Col, FloatingLabel, Form, Row } from 'react-bootstrap';
import { SpanningSpinnner } from '../SpinnerComponent/SpinnerComponent';
import { PaymentDetails } from '../../types';


interface PaymentFormProps {
    purchaseTickets: () => Promise<void>;
    afterSuccessfulPurchase: () => void;
    isLoading: boolean;
    setPaymentDetails: (paymentDetails: PaymentDetails) => void;
    price: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ purchaseTickets, afterSuccessfulPurchase, isLoading, setPaymentDetails, price }) => {

    const [isFormValidated, setFormValidated] = useState<boolean>(false);
    const [year, setYear] = useState<number>(0);
    const [month, setMonth] = useState<number>(0);
    const [cardholderName, setCardholderName] = useState<string>('');
    const [cvv, setCvv] = useState<string>('');
    const [creditCardNumber, setCreditCardNumber] = useState<string>('');

    const updatePaymentDetails = () => {
        setPaymentDetails({
            cc: creditCardNumber,
            holder: cardholderName,
            cvv: cvv,
            exp: `${month}/${year}`,
            charge: price
        });
    }
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        updatePaymentDetails();
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
            setFormValidated(true);
            return;
        }
        try {
            await purchaseTickets();
            afterSuccessfulPurchase();
        }
        catch {
            // TODO - HANDLE THIS RIGHT (show an error in the page probably. Maybe a toast?)
            setFormValidated(true);
        }
    }

    const YearOptions = () => {
        const currentYear = new Date().getFullYear() % 100; // Mod to discard the first two digits
        const years = Array.from(new Array(10), (val, index) => currentYear + index);
        return years.map((year, index) => <option key={index}>{year}</option>);
    }

    const MonthOptions = () => {
        const months = Array.from(new Array(12), (val, index) => index + 1);
        return months.map((month, index) => <option key={index} value={month}>{month < 10 ? "0" : ""}{month}</option>);
    }

    const isFutureDate = (year: number, month: number) => {
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        return year > currentYear || month >= currentMonth; // No need to make sure year == currentYear since the year dropdown only shows future years
    }

    const BuyNowButton = () => {
        return <Button disabled={isLoading} variant="primary" type="submit">
            {isLoading ? <SpanningSpinnner /> : "Buy Now!"}
        </Button>
    }


    return (
        <Card>
            <Card.Header>
                <Card.Title>Credit Card Information</Card.Title>
            </Card.Header>
            <Card.Body>
                <Form noValidate validated={isFormValidated} onSubmit={handleSubmit}>
                    <Form.Group controlId="cardholderName">
                        <FloatingLabel label="Cardholder Name">
                            <Form.Control
                                required
                                type="text"
                                pattern="^[a-zA-Z\s\-]+$"
                                placeholder="Nisso Ohana"
                                value={cardholderName}
                                onChange={(e) => setCardholderName(e.target.value)} />
                            <Form.Control.Feedback type="invalid">Cardholder name must be non-empty and in English</Form.Control.Feedback>
                        </FloatingLabel>
                    </Form.Group>
                    <hr />
                    <Form.Group controlId="creditCardNumber">
                        <FloatingLabel label="Credit Card Number">
                            <Form.Control
                                required
                                type="text"
                                placeholder="**** **** **** ****"
                                pattern="^[0-9]{16}$"
                                maxLength={16}
                                value={creditCardNumber}
                                onChange={(e) => setCreditCardNumber(e.target.value)} />
                            <Form.Control.Feedback type="invalid">Credit Card Number must be 16 digits</Form.Control.Feedback>
                        </FloatingLabel>
                    </Form.Group>
                    <hr />
                    <Form.Group controlId="dateSelect">
                        <Form.Label>Expiration</Form.Label>
                        <Row>
                            <Col>
                                <FloatingLabel label="Year">
                                    <Form.Select
                                        value={year}
                                        // isValid={isFutureDate(year, month)}
                                        isInvalid={!isFutureDate(year, month)}
                                        onChange={(event) => setYear(parseInt(event.target.value))}
                                    >
                                        <YearOptions />
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col>
                                <FloatingLabel label="Month">
                                    <Form.Select
                                        value={month}
                                        // isValid={isFutureDate(year, month)}
                                        isInvalid={!isFutureDate(year, month)}
                                        onChange={(event) => setMonth(parseInt(event.target.value))}
                                    >
                                        <MonthOptions />
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">Month must be in the future</Form.Control.Feedback>
                                </FloatingLabel>
                            </Col>
                        </Row>
                    </Form.Group>
                    <hr />
                    <Form.Group>
                        <FloatingLabel label="Security Code">
                            <Form.Control
                                required
                                type="text"
                                placeholder="***"
                                pattern="^[0-9]{3}$"
                                maxLength={3}
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">Security Code must be 3 digits</Form.Control.Feedback>
                        </FloatingLabel>
                    </Form.Group>
                    <hr />
                    <BuyNowButton />
                </Form>
            </Card.Body>
        </Card >
    )

};

export default PaymentForm;