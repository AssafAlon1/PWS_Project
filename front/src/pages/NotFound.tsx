import { Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { CATALOG_PATH } from "../paths";
import { useContext } from "react";
import { AuthContext } from "../components/AuthProvider/AuthProvider";

export default function NotFound() {
    const location = useLocation();
    useContext(AuthContext); // This must be here for the navbar to display the user options
    const message = location.state?.message ?? "How did you get here..?";

    return (
        <div>
            <h1>Error 404 - Page not found</h1>
            <p>{message}</p>
            <Link to={CATALOG_PATH}><Button variant="primary">Return to Catalog</Button></Link>

        </div>
    )
}