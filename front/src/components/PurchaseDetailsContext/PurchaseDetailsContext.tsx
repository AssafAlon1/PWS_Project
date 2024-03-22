import React, { createContext, useState, useContext } from 'react';
import { PurchaseDetails } from '../../types';


interface PurchaseDetailsContextType {
    purchaseDetails: PurchaseDetails | null;
    setPurchaseDetails: (purchaseDetails: PurchaseDetails | null) => void;
}

const PurchaseDetailsContext = createContext<PurchaseDetailsContextType | null>(null);

export const PurchaseDetailsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetails | null>(null);

    return (
        <PurchaseDetailsContext.Provider value={{ purchaseDetails, setPurchaseDetails }}>
            {children}
        </PurchaseDetailsContext.Provider>
    );
};

export const usePurchaseDetails = () => {
    const context = useContext(PurchaseDetailsContext);
    if (!context) {
        throw new Error('usePurchaseDetails must be used within a purchaseDetailsProvider');
    }
    return context;
};
