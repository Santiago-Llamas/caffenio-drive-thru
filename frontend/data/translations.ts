export type Lang = 'es' | 'en';

export const translations: Record<Lang, Record<string, string>> = {
  es: {
    // Bienvenida
    presionaParaIniciar: 'Presiona para iniciar',
    bienvenido: '¡Bienvenido!',
    queSeTeAntojaHoy: '¿Qué se te antoja hoy?',
    espanol: 'Español',
    ingles: 'English',

    // Identificación
    hola: '¡Hola!',
    seleccionaComoQuieresContinuar: 'Selecciona cómo quieres continuar',
    identificateConNFC: 'con NFC',
    identificateConQR: 'con QR',
    identificate: 'Identifícate',
    acercaTuDispositivoNFC: 'Acerca tu dispositivo NFC',
    escaneaDesdeLaApp: 'Escanea desde la App',
    invitado: 'Invitado',
    continiarSinCuenta: 'Continuar sin cuenta',
    puntoDeVenta: 'Punto de Venta: DRIVE-THRU TSM-1',
    developedBy: 'Developed by CODEX-tecmilenio',
    regresar: 'Regresar',

    // QR
    escaneandoCodigoQR: 'Escaneando Código QR...',
    colocaTuCodigoFrenteALaCamara: 'Coloca tu código frente a la cámara',
    coloqueSuCodigoQR: 'Coloque su código QR frente a la cámara',

    // NFC
    esperandoIdentificacionNFC: 'Esperando identificación NFC...',
    mantenTuDispositivoCerca: 'Mantén tu dispositivo cerca del lector',
    acerqueSuCelular: 'Acerque su celular o tarjeta al lector',

    // Favoritos
    tusFavoritos: 'Tus Favoritos',
    seleccionaTuBebidaFavorita: 'Selecciona tu bebida favorita para comenzar',
    explorarMenu: 'Explorar Menú',
    promociones: 'Promociones',
    queSeTeAntojaHoyNombre: '¿Qué se te antoja hoy,',

    // Sidebar izquierdo
    postres: 'Postres',
    comida: 'Comida',
    frios: 'Fríos',
    calientes: 'Calientes',
    deTemporada: 'DE TEMPORADA',
    asistenteIA: 'Asistente IA',

    // Menú principal
    menuPrincipal: 'Menú Principal',
    disfrutaNuestroMenu: 'Disfruta nuestro menú',
    bebidasFrias: 'Bebidas Frías',
    bebidasCalientes: 'Bebidas Calientes',

    // Carrito
    tuPedido: 'Tu Pedido',
    autoServicio: 'Auto-servicio #124',
    carritoVacio: 'El carrito está vacío',
    eliminar: 'Eliminar',
    subtotal: 'Subtotal',
    total: 'Total',
    pagarAhora: 'PAGAR AHORA',

    // Modal Métodos de Pago
    resumen: 'Resumen',
    totalAPagar: 'Total a Pagar',
    seleccionaTuMetodoDePago: 'Selecciona tu método de pago',
    comoPrefieresFinalizar: '¿Cómo prefieres finalizar tu orden?',
    tarjetaCreditoDebito: 'Tarjeta de Crédito/Débito',
    pagoRapidoYSeguro: 'Pago rápido y seguro',
    pagoEnEfectivo: 'Pago en Efectivo',
    pagaAlRecoger: 'Paga al recoger tu pedido',
    puntosApp: 'Puntos App',
    usaTusPuntos: 'Usa tus puntos acumulados',

    // Modal Éxito
    tuPedidoFueExitoso: '¡Tu pedido fue exitoso!',
    graciasPorTuPreferencia: 'Gracias por tu preferencia',
    finalizar: 'Finalizar',

    // Modal Personalizar
    configuracion: 'Configuración',
    seleccionadoHastaAhora: 'Seleccionado hasta ahora',
    tamano: 'Tamaño',
    sabor: 'Sabor',
    toppings: 'Toppings',
    pendiente: 'Pendiente',
    acompanalocon: 'Acompáñalo con',
    deQueTamanoLoPrefieres: '¿De qué tamaño lo prefieres?',
    eligeLaMedidaIdeal: 'Elige la medida ideal para tu café',
    recomendado: 'Recomendado',
    eligeTuSaborFavorito: 'Elige tu Sabor Favorito',
    seleccionaElSabor: 'Selecciona el sabor que más te guste',
    personalizaTuBebida: 'Personaliza tu bebida',
    seleccionaTusToppings: 'Selecciona tus toppings favoritos',
    sinToppingsDisponibles: 'No hay toppings disponibles para este producto.',
    agregarOtro: 'Agregar otro',
    pagarAhoraBtnModal: 'Pagar ahora',
    anterior: 'Anterior',
    paso: 'Paso',
    de: 'de',
    continuar: 'Continuar',
    confirmar: 'Confirmar',
    salirAlMenu: 'Salir al menú principal',

    // Sabores
    vainilla: 'Vainilla',
    avellana: 'Avellana',
    caramelo: 'Caramelo',
    chocolate: 'Chocolate',
    canela: 'Canela',
    sinSabor: 'Sin Sabor',
    sutilYDulce: 'Sutil y dulce',
    tostadoClasico: 'Tostado clásico',
    toqueArtesanal: 'Toque artesanal',
    cacaoIntenso: 'Cacao intenso',
    aromaEspeciado: 'Aroma especiado',
    saborOriginal: 'Sabor original',

    // Tamaños
    chico: 'Chico',
    mediano: 'Mediano',
    grande: 'Grande',

    // Modal IA
    queTeApeteceHoy: '¿Qué te apetece hoy?',
    pideTuBebidaFavorita: 'Pide tu bebida favorita...',
    recomendar: 'Recomendar',
    pensandoEnLasMejoresOpciones: 'Pensando en las mejores opciones para ti...',
    recomendacionesParaTi: 'Recomendaciones para ti',
    deseleccionarTodos: 'Deseleccionar todos',
    seleccionarTodos: 'Seleccionar todos',
    agregarRapido: 'Agregar rápido',
    producto: 'producto',
    productos: 'productos',
    seleccionado: 'seleccionado',
    seleccionados: 'seleccionados',
    agregarSeleccionadosAlCarrito: 'Agregar seleccionados al carrito',
    tuPedidoActual: 'Tu Pedido Actual',
    tuCarritoEstaVacio: 'Tu carrito está vacío',
    agregaAlgoDelicioso: '¡Agrega algo delicioso!',
    noSePudoCapturarVoz: 'No se pudo capturar la voz. Permite el micrófono e intenta de nuevo.',
    navegadorNoSoportaVoz: 'Tu navegador no soporta reconocimiento de voz. Prueba con Chrome, Edge o Safari.',
    agregadoAlCarrito: 'agregado al carrito con opciones',
  },
  en: {
    // Welcome
    presionaParaIniciar: 'Tap to start',
    bienvenido: 'Welcome!',
    queSeTeAntojaHoy: 'What are you craving today?',
    espanol: 'Español',
    ingles: 'English',

    // Identification
    hola: 'Hello!',
    seleccionaComoQuieresContinuar: 'Select how you want to continue',
    identificateConNFC: 'with NFC',
    identificateConQR: 'with QR',
    identificate: 'Identify',
    acercaTuDispositivoNFC: 'Bring your NFC device closer',
    escaneaDesdeLaApp: 'Scan from the App',
    invitado: 'Guest',
    continiarSinCuenta: 'Continue without account',
    puntoDeVenta: 'Point of Sale: DRIVE-THRU TSM-1',
    developedBy: 'Developed by CODEX-tecmilenio',
    regresar: 'Go Back',

    // QR
    escaneandoCodigoQR: 'Scanning QR Code...',
    colocaTuCodigoFrenteALaCamara: 'Place your code in front of the camera',
    coloqueSuCodigoQR: 'Place your QR code in front of the camera',

    // NFC
    esperandoIdentificacionNFC: 'Waiting for NFC identification...',
    mantenTuDispositivoCerca: 'Keep your device close to the reader',
    acerqueSuCelular: 'Bring your phone or card close to the reader',

    // Favorites
    tusFavoritos: 'Your Favorites',
    seleccionaTuBebidaFavorita: 'Select your favorite drink to get started',
    explorarMenu: 'Explore Menu',
    promociones: 'Promotions',
    queSeTeAntojaHoyNombre: 'What are you craving today,',

    // Left Sidebar
    postres: 'Desserts',
    comida: 'Food',
    frios: 'Cold',
    calientes: 'Hot',
    deTemporada: 'SEASONAL',
    asistenteIA: 'AI Assistant',

    // Main Menu
    menuPrincipal: 'Main Menu',
    disfrutaNuestroMenu: 'Enjoy our menu',
    bebidasFrias: 'Cold Drinks',
    bebidasCalientes: 'Hot Drinks',

    // Cart
    tuPedido: 'Your Order',
    autoServicio: 'Self-service #124',
    carritoVacio: 'Your cart is empty',
    eliminar: 'Remove',
    subtotal: 'Subtotal',
    total: 'Total',
    pagarAhora: 'PAY NOW',

    // Payment Methods Modal
    resumen: 'Summary',
    totalAPagar: 'Total to Pay',
    seleccionaTuMetodoDePago: 'Select your payment method',
    comoPrefieresFinalizar: 'How would you like to finish your order?',
    tarjetaCreditoDebito: 'Credit/Debit Card',
    pagoRapidoYSeguro: 'Fast and secure payment',
    pagoEnEfectivo: 'Cash Payment',
    pagaAlRecoger: 'Pay when picking up your order',
    puntosApp: 'App Points',
    usaTusPuntos: 'Use your accumulated points',

    // Success Modal
    tuPedidoFueExitoso: 'Your order was successful!',
    graciasPorTuPreferencia: 'Thank you for your preference',
    finalizar: 'Finish',

    // Customize Modal
    configuracion: 'Configuration',
    seleccionadoHastaAhora: 'Selected so far',
    tamano: 'Size',
    sabor: 'Flavor',
    toppings: 'Toppings',
    pendiente: 'Pending',
    acompanalocon: 'Pair it with',
    deQueTamanoLoPrefieres: 'What size do you prefer?',
    eligeLaMedidaIdeal: 'Choose the ideal size for your coffee',
    recomendado: 'Recommended',
    eligeTuSaborFavorito: 'Choose your Favorite Flavor',
    seleccionaElSabor: 'Select the flavor you like the most',
    personalizaTuBebida: 'Customize your drink',
    seleccionaTusToppings: 'Select your favorite toppings',
    sinToppingsDisponibles: 'No toppings available for this product.',
    agregarOtro: 'Add another',
    pagarAhoraBtnModal: 'Pay now',
    anterior: 'Previous',
    paso: 'Step',
    de: 'of',
    continuar: 'Continue',
    confirmar: 'Confirm',
    salirAlMenu: 'Back to main menu',

    // Flavors
    vainilla: 'Vanilla',
    avellana: 'Hazelnut',
    caramelo: 'Caramel',
    chocolate: 'Chocolate',
    canela: 'Cinnamon',
    sinSabor: 'No Flavor',
    sutilYDulce: 'Subtle and sweet',
    tostadoClasico: 'Classic roasted',
    toqueArtesanal: 'Artisan touch',
    cacaoIntenso: 'Intense cocoa',
    aromaEspeciado: 'Spiced aroma',
    saborOriginal: 'Original flavor',

    // Sizes
    chico: 'Small',
    mediano: 'Medium',
    grande: 'Large',

    // AI Modal
    queTeApeteceHoy: 'What are you in the mood for?',
    pideTuBebidaFavorita: 'Ask for your favorite drink...',
    recomendar: 'Recommend',
    pensandoEnLasMejoresOpciones: 'Thinking of the best options for you...',
    recomendacionesParaTi: 'Recommendations for you',
    deseleccionarTodos: 'Deselect all',
    seleccionarTodos: 'Select all',
    agregarRapido: 'Quick add',
    producto: 'product',
    productos: 'products',
    seleccionado: 'selected',
    seleccionados: 'selected',
    agregarSeleccionadosAlCarrito: 'Add selected to cart',
    tuPedidoActual: 'Your Current Order',
    tuCarritoEstaVacio: 'Your cart is empty',
    agregaAlgoDelicioso: 'Add something delicious!',
    noSePudoCapturarVoz: 'Could not capture voice. Allow microphone and try again.',
    navegadorNoSoportaVoz: 'Your browser does not support voice recognition. Try Chrome, Edge or Safari.',
    agregadoAlCarrito: 'added to cart with options',
  },
};
