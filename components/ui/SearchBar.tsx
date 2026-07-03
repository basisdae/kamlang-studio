import { Search } from "lucide-react";
import { KL_ICON_CLASS, KL_ICON_STROKE } from "../layout/navConfig";

type SearchBarProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export default function SearchBar({
  placeholder = "ค้นหา...",
  value,
  onChange,
}: SearchBarProps) {
  return (
    <div className="kl-search">
      <Search className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
      <input
        className="w-full bg-transparent text-[length:var(--kl-text-body)] text-kl-brown outline-none placeholder:text-kl-muted"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}
