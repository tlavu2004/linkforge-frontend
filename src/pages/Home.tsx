export default function Home() {
  return (
    <div className="container mx-auto px-4 py-20 flex flex-col justify-center min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto w-full text-center space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl text-balance">
          Shorten Your Links <br className="hidden sm:inline" />
          <span className="text-primary-600">Expand Your Reach</span>
        </h1>
        <p className="text-xl text-gray-500 text-balance">
          LinkForge is a powerful, secure, and fast URL shortener designed to enhance your online presence.
          Create, track, and manage your links effortlessly.
        </p>

        <div className="bg-white p-2 rounded-full shadow-lg flex items-center max-w-2xl mx-auto border border-gray-100 ring-4 ring-primary-50">
          <input
            type="url"
            placeholder="Paste your long URL here..."
            className="flex-1 bg-transparent px-6 py-4 outline-none text-gray-900 placeholder:text-gray-400 font-medium"
            required
          />
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 duration-200">
            Shorten
          </button>
        </div>
      </div>
    </div>
  )
}
