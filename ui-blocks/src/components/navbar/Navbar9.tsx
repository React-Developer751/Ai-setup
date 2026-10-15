export default function Navbar9() {
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap sm:justify-start sm:flex-nowrap w-full py-3 bg-navbar-inverse">
        <nav className="max-w-340 w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center justify-between">
            <a className="flex-none text-xl font-semibold text-foreground-inverse focus:outline-hidden focus:opacity-80" href="#">Brand</a>
            <div className="sm:hidden">
              <button type="button" className="hs-collapse-toggle relative size-9 flex justify-center items-center gap-2 rounded-lg border border-line-inverse/30 text-foreground-inverse shadow-2xs hover:bg-plain/20 focus:outline-hidden focus:bg-plain/20" id="hs-navbar-dark-collapse" aria-expanded="false" aria-controls="hs-navbar-dark" aria-label="Toggle navigation" data-hs-collapse="#hs-navbar-dark">
                <svg className="hs-collapse-open:hidden shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="18" y2="18" /></svg>
                <svg className="hs-collapse-open:block hidden shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                <span className="sr-only">Toggle</span>
              </button>
            </div>
          </div>
          <div id="hs-navbar-dark" className="hidden hs-collapse overflow-hidden transition-all duration-300 basis-full grow sm:block" aria-labelledby="hs-navbar-dark-collapse" role="region">
            <div className="flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5">
              <a className="text-sm font-medium text-foreground-inverse focus:outline-hidden" href="#" aria-current="page">Landing</a>
              <a className="text-sm text-foreground-inverse/70 hover:text-foreground-inverse focus:outline-hidden focus:text-foreground-inverse" href="#">Account</a>
              <a className="text-sm text-foreground-inverse/70 hover:text-foreground-inverse focus:outline-hidden focus:text-foreground-inverse" href="#">Work</a>
              <a className="text-sm text-foreground-inverse/70 hover:text-foreground-inverse focus:outline-hidden focus:text-foreground-inverse" href="#">Blog</a>
            </div>
          </div>
        </nav>
      </header>

      <header className="flex flex-wrap sm:justify-start sm:flex-nowrap w-full py-3 bg-primary">
        <nav className="max-w-340 w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center justify-between">
            <a className="flex-none text-xl font-semibold text-foreground-inverse focus:outline-hidden focus:opacity-80" href="#">Brand</a>
            <div className="sm:hidden">
              <button type="button" className="hs-collapse-toggle relative size-9 flex justify-center items-center gap-2 rounded-lg border border-line-inverse/30 text-foreground-inverse shadow-2xs hover:bg-plain/20 focus:outline-hidden focus:bg-plain/20" id="hs-navbar-primary-collapse" aria-expanded="false" aria-controls="hs-navbar-primary" aria-label="Toggle navigation" data-hs-collapse="#hs-navbar-primary">
                <svg className="hs-collapse-open:hidden shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="18" y2="18" /></svg>
              <svg className="hs-collapse-open:block hidden shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
          </div>
          <div id="hs-navbar-primary" className="hidden hs-collapse overflow-hidden transition-all duration-300 basis-full grow sm:block" aria-labelledby="hs-navbar-primary-collapse" role="region">
            <div className="flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5">
              <a className="text-sm font-medium text-foreground-inverse focus:outline-hidden" href="#" aria-current="page">Landing</a>
              <a className="text-sm text-foreground-inverse/70 hover:text-foreground-inverse focus:outline-hidden focus:text-foreground-inverse" href="#">Account</a>
              <a className="text-sm text-foreground-inverse/70 hover:text-foreground-inverse focus:outline-hidden focus:text-foreground-inverse" href="#">Work</a>
              <a className="text-sm text-foreground-inverse/70 hover:text-foreground-inverse focus:outline-hidden focus:text-foreground-inverse" href="#">Blog</a>
            </div>
          </div>
        </nav>
      </header>
    </div>
  )
}
