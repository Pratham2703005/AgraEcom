import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Message } from "../types";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  message: Message;
}

export const SearchBar = ({ searchQuery, setSearchQuery, message }: SearchBarProps) => {
  return (
    <div className="p-4 border-b dark:border-neutral-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search products..."
          className="!pl-10 pr-4 py-2 w-full border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {message.text && (
        <div className={`px-4 py-2 rounded-lg text-sm ${message.type === "success"
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}>
          {message.text}
        </div>
      )}
    </div>
  );
};