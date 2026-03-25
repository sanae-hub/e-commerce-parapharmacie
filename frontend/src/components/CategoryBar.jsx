import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Droplets, Baby, Pill, Sun, Stethoscope, ChevronDown, Droplet, Wind, Sparkle, Waves, Smile, CircleDot, Bath, BabyIcon, Milk, Heart, Tablets, Activity, Shield, Zap, Moon, Bug, Umbrella, Footprints, Armchair, Hand, Bone, Gauge, Gift, Percent } from 'lucide-react'

const CategoryBar = () => {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState(null)
  const [hoveredCategory, setHoveredCategory] = useState(null)

  const categories = [
    {
      id: 1,
      name: 'Cosmétiques & Soin',
      icon: Sparkles,
      hasSubcategories: true,
      subcategories: [
        {
          title: 'Soins Visage',
          icon: Sparkle,
          items: ['Nettoyants', 'Hydratants', 'Anti-âge', 'Soins ciblés']
        },
        {
          title: 'Soins Corps',
          icon: Droplet,
          items: ['Laits corporels', 'Baumes', 'Gommages']
        },
        {
          title: 'Produits Capillaires',
          icon: Wind,
          items: ['Shampooings', 'Après-shampooings', 'Masques capillaires']
        },
        {
          title: 'Soins bio cheveux',
          icon: Wind,
          items: ['Shampooings bio', 'Après-shampooings bio', 'Masques bio', 'Huiles capillaires bio']
        },
        {
          title: 'Soins bio visage',
          icon: Sparkle,
          items: ['Nettoyants bio', 'Crèmes bio', 'Sérums bio', 'Huiles visage bio']
        }
      ]
    },
    {
      id: 2,
      name: 'Hygiène & Corps',
      icon: Droplets,
      hasSubcategories: true,
      subcategories: [
        {
          title: 'Savons, gels douche',
          icon: Waves,
          items: ['Savons liquides', 'Gels douche', 'Savons solides', 'Huiles de douche']
        },
        {
          title: 'Dentifrices et bains de bouche',
          icon: Smile,
          items: ['Dentifrices', 'Bains de bouche', 'Brosses à dents', 'Fil dentaire']
        },
        {
          title: 'Déodorants et anti-transpirants',
          icon: CircleDot,
          items: ['Déodorants spray', 'Déodorants roll-on', 'Déodorants stick', 'Anti-transpirants']
        },
        {
          title: 'Soins des mains et pieds',
          icon: Hand,
          items: ['Crèmes mains', 'Crèmes pieds', 'Gommages', 'Masques mains']
        },
        {
          title: 'Hygiène intime',
          icon: Droplet,
          items: ['Gels intimes', 'Lingettes intimes', 'Déodorants intimes', 'Soins apaisants']
        }
      ]
    },
    {
      id: 3,
      name: 'Bébé & Maternité',
      icon: Baby,
      hasSubcategories: true,
      subcategories: [
        {
          title: 'Bain et lavage',
          icon: Bath,
          items: ['Gels lavants bébé', 'Shampooings bébé', 'Lingettes', 'Accessoires de bain']
        },
        {
          title: 'Soins du change',
          icon: BabyIcon,
          items: ['Crèmes pour le change', 'Lingettes nettoyantes', 'Talc', 'Couches']
        },
        {
          title: 'Hydratation et alimentation',
          icon: Droplet,
          items: ['Laits hydratants', 'Huiles de massage', 'Biberons', 'Tétines']
        },
        {
          title: 'Allaitement, accessoires',
          icon: Milk,
          items: ['Tire-lait', 'Coussinets d\'allaitement', 'Crèmes allaitement', 'Accessoires']
        },
        {
          title: 'Soins grossesse',
          icon: Heart,
          items: ['Crèmes anti-vergetures', 'Huiles de massage', 'Compléments alimentaires', 'Soins du corps']
        }
      ]
    },
    {
      id: 4,
      name: 'Complémentaires',
      icon: Pill,
      hasSubcategories: true,
      subcategories: [
        {
          title: 'Vitamines et Minéraux',
          icon: Tablets,
          items: ['Multivitamines', 'Vitamine C', 'Vitamine D', 'Calcium', 'Magnésium', 'Fer']
        },
        {
          title: 'Probiotiques et Digestion',
          icon: Activity,
          items: ['Probiotiques', 'Enzymes digestives', 'Fibres', 'Transit intestinal']
        },
        {
          title: 'Immunité et Défenses Naturelles',
          icon: Shield,
          items: ['Echinacée', 'Propolis', 'Gelée royale', 'Vitamine C', 'Zinc']
        },
        {
          title: 'Fatigue et Vitalité',
          icon: Zap,
          items: ['Ginseng', 'Guarana', 'Spiruline', 'Magnésium', 'Fer', 'Vitamine B']
        },
        {
          title: 'Sommeil et Détente',
          icon: Moon,
          items: ['Mélatonine', 'Valériane', 'Passiflore', 'Tilleul', 'Camomille']
        }
      ]
    },
    {
      id: 5,
      name: 'Solaire & Protection',
      icon: Sun,
      hasSubcategories: true,
      subcategories: [
        {
          title: 'Anti-moustiques et répulsifs',
          icon: Bug,
          items: ['Sprays anti-moustiques', 'Lotions répulsives', 'Bracelets anti-moustiques', 'Diffuseurs']
        },
        {
          title: 'Protection solaire enfant et bébé',
          icon: Baby,
          items: ['Crèmes solaires bébé', 'Sprays solaires enfant', 'Sticks solaires', 'Lait solaire']
        },
        {
          title: 'Soins après-soleil',
          icon: Droplet,
          items: ['Laits après-soleil', 'Gel apaisant', 'Crèmes réparatrices', 'Huiles après-soleil']
        },
        {
          title: 'Soins solaires corps',
          icon: Umbrella,
          items: ['Crèmes solaires corps', 'Sprays solaires', 'Huiles solaires', 'Laits solaires']
        },
        {
          title: 'Soins solaires visage',
          icon: Sun,
          items: ['Crèmes solaires visage', 'Fluides solaires', 'Sticks lèvres SPF', 'Compacts solaires']
        }
      ]
    },
    {
      id: 6,
      name: 'Orthopédique',
      icon: Stethoscope,
      hasSubcategories: true,
      subcategories: [
        {
          title: 'Semelles et orthèses plantaires',
          icon: Footprints,
          items: ['Semelles orthopédiques', 'Orthèses plantaires', 'Coussinets', 'Talonnettes']
        },
        {
          title: 'Coussins et accessoires de confort',
          icon: Armchair,
          items: ['Coussins lombaires', 'Coussins cervicaux', 'Coussins de siège', 'Oreillers ergonomiques']
        },
        {
          title: 'Coudières et poignets',
          icon: Hand,
          items: ['Coudières', 'Attières de poignet', 'Manchons de compression', 'Bandages']
        },
        {
          title: 'Genouillères et chevillères',
          icon: Bone,
          items: ['Genouillères', 'Chevillères', 'Bandages genoux', 'Supports articulaires']
        },
        {
          title: 'Compression et contention',
          icon: Gauge,
          items: ['Bas de contention', 'Chaussettes de compression', 'Manchons de compression', 'Collants de contention']
        }
      ]
    },
  ]

  const handleCategoryClick = (category) => {
    if (category.hasSubcategories) {
      // Ouvrir le menu au clic
      setActiveCategory(category.id)
    } else {
      setActiveCategory(category.id)
      navigate(`/products?category=${encodeURIComponent(category.name)}`)
    }
  }

  const handleSubcategoryClick = (categoryName, subcategory) => {
    setHoveredCategory(null)
    navigate(`/products?category=${encodeURIComponent(categoryName)}&subcategory=${encodeURIComponent(subcategory)}`)
  }

  return (
    <div className="bg-white border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Desktop: Grid 6 colonnes */}
        <div className="hidden md:grid grid-cols-6 gap-2 py-2">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => category.hasSubcategories && setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <button
                  onClick={() => handleCategoryClick(category)}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                    activeCategory === category.id || hoveredCategory === category.id
                      ? 'bg-sky-700 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent size={18} strokeWidth={1.8} />
                  <span className="text-xs font-medium whitespace-nowrap">{category.name}</span>
                  {category.hasSubcategories && (
                    <ChevronDown size={14} strokeWidth={2} />
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Mobile: Liste verticale */}
        <div className="md:hidden flex flex-col gap-1.5 py-2">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-sky-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent size={16} strokeWidth={1.8} />
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mega Menu pour Cosmétiques & Soin */}
      {(hoveredCategory === 1 || activeCategory === 1) && (
        <div 
          className="absolute left-0 right-0 top-full bg-white shadow-2xl border-t border-gray-200 z-50"
          onMouseEnter={() => setHoveredCategory(1)}
          onMouseLeave={() => {
            setHoveredCategory(null)
            setActiveCategory(null)
          }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <div className="grid grid-cols-5 gap-6">
              {categories[0].subcategories.map((subcategory, index) => {
                const SubcategoryIcon = subcategory.icon
                return (
                  <div key={index}>
                    <div className="flex items-center gap-2 mb-4">
                      <SubcategoryIcon size={18} className="text-sky-700" strokeWidth={2} />
                      <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                        {subcategory.title}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {subcategory.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <button
                            onClick={() => handleSubcategoryClick(categories[0].name, item)}
                            className="text-gray-600 hover:text-sky-700 hover:translate-x-1 transition-all duration-200 text-sm block w-full text-left"
                          >
                            {item}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            {/* Bannière promotionnelle */}
            <div className="mt-8 p-6 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sky-900 text-lg mb-1 flex items-center gap-2">
                    <Gift size={20} className="text-sky-700" />
                    Offres spéciales Cosmétiques
                  </h4>
                  <p className="text-sky-700 text-sm">Jusqu'à -50% sur une sélection de produits</p>
                </div>
                <button
                  onClick={() => {
                    setHoveredCategory(null)
                    setActiveCategory(null)
                    navigate('/products?category=Cosmétiques & Soin')
                  }}
                  className="px-6 py-2 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-lg transition-colors"
                >
                  Voir tout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mega Menu pour Hygiène & Corps */}
      {(hoveredCategory === 2 || activeCategory === 2) && (
        <div 
          className="absolute left-0 right-0 top-full bg-white shadow-2xl border-t border-gray-200 z-50"
          onMouseEnter={() => setHoveredCategory(2)}
          onMouseLeave={() => {
            setHoveredCategory(null)
            setActiveCategory(null)
          }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <div className="grid grid-cols-5 gap-6">
              {categories[1].subcategories.map((subcategory, index) => {
                const SubcategoryIcon = subcategory.icon
                return (
                  <div key={index}>
                    <div className="flex items-center gap-2 mb-4">
                      <SubcategoryIcon size={18} className="text-sky-700" strokeWidth={2} />
                      <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                        {subcategory.title}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {subcategory.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <button
                            onClick={() => handleSubcategoryClick(categories[1].name, item)}
                            className="text-gray-600 hover:text-sky-700 hover:translate-x-1 transition-all duration-200 text-sm block w-full text-left"
                          >
                            {item}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            {/* Bannière promotionnelle */}
            <div className="mt-8 p-6 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sky-900 text-lg mb-1 flex items-center gap-2">
                    <Gift size={20} className="text-sky-700" />
                    Offres spéciales Hygiène
                  </h4>
                  <p className="text-sky-700 text-sm">Jusqu'à -40% sur une sélection de produits</p>
                </div>
                <button
                  onClick={() => {
                    setHoveredCategory(null)
                    setActiveCategory(null)
                    navigate('/products?category=Hygiène & Corps')
                  }}
                  className="px-6 py-2 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-lg transition-colors"
                >
                  Voir tout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mega Menu pour Bébé & Maternité */}
      {(hoveredCategory === 3 || activeCategory === 3) && (
        <div 
          className="absolute left-0 right-0 top-full bg-white shadow-2xl border-t border-gray-200 z-50"
          onMouseEnter={() => setHoveredCategory(3)}
          onMouseLeave={() => {
            setHoveredCategory(null)
            setActiveCategory(null)
          }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <div className="grid grid-cols-5 gap-6">
              {categories[2].subcategories.map((subcategory, index) => {
                const SubcategoryIcon = subcategory.icon
                return (
                  <div key={index}>
                    <div className="flex items-center gap-2 mb-4">
                      <SubcategoryIcon size={18} className="text-sky-700" strokeWidth={2} />
                      <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide">
                        {subcategory.title}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {subcategory.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <button
                            onClick={() => handleSubcategoryClick(categories[2].name, item)}
                            className="text-gray-600 hover:text-sky-700 hover:translate-x-1 transition-all duration-200 text-xs block w-full text-left"
                          >
                            {item}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            {/* Bannière promotionnelle */}
            <div className="mt-8 p-6 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sky-900 text-lg mb-1 flex items-center gap-2">
                    <Baby size={20} className="text-sky-700" />
                    Offres spéciales Bébé & Maternité
                  </h4>
                  <p className="text-sky-700 text-sm">Jusqu'à -35% sur une sélection de produits</p>
                </div>
                <button
                  onClick={() => {
                    setHoveredCategory(null)
                    setActiveCategory(null)
                    navigate('/products?category=Bébé & Maternité')
                  }}
                  className="px-6 py-2 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-lg transition-colors"
                >
                  Voir tout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mega Menu pour Complémentaires */}
      {(hoveredCategory === 4 || activeCategory === 4) && (
        <div 
          className="absolute left-0 right-0 top-full bg-white shadow-2xl border-t border-gray-200 z-50"
          onMouseEnter={() => setHoveredCategory(4)}
          onMouseLeave={() => {
            setHoveredCategory(null)
            setActiveCategory(null)
          }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <div className="grid grid-cols-5 gap-6">
              {categories[3].subcategories.map((subcategory, index) => {
                const SubcategoryIcon = subcategory.icon
                return (
                  <div key={index}>
                    <div className="flex items-center gap-2 mb-4">
                      <SubcategoryIcon size={18} className="text-sky-700" strokeWidth={2} />
                      <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide">
                        {subcategory.title}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {subcategory.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <button
                            onClick={() => handleSubcategoryClick(categories[3].name, item)}
                            className="text-gray-600 hover:text-sky-700 hover:translate-x-1 transition-all duration-200 text-xs block w-full text-left"
                          >
                            {item}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            {/* Bannière promotionnelle */}
            <div className="mt-8 p-6 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sky-900 text-lg mb-1 flex items-center gap-2">
                    <Pill size={20} className="text-sky-700" />
                    Offres spéciales Compléments
                  </h4>
                  <p className="text-sky-700 text-sm">Jusqu'à -30% sur une sélection de produits</p>
                </div>
                <button
                  onClick={() => {
                    setHoveredCategory(null)
                    setActiveCategory(null)
                    navigate('/products?category=Complémentaires')
                  }}
                  className="px-6 py-2 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-lg transition-colors"
                >
                  Voir tout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mega Menu pour Solaire & Protection */}
      {(hoveredCategory === 5 || activeCategory === 5) && (
        <div 
          className="absolute left-0 right-0 top-full bg-white shadow-2xl border-t border-gray-200 z-50"
          onMouseEnter={() => setHoveredCategory(5)}
          onMouseLeave={() => {
            setHoveredCategory(null)
            setActiveCategory(null)
          }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <div className="grid grid-cols-5 gap-6">
              {categories[4].subcategories.map((subcategory, index) => {
                const SubcategoryIcon = subcategory.icon
                return (
                  <div key={index}>
                    <div className="flex items-center gap-2 mb-4">
                      <SubcategoryIcon size={18} className="text-sky-700" strokeWidth={2} />
                      <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide">
                        {subcategory.title}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {subcategory.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <button
                            onClick={() => handleSubcategoryClick(categories[4].name, item)}
                            className="text-gray-600 hover:text-sky-700 hover:translate-x-1 transition-all duration-200 text-xs block w-full text-left"
                          >
                            {item}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            {/* Bannière promotionnelle */}
            <div className="mt-8 p-6 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sky-900 text-lg mb-1 flex items-center gap-2">
                    <Sun size={20} className="text-sky-700" />
                    Offres spéciales Solaire
                  </h4>
                  <p className="text-sky-700 text-sm">Jusqu'à -25% sur une sélection de produits</p>
                </div>
                <button
                  onClick={() => {
                    setHoveredCategory(null)
                    setActiveCategory(null)
                    navigate('/products?category=Solaire & Protection')
                  }}
                  className="px-6 py-2 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-lg transition-colors"
                >
                  Voir tout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mega Menu pour Orthopédique */}
      {(hoveredCategory === 6 || activeCategory === 6) && (
        <div 
          className="absolute left-0 right-0 top-full bg-white shadow-2xl border-t border-gray-200 z-50"
          onMouseEnter={() => setHoveredCategory(6)}
          onMouseLeave={() => {
            setHoveredCategory(null)
            setActiveCategory(null)
          }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <div className="grid grid-cols-5 gap-6">
              {categories[5].subcategories.map((subcategory, index) => {
                const SubcategoryIcon = subcategory.icon
                return (
                  <div key={index}>
                    <div className="flex items-center gap-2 mb-4">
                      <SubcategoryIcon size={18} className="text-sky-700" strokeWidth={2} />
                      <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide">
                        {subcategory.title}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {subcategory.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <button
                            onClick={() => handleSubcategoryClick(categories[5].name, item)}
                            className="text-gray-600 hover:text-sky-700 hover:translate-x-1 transition-all duration-200 text-xs block w-full text-left"
                          >
                            {item}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            {/* Bannière promotionnelle */}
            <div className="mt-8 p-6 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sky-900 text-lg mb-1 flex items-center gap-2">
                    <Bone size={20} className="text-sky-700" />
                    Offres spéciales Orthopédique
                  </h4>
                  <p className="text-sky-700 text-sm">Jusqu'à -20% sur une sélection de produits</p>
                </div>
                <button
                  onClick={() => {
                    setHoveredCategory(null)
                    setActiveCategory(null)
                    navigate('/products?category=Orthopédique')
                  }}
                  className="px-6 py-2 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-lg transition-colors"
                >
                  Voir tout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryBar
