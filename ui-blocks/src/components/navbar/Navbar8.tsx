export default function Navbar8() {
  return (
    <header className="relative flex flex-wrap sm:justify-start sm:flex-nowrap w-full py-3 bg-navbar border-b border-navbar-line">
          <nav className="max-w-340 w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center justify-between">
          <a className="flex-none text-xl font-semibold text-foreground focus:outline-hidden focus:opacity-80" href="#" aria-label="Brand">
            Brand
          </a>
          <div className="sm:hidden">
            <button type="button" className="hs-collapse-toggle relative size-9 flex justify-center items-center gap-x-2 rounded-lg bg-layer border border-layer-line text-layer-foreground shadow-2xs hover:bg-layer-hover focus:outline-hidden focus:bg-layer-focus disabled:opacity-50 disabled:pointer-events-none" id="hs-navbar-example-collapse" aria-expanded="false" aria-controls="hs-navbar-example" aria-label="Toggle navigation" data-hs-collapse="#hs-navbar-example">
              <svg className="hs-collapse-open:hidden shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="18" y2="18" /></svg>
              <svg className="hs-collapse-open:block hidden shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              <span className="sr-only">Toggle navigation</span>
            </button>
          </div>
        </div>
        <div id="hs-navbar-example" className="hidden hs-collapse overflow-hidden transition-all duration-300 basis-full grow sm:block" aria-labelledby="hs-navbar-example-collapse" role="region">
          <div className="flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5">
            <a className="font-medium text-primary-active focus:outline-hidden" href="#" aria-current="page">Landing</a>
            <a className="text-sm text-navbar-nav-foreground hover:text-primary-hover focus:outline-hidden focus:text-primary-focus" href="#">Account</a>
            <a className="text-sm text-navbar-nav-foreground hover:text-primary-hover focus:outline-hidden focus:text-primary-focus" href="#">Work</a>
            <a className="text-sm text-navbar-nav-foreground hover:text-primary-hover focus:outline-hidden focus:text-primary-focus" href="#">Blog</a>
            <div className="hs-dropdown [--strategy:static] sm:[--strategy:fixed] [--adaptive:none] sm:[--adaptive:adaptive] ">
              <button id="hs-navbar-example-dropdown" type="button" className="hs-dropdown-toggle flex items-center w-full text-sm text-navbar-nav-foreground hover:text-primary-hover focus:outline-hidden focus:text-primary-focus" aria-haspopup="menu" aria-expanded="false" aria-label="Mega Menu">
                Dropdown
                <svg className="hs-dropdown-open:-rotate-180 sm:hs-dropdown-open:rotate-0 duration-300 ms-1 shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </button>

              <div className="hs-dropdown-menu transition-[opacity,margin] ease-in-out duration-150 hs-dropdown-open:opacity-100 opacity-0 sm:w-48 z-10 sm:bg-dropdown sm:border sm:border-dropdown-line sm:shadow-md rounded-lg p-1 space-y-1 before:absolute top-full before:-top-5 before:inset-s-0 before:w-full before:h-5 hidden" role="menu" aria-orientation="vertical" aria-labelledby="hs-navbar-example-dropdown">
                <a className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:outline-hidden focus:bg-dropdown-item-focus" href="#">
                  About
                </a>
                <div className="hs-dropdown [--strategy:static] sm:[--strategy:absolute] [--adaptive:none] relative">
                  <button id="hs-navbar-example-dropdown-sub" type="button" className="hs-dropdown-toggle w-full flex justify-between items-center text-sm text-dropdown-item-foreground rounded-lg py-2 px-3 hover:bg-dropdown-item-hover focus:outline-hidden focus:bg-dropdown-item-focus">
                    Sub Menu
                    <svg className="hs-dropdown-open:-rotate-180 sm:hs-dropdown-open:-rotate-90 sm:-rotate-90 duration-300 ms-2 shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </button>

                  <div className="hs-dropdown-menu transition-[opacity,margin] ease-in-out duration-150 hs-dropdown-open:opacity-100 opacity-0 sm:w-48 hidden z-10 sm:mt-2 sm:bg-dropdown sm:border sm:border-dropdown-line sm:shadow-md rounded-lg before:absolute before:-inset-e-5 before:top-0 before:h-full before:w-5 sm:mx-2.5! top-0 inset-e-full" role="menu" aria-orientation="vertical" aria-labelledby="hs-navbar-example-dropdown-sub">
                    <div className="p-1 space-y-1">
                      <a className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:outline-hidden focus:bg-dropdown-item-focus" href="#">
                        About
                      </a>
                      <a className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:outline-hidden focus:bg-dropdown-item-focus" href="#">
                        Downloads
                      </a>
                      <a className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:outline-hidden focus:bg-dropdown-item-focus" href="#">
                        Team Account
                      </a>
                    </div>
                  </div>
                </div>
                <a className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:outline-hidden focus:bg-dropdown-item-focus" href="#">
                  Downloads
                </a>
                <a className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:outline-hidden focus:bg-dropdown-item-focus" href="#">
                  Team Account
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
