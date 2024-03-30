import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { SpanningSpinnner } from '../SpinnerComponent/SpinnerComponent';

interface ButtonWithTooltipProps {
    buttonContent: string;
    tooltipContent: string;
    isDisabled: boolean;
    buttonOnClick?: () => void;
    isLoading?: boolean;
    buttonType?: "submit" | "reset" | "button";
    placement?: "top" | "right" | "bottom" | "left";
    variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | "link";
}

const ButtonWithTooltip: React.FC<ButtonWithTooltipProps> = ({ buttonContent, tooltipContent, isDisabled, buttonOnClick, isLoading, buttonType, placement, variant }) => {

    const buttonVariant = variant ?? "primary";

    const renderTooltip = (props: React.ComponentProps<typeof Tooltip>) => (
        <Tooltip id="button-tooltip" {...props}>
            {isDisabled ? tooltipContent : ""}
        </Tooltip>
    );

    let button;
    if (buttonType) {
        button = <Button disabled={isDisabled} variant={buttonVariant} type={buttonType}>{buttonContent}</Button>;
    } else {
        button = <Button disabled={isDisabled} variant={buttonVariant} onClick={buttonOnClick}>{buttonContent}</Button>;
    }

    if (isLoading) {
        return <Button disabled={true} variant={buttonVariant} onClick={buttonOnClick}>
            <SpanningSpinnner />
        </Button>
    }

    if (isDisabled || tooltipContent.includes("Error")) {
        return <OverlayTrigger
            placement={placement ?? "bottom"}
            delay={{ show: 50, hide: 50 }}
            overlay={renderTooltip}>
            <div>
                {button}
            </div>
        </OverlayTrigger>
    }

    return button;
}
export default ButtonWithTooltip;