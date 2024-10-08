import './CatalogPage.css';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { CSEvent } from '../../types';
import EventDetails, { EventPlaceholder } from "../../components/CatalogEventDetails/CatalogEventDetails";
import { Alert, Col, Container, Row } from 'react-bootstrap';
import EventApi from '../../api/event';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ThreeSpanningSpinners } from '../../components/SpinnerComponent/SpinnerComponent';
import { MAX_EVENTS_IN_PAGE, UserRole } from '../../const';
import { ERROR_PATH } from '../../paths';
import { AuthContext } from '../../components/AuthProvider/AuthProvider';


const CatalogPage: React.FC = () => {

  const [events, setEvents] = useState<CSEvent[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [displayError, setDisplayError] = useState<boolean>(false);

  const navigate = useNavigate();
  const context = useContext(AuthContext);

  // Smaller screens will have less loading events
  const LOADING_AMOUNT = window.innerWidth < 576 ? 2 : window.innerWidth < 992 ? 6 : 8;

  const fetchMoreData = async () => {
    try {
      let newEvents: CSEvent[] = [];
      if (context.isBackOffice && context.role <= UserRole.Worker) {
        newEvents = await EventApi.fetchAllEvents(events.length, MAX_EVENTS_IN_PAGE);
      }
      else {
        newEvents = await EventApi.fetchEvents(events.length, MAX_EVENTS_IN_PAGE);
      }
      if (newEvents.length < MAX_EVENTS_IN_PAGE) {
        setHasMore(false);
      }
      setEvents(prevEvents => [...prevEvents, ...newEvents]);
    } catch {
      setDisplayError(true);
      setHasMore(false);
    }
  };

  const Catalog = () => {
    let catalog;
    if (isLoading) {
      catalog = Array.from({ length: LOADING_AMOUNT }, (_, i) => <EventPlaceholder key={i} />);
    } else {
      catalog = events.map(event => <EventDetails key={event._id} event={event} />);
    }

    if (catalog.length === 0) {
      return (
        <Container>
          <h2>Looks like all the events are taking a break.</h2>
          <h3>Maybe they're off having a party somewhere!</h3>
          <img style={{ borderRadius: "20px" }} src="https://booksparks.com/wp-content/uploads/2018/04/dance-party-dancing-GIF-downsized-1.gif" alt="Party GIF" />
        </Container>
      );
    }


    return (
      <Container style={{ width: "100vw" }}>
        <InfiniteScroll
          dataLength={events.length}
          next={fetchMoreData}
          hasMore={hasMore}
          style={{ overflowX: "hidden" }}
          loader={<ThreeSpanningSpinners />}
        >
          <Row xs={1} sm={2} md={3} lg={4}>
            {catalog.map(event => (
              <Col key={event.key} className="mb-4">
                {event}
              </Col>
            ))}
          </Row>
        </InfiniteScroll>
      </Container>
    );
  }

  // On initial load, fetch the first events.
  // Next events are fetched via`fetchMoreData` if hasMore is set to `true` (only if the number of fetched event is equal to the limit provided)
  useEffect(() => {
    const updateEvents = async () => {
      try {
        let fetchedEvents: CSEvent[] = [];
        if (context.isBackOffice && context.role <= UserRole.Worker) {
          fetchedEvents = await EventApi.fetchAllEvents(0, MAX_EVENTS_IN_PAGE);
        }
        else {
          fetchedEvents = await EventApi.fetchEvents(0, MAX_EVENTS_IN_PAGE);
        }
        setEvents(fetchedEvents);
        if (fetchedEvents.length == MAX_EVENTS_IN_PAGE) {
          setHasMore(true);
        }
      }
      catch {
        navigate(ERROR_PATH, { state: { message: "Failed to fetch events" } });
      }
      finally {
        setLoading(false);
      }
    }
    updateEvents();
  }, [context.isBackOffice]);

  return (
    <Container>
      <h1 style={{ position: 'relative' }}>Catalog</h1>
      <Container style={{ paddingTop: '100px' }}>
        <Catalog />
        <Alert show={displayError} variant="danger" onClose={() => setDisplayError(false)} dismissible>
          <Alert.Heading>Failed to event :(</Alert.Heading>
          <p>
            Something went wrong while trying to load more events. Please try refreshing the page.
          </p>
        </Alert>
      </Container>
    </Container>
  )
};

export default CatalogPage;