export default function Hero9() {
  // Hero 
  return (
    <div className="relative overflow-hidden">
      <div className="max-w-340 mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-2xl text-center mx-auto">
          <h1 className="block text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">Designed for you to get more <span className="text-primary">simple</span></h1>
          <p className="mt-3 text-lg text-foreground">Build your business here. Take it anywhere.</p>
        </div>

        <div className="mt-10 relative max-w-5xl mx-auto">
          <div className="w-full object-cover h-96 sm:h-120 bg-[url('https://images.unsplash.com/photo-1606868306217-dbf5046868d2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1020&q=80')] bg-no-repeat bg-center bg-cover rounded-xl"></div>

          <div className="absolute inset-0 size-full">
            <div className="flex flex-col justify-center items-center size-full">
              <a className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-full bg-layer border border-layer-line text-layer-foreground shadow-2xs hover:bg-layer-hover focus:outline-hidden focus:bg-layer-hover disabled:opacity-50 disabled:pointer-events-none" href="#">
                <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                Play the overview
              </a>
            </div>
          </div>

          <div className="absolute bottom-12 -inset-s-20 -z-1 size-48 bg-linear-to-b from-orange-500 to-transparent p-px rounded-lg">
            <div className="bg-background size-48 rounded-lg"></div>
          </div>

          <div className="absolute -top-12 -inset-e-20 -z-1 size-48 bg-linear-to-t from-primary to-cyan-400 p-px rounded-full">
            <div className="bg-background size-48 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
