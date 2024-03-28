import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { SpanningSpinnner } from '../SpinnerComponent/SpinnerComponent';

interface ButtonWithTooltipProps {
    buttonContent: string;
    tooltipContent: string;
    isDisabled: boolean;
    buttonOnClick: () => void;
    isLoading?: boolean;
}

const ButtonWithTooltip: React.FC<ButtonWithTooltipProps> = ({ buttonContent, tooltipContent, isDisabled, buttonOnClick, isLoading }) => {

    const renderTooltip = (props: React.ComponentProps<typeof Tooltip>) => (
        <Tooltip id="button-tooltip" {...props}>
            {isDisabled ? tooltipContent : ""}
        </Tooltip>
    );

    const button = <Button disabled={isDisabled} variant="primary" onClick={buttonOnClick}>{buttonContent}</Button>;

    if (isLoading) {
        return <Button disabled={true} variant="primary" onClick={buttonOnClick}>
            <SpanningSpinnner />
        </Button>
    }

    const overlay = isDisabled ? <OverlayTrigger
        placement="bottom"
        delay={{ show: 50, hide: 50 }}
        overlay={renderTooltip}>
        <div>
            {button}
        </div>
    </OverlayTrigger> : button;
    return overlay;
}
export default ButtonWithTooltip;