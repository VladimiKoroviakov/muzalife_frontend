import { CloseIcon } from '../CloseButton';
import { CloseButtonProps } from '../../../types';

export function CloseButton({ onClick }: CloseButtonProps) {
    return (
        <div onClick={onClick} className="absolute box-border content-stretch flex gap-[20px] items-center justify-center px-[20px] py-[12px] right-[-0.5px] rounded-[16px] top-0 cursor-pointer hover:opacity-70 transition-opacity" data-name="Close">
            <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[16px]"/>
            <CloseIcon />
        </div>
    );
}
