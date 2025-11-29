"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/core/providers/auth.provider";
import { LanguageProvider } from "@/core/providers/languageProvider";
import { ThemeProvider } from "@/core/providers/theme.provider";
import { AlertProvinder } from "@/hooks/useAlert/costum-alert";
import { ReactQueryClientProvider } from "@/pkg/react-query/query-client.pkg";
import { persistor, store } from "@/stores/store";

import { composeProviders } from "./composeProvinders";

const Providers = composeProviders([
  ({ children }) => (
    <SidebarProvider defaultOpen={false}>{children}</SidebarProvider>
  ),
  ({ children }) => <Provider store={store}>{children}</Provider>,
  ({ children }) => <PersistGate persistor={persistor}>{children}</PersistGate>,
  AuthProvider,
  ThemeProvider,
  LanguageProvider,
  AlertProvinder,
  ReactQueryClientProvider,
]);

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 900,
        }}
      />
    </Providers>
  );
}
