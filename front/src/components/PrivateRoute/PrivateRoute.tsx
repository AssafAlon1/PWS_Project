import { useContext, useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';
import { AuthContext } from '../AuthProvider/AuthProvider';
import { ThreeSpanningSpinners } from '../SpinnerComponent/SpinnerComponent';
import { ERROR_PATH, LOGIN_PATH } from '../../paths';
import { UserRole } from '../../const';


const PrivateRoute: React.FC<{ requiredRole?: number }> = ({ requiredRole }) => {
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
        return <Navigate to={LOGIN_PATH} />;
    }

    if (requiredRole != undefined && auth.role > requiredRole) {
        return <Navigate to={ERROR_PATH} state={{ message: "You are not authorized to view this page. Bad boy ;)" }} />;
    }

    if (requiredRole != undefined && requiredRole < UserRole.Guest && !auth.isBackOffice) {
        return <Navigate to={ERROR_PATH} state={
            {
                message: "You are authorized to view this page, but please, enter through the back office. We don't want people asking questions..."
            }
        } />;
    }

    if (requiredRole == undefined && auth.isBackOffice) {
        return <Navigate to={ERROR_PATH} state={{ message: "To use the system like a user, please go to the front desk." }} />;
    }

    return <Outlet />;
};

export default PrivateRoute;