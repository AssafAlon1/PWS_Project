import { createContext, useState } from "react";
import { AuthApi } from '../../api/auth';
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import EventApi from "../../api/event";
import { getFormattedDateTime } from "../../utils/formatting";

interface AuthContextProps {
    user: string | null;
    setUser: (user: string | null) => void;
    nextEvent: string | null;
    updateNextEvent: () => void; // TODO - CSEvent?
    updateLoggedIn: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextProps>({
    user: null,
    setUser: () => { },
    nextEvent: null,
    updateNextEvent: () => { },
    updateLoggedIn: async () => false,
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<string | null>(null);
    const [nextEvent, setNextEvent] = useState<string | null>(null); // TODO - CSEvent
    const navigate = useNavigate();

    const updateLoggedIn = async (): Promise<boolean> => {
        const result = await AuthApi.getUserName();
        if (typeof result === "string") {
            setUser(result);
            return true;
        }
        else {
            setUser(null);
            navigate("/login");
            return false;
        }
    }

    const updateNextEvent = async () => {
        if (!user) {
            return;
        }
        const closestEvent = await EventApi.getUserClosestEvent(user);
        if (closestEvent) {
            setNextEvent(`${closestEvent.title} (${getFormattedDateTime(closestEvent.start_date)})`);
        }
    }

    useEffect(() => {
        if (!user) {
            return;
        }
        updateNextEvent();
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, setUser, nextEvent, updateNextEvent, updateLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
