"use client";
import { ButtonHTMLAttributes, FC, useState } from "react";
import Button from "./ui/Button";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { Loader2, LogOut } from "lucide-react";

interface SignOutButonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const SignOutButton: FC<SignOutButonProps> = ({ ...props }) => {
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  return <Button {...props} variant="ghost" onClick={async () => {
    setIsSigningOut(true)
    try {
        await signOut()
    } catch (error) {
        toast.error("There was a problem signing out")
    }finally{
        setIsSigningOut(false)
    }
  }}> {isSigningOut?(<Loader2 size={32} className="animate-spin h-4 w-4"/>):(<LogOut className="w-4 h-4 text-black hover:shadow-red-600 hover:text-red-500"/>)}</Button>;
};

export default SignOutButton;
