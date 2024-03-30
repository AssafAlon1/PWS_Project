import React, { useState } from 'react';
import { CSEvent } from "../../types/index";
import { Alert, Button } from 'react-bootstrap';
import EventApi from '../../api/event';
import { Card, Form, FloatingLabel } from 'react-bootstrap';

import { useEffect } from 'react';
import ButtonWithTooltip from '../ButtonWithTooltip/ButtonWithTooltip';

const PostponeEventForm: React.FC<{ csEvent: CSEvent | null, refetchEvent: () => Promise<void> }> = ({ csEvent, refetchEvent }) => {
    const [isFormValidated, setFormValidated] = useState<boolean>(false);

    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState<string>(new Date().toTimeString().split(' ')[0].substring(0, 5));
    const [endTime, setEndTime] = useState<string>(new Date().toTimeString().split(' ')[0].substring(0, 5));
    const [postponeStatus, setPostponeStatus] = useState<string>("");

    useEffect(() => {
        if (csEvent) {
            const startDate = new Date(csEvent.start_date);
            const endDate = new Date(csEvent.end_date);

            setStartTime(startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
            setEndTime(endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));

            
            setStartDate((csEvent.start_date).toString().split('T')[0]);
            setEndDate((csEvent.end_date).toString().split('T')[0]);
            // setStartTime(new Date(csEvent.start_date).toString().split('T')[1].substring(0, 5));
            // setEndTime(new Date (csEvent.end_date).toString().split('T')[1].substring(0, 5));
            console.log(csEvent.start_date);
            console.log(csEvent.end_date);
            // setStartTime(new Date(csEvent.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            // setEndTime(new Date(csEvent.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
    }, [csEvent]);


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
            setFormValidated(true);
            console.log("Form invalid");
            alert("TODO - FIX YOUR FORM MAN");
            setPostponeStatus("ERROR");
            return;
        }
        if (!csEvent) {
            alert("NO EVENT ID. THIS IS MADNESS.");
            return;
        }
        const newStartDate = new Date(startDate + 'T' + startTime);
        const newEndDate = new Date(endDate + 'T' + endTime);
        try {
            const result = await EventApi.postponeEvent(csEvent._id, newStartDate, newEndDate);
            console.log(result);
            setPostponeStatus("SUCCESS");
            // updateEvent();
            // navigate to succes page
        } catch (error) {
            alert("ERROR 37");
            console.error(error);
            // navigate(ERROR_PATH, { state: { message: `Failed to postpone event ${eventId}` } });
        }
    }

    if (csEvent === null) {
        return (<Card>
            <Card.Header>
                <Card.Title>Postpone Event</Card.Title>
            </Card.Header>
            <Card.Body>
                <Card.Text>Event wasn't loaded properly</Card.Text>
            </Card.Body>
        </Card>
        );
    }

    if (csEvent.start_date < new Date()) {
        return (<Card>
            <Card.Header>
                <Card.Title>Postpone Event</Card.Title>
            </Card.Header>
            <Card.Body>
                <Card.Text>Cannot postpone past events</Card.Text>
            </Card.Body>
        </Card>
        );
    }

    return <Card>
        <Card.Header>
            <Card.Title>Postpone Event</Card.Title>
        </Card.Header>
        <Form noValidate validated={isFormValidated} onSubmit={handleSubmit}>
            <Form.Group controlId="formEventStartDate" className="mb-2">
                <FloatingLabel label="Start Date">
                    <Form.Control
                        required
                        type="date"
                        isInvalid={new Date(startDate) < new Date((csEvent.start_date).toString().split('T')[0])}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)} />
                    <Form.Control.Feedback type="invalid">Cannot move start date earlier than the original date</Form.Control.Feedback>
                </FloatingLabel>
            </Form.Group>

            <Form.Group controlId="formEventEndDate" className="mb-2">
                <FloatingLabel label="End Date">
                    <Form.Control
                        required
                        type="date"
                        isInvalid={new Date(startDate) > new Date(endDate)}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)} />
                    <Form.Control.Feedback type="invalid">End date must be after start date</Form.Control.Feedback>
                </FloatingLabel>
            </Form.Group>

            <Form.Group controlId="formEventStartTime" className="mb-2">
                <FloatingLabel label="Start Time">
                    <Form.Control
                        required
                        type="time"
                        isInvalid={!csEvent || new Date(startDate + 'T' + startTime) < new Date(csEvent.start_date)}
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)} />
                    <Form.Control.Feedback type="invalid">Cannot move start time earlier than the original time</Form.Control.Feedback>
                </FloatingLabel>
            </Form.Group>

            <Form.Group controlId="formEventEndTime" className="mb-2">
                <FloatingLabel label="End Time">
                    <Form.Control
                        required
                        type="time"
                        isInvalid={new Date(startDate + 'T' + startTime) > new Date(endDate + 'T' + endTime)}
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)} />
                    <Form.Control.Feedback type="invalid">End time must be after start time</Form.Control.Feedback>
                </FloatingLabel>
            </Form.Group>
            
            <ButtonWithTooltip
                buttonContent="Postpone Event"
                tooltipContent="Come on man, provide some valid values =/"
                isDisabled={false}
                buttonType="submit"
                placement="top"
            />
        </Form>


        <Alert show={postponeStatus === "SUCCESS"} variant="success">
            <p>Event postponed successfully!</p>
            <div className="d-flex justify-content-end">
                <Button onClick={() => { refetchEvent(); setPostponeStatus("") }} variant="outline-success">
                    Reload page
                </Button>
            </div>
        </Alert>
        <Alert show={postponeStatus === "ERROR"} variant="danger">
            <p>An error has occured submitting the form</p>
            <div className="d-flex justify-content-end">
                <Button onClick={() => { setPostponeStatus("") }} variant="outline-danger">
                    Close
                </Button>
            </div>
        </Alert>
    </Card>
}



export default PostponeEventForm;