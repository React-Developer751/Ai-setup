export default function Header4() {
  // ========== HEADER ========== 
  return (
    <header className="flex flex-wrap md:flex-col md:justify-start md:flex-nowrap z-50 w-full bg-navbar border-b border-navbar-line">
      {/* Topbar */}
      <div className="max-w-340 mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex-1 flex items-center justify-end gap-x-3 pt-2">
          <a className="inline-flex justify-center items-center gap-x-2 font-medium text-sm text-navbar-nav-foreground hover:text-muted-foreground-1 focus:outline-hidden focus:text-muted-foreground-1" href="#">
            <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.54 15H17a2 2 0 0 0-2 2v4.54" /><path d="M7 3.34V5a3 3 0 0 0 3 3v0a2 2 0 0 1 2 2v0c0 1.1.9 2 2 2v0a2 2 0 0 0 2-2v0c0-1.1.9-2 2-2h3.17" /><path d="M11 21.95V18a2 2 0 0 0-2-2v0a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05" /><circle cx="12" cy="12" r="10" /></svg>
            English (US)
          </a>

          {/* Button Group */}
          <div className="flex flex-wrap items-center gap-x-1.5">
            <a className="py-2 px-2.5 inline-flex items-center font-medium text-sm rounded-lg bg-layer border border-layer-line text-layer-foreground shadow-2xs hover:bg-layer-hover disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-layer-focus" href="#">
              Sign in
            </a>
            <a className="py-2 px-2.5 inline-flex items-center font-medium text-sm rounded-lg bg-primary text-white hover:bg-primary-hover focus:outline-hidden focus:bg-primary-focus disabled:opacity-50 disabled:pointer-events-none" href="#">
              Get started
            </a>
          </div>
          {/* End Button Group */}
        </div>
      </div>
      {/* End Topbar */}
      <nav className="relative max-w-340 w-full mx-auto md:flex md:items-center md:justify-between md:gap-3 py-2 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-x-1">
          <a className="flex-none font-semibold text-xl text-foreground focus:outline-hidden focus:opacity-80" href="#" aria-label="Brand">Brand</a>

          {/* Collapse Button */}
          <button type="button" className="hs-collapse-toggle md:hidden relative size-9 flex justify-center items-center font-medium text-sm rounded-lg bg-layer border border-layer-line text-layer-foreground hover:bg-layer-hover focus:outline-hidden focus:bg-layer-focus disabled:opacity-50 disabled:pointer-events-none" id="hs-header-base-collapse" aria-expanded="false" aria-controls="hs-header-base" aria-label="Toggle navigation" data-hs-collapse="#hs-header-base">
            <svg className="hs-collapse-open:hidden size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="18" y2="18" /></svg>
            <svg className="hs-collapse-open:block shrink-0 hidden size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            <span className="sr-only">Toggle navigation</span>
          </button>
          {/* End Collapse Button */}
        </div>

        {/* Collapse */}
        <div id="hs-header-base" className="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow md:block " role="region" aria-labelledby="hs-header-base-collapse">
          <div className="overflow-hidden overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-track]:bg-scrollbar-track [&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb">
            <div className="py-2 md:py-0  flex flex-col md:flex-row md:items-center gap-0.5 md:gap-1">
              <div className="grow">
                <div className="flex flex-col md:flex-row md:justify-end md:items-center gap-0.5 md:gap-1">
                  <a className="p-2 flex items-center text-sm bg-navbar-nav-active text-navbar-nav-foreground hover:bg-navbar-nav-hover rounded-lg focus:outline-hidden focus:bg-navbar-nav-focus" href="#" aria-current="page">
                    <svg className="shrink-0 size-4 me-3 md:me-2 block md:hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                    Landing
                  </a>

                  {/* Dropdown */}
                  <div className="hs-dropdown [--strategy:static] md:[--strategy:fixed] [--adaptive:none] md:[--adaptive:adaptive] [--is-collapse:true] md:[--is-collapse:false] ">
                    <button id="hs-header-base-dropdown" type="button" className="hs-dropdown-toggle w-full p-2 flex items-center text-sm text-navbar-nav-foreground hover:bg-navbar-nav-hover rounded-lg focus:outline-hidden focus:bg-navbar-nav-focus" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
                      <svg className="shrink-0 size-4 me-3 md:me-2 block md:hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 10 2.5-2.5L3 5" /><path d="m3 19 2.5-2.5L3 14" /><path d="M10 6h11" /><path d="M10 12h11" /><path d="M10 18h11" /></svg>
                      Dropdown
                      <svg className="hs-dropdown-open:-rotate-180 md:hs-dropdown-open:rotate-0 duration-300 shrink-0 size-4 ms-auto md:ms-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </button>

                    <div className="hs-dropdown-menu transition-[opacity,margin] duration-[0.1ms] md:duration-150 hs-dropdown-open:opacity-100 opacity-0 relative w-full md:w-52 hidden z-10 top-full ps-7 md:ps-0 md:bg-dropdown md:border md:border-dropdown-line md:rounded-lg md:shadow-md before:absolute before:-top-4 before:inset-s-0 before:w-full before:h-5 md:after:hidden after:absolute after:top-1 after:inset-s-4.5 after:h-[calc(100%-4px)] after:border-s after:border-navbar-nav-list-divider" role="menu" aria-orientation="vertical" aria-labelledby="hs-header-base-dropdown">
                      <div className="py-1 md:px-1 space-y-0.5">
                        <a className="p-2 md:px-3 flex items-center text-sm text-dropdown-item-foreground rounded-lg hover:bg-dropdown-item-hover focus:outline-hidden focus:bg-dropdown-item-focus" href="#">
                          About
                        </a>

                        <div className="hs-dropdown [--strategy:static] md:[--strategy:absolute] [--adaptive:none] md:[--trigger:hover] [--is-collapse:true] md:[--is-collapse:false] relative">
                          <button id="hs-header-base-dropdown-sub" type="button" className="hs-dropdown-toggle w-full flex justify-between items-center text-sm text-dropdown-item-foreground rounded-lg p-2 md:px-3 hover:bg-dropdown-item-hover focus:outline-hidden focus:bg-dropdown-item-focus">
                            Sub Menu
                            <svg className="hs-dropdown-open:-rotate-180 md:hs-dropdown-open:-rotate-90 md:-rotate-90 ms-auto shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                          </button>

                          <div className="hs-dropdown-menu transition-[opacity,margin] duration-[0.1ms] md:duration-150 hs-dropdown-open:opacity-100 opacity-0 relative md:w-48 hidden z-10 md:mt-2 md:mx-2.5! md:top-0 md:inset-e-full ps-7 md:ps-0 md:bg-dropdown md:border md:border-dropdown-line md:rounded-lg md:shadow-md before:hidden md:before:block before:absolute before:-inset-e-5 before:top-0 before:h-full before:w-5 md:after:hidden after:absolute after:top-1 after:inset-s-4.5 after:h-[calc(100%-4px)] after:border-s after:border-navbar-nav-list-divider" role="menu" aria-orientation="vertical" aria-labelledby="hs-header-base-dropdown-sub">
                            <div className="p-1 space-y-1">
                              <a className="p-2 md:px-3 flex items-center text-sm text-dropdown-item-foreground rounded-lg hover:bg-dropdown-item-hover focus:outline-hidden focus:bg-dropdown-item-focus" href="#">
                                About
                              </a>

                              <a className="p-2 md:px-3 flex items-center text-sm text-dropdown-item-foreground rounded-lg hover:bg-dropdown-item-hover focus:outline-hidden focus:bg-dropdown-item-focus" href="#">
                                Downloads
                              </a>

                              <a className="p-2 md:px-3 flex items-center text-sm text-dropdown-item-foreground rounded-lg hover:bg-dropdown-item-hover focus:outline-hidden focus:bg-dropdown-item-focus" href="#">
                                Team Account
                              </a>
                            </div>
                          </div>
                        </div>

                        <a className="p-2 md:px-3 flex items-center text-sm text-dropdown-item-foreground rounded-lg hover:bg-dropdown-item-hover focus:outline-hidden focus:bg-dropdown-item-focus" href="#">
                          Downloads
                        </a>

                        <a className="p-2 md:px-3 flex items-center text-sm text-dropdown-item-foreground rounded-lg hover:bg-dropdown-item-hover focus:outline-hidden focus:bg-dropdown-item-focus" href="#">
                          Team Account
                        </a>
                      </div>
                    </div>
                  </div>
                  {/* End Dropdown */}

                  <a className="p-2 flex items-center text-sm text-navbar-nav-foreground hover:bg-navbar-nav-hover rounded-lg focus:outline-hidden focus:bg-navbar-nav-focus" href="#">
                    <svg className="shrink-0 size-4 me-3 md:me-2 block md:hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    Account
                  </a>

                  <a className="p-2 flex items-center text-sm text-navbar-nav-foreground hover:bg-navbar-nav-hover rounded-lg focus:outline-hidden focus:bg-navbar-nav-focus" href="#">
                    <svg className="shrink-0 size-4 me-3 md:me-2 block md:hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12h.01" /><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><path d="M22 13a18.15 18.15 0 0 1-20 0" /><rect width="20" height="14" x="2" y="6" rx="2" /></svg>
                    Work
                  </a>

                  <a className="p-2 flex items-center text-sm text-navbar-nav-foreground hover:bg-navbar-nav-hover rounded-lg focus:outline-hidden focus:bg-navbar-nav-focus" href="#">
                    <svg className="shrink-0 size-4 me-3 md:me-2 block md:hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>
                    Blog
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* End Collapse */}
      </nav>
    </header>
  )
}
