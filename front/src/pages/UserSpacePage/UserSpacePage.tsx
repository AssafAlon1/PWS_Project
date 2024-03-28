import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Container } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ThreeSpanningSpinners } from '../../components/SpinnerComponent/SpinnerComponent';
import { UserAction } from '../../types';
import UserActionApi from '../../api/userAction';
import { MAX_ACTIONS } from '../../const';
import ActionDetails, { ActionPlaceholder } from '../../components/UserActionDetails/UserActionDetails';
import { AuthContext } from '../../components/AuthProvider/AuthProvider';

const UserSpacePage: React.FC = () => {
  const [userActions, setUserActions] = useState<UserAction[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false); // TODO - UTILIZE THIS!
  const [hasMore, setHasMore] = useState<boolean>(false); // TODO - Change to true
  const [displayError, setDisplayError] = useState<boolean>(false);

  const navigate = useNavigate();

  // Smaller screens will have less loading events
  const LOADING_AMOUNT = window.innerWidth < 576 ? 2 : window.innerWidth < 992 ? 6 : 8;

  const authContext = useContext(AuthContext);
  const username = authContext.user;

  // Totally NOT stolen from CatalogPage
  const fetchMoreData = async () => {
    try {
      if (!username) {
        throw Error("Username not found");
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // TODO - Remove
      const newActions = await UserActionApi.getUserActions(username, userActions.length, MAX_ACTIONS);
      if (newActions.length < MAX_ACTIONS) {
        setHasMore(false);
      }
      setUserActions(prevActions => [...prevActions, ...newActions]);
    } catch {
      // TODO - Display alert instead of redirecting
      setDisplayError(true);
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
    // TODO - Set failed fetching actions to false
    let fetchedActions: UserAction[] = [];
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      fetchedActions = await UserActionApi.getUserActions(username, 0, MAX_ACTIONS) ?? [];
      if (!fetchedActions) {
        throw new Error(`Failed to fetch comments for user ${username}`);
      }
    }
    catch (err) {
      // TODO - Tone it down with all the try,catch,throw (just handle it in fetchComments and check for response value)
      console.error(err);
      console.error(`Failed to fetch actions for user ${username}`);
      // TODO - Set failed fetching actions to true
      fetchedActions = [];
    }
    if (fetchedActions.length < MAX_ACTIONS) {
      setHasMore(false);
    }
    setUserActions(fetchedActions);
    setLoading(false);
  }

  const UserActions = () => {
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
      <InfiniteScroll
        dataLength={userActions.length}
        next={fetchMoreData}
        hasMore={hasMore}
        style={{ overflowX: "hidden" }}
        loader={<ThreeSpanningSpinners />}
      >
        {actionsArray}
      </InfiniteScroll>
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