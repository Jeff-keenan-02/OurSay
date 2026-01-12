import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { neoDarkTheme, neoLightTheme } from "../theme/theme";

type ThemeMode = "light" | "dark" | "system";

type ThemeContextType = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  theme: typeof neoDarkTheme;
};

const ThemeModeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeModeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme(); // "light" | "dark" | null
  const [mode, setMode] = useState<ThemeMode>("system");

  const theme = useMemo(() => {
    const effective =
      mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;
    return effective === "dark" ? neoDarkTheme : neoLightTheme;
  }, [mode, systemScheme]);

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, theme }}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode must be used inside ThemeModeProvider");
  return ctx;
};