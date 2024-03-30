import { Navbar, Nav, Container, Button } from "react-bootstrap";
import "./Navbar.css";

import logoutIcon from "/src/assets/logout.svg";
import backIcon from "/src/assets/back.svg";
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthProvider/AuthProvider";
import { AuthApi } from "../../api/auth";
import { CATALOG_PATH, CHECKOUT_PATH, ERROR_PATH, EVENT_PATH, LOGIN_PATH, NEW_EVENT_PATH, REFUND_PATH, SIGNUP_PATH, USERSPACE_PATH } from "../../paths";
import { UserRole } from "../../const";

const shouldDisplayGoBackButton = (path: string) => {
    return [
        CHECKOUT_PATH,
        ERROR_PATH,
        USERSPACE_PATH,
        REFUND_PATH
    ].includes(path) || path.startsWith(EVENT_PATH);
}

const NavbarComponent: React.FC = () => {
    const navigate = useNavigate();
    const context = useContext(AuthContext);

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

    const NextEvent = () => {
        if (context.nextEvent) {
            return (
                <Button variant="success" disabled={true}>Next event: {context.nextEvent}</Button>
            );
        }
        return <></>
    }


    const onLogoutClick = async () => {
        await AuthApi.logout();
        context.setUser("");
        navigate(LOGIN_PATH);
    }

    const LogoutButton = () => {
        return <Button variant="light"
            onClick={onLogoutClick}>
            <div className="horizontal-layout">
                <img src={logoutIcon} alt="Logout" />
                <p className="nav-element">Logout</p>
            </div>
        </Button>
    }



    return (
        <>
            <Navbar bg="light" variant="light" fixed="top">
                <Container>
                    <Navbar.Brand as={Link} to={CATALOG_PATH}>CS Events</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to={SIGNUP_PATH}>signup</Nav.Link>
                        <Nav.Link as={Link} to={LOGIN_PATH}>login</Nav.Link>
                        {/* <Nav.Link as={Link} to={ERROR_PATH}>error</Nav.Link> */}
                        {context.isBackOffice ? <></> : <Nav.Link as={Link} to={USERSPACE_PATH}>User Space</Nav.Link>}
                        {context.isBackOffice ? <></> : <Nav.Link as={Link} to={REFUND_PATH}>Refunds</Nav.Link>}
                        {context.role <= UserRole.Worker ? <Nav.Link as={Link} to={NEW_EVENT_PATH}>Create Event</Nav.Link> : <></>}
                        
                    </Nav>

                    {context.user ? <>
                        <GoBackButton />
                        <NextEvent />
                        <div className="vr" />
                        <p className="nav-element"><b>{context.user} ({context.role})</b></p>
                        <div className="vr" />
                        <LogoutButton />
                    </> : <></>}
                </Container>
            </Navbar>
        </>
    );
}

export default NavbarComponent;