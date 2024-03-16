import React, { useEffect, useState } from 'react';
import { Outlet, Link } from "react-router-dom";
import { CSEvent } from '../types';
import { fetchEvents } from '../utils/fetchers';
import EventDetails, { EventPlaceholder } from "../components/CatalogEventDetails/CatalogEventDetails";
import { CardGroup, Col, Row } from 'react-bootstrap';

const CatalogPage: React.FC = () => {

  const [events, SetEvents] = useState<CSEvent[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  const LOADING_AMOUNT = 6;

  const generateCatalog = () => {
    let catalog;
    if (isLoading) {
      catalog = Array.from({ length: LOADING_AMOUNT }, (_, i) => EventPlaceholder());
    } else {
      catalog = events.map(event => <EventDetails event={event} />);
    }
    return <Row xs={1} sm={2} md={3} lg={4}>
      {catalog.map(event => (
        <Col key={event.key} className="mb-4">
          {event}
        </Col>
      ))}
    </Row>
  }

  useEffect(() => {
    const updateEvents = async () => {
      try {
        SetEvents(await fetchEvents());
      }
      catch {
        alert("Error fetching events");
        // TODO - do the la
      }
      finally {
        setLoading(false);
      }
    }
    updateEvents();
  }, []);

  return (
    <>
      <h1>Catalog</h1>
      {generateCatalog()}
      <Outlet />
    </>
  )
};

export default CatalogPage;