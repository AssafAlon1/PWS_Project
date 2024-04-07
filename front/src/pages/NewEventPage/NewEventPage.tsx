
import React, { useState } from 'react';
import { Form, Button, FloatingLabel, Container } from 'react-bootstrap';
import { Alert, Card, Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { VALID_CATEGORIES } from '../../const';
import EventApi from '../../api/event';
import { CSEventCreationReqeust } from '../../types';
import ButtonWithTooltip from '../../components/ButtonWithTooltip/ButtonWithTooltip';
import './NewEventPage.css';
import { SUCCESS_PATH } from '../../paths';
import { ThreeSpanningSpinners } from '../../components/SpinnerComponent/SpinnerComponent';

interface NewTicket {
    name: string;
    price: number;
    quantity: number;
}

interface AlertModalProps {
    isOpen: boolean;
    message: string;
    onCancel: () => void;
    onConfirm?: () => void;
}

const NewEventPage: React.FC = () => {
    const tomorrowDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    const [isFormValidated, setFormValidated] = useState<boolean>(false);
    const [errorModal, setErrorModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [displayError, setDisplayError] = useState<string>("");
    const [isLoading, setLoading] = useState<boolean>(false);

    const [eventName, setEventName] = useState<string>("");
    const [catagory, setCatagory] = useState<string>(VALID_CATEGORIES[0]);
    const [description, setDescription] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [organizer, setOrganizer] = useState<string>("");
    const [imageURL, setImageURL] = useState<string>("");

    const [startDate, setStartDate] = useState<string>(tomorrowDate.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(tomorrowDate.toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState<string>("09:00");
    const [endTime, setEndTime] = useState<string>("17:00");
    const [tickets, setTickets] = useState<NewTicket[]>([]);

    const navigate = useNavigate();

    const handleEventNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEventName(e.target.value);
    }

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(e.target.value);
    }

    const handleOrganizerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOrganizer(e.target.value);
    }

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocation(e.target.value);
    }

    const handleImageURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImageURL(e.target.value);
    }

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
    }

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
    }

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartTime(e.target.value);
    }

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndTime(e.target.value);
    }

    const CatagoryOptions = () => {
        return VALID_CATEGORIES.map((catagory: string, index: number) => <option key={index}>{catagory}</option>);
    }

    const AlertModal: React.FC<AlertModalProps> = ({ isOpen, message, onCancel, onConfirm }) => {
        if (!isOpen) {
            return null;
        }
        return (
            <div className="modal">
                <div className="modal-content">
                    <p>{message}</p>
                    {!onConfirm && <Button onClick={onCancel} className='mb-2 mt-2'> Got it! </Button>}
                    {onConfirm && <Button onClick={onConfirm} className='mb-2 mt-2'> I'm sure </Button>}
                    {onConfirm && <Button variant="secondary" onClick={onCancel} className='mb-2 mt-2'> Cancel </Button>}
                </div>
            </div>
        );
    };

    const addTicket = (ticket: NewTicket): boolean => {
        if (ticket.name === "" ||
            ticket.price < 0 ||
            ticket.quantity <= 0 ||
            tickets.some(t => t.name === ticket.name)) {
            setErrorModal(true);
            return false;
        }
        setTickets([...tickets, ticket]);
        return true
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
            setFormValidated(true);
            console.error("Form invalid");
            setDisplayError("Invalid Form. Please check the form and try again.");
            return;
        }
        try {
            const eventCreationRequest: CSEventCreationReqeust = {
                title: eventName,
                category: catagory,
                description: description,
                organizer: organizer,
                start_date: new Date(startDate + 'T' + startTime),
                end_date: new Date(endDate + 'T' + endTime),
                location: location,
                tickets: tickets.map(t => ({ name: t.name, total: t.quantity, price: t.price }))
            }

            if (imageURL != "") {
                eventCreationRequest.image = imageURL;
            }
            setLoading(true);
            const result = await EventApi.createEvent(eventCreationRequest);
            setLoading(false);
            navigate(SUCCESS_PATH, { state: { operationType: "create", createdEventId: result, message: "Event created successfully!" } });
        }
        catch (error) {
            console.error(error);
            setDisplayError("Failed to create event. Please try again.");
        }
    }

    const TicketMiniForm: React.FC<{ addTicket: (ticket: NewTicket) => boolean }> = ({ addTicket }) => {
        const [ticketName, setTicketName] = useState<string>("");
        const [ticketPrice, setTicketPrice] = useState<number>(0);
        const [ticketQuantity, setTicketQuantity] = useState<number>(0);

        const handleTicketNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setTicketName(e.target.value);
        }

        const handleTicketPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setTicketPrice(Number(e.target.value));
        }

        const handleTicketQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setTicketQuantity(Number(e.target.value));
        }

        const isDisabled = ticketName === "" || ticketPrice < 0 || ticketQuantity <= 0;



        const onClickTicket = () => {
            const result = addTicket({
                name: ticketName,
                price: ticketPrice,
                quantity: ticketQuantity
            });
            if (!result) {
                return;
            }
            setTicketName("");
            setTicketPrice(0);
            setTicketQuantity(0);
        }

        return (
            <Card>
                <div className="mb-2">
                    <Row>
                        <Col>
                            <label>Ticket Name</label>
                        </Col>
                        <Col>
                            <input
                                type="text"
                                placeholder="Ticket name"
                                value={ticketName}
                                onChange={handleTicketNameChange}
                            />
                        </Col>
                    </Row>
                </div>
                <div className="mb-2">
                    <Row>
                        <Col>
                            <label>Ticket Price</label>
                        </Col>
                        <Col>
                            <input
                                type="number"
                                placeholder="Enter ticket price"
                                value={ticketPrice}
                                onChange={handleTicketPriceChange}
                            />
                        </Col>
                    </Row>
                </div>
                <div className="mb-2">
                    <Row>
                        <Col>
                            <label>Ticket Quantity</label>
                        </Col>
                        <Col>
                            <input
                                type="number"
                                placeholder="Enter ticket quantity"
                                value={ticketQuantity}
                                onChange={handleTicketQuantityChange}
                            />
                        </Col>
                    </Row>
                </div>
                <Col>
                    <Button disabled={isDisabled || isLoading} onClick={onClickTicket}>Add Ticket</Button>
                </Col>
            </Card>
        );
    }

    const TicketDetails = ({ ticket, onRemove }: { ticket: NewTicket, onRemove: () => void }) => {
        return (
            <Container>
                <Card className="mb-4 me-2 position-relative">
                    <Button
                        variant="danger"
                        className="position-absolute top-0 end-0 m-2 btn-sm"
                        onClick={onRemove}
                    >
                        x
                    </Button>
                    <Card.Body>
                        <Card.Title>{ticket.name}</Card.Title>
                        <Card.Text>
                            Price: ${ticket.price}
                        </Card.Text>
                        <Card.Text>
                            Quantity: {ticket.quantity}
                        </Card.Text>
                    </Card.Body>
                </Card>
                <AlertModal
                    isOpen={errorModal}
                    message="Invalid ticket (make sure ticket name is unique)"
                    onCancel={() => setErrorModal(false)}
                />
            </Container>
        )
    }

    return (
        <>
            <h1>New Event</h1>
            <Form noValidate validated={isFormValidated} onSubmit={handleSubmit}>
                <Row>
                    <Col>
                        <Form.Group controlId="formEventName" className="mb-2">
                            <FloatingLabel label="Event Name">
                                <Form.Control
                                    required
                                    type="text"
                                    placeholder="Enter event name"
                                    pattern="^[a-zA-Z\s\-0-9']+$"
                                    value={eventName}
                                    onChange={handleEventNameChange}
                                />
                                <Form.Control.Feedback type="invalid">Event name must be non-empty and in English</Form.Control.Feedback>
                            </FloatingLabel>
                        </Form.Group>

                        <Form.Group controlId="formEventCatagory" className="mb-2">
                            <FloatingLabel label="Event Catagory">
                                <Form.Select
                                    required
                                    value={catagory}
                                    onChange={(catagory) => setCatagory(catagory.target.value)}
                                >
                                    <CatagoryOptions />
                                </Form.Select>
                            </FloatingLabel>
                        </Form.Group>

                        <Form.Group controlId="formEventDescription" className="mb-2">
                            <FloatingLabel label="Event Description">
                                <Form.Control
                                    required
                                    pattern="^[a-zA-Z\s\-0-9']+$"
                                    as="textarea"
                                    rows={3}
                                    placeholder="Enter event description"
                                    value={description}
                                    onChange={handleDescriptionChange} />
                                <Form.Control.Feedback type="invalid">Event description must be non-empty and in English</Form.Control.Feedback>
                            </FloatingLabel>
                        </Form.Group>

                        <Form.Group controlId="formEventOrganizer" className="mb-2">
                            <FloatingLabel label="Event Organizer">
                                <Form.Control
                                    required
                                    type="text"
                                    pattern="^[a-zA-Z\s\-0-9']+$"
                                    placeholder="Enter event organizer"
                                    value={organizer}
                                    onChange={handleOrganizerChange}
                                />
                                <Form.Control.Feedback type="invalid">Event organizer must be non-empty and in English</Form.Control.Feedback>
                            </FloatingLabel>
                        </Form.Group>

                        <Form.Group controlId="formEventLcation" className="mb-2">
                            <FloatingLabel label="Event Location">
                                <Form.Control
                                    required
                                    type="text"
                                    pattern="^[a-zA-Z\s\-0-9']+$"
                                    placeholder="Enter event location"
                                    value={location}
                                    onChange={handleLocationChange}
                                />
                                <Form.Control.Feedback type="invalid">Event location must be non-empty and in English</Form.Control.Feedback>
                            </FloatingLabel>
                        </Form.Group>

                        <Form.Group controlId="formEventStartDate" className="mb-2">
                            <FloatingLabel label="Start Date">
                                <Form.Control
                                    required
                                    type="date"
                                    isInvalid={new Date(startDate) < new Date(new Date().toISOString().split('T')[0])}
                                    value={startDate}
                                    onChange={handleStartDateChange} />
                                <Form.Control.Feedback type="invalid">Start date must be in the future</Form.Control.Feedback>
                            </FloatingLabel>
                        </Form.Group>

                        <Form.Group controlId="formEventEndDate" className="mb-2">
                            <FloatingLabel label="End Date">
                                <Form.Control
                                    required
                                    type="date"
                                    isInvalid={new Date(startDate) > new Date(endDate)}
                                    value={endDate}
                                    onChange={handleEndDateChange} />
                                <Form.Control.Feedback type="invalid">End date must be after start date</Form.Control.Feedback>
                            </FloatingLabel>
                        </Form.Group>


                        <Form.Group controlId="formEventStartTime" className="mb-2">
                            <FloatingLabel label="Start Time">
                                <Form.Control
                                    required
                                    type="time"
                                    isInvalid={new Date(startDate + 'T' + startTime) < new Date()}
                                    value={startTime}
                                    onChange={handleStartTimeChange} />
                                <Form.Control.Feedback type="invalid">Start time must be in the future</Form.Control.Feedback>
                            </FloatingLabel>
                        </Form.Group>

                        <Form.Group controlId="formEventEndTime" className="mb-2">
                            <FloatingLabel label="End Time">
                                <Form.Control
                                    required
                                    type="time"
                                    isInvalid={new Date(startDate + 'T' + startTime) > new Date(endDate + 'T' + endTime)}
                                    value={endTime}
                                    onChange={handleEndTimeChange} />
                                <Form.Control.Feedback type="invalid">End time must be after start time</Form.Control.Feedback>
                            </FloatingLabel>
                        </Form.Group>

                        <Form.Group controlId="formEventImageURL" className="mb-2">
                            <FloatingLabel label="Event Image URL (Optional)">
                                <Form.Control
                                    type="text"
                                    placeholder="Enter event image URL (Optional)"
                                    onChange={handleImageURLChange}
                                />
                            </FloatingLabel>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Row>
                            <TicketMiniForm addTicket={addTicket} />
                        </Row>
                        <Row>
                            <h2>Ticket Details</h2>
                            <div style={{ maxHeight: '400px', overflowY: 'auto', }}>
                                <Container className="tickets-wrapper">
                                    {tickets.map((ticket, index) => (
                                        <div>
                                            <TicketDetails
                                                ticket={ticket}
                                                onRemove={() => {
                                                    setConfirmModal(true);
                                                }}
                                            />
                                            <AlertModal
                                                isOpen={confirmModal}
                                                message="Are you sure you want to remove ticket?"
                                                onCancel={() => setConfirmModal(false)}
                                                onConfirm={() => {
                                                    setConfirmModal(false);
                                                    setTickets(tickets.filter(t => t.name !== ticket.name));
                                                }}
                                            />
                                        </div>
                                    ))}
                                </Container>
                            </div>
                        </Row>
                    </Col>
                </Row>


                <Row className="mt-3">
                    <Col>
                        <ButtonWithTooltip
                            buttonContent="Create Event"
                            tooltipContent={isLoading ? "Loading..." : "Event must have at least one ticket"}
                            isDisabled={tickets.length === 0 || isLoading}
                            buttonType="submit"
                            placement="top"
                        />
                    </Col>
                </Row>
                {isLoading && <ThreeSpanningSpinners />}
            </Form >

            <Alert
                show={displayError !== ""}
                variant="danger"
                onClose={() => setDisplayError("")}
                dismissible
                className="mt-2">
                <Alert.Heading>Something went wrong</Alert.Heading>
                <p>
                    {displayError}
                </p>
            </Alert>
        </>
    );
};

export default NewEventPage;
