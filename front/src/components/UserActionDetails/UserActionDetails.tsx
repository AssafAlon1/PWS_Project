import React, { useEffect } from 'react';
import { getFormattedDate, getFormattedTime } from "../../utils/formatting";
import { Button, Card, Container, Placeholder } from 'react-bootstrap';
import { CSEvent, UserAction } from '../../types';
import EventApi from '../../api/event';
import ButtonWithTooltip from '../ButtonWithTooltip/ButtonWithTooltip';
import MissingImage from "../../assets/MissingImage.png"
import { ThreeSpanningSpinners } from '../SpinnerComponent/SpinnerComponent';
import { useNavigate } from 'react-router-dom';

interface ActionDetailsProps {
    action: UserAction;
    csevent: CSEvent | null;
    isLoadingRefund?: boolean;
    onRefund?: () => void;
}

const ActionDetails: React.FC<ActionDetailsProps> = ({ action, csevent, isLoadingRefund, onRefund }) => {
    const [isLoadingEvent, setIsLoadingEvent] = React.useState<boolean>(false);
    const [isRefundable, setIsRefundable] = React.useState<boolean>(false);
    const [reasonNotRefundable, setReason] = React.useState<string>("Loading...");
    const [eventDetails, setEventDetails] = React.useState<CSEvent | null>(null);
    const formattedDate = getFormattedDate(action.purchase_time);

    const navigate = useNavigate();

    let handleRefund = onRefund;
    if (!handleRefund) {
        handleRefund = () => navigate("/refund", { state: { purchase_id: action.purchase_id } });
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
    return (
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
                            buttonOnClick={handleRefund ?? (() => { })}
                            isDisabled={!isRefundable || !handleRefund}
                            tooltipContent={reasonNotRefundable}
                            isLoading={isLoadingRefund} />
                    </Card>
                </Container>
                <Card.Text>{eventDetails?.description}</Card.Text>
            </Card.Body>
        </Card >
    );
}


// TODO - Code duplication with CatalogEventDetails.tsx, maybe remove
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