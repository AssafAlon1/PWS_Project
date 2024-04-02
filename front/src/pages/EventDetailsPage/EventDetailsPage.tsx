import './EventDetailsPage.css';

import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Placeholder, Row } from 'react-bootstrap';

import MissingImage from "../../assets/MissingImage.png"
import { CSEvent, PurchaseDetails, Ticket } from '../../types';
import { getFormattedDate, getFormattedTime } from '../../utils/formatting';
import ButtonWithTooltip from '../../components/ButtonWithTooltip/ButtonWithTooltip';
import { usePurchaseDetails } from '../../components/PurchaseDetailsContext/PurchaseDetailsContext';
import EventApi from '../../api/event';
import TicketApi from '../../api/ticket';
import { ThreeSpanningSpinners } from '../../components/SpinnerComponent/SpinnerComponent';
import CommentsComponent from '../../components/CommentsComponent/CommentsComponent';
import { CATALOG_PATH, CHECKOUT_PATH, ERROR_PATH, NOTFOUND_PATH } from '../../paths';

import { AuthContext } from '../../components/AuthProvider/AuthProvider';
import PostponeEventForm from '../../components/PostponeEventForm/PostponeEventForm';
import { UserRole } from '../../const';

const EventDetails: React.FC = () => {
    const [event, setEvent] = useState<CSEvent | null>(null);
    const [tickets, setTickets] = useState<Ticket[] | null>(null);

    const { eventId } = useParams();
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);
    const { purchaseDetails, setPurchaseDetails } = usePurchaseDetails();

    // Reset purchase details when the component is loaded
    useEffect(() => {
        if (purchaseDetails) {
            setPurchaseDetails(null);
        }
    }, []);

    const updateEvent = async () => {

        if (!eventId) {
            // I believe it should be impossible to get here, but just in case...
            return navigate(CATALOG_PATH);
        }
        let fetchedEvent;
        try {
            if (authContext.isBackOffice) {
                fetchedEvent = await EventApi.fetchBackOfficeEvent(eventId);
            }
            else {
                fetchedEvent = await EventApi.fetchEvent(eventId);
            }
        }
        catch {
            return navigate(ERROR_PATH, { state: { message: `Failed to fetch event ${eventId}` } });
        }
        if (!fetchedEvent) {
            navigate(NOTFOUND_PATH, { state: { message: `Event ${eventId} not found` } });
        }
        setEvent(fetchedEvent);
    }

    const updateTickets = async () => {
        if (!eventId) {
            // I believe it should be impossible to get here, but just in case...
            return navigate(CATALOG_PATH);
        }
        setTickets(null);
        let fetchedTickets: Ticket[];
        try {
            if (authContext.isBackOffice) {
                fetchedTickets = await TicketApi.fetchBackOfficeTickets(eventId) ?? [];
            } else {
                fetchedTickets = await TicketApi.fetchTickets(eventId) ?? [];
            }
            if (!fetchedTickets) {
                throw new Error(`Failed to fetch tickets for event ${eventId}`);
            }
        }
        catch {
            fetchedTickets = [];
        }
        setTickets(fetchedTickets);
    }


    useEffect(() => {
        updateEvent();
        updateTickets();
    }, [eventId]);

    const TitleComponent = () => {
        if (event) {
            return <Card.Title>{event.title}</Card.Title>
        }
        return <Placeholder as={Card.Title} animation="glow"><Placeholder xs={6} /></Placeholder>

    }

    const ImageComponent = () => {
        if (event) {
            return <img src={event.image ?? MissingImage} className="card-img" />
        }
        return <img src={MissingImage} className="card-img" />
    }

    const PricingAndAvailabilityComponent = () => {
        if (event) {
            return (
                <Card className="event-block">
                    <Card.Body>
                        <Card.Text>{event?.category}</Card.Text>
                        { !authContext.isBackOffice && <Card.Text>From ${event.cheapest_ticket_price}</Card.Text>}
                        <Card.Text>{event.total_available_tickets} tickets available</Card.Text>
                    </Card.Body>
                </Card>
            )
        }

        return (
            <Card className="event-block">
                <Placeholder as={Card.Body} animation="glow">
                    <Placeholder xs={4} /> <Placeholder xs={4} />{' '}<br />
                    <Placeholder xs={5} /> <Placeholder xs={3} />{' '}<br />
                    <Placeholder xs={3} /> <Placeholder xs={3} /> <Placeholder xs={3} />{' '}
                </Placeholder>
            </Card>
        );
    }

    const TimeAndPlaceComponent = () => {
        if (event) {
            const formattedStartDate = getFormattedDate(event.start_date);
            const formattedEndDate = getFormattedDate(event.end_date);
            return (
                <Card className="event-block">
                    <Card.Body>
                        <Card.Text>{formattedStartDate + ((formattedEndDate == formattedStartDate) ? "" : " - " + formattedEndDate)}</Card.Text>
                        <Card.Text>{getFormattedTime(event.start_date)} - {getFormattedTime(event.end_date)}</Card.Text>
                        <Card.Text>{event.location}</Card.Text>
                    </Card.Body>
                </Card>
            );
        }
        return (
            <Card className="event-block">
                <Placeholder as={Card.Body} animation="glow">
                    <Placeholder xs={2} /> <Placeholder xs={2} /> <Placeholder xs={4} />{' '}
                    <Placeholder xs={4} /> <Placeholder xs={5} />{' '}
                    <Placeholder xs={3} /> <Placeholder xs={4} /> <Placeholder xs={2} />{' '}
                </Placeholder>
            </Card>
        );
    }

    const MainInformationComponent = () => {
        let descriptionAndMaybeCommentCount;
        if (authContext.isBackOffice) {
            descriptionAndMaybeCommentCount = <Row>
                <Col><Card.Text>{event ? event.description : <ThreeSpanningSpinners />}</Card.Text></Col>
                <Col><Card.Text>Comments: {event ? event.comment_count : "0"}</Card.Text></Col>
            </Row>
        }
        else {
            descriptionAndMaybeCommentCount = <Card.Text>{event ? event.description : <ThreeSpanningSpinners />}</Card.Text>
        }

        return <Card className="event-details mb-4">
            <Card.Header>
                <TitleComponent />
            </Card.Header>
            <Card >
                <Card.Body className="event-info">
                    <ImageComponent />
                    <PricingAndAvailabilityComponent />
                    <TimeAndPlaceComponent />
                </Card.Body>
            </Card>
            <Card.Body>
                {descriptionAndMaybeCommentCount}
            </Card.Body>
        </Card>
    }

    const BuyTicketComponent: React.FC<{ name: string, price: number, amountLeft: number }> = ({ name, price, amountLeft }) => {
        const [ticketAmount, setTicketAmount] = useState<number>(0);
        const [errorMessage, setErrorMessage] = useState<string>("");
        // IMPORTANT TODO - The setErrorMessage isn't working, as observed by the debug `console.log`

        const ticketPurchaseDetails: PurchaseDetails = {
            event_id: eventId ?? "0",
            event_name: event?.title ?? "Unknown",
            ticket_name: name,
            ticket_amount: ticketAmount,
            price: price
        }

        const onClickBuyNow = async () => {
            console.log("Buying tickets");
            setErrorMessage("");
            if (!eventId || !authContext || !authContext.user) {
                setErrorMessage("Error: Missing event id or user information");
                return;
            }
            console.log("Set purchase details to: ", ticketPurchaseDetails);
            console.log("Locking ticket");
            try {
                await TicketApi.lockTickets(eventId, ticketPurchaseDetails.ticket_name, ticketAmount, authContext.user);
                setPurchaseDetails(ticketPurchaseDetails);
                navigate(CHECKOUT_PATH);
            }
            catch (error) {
                console.error("Failed to lock ticket: ", error);
                setErrorMessage("Error: Failed to lock ticket");
                return;
            }
        }

        return (
            <Card className={`ticket-card ${amountLeft <= 0 ? "gray" : ""}`}>
                <Card.Header>
                    <b>{name}</b>
                </Card.Header>
                <Card.Body>
                    <Card.Text>Price: <b>${price}</b></Card.Text>
                    <Card.Text><b>{amountLeft}</b> tickets left!</Card.Text>
                    <Card.Text>{amountLeft <= 0 ? "SOLD OUT!" : "Choose amount of tickets:"}</Card.Text>
                    <div className="direction-row">
                        <input disabled={amountLeft <= 0} className="tickets-amount" type="number" value={ticketAmount} onChange={(event) => setTicketAmount(Number(event.target.value))} />
                        <ButtonWithTooltip
                            buttonContent={errorMessage ? "Try Again" : "Buy Now!"}
                            tooltipContent={ticketAmount <= 0 ? "Cannot buy less than 1 ticket" : "Not enough tickets left"}
                            isDisabled={ticketAmount <= 0 || ticketAmount > amountLeft}
                            buttonOnClick={onClickBuyNow}
                        />
                    </div>
                    <Alert variant="danger" show={errorMessage !== ""} onClose={ () => setErrorMessage("")} dismissible>
                        Oopsie woopsie!
                    </Alert>
                </Card.Body>
            </Card>
        );
    }

    const PresentTicketComponent: React.FC<{ name: string, price: number, amountLeft: number, totalAmount: number }> = ({ name, price, amountLeft, totalAmount }) => {
        return (
            <Card className={`ticket-card ${amountLeft <= 0 ? "gray" : ""}`}>
                <Card.Header>
                    <b>{name}</b>
                </Card.Header>
                <Card.Body>
                    <Card.Text>Price: <b>${price}</b></Card.Text>
                    <Card.Text>Sold: <b>{totalAmount - amountLeft}</b>/{totalAmount}</Card.Text>
                </Card.Body>
            </Card>
        );
    }

    const TicketsComponent = () => {
        const TicketBody = () => {
            const hasTicketsFetchFailed = Array.isArray(tickets) && tickets.length === 0;
            if (hasTicketsFetchFailed) {
                return <Card.Body>
                    <Card.Text>Failed fetching tickets information</Card.Text>
                    <Button variant="light" onClick={updateTickets}>Retry</Button>
                </Card.Body>
            }
            if (tickets === null) {
                return <Card.Body>
                    <Card.Text><ThreeSpanningSpinners /></Card.Text>
                </Card.Body>;
            }
            if (authContext.isBackOffice) {
                return tickets.map((ticket, index) => {
                    return <PresentTicketComponent key={index}
                        name={ticket.name}
                        price={ticket.price}
                        amountLeft={ticket.available}
                        totalAmount={ticket.total || 0} />
                });
            }
            // Front Desk
            return tickets.map((ticket, index) => {
                return <BuyTicketComponent
                    key={index}
                    name={ticket.name}
                    price={ticket.price}
                    amountLeft={ticket.available} />
            });
        }

        return (
            <Card className="mb-4">
                <Card.Header>
                    {authContext.isBackOffice && <Card.Title>Tickets:</Card.Title>}
                    {!authContext.isBackOffice && <Card.Title>Buy Tickets:</Card.Title>}
                </Card.Header>
                <Card.Body className="direction-row">
                    <TicketBody />
                </Card.Body>
            </Card>
        );
    }



    return <>
        <MainInformationComponent />
        <TicketsComponent />
        {!authContext.isBackOffice &&
            <CommentsComponent
                eventId={eventId}
            />
        }
        {
            ( authContext.isBackOffice && authContext.role <= UserRole.Manager) &&
            <PostponeEventForm csEvent={event} refetchEvent={updateEvent} />
        }
    </>
};

export default EventDetails;