import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Container } from 'react-bootstrap';

import { CSEvent, Comment } from '../../types';
import AddCommentForm from '../../components/AddCommentForm/AddCommentForm';
import CommentApi from '../../api/comment';
import CommentComponent from '../../components/CommentComponent/CommentComponent';
import { ThreeSpanningSpinners } from '../../components/SpinnerComponent/SpinnerComponent';
import InfiniteScroll from 'react-infinite-scroll-component';
import { MAX_COMMENTS } from '../../const';
import { CATALOG_PATH } from '../../paths';

interface CommentsComponentProps {
    eventId: string | undefined;
    comment_count: number; // TODO - REMOVE AFTER BACK OFFICE
}

const CommentsComponent: React.FC<CommentsComponentProps> = ({ eventId, comment_count }) => {
    const [comments, setComments] = useState<Comment[] | null>(null);
    const [failedFetchingComments, setFailedFetchingComments] = useState<boolean>(false);

    const [hasMore, setHasMore] = useState<boolean>(true);
    const [displayError, setDisplayError] = useState<boolean>(false);

    const navigate = useNavigate();

    const updateComments = async () => {
        if (!eventId) {
            // I believe it should be impossible to get here, but just in case...
            return navigate(CATALOG_PATH);
        }
        setComments(null);
        setFailedFetchingComments(false);
        let fetchedComments: Comment[];
        try {
            fetchedComments = await CommentApi.fetchComments(eventId, 0, MAX_COMMENTS) ?? [];
            if (!fetchedComments) {
                throw new Error(`Failed to fetch comments for event ${eventId}`);
            }
        }
        catch (err) {
            // TODO - Tone it down with all the try,catch,throw (just handle it in fetchComments and check for response value)
            console.error(err);
            console.error(`Failed to fetch comments for event ${eventId}`);
            setFailedFetchingComments(true);
            fetchedComments = [];
        }
        if (fetchedComments.length < MAX_COMMENTS) {
            setHasMore(false);
        }
        setComments(fetchedComments);
    }

    useEffect(() => {
        updateComments();
    }, [eventId]);

    const fetchMoreData = async () => {
        try {
            if (!eventId || comments === null) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // TODO - Remove
            const newComments = await CommentApi.fetchComments(eventId, comments.length, MAX_COMMENTS);
            console.log("newComments", newComments);
            if (newComments.length < MAX_COMMENTS) {
                console.log("No longer hasMore");
                setHasMore(false);
            }
            setComments(prevComments => [...prevComments ?? [], ...newComments]);
        } catch {
            setDisplayError(true);
            setHasMore(false);
        }
    };
    let body;
    if (failedFetchingComments) {
        body = <Card.Body>
            <Card.Text>Failed fetching comments information</Card.Text>
            <Button variant="light" onClick={updateComments}>Retry</Button>

        </Card.Body>
    } else if (comments === null) {
        body = <Card.Body>
            <Card.Text><ThreeSpanningSpinners /></Card.Text>
        </Card.Body>
    } else if (comments.length === 0) {
        return <Card.Body>
            <AddCommentForm eventId={eventId ?? ""} updateComments={updateComments} />
            <hr />
            <Card.Subtitle>Be the first to comment!</Card.Subtitle>
        </Card.Body>
    } else {
        body = <Card.Body>
            <AddCommentForm eventId={eventId ?? ""} updateComments={updateComments} />
            <hr />
            <Container>
                <InfiniteScroll
                    dataLength={comments.length}
                    next={fetchMoreData}
                    hasMore={hasMore}
                    style={{ overflowX: "hidden" }}
                    loader={<ThreeSpanningSpinners />}
                >
                    {comments.map((comment, index) => {
                        return <CommentComponent key={index} comment={comment} />
                    })}
                </InfiniteScroll>
                <Alert show={displayError} variant="danger" onClose={() => setDisplayError(false)} dismissible>
                    <Alert.Heading>Failed to load comments :(</Alert.Heading>
                    <p>
                        Something went wrong while trying to load more comments. Please try refreshing the page.
                    </p>
                </Alert>
            </Container>

        </Card.Body>;
    }

    return (
        <Card>
            <Card.Header>
                <Card.Title>
                    Comments:
                </Card.Title>
                {/* TODO !!!!!! - Remove this when back office goes live */}
                <Card.Subtitle>(Total comments: {comment_count})</Card.Subtitle>
            </Card.Header>
            {body}
        </Card>
    );
}

export default CommentsComponent;
