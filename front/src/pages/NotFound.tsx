import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div>
            <h1>How did you get here...?</h1>
            <h2>404 - Page not found</h2>
            <Link to="/"><Button variant="primary">Return to Catalog</Button></Link>

        </div>
    )
}