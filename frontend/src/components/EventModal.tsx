import React, { FC, useMemo, useState } from 'react'
import type { Event, TicketType } from '../data/mockData'
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner@2.0.3';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Clock, MapPin, Users, ShoppingCart, QrCode, Ticket, LogIn } from 'lucide-react';
import { TicketSelector } from './TicketSelector';
import { checkoutPro, createOrder, fetchPublicCoupon } from './../lib/api';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface EventModalProps {
    event: Event,
    setShowLoginModal: (open: boolean) => any,
    open: boolean,
    onOpenChange: (open: boolean) => any
}

const errorMessageFrom = (err: any, fallback: string) => {
    const message = err?.response?.data?.message ?? err?.message ?? fallback;
    if (Array.isArray(message)) return message.join(', ');
    return String(message);
};
const priceOf = (ticket: TicketType) => {
    const value = (ticket as any)?.price;
    if (typeof value === 'number') return value;
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
};

const roundPrice = (value: number) => Math.round(Number(value) * 100) / 100;
const formatCurrency = (value: number) => roundPrice(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });


const EventModal: FC<EventModalProps> = ({event, setShowLoginModal, open, onOpenChange}) => {
    const { currentRole, currentUser } = useApp();
    const [purchaseStep, setPurchaseStep] = useState<'details' | 'tickets' | 'checkout'>('details');
    const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
    const [couponCode, setCouponCode] = useState('');
    const [couponInfo, setCouponInfo] = useState<CouponPublicInfo | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const updateTicketQuantity = (ticketId: string, quantity: number) => {
        setSelectedTickets((prev) => ({
            ...prev,
            [ticketId]: Math.max(0, quantity),
        }));
    };
    const getTotalTickets = () => Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
    const subtotal = useMemo(() => {
        if (!event) return 0;
        return event.ticketTypes.reduce((sum: number, ticket: TicketType) => {
            const quantity = selectedTickets[ticket.id] || 0;
            return sum + quantity * priceOf(ticket);
        }, 0);
    }, [event, selectedTickets]);

    const previewDiscount = useMemo(() => {
        if (!couponInfo || !couponInfo.applicable) return 0;
        if (subtotal <= 0) return 0;
        if (couponInfo.type === 'FREE') {
            return subtotal;
        }
        if (couponInfo.type === 'PERCENTAGE') {
            return Math.min(subtotal, roundPrice(subtotal * (couponInfo.value / 100)));
        }
        return Math.min(subtotal, roundPrice(couponInfo.value));
    }, [couponInfo, subtotal]);

    const totalWithDiscount = useMemo(() => {
        return Math.max(0, roundPrice(subtotal - previewDiscount));
    }, [previewDiscount, subtotal]);
    const getMinTicketPrice = (ticketTypes: TicketType[] = []) => {
        const prices = ticketTypes
            .map((ticket) => priceOf(ticket))
            .filter((price) => Number.isFinite(price) && price > 0);
        return prices.length ? Math.min(...prices) : 0;
    };
    const minSelectedEventPrice = event ? getMinTicketPrice(event.ticketTypes) : 0;
    const eventIdList = useMemo(() => (event ? [event.id] : []), [event]);

    const applyCoupon = async (providedCode?: string, silent = false): Promise<boolean> => {
        const normalized = (providedCode ?? couponCode).trim().toUpperCase();
        if (!normalized) {
            if (!silent) {
                setCouponError('Ingresa un codigo de cupon.');
            }
            if (providedCode !== undefined) {
                setCouponCode('');
            }
            setCouponInfo(null);
            setCouponSuccess(null);
            return false;
        }
        if (providedCode !== undefined) {
            setCouponCode(normalized);
        }
        setIsValidatingCoupon(true);
        if (!silent) {
            setCouponError(null);
            setCouponSuccess(null);
        }
        try {
            const info = await fetchPublicCoupon(normalized, eventIdList);
            setCouponInfo(info);
            if (!info.applicable) {
                setCouponError('El cupon no aplica para este evento.');
                setCouponSuccess(null);
                return false;
            }
            if (!silent) {
                setCouponError(null);
                setCouponSuccess(`Cupon ${info.code} listo para usar.`);
            } else {
                setCouponSuccess(null);
            }
            return true;
        } catch (error) {
            const message = errorMessageFrom(error, 'El cupon no es valido.');
            setCouponInfo(null);
            setCouponError(message);
            setCouponSuccess(null);
            return false;
        } finally {
            setIsValidatingCoupon(false);
        }
    };
    const handlePayment = async () => {
        if (!event) return;
        const items = event.ticketTypes
            .map((ticket: TicketType) => ({
                eventId: event.id,
                ticketTypeId: ticket.id,
                quantity: selectedTickets[ticket.id] || 0,
            }))
            .filter((item: { quantity: number }) => item.quantity > 0);
        if (!items.length) {
            toast.error('Selecciona al menos un ticket para continuar.');
            return;
        }

        const normalizedCoupon = couponCode.trim().toUpperCase();

        try {
            setIsProcessingPayment(true);
            if (normalizedCoupon) {
                const ready =
                    couponInfo &&
                    couponInfo.code === normalizedCoupon &&
                    couponInfo.applicable;
                if (!ready) {
                    const applied = await applyCoupon(normalizedCoupon, true);
                    if (!applied) {
                        setIsProcessingPayment(false);
                        toast.error(couponError ?? 'El cupon no se puede aplicar a esta compra.');
                        return;
                    }
                }
            }

            const order = await createOrder({
                buyerEmail: currentUser?.email.trim() || undefined,
                couponCode: normalizedCoupon || undefined,
                items,
            });
            const orderSubtotal =
                typeof order.subtotalAmount === 'number' ? order.subtotalAmount : subtotal;
            const orderTotal =
                typeof order.totalAmount === 'number' ? order.totalAmount : orderSubtotal;
            const discountApplied = roundPrice(orderSubtotal - orderTotal);
            if (discountApplied > 0.009) {
                toast.success(`Cupon aplicado: -$${formatCurrency(discountApplied)}`);
            }
            const checkout = await checkoutPro(order.id);
            const initPoint = checkout.init_point || checkout.sandbox_init_point;
            if (!initPoint) {
                throw new Error('No se recibio el enlace de pago de Mercado Pago');
            }
            window.location.href = initPoint;
        } catch (err) {
            toast.error(errorMessageFrom(err, 'No se pudo iniciar el pago.'));
        } finally {
            setIsProcessingPayment(false);
        }
    };
    const canPurchase = ['visitante', 'acceso', 'cliente', 'operaciones', 'admin'].includes(currentRole);
    const isPublic = currentRole === 'publico';
    return (
        <Dialog
            open={open}
            onOpenChange={(open: any) => {
                if (!open) {
                    setPurchaseStep('details');
                    setSelectedTickets({});
                    setCouponCode('');
                    onOpenChange(false)
                }
            }}
        >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                {purchaseStep === 'details' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>{event.title}</DialogTitle>
                            <DialogDescription>Conoce mas del evento y selecciona tus tickets.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <ImageWithFallback
                                src={event.image || ''}
                                alt={event.title}
                                className="w-full object-cover rounded-lg"
                            />
                            <p>{event.description}</p>
                            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(event.date).toLocaleDateString('es-AR')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>{event.time}hs</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{event.space}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span>{(event.capacity - event.ticketsSold === 0) ? 'Agotado' : (event.capacity - (event.ticketsSold / event.capacity) > 0.1) ? "Entradas disponibles" : 'Quedan pocas'}</span>
                                    </div>
                                </div>
                            </div>
                            {isPublic && event.status === 'upcoming' && (
                                <div className="space-y-3">
                                    <Button className="w-full" size="lg" onClick={() => setShowLoginModal(true)}>
                                        <LogIn className="h-4 w-4 mr-2" />
                                        Inicia sesion para comprar - Desde 
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground">
                                        Necesitas una cuenta para comprar tickets.
                                    </p>
                                </div>
                            )}
                            {canPurchase && event.status === 'upcoming' && (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={() => {
                                        setSelectedTickets({});
                                        setPurchaseStep('tickets');
                                    }}
                                >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Comprar tickets - Desde 
                                </Button>
                            )}
                            {event.status === 'sold-out' && (
                                <Button disabled className="w-full" size="lg">
                                    Agotado
                                </Button>
                            )}
                        </div>
                    </>
                )}
                {purchaseStep === 'tickets' && event && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Ticket className="h-5 w-5" />
                                Seleccionar tickets - {event.title}
                            </DialogTitle>
                            <DialogDescription>Elige el tipo y la cantidad de tickets que queres comprar.</DialogDescription>
                        </DialogHeader>
                        <TicketSelector
                            event={event}
                            selectedTickets={selectedTickets}
                            onTicketChange={updateTicketQuantity}
                            onContinue={() => setPurchaseStep('checkout')}
                            onBack={() => setPurchaseStep('details')}
                        />
                    </>
                )}
                {purchaseStep === 'checkout' && event && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Ticket className="h-5 w-5" />
                                Checkout - {event.title}
                            </DialogTitle>
                            <DialogDescription>Confirma tu compra. Te redirigiremos a Mercado Pago.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="coupon-code">Codigo de cupon</Label>
                                <div className="flex flex-wrap gap-2">
                                    <Input
                                        id="coupon-code"
                                        placeholder="CASTILLO10"
                                        value={couponCode}
                                        onChange={(evt) => {
                                            const value = evt.target.value.toUpperCase();
                                            setCouponCode(value);
                                            setCouponInfo(null);
                                            setCouponError(null);
                                            setCouponSuccess(null);
                                        }}
                                        className="uppercase"
                                        disabled={isValidatingCoupon}
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => applyCoupon()}
                                        disabled={isValidatingCoupon || couponCode.trim().length === 0}
                                    >
                                        {isValidatingCoupon ? 'Validando...' : 'Aplicar'}
                                    </Button>
                                    {couponCode && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setCouponCode('');
                                                setCouponInfo(null);
                                                setCouponError(null);
                                                setCouponSuccess(null);
                                            }}
                                        >
                                            Limpiar
                                        </Button>
                                    )}
                                </div>
                                {couponError ? (
                                    <p className="text-xs text-red-600">{couponError}</p>
                                ) : couponSuccess ? (
                                    <p className="text-xs text-emerald-600">{couponSuccess}</p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Validamos el descuento antes de enviarte a Mercado Pago.
                                    </p>
                                )}
                                {couponInfo && couponInfo.allowedEvents.length > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        Valido para: {couponInfo.allowedEvents.map((item) => item.title).join(', ')}
                                    </p>
                                )}
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Resumen de compra</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {event.ticketTypes.map((ticket: TicketType) => {
                                            const quantity = selectedTickets[ticket.id] || 0;
                                            if (quantity === 0) return null;
                                            const itemSubtotal = quantity * priceOf(ticket);
                                            return (
                                                <div key={ticket.id} className="flex justify-between text-sm">
                                                    <span>{quantity}x {ticket.name}</span>
                                                    <span>${formatCurrency(itemSubtotal)}</span>
                                                </div>
                                            );
                                        })}
                                        <div className="border-t pt-3 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Subtotal</span>
                                                <span>${formatCurrency(subtotal)}</span>
                                            </div>
                                            {previewDiscount > 0 && (
                                                <div className="flex justify-between text-sm text-emerald-600">
                                                    <span>Descuento</span>
                                                    <span>- ${formatCurrency(previewDiscount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between font-medium text-lg">
                                                <span>Total a pagar</span>
                                                <span>${formatCurrency(totalWithDiscount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
                                <CardContent className="py-4 flex items-start gap-3">
                                    <QrCode className="h-6 w-6 text-blue-600" />
                                    <div>
                                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Pago seguro con Mercado Pago</h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-200">
                                            Seras redirigido a la pasarela de Mercado Pago para completar el pago con tarjeta.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setPurchaseStep('tickets')} className="flex-1">
                                    Volver
                                </Button>
                                <Button
                                    className="flex-1"
                                    size="lg"
                                    onClick={handlePayment}
                                    disabled={isProcessingPayment}
                                >
                                    {isProcessingPayment ? 'Redirigiendo a Mercado Pago...' : 'Proceder al pago'}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default EventModal




















