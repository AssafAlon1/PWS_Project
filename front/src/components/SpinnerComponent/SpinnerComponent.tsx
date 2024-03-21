import React from 'react';
import Spinner from 'react-bootstrap/Spinner';

const SpanningSpinnner: React.FC = () => {
    return (
        <Spinner
            className="me-2"
            as="span"
            animation="grow"
            size="sm"
            role="status"
            aria-hidden="true"
        />
    );
};

export default SpanningSpinnner;