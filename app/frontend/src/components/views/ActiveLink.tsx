"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

interface ActiveLinkProps {
  href: string;
  activeClassName: string;
  inactiveClassName?: string;
  children: React.ReactNode;
}

export default function ActiveLink({ href, activeClassName, inactiveClassName = "", children, ...rest }: ActiveLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const className = isActive ? activeClassName : inactiveClassName;

  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}