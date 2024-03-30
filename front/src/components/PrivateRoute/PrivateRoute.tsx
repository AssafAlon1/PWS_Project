import { useContext, useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';
import { AuthContext } from '../AuthProvider/AuthProvider';
import { ThreeSpanningSpinners } from '../SpinnerComponent/SpinnerComponent';
import { LOGIN_PATH } from '../../paths';

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
        return <div>
            <h1>Loading...</h1>
            <ThreeSpanningSpinners />
        </div>;
    }

    if (!auth.user) {
        return <Navigate to={LOGIN_PATH} />; // TODO - add some parameter saying "session expired"
    }

    console.log(" ### PrivateRoute approved :)");
    return <Outlet />;
};

export default PrivateRoute;