import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Card, Col, Row } from 'react-bootstrap';
import PaymentForm from '../../components/PaymentForm/PaymentForm';
import { usePurchaseDetails } from '../../components/PurchaseDetailsContext/PurchaseDetailsContext';
import TicketApi from '../../api/ticket';
import { AuthContext } from '../../components/AuthProvider/AuthProvider';
import { PaymentDetails } from '../../types';

const CheckoutPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [displayError, setDisplayError] = useState<boolean>(false);
    const { purchaseDetails, setPurchaseDetails } = usePurchaseDetails();
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
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
            if (!paymentDetails) {
                throw new Error("No payment details found");
            }
            const username = context.user;
            if (!username) {
                throw new Error("No user found");
            }
            await TicketApi.purchaseTickets(purchaseDetails, paymentDetails, username);
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
                event_name: detailsForSuccess.event_name,
                ticket_amount: detailsForSuccess.ticket_amount,
                ticket_name: detailsForSuccess.ticket_name,
                price: detailsForSuccess.price,
                orderId: 1234 // TODO - get from server
            }
        });
    }

    const price = (purchaseDetails?.price ?? 0) * (purchaseDetails?.ticket_amount ?? 0);

    const OrderSummaryComponent = () => {
        return (
            <Card>
                <Card.Header>
                    <Card.Title>Order Summary</Card.Title>
                </Card.Header>
                <Card.Body>
                    <Card.Text>{purchaseDetails?.event_name}</Card.Text>
                    <Card.Text>Tickets: {purchaseDetails?.ticket_amount} x {purchaseDetails?.ticket_name}</Card.Text>
                    <Card.Text>Total: ${price}</Card.Text>
                </Card.Body>
            </Card>
        );
    }


    return (
        <>
            <h1>Checkout</h1>
            <Row>
                <Col>
                    <PaymentForm
                        purchaseTickets={performPurchase}
                        afterSuccessfulPurchase={afterPurchaseRedirect}
                        isLoading={isLoading}
                        setPaymentDetails={setPaymentDetails}
                        price={price} />
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