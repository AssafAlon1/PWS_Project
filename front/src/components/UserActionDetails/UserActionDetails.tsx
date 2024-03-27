import React from 'react';
import { getFormattedDate } from "../../utils/formatting";
import { Button, Card, Placeholder } from 'react-bootstrap';
import { UserAction } from '../../types';


const ActionDetails: React.FC<{ action: UserAction }> = ({ action }) => {

    const formattedDate = getFormattedDate(action.purchase_time);
    const handleRefund = () => {
        // TODO - implement
        return null;
    }
    const isRefundable = (purchaseId: string) => {
        // TODO - implement
        console.log("Refundable: " + purchaseId);
        return false;
    }

    return (
        <Card>
            <Card.Header>
                {/* TODO - need event name!! */}
                <Card.Title>{action.eventId}</Card.Title> 
            </Card.Header>
            <Card.Body>
                <Card.Text>{action.ticketName}</Card.Text>
                <Card.Text>{action.amount} tickets</Card.Text>
                <Card.Text>Bought at: {formattedDate}</Card.Text>
                <Button variant="primary" onClick={() => handleRefund()} disabled = {isRefundable(action.purchaseId)}>Request Refund</Button>
            </Card.Body>
        </Card>
    );
}


// TODO - Code duplication with CatalogEventDetails.tsx, maybe remove
export const ActionPlaceholder = () => {
    return (
        <Card>
            {/* <Card.Img variant="top" src={MissingImage} /> */}
            <Card.Body>
                <Placeholder as={Card.Title} animation="glow">
                    <Placeholder xs={6} />
                </Placeholder>
                <Placeholder as={Card.Text} animation="glow">
                    <Placeholder xs={2} /> <Placeholder xs={2} /> <Placeholder xs={4} />{' '}
                    <Placeholder xs={4} /> <Placeholder xs={5} />{' '}
                    <Placeholder xs={3} /> <Placeholder xs={2} />{' '}
                    <Placeholder xs={3} /> <Placeholder xs={4} /> <Placeholder xs={5} />{' '}
                </Placeholder>
                <Placeholder.Button variant="primary" xs={6} />
            </Card.Body>
        </Card>
    );
}

export default ActionDetails;