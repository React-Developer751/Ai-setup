export default function Navbar1() {
  return (
    <header className="flex flex-wrap sm:justify-start sm:flex-nowrap w-full py-3 bg-navbar border-b border-navbar-line">
      <nav className="max-w-340 w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
        <a className="flex-none font-semibold text-xl text-foreground focus:outline-hidden focus:opacity-80" href="#" aria-label="Brand">Brand</a>
        <div className="flex flex-row items-center gap-5 mt-5 sm:justify-end sm:mt-0 sm:ps-5">
          <a className="text-sm font-medium text-primary-active focus:outline-hidden" href="#" aria-current="page">Landing</a>
          <a className="text-sm text-navbar-nav-foreground hover:text-primary-hover focus:outline-hidden focus:text-primary-focus" href="#">Account</a>
          <a className="text-sm text-navbar-nav-foreground hover:text-primary-hover focus:outline-hidden focus:text-primary-focus" href="#">Work</a>
          <a className="text-sm text-navbar-nav-foreground hover:text-primary-hover focus:outline-hidden focus:text-primary-focus" href="#">Blog</a>
        </div>
      </nav>
    </header>
  )
}
