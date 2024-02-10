"use client"
import { ButtonHTMLAttributes, FC, useState } from 'react'
import Button from './ui/Button'

interface SignOutButonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  
}

const SignOutButon: FC<SignOutButonProps> = ({...props}) => {
    const [isSigningOut ,setIsSigningOut] = useState<boolean>(false)
  return <Button {...props} variant='ghost'></Button>
}

export default SignOutButon