import "./CatalogEventDetails.css"

import React from 'react';

import { CSEvent } from '../../types';
import { Button, Card, Placeholder } from 'react-bootstrap';

import MissingImage from "../../assets/MissingImage.png"
import { useNavigate } from "react-router-dom";
import { getFormattedDate } from "../../utils/formatting";
import { EVENT_PATH } from "../../paths";

const EventDetails: React.FC<{ event: CSEvent }> = ({ event }) => {

    const navigate = useNavigate();

    const formattedDate = getFormattedDate(event.start_date);


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
                <Button variant="primary" onClick={() => navigate(EVENT_PATH + "/" + event._id)}>Purchase Tickets</Button>
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
