import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { Ticket } from './entities/ticket.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class TicketPdfService {
  async build(order: Order, tickets: Ticket[]): Promise<{ filename: string; buffer: Buffer }> {
    if (!tickets.length) {
      throw new Error('No hay tickets para generar el PDF');
    }

    const qrImages = await Promise.all(
      tickets.map(async (ticket) => {
        const dataUrl = await QRCode.toDataURL(ticket.code, {
          margin: 1,
          color: { dark: '#020817', light: '#ffffff' },
        });
        const base64 = dataUrl.split(',')[1];
        return Buffer.from(base64, 'base64');
      }),
    );

    const fileName = `entradas-${order.id}.pdf`;

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 48 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('error', (error) => reject(error));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      tickets.forEach((ticket, index) => {
        if (index > 0) doc.addPage();
        this.drawTicketPage(doc, order, ticket, qrImages[index], index + 1, tickets.length);
      });

      doc.end();
    });

    return { filename: fileName, buffer };
  }

  private drawTicketPage(
    doc: PDFDocument,
    order: Order,
    ticket: Ticket,
    qrImage: Buffer,
    position: number,
    total: number,
  ) {
    const { event, ticketType } = ticket.orderItem;
    const eventDate = this.formatDate(event.date);
    const eventTime = this.formatTime(event.time);

    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#030712');

    doc.fillColor('#0f172a');
    doc.rect(36, 36, doc.page.width - 72, doc.page.height - 72).fill('#0f172a');

    doc.save();
    doc.rect(36, 36, doc.page.width - 72, 160).fill('#1e293b');
    doc.restore();

    doc.fillColor('#f8fafc');
    doc.font('Helvetica-Bold').fontSize(26).text(event.title, 60, 60, {
      width: doc.page.width - 300,
      lineGap: 6,
    });

    doc.font('Helvetica').fontSize(12);
    doc.fillColor('#94a3b8').text(`Ticket ${position} de ${total}`, 60, 130);

    doc.image(qrImage, doc.page.width - 220, 80, {
      fit: [150, 150],
      align: 'center',
      valign: 'center',
    });

    doc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(14);
    doc.text('Codigo de acceso', doc.page.width - 220, 240, { width: 150, align: 'center' });
    doc.fillColor('#f8fafc').font('Helvetica-Bold').fontSize(18);
    doc.text(ticket.code, doc.page.width - 220, 260, { width: 150, align: 'center' });

    doc.moveTo(60, 220).lineTo(doc.page.width - 60, 220).lineWidth(1).strokeColor('#1f2937').stroke();

    doc.fillColor('#f8fafc').font('Helvetica-Bold').fontSize(18);
    doc.text('Detalles del evento', 60, 240);

    doc.font('Helvetica').fontSize(12).fillColor('#e2e8f0');
    this.infoRow(doc, 60, 270, 'Fecha', eventDate);
    this.infoRow(doc, 60, 300, 'Horario', eventTime);
    this.infoRow(doc, 60, 330, 'Espacio', event.space);
    this.infoRow(doc, 60, 360, 'Modalidad', ticketType?.name ?? 'Entrada');
    this.infoRow(doc, 60, 390, 'Orden', order.id);
    if (order.buyerEmail) {
      this.infoRow(doc, 60, 420, 'Comprador', order.buyerEmail);
    }

    doc.moveTo(60, doc.page.height - 180).lineTo(doc.page.width - 60, doc.page.height - 180).stroke();

    doc.font('Helvetica-Bold').fontSize(14).fillColor('#38bdf8');
    doc.text('Instrucciones', 60, doc.page.height - 160);
    doc.font('Helvetica').fontSize(11).fillColor('#e2e8f0');
    doc.text('• Presenta el codigo QR en la entrada para validar tu acceso.', 60, doc.page.height - 140, {
      width: doc.page.width - 120,
    });
    doc.text('• Llega con anticipacion para asegurar tu lugar.', 60, doc.page.height - 120, {
      width: doc.page.width - 120,
    });
    doc.text('• Si necesitás asistencia, comunicate con nuestro equipo en sala.', 60, doc.page.height - 100, {
      width: doc.page.width - 120,
    });
  }

  private infoRow(doc: PDFDocument, x: number, y: number, label: string, value: string) {
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#38bdf8').text(label, x, y);
    doc.font('Helvetica').fontSize(12).fillColor('#f8fafc').text(value, x + 120, y);
  }

  private formatDate(value: string) {
    if (!value) return 'Por confirmar';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  private formatTime(value: string) {
    if (!value) return 'Por confirmar';
    return `${value} hs`;
  }
}
