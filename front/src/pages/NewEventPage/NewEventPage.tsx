
import React, { useState } from 'react';
import { Form, Button, FloatingLabel, Container } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { VALID_CATEGORIES } from '../../const';
import './NewEventPage.css';

interface NewTicket {
    name: string;
    price: number;
    quantity: number;
}

const NewEventPage: React.FC = () => {
    // const [isFormValidated, setFormValidated] = useState<boolean>(false);
    const [eventName, setEventName] = useState<string>('');
    const [catagory, setCatagory] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [orginaizer, setOrginaizer] = useState<string>('');
    const [imageURL, setImageURL] = useState<string>('');

    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState<string>(new Date().toTimeString().split(' ')[0].substring(0, 5));
    const [endTime, setEndTime] = useState<string>(new Date().toTimeString().split(' ')[0].substring(0, 5));
    const [tickets, setTickets] = useState<NewTicket[]>([]);

    const handleEventNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEventName(e.target.value);
    }

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(e.target.value);
    }

    const handleOrginaizerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOrginaizer(e.target.value);
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

    const addTicket = (ticket: NewTicket): boolean => {
        if (ticket.name === '' ||
            ticket.price <= 0 ||
            ticket.quantity <= 0 ||
            tickets.some(t => t.name === ticket.name)) {
            alert("Invalid ticket (make sure ticket name is unique)");
            return false;
        }
        setTickets([...tickets, ticket]);
        return true
    }

    const TicketMiniForm: React.FC<{ addTicket: (ticket: NewTicket) => boolean }> = ({ addTicket }) => {
        const [ticketName, setTicketName] = useState<string>('');
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

        const isDisabled = ticketName === '' || ticketPrice <= 0 || ticketQuantity <= 0;

        // const handleSubmit = () => {
        //     if (isDisabled) {
        //         return;
        //     }
        //     onClickTicket();
        // }

        const onClickTicket = () => {
            const result = addTicket({
                name: ticketName,
                price: ticketPrice,
                quantity: ticketQuantity
            });
            if (!result) {
                return;
            }
            setTicketName('');
            setTicketPrice(0);
            setTicketQuantity(0);
        }

        return (
            <Card>
                <Form.Group controlId="formTicketName" className="mb-2">
                    <Row>
                        <Col>
                            <Form.Label>Ticket Name</Form.Label>
                        </Col>
                        <Col>
                            <Form.Control
                                required
                                type="text"
                                placeholder="Ticket name"
                                value={ticketName}
                                onChange={handleTicketNameChange}
                            />
                        </Col>
                    </Row>
                </Form.Group>
                <Form.Group controlId="formTicketPrice" className="mb-2">
                    <Row>
                        <Col>
                            <Form.Label>Ticket Price</Form.Label>
                        </Col>
                        <Col>
                            <Form.Control
                                required
                                type="number"
                                placeholder="Enter ticket price"
                                value={ticketPrice}
                                onChange={handleTicketPriceChange}
                            />
                        </Col>
                    </Row>
                </Form.Group>
                <Form.Group controlId="formTicketQuantity" className="mb-2">
                    <Row>
                        <Col>
                            <Form.Label>Ticket Quantity</Form.Label>
                        </Col>
                        <Col>
                            <Form.Control
                                required
                                type="number"
                                placeholder="Enter ticket quantity"
                                value={ticketQuantity}
                                onChange={handleTicketQuantityChange}
                            />
                        </Col>
                    </Row>
                </Form.Group>
                <Col>
                    <Button variant="primary" disabled={isDisabled} onClick={onClickTicket}>Add Ticket</Button>
                </Col>
            </Card>
        )
    }

    const TicketDetails = ({ ticket, onRemove }: { ticket: NewTicket, onRemove: () => void }) => {
        return (
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
        )
    }

    return (
        <>
            <h1>New Event</h1>
            <Form>
            {/* <Form noValidate validated={isFormValidated} onSubmit={handleSubmit}> */}
                <Row>
                    <Col>
                        <Form.Group controlId="formEventName" className="mb-2">
                            <FloatingLabel label="Event Name">
                                <Form.Control
                                    required
                                    type="text"
                                    placeholder="Enter event name"
                                    pattern="^[a-zA-Z\s\-0-9]+$"
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
                                    pattern='^[a-zA-Z\s\-0-9]+$'
                                    as="textarea"
                                    rows={3}
                                    placeholder="Enter event description"
                                    value={description}
                                    onChange={handleDescriptionChange} />
                            </FloatingLabel>
                        </Form.Group>

                        <Form.Group controlId="formEventOrginaizer" className="mb-2">
                            <FloatingLabel label="Event Orginaizer">
                                <Form.Control
                                    required
                                    type="text"
                                    pattern='^[a-zA-Z\s\-0-9]+$'
                                    placeholder="Enter event orginaizer"
                                    value={orginaizer}
                                    onChange={handleOrginaizerChange}
                                />
                            </FloatingLabel>
                        </Form.Group>

                        <Form.Group controlId="formEventStartDate" className="mb-2">
                            <FloatingLabel label="Start Date">
                                <Form.Control
                                    required
                                    type="date"
                                    value={startDate}
                                    onChange={handleStartDateChange} />
                            </FloatingLabel>
                        </Form.Group>

                        <Form.Group controlId="formEventEndDate" className="mb-2">
                            <FloatingLabel label="End Date">
                                <Form.Control
                                    required
                                    type="date"
                                    value={endDate}
                                    onChange={handleEndDateChange} />
                            </FloatingLabel>
                        </Form.Group>


                        <Form.Group controlId="formEventStartTime" className="mb-2">
                            <FloatingLabel label="Start Time">
                                <Form.Control
                                    required
                                    type="time"
                                    value={startTime}
                                    onChange={handleStartTimeChange} />
                            </FloatingLabel>
                        </Form.Group>

                        <Form.Group controlId="formEventEndTime" className="mb-2">
                            <FloatingLabel label="End Time">
                                <Form.Control
                                    required
                                    type="time"
                                    value={endTime}
                                    onChange={handleEndTimeChange} />
                            </FloatingLabel>
                        </Form.Group>

                        <Form.Group controlId="formEventImageURL" className="mb-2">
                            <FloatingLabel label="Event Image URL (Optional)">
                                <Form.Control
                                    type="text"
                                    placeholder="Enter event image URL (Optional)"
                                    value={imageURL}
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
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <Container style={{ width: "27vw" }}>
                                    <Row xs={1} lg={2}>
                                        {tickets.map((ticket, index) => (
                                            <Col md={6} key={index} style={{ marginBottom: '20px' }}>
                                                <TicketDetails
                                                    ticket={ticket}
                                                    onRemove={() => {
                                                        if (!confirm("Are you sure you want to remove ticket " + ticket.name + "?")) {
                                                            return;
                                                        }
                                                        setTickets(tickets.filter(t => t.name !== ticket.name));
                                                    }} />
                                            </Col>
                                        ))}
                                    </Row>
                                </Container>
                            </div>
                        </Row>
                    </Col>
                </Row>


                <Row className="mt-3">
                    <Col>
                        <Button variant="primary" type="submit" disabled={tickets.length === 0}>
                            Create Event
                        </Button>
                    </Col>
                </Row>
            </Form > 
        </>
    );
};

export default NewEventPage;
