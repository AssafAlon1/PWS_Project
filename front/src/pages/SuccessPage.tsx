import React, { useContext } from 'react';
import { Button, Card } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../components/AuthProvider/AuthProvider';
import { CATALOG_PATH } from '../paths';

const SuccessPage: React.FC = () => {
    const location = useLocation();
    const message = location.state?.message ?? "Operation was completed successfully!";
    const operationType = location.state?.operationType ?? "purchase";
    const eventName = location.state?.event_name;
    const ticketQuantity = location.state?.ticket_amount;
    const ticketName = location.state?.ticket_name;
    const ticketPrice = location.state?.price;
    const orderId = location.state?.order_id;
    const createdEventId = location.state?.created_event_id;

    const CardBody = () => {
        const authContext = useContext(AuthContext); // Is this OK? We need to update the next event after purchase...

        const handleReturnToCatalog = () => {
            authContext.updateNextEvent();
        };

        if (operationType == "purchase" && eventName && ticketQuantity && ticketName && ticketPrice != undefined && orderId) {
            return <Card.Body>
                <Card.Text>Order ID: {orderId}</Card.Text>
                <Card.Text>Tickets: {ticketQuantity} x {ticketName}</Card.Text>
                <Card.Text>Total: ${ticketPrice * ticketQuantity}</Card.Text>
                <Card.Text>{message}</Card.Text>
                <Link to={CATALOG_PATH}><Button variant="primary" onClick={handleReturnToCatalog}>Return to Catalog</Button></Link>
            </Card.Body>
        }
        else if (operationType == "refund" && orderId) { // TODO - More info
            return <Card.Body>
                <Card.Text>Order ID: {orderId}</Card.Text>
                <Card.Text>{message}</Card.Text>
                <Link to={CATALOG_PATH}><Button variant="primary" onClick={handleReturnToCatalog}>Return to Catalog</Button></Link>
            </Card.Body>
        }
        else if (operationType == "create" && createdEventId) {
            return <Card.Body>
                <Card.Text>Event ID: {createdEventId}</Card.Text>
                <Card.Text>{message}</Card.Text>
                <Link to={CATALOG_PATH}><Button variant="primary" onClick={handleReturnToCatalog}>Return to Catalog</Button></Link>
            </Card.Body>
        }
        else { // Souldn't get here
            return <Card.Body>
                <Card.Text>{message}</Card.Text>
                <Link to={CATALOG_PATH}><Button variant="primary" onClick={handleReturnToCatalog}>Return to Catalog</Button></Link>
            </Card.Body>
        }
    }

    const title = operationType == "purchase" ? "Purchase Successful!" : (operationType == "refund" ? "Refund Successful!" : "Event Creation Successful!");
    return (
        <>
            <Card border="success">
                <Card.Header>
                    <Card.Title>{title}</Card.Title>
                </Card.Header>
                <CardBody />
            </Card>
        </>
    );
};

export default SuccessPage;