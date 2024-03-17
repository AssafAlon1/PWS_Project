import React from 'react';
import { Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const ErrorPage: React.FC = () => {
    const location = useLocation();
    const message = location.state?.message ?? "Oops! Something went wrong.";
    return (
        <div className="container">
            <h1>ERROR</h1>
            <p>{message}</p>
            <Link to="/"><Button variant="primary">Return to Catalog</Button></Link>
        </div>
    );
};

export default ErrorPage;