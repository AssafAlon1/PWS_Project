import "./CatalogEventDetails.css"

import React from 'react';

import { CSEvent } from '../../types';
import { Button, Card, Placeholder } from 'react-bootstrap';

import MissingImage from "../../assets/MissingImage.png"

const EventDetails: React.FC<{ event: CSEvent }> = ({ event }) => {

    const formatter = new Intl.DateTimeFormat('he-HE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedDate = formatter.format(event.start_date);

    return (
        <Card>
            <img src={event.image ?? MissingImage} className="card-img" />
            {/* <Card.Img
                variant="top"
                src={event.image ?? MissingImage}
            /> */}
            <Card.Body>
                <Card.Title>{event.name}</Card.Title>
                <Card.Text>{formattedDate}</Card.Text>
                <Card.Text>{event.category}</Card.Text>
                <Card.Text>From 50$</Card.Text>
                <Card.Text>1000 tickets available</Card.Text>
                <Button variant="primary">Purchase Tickets</Button>
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
