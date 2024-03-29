import { Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { CATALOG_PATH } from "../paths";

export default function NotFound() {
    const location = useLocation();
    const message = location.state?.message ?? "How did you get here..?";
    return (
        <div>
            <h1>Error 404 - Page not found</h1>
            <p>{message}</p>
            <Link to={CATALOG_PATH}><Button variant="primary">Return to Catalog</Button></Link>

        </div>
    )
}