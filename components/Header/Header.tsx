"use client";
import { Search, Sun, Moon, BookText } from "lucide-react";
import { useTheme } from "next-themes";



export const Header = () => {

  const { setTheme, theme } = useTheme()
  const toggleTheme = () => setTheme(theme => (theme === "dark" ? "light" : "dark"))
  const isDarkMode = theme === "dark";
  return (
    <>
      {" "}
      <header className="flex items-center justify-between py-4 border-b">
        <div className="flex items-center gap-2">
          <BookText size={24} />
          <h1 className="text-xl font-bold">Markdown Converter</h1>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>
    </>
  );
};
