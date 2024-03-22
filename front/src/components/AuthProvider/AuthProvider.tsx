import { createContext, useState } from "react";
import { AuthApi } from '../../api/auth';
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface AuthContextProps {
    user: string | null;
    setUser: (user: string | null) => void;
    updateLoggedIn: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextProps>({
    user: null,
    setUser: () => { },
    updateLoggedIn: async () => false,
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<string | null>(null);
    const navigate = useNavigate();
    
    const updateLoggedIn = async (): Promise<boolean> => {
        const result = await AuthApi.getUserName();
        console.log("updateLoggedIn result: ", result);
        if (typeof result === "string") {
            console.log("User is logged in as: ", result);
            setUser(result);
            return true;
        }
        else {
            setUser(null);
            navigate("/login");
            return false;
        }
    }

    useEffect(() => {
        console.log("THE USER HAS CHANGED! ", user);
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, setUser, updateLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};


//   return (
//     <AppContext.Provider value={{ user, setUser, nextEvent, updateNextEvent }}>
//       <PurchaseDetailsProvider>
//         <CSRouter />
//       </PurchaseDetailsProvider>
//     </AppContext.Provider>
//   );
export default AuthProvider;
