import {NavLink} from "react-router-dom"
import type {ReactNode} from "react";
import "./NavigationBarItem.css";

type NavigationBarItemProp = {
  to: string
  icon: ReactNode
  end?: boolean
}

export const NavigationBarItem = ({
  to,
  icon,
  end,
  }: NavigationBarItemProp) => {
  return (
    <NavLink
      to={to}
      end={end}
      className="nav-link"
    >
      {icon}
    </NavLink>
  )
}