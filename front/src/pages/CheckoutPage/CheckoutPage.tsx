import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Card, Col, Row } from 'react-bootstrap';
import PaymentForm from '../../components/PaymentForm/PaymentForm';
import { AppContext } from '../../App';
import { usePurchaseDetails } from '../../components/PurchaseDetailsContext/PurchaseDetailsContext';
import { purchaseTickets } from '../../api/ticket';

const CheckoutPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [displayError, setDisplayError] = useState<boolean>(false);
    const { purchaseDetails, setPurchaseDetails } = usePurchaseDetails();
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
        setIsLoading(true);
        try {
            await purchaseTickets(purchaseDetails.eventId, purchaseDetails.name, purchaseDetails.quantity, username);
        }
        catch (err) {
            setIsLoading(false);
            setDisplayError(true);
            throw err;
        }
        setIsLoading(false);
        console.log("Completed purchase");
    }


    const afterPurchaseRedirect = () => {
        if (context.updateNextEvent) {
            context.updateNextEvent();
        }

        const detailsForSuccess = { ...purchaseDetails };
        setPurchaseDetails(null);

        console.log("Redirecting after purchase");
        navigate("/success", {
            state: {
                eventName: detailsForSuccess.eventName,
                quantity: detailsForSuccess.quantity,
                name: detailsForSuccess.name,
                price: detailsForSuccess.price,
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
                    <PaymentForm purchaseTickets={performPurchase} afterSuccessfulPurchase={afterPurchaseRedirect} isLoading={isLoading} />
                </Col>
                <Col>
                    <OrderSummaryComponent />
                </Col>
            </Row>
            <Alert show={displayError} variant="danger" onClose={() => setDisplayError(false)} dismissible>
                <Alert.Heading>Failed to purchase tickets</Alert.Heading>
                <p>
                    Something went wrong while trying to purchase your tickets. Please try again.
                </p>
            </Alert>
        </>
    );
};

export default CheckoutPage;