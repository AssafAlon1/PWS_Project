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
import { CATALOG_PATH, CHECKOUT_PATH, ERROR_PATH, EVENT_PATH, LOGIN_PATH, NEW_EVENT_PATH, REFUND_PATH, SIGNUP_PATH, SUCCESS_PATH, USERSPACE_PATH } from '../../paths'

function CSRouter() {

    return (
        <BrowserRouter>
            <AuthProvider>
                <NavbarComponent />
                <Routes>
                    <Route element={<PrivateRoute />}>
                        <Route path={CATALOG_PATH} element={<CatalogPage />} />
                    </Route>
                    <Route element={<PrivateRoute />}>
                        <Route path={EVENT_PATH + "/:eventId"} element={<EventDetails />} />
                    </Route>
                    <Route element={<PrivateRoute />}>
                        <Route path={CHECKOUT_PATH} element={<CheckoutPage />} />
                    </Route>
                    <Route element={<PrivateRoute />}>
                        <Route path={SUCCESS_PATH} element={<SuccessPage />} />
                    </Route>
                    <Route element={<PrivateRoute />}>
                        <Route path={USERSPACE_PATH} element={<UserSpacePage />} />
                    </Route>
                    <Route element={<PrivateRoute />}>
                        <Route path={REFUND_PATH} element={<RefundPage />} />
                    </Route>
                    {/* TODO - add privileged route! */}
                    <Route path={NEW_EVENT_PATH} element={<NewEventPage />} />
                    <Route path={LOGIN_PATH} element={<LoginPage />} />
                    <Route path={SIGNUP_PATH} element={<SignUpPage />} />
                    <Route path={ERROR_PATH } element={<ErrorPage />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}
export default CSRouter
