import React, { useEffect, useState } from 'react';
import { getFormattedDate, getFormattedTime } from "../../utils/formatting";
import { Alert, Button, Card, Container, Placeholder } from 'react-bootstrap';
import { CSEvent, UserAction } from '../../types';
import EventApi from '../../api/event';
import ButtonWithTooltip from '../ButtonWithTooltip/ButtonWithTooltip';
import MissingImage from "../../assets/MissingImage.png"
import { ThreeSpanningSpinners } from '../SpinnerComponent/SpinnerComponent';
import { useNavigate } from 'react-router-dom';
import UserActionApi from '../../api/userAction';
import { SUCCESS_PATH } from '../../paths';
import "./UserActionDetails.css";

interface ActionDetailsProps {
    action: UserAction;
    csevent: CSEvent | null;
}

interface ConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    message: string;
}

const ActionDetails: React.FC<ActionDetailsProps> = ({ action, csevent }) => {
    const [isLoadingEvent, setIsLoadingEvent] = useState<boolean>(false);
    const [isRefundable, setIsRefundable] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [errorText, setErrorText] = useState<string>("");
    const [reasonNotRefundable, setReason] = useState<string>("Loading...");
    const [eventDetails, setEventDetails] = useState<CSEvent | null>(null);
    const formattedDate = getFormattedDate(action.purchase_time);

    const navigate = useNavigate();

    // Internal component for the confirmation modal
    const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onConfirm, onCancel, message, }) => {
        if (!isOpen) {
            return null;
        }
        return (
            <div className="modal">
              <div className="modal-content">
                <p>{message}</p>
                <Button onClick={onConfirm} className='mb-2 mt-2'> OK </Button>
                <Button  variant= "secondary" onClick={onCancel} className='mb-2 mt-2'> Cancel </Button>
              </div>
            </div>
        );
    };

    const handleRefund = async () => {
        setErrorText("");
        setLoading(true);
        try {
            await UserActionApi.refundPurchase(action.purchase_id);
            setLoading(false);
            navigate(SUCCESS_PATH, {
                state: {
                    message: "Refund was successful!",
                    operationType: "refund",
                    order_id: action.purchase_id,
                    ticket_amount: action.ticket_amount,
                    ticket_name: action.ticket_name,
                    // TODO - PRICE to action and then here
                }
            })
        }
        catch (error) {
            console.error("Failed to refund purchase");
            setErrorText("Failed to refund purchase " + action.purchase_id + " Please try again later");
            setLoading(false);
            return;
        }
    }

    const updateEvent = async () => {
        setIsLoadingEvent(true);

        if (csevent) {
            setEventDetails(csevent);
            setIsLoadingEvent(false);
            return;
        }

        let fetchedEvent;
        try {
            fetchedEvent = await EventApi.fetchEvent(action.event_id);

            if (!fetchedEvent) {
                throw new Error("Event not found");
            }
        }
        catch {
            setIsLoadingEvent(false);
            setReason("Failed to fetch event information");
            return;
        }
        setEventDetails(fetchedEvent);
        setIsLoadingEvent(false);
    }
    useEffect(() => {
        updateEvent();
    }, []);

    useEffect(() => {
        if (!eventDetails) {
            return;
        }
        if (new Date(eventDetails.start_date) < new Date()) {
            setReason("Event has already started");
            return;
        }
        if (action.refund_time) {
            setReason("Purchase already refunded on " + getFormattedDate(action.refund_time));
            return;
        }
        setIsRefundable(true);
    }, [eventDetails]);

    const ImageComponent = () => {
        if (eventDetails) {
            return <img src={eventDetails.image ?? MissingImage} className="card-img me-2" />
        }
        return <img src={MissingImage} className="card-img me-2" />
    }

    const EventInformationCard = () => {
        if (isLoadingEvent) {
            return (
                <Card className="me-2">
                    <Card.Text>Loading event information...</Card.Text>
                    <Card.Body className="direction-row">
                        <ThreeSpanningSpinners />
                    </Card.Body>
                </Card>
            );
        }
        if (!eventDetails) {
            return (
                <Card className="me-2">
                    <Card.Body>
                        <Card.Text>Failed fetching event information</Card.Text>
                        <Button variant="light" onClick={updateEvent}>Retry</Button>
                    </Card.Body>
                </Card>
            );
        }
        return (
            <Card className="me-2">
                <Card.Text>Event Category: {eventDetails?.category}</Card.Text>
                <Card.Text>Date: {formattedStartDate + ((formattedEndDate == formattedStartDate) ? "" : " - " + formattedEndDate)}</Card.Text>
                <Card.Text>Time: {formattedStartTime} - {formattedEndTime}</Card.Text>
                <Card.Text>Location: {eventDetails?.location}</Card.Text>
            </Card>
        );
    }

    const title = eventDetails ? eventDetails.title : action.event_id;
    const formattedStartDate = eventDetails?.start_date ? getFormattedDate(eventDetails.start_date) : "";
    const formattedEndDate = eventDetails?.end_date ? getFormattedDate(eventDetails.end_date) : "";
    const formattedStartTime = eventDetails?.start_date ? getFormattedTime(eventDetails.start_date) : "";
    const formattedEndTime = eventDetails?.end_date ? getFormattedTime(eventDetails.end_date) : "";
    const refundconfirmationMessage = "Are you sure you want to refund your purchase of " + action.ticket_amount + " " + action.ticket_name + " tickets for " + title + "?";
    return (
        <Container>
            <Card className="mb-2">
                <Card.Header>
                    <Card.Title>
                        {title}
                    </Card.Title>
                </Card.Header>
                <Card.Body >
                    <Container className="direction-row">
                        <ImageComponent />
                        <EventInformationCard />
                        <Card>
                            <Card.Text>Tickets: {action.ticket_amount} x {action.ticket_name}</Card.Text>
                            <Card.Text>Bought at: {formattedDate}</Card.Text>
                            {action.refund_time && <Card.Text>Refunded at: {getFormattedDate(action.refund_time)}</Card.Text>}
                            <ButtonWithTooltip
                                buttonContent="Request Refund"
                                buttonOnClick={() => setModalOpen(true)}
                                // buttonOnClick={handleRefund}
                                isDisabled={!isRefundable}
                                tooltipContent={reasonNotRefundable}
                                isLoading={isLoading} />
                        </Card>
                        <ConfirmationModal 
                            isOpen={isModalOpen} 
                            onConfirm={handleRefund} 
                            onCancel={() => setModalOpen(false)} 
                            message={refundconfirmationMessage}
                        />
                    </Container>
                    <Card.Text>{eventDetails?.description}</Card.Text>
                </Card.Body>
            </Card >
            <Alert variant="danger" show={errorText !== ""} onClose={() => setErrorText("")} dismissible className="mt-2">{errorText}</Alert>
        </Container>
    );
}


export const ActionPlaceholder = () => {
    return (
        <Card className="mb-2">
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