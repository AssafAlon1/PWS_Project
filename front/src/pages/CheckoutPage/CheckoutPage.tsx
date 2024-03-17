import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PurchaseDetails } from '../../types';
import { Button } from 'react-bootstrap';


const CheckoutPage: React.FC = () => {

    const location = useLocation();
    const purchaseDetails: PurchaseDetails | undefined = location.state?.purchaseDetails;
    const navigate = useNavigate();

    const areDetailsProvided = purchaseDetails && purchaseDetails.eventId && purchaseDetails.name && purchaseDetails.quantity && purchaseDetails.price;

    useEffect(() => {
        if (!purchaseDetails || !purchaseDetails.eventId || !purchaseDetails.name || !purchaseDetails.quantity || !purchaseDetails.price) {
            navigate("/error", { state: { message: "No purchase details found" } });
        }
    }, [purchaseDetails, navigate]);

    const detailsDiv = <div>
        <h1>Checkout Page</h1>
        <h2>Product Information</h2>
        <p>Event: {purchaseDetails?.eventId}</p>
        <p>Tickets Type: {purchaseDetails?.name}</p>
        <p>Number of tickets: {purchaseDetails?.quantity}</p>
        <p>Total Price: ${(purchaseDetails?.price ?? 0) * (purchaseDetails?.quantity ?? 0)}</p>
        <h2>Credit Card Information</h2>
        <Button variant="primary">Submit</Button>
    </div >

    return (
        areDetailsProvided ? detailsDiv : <div>Loading...</div>
    );
};

export default CheckoutPage;