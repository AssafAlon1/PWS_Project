import React, { useContext, useState } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { postComment } from '../../api/comment';
import { AppContext } from '../../App';

interface AddCommentProps {
    eventId: string;
    updateComments: () => Promise<void>;
}

enum PostStatus {
    IDLE = "idle",
    LOADING = "loading",
    SUCCESS = "success",
    ERROR = "error"
}

const AddCommentForm: React.FC<AddCommentProps> = ({ eventId, updateComments }) => {

    const context = useContext(AppContext);
    const [postStatus, setPostStatus] = useState<PostStatus>(PostStatus["IDLE"]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // TODO - implement this
        if (!context.user) {
            alert("Could not identify user. Please refresh the page and try again."); // TODO - error?
            return;
        }
        try {
            // TODO - Sanitize input?
            setPostStatus(PostStatus["LOADING"]);
            await postComment(context.user, eventId, event.currentTarget.comment.value);
            setPostStatus(PostStatus["SUCCESS"]);
        }
        catch (error) {
            console.error(error);
            setPostStatus(PostStatus["ERROR"]);
        }

    };

    return (
        <Form onSubmit={handleSubmit} className="mb-4">
            <Form.Group controlId="comment" className="mb-3">
                <Form.Label>Add a new comment</Form.Label>
                <Form.Control
                    required
                    disabled={postStatus == "loading"}
                    as="textarea"
                    rows={3}
                    placeholder="Enter your comment" />
            </Form.Group>

            <Button disabled={postStatus == "loading"} variant="primary" type="submit" className="mb-4">
                {postStatus == PostStatus["LOADING"] ? <Spinner
                    as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                /> : "Submit"}
            </Button>
            <Alert show={postStatus == PostStatus["SUCCESS"]} variant="success">
                <p>Comment posted successfully!</p>
                <div className="d-flex justify-content-end">
                    <Button onClick={updateComments} variant="outline-success">
                        Reload comments
                    </Button>
                </div>
            </Alert>
            <Alert show={postStatus == PostStatus["ERROR"]} variant="danger">
                <p>Failed to post comment! Please try again.</p>
                <div className="d-flex justify-content-end">
                </div>
            </Alert>
        </Form>
    );
};

export default AddCommentForm;