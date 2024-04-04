import React, { useContext, useEffect, useState } from 'react';
import { Alert, Button, Card, Container } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ThreeSpanningSpinners } from '../../components/SpinnerComponent/SpinnerComponent';
import { UserAction } from '../../types';
import UserActionApi from '../../api/userAction';
import EventApi from '../../api/event';
import { MAX_ACTIONS } from '../../const';
import ActionDetails, { ActionPlaceholder } from '../../components/UserActionDetails/UserActionDetails';
import { AuthContext } from '../../components/AuthProvider/AuthProvider';
import { CSEvent } from '../../types';

const UserSpacePage: React.FC = () => {
  const [userActions, setUserActions] = useState<UserAction[]>([]);
  const [userEvents, setUserEvents] = useState<(CSEvent | null)[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [displayErrorLoadMore, setDisplayErrorLoadMore] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");

  // Smaller screens will have less loading events
  const LOADING_AMOUNT = 2

  const authContext = useContext(AuthContext);
  const username = authContext.user;

  // Totally NOT stolen from CatalogPage
  const fetchMoreData = async () => {
    try {
      if (!username) {
        setErrorText("Username not found");
        setHasMore(false);
        return;
      }
      const newActions: UserAction[] = await UserActionApi.getUserActions(username, userActions.length, MAX_ACTIONS);
      if (newActions.length < MAX_ACTIONS) {
        setHasMore(false);
      }
      const newEvents = await Promise.all(newActions.map(action => EventApi.fetchEvent(action.event_id)));
      setUserActions(prevActions => [...prevActions, ...newActions]);
      setUserEvents(prevEvents => [...prevEvents, ...newEvents]);
    } catch {
      setDisplayErrorLoadMore(true);
      setHasMore(false);
    }
  };

  const updateActions = async () => {
    setLoading(true);
    if (!username) {
      setErrorText("No user found");
      setLoading(false);
      return;
    }
    setUserActions([]);
    let fetchedActions: UserAction[] = [];
    let fetchedEvents: (CSEvent | null)[] = [];
    try {
      fetchedActions = await UserActionApi.getUserActions(username, 0, MAX_ACTIONS) ?? [];
    }
    catch (err) {
      console.error(`Failed to fetch actions for user ${username}`);
      setErrorText("Failed to fetch actions.");
      fetchedActions = [];
      fetchedEvents = [];
    }

    try {
      fetchedEvents = await Promise.all(fetchedActions.map(action => EventApi.fetchEvent(action.event_id)));
    }
    catch (err) {
      console.error("Failed to fetch events for actions.");
      setErrorText("Failed to fetch events for actions.")
      fetchedEvents = fetchedActions.map(() => null);
    }

    if (fetchedActions.length == MAX_ACTIONS) {
      setHasMore(true);
    }
    setUserActions(fetchedActions);
    setUserEvents(fetchedEvents);
    setLoading(false);
  }

  const ErrorFetchingActions = () => {
    if (errorText === "Failed to fetch actions.") {
      return (
        <Card>
          <Card.Body>
            <Card.Text>Failed fetching user actions</Card.Text>
            <Button variant="light" onClick={updateActions}>Retry</Button>
          </Card.Body>
        </Card>
      );
    }
    return null;
  }

  const UserActions = () => {
    if (errorText === "Failed to fetch actions.") {
      return <Alert variant="danger">{errorText}</Alert>;
    }

    let actionsArray;
    if (isLoading) {
      actionsArray = Array.from({ length: LOADING_AMOUNT }, (_, i) => <ActionPlaceholder key={i} />);
    }
    else {
      actionsArray = userActions.map((action, index) => {
        const csevent = userEvents[index];
        return (
          <ActionDetails
            key={action.purchase_id}
            action={action}
            csevent={csevent}
          />
        );
      });
    }
    if (actionsArray.length === 0) {
      return (
        <Container>
          <h2>Looks like you haven't made any purchases yet...</h2>
          <h3>Go get some tickets!</h3>
          <img height={"400px"} width={"600px"} style={{ borderRadius: "20px" }} src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdW9hbDB2enZpOGFnNGk3eGRmemJ1anIxOXI1c3VhMjJpdmY0ZjBxbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8GjxwxtZWS29xlJnUH/giphy.gif" alt="Tickets GIF" />
        </Container>
      );
    }
    return <Container style={{ paddingTop: '100px' }}>
      <ErrorFetchingActions />
      <InfiniteScroll
        dataLength={userActions.length}
        next={fetchMoreData}
        hasMore={hasMore}
        style={{ overflowX: "hidden" }}
        loader={<ThreeSpanningSpinners />}
      >
        {actionsArray}
      </InfiniteScroll>
      <Alert show={errorText == "Failed to fetch events for actions."} variant="danger">{errorText}</Alert>
      <Alert show={displayErrorLoadMore} variant="danger" onClose={() => setDisplayErrorLoadMore(false)} dismissible>
        <Alert.Heading>Failed to user :(</Alert.Heading>
        <p>
          Something went wrong while trying to load more events. Please try refreshing the page.
        </p>
      </Alert>
    </Container>
  }


  useEffect(() => {
    updateActions();
  }, [username]);

  return (
    <Container>
      <h1 style={{ position: 'relative' }}>{username?.toUpperCase()}'S USER SPACE</h1>
      <hr />
      <UserActions />
    </Container>
  );
}

export default UserSpacePage;