export default function Hero1() {
  // Hero 
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(\'../../../assets/img/hero/valley.webp\')' }}></div>
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-0 motion-reduce:animate-none animate-[hs-hero-day-night_22s_ease-in-out_infinite]" style={{ backgroundImage: 'url(\'../../../assets/img/hero/valley-night.webp\')' }}></div>
        <div className="absolute inset-0 bg-inverse/25"></div>
      </div>

      <div className="relative z-10 max-w-340 mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-150 md:min-h-[80dvh] flex flex-col justify-center space-y-8">
        {/* Announcement Banner */}
        <div className="flex justify-center">
          <a className="group inline-flex items-center bg-layer/40 hover:bg-layer/50 p-1 ps-4 rounded-full shadow-lg shadow-transparent backdrop-blur-xl focus:outline-hidden focus:bg-layer/50" href="#">
            <p className="me-2 text-layer-foreground text-sm">
              We just raised $20M
            </p>
            <span className="group-hover:bg-layer/50 py-1.5 px-2.5 flex justify-center items-center gap-x-2 rounded-full bg-layer/50 font-semibold text-layer-foreground text-sm">
              <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </span>
          </a>
        </div>
        {/* End Announcement Banner */}

        {/* Title */}
        <div className="max-w-3xl text-center mx-auto">
          <h1 className="block font-semibold text-foreground-inverse text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
            Design with ease.
          </h1>
        </div>
        {/* End Title */}

        <div className="max-w-3xl text-center mx-auto">
          <p className="text-lg text-foreground-inverse/80">Design smarter with AI that understands you. So you can take a breath.</p>
        </div>

        {/* Buttons */}
        <div className="text-center">
          <div className="inline-flex flex-wrap justify-center items-center gap-3">
            <a className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-full bg-layer border border-layer-line text-layer-foreground shadow-2xs hover:bg-layer-hover focus:outline-hidden focus:bg-layer-hover" href="#">
              Get Started
              <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </a>
            <a className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-full border border-transparent text-foreground-inverse hover:bg-plain/10 focus:outline-hidden focus:bg-plain/10" href="#">
              <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              Watch Demo
            </a>
          </div>
        </div>
        {/* End Buttons */}
      </div>
    </div>
  )
}
