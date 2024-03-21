import React, { useContext, useState } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { postComment } from '../../api/comment';
import { AppContext } from '../../App';

interface AddCommentProps {
    eventId: string;
    updateComments: () => Promise<void>;
}

const AddCommentForm: React.FC<AddCommentProps> = ({ eventId, updateComments }) => {

    const context = useContext(AppContext);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [displayCommentPosted, setDisplayCommentPosted] = useState<boolean>(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // TODO - implement this
        if (!context.user) {
            alert("Could not identify user. Please refresh the page and try again."); // TODO - error?
            return;
        }
        try {
            // TODO - Sanitize input?
            setLoading(true);
            await postComment(context.user, eventId, event.currentTarget.comment.value);
            setLoading(false);
            setDisplayCommentPosted(true);
        }
        catch (error) {
            console.error(error);
            alert("Failed to post comment. Please try again."); // TODO - error?
        }

    };

    return (
        <Form onSubmit={handleSubmit} className="mb-4">
            <Form.Group controlId="comment" className="mb-3">
                <Form.Label>Add a new comment</Form.Label>
                <Form.Control
                    required
                    disabled={isLoading}
                    as="textarea"
                    rows={3}
                    placeholder="Enter your comment" />
            </Form.Group>

            <Button disabled={isLoading} variant="primary" type="submit" className="mb-4">
                {isLoading ? <Spinner
                    as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                /> : "Submit"}
            </Button>
            <Alert show={displayCommentPosted} variant="success">
                <p>Comment posted successfully!</p>
                <div className="d-flex justify-content-end">
                    <Button onClick={updateComments} variant="outline-success">
                        Reload comments
                    </Button>
                </div>
            </Alert>
        </Form>
    );
};

export default AddCommentForm;