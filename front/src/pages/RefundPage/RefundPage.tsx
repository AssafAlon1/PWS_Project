import React, { useEffect, useState } from 'react';
import { Form, Button, FloatingLabel, Alert, Container } from 'react-bootstrap';
import ButtonWithTooltip from '../../components/ButtonWithTooltip/ButtonWithTooltip';
import { UserAction } from '../../types';
import UserActionApi from '../../api/userAction';
import ActionDetails from '../../components/UserActionDetails/UserActionDetails';
import { useLocation, useNavigate } from 'react-router-dom';
import { SUCCESS_PATH, USERSPACE_PATH } from '../../paths';

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
        setUserAction(fetchedAction);
        setLoading(false);
    }

    const handleRefund = async () => {
        setErrorText("");
        setLoading(true);
        try {
            await UserActionApi.refundPurchase(purchaseId);
            setLoading(false);
            navigate(SUCCESS_PATH, { state: { message: "Refund was successful!", operationType: "refund", order_id: purchaseId } })
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
        <Container style={{ minWidth: "660px" }}>
            <h1>Refund Page</h1>
            <ButtonWithTooltip
                tooltipContent="Visit your User Space to find it."
                buttonContent="I don't know my purchase ID"
                buttonOnClick={() => { navigate(USERSPACE_PATH) }}
                isDisabled={false}
            />
            <hr />
            <Form>
                <div style={{ display: "flex", justifyContent: "center" }} className="mb-2 direction-row">
                    <Form.Group controlId="purchaseId" className="me-2">
                        <FloatingLabel label="Purchase ID">
                            <Form.Control
                                style={{ minWidth: "400px" }}
                                type="text"
                                value={purchaseId}
                                onChange={handlePurchaseIdChange}
                                placeholder="Purchase ID" />
                        </FloatingLabel>
                    </Form.Group>
                    <Button
                        style={{}}
                        disabled={isLoading}
                        onClick={updateUserAction}>
                        Find Purchase Details
                    </Button>
                </div>
                {userAction && <ActionDetails action={userAction} onRefund={handleRefund} isLoadingRefund={isLoading} csevent={null} />}
            </Form>
            <Alert variant="danger" show={errorText !== ""} onClose={() => setErrorText("")} dismissible>{errorText}</Alert>
        </Container>
    );
};

export default RefundPage;