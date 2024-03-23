import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Card, Col, Row } from 'react-bootstrap';
import PaymentForm from '../../components/PaymentForm/PaymentForm';
import { usePurchaseDetails } from '../../components/PurchaseDetailsContext/PurchaseDetailsContext';
import TicketApi from '../../api/ticket';
import { AuthContext } from '../../components/AuthProvider/AuthProvider';

const CheckoutPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [displayError, setDisplayError] = useState<boolean>(false);
    const { purchaseDetails, setPurchaseDetails } = usePurchaseDetails();
    const navigate = useNavigate();
    const context = useContext(AuthContext);

    const areDetailsProvided = purchaseDetails !== null && purchaseDetails !== undefined;

    useEffect(() => {
        if (!areDetailsProvided) {
            navigate("/error", { state: { message: "No purchase details found" } });
        }
    }, [areDetailsProvided, purchaseDetails, navigate]);

    const performPurchase = async () => {
        if (!areDetailsProvided) {
            navigate("/error", { state: { message: "No purchase details found" } });
            return;
        }
        let username;
        try {
            username = context.user;
        }
        catch (err) {
            console.error(err);
            return;
        }
        // TODO - Take an additional look at this
        if (!username) {
            navigate("/error", { state: { message: "No user found" } });
            return;
        }
        console.log("About to purchase tickets");
        setIsLoading(true);
        try {
            await TicketApi.purchaseTickets(purchaseDetails.eventId, purchaseDetails.name, purchaseDetails.quantity, username);
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