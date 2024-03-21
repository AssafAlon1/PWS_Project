import React, { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PurchaseDetails } from '../../types';
import { Button, Card, Col, Row } from 'react-bootstrap';
import PaymentForm from '../../components/PaymentForm/PaymentForm';
import { getClosestEvent, purchaseTickets } from '../../utils/fetchers';
import { AppContext } from '../../App';
import { getFormattedDateTime } from '../../utils/formatting';


const CheckoutPage: React.FC = () => {

    const location = useLocation();
    const purchaseDetails: PurchaseDetails | undefined = location.state?.purchaseDetails;
    const navigate = useNavigate();
    const context = useContext(AppContext);
    // TODO - validate purchaseDetails with JOI or something?
    const areDetailsProvided = purchaseDetails && purchaseDetails.eventId && purchaseDetails.name && purchaseDetails.quantity && purchaseDetails.price;

    useEffect(() => {
        if (!areDetailsProvided) {
            console.log("Failed on initial areDetailsProvided")
            navigate("/error", { state: { message: "No purchase details found" } });
        }
    }, [purchaseDetails, navigate]);

    const performPurchase = async () => {
        if (!areDetailsProvided) {
            console.log("Failed on purchase areDetailsProvided")
            navigate("/error", { state: { message: "No purchase details found" } });
            return;
        }
        console.log("Purchasing when details are provided");
        let username;
        try {
            console.log("Context: " + context);
            username = context.user;
        }
        catch (err) {
            console.error(err);
            return;
        }
        console.log("ONCE AGAIN")
        // TODO - Take an additional look at this
        if (!username) {
            navigate("/error", { state: { message: "No user found" } });
            return;
        }
        console.log("About to purchase tickets");
        await purchaseTickets(purchaseDetails.eventId, purchaseDetails.name, purchaseDetails.quantity, username);
        console.log("Completed purchase");
    }


    const afterPurchaseRedirect = () => {
        if (context.updateNextEvent) {
            context.updateNextEvent();
        }

        console.log("Redirecting after purchase");
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
                    <PaymentForm purchaseTickets={performPurchase} afterSuccessfulPurchase={afterPurchaseRedirect} />
                </Col>
                <Col>
                    <OrderSummaryComponent />
                </Col>
            </Row>
        </>
    );
};

export default CheckoutPage;