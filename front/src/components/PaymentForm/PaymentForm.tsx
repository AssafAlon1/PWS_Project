import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PurchaseDetails } from '../../types';
import { Button, Card, Col, FloatingLabel, Form, Row } from 'react-bootstrap';


const PaymentForm: React.FC = () => {

    const [isFormValidated, setFormValidated] = useState<boolean>(false);
    const [isDateValidated, setDateValidated] = useState<boolean>(false);
    const [year, setYear] = useState<number>(0);
    const [month, setMonth] = useState<number>(0);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }
        setFormValidated(true);
    }

    const YearOptions = () => {
        const currentYear = new Date().getFullYear() % 100; // Mod to discard the first two digits
        const years = Array.from(new Array(10), (val, index) => currentYear + index);
        return years.map((year, index) => <option key={index}>{year}</option>);
    }

    const MonthOptions = () => {
        const months = Array.from(new Array(12), (val, index) => index + 1);
        return months.map((month, index) => <option key={index}>{month < 10 ? "0" : ""}{month}</option>);
    }

    const isFutureDate = (year: number, month: number) => {
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        return year > currentYear || month >= currentMonth; // No need to make sure year == currentYear since the year dropdown only shows future years
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
                                placeholder="Nisso Ohana" />
                            <Form.Control.Feedback type="invalid">Cardholder name must be non-empty and in English</Form.Control.Feedback>
                        </FloatingLabel>
                    </Form.Group>
                    <hr />
                    <Form.Group controlId="creditCardNumber">
                        <FloatingLabel label="Credit Card Number">
                            <Form.Control
                                type="text"
                                placeholder="**** **** **** ****"
                                pattern="^[0-9]{16}$"
                                maxLength={16} />
                            <Form.Control.Feedback type="invalid">Credit Card Number must be 16 digits</Form.Control.Feedback>
                        </FloatingLabel>
                    </Form.Group>
                    <hr />
                    <Form.Group controlId="dateSelect">
                        <Form.Label>Expiration</Form.Label>
                        <Row>
                            <Col>
                                <FloatingLabel label="Year">
                                    <Form.Select isValid={isFutureDate(year, month)}>
                                        <YearOptions />
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col>
                                <FloatingLabel label="Month">
                                    <Form.Select>
                                        <MonthOptions />
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                        </Row>
                    </Form.Group>
                    <hr />
                    <Form.Group>
                        <FloatingLabel label="Security Code">
                            <Form.Control
                                type="text"
                                placeholder="***"
                                pattern="^[0-9]{3}$"
                                maxLength={3} />
                        </FloatingLabel>
                    </Form.Group>
                    <hr />
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    )

};

export default PaymentForm;