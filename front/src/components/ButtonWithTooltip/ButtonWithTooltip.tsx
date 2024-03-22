import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

interface ButtonWithTooltipProps {
    buttonContent: string;
    tooltipContent: string;
    isDisabled: boolean;
    buttonOnClick: () => void;
}

const ButtonWithTooltip: React.FC<ButtonWithTooltipProps> = ({ buttonContent, tooltipContent, isDisabled, buttonOnClick }) => {

    const renderTooltip = (props: React.ComponentProps<typeof Tooltip>) => (
        <Tooltip id="button-tooltip" {...props}>
            {isDisabled ? tooltipContent : ""}
        </Tooltip>
    );

    const button = <Button disabled={isDisabled} variant="primary" onClick={buttonOnClick}>{buttonContent}</Button>;
    const overlay = isDisabled ? <OverlayTrigger
        placement="right"
        delay={{ show: 50, hide: 50 }}
        overlay={renderTooltip}>
        <div>
            {button}
        </div>
    </OverlayTrigger> : button;
    return overlay;
}
export default ButtonWithTooltip;