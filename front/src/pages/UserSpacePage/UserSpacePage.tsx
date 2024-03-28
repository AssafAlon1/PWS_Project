import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, Container } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ThreeSpanningSpinners } from '../../components/SpinnerComponent/SpinnerComponent';
import { UserAction } from '../../types';
import UserActionApi from '../../api/userAction';
import { MAX_ACTIONS } from '../../const';
import ActionDetails, { ActionPlaceholder } from '../../components/UserActionDetails/UserActionDetails';
import { AuthContext } from '../../components/AuthProvider/AuthProvider';

const UserSpacePage: React.FC = () => {
  const [userActions, setUserActions] = useState<UserAction[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [displayErrorLoadMore, setDisplayErrorLoadMore] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");

  const navigate = useNavigate();

  // Smaller screens will have less loading events
  const LOADING_AMOUNT = window.innerWidth < 576 ? 2 : window.innerWidth < 992 ? 6 : 8;

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
      await new Promise(resolve => setTimeout(resolve, 1000)); // TODO - Remove
      const newActions = await UserActionApi.getUserActions(username, userActions.length, MAX_ACTIONS);
      if (newActions.length < MAX_ACTIONS) {
        setHasMore(false);
      }
      setUserActions(prevActions => [...prevActions, ...newActions]);
    } catch {
      setDisplayErrorLoadMore(true);
      setHasMore(false);
    }
  };

  const updateActions = async () => {
    setLoading(true);
    if (!username) {
      // TODO - suggest refresh or something?
      console.log("!!NO USER");
      setLoading(false);
      return;
      // return navigate("/");
    }
    setUserActions([]);
    let fetchedActions: UserAction[] = [];
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      fetchedActions = await UserActionApi.getUserActions(username, 0, MAX_ACTIONS) ?? [];
    }
    catch (err) {
      console.error(`Failed to fetch actions for user ${username}`);
      setErrorText("Failed to fetch actions.");
      fetchedActions = [];
    }
    if (fetchedActions.length < MAX_ACTIONS) {
      setHasMore(false);
    }
    setUserActions(fetchedActions);
    setLoading(false);
  }

  const ErrorFetchingActions = () => {
    if (errorText) {
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

    if (errorText) {
      return <Alert variant="danger">{errorText}</Alert>;
    }

    let actionsArray;
    if (isLoading) {
      actionsArray = Array.from({ length: LOADING_AMOUNT }, (_, i) => <ActionPlaceholder key={i} />);
    }
    else {
      actionsArray = userActions.map(action => <ActionDetails key={action.purchase_id} action={action} />);
    }
    if (actionsArray.length === 0) {
      return (
        <Container>
          <h2>Looks like you haven't made any purchases yet...</h2>
          <h3>Go get some tickets!</h3>
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
      <Alert show={displayErrorLoadMore} variant="danger" onClose={() => setDisplayErrorLoadMore(false)} dismissible>
        <Alert.Heading>Failed to event :(</Alert.Heading>
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