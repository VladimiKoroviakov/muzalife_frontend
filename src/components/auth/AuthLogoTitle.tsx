import imgMuzaLifeLogo from "../../assets/images/Logo.png"; 
import { AuthLogoTitleProps } from "../../types";

export function AuthLogoTitle({ children, logoSize = 160 }: AuthLogoTitleProps) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0" data-name="Logo & Title">
      <div 
        className="relative shrink-0"
        style={{ width: logoSize, height: logoSize }}
        data-name="Muza Life Logo"
      >
        <img 
          alt="Muza Life" 
          className="size-full object-contain pointer-events-none" 
          src={imgMuzaLifeLogo} 
          loading="eager"
        />
      </div>
      {children}
    </div>
  );
}