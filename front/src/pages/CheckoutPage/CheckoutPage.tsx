import React, { useEffect } from 'react';
import { Form, useLocation, useNavigate } from 'react-router-dom';
import { PurchaseDetails } from '../../types';
import { Button, Card } from 'react-bootstrap';


const CheckoutPage: React.FC = () => {

    const location = useLocation();
    const purchaseDetails: PurchaseDetails | undefined = location.state?.purchaseDetails;
    const navigate = useNavigate();

    const areDetailsProvided = purchaseDetails && purchaseDetails.eventId && purchaseDetails.name && purchaseDetails.quantity && purchaseDetails.price;

    useEffect(() => {
        if (!purchaseDetails || !purchaseDetails.eventId || !purchaseDetails.name || !purchaseDetails.quantity || !purchaseDetails.price) {
            navigate("/error", { state: { message: "No purchase details found" } });
        }
    }, [purchaseDetails, navigate]);



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
                    <hr />
                    <Button variant="primary">Buy Now! :)</Button>
                </Card.Body>
            </Card>
        );
    }


    return (
        <>
            <h1>Checkout</h1>
            <OrderSummaryComponent />
        </>
    );
};

export default CheckoutPage;