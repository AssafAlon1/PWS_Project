import { createContext, useState } from "react";
import { AuthApi } from '../../api/auth';
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import UserActionApi from "../../api/userAction";
import { LOGIN_PATH } from "../../paths";
import { UserRole } from "../../const";

interface AuthContextProps {
    user: string | null;
    setUser: (user: string | null) => void;
    nextEvent: string | null;
    updateNextEvent: () => void; // TODO - CSEvent?
    updateLoggedIn: () => Promise<boolean>;
    role: number;
    isBackOffice: boolean;
    setBackOffice: (value: boolean) => void;
}

export const AuthContext = createContext<AuthContextProps>({
    user: null,
    setUser: () => { },
    nextEvent: null,
    updateNextEvent: () => { },
    updateLoggedIn: async () => false,
    role: UserRole.Unauthenticated,
    isBackOffice: false,
    setBackOffice: () => { },
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<string | null>(null);
    const [nextEvent, setNextEvent] = useState<string | null>(null); // TODO - CSEvent
    const [role, setRole] = useState<number>(0);
    const navigate = useNavigate();
    const [isBackOffice, setBackOffice] = useState<boolean>(false);

    const updateLoggedIn = async (): Promise<boolean> => {
        const result = await AuthApi.getUserInfo();
        if (result && result.role != undefined && result.username && result.role !== UserRole.Unauthenticated) {
            setUser(result.username);
            setRole(result.role);
            return true;
        }
        else {
            setUser(null);
            setRole(UserRole.Unauthenticated);
            navigate(LOGIN_PATH);
            return false;
        }
    }

    const updateNextEvent = async () => {
        if (!user) {
            return;
        }
        const closestEvent = await UserActionApi.getUserClosestEvent(user);
        setNextEvent(closestEvent);
    }

    useEffect(() => {
        if (!user) {
            return;
        }
        updateNextEvent();
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, setUser, nextEvent, updateNextEvent, updateLoggedIn, role, isBackOffice, setBackOffice }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
