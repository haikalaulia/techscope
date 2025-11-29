"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { navigationMenuConfig } from "@/configs/app.config";
import { useAppSelector } from "@/hooks/dispatch/dispatch";
import { useAppNameSpase } from "@/hooks/useAppNameSpace";
import { logout } from "@/stores/authSlice/authSlice";
import { clearOtp } from "@/stores/otpSlice/otpSlice";
import { cn } from "@/utils/classname";

export default function AppHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const namespace = useAppNameSpase();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50  backdrop-blur-sm p-6 border-b transition-all duration-200",
        isScrolled ? "border-b-border shadow-md" : "border-b-transparent"
      )}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-1">
          <Link href="/">
            <Image
              src="/favicon/Frame 2.png"
              alt="Logo"
              width={80}
              height={80}
            />
          </Link>
          <h1 className="text-3xl font-medium">Tecsope</h1>
        </div>

        <div className="flex items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList>
              {navigationMenuConfig?.items?.map((item) => (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuLink
                    href={item.href}
                    className={navigationMenuTriggerStyle()}
                  >
                    {item.title}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          {/* <Button
            onClick={() => {
              namespace.dispatch(clearOtp());
              namespace.dispatch(logout());
            }}
          >
            clear
          </Button> */}
          {/* <ThemeToggle />
          <LanguageDropdown />
          <NotificationDropdown /> */}
          {/* <UserDropdown /> */}
        </div>
      </div>
    </nav>
  );
}
