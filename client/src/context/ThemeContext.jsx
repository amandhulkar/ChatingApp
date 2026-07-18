/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const getThemeKey = () => {
  const token = localStorage.getItem("token");
  if (!token) return "theme";

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return decoded?.userId ? `theme:${decoded.userId}` : "theme";
  } catch (error) {
    return "theme";
  }
};

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(getThemeKey());
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

  return "light";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDark = theme === "dark";

  useEffect(() => {
    const handleAuthTokenChange = () => {
      setTheme(getInitialTheme());
    };

    window.addEventListener("authTokenChanged", handleAuthTokenChange);
    window.addEventListener("storage", handleAuthTokenChange);

    return () => {
      window.removeEventListener("authTokenChanged", handleAuthTokenChange);
      window.removeEventListener("storage", handleAuthTokenChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem(getThemeKey(), theme);
  }, [theme, isDark]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
