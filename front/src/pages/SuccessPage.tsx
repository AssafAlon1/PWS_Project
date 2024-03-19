import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const SuccessPage: React.FC = () => {
    const location = useLocation();
    const message = "Payment successful! Thank you for your purchase";
    const eventName = location.state?.eventName;
    const ticketQuantity = location.state?.quantity;
    const ticketName = location.state?.name;
    const ticketPrice = location.state?.price;
    const orderId = location.state?.orderId;
    // TODO - validate message, eventName, ticketQuantity, ticketName, ticketPrice, orderId

    return (
        <>
            <Card border="success">
                <Card.Header>
                    <Card.Title>Purchase Successful!</Card.Title>
                    <Card.Subtitle>{eventName}</Card.Subtitle>
                </Card.Header>
                <Card.Body>
                    <Card.Text>Order ID: {orderId}</Card.Text>
                    <Card.Text>Tickets: {ticketQuantity} x {ticketName}</Card.Text>
                    <Card.Text>Total: ${ticketPrice * ticketQuantity}</Card.Text>
                    <Card.Text>{message}</Card.Text>
                    <Link to="/"><Button variant="primary">Return to Catalog</Button></Link>
                </Card.Body>
            </Card>
        </>
    );
};

export default SuccessPage;