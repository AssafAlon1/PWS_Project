import React from 'react';
import { Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { CATALOG_PATH } from '../paths';

const ErrorPage: React.FC = () => {
    const location = useLocation();
    const message = location.state?.message ?? "Oops! Something went wrong.";
    return (
        <div className="container">
            <h1>ERROR</h1>
            <p>{message}</p>
            <Link to={CATALOG_PATH}><Button variant="primary">Return to Catalog</Button></Link>
        </div>
    );
};

export default ErrorPage;