import './App.css'
import { Route, Routes } from 'react-router-dom'
import CatalogPage from './pages/CatalogPage'
import EventDetails from './pages/EventDetailsPage'
import NavbarComponent from './components/Navbar/Navbar'
import NotFound from './pages/NotFound'

function App() {

  return (
    <>
      <NavbarComponent />
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
