import { Logo } from "../ui/Logo";
import { SearchBar } from "../ui/SearchBar";
import { Hamburger } from "../ui/Hamburger";

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onHelpClick: () => void;
  onLoginClick: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function Header({ 
  cartCount, 
  onCartClick,
  onHelpClick,
  onLoginClick,
  searchQuery,
  setSearchQuery
}: HeaderProps) {
  return (
    <div className="content-stretch flex gap-[24px] items-start max-w-[1280px] relative shrink-0 w-full" data-name="Header">
      <Logo />
      <div className="basis-0 content-stretch flex gap-[24px] grow items-center min-h-px min-w-px relative self-stretch shrink-0">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <Hamburger 
          cartCount={cartCount} 
          onCartClick={onCartClick} 
          onHelpClick={onHelpClick} 
          onLoginClick={onLoginClick} 
        />
      </div>
    </div>
  );
}