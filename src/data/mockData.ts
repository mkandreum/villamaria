import { Amenity, Attraction, GalleryImage, PricingConfig, Review, Booking } from '../types';

export const INITIAL_PRICING: PricingConfig = {
  baseNightlyRate: 120,
  weekendRate: 145,
  cleaningFee: 35,
  securityDeposit: 100,
  maxGuests: 12,
  baseGuests: 6,
  extraGuestFee: 15,
  discountWeeklyPercent: 10,
};

export const PROPERTY_INFO = {
  name: "Villa María",
  tagline: "Tu Casa de Playa Privada en Chichiriviche",
  locationName: "Calle 15, Urbanización Privada, Chichiriviche, Estado Falcón, Venezuela",
  shortLocation: "Chichiriviche - Calle 15 (c15)",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Chichiriviche+Calle+15+Falcon+Venezuela",
  embedMapCoordinates: { lat: 10.9317, lng: -68.2736 },
  bedrooms: 3,
  bathrooms: 3,
  maxCapacity: 12,
  distanceToEmbarcadero: "A solo 5 minutos de los embarcaderos a las cayos",
  phoneWhatsApp: "+584141234567",
  formattedPhone: "+58 (414) 123-4567",
  email: "reservas.villamaria@gmail.com",
};

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "VM-2026-081",
    guestName: "Carlos Mendoza",
    guestEmail: "carlos.m@gmail.com",
    guestPhone: "+584125551234",
    checkIn: "2026-08-14",
    checkOut: "2026-08-17",
    adults: 6,
    children: 2,
    totalPrice: 470,
    status: "confirmed",
    createdAt: "2026-08-01",
    paymentMethod: "zelle",
    specialRequests: "Llegada estimada a las 4:00 PM."
  },
  {
    id: "VM-2026-088",
    guestName: "Familia Rodriguez",
    guestEmail: "rodriguez.fam@hotmail.com",
    guestPhone: "+584249876543",
    checkIn: "2026-08-21",
    checkOut: "2026-08-24",
    adults: 8,
    children: 1,
    totalPrice: 520,
    status: "confirmed",
    createdAt: "2026-08-05",
    paymentMethod: "pago_movil"
  },
  {
    id: "VM-2026-092",
    guestName: "Mantenimiento / Bloqueo Dueño",
    guestEmail: "admin@villamaria.com",
    guestPhone: "+584141234567",
    checkIn: "2026-09-04",
    checkOut: "2026-09-07",
    adults: 1,
    children: 0,
    totalPrice: 0,
    status: "blocked_by_owner",
    createdAt: "2026-08-08",
    paymentMethod: "efectivo",
    specialRequests: "Reservado para uso familiar del propietario"
  }
];

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: "g1",
    url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    title: "Fachada & Porche de Villa María",
    category: "exteriores",
    description: "Hermosa fachada tropical con amplio porche, jardines y puestos de estacionamiento privados."
  },
  {
    id: "g2",
    url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80",
    title: "Piscina Comunitaria & Caney",
    category: "piscina",
    description: "Área de piscina refrescante de la urbanización con caney, tumbonas y ducha de playa."
  },
  {
    id: "g3",
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    title: "Área Social y Parrillera",
    category: "exteriores",
    description: "Zona con parrillera BBQ, mesa al aire libre y espacio perfecto para compartir en familia."
  },
  {
    id: "g4",
    url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
    title: "Habitación Principal (Cama King)",
    category: "habitaciones",
    description: "Espaciosa habitación principal con cama King, aire acondicionado Split de alta capacidad y baño privado."
  },
  {
    id: "g5",
    url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
    title: "Habitación Secundaria (Camas Queen)",
    category: "habitaciones",
    description: "Cómoda habitación ideal para la familia o amigos, totalmente climatizada."
  },
  {
    id: "g6",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    title: "Sala de Estar Espaciosa",
    category: "sala_cocina",
    description: "Sala integrada con sofá amplio, Smart TV de 55\", aire acondicionado e iluminación LED moderna."
  },
  {
    id: "g7",
    url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
    title: "Cocina Totalmente Equipada",
    category: "sala_cocina",
    description: "Cocina con tope de granito, nevera de gran capacidad, microondas, licuadora y todos los utensilios."
  },
  {
    id: "g8",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    title: "Playas de Chichiriviche y Parque Morrocoy",
    category: "entorno",
    description: "Las espectaculares aguas turquesas de los cayos a solo minutos navegando desde la casa."
  }
];

export const AMENITIES: Amenity[] = [
  {
    id: "a1",
    title: "Piscina Comunitaria",
    description: "Piscina en la urbanización privada con zona de niños, caney y tumbonas para tomar el sol.",
    iconName: "Waves",
    category: "instalaciones",
    highlighted: true
  },
  {
    id: "a2",
    title: "Planta Eléctrica & Tanque",
    description: "Suministro eléctrico y de agua 100% garantizado con tanque de gran capacidad y planta para tu tranquilidad.",
    iconName: "Zap",
    category: "servicios",
    highlighted: true
  },
  {
    id: "a3",
    title: "Aire Acondicionado Split",
    description: "Climatización A/C independiente en todas las habitaciones y en la sala principal.",
    iconName: "Wind",
    category: "confort",
    highlighted: true
  },
  {
    id: "a4",
    title: "Área de Parrillera (BBQ)",
    description: "Parrillera a carbón/gas para preparar tus parrilladas y pescados frescos frente al porche.",
    iconName: "Flame",
    category: "instalaciones",
    highlighted: true
  },
  {
    id: "a5",
    title: "Vigilancia 24/7",
    description: "Urbanización completamente cerrada con portón eléctrico, control de acceso y seguridad permanente.",
    iconName: "ShieldCheck",
    category: "seguridad",
    highlighted: true
  },
  {
    id: "a6",
    title: "Wi-Fi Starlink de Alta Velocidad",
    description: "Conexión a internet satelital rápida y estable para streaming, trabajo remoto y comunicación.",
    iconName: "Wifi",
    category: "servicios",
    highlighted: true
  },
  {
    id: "a7",
    title: "Estacionamiento Privado",
    description: "Puestos de estacionamiento cómodos para hasta 3 vehículos dentro de la propiedad.",
    iconName: "Car",
    category: "instalaciones"
  },
  {
    id: "a8",
    title: "Cocina Equipada",
    description: "Nevera, congelador extra, cocina a gas, microondas, cafetera, utensilios y vajilla completa.",
    iconName: "Utensils",
    category: "confort"
  },
  {
    id: "a9",
    title: "Smart TV & Streaming",
    description: "Televisor de alta definición con Netflix, YouTube y canales digitales para momentos de relax.",
    iconName: "Tv",
    category: "confort"
  },
  {
    id: "a10",
    title: "Cerca de Embarcaderos",
    description: "Ubicación estratégica en Calle 15 (c15) a 5 min de los muelles para salir a Cayo Sombrero o Cayo Sal.",
    iconName: "Compass",
    category: "instalaciones"
  }
];

export const NEARBY_ATTRACTIONS: Attraction[] = [
  {
    id: "attr1",
    name: "Cayo Sombrero",
    description: "El cayo más famoso de Morrocoy. Bosque de cocoteros, arenas blancas y aguas cristalinas ideales para snorkel.",
    travelTime: "15 min en lancha",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    tag: "Imperdible",
    locationQuery: "Cayo Sombrero, Morrocoy, Falcon, Venezuela"
  },
  {
    id: "attr2",
    name: "Cayo Sal & Cayo Muerto",
    description: "Cayos muy cercanos a la costa de Chichiriviche con suave oleaje, restaurantes playeros y alquiler de toldos.",
    travelTime: "8 - 10 min en lancha",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    tag: "Familiar",
    locationQuery: "Cayo Sal, Chichiriviche, Falcon, Venezuela"
  },
  {
    id: "attr3",
    name: "Embarcadero Principal & Malecon",
    description: "Punto de salida de lanchas peñeros y cooperativas de transporte marítimo en Chichiriviche.",
    travelTime: "5 min en auto / 15 min caminando",
    imageUrl: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80",
    tag: "Transporte",
    locationQuery: "Embarcadero Chichiriviche, Falcon, Venezuela"
  },
  {
    id: "attr4",
    name: "Cueva del Indio & Manglares",
    description: "Paseo místico en lancha entre manglares para ver petroglifos indígenas y fauna autóctona (flamencos y garzas).",
    travelTime: "20 min en lancha",
    imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80",
    tag: "Ecoturismo",
    locationQuery: "Cueva del Indio, Morrocoy, Falcon, Venezuela"
  }
];

export const REVIEWS: Review[] = [
  {
    id: "r1",
    author: "Mariana Silva",
    date: "Julio 2026",
    rating: 5,
    comment: "¡Excelente estadía! La casa es impecable, super cómoda y los aires congelan. La piscina de la urbanización es limpia y tranquila. Además el agua y la luz nunca fallaron. Volveremos sin duda.",
    location: "Caracas, Venezuela",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "r2",
    author: "José Luis Blanco",
    date: "Junio 2026",
    rating: 5,
    comment: "Superó nuestras expectativas. La ubicación en la Calle 15 es ideal porque estás cerca de los embarcaderos y bodegones pero en una zona privada muy tranquila. La atención del anfitrión fue 10/10.",
    location: "Valencia, Venezuela",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "r3",
    author: "Gabriela Colmenares",
    date: "Mayo 2026",
    rating: 5,
    comment: "La casa cuenta con todo lo necesario para cocinar, descansar e ir a los cayos. La parrillera es perfecta para la tarde. La piscina comunitara super relajante para los niños.",
    location: "Barquisimeto, Venezuela",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
  }
];

export const HOUSE_RULES = [
  "Check-in: 3:00 PM | Check-out: 12:00 PM (Flexibilidad según disponibilidad).",
  "Capacidad máxima de 12 personas (niños incluidos).",
  "No se permiten fiestas con minitecas ni música a alto volumen pasadas las 10:00 PM por normas de la urbanización.",
  "Mascotas pequeñas permitidas previa consulta y autorización.",
  "Se requiere depósito de garantía reembolsable al momento del registro.",
  "Manejo responsable del agua y uso de ducha antes de ingresar a la piscina."
];

export const FAQS = [
  {
    q: "¿Cómo funciona el proceso de reserva?",
    a: "Seleccionas las fechas en nuestro calendario en vivo. Al enviar tu solicitud, el sistema valida que no haya cruce con otras reservas. Confirmas con un anticipo del 50% vía Zelle, Pago Móvil o Transferencia y recibes tu comprobante con la ubicación exacta."
  },
  {
    q: "¿Tienen agua constante y planta eléctrica?",
    a: "Sí, la casa cuenta con un tanque subterráneo y aéreo de alta capacidad con hidroneumático, además de planta eléctrica de respaldo para garantizar confort continuo durante toda tu estancia."
  },
  {
    q: "¿La piscina es privada o compartida?",
    a: "La piscina es comunitaria dentro del conjunto residencial privado donde se ubica Villa María. Es un espacio muy bien mantenido, seguro y tranquilo con zona infantil y caney."
  },
  {
    q: "¿A qué distancia están los cayos de Morrocoy?",
    a: "Estamos ubicados en la Calle 15 (Sector C15) de Chichiriviche. A solo 5 minutos en vehículo de los embarcaderos principales desde donde salen lanchas rápidas y peñeros hacia Cayo Sombrero, Cayo Muerto, Cayo Sal y Pelón."
  },
  {
    q: "¿Dónde está ubicada exactamente la casa?",
    a: "En la Calle 15 de Chichiriviche (Sector c15), en una urbanización cerrada con garita de seguridad. En la sección de mapa puedes hacer clic directo para abrir la ruta en Google Maps."
  }
];
