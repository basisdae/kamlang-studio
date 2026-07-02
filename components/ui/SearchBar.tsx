type SearchBarProps = {
  placeholder?: string;
};

export default function SearchBar({
  placeholder = "ค้นหา...",
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-3 rounded-[22px] bg-white px-4 py-3 shadow-sm">
      <span className="text-lg text-black/35">🔍</span>
      <input
        className="w-full bg-transparent text-sm outline-none placeholder:text-black/35"
        placeholder={placeholder}
      />
    </div>
  );
}