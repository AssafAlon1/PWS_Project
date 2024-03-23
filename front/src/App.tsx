import './App.css'
import CSRouter from './components/Router/Router'
import { PurchaseDetailsProvider } from './components/PurchaseDetailsContext/PurchaseDetailsContext';

function App() {


  return (
    <PurchaseDetailsProvider>
      <CSRouter />
    </PurchaseDetailsProvider>
  );
}

export default App
