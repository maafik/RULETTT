import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
      <input
        type="text"
        placeholder="Найти музыканта или группу"
        className="w-full rounded-[20px] bg-search-bg py-4 pl-12 pr-4 text-base outline-none transition-all focus:ring-2 focus:ring-primary"
      />
    </div>
  );
};

export default SearchBar;
