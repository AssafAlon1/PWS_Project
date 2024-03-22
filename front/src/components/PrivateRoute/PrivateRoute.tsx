import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router';
import { AuthContext } from '../AuthProvider/AuthProvider';

const PrivateRoute = () => {
    const auth = useContext(AuthContext);
    console.log(" ### PrivateRoute called");
    console.log(" ### auth: ", auth);
    console.log(" ### auth.user: ", auth.user);
    auth.updateLoggedIn(); // trigger the login check to see if token expired
    if (!auth.user) {
        console.log(" ### NOT LOGGED IN :/");
        return <Navigate to="/login" />; // TODO - add some parameter saying "session expired"
    }
    console.log(" ### PrivateRoute approved :)");
    return <Outlet />;
};

export default PrivateRoute;