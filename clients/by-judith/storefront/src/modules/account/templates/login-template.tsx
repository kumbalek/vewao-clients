"use client"

import { useState } from "react"

import Login from "@modules/account/components/login"
import Register from "@modules/account/components/register"
import RequestPasswordReset from "@modules/account/components/request-password-reset"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
  RESET = "reset",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(LOGIN_VIEW.SIGN_IN)

  return (
    <div className="flex w-full max-w-sm justify-center">
      {currentView === LOGIN_VIEW.SIGN_IN && <Login setCurrentView={setCurrentView} />}
      {currentView === LOGIN_VIEW.REGISTER && <Register setCurrentView={setCurrentView} />}
      {currentView === LOGIN_VIEW.RESET && <RequestPasswordReset setCurrentView={setCurrentView} />}
    </div>
  )
}

export default LoginTemplate
