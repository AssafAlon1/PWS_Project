import { useContext, useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';
import { AuthContext } from '../AuthProvider/AuthProvider';
import SpanningSpinnner from '../SpinnerComponent/SpinnerComponent';

const PrivateRoute = () => {
    const auth = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const updateLoggedIn = async () => {
            setIsLoading(true);
            await auth.updateLoggedIn();
            setIsLoading(false);
        }
        updateLoggedIn();
    }, []);

    if (isLoading) {
        console.log(" ### Loading...");
        return <div>
            <h1>Loading...</h1>
            <SpanningSpinnner/>
            <SpanningSpinnner/>
            <SpanningSpinnner/>
        </div>;
    }

    if (!auth.user) {
        console.log(" ### NOT LOGGED IN :/");
        return <Navigate to="/login" />; // TODO - add some parameter saying "session expired"
    }
    console.log(" ### PrivateRoute approved :)");
    return <Outlet />;
};

export default PrivateRoute;