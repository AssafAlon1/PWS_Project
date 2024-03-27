import { Navbar, Nav, Container, Button } from "react-bootstrap";
import "./Navbar.css";

import logoutIcon from "/src/assets/logout.svg";
import backIcon from "/src/assets/back.svg";
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthProvider/AuthProvider";
import { AuthApi } from "../../api/auth";

const shouldDisplayGoBackButton = (path: string) => {
    return path === "/checkout" || path === "/error" || path.startsWith("/event"); // TODO - This!!!
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
        navigate("/login");
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
                    <Navbar.Brand as={Link} to="/">CS Events</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/invalidurl">404</Nav.Link>
                        <Nav.Link as={Link} to="/error">error</Nav.Link>
                        <Nav.Link as={Link} to="/signup">signup</Nav.Link>
                        <Nav.Link as={Link} to="/login">login</Nav.Link>
                        <Nav.Link as={Link} to="/userspace">User Space</Nav.Link>
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