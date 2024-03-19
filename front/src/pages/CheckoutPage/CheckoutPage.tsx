import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PurchaseDetails } from '../../types';
import { Button, Card, Col, Row } from 'react-bootstrap';
import PaymentForm from '../../components/PaymentForm/PaymentForm';


const CheckoutPage: React.FC = () => {

    const location = useLocation();
    const purchaseDetails: PurchaseDetails | undefined = location.state?.purchaseDetails;
    const navigate = useNavigate();

    // TODO - validate purchaseDetails with JOI or something?
    const areDetailsProvided = purchaseDetails && purchaseDetails.eventId && purchaseDetails.name && purchaseDetails.quantity && purchaseDetails.price;

    useEffect(() => {
        if (!areDetailsProvided) {
            navigate("/error", { state: { message: "No purchase details found" } });
        }
    }, [purchaseDetails, navigate]);

    const onPurchase = () => {
        navigate("/success", {
            state: {
                eventName: purchaseDetails?.eventName,
                quantity: purchaseDetails?.quantity,
                name: purchaseDetails?.name,
                price: purchaseDetails?.price,
                orderId: 1234 // TODO - get from server
            }
        });
    }

    const OrderSummaryComponent = () => {
        return (
            <Card>
                <Card.Header>
                    <Card.Title>Order Summary</Card.Title>
                </Card.Header>
                <Card.Body>
                    <Card.Text>{purchaseDetails?.eventName}</Card.Text>
                    <Card.Text>Tickets: {purchaseDetails?.quantity} x {purchaseDetails?.name}</Card.Text>
                    <Card.Text>Total: ${(purchaseDetails?.price ?? 0) * (purchaseDetails?.quantity ?? 0)}</Card.Text>
                </Card.Body>
            </Card>
        );
    }


    return (
        <>
            <h1>Checkout</h1>
            <Row>
                <Col>
                    <PaymentForm onSuccessfulPurchase={onPurchase} />
                </Col>
                <Col>
                    <OrderSummaryComponent />
                </Col>
            </Row>
        </>
    );
};

export default CheckoutPage;