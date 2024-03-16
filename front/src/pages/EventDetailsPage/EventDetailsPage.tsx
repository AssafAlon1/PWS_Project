import './EventDetailsPage.css';

import React, { useEffect, useState } from 'react';
import { fetchEvent } from '../../utils/fetchers';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card } from 'react-bootstrap';

import MissingImage from "../../assets/MissingImage.png"
import { CSEvent } from '../../types';
import { getFormattedDate, getFormattedTime } from '../../utils/formatting';


const EventDetails: React.FC<{}> = () => {
    const [event, SetEvent] = useState<CSEvent | null>(null);
    const { eventId } = useParams();
    const navigate = useNavigate();

    const updateEvent = async () => {

        if (!eventId) {
            // I believe it should be impossible to get here, but just in case...
            return navigate("/");
        }
        const fetchedEvent = await fetchEvent(eventId);
        console.log(fetchedEvent);
        if (!fetchedEvent) {
            alert(`Event ${eventId} not found`); // TODO - redirect to home? 404? never show in the first place?
            navigate("/")
        }
        SetEvent(fetchedEvent);
    }

    useEffect(() => {
        updateEvent();
    }, [eventId]);

    const TitleComponent = () => {
        if (event) {
            return <Card.Title>{event.name}</Card.Title>
        }
        return <Card.Title>Loading...</Card.Title>
    }

    const ImageComponent = () => {
        if (event) {
            return <img src={event.image ?? MissingImage} className="card-img" />
        }
        return <img src={MissingImage} className="card-img" />
    }
    // const ImageComponent = () => {
    //     if (event) {
    //         return <Card.Img src={event.image ?? MissingImage} />
    //     }
    //     return <Card.Img src={MissingImage} />
    // }

    const PricingAndAvailabilityComponent = () => {
        if (event) {
            return (
                <Card.Body>
                    <Card.Text>{event?.category}</Card.Text>
                    <Card.Text>From $20</Card.Text>
                    <Card.Text>1000 tickets available</Card.Text>
                </Card.Body>
            )
        }
        return <Card.Body>Loading...</Card.Body>
    }

    const TimeAndPlaceComponent = () => {
        if (event) {
            const formattedStartDate = getFormattedDate(event.start_date);
            const formattedEndDate = getFormattedDate(event.end_date);
            return (
                <Card.Body>
                    <Card.Text>{formattedStartDate + ((formattedEndDate == formattedStartDate) ? "" : " - " + formattedEndDate)}</Card.Text>
                    <Card.Text>{getFormattedTime(event.start_date)} - {getFormattedTime(event.end_date)}</Card.Text>
                    <Card.Text>{event.location}</Card.Text>
                </Card.Body>
            )
        }
        return <Card.Body>Loading...</Card.Body>
    }

    const BuyTicketComponent: React.FC<{ name: string, price: number, amountLeft: number }> = ({ name, price, amountLeft }) => {
        const [ticketAmount, setTicketAmount] = useState<number>(0);

        const handleBuyNow = () => {
            if (ticketAmount == 0) {
                alert("No tickets.. :/");
                return;
            }
            alert(`Sold! ${ticketAmount}`);
        };

        return (
            <Card className="ticket-card">
                <Card.Header>
                    {name}
                </Card.Header>
                <Card.Body>
                    <Card.Text>Price: ${price}</Card.Text>
                    <Card.Text>{amountLeft} tickets left!</Card.Text>
                    <Card.Text>Choose amount of tickets:</Card.Text>
                    <div className="direction-row">
                        <input className="tickets-amount" type="number" value={ticketAmount} onChange={(event) => setTicketAmount(Number(event.target.value))} />
                        <Button onClick={handleBuyNow}>Buy now</Button>
                    </div>
                </Card.Body>
            </Card>
        );
    }

    const BuyTicketsComponent = () => {
        return (
            <Card>
                <Card.Header>
                    <Card.Title>Buy Tickets:</Card.Title>
                </Card.Header>
                <Card.Body className="direction-row">
                    <BuyTicketComponent name={"Tickets Type 1"} price={50} amountLeft={500} />
                    <BuyTicketComponent name={"Tickets Type 2"} price={75} amountLeft={500} />
                </Card.Body>
            </Card>
        )
    }

    // TODO - Better Loading, error handling
    return (
        <>
            <Card className="event-details">
                <Card.Header>
                    <TitleComponent />
                </Card.Header>
                <Card className="event-info">
                    <ImageComponent />
                    <PricingAndAvailabilityComponent />
                    <TimeAndPlaceComponent />
                </Card>
                <Card.Body>
                    <Card.Text>{event ? event.description : "Loading..."}</Card.Text>
                    <Button onClick={() => { navigate("/") }}>Return to Catalog</Button>
                </Card.Body>
            </Card>

            <BuyTicketsComponent />
        </>

    );
};

export default EventDetails;