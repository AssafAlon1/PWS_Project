import './CommentComponent.css';
import React from 'react';
import { Comment } from '../../types';
import { Card } from 'react-bootstrap';
import { getFormattedDateTime } from '../../utils/formatting';

interface CommentProps {
    comment: Comment;
}

const CommentComponent: React.FC<CommentProps> = ({ comment }) => {
    return (
        <Card className="mb-2">
            <Card.Header>
                By {comment.author} | At {getFormattedDateTime(comment.createdAt)}
            </Card.Header>
            <Card.Body>
                <Card.Text>{comment.content}</Card.Text>
            </Card.Body>
        </Card>
    );
};

export default CommentComponent;