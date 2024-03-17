import { Navbar, Nav, Container, Button } from "react-bootstrap";
import "./Navbar.css";

import logoutIcon from "/src/assets/logout.svg";
import backIcon from "/src/assets/back.svg";
import React from "react";
import { useNavigate } from "react-router-dom";

const shouldDisplayGoBackButton = (path: string) => {
    return path !== "/" && path !== "/error" && path !== "/invalidurl";
}

const NavbarComponent: React.FC = () => {
    const navigate = useNavigate();

    const GoBackButton = () => {
        return (
            <Button
                className={shouldDisplayGoBackButton(location.pathname) ? "" : "invisible"}
                variant="light"
                onClick={() => navigate(-1)}>
                <img src={backIcon} alt="Go back" />Go back
            </Button>
        );
    }


    return (
        <>
            <Navbar bg="light" variant="light" fixed="top">
                <Container>
                    <Navbar.Brand href="/">CS Events</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="/invalidurl">404</Nav.Link>
                        <Nav.Link href="/error">error</Nav.Link>
                    </Nav>
                    <GoBackButton />
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