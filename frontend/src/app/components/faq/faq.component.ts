import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FAQ {
  question: string;
  answer: string;
  category: string;
  isOpen?: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent {
  faqs: FAQ[] = [
    {
      question: '¿Cómo puedo comprar entradas para los partidos?',
      answer: 'Puedes comprar entradas a través de nuestra plataforma Mundo Pirata. Ve a la sección "Entradas", selecciona el partido que te interesa y elige la ubicación que prefieras. El pago se realiza de forma segura a través de MercadoPago.',
      category: 'Entradas',
      isOpen: false
    },
    {
      question: '¿Cuáles son los métodos de pago aceptados?',
      answer: 'Aceptamos todos los métodos de pago disponibles en MercadoPago: tarjetas de crédito y débito, transferencias bancarias, efectivo en puntos de pago y billeteras digitales.',
      category: 'Pagos',
      isOpen: false
    },
    {
      question: '¿Puedo cancelar mi compra de entradas?',
      answer: 'Las entradas compradas no son reembolsables. Sin embargo, en casos excepcionales como la suspensión del partido, se realizará el reembolso correspondiente.',
      category: 'Entradas',
      isOpen: false
    },
    {
      question: '¿Cómo puedo hacer una donación al club?',
      answer: 'Puedes realizar donaciones a través de la sección "Donaciones" de nuestra plataforma. Selecciona el proyecto o comedero al que quieres donar y elige el monto. Todas las donaciones se procesan de forma segura.',
      category: 'Donaciones',
      isOpen: false
    },
    {
      question: '¿Dónde puedo encontrar información sobre los próximos partidos?',
      answer: 'Toda la información sobre partidos, entrenamientos y eventos del club está disponible en la sección "Calendario" de nuestra plataforma.',
      category: 'Eventos',
      isOpen: false
    },
    {
      question: '¿Cómo puedo contactar al club?',
      answer: 'Puedes contactarnos a través de nuestras redes sociales oficiales o visitando la Sede Social ubicada en Arturo Orgaz 550, Córdoba.',
      category: 'Contacto',
      isOpen: false
    },
    {
      question: '¿Puedo transferir mi entrada a otra persona?',
      answer: 'Las entradas son personales e intransferibles. Cada entrada está asociada al comprador y debe presentar su documento de identidad al ingresar al estadio.',
      category: 'Entradas',
      isOpen: false
    },
    {
      question: '¿Qué debo hacer si perdí mi entrada?',
      answer: 'En caso de pérdida de entrada, contacta inmediatamente con nuestro servicio de atención al cliente. Se evaluará cada caso de forma individual.',
      category: 'Entradas',
      isOpen: false
    },
    {
      question: '¿Cómo puedo acceder a las noticias del club?',
      answer: 'Todas las noticias oficiales del club están disponibles en la sección "Noticias" de nuestra plataforma, organizadas por categorías.',
      category: 'Noticias',
      isOpen: false
    },
    {
      question: '¿Dónde puedo encontrar los lugares emblemáticos del club?',
      answer: 'En la sección "Mapa" encontrarás todos los lugares emblemáticos del club, incluyendo el estadio, sede social, tienda oficial y predio de entrenamiento.',
      category: 'Ubicaciones',
      isOpen: false
    },
    {
      question: '¿Cómo puedo registrarme en la plataforma?',
      answer: 'Puedes registrarte haciendo clic en "Registrarse" en la parte superior derecha de la página. Solo necesitas completar tus datos personales y crear una contraseña.',
      category: 'Cuenta',
      isOpen: false
    },
    {
      question: '¿Qué beneficios tengo al registrarme?',
      answer: 'Al registrarte podrás comprar entradas, realizar donaciones, recibir notificaciones personalizadas y acceder a contenido exclusivo del club.',
      category: 'Cuenta',
      isOpen: false
    }
  ];

  selectedCategory = 'Todas';
  categories = ['Todas', 'Entradas', 'Pagos', 'Donaciones', 'Eventos', 'Contacto', 'Noticias', 'Ubicaciones', 'Cuenta'];

  get filteredFaqs() {
    if (this.selectedCategory === 'Todas') {
      return this.faqs;
    }
    return this.faqs.filter(faq => faq.category === this.selectedCategory);
  }

  toggleAnswer(faq: FAQ) {
    faq.isOpen = !faq.isOpen;
  }
} 