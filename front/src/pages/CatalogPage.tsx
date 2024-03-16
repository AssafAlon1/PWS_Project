import React, { useEffect, useState } from 'react';
import { Outlet, Link } from "react-router-dom";
import { CSEvent } from '../types';
import { fetchEvents } from '../utils/fetchers';


const CatalogPage: React.FC = () => {

  const [events, SetEvents] = useState<CSEvent[]>([]);

  useEffect(() => {
    const updateEvents = async () => {
      try {
        SetEvents(await fetchEvents());
      }
      catch {
        alert("Error fetching events");
      }
    }
    updateEvents();
  }, []);

  return (
    <>
      <h1>Catalog</h1>
      <ul>
        {events.map(event => (
          <li key={event.id}>
            <Link to={`/events/${event.id}`}>{event.name}</Link>
          </li>
        ))}
      </ul>
      <Outlet />
    </>
  )
};

export default CatalogPage;