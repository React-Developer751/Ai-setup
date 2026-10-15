export default function Header2() {
  // ========== HEADER ========== 
  return (
    <>
      <header className="flex flex-wrap  md:justify-start md:flex-nowrap z-50 w-full bg-navbar border-b border-navbar-line">
        <nav className="relative max-w-340 w-full mx-auto flex items-center justify-between gap-3 py-2 px-4 sm:px-6 lg:px-8">

          <a className="flex-none font-semibold text-xl text-foreground focus:outline-hidden focus:opacity-80" href="#" aria-label="Brand">Brand</a>

          <div className="md:order-3 flex justify-end items-center gap-x-1">
            {/* Collapse Button */}
            <button type="button" className="md:hidden relative p-2 flex items-center font-medium text-sm rounded-lg bg-layer border border-layer-line text-layer-foreground hover:bg-layer-hover focus:outline-hidden focus:bg-layer-focus disabled:opacity-50 disabled:pointer-events-none" id="hs-header-base-collapse" aria-haspopup="dialog" aria-expanded="false" aria-controls="hs-header-base" aria-label="Toggle navigation" data-hs-overlay="#hs-header-base">
              Menu
              <svg className="shrink-0 size-4 ms-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
            </button>
            {/* End Collapse Button */}

            <div className="hidden md:inline-block md:me-2">
              <div className="w-px h-4 bg-surface-2"></div>
            </div>

            {/* Offcanvas Toggle */}
            <button type="button" className="relative size-9 flex justify-center items-center text-sm font-semibold rounded-lg bg-layer border border-layer-line text-layer-foreground hover:bg-layer-hover focus:outline-hidden focus:bg-layer-focus disabled:opacity-50 disabled:pointer-events-none" aria-haspopup="dialog" aria-expanded="false" aria-controls="hs-header-base-offcanvas" aria-label="Toggle navigation" data-hs-overlay="#hs-header-base-offcanvas">
              <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M15 3v18" /><path d="m8 9 3 3-3 3" /></svg>
              <span className="sr-only">Toggle navigation</span>
            </button>
            {/* End Offcanvas Toggle */}
          </div>

          {/* Collapse */}
          <div id="hs-header-base" className="hs-overlay [--auto-close:md] hs-overlay-open:translate-x-0 -translate-x-full fixed top-0 inset-s-0 transition-all duration-300 transform h-full max-w-xs w-full z-60 bg-navbar border-e basis-full grow md:order-2 md:static md:block md:h-auto md:max-w-none md:w-auto md:border-e-transparent md:transition-none md:translate-x-0 md:z-40 md:basis-auto hidden " role="dialog" tabIndex={-1} aria-label="Sidebar" data-hs-overlay-close-on-resize>
            <div className="overflow-hidden overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-track]:bg-scrollbar-track [&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb">
              <div className="py-2 md:py-0 px-2 md:px-0 flex flex-col md:flex-row md:items-center gap-0.5 md:gap-1">
                {/* Offcanvas Header */}
                <div className="md:hidden p-2 flex justify-between items-center">
                  <h3 id="hs-header-base-label" className="font-bold text-foreground">
                    Menu title
                  </h3>
                  <button type="button" className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-surface text-surface-foreground hover:bg-surface-hover focus:outline-hidden focus:bg-surface-focus disabled:opacity-50 disabled:pointer-events-none" aria-label="Close" data-hs-overlay="#hs-header-base">
                    <span className="sr-only">Close</span>
                    <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  </button>
                </div>
                {/* End Offcanvas Header */}
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
      {/* ========== END HEADER ========== */}

      {/* Offcanvas */}
      <div id="hs-header-base-offcanvas" className="hs-overlay hs-overlay-open:translate-x-0 hidden -translate-x-full fixed top-0 inset-s-0 transition-all duration-300 transform h-full max-w-xs w-full z-80 bg-white border-e dark:bg-neutral-800 dark:border-neutral-700" role="dialog" tabIndex={-1} aria-labelledby="hs-header-base-offcanvas-label">
        <div className="flex justify-between items-center py-3 px-4 border-b border-gray-200 dark:border-neutral-700">
          <h3 id="hs-header-base-offcanvas-label" className="font-bold text-foreground">
            Offcanvas title
          </h3>
          <button type="button" className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-surface text-surface-foreground hover:bg-surface-hover focus:outline-hidden focus:bg-surface-focus disabled:opacity-50 disabled:pointer-events-none" aria-label="Close" data-hs-overlay="#hs-header-base-offcanvas">
            <span className="sr-only">Close</span>
            <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
        <div className="p-4">
          <p className="text-foreground">
            Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
          </p>
        </div>
      </div>
    </>
  )
}
