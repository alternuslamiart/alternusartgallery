import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "./primitives";

const NAV_LINKS = [
  { href: "/studio-ai#studios", label: "Studios" },
  { href: "/studio-ai#showcase", label: "Showcase" },
  { href: "/studio-ai#workflow", label: "Workflow" },
  { href: "/ui-kit", label: "UI Kit" },
  { href: "/pricing", label: "Pricing" },
];

export function SoftNav({ active }: { active?: string }) {
  return (
    <header className="sui-nav sui-glass">
      <Link href="/studio-ai" className="sui-brand" aria-label="Casynus home">
        <span className="sui-brand-mark" aria-hidden />
        Casynus
      </Link>
      <nav className="sui-nav-links" aria-label="Primary">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`sui-nav-link${active === link.label ? " is-active" : ""}`}
            aria-current={active === link.label ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <ButtonLink href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
          Sign in
        </ButtonLink>
        <ButtonLink href="/casynus" variant="primary" size="sm" trailingIcon={ArrowRight}>
          Start creating
        </ButtonLink>
      </div>
    </header>
  );
}

const FOOTER_GROUPS = [
  {
    title: "Studios",
    links: [
      { href: "/casynus", label: "3D Architecture Studio" },
      { href: "/interior", label: "Interior Floor Planning" },
      { href: "/infrastructure", label: "Infrastructure & Site" },
      { href: "/aichat", label: "AI Assistant" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/ui-kit", label: "Design System" },
      { href: "/download", label: "Download" },
      { href: "/security", label: "Security" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/careers", label: "Careers" },
      { href: "/press", label: "Press" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/cookie-notice", label: "Cookies" },
      { href: "/accessibility", label: "Accessibility" },
    ],
  },
];

export function SoftFooter() {
  return (
    <footer className="relative mt-8 border-t border-[var(--sui-line)] pb-10 pt-20">
      <div className="sui-container">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Link href="/studio-ai" className="sui-brand">
              <span className="sui-brand-mark" aria-hidden />
              Casynus
            </Link>
            <p className="sui-small mt-4">
              A calm, generative workspace for architecture, interior design, and infrastructure planning.
            </p>
          </div>
          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <div className="sui-overline mb-4">{group.title}</div>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[0.875rem] text-[var(--sui-text-2)] no-underline transition-colors duration-200 hover:text-[var(--sui-text)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <hr className="sui-divider my-12" />
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="sui-small">© {new Date().getFullYear()} Casynus. All rights reserved.</p>
          <p className="sui-small max-w-md sm:text-right">
            AI-generated designs are concepts. Professional use requires review by a licensed architect or engineer.
          </p>
        </div>
      </div>
    </footer>
  );
}
