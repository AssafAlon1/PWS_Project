import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Row } from 'react-bootstrap';
import PaymentForm from '../../components/PaymentForm/PaymentForm';
import { usePurchaseDetails } from '../../components/PurchaseDetailsContext/PurchaseDetailsContext';
import TicketApi from '../../api/ticket';
import { AuthContext } from '../../components/AuthProvider/AuthProvider';
import { PaymentDetails } from '../../types';
import { CATALOG_PATH, ERROR_PATH, SUCCESS_PATH } from '../../paths';
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { LOCK_TIME_SECONDS } from '../../const';
import "./CheckoutPage.css";

const CheckoutPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [displayError, setDisplayError] = useState<boolean>(false);
    const [lockValid, setLockValid] = useState<boolean>(true);
    const [purchaseId, setPurchaseId] = useState<string>("");
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
    const [dueDate] = useState<Date>(new Date(new Date().getTime() + LOCK_TIME_SECONDS * 1000));
    const { purchaseDetails, setPurchaseDetails } = usePurchaseDetails();
    const navigate = useNavigate();
    const context = useContext(AuthContext);

    const areDetailsProvided = purchaseDetails !== null && purchaseDetails !== undefined;

    useEffect(() => {
        if (!areDetailsProvided) {
            navigate(ERROR_PATH, { state: { message: "No purchase details found" } });
        }
    }, [areDetailsProvided, purchaseDetails, navigate]);

    const performPurchase = async () => {
        if (!areDetailsProvided) {
            navigate(ERROR_PATH, { state: { message: "No purchase details found" } });
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
        if (!username) {
            navigate(ERROR_PATH, { state: { message: "No user found" } });
            return;
        }
        console.log("About to purchase tickets");
        setIsLoading(true);
        try {
            if (!paymentDetails) {
                throw new Error("No payment details found");
            }
            const result = await TicketApi.purchaseTickets(purchaseDetails, paymentDetails, username);
            if (result) {
                setPurchaseId(result);
                console.log("Purchase ID: ", result);
            }
        }
        catch (err) {
            console.error("Failed to purchase tickets");
            setIsLoading(false);
            setDisplayError(true);
            throw err;
        }
        setIsLoading(false);
        console.log("Completed purchase");
    }


    const afterPurchaseRedirect = () => {
        console.log(" >> After purchase redirect");
        if (context.updateNextEvent) {
            context.updateNextEvent();
        }

        const detailsForSuccess = { ...purchaseDetails };
        setPurchaseDetails(null);

        navigate(SUCCESS_PATH, {
            state: {
                operationType: "purchase",
                event_name: detailsForSuccess.event_name,
                ticket_amount: detailsForSuccess.ticket_amount,
                ticket_name: detailsForSuccess.ticket_name,
                price: detailsForSuccess.price,
                order_id: purchaseId
            }
        });
    }


    const renderTime = ({ remainingTime }: { remainingTime: number }) => {
        if (remainingTime === 0) {
            return <div className="timer">Ticket no longer guaranteed :(</div>;
        }

        return (
            <div className="timer">
                <div className="text">Remaining</div>
                <div className="value">{remainingTime}</div>
                <div className="text">seconds</div>
            </div>
        );
    };

    const TimerRanOut = () => {
        console.log("Timer ran out");
        setLockValid(false);
    }

    const LockCountDownComponent = () => {
        const timeLeft = Math.floor((dueDate.getTime() - new Date().getTime()) / 1000);
        return <Card className="mt-4">
            <Card.Header>
                <Card.Title>Ticket is saved for you for {LOCK_TIME_SECONDS / 60} minutes</Card.Title>
            </Card.Header>
            <Card.Body className="timer-wrapper">
                <CountdownCircleTimer
                    isPlaying
                    initialRemainingTime={timeLeft}
                    duration={LOCK_TIME_SECONDS}
                    colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                    colorsTime={[LOCK_TIME_SECONDS, (LOCK_TIME_SECONDS / 3) * 2, (LOCK_TIME_SECONDS / 3), 0]}
                    size={170}
                    strokeWidth={12}
                    updateInterval={1}
                    trailColor="#d6d6d6"
                    onComplete={() => TimerRanOut()}
                >
                    {renderTime}
                </CountdownCircleTimer>
            </Card.Body>
        </Card>
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

    useEffect(() => {
        if (purchaseId) {
            afterPurchaseRedirect();
        }
    }, [purchaseId]);


    return (
        <>
            <h1>Checkout</h1>
            <Row>
                <Col>
                    <PaymentForm
                        purchaseTickets={performPurchase}
                        isLoading={isLoading}
                        setPaymentDetails={setPaymentDetails}
                        price={price}
                        lockValid={lockValid} />
                </Col>
                <Col>
                    <OrderSummaryComponent />
                    <LockCountDownComponent />
                </Col>
            </Row>

            {/* Alert of failed purchase */}
            <Alert show={displayError && lockValid} variant="danger" onClose={() => setDisplayError(false)} dismissible className="mt-4 mb-4">
                <Alert.Heading>Failed to purchase tickets</Alert.Heading>
                <p>
                    Something went wrong while trying to purchase your tickets. Please try again.
                </p>
            </Alert>

            {/* Alert of expired lock */}
            <Alert show={!lockValid} variant="danger" className="mt-4 mb-4">
                <Alert.Heading>Time's up!</Alert.Heading>
                <p>
                    Purchase request timed-out, Your ticket is no longer guaranteed. Please try again.
                </p>
            </Alert>
            {!lockValid && <Button onClick={() => navigate(CATALOG_PATH)}>Back to Catalog</Button>}
        </>
    );
};

export default CheckoutPage;
