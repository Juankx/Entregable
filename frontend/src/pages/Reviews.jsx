import React, { useState } from 'react'
import { Star, MessageCircle } from 'lucide-react'

const Reviews = () => {
  const [reviews] = useState([
    {
      id: 1,
      name: 'María González',
      destination: 'Cartagena, Colombia',
      rating: 5,
      text: 'Una experiencia extraordinaria. Innovation Bussines superó todas mis expectativas. El servicio fue impecable y los detalles fueron perfectos.',
      avatar: '👩',
      verified: true
    },
    {
      id: 2,
      name: 'Juan Carlos Rodríguez',
      destination: 'Galápagos, Ecuador',
      rating: 5,
      text: 'Increíble. La organización del viaje fue perfecta, guías profesionales y la naturaleza de Galápagos nos dejó sin palabras.',
      avatar: '👨',
      verified: true
    },
    {
      id: 3,
      name: 'Ana Martínez',
      destination: 'Punta Cana, República Dominicana',
      rating: 4,
      text: 'Excelente atención y playas hermosas. Solo cambiaría algunos detalles en las opciones de alojamiento, pero en general fue maravilloso.',
      avatar: '👩',
      verified: true
    },
    {
      id: 4,
      name: 'Pedro López',
      destination: 'Cartagena, Colombia',
      rating: 5,
      text: 'La mejor agencia de viajes con la que he trabajado. Recomiendo ampliamente. El precio está acorde con la calidad del servicio.',
      avatar: '👨',
      verified: true
    },
    {
      id: 5,
      name: 'Carmen Sánchez',
      destination: 'Galápagos, Ecuador',
      rating: 5,
      text: 'Impresionante total. Desde la reserva hasta el regreso, todo fue excelente. Los paquetes incluyen todo lo necesario.',
      avatar: '👩',
      verified: true
    },
    {
      id: 6,
      name: 'Roberto Díaz',
      destination: 'Punta Cana',
      rating: 4,
      text: 'Muy buena experiencia. El destino es perfecto y el equipo de Innovation Bussines fue muy profesional y atento.',
      avatar: '👨',
      verified: true
    }
  ])

  const [newReview, setNewReview] = useState({
    name: '',
    destination: '',
    rating: 5,
    text: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Reseña enviada:', newReview)
    alert('¡Gracias por tu reseña! Será revisada pronto.')
    setNewReview({ name: '', destination: '', rating: 5, text: '' })
  }

  const averageRating = (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-amber-900 to-amber-800 py-16 px-6 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Reseñas de Nuestros Viajeros</h1>
          <p className="text-xl text-amber-100 mb-8">
            Descubre qué dicen nuestros clientes sobre sus experiencias
          </p>
          <div className="flex justify-center items-center gap-4">
            <div className="text-4xl font-bold text-yellow-300">{averageRating}</div>
            <div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={24}
                    className={i < Math.round(averageRating) ? 'fill-yellow-300 text-yellow-300' : 'text-amber-700'}
                  />
                ))}
              </div>
              <p className="text-sm text-amber-100">Basado en {reviews.length} reseñas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition border-l-4 border-amber-500">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{review.avatar}</div>
                  <div>
                    <p className="font-bold text-amber-900">{review.name}</p>
                    <p className="text-sm text-gray-600">{review.destination}</p>
                  </div>
                  {review.verified && (
                    <div className="ml-auto">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        ✓ Verificado
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>

                <p className="text-gray-700 italic">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-amber-900 to-amber-800 py-16 px-6 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">¿Ya viajaste con nosotros?</h2>
          <p className="text-xl text-amber-100 mb-8">
            Comparte tu experiencia y ayuda a otros viajeros a descubrir Innovation Bussines
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-b from-amber-50 to-yellow-50 rounded-lg p-8 shadow-lg">
            <h3 className="text-3xl font-bold text-amber-900 mb-2 flex items-center gap-2">
              <MessageCircle className="text-amber-600" />
              Escribe tu Reseña
            </h3>
            <p className="text-gray-600 mb-6">Tu opinión es muy importante para nosotros</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-amber-900 mb-2">
                    Tu Nombre
                  </label>
                  <input
                    type="text"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    placeholder="Ej: María González"
                    className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 text-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-amber-900 mb-2">
                    Destino Visitado
                  </label>
                  <select
                    value={newReview.destination}
                    onChange={(e) => setNewReview({ ...newReview, destination: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 text-gray-800"
                    required
                  >
                    <option value="">Selecciona un destino</option>
                    <option value="Cartagena, Colombia">Cartagena, Colombia</option>
                    <option value="Galápagos, Ecuador">Galápagos, Ecuador</option>
                    <option value="Punta Cana, República Dominicana">Punta Cana, República Dominicana</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">
                  Calificación
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none transition"
                    >
                      <Star
                        size={32}
                        className={star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">
                  Tu Reseña
                </label>
                <textarea
                  value={newReview.text}
                  onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                  placeholder="Comparte tu experiencia con otros viajeros..."
                  rows={5}
                  className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 text-gray-800 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-900 font-bold py-3 rounded-lg hover:from-amber-600 hover:to-yellow-500 transition text-lg"
              >
                Enviar Reseña
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Reviews
