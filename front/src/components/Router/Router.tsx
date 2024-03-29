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
import AuthProvider from '../AuthProvider/AuthProvider'
import PrivateRoute from '../PrivateRoute/PrivateRoute'
import UserSpacePage from '../../pages/UserSpacePage/UserSpacePage'
import RefundPage from '../../pages/RefundPage/RefundPage'
import NewEventPage from '../../pages/NewEventPage/NewEventPage'
function CSRouter() {

    return (
        <BrowserRouter>
            <AuthProvider>
                <NavbarComponent />
                <Routes>
                    <Route element={<PrivateRoute />}>
                        <Route path="/" element={<CatalogPage />} />
                    </Route>
                    <Route element={<PrivateRoute />}>
                        <Route path="/events/:eventId" element={<EventDetails />} />
                    </Route>
                    <Route element={<PrivateRoute />}>
                        <Route path="/checkout" element={<CheckoutPage />} />
                    </Route>
                    <Route element={<PrivateRoute />}>
                        <Route path="/success" element={<SuccessPage />} />
                    </Route>
                    <Route element={<PrivateRoute />}>
                        <Route path="/userspace" element={<UserSpacePage />} />
                    </Route>
                    <Route element={<PrivateRoute />}>
                        <Route path="/refund" element={<RefundPage />} />
                    </Route>
                    {/* TODO - add privileged route! */}
                    <Route path="/newevent" element={<NewEventPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/error" element={<ErrorPage />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}
export default CSRouter
