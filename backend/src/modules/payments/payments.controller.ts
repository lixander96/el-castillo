import { Body, Controller, Headers, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MercadoPagoService } from './mercadopago.service';
import { OrdersService } from '../orders/orders.service';

@ApiTags('payments')
@Controller()
export class PaymentsController {
  constructor(
    private readonly mp: MercadoPagoService,
    private readonly orders: OrdersService,
  ) {}

  // 1) Crear preferencia (Checkout Pro)
  @ApiOperation({ summary: 'Crear una preferencia de pago (Checkout Pro)' })
  @ApiResponse({ status: 201, description: 'Preferencia creada con exito.' })
  @Post('payments/checkout')
  async checkout(@Body() body: { orderId: string }) {
    const order = await this.orders.findById(body.orderId);
    const success = `${process.env.FRONTEND_URL}/?status=success&orderId=${order.id}`;
    const failure = `${process.env.FRONTEND_URL}/?status=failure&orderId=${order.id}`;
    const pending = `${process.env.FRONTEND_URL}/?status=pending&orderId=${order.id}`;
    const notificationUrl = `${process.env.BACKEND_URL}/mercadopago/webhook`;

    const pref = await this.mp.preference.create({
      body: {
        items: order.items.map((i) => ({
          id: i.id,
          title: `${i.event.title} - ${i.ticketType.name}`,
          quantity: i.quantity,
          currency_id: 'ARS',
          unit_price: Number(i.unitPrice),
        })),
        payer: order.buyerEmail ? { email: order.buyerEmail } : undefined,
        external_reference: order.id,
        back_urls: { success, failure, pending },
        auto_return: 'approved',
        notification_url: notificationUrl,
        statement_descriptor: 'EL CASTILLO',
      },
    });

    await this.orders.attachPreference(order.id, pref.id!, order.id);
    return { id: pref.id, init_point: (pref as any).init_point, sandbox_init_point: (pref as any).sandbox_init_point };
  }

  // 2) Pago directo en pagina (Bricks) - tarjeta (token)
  @ApiOperation({ summary: 'Procesar un pago directo con Mercado Pago Bricks' })
  @ApiResponse({ status: 201, description: 'Pago enviado a procesamiento.' })
  @Post('payments/process')
  async process(@Body() dto: {
    orderId: string;
    transaction_amount: number;
    token: string;
    payment_method_id: string;
    issuer_id?: number | string;
    installments?: number;
    description?: string;
    payer: { email: string; identification?: { type?: string; number?: string } };
  }) {
    const res = await this.mp.payment.create({
      body: {
        transaction_amount: Number(dto.transaction_amount),
        token: dto.token,
        description: dto.description || 'Entrada',
        installments: dto.installments || 1,
        payment_method_id: dto.payment_method_id,
        issuer_id: dto.issuer_id != null ? Number(dto.issuer_id) : undefined,
        payer: { email: dto.payer.email, identification: dto.payer.identification },
        external_reference: dto.orderId,
        statement_descriptor: 'EL CASTILLO',
        capture: true,
      },
    });
    // Aqui se podria persistir el pago y actualizar el estado de la orden
    return { id: res.id, status: res.status, status_detail: res.status_detail };
  }

  // 3) Webhook (para acreditar pedidos)
  @ApiOperation({ summary: 'Recibir notificaciones webhook de Mercado Pago' })
  @ApiResponse({ status: 200, description: 'Webhook recibido correctamente.' })
  @Post('mercadopago/webhook')
  async webhook(@Req() req, @Res() res, @Headers() headers) {
    try {
      const body = req.body;
      const type = body.type || body.action || body.topic;
      const dataId = body.data?.id || body.resource?.id || body.id;

      if (type?.includes('payment') && dataId) {
        const p = await this.mp.payment.get({ id: dataId });
        const orderId = p.external_reference;

        if (orderId) {
          if (p.status === 'approved') {
            await this.orders.generateTicketsForApprovedOrder(orderId);
            // TODO: enviar email con los codigos QR (link /tickets/validate/:code)
          } else if (p.status === 'pending' || p.status === 'in_process') {
            await this.orders.updateStatus(orderId, 'pending');
          } else {
            await this.orders.releaseStockForOrder(orderId);
          }
        }
      }
      return res.status(200).send('ok');
    } catch (e) {
      return res.status(500).send('error');
    }
  }
}
