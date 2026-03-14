const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4 animate-pulse">
          Parapharmacie
        </h1>
        <p className="text-4xl font-light text-blue-200 mb-8">
          ParaClick
        </p>
        
        {/* Éléments préparés pour le futur */}
        <div className="mt-12 space-y-4">
          <button className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-100 transition">
            Voir les produits
          </button>
          <p className="text-gray-300 text-sm">
            Click & Collect - Retrait en pharmacie
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home