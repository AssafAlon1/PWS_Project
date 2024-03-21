import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import { CSEvent } from '../../types';
import { fetchEvents } from '../../utils/fetchers';
import EventDetails, { EventPlaceholder } from "../../components/CatalogEventDetails/CatalogEventDetails";
import { Col, Container, Row } from 'react-bootstrap';


const CatalogPage: React.FC = () => {

  const [events, SetEvents] = useState<CSEvent[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  // Smaller screens will have less loading events
  const LOADING_AMOUNT = window.innerWidth < 576 ? 2 : window.innerWidth < 992 ? 6 : 8;

  const Catalog = () => {
    let catalog;
    if (isLoading) {
      catalog = Array.from({ length: LOADING_AMOUNT }, (_, i) => <EventPlaceholder key={i} />);
    } else {
      catalog = events.map(event => <EventDetails key={event.id} event={event} />);
    }

    return <Container style={{ width: "100vw" }}>
      <Row xs={1} sm={2} md={3} lg={4} >
        {catalog.map(event => (
          <Col key={event.key} className="mb-4">
            {event}
          </Col>
        ))}
      </Row>
    </Container>
  }

  useEffect(() => {
    const updateEvents = async () => {
      try {
        SetEvents(await fetchEvents());
      }
      catch {
        navigate("/error", { state: { message: "Failed to fetch events" } });
      }
      finally {
        setLoading(false);
      }
    }
    updateEvents();
  }, []);

  return (
    <Container>
      <h1 style={{ position: 'relative' }}>Catalog</h1>
      <Container style={{ paddingTop: '100px' }}>
        <Catalog />
        <Outlet />
      </Container>
    </Container>
  )
};

export default CatalogPage;