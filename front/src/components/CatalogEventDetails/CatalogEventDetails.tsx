import "./CatalogEventDetails.css"

import React, { useContext } from 'react';

import { CSEvent } from '../../types';
import { Button, Card, Placeholder } from 'react-bootstrap';

import MissingImage from "../../assets/MissingImage.png"
import { useNavigate } from "react-router-dom";
import { getFormattedDate } from "../../utils/formatting";
import { EVENT_PATH } from "../../paths";
import { AuthContext } from "../AuthProvider/AuthProvider";
import { UserRole } from "../../const";

const EventDetails: React.FC<{ event: CSEvent }> = ({ event }) => {

    const navigate = useNavigate();
    const context = useContext(AuthContext);

    const formattedDate = getFormattedDate(event.start_date);

    const PurchaseButton = () => {
        return (
            <Button variant="primary" onClick={() => navigate(EVENT_PATH + "/" + event._id)}>Purchase Tickets</Button>
        );
    }

    const CheckDetailsButton = () => {
        return (
            <Button variant="primary" onClick={() => navigate(EVENT_PATH + "/" + event._id)}>Check details</Button>
        );
    }

    const EnterEventRealmButton = () => {
        if (context.isBackOffice && context.role <= UserRole.Worker) {
            return <CheckDetailsButton />
        } else {
            return <PurchaseButton />
        }
    }

    return (
        <Card>
            {/* <Card.Img
                variant="top"
                src={event.image ?? MissingImage}
            /> */}
            <Card.Header>
                <Card.Title>{event.title}</Card.Title>
            </Card.Header>
            <Card.Body>
                <img src={event.image ?? MissingImage} className="card-img" />
                <Card.Text>{formattedDate}</Card.Text>
                <Card.Text>{event.category}</Card.Text>
                <Card.Text>From ${event.cheapest_ticket_price}</Card.Text>
                <Card.Text>{event.total_available_tickets} tickets available</Card.Text>
                <EnterEventRealmButton/>
            </Card.Body>
        </Card>
    );
}

export const EventPlaceholder = () => {
    return (
        <Card>
            {/* <Card.Img variant="top" src={MissingImage} /> */}
            <img src={MissingImage} className="card-img" />
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

export default EventDetails;
