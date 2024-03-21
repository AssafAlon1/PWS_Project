import { useState, createContext, useEffect } from 'react';
import './App.css'
import CSRouter from './components/Router/Router'
import { getClosestEvent } from './utils/fetchers';
import { getFormattedDateTime } from './utils/formatting';
import { PurchaseDetailsProvider } from './components/PurchaseDetailsContext/PurchaseDetailsContext';

interface AppContextProps {
  user: string | null;
  setUser: (user: string | null) => void;
  nextEvent: string | null;
  updateNextEvent: () => void; // TODO - CSEvent?
}

export const AppContext = createContext<AppContextProps>({
  user: null,
  setUser: () => { },
  nextEvent: null,
  updateNextEvent: () => { },
});

function App() {

  // TODO - user to interface?
  const [user, setUser] = useState<string | null>(null);
  const [nextEvent, setNextEvent] = useState<string | null>(null); // TODO - CSEvent

  const updateNextEvent = async () => {
    if (!user) {
      console.log("No user found, can't update next event");
      return;
    }
    const closestEvent = await getClosestEvent(user);
    if (closestEvent) {
      setNextEvent(`${closestEvent.name} (${getFormattedDateTime(closestEvent.start_date)})`);
    }
  }

  useEffect(() => {
    setUser("DrawBow");
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }
    console.log("User changed - it's " + user + " now")
    updateNextEvent();
  }, [user]);

  return (
    <AppContext.Provider value={{ user, setUser, nextEvent, updateNextEvent }}>
      <PurchaseDetailsProvider>
        <CSRouter />
      </PurchaseDetailsProvider>
    </AppContext.Provider>
  );
}

export default App
