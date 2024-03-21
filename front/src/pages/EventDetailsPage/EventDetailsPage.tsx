import './EventDetailsPage.css';

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Placeholder } from 'react-bootstrap';

import MissingImage from "../../assets/MissingImage.png"
import { CSEvent, Comment, PurchaseDetails, Ticket } from '../../types';
import { getFormattedDate, getFormattedTime } from '../../utils/formatting';
import ButtonWithTooltip from '../../components/ButtonWithTooltip/ButtonWithTooltip';
import { usePurchaseDetails } from '../../components/PurchaseDetailsContext/PurchaseDetailsContext';
import AddCommentForm from '../../components/AddCommentForm/AddCommentForm';
import { fetchComments } from '../../api/comment';
import CommentComponent from '../../components/CommentComponent/CommentComponent';
import { fetchEvent } from '../../api/event';
import { fetchTickets } from '../../api/ticket';

// TODO - extract some components to other files?
const EventDetails: React.FC<{}> = () => {
    const [event, setEvent] = useState<CSEvent | null>(null);
    const [tickets, setTickets] = useState<Ticket[] | null>(null);
    const [comments, setComments] = useState<Comment[] | null>(null);
    const [failedFetchingComments, setFailedFetchingComments] = useState<boolean>(false);

    // > Note about the failedFetchingComments state ^^^
    // > The tickets don't have a similar state because we can tell that the fetch failed if we
    // > receive back an empty array (since all events must have at least 1 ticket type).

    const { eventId } = useParams();
    const navigate = useNavigate();
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
            return navigate("/");
        }
        let fetchedEvent;
        try {
            fetchedEvent = await fetchEvent(eventId);
        }
        catch {
            return navigate("/error", { state: { message: `Failed to fetch event ${eventId}` } });
        }
        if (!fetchedEvent) {
            navigate("/notfound", { state: { message: `Event ${eventId} not found` } });
        }
        setEvent(fetchedEvent);
    }

    const updateTickets = async () => {
        if (!eventId) {
            // I believe it should be impossible to get here, but just in case...
            return navigate("/");
        }
        setTickets(null);
        let fetchedTickets: Ticket[];
        try {
            fetchedTickets = await fetchTickets(eventId) ?? [];
            if (!fetchedTickets) {
                throw new Error(`Failed to fetch tickets for event ${eventId}`);
            }
        }
        catch {
            // TODO - navigate? just display "error loading tickets"? What's better?
            // return navigate("/error", { state: { message: `Failed to fetch tickets for event ${eventId}` } });
            fetchedTickets = [];
        }
        setTickets(fetchedTickets);
    }

    const updateComments = async () => {
        if (!eventId) {
            // I believe it should be impossible to get here, but just in case...
            return navigate("/");
        }
        setComments(null);
        setFailedFetchingComments(false);
        let fetchedComments: Comment[];
        try {
            fetchedComments = await fetchComments(eventId) ?? [];
            if (!fetchedComments) {
                throw new Error(`Failed to fetch comments for event ${eventId}`);
            }
        }
        catch (err) {
            // TODO - navigate? just display "error loading comments"? What's better?
            // return navigate("/error", { state: { message: `Failed to fetch comments for event ${eventId}` } });
            console.log(err)
            setFailedFetchingComments(true);
            fetchedComments = [];
        }
        setComments(fetchedComments);
    }

    useEffect(() => {
        updateEvent();
        updateTickets(); // TODO - separate this? How harsh do we want to be?
        updateComments(); // TODO - separate this? How harsh do we want to be?
    }, [eventId]);

    const TitleComponent = () => {
        if (event) {
            return <Card.Title>{event.name}</Card.Title>
        }
        return <Placeholder as={Card.Title} animation="glow"><Placeholder xs={6} /></Placeholder>

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
                <Card className="event-block">
                    <Card.Body>
                        <Card.Text>{event?.category}</Card.Text>
                        <Card.Text>From $20</Card.Text>
                        <Card.Text>1000 tickets available</Card.Text>
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
                {/* TODO - better loading */}
                <Card.Text>{event ? event.description : "Loading..."}</Card.Text>
                {/* <Button onClick={() => { navigate("/") }}>Return to Catalog</Button> */}
            </Card.Body>
        </Card>
    }

    const BuyTicketComponent: React.FC<{ name: string, price: number, amountLeft: number }> = ({ name, price, amountLeft }) => {
        const [ticketAmount, setTicketAmount] = useState<number>(0);

        const ticketPurchaseDetails: PurchaseDetails = {
            eventId: eventId ?? "0",
            eventName: event?.name ?? "Unknown",
            name: name,
            quantity: ticketAmount,
            price: price
        }

        const onClickBuyNow = () => {
            setPurchaseDetails(ticketPurchaseDetails);
            navigate("/checkout");
        }

        return (
            <Card className="ticket-card">
                <Card.Header>
                    <b>{name}</b>
                </Card.Header>
                <Card.Body>
                    <Card.Text>Price: <b>${price}</b></Card.Text>
                    <Card.Text><b>{amountLeft}</b> tickets left!</Card.Text>
                    <Card.Text>Choose amount of tickets:</Card.Text>
                    <div className="direction-row">
                        <input className="tickets-amount" type="number" value={ticketAmount} onChange={(event) => setTicketAmount(Number(event.target.value))} />
                        <ButtonWithTooltip
                            buttonContent="Buy Now!"
                            tooltipContent={ticketAmount <= 0 ? "Cannot buy less than 1 ticket" : "Not enough tickets left"}
                            isDisabled={ticketAmount <= 0 || ticketAmount > amountLeft}
                            buttonOnClick={onClickBuyNow}
                        />

                    </div>
                </Card.Body>
            </Card>
        );
    }

    const BuyTicketsComponent = () => {
        const hasTicketsFetchFailed = Array.isArray(tickets) && tickets.length === 0;
        let bodyContent;
        if (hasTicketsFetchFailed) {
            bodyContent = <Card.Body>
                <Card.Text>Failed fetching tickets information</Card.Text>
                <Button variant="light" onClick={updateTickets}>Retry</Button>
            </Card.Body>
        } else if (tickets === null) {
            bodyContent = <Card.Body>
                <Card.Text>Loading tickets...</Card.Text>
            </Card.Body>
        } else {
            bodyContent = tickets.map((ticket, index) => {
                return <BuyTicketComponent key={index} name={ticket.name} price={ticket.price} amountLeft={ticket.quantity} />
            });
        }

        return (
            <Card className="mb-4">
                <Card.Header>
                    <Card.Title>Buy Tickets:</Card.Title>
                </Card.Header>
                <Card.Body className="direction-row">
                    {bodyContent}
                </Card.Body>
            </Card>
        );
    }

    const CommentsComponent = () => {
        let body;
        if (failedFetchingComments) {
            body = <Card.Body>
                <Card.Text>Failed fetching comments information</Card.Text>
                <Button variant="light" onClick={updateComments}>Retry</Button>

            </Card.Body>
        } else if (comments === null) {
            body = <Card.Body>
                <Card.Text>Loading comments...</Card.Text>
                {/* TODO - Better load */}
            </Card.Body>
        } else {
            body = <Card.Body>
                <AddCommentForm eventId={eventId ?? ""} updateComments={updateComments} />
                <hr />
                {comments.map((comment, index) => {
                    return <CommentComponent key={index} comment={comment} />
                })}
            </Card.Body>;
        }

        return (
            <Card>
                <Card.Header>
                    <Card.Title>
                        Comments:
                    </Card.Title>
                </Card.Header>
                {body}
            </Card>
        );
    }

    return (
        <>
            <MainInformationComponent />
            <BuyTicketsComponent />
            <CommentsComponent />
        </>

    );
};

export default EventDetails;