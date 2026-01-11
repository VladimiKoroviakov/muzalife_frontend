import { Help } from "./icons/Help";
import { ContactsProduct } from "./ContactsProduct";
import { LocalMall } from "../../components/ui/icons/LocalMall";

interface HamburgerProps {
  cartCount: number;
  onCartClick: () => void;
  onHelpClick: () => void;
  onLoginClick: () => void;
}

export function Hamburger({ cartCount, onCartClick, onHelpClick, onLoginClick }: HamburgerProps) {
  return (
    <div className="bg-[#f2f2f2] box-border content-stretch flex gap-[20px] items-center justify-center px-[20px] py-[12px] relative rounded-[16px] shrink-0" data-name="Hamburger">
      <button className="cursor-pointer hover:opacity-70 transition-opacity">
        <Help onClick={onHelpClick} />
      </button>
      <button className="cursor-pointer hover:opacity-70 transition-opacity">
        <ContactsProduct onClick={onLoginClick} />
      </button>
      <button onClick={onCartClick} className="cursor-pointer hover:opacity-70 transition-opacity">
        <LocalMall count={cartCount} />
      </button>
    </div>
  );
}