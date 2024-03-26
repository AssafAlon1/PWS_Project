import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const SuccessPage: React.FC = () => {
    const location = useLocation();
    const message = "Payment successful! Thank you for your purchase";
    const eventName = location.state?.event_name;
    const ticketQuantity = location.state?.ticket_amount;
    const ticketName = location.state?.ticket_name;
    const ticketPrice = location.state?.price;
    const orderId = location.state?.orderId;

    const CardBody = () => {
        if (!eventName || !ticketQuantity || !ticketName || !ticketPrice || !orderId) {
            return <Card.Body>
                <Card.Text>{message}</Card.Text>
                <Link to="/"><Button variant="primary">Return to Catalog</Button></Link>
            </Card.Body>
        }
        else {
            return <Card.Body>
                <Card.Text>Order ID: {orderId}</Card.Text>
                <Card.Text>Tickets: {ticketQuantity} x {ticketName}</Card.Text>
                <Card.Text>Total: ${ticketPrice * ticketQuantity}</Card.Text>
                <Card.Text>{message}</Card.Text>
                <Link to="/"><Button variant="primary">Return to Catalog</Button></Link>
            </Card.Body>
        }
    }

    return (
        <>
            <Card border="success">
                <Card.Header>
                    <Card.Title>Purchase Successful!</Card.Title>
                </Card.Header>
                <CardBody />

            </Card>
        </>
    );
};

export default SuccessPage;