export interface NavbarLink {
    label: string;
    href: string;
}

export interface SharedNavbarProps {
    title?: string;
    subtitle?: string;
    centerLinks?: NavbarLink[];
    userProfile?: ReactNode;
    userName?: string;
    userRole?: string;
    logoutHref?: string;
}
