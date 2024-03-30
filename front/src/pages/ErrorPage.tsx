import React, { useContext } from 'react';
import { Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { CATALOG_PATH } from '../paths';
import { AuthContext } from '../components/AuthProvider/AuthProvider';

const ErrorPage: React.FC = () => {
    const location = useLocation();
    useContext(AuthContext); // This must be here for the navbar to display the user options
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