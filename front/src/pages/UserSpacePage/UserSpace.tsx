import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Container } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ThreeSpanningSpinners } from '../../components/SpinnerComponent/SpinnerComponent';
import { UserAction } from '../../types';
import UserActionApi from '../../api/userAction';
import { MAX_ACTIONS } from '../../const';
import ActionDetails, { ActionPlaceholder } from '../../components/UserActionDetails/UserActionDetails';

const UserSpacePage: React.FC = () => {
    const [username, setUsername] = useState<string>(""); // TODO - Get username from context
    const [userActions, setUserActions] = useState<UserAction[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [displayError, setDisplayError] = useState<boolean>(false);

    const navigate = useNavigate();

    // Smaller screens will have less loading events
    const LOADING_AMOUNT = window.innerWidth < 576 ? 2 : window.innerWidth < 992 ? 6 : 8;

    // Totally NOT stolen from CatalogPage
    const fetchMoreData = async () => {
        try {
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

    const UserAction = () => {
        let actionsArray;
        if (isLoading) {
            actionsArray = Array.from({ length: LOADING_AMOUNT }, (_, i) => <ActionPlaceholder key={i} />);
        }
        else {
            actionsArray = userActions.map(action => <ActionDetails key={action.purchaseId} action={action} />);
        }
        if (actionsArray.length === 0) {
            return (
              <Container>
                <h2>Looks like you haven't made any purchases yet...</h2>
                <h3>Go get some tickets!</h3>
              </Container>
            );
        }
    

        return (
            <Container>
                <InfiniteScroll
                dataLength={userActions.length}
                next={fetchMoreData}
                hasMore={hasMore}
                style={{ overflowX: "hidden" }}
                loader={<ThreeSpanningSpinners />}
                >
                    {/* something here */}
                </InfiniteScroll>
            </Container>
        );
    }
}