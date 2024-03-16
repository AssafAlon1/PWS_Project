import React, { useEffect, useState } from 'react';
import { fetchEvent } from '../utils/fetchers';
import { redirect, useParams, useNavigate } from 'react-router-dom';

interface CSEvent {
    id: string;
    name: string;
    description: string;
}

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


    // TODO - Better Loading, error handling
    return (
        <div>
            <h1>Event Details</h1>
            <p>ID: {event ? event.id : "Loading..."}</p>
            <p>Name: {event ? event.name : "Loading..."}</p>
            <p>Description: {event ? event.description : "Loading..."}</p>
            <button onClick={() => { navigate("/") }}>Return to Catalog</button>
        </div>
    );
};

export default EventDetails;