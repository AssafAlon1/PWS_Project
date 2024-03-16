import { Navbar, Nav, Container } from "react-bootstrap";
import "./Navbar.css";


export const NavbarComponent = () => {
    return (
        <>
            <Navbar bg="light" variant="light" fixed="top">
                <Container>
                    <Navbar.Brand href="/">CS Events</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="/invalidurl">404</Nav.Link>
                    </Nav>
                    <div>
                        <p className="nav-element">DrawBow</p>
                        <Nav.Link href="/logout">Logout</Nav.Link>
                    </div>
                </Container>
            </Navbar>
        </>
    );
}