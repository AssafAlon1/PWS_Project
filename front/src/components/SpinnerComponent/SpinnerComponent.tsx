import React from 'react';
import Spinner from 'react-bootstrap/Spinner';

export const SpanningSpinnner: React.FC = () => {
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

export const ThreeSpanningSpinners: React.FC = () => {
    return (
        <>
            <SpanningSpinnner />
            <SpanningSpinnner />
            <SpanningSpinnner />
        </>
    );
}
