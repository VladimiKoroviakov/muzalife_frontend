type AuthRedirectLinkProps = {
  text: string;
  linkText: string;
  onClick?: () => void;
};

export function AuthRedirectLink({ text, linkText, onClick }: AuthRedirectLinkProps) {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0" data-name="Auth Redirect">
      <div className="flex flex-col justify-end leading-[0] relative shrink-0 text-[16px] text-black text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="leading-[normal] whitespace-pre">
          <span className="text-[#4d4d4d]">{text}</span>{" "}
          <span
            onClick={onClick}
            className="[text-underline-position:from-font] decoration-solid font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Regular','Noto_Sans:Bold',sans-serif] text-[#0031ff] underline cursor-pointer hover:opacity-70 transition-opacity"
            style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
          >
            {linkText}
          </span>
        </p>
      </div>
    </div>
  );
}