import React, { useEffect, useState } from 'react';
import { Form, Button, FloatingLabel, Alert } from 'react-bootstrap';
import ButtonWithTooltip from '../../components/ButtonWithTooltip/ButtonWithTooltip';
import { UserAction } from '../../types';
import UserActionApi from '../../api/userAction';
import ActionDetails from '../../components/UserActionDetails/UserActionDetails';
import { useLocation, useNavigate } from 'react-router-dom';

const RefundPage: React.FC = () => {
    const [purchaseId, setPurchaseId] = useState<string>("");
    const [userAction, setUserAction] = useState<UserAction | null>(null);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [errorText, setErrorText] = useState<string>("");

    const location = useLocation();
    const statePurchaseId = location.state?.purchase_id ?? "";
    const navigate = useNavigate();

    const encodedPurchaseId = encodeURIComponent(purchaseId);

    const handlePurchaseIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPurchaseId(e.target.value);
    };

    const updateUserAction = async () => {
        if (!purchaseId) {
            return;
        }
        setErrorText("");
        setLoading(true);
        setUserAction(null);
        let fetchedAction: UserAction;
        try {
            fetchedAction = await UserActionApi.getUserActionByPurchaseId(encodedPurchaseId);
        }
        catch (error) {
            console.error("Failed to fetch user action");
            setErrorText("Failed to fetch purchase " + purchaseId);
            setLoading(false);
            return;
        }
        console.log("Got Action");
        console.log(fetchedAction);
        setUserAction(fetchedAction);
        setLoading(false);
    }

    const handleRefund = async () => {
        setErrorText("");
        setLoading(true);
        try {
            console.log(encodedPurchaseId);
            await UserActionApi.refundPurchase(purchaseId);
            setLoading(false);
            navigate("/success", { state: { message: "Refund was successful!", operationType: "refund", order_id: purchaseId } })
        }
        catch (error) {
            console.error("Failed to refund purchase");
            setErrorText("Failed to refund purchase " + purchaseId);
            setLoading(false);
            return;
        }
    }

    useEffect(() => {
        if (statePurchaseId) {
            setPurchaseId(statePurchaseId);
            // updateUserAction();
        }
    }, [statePurchaseId]);

    return (
        <>
            <h1>Refund Page</h1>
            <ButtonWithTooltip
                tooltipContent="Visit your User Space to find it."
                buttonContent="I don't know my purchase ID"
                buttonOnClick={() => { }}
                isDisabled={true}
            />
            <hr />
            <Form>
                <Form.Group controlId="purchaseId" className="mb-2 direction-row">
                    <FloatingLabel label="Purchase ID">
                        <Form.Control type="text" value={purchaseId} onChange={handlePurchaseIdChange} placeholder="Purchase ID" />
                    </FloatingLabel>
                </Form.Group>

                <Button disabled={isLoading} onClick={updateUserAction}>Find Purchase Details</Button>
                {userAction && <ActionDetails action={userAction} onRefund={handleRefund} isLoadingRefund={isLoading} />}
            </Form>
            <Alert variant="danger" show={errorText !== ""} onClose={() => setErrorText("")} dismissible>{errorText}</Alert>

        </>
    );
};

export default RefundPage;