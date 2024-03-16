import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CatalogPage from './pages/CatalogPage/CatalogPage'
import EventDetails from './pages/EventDetailsPage/EventDetailsPage'
import NavbarComponent from './components/Navbar/Navbar'
import NotFound from './pages/NotFound'

function App() {

  return (
    <>
      <BrowserRouter>
        <NavbarComponent />
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/events/:eventId" element={<EventDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
