import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  themes?: string[];
};

export function ThemeProvider(props: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme={props.defaultTheme || "system"}
      enableSystem={props.enableSystem !== false}
    >
      {props.children}
    </NextThemesProvider>
  )
}