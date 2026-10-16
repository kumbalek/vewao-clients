import LoginTemplate from "@modules/account/templates/login-template"

// Next 16 requires a default for every parallel route slot. A signed-out
// visitor opening an account page directly (e.g. /account/orders) signs in here.
export default function Default() {
  return <LoginTemplate />
}
