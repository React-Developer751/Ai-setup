export default function Hero6() {
  // Hero 
  return (
    <div className="bg-inverse bg-linear-to-b from-chart-5/10 via-transparent">
      <div className="max-w-340 mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8">
        {/* Announcement Banner */}
        <div className="flex justify-center">
          <a className="group inline-flex items-center bg-plain/10 hover:bg-plain/10 border border-plain/10 p-1 ps-4 rounded-full shadow-md focus:outline-hidden focus:bg-plain/10" href="../../../figma/">
            <p className="me-2 text-white text-sm">
              Preline UI Figma is live.
            </p>
            <span className="group-hover:bg-plain/10 py-1.5 px-2.5 flex justify-center items-center gap-x-2 rounded-full bg-plain/10 font-semibold text-foreground-inverse text-sm">
              <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </span>
          </a>
        </div>
        {/* End Announcement Banner */}

        {/* Title */}
        <div className="max-w-3xl text-center mx-auto">
          <h1 className="block font-medium text-foreground-inverse text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
            Now it's easier than ever to build products
          </h1>
        </div>
        {/* End Title */}

        <div className="max-w-3xl text-center mx-auto">
          <p className="text-lg text-foreground-inverse/70">Preline is a large open-source project, crafted with Tailwind CSS framework by Hmlstream.</p>
        </div>

        {/* Buttons */}
        <div className="text-center">
          <a className="inline-flex justify-center items-center gap-x-3 text-center bg-linear-to-tl from-primary to-chart-5 shadow-lg shadow-transparent hover:shadow-primary-hover/50 border border-transparent text-primary-foreground text-sm font-medium rounded-full focus:outline-hidden focus:shadow-primary-focus/50 py-3 px-6" href="#">
            Get started
            <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </a>
        </div>
        {/* End Buttons */}
      </div>
    </div>
  )
}
