import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="pb-6 pt-16 lg:pb-8 lg:pt-24">
      <div className="px-4 lg:px-8">
        <div className="md:flex md:items-start md:justify-between">
          <a
            href="/"
            className="flex items-center gap-x-2"
            aria-label="HabitBet"
          >
            <Logo />
          </a>
          {/* <ul className="flex list-none mt-6 md:mt-0 space-x-3">
            {socialLinks.map((link, i) => (
              <li key={i}>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  asChild
                >
                  <a href={link.href} target="_blank" aria-label={link.label}>
                    {link.icon}
                  </a>
                </Button>
              </li>
            ))}
          </ul> */}
        </div>
        <div className="border-t mt-6 pt-6 md:mt-4 md:pt-8 lg:grid lg:grid-cols-10">
          <nav className="lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-2 lg:justify-end">
              <li key="how_it_works" className="my-1 mx-2 shrink-0">
                <a
                  href="#how-it-works"
                  className="text-sm text-slate-900 underline-offset-4 hover:underline dark:text-slate-50"
                >
                  How It Works
                </a>
              </li>
              <li key="testimonials" className="my-1 mx-2 shrink-0">
                <a
                  href="#testimonials"
                  className="text-sm text-slate-900 underline-offset-4 hover:underline dark:text-slate-50"
                >
                  Testimonials
                </a>
              </li>
              <li key="pricing" className="my-1 mx-2 shrink-0">
                <a
                  href="#pricing"
                  className="text-sm text-slate-900 underline-offset-4 hover:underline dark:text-slate-50"
                >
                  Pricing
                </a>
              </li>
              <li key="faq" className="my-1 mx-2 shrink-0">
                <a
                  href="#faq"
                  className="text-sm text-slate-900 underline-offset-4 hover:underline dark:text-slate-50"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </nav>
          {/* <div className="mt-6 lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-3 lg:justify-end">
              {legalLinks.map((link, i) => (
                <li key={i} className="my-1 mx-3 shrink-0">
                  <a
                    href={link.href}
                    className="text-sm text-slate-500 underline-offset-4 hover:underline dark:text-slate-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div> */}
          <div className="mt-6 text-sm leading-6 text-slate-500 whitespace-nowrap lg:mt-0 lg:row-[1/3] lg:col-[1/4] dark:text-slate-400">
            <div>Copyright © 2025 HabitBet</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
