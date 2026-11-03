// Everything the public site writes comes from the database. These are the first values:
// the server creates each missing key once at startup, so what the admin saves (or empties) is never overwritten.
// `group` is the admin tab where the text is edited; '_' means that tab already has its own field.
export interface SiteText { key: string; label: string; group: string; value: string }

export const SITE_TEXTS: SiteText[] = [
  { "key": "txt_reviews_word", "label": "Palabra junto al número de reseñas", "group": "hero", "value": "reseñas" },
  {
    "key": "txt_nav_login",
    "label": "Botón de acceso (escritorio)",
    "group": "nav",
    "value": "Acceder"
  },
  {
    "key": "txt_nav_login_mobile",
    "label": "Botón de acceso (móvil)",
    "group": "nav",
    "value": "Entrar"
  },
  {
    "key": "txt_nav_mybookings",
    "label": "Botón de mis reservas (móvil)",
    "group": "nav",
    "value": "Reservas"
  },
  {
    "key": "txt_per_night",
    "label": "Texto junto al precio",
    "group": "hero",
    "value": "/ noche"
  },
  {
    "key": "txt_from",
    "label": "Texto sobre el precio (móvil)",
    "group": "hero",
    "value": "Desde"
  },
  {
    "key": "txt_see_dates",
    "label": "Botón sobre la foto (móvil)",
    "group": "hero",
    "value": "Ver fechas"
  },
  {
    "key": "txt_book",
    "label": "Botón de reservar",
    "group": "hero",
    "value": "Reservar"
  },
  {
    "key": "txt_whatsapp",
    "label": "Botón de WhatsApp",
    "group": "hero",
    "value": "WhatsApp"
  },
  {
    "key": "txt_sticky_total",
    "label": "Barra móvil: palabra junto al total",
    "group": "hero",
    "value": "total"
  },
  {
    "key": "txt_sticky_night",
    "label": "Barra móvil: texto junto al precio",
    "group": "hero",
    "value": "/noche"
  },
  {
    "key": "txt_available_today",
    "label": "Botón flotante: disponible hoy",
    "group": "hero",
    "value": "Disponible hoy"
  },
  {
    "key": "txt_cal_title",
    "label": "Título del calendario",
    "group": "booking",
    "value": "Reserva tu estancia"
  },
  {
    "key": "txt_cal_sub",
    "label": "Frase bajo el título",
    "group": "booking",
    "value": "Selecciona tus huéspedes y las fechas de llegada y salida."
  },
  {
    "key": "txt_cal_guests",
    "label": "Encabezado de huéspedes",
    "group": "booking",
    "value": "1. Número de Huéspedes"
  },
  {
    "key": "txt_cal_dates",
    "label": "Encabezado de fechas",
    "group": "booking",
    "value": "2. Elige Fechas en el Calendario"
  },
  {
    "key": "txt_cal_adults",
    "label": "Adultos",
    "group": "booking",
    "value": "Adultos"
  },
  {
    "key": "txt_cal_children",
    "label": "Niños",
    "group": "booking",
    "value": "Niños"
  },
  {
    "key": "txt_cal_clear",
    "label": "Botón de limpiar fechas",
    "group": "booking",
    "value": "Limpiar"
  },
  {
    "key": "txt_cal_in",
    "label": "Resumen: llegada",
    "group": "booking",
    "value": "Llegada:"
  },
  {
    "key": "txt_cal_out",
    "label": "Resumen: salida",
    "group": "booking",
    "value": "Salida:"
  },
  {
    "key": "txt_cal_cleaning",
    "label": "Resumen: limpieza",
    "group": "booking",
    "value": "Gastos de limpieza"
  },
  {
    "key": "txt_cal_total",
    "label": "Resumen: total",
    "group": "booking",
    "value": "Total Estancia:"
  },
  {
    "key": "txt_cal_cta",
    "label": "Botón de reservar",
    "group": "booking",
    "value": "Reservar Ahora"
  },
  {
    "key": "txt_cal_trust1",
    "label": "Garantía 1",
    "group": "booking",
    "value": "Reserva Directa Segura"
  },
  {
    "key": "txt_cal_trust2",
    "label": "Garantía 2",
    "group": "booking",
    "value": "Confirmación Inmediata"
  },
  {
    "key": "txt_cal_place",
    "label": "Lugar bajo el botón",
    "group": "booking",
    "value": "Falcón, Chichiriviche"
  },
  {
    "key": "txt_cal_busy",
    "label": "Aviso de fechas ocupadas",
    "group": "booking",
    "value": "Algunas de las fechas seleccionadas ya están ocupadas o bloqueadas. Por favor elige otro rango."
  },
  {
    "key": "txt_form_title",
    "label": "Formulario: título",
    "group": "booking",
    "value": "Reserva Directa Villa María"
  },
  {
    "key": "txt_form_sub",
    "label": "Formulario: subtítulo",
    "group": "booking",
    "value": "Coordinación Directa por WhatsApp con el Anfitrión"
  },
  {
    "key": "txt_form_s1",
    "label": "Formulario: encabezado de datos",
    "group": "booking",
    "value": "1. Datos del Huésped Principal"
  },
  {
    "key": "txt_form_name",
    "label": "Formulario: nombre",
    "group": "booking",
    "value": "Nombre y Apellido *"
  },
  {
    "key": "txt_form_phone",
    "label": "Formulario: teléfono",
    "group": "booking",
    "value": "Teléfono / WhatsApp *"
  },
  {
    "key": "txt_form_email",
    "label": "Formulario: correo",
    "group": "booking",
    "value": "Correo Electrónico *"
  },
  {
    "key": "txt_form_notes",
    "label": "Formulario: notas",
    "group": "booking",
    "value": "Notas o Solicitudes Especiales"
  },
  {
    "key": "txt_form_s2",
    "label": "Formulario: encabezado de pago",
    "group": "booking",
    "value": "2. Método de Pago (Anticipo 50%)"
  },
  {
    "key": "txt_form_payinfo",
    "label": "Formulario: aviso de pago",
    "group": "booking",
    "value": "Las instrucciones detalladas para el pago del anticipo se enviarán por WhatsApp tras enviar la solicitud."
  },
  {
    "key": "txt_form_summary",
    "label": "Formulario: resumen",
    "group": "booking",
    "value": "Datos de Reserva"
  },
  {
    "key": "txt_form_total",
    "label": "Formulario: total",
    "group": "booking",
    "value": "Total Reserva:"
  },
  {
    "key": "txt_form_deposit",
    "label": "Formulario: anticipo",
    "group": "booking",
    "value": "Anticipo 50%:"
  },
  {
    "key": "txt_form_cta",
    "label": "Formulario: botón",
    "group": "booking",
    "value": "Confirmar Reserva y Comprobante"
  },
  {
    "key": "txt_ok_title",
    "label": "Confirmación: título",
    "group": "booking",
    "value": "¡Reserva Solicitada con Éxito!"
  },
  {
    "key": "txt_ok_sub",
    "label": "Confirmación: frase",
    "group": "booking",
    "value": "Tus fechas han quedado reservadas en nuestro sistema."
  },
  {
    "key": "txt_ok_code",
    "label": "Confirmación: código",
    "group": "booking",
    "value": "Código de Reserva"
  },
  {
    "key": "txt_ok_guest",
    "label": "Confirmación: huésped",
    "group": "booking",
    "value": "Huésped:"
  },
  {
    "key": "txt_ok_people",
    "label": "Confirmación: personas",
    "group": "booking",
    "value": "Personas:"
  },
  {
    "key": "txt_ok_total",
    "label": "Confirmación: total",
    "group": "booking",
    "value": "Monto Total:"
  },
  {
    "key": "txt_ok_wa",
    "label": "Confirmación: botón de WhatsApp",
    "group": "booking",
    "value": "Enviar Comprobante por WhatsApp"
  },
  {
    "key": "txt_ok_pass",
    "label": "Confirmación: botón del pase",
    "group": "booking",
    "value": "Ver / Descargar Pase con Código QR"
  },
  {
    "key": "txt_ok_close",
    "label": "Confirmación: cerrar",
    "group": "booking",
    "value": "Cerrar y Volver"
  },
  {
    "key": "txt_attr_access",
    "label": "Pie de cada tarjeta",
    "group": "attractions",
    "value": "Acceso en embarcación"
  },
  {
    "key": "txt_faq_rules",
    "label": "Título de normas",
    "group": "faq",
    "value": "Normas de la Casa"
  },
  {
    "key": "txt_faq_cancel",
    "label": "Título de cancelación",
    "group": "faq",
    "value": "Política de Cancelación"
  },
  {
    "key": "txt_faq_faq",
    "label": "Título de preguntas",
    "group": "faq",
    "value": "Preguntas Frecuentes"
  },
  {
    "key": "txt_loc_addr",
    "label": "Título de la dirección",
    "group": "location",
    "value": "Dirección Exacta"
  },
  {
    "key": "txt_loc_btn",
    "label": "Botón del mapa",
    "group": "location",
    "value": "Abrir en Google Maps GPS"
  },
  {
    "key": "txt_rev_title",
    "label": "Título",
    "group": "reviews",
    "value": "Opiniones de Huéspedes"
  },
  {
    "key": "txt_rev_sub",
    "label": "Frase de apoyo",
    "group": "reviews",
    "value": "Experiencias reales de familias que han disfrutado de su estancia en Villa María."
  },
  {
    "key": "txt_rev_add",
    "label": "Botón de dejar opinión",
    "group": "reviews",
    "value": "Dejar una Opinión"
  },
  {
    "key": "txt_rev_empty",
    "label": "Sin opiniones",
    "group": "reviews",
    "value": "Aún no hay opiniones publicadas. ¡Sé el primero en dejar la tuya!"
  },
  {
    "key": "txt_rev_thanks",
    "label": "Agradecimiento",
    "group": "reviews",
    "value": "¡Gracias! Tu opinión fue enviada y será publicada tras revisión."
  },
  {
    "key": "txt_rev_note",
    "label": "Aviso de revisión",
    "group": "reviews",
    "value": "Tu opinión será publicada tras revisión del anfitrión."
  },
  {
    "key": "txt_rev_rating",
    "label": "Calificación",
    "group": "reviews",
    "value": "Calificación"
  },
  {
    "key": "txt_rev_verified",
    "label": "Etiqueta de estadía",
    "group": "reviews",
    "value": "Estadía Verificada"
  },
  {
    "key": "txt_rev_name",
    "label": "Campo nombre",
    "group": "reviews",
    "value": "Tu Nombre *"
  },
  {
    "key": "txt_rev_city",
    "label": "Campo ciudad",
    "group": "reviews",
    "value": "Ciudad / Origen"
  },
  {
    "key": "txt_rev_comment",
    "label": "Campo opinión",
    "group": "reviews",
    "value": "¿Qué tal tu estancia en Villa María? *"
  },
  {
    "key": "txt_rev_cancel",
    "label": "Cancelar",
    "group": "reviews",
    "value": "Cancelar"
  },
  {
    "key": "txt_foot_nav",
    "label": "Título de navegación",
    "group": "footer",
    "value": "Navegación"
  },
  {
    "key": "txt_foot_contact",
    "label": "Título de contacto",
    "group": "footer",
    "value": "Contacto Directo"
  },
  {
    "key": "txt_foot_maps",
    "label": "Botón del mapa",
    "group": "footer",
    "value": "Ver en Google Maps"
  },
  {
    "key": "txt_foot_love",
    "label": "Texto final",
    "group": "footer",
    "value": "para vacaciones inolvidables."
  },
  {
    "key": "txt_auth_reg",
    "label": "Título de registro",
    "group": "account",
    "value": "Crear Cuenta de Cliente"
  },
  {
    "key": "txt_auth_login",
    "label": "Título de acceso",
    "group": "account",
    "value": "Acceso a Villa María"
  },
  {
    "key": "txt_auth_regsub",
    "label": "Frase de registro",
    "group": "account",
    "value": "Regístrate para gestionar tus reservas y consultar tu historial"
  },
  {
    "key": "txt_auth_loginsub",
    "label": "Frase de acceso",
    "group": "account",
    "value": "Introduce tus credenciales para acceder"
  },
  {
    "key": "txt_auth_name",
    "label": "Campo nombre",
    "group": "account",
    "value": "Nombre Completo"
  },
  {
    "key": "txt_auth_email",
    "label": "Campo correo",
    "group": "account",
    "value": "Correo Electrónico"
  },
  {
    "key": "txt_auth_phone",
    "label": "Campo teléfono",
    "group": "account",
    "value": "Teléfono (opcional)"
  },
  {
    "key": "txt_auth_btnlogin",
    "label": "Botón iniciar sesión",
    "group": "account",
    "value": "Iniciar Sesión"
  },
  {
    "key": "txt_auth_toreg",
    "label": "Enlace a registro",
    "group": "account",
    "value": "¿No tienes cuenta? Regístrate gratis"
  },
  {
    "key": "txt_auth_tologin",
    "label": "Enlace a acceso",
    "group": "account",
    "value": "¿Ya tienes cuenta? Inicia sesión aquí"
  },
  {
    "key": "txt_my_title",
    "label": "Mis reservas: título",
    "group": "account",
    "value": "Mis Reservas en Villa María"
  },
  {
    "key": "txt_my_sub",
    "label": "Mis reservas: frase",
    "group": "account",
    "value": "Consulta o gestiona tus estadías registradas"
  },
  {
    "key": "txt_my_empty",
    "label": "Mis reservas: vacío",
    "group": "account",
    "value": "No hay reservas registradas"
  },
  {
    "key": "txt_my_emptysub",
    "label": "Mis reservas: frase vacío",
    "group": "account",
    "value": "Usa el calendario principal para seleccionar tus fechas y realizar una reserva."
  },
  {
    "key": "txt_my_search",
    "label": "Mis reservas: buscador",
    "group": "account",
    "value": "Buscar por código, nombre o teléfono..."
  },
  {
    "key": "txt_my_pass",
    "label": "Mis reservas: botón del pase",
    "group": "account",
    "value": "Pase de Entrada & QR"
  },
  {
    "key": "txt_my_confirm",
    "label": "Mis reservas: confirmar cancelación",
    "group": "account",
    "value": "¿Estás seguro de cancelar esta reserva?"
  },
  {
    "key": "txt_v_title",
    "label": "Título",
    "group": "voucher",
    "value": "Pase de Entrada & Check-In Garita"
  },
  {
    "key": "txt_v_sub",
    "label": "Subtítulo",
    "group": "voucher",
    "value": "Voucher de Check-in & Acceso"
  },
  {
    "key": "txt_v_official",
    "label": "Etiqueta",
    "group": "voucher",
    "value": "Pase Digital Oficial"
  },
  {
    "key": "txt_v_code",
    "label": "Código",
    "group": "voucher",
    "value": "Código de Entrada"
  },
  {
    "key": "txt_v_guest",
    "label": "Huésped",
    "group": "voucher",
    "value": "Huésped Principal"
  },
  {
    "key": "txt_v_people",
    "label": "Ocupantes",
    "group": "voucher",
    "value": "Ocupantes"
  },
  {
    "key": "txt_v_whole",
    "label": "Tipo de alojamiento",
    "group": "voucher",
    "value": "Casa completa"
  },
  {
    "key": "txt_v_ok",
    "label": "Estado",
    "group": "voucher",
    "value": "Reserva Autorizada"
  },
  {
    "key": "txt_v_wifi",
    "label": "Título del Wi-Fi",
    "group": "voucher",
    "value": "Wi-Fi de Alta Velocidad (Fibra)"
  },
  {
    "key": "txt_v_gate",
    "label": "Título de la garita",
    "group": "voucher",
    "value": "Control de Garita"
  },
  {
    "key": "txt_v_gate2",
    "label": "Aviso de la garita",
    "group": "voucher",
    "value": "El personal tiene tu nombre y matrícula autorizados en la lista de huéspedes."
  },
  {
    "key": "txt_v_png1",
    "label": "Imagen: instrucción",
    "group": "voucher",
    "value": "Presenta este código en la garita de seguridad de la Calle 15"
  },
  {
    "key": "txt_v_png2",
    "label": "Imagen: seguridad",
    "group": "voucher",
    "value": "Urb. Privada con vigilancia 24/7 y acceso controlado"
  },
  {
    "key": "txt_v_png3",
    "label": "Imagen: subtítulo",
    "group": "voucher",
    "value": "PASE DIGITAL DE ACCESO & CHECK-IN • CHICHIRIVICHE"
  },
  {
    "key": "txt_v_png4",
    "label": "Imagen: estado",
    "group": "voucher",
    "value": "● RESERVA CONFIRMADA & ACCESO GARANTIZADO"
  },
  {
    "key": "hero_photo_badge",
    "label": "",
    "group": "_",
    "value": "Piscina Climatizada"
  },
  {
    "key": "hero_feat1",
    "label": "",
    "group": "_",
    "value": "Piscina Privada"
  },
  {
    "key": "hero_feat2",
    "label": "",
    "group": "_",
    "value": "Fibra 600Mb"
  },
  {
    "key": "hero_feat3",
    "label": "",
    "group": "_",
    "value": "Luz y Agua 24/7"
  },
  {
    "key": "hero_feat4",
    "label": "",
    "group": "_",
    "value": "Parking Privado"
  },
  {
    "key": "hero_rating",
    "label": "",
    "group": "_",
    "value": "4.96/5.0"
  },
  {
    "key": "hero_reviews_count",
    "label": "",
    "group": "_",
    "value": "48"
  },
  {
    "key": "hero_price_label",
    "label": "",
    "group": "_",
    "value": "Tarifa Estándar"
  },
  {
    "key": "whatsapp_greeting",
    "label": "",
    "group": "_",
    "value": "Hola Villa María, me gustaría consultar disponibilidad y precios para reservar."
  },
  {
    "key": "site_name",
    "label": "",
    "group": "_",
    "value": "Villa María"
  },
  {
    "key": "gallery_title",
    "label": "",
    "group": "_",
    "value": "Fotos de Villa María"
  },
  {
    "key": "gallery_subtitle",
    "label": "",
    "group": "_",
    "value": "Galería dinámica de la propiedad, jardines, piscina climatizada y estancias."
  },
  {
    "key": "gallery_cat1",
    "label": "",
    "group": "_",
    "value": "Todas"
  },
  {
    "key": "gallery_cat2",
    "label": "",
    "group": "_",
    "value": "Fachada & Porche"
  },
  {
    "key": "gallery_cat3",
    "label": "",
    "group": "_",
    "value": "Piscina & Jardines"
  },
  {
    "key": "gallery_cat4",
    "label": "",
    "group": "_",
    "value": "Habitaciones & Salón"
  },
  {
    "key": "amenities_title",
    "label": "",
    "group": "_",
    "value": "Comodidades incluidas"
  },
  {
    "key": "amenities_subtitle",
    "label": "",
    "group": "_",
    "value": "Instalaciones preparadas para tu máximo confort durante tus vacaciones en Chichiriviche."
  },
  {
    "key": "location_title",
    "label": "",
    "group": "_",
    "value": "Chichiriviche • Calle 15"
  },
  {
    "key": "location_subtitle",
    "label": "",
    "group": "_",
    "value": "Urbanización privada segura con fácil acceso a los embarcaderos y al Parque Nacional Morrocoy."
  },
  {
    "key": "location_bullet_1",
    "label": "",
    "group": "_",
    "value": "5 minutos de los embarcaderos a Cayo Sombrero"
  },
  {
    "key": "location_bullet_2",
    "label": "",
    "group": "_",
    "value": "Condominio privado con vigilancia las 24 horas"
  },
  {
    "key": "location_bullet_3",
    "label": "",
    "group": "_",
    "value": "Supermercados y servicios a 3 minutos"
  },
  {
    "key": "location_embed_url",
    "label": "",
    "group": "_",
    "value": "https://www.openstreetmap.org/export/embed.html?bbox=-68.3136%2C10.8917%2C-68.2336%2C10.9717&layer=mapnik&marker=10.9317%2C-68.2736"
  },
  {
    "key": "attractions_title",
    "label": "",
    "group": "_",
    "value": "Cayos & Playas Cercanas"
  },
  {
    "key": "attractions_subtitle",
    "label": "",
    "group": "_",
    "value": "Descubre los mejores cayos de aguas turquesas a solo minutos de la villa."
  },
  {
    "key": "faq_title",
    "label": "",
    "group": "_",
    "value": "Información & Preguntas"
  },
  {
    "key": "faq_subtitle",
    "label": "",
    "group": "_",
    "value": "Todo lo que necesitas saber para una estancia tranquila y sin sorpresas."
  },
  {
    "key": "footer_description",
    "label": "",
    "group": "_",
    "value": "Disfruta de las mejores vacaciones en el Estado Falcón. Urbanización privada con piscina climatizada, agua constante 24/7 y planta eléctrica."
  },
  {
    "key": "footer_tagline",
    "label": "",
    "group": "_",
    "value": "Alojamiento Turístico & Relax • Chichiriviche"
  },
  {
    "key": "wifi_ssid",
    "label": "",
    "group": "_",
    "value": "VillaMaria_Privada_5G"
  },
  {
    "key": "wifi_password",
    "label": "",
    "group": "_",
    "value": "MorrocoySol2026!"
  },
  {
    "key": "weather_enabled",
    "label": "",
    "group": "_",
    "value": "true"
  },
  {
    "key": "weather_lat",
    "label": "Latitud",
    "group": "weather",
    "value": "10.9317"
  },
  {
    "key": "weather_lon",
    "label": "Longitud",
    "group": "weather",
    "value": "-68.2736"
  },
  {
    "key": "txt_weather_place",
    "label": "Lugar",
    "group": "weather",
    "value": "Chichiriviche"
  },
  {
    "key": "txt_weather_badge",
    "label": "Etiqueta",
    "group": "weather",
    "value": "Morrocoy Hoy"
  },
  {
    "key": "txt_weather_panel",
    "label": "Título del detalle",
    "group": "weather",
    "value": "Estado del Mar & Pronóstico Náutico"
  },
  {
    "key": "seo_title",
    "label": "",
    "group": "_",
    "value": "Villa María - Casa de Playa en Chichiriviche"
  },
  {
    "key": "seo_description",
    "label": "",
    "group": "_",
    "value": "Villa María: casa de playa privada en Chichiriviche, Falcón. Consulta disponibilidad y reserva en línea."
  },
  {
    "key": "seo_image",
    "label": "",
    "group": "_",
    "value": ""
  },
  {
    "key": "txt_nav_home",
    "label": "Inicio",
    "group": "nav",
    "value": "Inicio"
  },
  {
    "key": "txt_nav_photos",
    "label": "Fotos",
    "group": "nav",
    "value": "Fotos"
  },
  {
    "key": "txt_nav_services",
    "label": "Servicios",
    "group": "nav",
    "value": "Servicios"
  },
  {
    "key": "txt_nav_dates",
    "label": "Fechas (móvil)",
    "group": "nav",
    "value": "Fechas"
  },
  {
    "key": "txt_nav_book",
    "label": "Reservar (escritorio)",
    "group": "nav",
    "value": "Reservar"
  },
  {
    "key": "txt_v_in_prefix",
    "label": "Antes de la hora de entrada",
    "group": "voucher",
    "value": "Desde las"
  },
  {
    "key": "txt_v_out_prefix",
    "label": "Antes de la hora de salida",
    "group": "voucher",
    "value": "Hasta las"
  },
  {
    "key": "banner_items",
    "label": "",
    "group": "_",
    "value": "[{\"id\": \"b1\", \"badge\": \"Garantía Total\", \"text\": \"Suministro constante de agua, planta eléctrica 24/7 y piscina privada climatizada.\"}, {\"id\": \"b2\", \"badge\": \"Ubicación Premium\", \"text\": \"Calle 15, Chichiriviche • A 5 minutos de los embarcaderos a Cayo Sombrero.\"}, {\"id\": \"b3\", \"badge\": \"Reserva Flexible\", \"text\": \"Confirmación inmediata por WhatsApp y atención personalizada.\"}, {\"id\": \"b4\", \"badge\": \"Piscina Privada\", \"text\": \"Piscina climatizada con hamacas y área de solárium.\"}]"
  },
  {
    "key": "faqs",
    "label": "",
    "group": "_",
    "value": "[{\"id\": \"faq1\", \"question\": \"¿Cómo funciona el proceso de reserva?\", \"answer\": \"Seleccionas las fechas en nuestro calendario en vivo. Al enviar tu solicitud, el sistema valida que no haya cruce con otras reservas. Confirmas con un anticipo del 50% vía Zelle, Pago Móvil o Transferencia y recibes tu comprobante con la ubicación exacta.\"}, {\"id\": \"faq2\", \"question\": \"¿Tienen agua constante y planta eléctrica?\", \"answer\": \"Sí, la casa cuenta con un tanque subterráneo y aéreo de alta capacidad con hidroneumático, además de planta eléctrica de respaldo para garantizar confort continuo durante toda tu estancia.\"}, {\"id\": \"faq3\", \"question\": \"¿La piscina es privada o compartida?\", \"answer\": \"La piscina es comunitaria dentro del conjunto residencial privado donde se ubica Villa María. Es un espacio muy bien mantenido, seguro y tranquilo con zona infantil y caney.\"}, {\"id\": \"faq4\", \"question\": \"¿A qué distancia están los cayos de Morrocoy?\", \"answer\": \"Estamos ubicados en la Calle 15 (Sector C15) de Chichiriviche. A solo 5 minutos en vehículo de los embarcaderos principales desde donde salen lanchas rápidas y peñeros hacia Cayo Sombrero, Cayo Muerto, Cayo Sal y Pelón.\"}, {\"id\": \"faq5\", \"question\": \"¿Dónde está ubicada exactamente la casa?\", \"answer\": \"En la Calle 15 de Chichiriviche (Sector c15), en una urbanización cerrada con garita de seguridad. En la sección de mapa puedes hacer clic directo para abrir la ruta en Google Maps.\"}]"
  }
];
