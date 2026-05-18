# El Castillo — Plataforma de Venta de Entradas y Gestión de Eventos

**Documento de venta para closers**
Versión 1.0 — Mayo 2026

---

## 1. Pitch en 30 segundos

> **El Castillo es la plataforma todo-en-uno que reemplaza Eventbrite, Passline, Ticketek y tu planilla de Excel.**
> Vendés entradas online con Mercado Pago, controlás el acceso en la puerta con QR, gestionás promotores con comisiones automáticas, alquilás tus salones para eventos privados con catering y ves todo en un dashboard en tiempo real.
>
> **Una sola plataforma. Cero comisiones de terceros. Tu marca, tu dominio, tus datos.**

---

## 2. ¿Para quién es?

- Boliches y discos con eventos recurrentes.
- Productoras de fiestas y festivales.
- Salones de eventos, quintas, hoteles boutique.
- Espacios culturales (teatros, centros culturales, galerías).
- Bares con shows, peñas, after-office.
- Clubes nocturnos que manejan VIP, preventas y listas.

---

## 3. El problema que resuelve

| Dolor del cliente | Lo que está haciendo hoy | Lo que pierde |
|---|---|---|
| Vende entradas por terceros | Eventbrite / Passline / Ticketek | 5% a 12% de comisión + IVA por venta |
| Cobra por transferencia o efectivo | WhatsApp + Mercado Pago manual | 30% de no-shows, sin control de cupos |
| Controla acceso con lista impresa | Excel + persona en la puerta | Entradas duplicadas, colas, fricción |
| Trabaja con promotores | Comisiones calculadas a mano | Errores, conflictos, falta de transparencia |
| Alquila salones | WhatsApp + presupuestos por mail | Pérdida de leads, sin seña asegurada |
| No sabe cuánto vendió | Suma tickets a mano al cerrar | Decisiones a ciegas, sin data |

---

## 4. La solución: 6 módulos integrados

### 4.1 Venta de entradas online
- Catálogo público de eventos con imagen, descripción, fecha, capacidad.
- **Múltiples tipos de ticket por evento**: General, VIP, Preventa 1, Preventa 2, etc., cada uno con su precio, stock y beneficios.
- Carrusel de eventos destacados en la home.
- Filtros por categoría (Música, Arte, Taller, Entretenimiento) y ordenamiento por fecha, popularidad o precio.
- Reserva optimista de stock: si dos personas compran al mismo tiempo, el sistema impide la sobreventa.
- Estados automáticos: Próximo, En curso, **Agotado**, Finalizado, Cancelado.

### 4.2 Cobros con Mercado Pago
- Integración nativa con **Checkout Pro** (botón) y **Bricks** (formulario embebido en tu sitio, sin redirección).
- Acepta tarjetas de crédito, débito, billeteras virtuales y efectivo.
- **Cuotas configurables** (1, 3, 6, 12) según lo permita MP.
- Webhook en tiempo real: cuando MP confirma el pago, el ticket se emite automáticamente. Si rechaza, el cupo se libera solo.
- Cero intervención manual. Cero pagos perdidos.

### 4.3 Entradas con QR y control de acceso
- Cada entrada se genera con un **código único QR** al confirmarse el pago.
- El comprador recibe su ticket por mail y puede **descargarlo en PDF** desde su perfil.
- En la puerta, el personal con rol "Acceso" abre una web, escanea el QR con la cámara del celular y **marca la entrada como usada al instante**.
- Imposible reutilizar un ticket. Imposible falsificar.
- Validación scopeada por evento: si el QR es de otra fecha, lo rechaza.

### 4.4 Cupones, descuentos y promotores
- Cupones de **porcentaje** (10% off), **monto fijo** ($1.000 off) o **entrada gratis**.
- Límite de redenciones por cupón o uso ilimitado.
- Restricción a eventos específicos o aplicables a todos.
- **Asignación de cupón a un promotor** con porcentaje de comisión automático.
- Cada promotor entra a su propio dashboard y ve sus ventas, comisiones ganadas y cupones activos en tiempo real.
- Adiós a las planillas. Adiós a los conflictos por pagos.

### 4.5 Reserva de espacios + catering
- Los clientes pueden solicitar el **alquiler de salones para eventos privados** desde la web.
- Wizard de 3 pasos: datos básicos → equipamiento → presupuesto.
- Módulo de **catering integrado**: cocktail, almuerzo, cena, brunch, buffet; menú ejecutivo, gourmet, vegano, kosher, halal, etc.; restricciones dietarias (sin gluten, sin lactosa, diabético, etc.).
- **Seña automática del 30%** para reservas superiores a $10.000, cobrada por MP antes de confirmar.
- Panel de operaciones para aceptar, rechazar o contraofertar.

### 4.6 Panel de administración con métricas en vivo
- KPIs principales: eventos activos, próximos eventos, entradas vendidas, ingresos estimados, ocupación promedio.
- Barra de ocupación por evento (vendidos / capacidad).
- Top 3 eventos por venta.
- Tabla de ventas con desglose por tipo de ticket.
- Refresh manual con un click.

---

## 5. Diferenciales que cierran la venta

### Comisión 0% de plataforma
Otras plataformas se quedan con 5–12% por entrada vendida. **El Castillo no cobra por ticket vendido.** Solo paga MP su comisión estándar.

> **Ejemplo de ahorro**: si vendés $5.000.000 al mes en entradas y Passline te cobra 8%, son **$400.000/mes que dejás de pagar**. Eso paga la plataforma al toque.

### Tu dominio, tu marca
El cliente compra en `tuboliche.com.ar`, no en `passline.com/tu-boliche`. Mejor branding, mejor SEO, mejor conversión.

### Tus datos te pertenecen
Toda la base de compradores (mail, teléfono, historial) queda en **tu base de datos**. Podés hacer marketing, remarketing, fidelización. En Eventbrite los datos son de Eventbrite.

### Sistema de roles real
- **Admin**: control total.
- **Operaciones**: crea eventos, gestiona órdenes.
- **Acceso**: solo valida QR en la puerta.
- **Promotor**: ve sus cupones y comisiones.
- **Cliente**: compra y ve sus tickets.
- **Artista**: módulo preparado para expansión.

Nadie ve más de lo que debe ver.

### Multi-canal: Mail + WhatsApp
- Correos transaccionales con HTML profesional (confirmación, ticket adjunto).
- **Integración con WhatsApp Business**: mensajes de texto, menús con botones, envío de QR como imagen.

### Login social
Registro en 1 click con **Google OAuth** además del clásico mail + contraseña. Más conversión, menos abandono.

---

## 6. Casos de uso reales

### Caso 1: Boliche con fiestas semanales
- Crea 4 eventos por mes con 3 tipos de ticket cada uno (Early Bird, General, VIP).
- Asigna 5 promotores con cupones de 10% off y comisión del 15%.
- Cobra todo por MP, valida 800 entradas por noche con QR.
- Cierra la noche con un reporte de ingresos en su celular.

### Caso 2: Salón de eventos corporativos
- Cliente entra a la web, solicita un salón para 80 personas con catering gourmet sin gluten para el viernes.
- Paga $300.000 de seña por MP.
- Operaciones recibe la solicitud, confirma, y el evento queda agendado.

### Caso 3: Productora de festivales
- Vende 5.000 entradas para un festival con preventas escalonadas.
- 20 promotores trabajan con cupones únicos y ven sus comisiones en vivo.
- 6 personas en la puerta con celulares validan QR en paralelo.
- Sin colas, sin papel, sin sobreventa.

---

## 7. Stack técnico (para clientes que preguntan)

- **Frontend**: React + Vite + Tailwind + Radix UI (interfaz moderna, responsive 100%).
- **Backend**: NestJS + PostgreSQL (la misma stack que usan empresas como Adidas, Capgemini).
- **Hosting**: corre en cualquier VPS con Docker (Hostinger, AWS, DigitalOcean).
- **Seguridad**: JWT, hashing de contraseñas, guards de roles, HTTPS.
- **Escalable**: arquitectura modular, lista para crecer.

---

## 8. Beneficios económicos resumidos

| Concepto | Sin El Castillo | Con El Castillo |
|---|---|---|
| Comisión por venta | 5–12% | **0%** (solo MP) |
| No-shows por pago manual | 20–30% | < 5% |
| Tiempo de validación en puerta | 30s por persona | < 3s |
| Errores en pago a promotores | Frecuentes | **0** (automático) |
| Pérdida de leads de salones | Alta | **Captura 24/7** |
| Visibilidad de ventas | Cierre del mes | **Tiempo real** |

---

## 9. Objeciones frecuentes y cómo responder

**"Ya uso Passline y me funciona"**
→ ¿Cuánto te cobran de comisión por entrada? Multiplicalo por tus ventas anuales. Eso es lo que estás regalando. Además, ¿tenés la base de mails de tus clientes para hacer remarketing? Con Passline no la tenés.

**"¿Y si se cae el sistema en plena fiesta?"**
→ Corre en tu propio servidor con Docker. Si querés, lo monitoreamos 24/7. Además, el sistema de QR permite validación offline si fuera necesario (los códigos se pueden pre-cargar).

**"Mi gente no es técnica"**
→ El panel está diseñado para que cualquiera lo use. Crear un evento toma 2 minutos. Validar en la puerta es escanear con el celular. Te damos onboarding y soporte.

**"¿Cuánto sale?"**
→ Pricing por plan/instalación + setup. Cero comisión por ticket. En 1–3 meses se paga sola con el ahorro vs. Passline/Eventbrite.

**"¿Puedo conectar mi sistema actual?"**
→ El backend expone API REST documentada con Swagger. Integramos con tu CRM, ERP o sistema de facturación si lo necesitás.

**"¿Y si quiero algo personalizado?"**
→ Es nuestro código, lo modificamos. No estás atado a las features de un SaaS cerrado.

---

## 10. Flujo de demo recomendado para closers

1. **Abrir la home pública**: mostrar carrusel de eventos destacados y catálogo.
2. **Comprar una entrada**: seleccionar evento → tipo de ticket → aplicar cupón → pagar con MP de prueba.
3. **Recibir mail con el ticket**: mostrar el PDF con QR.
4. **Escanear el QR en la puerta**: abrir la pantalla de Acceso, escanear con la cámara, marcar como usado.
5. **Entrar al dashboard**: mostrar métricas en vivo (entradas vendidas, ocupación, ingresos).
6. **Crear un cupón con promotor**: 10% off, comisión 15%, asignado a "Promotor demo".
7. **Loguearse como promotor**: ver su dashboard con ventas y comisiones.
8. **Mostrar el wizard de reserva de salón con catering**.
9. **Cerrar con el ahorro**: calcular en vivo cuánto deja de pagar de comisión vs. la plataforma actual del prospecto.

---

## 11. Cierre

> **El Castillo no es un software. Es una palanca de crecimiento.**
> Cobra por internet sin perder un peso de comisión, controla el acceso sin colas, paga a tus promotores sin discusiones, alquila tus salones sin perder leads, y mira tu negocio en tiempo real desde el celular.
>
> **Lo único que tenés que hacer es decir que sí.**

---

### Checklist del closer antes de la reunión

- [ ] Investigar cuánto vende el prospecto al mes (estimar comisiones que paga).
- [ ] Saber qué plataforma usa hoy y sus dolores.
- [ ] Preparar el entorno de demo con un evento de muestra cargado.
- [ ] Tener a mano un cupón de prueba para mostrar el flujo de promotor.
- [ ] Llevar el cálculo de ROI listo (ahorro mensual proyectado).
- [ ] Cerrar con una propuesta de prueba piloto de 30 días para 1 evento.
