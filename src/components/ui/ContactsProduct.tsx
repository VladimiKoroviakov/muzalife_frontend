import { iconPaths } from './icons/iconPaths';

interface ContactsProductProps {
  onClick?: () => void;
}

export function ContactsProduct({ onClick }: ContactsProductProps) {
  return (
    <div onClick={onClick} className="relative shrink-0 size-[28px] cursor-pointer" data-name="contacts_product">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="contacts_product">
          <mask height="28" id="mask0_1_1740" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }} width="28" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="28" id="Bounding box" width="28" />
          </mask>
          <g mask="url(#mask0_1_1740)">
            <path d={iconPaths.contacts} fill="var(--fill-0, #4D4D4D)" id="contacts_product_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}
