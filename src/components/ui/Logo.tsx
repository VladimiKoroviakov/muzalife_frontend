import imgLogoMuzaLife1 from "../../assets/images/Logo.png";

export function Logo() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-center justify-center relative self-stretch shrink-0 w-[219px]" data-name="Logo">
        <div className="absolute h-[79px] left-[calc(50%-0.127px)] top-[calc(50%-0.5px)] translate-x-[-50%] translate-y-[-50%] w-[84.746px]" data-name="Logo-Muza-life">
            <img alt="Muzalife Logo" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgLogoMuzaLife1} />
        </div>
    </div>
  );
}