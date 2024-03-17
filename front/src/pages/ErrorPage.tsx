import React from 'react';
import { Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const ErrorPage: React.FC = () => {
    const location = useLocation();
    const errorMessage = location.state?.errorMessage ?? "Oops! Something went wrong.";
    return (
        <div className="container">
            <h1>ERROR</h1>
            <p>{errorMessage}</p>
            <Link to="/"><Button variant="primary">Return to Catalog</Button></Link>
        </div>
    );
};

export default ErrorPage;