import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CatalogPage from '../../pages/CatalogPage/CatalogPage'
import EventDetails from '../../pages/EventDetailsPage/EventDetailsPage'
import NavbarComponent from '../../components/Navbar/Navbar'
import NotFound from '../../pages/NotFound'
import ErrorPage from '../../pages/ErrorPage'
import CheckoutPage from '../../pages/CheckoutPage/CheckoutPage'
import SuccessPage from '../../pages/SuccessPage'
import { LoginPage } from '../../pages/LoginPage/LoginPage'
import { SignUpPage } from '../../pages/SignupPage/SignupPage'

function CSRouter() {

    return (
        <>
            <BrowserRouter>
                <NavbarComponent />
                <Routes>
                    <Route path="/" element={<CatalogPage />} />
                    <Route path="/events/:eventId" element={<EventDetails />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/success" element={<SuccessPage />} />
                    <Route path="/error" element={<ErrorPage />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default CSRouter
