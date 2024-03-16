import { Navbar, Nav, Container, Button } from "react-bootstrap";
import "./Navbar.css";

import logoutIcon from "/src/assets/logout.svg";
import React from "react";

const NavbarComponent: React.FC = () => {
    return (
        <>
            <Navbar bg="light" variant="light" fixed="top">
                <Container>
                    <Navbar.Brand href="/">CS Events</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="/invalidurl">404</Nav.Link>
                    </Nav>
                    <p className="nav-element"><b>DrawBow</b></p>
                    <div className="vr" />
                    <div>
                        <Button variant="light">
                            <Nav.Link href="/logout">
                                <div className="horizontal-layout">
                                    <img src={logoutIcon} alt="Logout" />
                                    <p className="nav-element">Logout</p>
                                </div>
                            </Nav.Link>
                        </Button>
                    </div>
                </Container>
            </Navbar>
        </>
    );
}

export default NavbarComponent;