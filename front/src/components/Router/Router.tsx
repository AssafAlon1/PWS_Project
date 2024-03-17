import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CatalogPage from '../../pages/CatalogPage/CatalogPage'
import EventDetails from '../../pages/EventDetailsPage/EventDetailsPage'
import NavbarComponent from '../../components/Navbar/Navbar'
import NotFound from '../../pages/NotFound'
import ErrorPage from '../../pages/ErrorPage'

function CSRouter() {

    return (
        <>
            <BrowserRouter>
                <NavbarComponent />
                <Routes>
                    <Route path="/" element={<CatalogPage />} />
                    <Route path="/events/:eventId" element={<EventDetails />} />
                    <Route path="/error" element={<ErrorPage />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default CSRouter
