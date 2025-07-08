"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function SaveUserNameToLocalStorage() {
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.user?.name) {
      window.localStorage.setItem("userName", session.user.name);
    }
  }, [session]);
  return null;
}
