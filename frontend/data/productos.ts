export interface Producto {
  id: number;
  nombre: string;
  categoria: 'bebida' | 'comida' | 'postre';
  precio: number;
  imagen: string;
  descripcion?: string;
  opciones: {
    tamanos?: string[];
    leches?: string[];
    toppings?: string[];
  };
}

export interface ItemCarrito extends Producto {
  cantidad: number;
  tamanoSeleccionado?: string;
  lecheSeleccionada?: string;
  toppingsSeleccionados?: string[];
}

export const productos: Producto[] = [
  // ========== TUS PRODUCTOS ORIGINALES (IDs 1-4) ==========
  {
    id: 1,
    nombre: 'Espresso',
    categoria: 'bebida',
    precio: 67.7,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/Grupo-20009.png',
    descripcion: 'Shot de café espresso, intenso y clásico de Caffenio.',
    opciones: {
      tamanos: ['simple', 'doble'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['canela', 'cacao', 'chantillí']
    }
  },
  {
    id: 2,
    nombre: 'Latte',
    categoria: 'bebida',
    precio: 60,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/LATTE-FRIO.png',
    descripcion: 'Leche cremada con espresso vertido encima — sabor suave donde predomina la leche.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['canela', 'cacao', 'vainilla']
    }
  },
  
  {
    id: 4,
    nombre: 'Chai Latte',
    categoria: 'bebida',
    precio: 44,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/CHAI-CALIENTE.png',
    descripcion: 'Mezcla de finas especias y té negro con leche cremada; si lo quieres, puedes pedir un shot extra de espresso (“Dirty Chai”).',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['canela', 'jengibre', 'miel']
    }
  },

  // ==================== BEBIDAS CALIENTES (IDs 5-21) ====================
  {
    id: 5,
    nombre: 'Cappuccino',
    categoria: 'bebida',
    precio: 63,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/CAPUCCINO.png',
    descripcion: 'Preparado con espresso y leche cremada — una mezcla clásica de café fuerte con textura espumosa.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['canela', 'cacao']
    }
  },
  {
    id: 6,
    nombre: 'Cappuccino Nutella®',
    categoria: 'bebida',
    precio: 91,
    imagen: 'https://images.rappi.com.mx/products/tmpImg04918e98-b75c-464a-874f-a2d1d1c25971.png?d=300x300&e=webp&q=10',
    descripcion: 'Cappuccino con base de espresso, leche cremada y un toque delicioso de Nutella.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['nutella', 'avellanas']
    }
  },
  {
    id: 7,
    nombre: 'Cappuccino Lotus®',
    categoria: 'bebida',
    precio: 63,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/CAPUCCINO.png',
    descripcion: 'Cappuccino con café espresso, leche y crema de galleta Lotus caramelizada — dulce y cremoso.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['galleta lotus', 'caramelo']
    }
  },
  {
    id: 8,
    nombre: 'Latte Caliente',
    categoria: 'bebida',
    precio: 70,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/LATTE-CALIENTE.png',
    descripcion: 'Leche cremada con espresso vertido encima — sabor suave donde predomina la leche.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['canela', 'vainilla']
    }
  },
  {
    id: 9,
    nombre: 'Mexicano (tipo Americano)',
    categoria: 'bebida',
    precio: 38,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/AMERICANO-CALIENTE.png',
    descripcion: 'Café caliente elaborado con granos mexicanos de calidad Pluma Hidalgo, preparado para obtener máximo aroma y sabor.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: []
    }
  },
  {
    id: 10,
    nombre: 'Mexicano Espresso (tipo Americano)',
    categoria: 'bebida',
    precio: 38,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/AMERICANO-CALIENTE.png',
    descripcion: 'Café caliente a base de espresso con granos mexicanos, intenso en aroma.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: []
    }
  },
  {
    id: 11,
    nombre: 'Mexicano Espresso con Leche',
    categoria: 'bebida',
    precio: 43,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/AMERICANO-CALIENTE.png',
    descripcion: 'Café espresso mexicano servido con leche.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena']
    }
  },
  {
    id: 12,
    nombre: 'Mexicano con Leche',
    categoria: 'bebida',
    precio: 44,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/AMERICANO-CALIENTE.png',
    descripcion: 'Café americano tipo mexicano servido con leche.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena']
    }
  },
  {
    id: 13,
    nombre: 'Espresso (doble)',
    categoria: 'bebida',
    precio: 55,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/Grupo-20009.png',
    descripcion: 'Doble shot de café espresso, intenso y clásico de Caffenio.',
    opciones: {
      tamanos: ['simple', 'doble'],
      leches: []
    }
  },
  {
    id: 14,
    nombre: 'Té Chai Latte caliente',
    categoria: 'bebida',
    precio: 66,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/CHAI-CALIENTE.png',
    descripcion: 'Mezcla de finas especias y té negro con leche cremada; si lo quieres, puedes pedir un shot extra de espresso (“Dirty Chai”).',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['canela', 'jengibre']
    }
  },
  {
    id: 15,
    nombre: 'Chocolate Oaxaqueño caliente',
    categoria: 'bebida',
    precio: 66,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/CHOCOLATE-CALIENTE.png',
    descripcion: 'El sabor de la tradición — bebida de chocolate mexicano con leche cremada (se suele ofrecer con bombones opcionales).',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['bombones', 'canela']
    }
  },
  {
    id: 16,
    nombre: 'Chocolate Blanco Caliente',
    categoria: 'bebida',
    precio: 73,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/CHOCOLATE-CALIENTE.png',
    descripcion: 'Bebida caliente de chocolate blanco hecha con leche cremada.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['chispas blancas']
    }
  },
  {
    id: 17,
    nombre: 'Horchata Caliente',
    categoria: 'bebida',
    precio: 61,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2026/01/horchata.png',
    descripcion: 'Bebida caliente con sabor a horchata de arroz y toques de canela, también opcional con espresso.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['canela']
    }
  },
  {
    id: 18,
    nombre: 'Tisana caliente',
    categoria: 'bebida',
    precio: 71,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/TISANA-CALIENTE.png',
    descripcion: 'Infusión de frutas, hierbas y especias en agua caliente — sin café y muy aromática.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: []
    }
  },
  {
    id: 19,
    nombre: 'Té Matcha caliente',
    categoria: 'bebida',
    precio: 81,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2026/01/matcha.webp',
    descripcion: 'Té verde matcha preparado con leche cremada.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['matcha extra']
    }
  },
  {
    id: 20,
    nombre: 'Té Honeybush caliente',
    categoria: 'bebida',
    precio: 68,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/TE-CALIENTE.png',
    descripcion: 'Té con aroma y sabor ligeramente dulce y afrutado.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: []
    }
  },
  {
    id: 21,
    nombre: 'Avena (caliente)',
    categoria: 'bebida',
    precio: 68,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2025/03/regular@2x-1.png',
    descripcion: 'Avena esponjosa preparada con leche o agua, con trocitos (como fresa deshidratada o almendra), servida caliente.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['fresa', 'almendra']
    }
  },

  // ==================== CAFÉS FRÍOS (IDs 22-28) ====================
  {
    id: 22,
    nombre: 'Lateada®',
    categoria: 'bebida',
    precio: 70,
    imagen: ' https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/LATEADA.png',
    descripcion: 'Bebida fría a base de café espresso y leche, cremosa y refrescante.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['canela', 'cacao']
    }
  },
  {
    id: 23,
    nombre: 'Mexicano Frío',
    categoria: 'bebida',
    precio: 38,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/AMERICANO-FRIO.png',
    descripcion: 'Café frío elaborado con granos mexicanos, servido con hielo.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: []
    }
  },
  {
    id: 24,
    nombre: 'Mexicano Espresso Frío',
    categoria: 'bebida',
    precio: 40,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/AMERICANO-FRIO.png',
    descripcion: 'Café a base de espresso servido frío, intenso y aromático.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: []
    }
  },
  {
    id: 25,
    nombre: 'Mexicano con Leche Frío',
    categoria: 'bebida',
    precio: 43,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/AMERICANO-FRIO.png',
    descripcion: 'Café mexicano frío mezclado con leche y hielo.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena']
    }
  },
  {
    id: 26,
    nombre: 'Americano Frío',
    categoria: 'bebida',
    precio: 40,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/AMERICANO-FRIO.png',
    descripcion: 'Espresso con agua y hielo, ligero y refrescante.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: []
    }
  },
  {
    id: 27,
    nombre: 'Latte Frío',
    categoria: 'bebida',
    precio: 62,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/LATTE-FRIO.png',
    descripcion: 'Leche y espresso servidos con hielo, sabor suave y cremoso.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['vainilla']
    }
  },
  {
    id: 28,
    nombre: 'Cappuccino Frío',
    categoria: 'bebida',
    precio: 63,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2025/12/Rockaccino-1.png',
    descripcion: 'Espresso con leche fría y hielo, con textura ligera.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['canela']
    }
  },

  // ==================== BEBIDAS FRÍAS (sabores y sin café, IDs 29-38) ====================
  {
    id: 29,
    nombre: 'Lateada® Vainilla',
    categoria: 'bebida',
    precio: 70,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/LATEADA.png',
    descripcion: 'Lateada fría con sabor vainilla.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['vainilla']
    }
  },
  {
    id: 30,
    nombre: 'Lateada® Caramelo',
    categoria: 'bebida',
    precio: 70,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/LATEADA.png',
    descripcion: 'Lateada fría con toque dulce de caramelo.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['caramelo']
    }
  },
  {
    id: 31,
    nombre: 'Lateada® Moka',
    categoria: 'bebida',
    precio: 70,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/LATEADA.png',
    descripcion: 'Lateada fría con chocolate.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['chocolate']
    }
  },
  {
    id: 32,
    nombre: 'Lateada® Cajeta',
    categoria: 'bebida',
    precio: 70,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/LATEADA.png',
    descripcion: 'Lateada fría con sabor tradicional a cajeta.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['cajeta']
    }
  },
  {
    id: 33,
    nombre: 'Chai Latte Frío',
    categoria: 'bebida',
    precio: 66,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/Enmascarar-grupo-105.png',
    descripcion: 'Mezcla de té negro con especias y leche, servido con hielo.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['canela']
    }
  },
  {
    id: 34,
    nombre: 'Matcha Frío',
    categoria: 'bebida',
    precio: 81,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2026/01/matcha.webp',
    descripcion: 'Té verde matcha mezclado con leche y hielo.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['matcha extra']
    }
  },
  {
    id: 35,
    nombre: 'Chocolate Oaxaqueño Frío',
    categoria: 'bebida',
    precio: 66,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/CHOCOLATE.png',
    descripcion: 'Bebida fría de chocolate mexicano con leche y hielo.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['bombones']
    }
  },
  {
    id: 36,
    nombre: 'Chocolate Blanco Frío',
    categoria: 'bebida',
    precio: 73,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/CHOCOLATE.png',
    descripcion: 'Chocolate blanco mezclado con leche y hielo.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['chispas blancas']
    }
  },
  {
    id: 37,
    nombre: 'Horchata Fría',
    categoria: 'bebida',
    precio: 61,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2026/01/horchata.png',
    descripcion: 'Bebida sabor horchata con hielo; puede pedirse con espresso.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['canela']
    }
  },
  {
    id: 38,
    nombre: 'Tisana Fría',
    categoria: 'bebida',
    precio: 71,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/TISANA-FRIO.png',
    descripcion: 'Infusión frutal y herbal servida fría, sin café.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: []
    }
  },

  // ==================== BEBIDAS TIPO FRAPPÉ (IDs 39-44) ====================
  {
    id: 39,
    nombre: 'Kfreeze®',
    categoria: 'bebida',
    precio: 76,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/KFREEZE.png',
    descripcion: 'Bebida frappé a base de café, leche y hielo triturado.',
    opciones: {
      tamanos: ['mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['crema', 'chocolate']
    }
  },
  {
    id: 40,
    nombre: 'Kfreeze® Vainilla',
    categoria: 'bebida',
    precio: 76,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/KFREEZE.png',
    descripcion: 'Versión frappé con sabor vainilla.',
    opciones: {
      tamanos: ['mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['vainilla', 'crema']
    }
  },
  {
    id: 41,
    nombre: 'Kfreeze® Caramelo',
    categoria: 'bebida',
    precio: 76,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/KFREEZE.png',
    descripcion: 'Versión frappé con caramelo.',
    opciones: {
      tamanos: ['mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['caramelo', 'crema']
    }
  },
  {
    id: 42,
    nombre: 'Kfreeze® Moka',
    categoria: 'bebida',
    precio: 77,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/KFREEZE.png',
    descripcion: 'Versión frappé con chocolate.',
    opciones: {
      tamanos: ['mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['chocolate', 'crema']
    }
  },
  {
    id: 43,
    nombre: 'Kfreeze® Cajeta',
    categoria: 'bebida',
    precio: 76,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/KFREEZE.png',
    descripcion: 'Versión frappé con cajeta.',
    opciones: {
      tamanos: ['chico','mediano', 'grande'],
      leches: ['entera', 'deslactosada', 'almendras', 'avena'],
      toppings: ['cajeta', 'crema']
    }
  },
  {
    id: 44,
    nombre: 'Kombucha ',
    categoria: 'bebida',
    precio: 61,
    imagen: 'https://images.rappi.com.mx/products/tmpImg73154048-a501-4ba8-b554-ba27245c5926.png?d=300x300&e=webp&q=10',
    descripcion: 'Bebida fermentada, ligeramente gasificada y refrescante.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      leches: []
    }
  }, // <-- ¡COMA AÑADIDA AQUÍ!

  // ==================== ALIMENTOS (IDs 45-57) ====================
  {
    id: 45,
    nombre: 'Panini Italiano',
    categoria: 'comida',
    precio: 90,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/PANINI.png',
    descripcion: 'Pan a las finas hierbas acompañado de jamón de pierna, salami italiano, queso gouda y aderezo de tomate.',
    opciones: {
      tamanos: ['único'],
      toppings: ['aderezo extra', 'chiltepín', 'guacamole']
    }
  },
  {
    id: 46,
    nombre: 'Croissant',
    categoria: 'comida',
    precio: 76,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2024/04/Grupo-20020@2x.png',
    descripcion: 'Pan finamente seleccionado, con un toque de mantequilla, relleno de jamón y queso. Disfrútalo frío o caliente.',
    opciones: {
      tamanos: ['único'],
      toppings: ['caliente', 'frío']
    }
  },
  {
    id: 47,
    nombre: 'Chapata',
    categoria: 'comida',
    precio: 94,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/CHAPATA.png',
    descripcion: 'Elaborado con delicioso pan tipo chapata, jamón, queso manchego y chilorio.',
    opciones: {
      tamanos: ['único'],
      toppings: ['chilorio extra', 'queso extra']
    }
  },
  {
    id: 48,
    nombre: 'Waffle',
    categoria: 'comida',
    precio: 50,
    imagen: 'https://tse4.mm.bing.net/th/id/OIP.KuEUp1t6Ooo_MfvGQiESZAHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',
    descripcion: 'Esponjoso waffle dorado, ideal para acompañar con miel, mermelada o crema.',
    opciones: {
      tamanos: ['único'],
      toppings: ['miel', 'mermelada', 'crema', 'chocolate']
    }
  },
  {
    id: 49,
    nombre: 'Bagel de Huevito',
    categoria: 'comida',
    precio: 88,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/BAGEL.png',
    descripcion: 'Pan tipo bagel con fritatta de huevo, tocino ahumado y queso gouda.',
    opciones: {
      tamanos: ['único'],
      toppings: ['tocino extra', 'queso extra']
    }
  },
  {
    id: 50,
    nombre: 'Club Sándwich',
    categoria: 'comida',
    precio: 130,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2024/04/Grupo-20019@2x.png ',
    descripcion: 'Elaborado con pan integral, tocino ahumado, pechuga de pollo, queso gouda, queso manchego, jamón, mayonesa, mostaza y salsa de chiltepín.',
    opciones: {
      tamanos: ['único'],
      toppings: ['salsa extra', 'guacamole', 'chipotle']
    }
  },
  {
    id: 51,
    nombre: 'Sándwich Doble',
    categoria: 'comida',
    precio: 77,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2024/04/Grupo-20019@2x.png',
    descripcion: 'Sandwich de pan integral, jamón de pavo, queso gouda, queso manchego y aderezo chipotle.',
    opciones: {
      tamanos: ['único'],
      toppings: ['aderezo extra', 'chipotle']
    }
  },
  {
    id: 52,
    nombre: 'Baguette Carnes Frías',
    categoria: 'comida',
    precio: 99,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2024/04/Grupo-20210@2x.png',
    descripcion: 'Pan baguette finas hierbas con queso parmesano horneado, jamón de pavo, queso manchego, salami, pepperoni y aderezo mayonesa-mostaza.',
    opciones: {
      tamanos: ['único'],
      toppings: ['aderezo extra', 'pepperoni extra']
    }
  },
  {
    id: 53,
    nombre: 'Rollo Italiano',
    categoria: 'comida',
    precio: 86,
    imagen: 'https://fbsolution.hk/cn/wp-content/uploads/2020/03/Baozza-Pepperoni-2.png',
    descripcion: 'Esponjoso rollo horneado relleno de pepperoni, mezcla de quesos, tocino y cebolla, acompañado con una salsa cremosa de chipotle deliciosa y con carácter.',
    opciones: {
      tamanos: ['único'],
      toppings: ['salsa chipotle extra']
    }
  },
  {
    id: 54,
    nombre: 'Sándwich Cremoso',
    categoria: 'comida',
    precio: 77,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2024/04/Grupo-20019@2x.png',
    descripcion: 'Pan tostado a la perfección con jamón y queso crema, una combinación sencilla pero verdaderamente irresistible.',
    opciones: {
      tamanos: ['único'],
      toppings: ['queso crema extra']
    }
  },
  {
    id: 55,
    nombre: 'Rollo Ranchero',
    categoria: 'comida',
    precio: 90,
    imagen: 'https://recipewise.net/wp-content/uploads/2023/06/fd0e16f981ee3f4ce1545c6d16c1af4d.jpg',
    descripcion: 'Rollo horneado relleno de arrachera, chicharrón, salsa y queso derretido; todo cubierto con queso parmesano y ajonjolí negro con sabor fuerte y lleno de personalidad.',
    opciones: {
      tamanos: ['único'],
      toppings: ['salsa extra', 'chicharrón extra']
    }
  },
  {
    id: 56,
    nombre: 'Panini Ligero',
    categoria: 'comida',
    precio: 90,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/PANINI.png',
    descripcion: 'Pan panino doradito con aderezo italiano, pechuga de pavo y queso panela, opción más ligera pero con mucho sabor. Se puede pedir con salsas como habanero, guacamole o chipotle.',
    opciones: {
      tamanos: ['único'],
      toppings: ['habanero', 'guacamole', 'chipotle']
    }
  },
  {
    id: 57,
    nombre: 'Avena',
    categoria: 'comida',
    precio: 49,
    imagen: 'data:image/webp;base64,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',
    descripcion: 'Avena caliente cremosa, ideal como desayuno nutritivo o acompañamiento energético, perfecta con café o jugo.',
    opciones: {
      tamanos: ['chico', 'mediano', 'grande'],
      toppings: ['canela', 'miel', 'fruta']
    }
  },

  // ==================== REPOSTERÍA (IDs 58-68) ====================
  {
    id: 58,
    nombre: 'Galleta con chispas de chocolate',
    categoria: 'postre',
    precio: 38,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/Grupo-20212@2x.png',
    descripcion: 'Galleta suave por dentro y ligeramente crujiente por fuera, con chispas de chocolate. Ideal para acompañar tu bebida favorita.',
    opciones: {
      tamanos: ['único'],
      toppings: ['chispas extra']
    }
  },
  {
    id: 59,
    nombre: 'Espiral de canela',
    categoria: 'postre',
    precio: 42,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2024/04/Grupo-20028@2x.png',
    descripcion: 'Clásico enrollado de azúcar canela cubierto de un dulce glaseado. Pídelo también caliente.',
    opciones: {
      tamanos: ['único'],
      toppings: ['glaseado extra', 'caliente']
    }
  },
  {
    id: 60,
    nombre: 'Brownie',
    categoria: 'postre',
    precio: 40,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2024/04/Grupo-20029@2x.png',
    descripcion: 'Esponjoso brownie de chocolate y chispas de chocolate.',
    opciones: {
      tamanos: ['único'],
      toppings: ['nuez', 'helado']
    }
  },
  {
    id: 61,
    nombre: 'Dona',
    categoria: 'postre',
    precio: 35,
    imagen: 'https://drive.caffenio.com/wp-content/uploads/sites/2/2023/04/Grupo-20032.png',
    descripcion: 'Dona con cubierta de chocolate.',
    opciones: {
      tamanos: ['único'],
      toppings: ['chocolate', 'chispas']
    }
  },
  {
    id: 62,
    nombre: 'Polvorón',
    categoria: 'postre',
    precio: 15,
    imagen: 'https://tse2.mm.bing.net/th/id/OIP.KavpC6m1--od5aRUwJXJmAHaE7?rs=1&pid=ImgDetMain&o=7&rm=3',
    descripcion: 'Tradicional polvorón de textura suave y sabor dulce, perfecto para disfrutar con café caliente.',
    opciones: {
      tamanos: ['único'],
      toppings: []
    }
  },
  {
    id: 63,
    nombre: 'Repostería con nieve',
    categoria: 'postre',
    precio: 65,
    imagen: 'https://tse4.mm.bing.net/th/id/OIP.lmFddCwYv30m14hROjWvWAHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
    descripcion: 'Tu postre favorito acompañado de una bola de nieve cremosa que realza su sabor y lo convierte en una experiencia irresistible.',
    opciones: {
      tamanos: ['único'],
      toppings: ['vainilla', 'chocolate', 'fresa']
    }
  },
  {
    id: 64,
    nombre: 'Chocolatín',
    categoria: 'postre',
    precio: 52,
    imagen: 'https://images.squarespace-cdn.com/content/v1/5b561706620b8589033dfd8b/1535492282654-9VIB1IHDE78ABHVUXCD4/image-asset.jpeg?format=1500w',
    descripcion: 'Hojaldre dorado y crujiente relleno de chocolate, perfecto para un antojo dulce a cualquier hora del día.',
    opciones: {
      tamanos: ['único'],
      toppings: []
    }
  },
  {
    id: 65,
    nombre: 'Coyota',
    categoria: 'postre',
    precio: 38,
    imagen: 'https://simplybakings.com/wp-content/uploads/2021/08/Air-Fryer-Pumpkin-Pie-2-1.jpg',
    descripcion: 'Tradicional coyota rellena de piloncillo, con una textura suave y sabor casero que combina perfecto con café.',
    opciones: {
      tamanos: ['único'],
      toppings: []
    }
  },
  {
    id: 66,
    nombre: 'Panecillo de Plátano',
    categoria: 'postre',
    precio: 45,
    imagen: 'https://st3.depositphotos.com/5344180/37126/i/950/depositphotos_371268822-stock-photo-vegan-banana-bread-isolated-white.jpg',
    descripcion: 'Pan suave y húmedo con delicioso sabor a plátano, ideal para acompañar tu bebida favorita.',
    opciones: {
      tamanos: ['único'],
      toppings: []
    }
  },
  {
    id: 67,
    nombre: 'Recién Horneado',
    categoria: 'postre',
    precio: 30,
    imagen: 'https://tse2.mm.bing.net/th/id/OIP.N5TegBNnDJMo_w82ZgxqewHaHa?pid=ImgDet&w=187&h=187&c=7&dpr=1.3&o=7&rm=3',
    descripcion: 'Pan dulce recién salido del horno, con aroma irresistible y textura suave que se disfruta mejor calientito.',
    opciones: {
      tamanos: ['único'],
      toppings: []
    }
  },
  {
    id: 68,
    nombre: 'Pastel Red Velvet',
    categoria: 'postre',
    precio: 75,
    imagen: 'https://th.bing.com/th/id/OIP.XxlR9VyrvHIE8ATgSPLCRwHaHa?w=185&h=185&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    descripcion: 'Esponjoso pastel Red Velvet con suave betún cremoso, balance perfecto entre dulzura y sabor.',
    opciones: {
      tamanos: ['rebanada'],
      toppings: ['betún extra']
    }
  }
];