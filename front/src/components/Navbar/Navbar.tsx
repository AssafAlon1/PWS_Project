import { Navbar, Nav, Container, Button } from "react-bootstrap";
import "./Navbar.css";

import logoutIcon from "/src/assets/logout.svg";
import backIcon from "/src/assets/back.svg";
import backOfficeIcon from "/src/assets/back-office.svg";
import frontDeskIcon from "/src/assets/front-desk.svg";
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthProvider/AuthProvider";
import { AuthApi } from "../../api/auth";
import { CATALOG_PATH, CHECKOUT_PATH, ERROR_PATH, EVENT_PATH, LOGIN_PATH, NEW_EVENT_PATH, REFUND_PATH, USERSPACE_PATH } from "../../paths";
import { UserRole } from "../../const";

const shouldDisplayGoBackButton = (path: string) => {
    return [
        CHECKOUT_PATH,
        ERROR_PATH,
        USERSPACE_PATH,
        REFUND_PATH,
        NEW_EVENT_PATH
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
        if (context.nextEvent && !context.isBackOffice) {
            return (
                <Button variant="success" disabled={true}>Next event: {context.nextEvent}</Button>
            );
        }
        return <></>
    }

    const onLogoutClick = async () => {
        await AuthApi.logout();
        context.setUser("");
        context.updateNextEvent();
        context.setBackOffice(false);
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

    const ToggleBackOfficeButton = () => {
        if (!context.user || context.role > UserRole.Worker) {
            return <></>
        }

        const onClick = () => {
            context.setBackOffice(!context.isBackOffice);
            navigate(CATALOG_PATH);
        }

        return <Button variant="light"
            onClick={onClick}>
            <div className="horizontal-layout">
                <img src={context.isBackOffice ? frontDeskIcon : backOfficeIcon} alt="toggle-back-office" />
                <p className="nav-element">{context.isBackOffice ? "Front Desk" : "Back Office"}</p>
            </div>
        </Button>
    }

    return (
        <>
            <Navbar bg="light" variant="light" fixed="top">
                <Container>
                    <Navbar.Brand as={Link} to={CATALOG_PATH}>CS Events</Navbar.Brand>
                    <Nav className="me-auto">
                        <ToggleBackOfficeButton/>
                        {/* <Nav.Link as={Link} to={ERROR_PATH}>error</Nav.Link> */}
                        {(context.user && !context.isBackOffice) && <Nav.Link as={Link} to={USERSPACE_PATH}>User Space</Nav.Link>}
                        {(context.user && !context.isBackOffice) && <Nav.Link as={Link} to={REFUND_PATH}>Refunds</Nav.Link>}

                        {(context.user && context.isBackOffice && context.role <= UserRole.Manager) && <Nav.Link as={Link} to={NEW_EVENT_PATH}>Create Event</Nav.Link>}

                    </Nav>

                    {context.user ? <>
                        <GoBackButton />
                        <NextEvent />
                        <div className="vr" />
                        <p className="nav-element"><b>{context.user}</b></p>
                        <div className="vr" />
                        <LogoutButton />
                    </> : <></>}
                </Container>
            </Navbar>
        </>
    );
}

export default NavbarComponent;