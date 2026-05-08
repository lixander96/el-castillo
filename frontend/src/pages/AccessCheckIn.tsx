// frontend/src/pages/AccessCheckIn.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { fetchEvents, validateTicketForEvent, redeemTicketForEvent, EventResponse } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { QrReader } from 'react-qr-reader';
import { useParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'; // ⬅️ nuevo

export default function AccessCheckIn() {
    const { currentUser } = useApp();
    const [modalOpen, setModalOpen] = useState(false);       // ⬅️ nuevo
    const { eventId: paramEventId } = useParams(); // ⬅️ nuevo
    const [events, setEvents] = useState<EventResponse[]>([]);
    const [eventId, setEventId] = useState<string>('');
    const [code, setCode] = useState('');
    const [lastScan, setLastScan] = useState<string>('');
    const [validResult, setValidResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const cameraConstraints = { facingMode: { ideal: 'environment' as const } }; // ⬅️ rear por defecto


    const eventIdRef = useRef<string>('');              // ⬅️ nuevo
    useEffect(() => { eventIdRef.current = eventId; }, [eventId]); // ⬅️ nuevo
    useEffect(() => {
        if (paramEventId && !eventId) setEventId(String(paramEventId)); // ⬅️ nuevo
    }, [paramEventId, eventId]);

    const canAccess = useMemo(() => {
        const role = (currentUser?.role ?? '').toLowerCase();
        return role === 'admin' || role === 'acceso';
    }, [currentUser]);

    useEffect(() => {
        fetchEvents()
            .then((list) => {
                setEvents(list);
                // Si hay 1 solo evento o coincide con URL, lo seteamos
                if (!eventId) {
                    const fromUrl = list.find(e => String(e.id) === String(paramEventId));
                    if (fromUrl) setEventId(String(fromUrl.id));
                    else if (list.length === 1) setEventId(String(list[0].id));
                }
            })
            .catch(() => toast.error('No se pudieron cargar los eventos'));
    }, []);

    const handleValidate = async (c?: string) => {
        const currentEventId = eventIdRef.current || eventId;
        if (!currentEventId) return toast.error('Seleccioná un evento');

        const toCheck = (c ?? code).trim();
        if (!toCheck) return toast.error('Ingresá/escaneá un código');
        setLoading(true);
        try {
            const data = await validateTicketForEvent(currentEventId, toCheck);
            setValidResult(data);
            setCode(toCheck);
            setLastScan(toCheck);
            setModalOpen(true); // ⬅️ ABRIR MODAL
            // feedback rápido
            if (data.valid) toast.success('Ticket válido');
            else toast.warning(
                data.reason === 'already_redeemed' ? 'Ticket ya usado' :
                    data.reason === 'wrong_event' ? 'Ticket de otro evento' :
                        data.reason === 'order_not_approved' ? 'Pago no aprobado' : 'Ticket inválido'
            );
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? 'Error validando ticket');
            setValidResult(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async () => {
        if (!eventId || !code) return;
        setLoading(true);
        try {
            const res = await redeemTicketForEvent(eventId, code);
            toast.success('Ingreso registrado');
            setValidResult((prev: any) => ({ ...(prev ?? {}), valid: false, reason: 'already_redeemed', redeemedAt: res.redeemedAt }));
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? 'No se pudo registrar el ingreso');
        } finally {
            setLoading(false);
        }
    };

    if (!canAccess) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <Card>
                    <CardHeader><CardTitle>Acceso restringido</CardTitle></CardHeader>
                    <CardContent>Esta página es solo para roles <b>acceso</b> y <b>admin</b>.</CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Check-in de Entradas</h1>

            <Card>
                <CardContent className="grid sm:grid-cols-3 gap-4 pt-6">
                    <div className="sm:col-span-1">
                        <Label>Evento</Label>
                        <Select value={eventId} onValueChange={(v) => setEventId(String(v))}>
                            <SelectTrigger><SelectValue placeholder="Seleccioná un evento" /></SelectTrigger>
                            <SelectContent>
                                {events.map((e) => (
                                    <SelectItem key={e.id} value={String(e.id)}>{e.title}</SelectItem> // ⬅️ String()
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="sm:col-span-2 space-y-3">
                        <Label>Cámara / QR</Label>
                        <div className="rounded-xl overflow-hidden border">
                            <QrReader
                                constraints={cameraConstraints}
                                scanDelay={700}
                                onResult={(result, error) => {
                                    if (modalOpen || !eventIdRef.current) return; // ⬅️ bloqueo extra
                                    if (!!result) {
                                        const text = result.getText();
                                        if (text && text !== lastScan) {
                                            setLastScan(text);
                                            handleValidate(text);
                                        }
                                    }
                                }}
                                containerStyle={{ width: '100%' }}
                                videoStyle={{ width: '100%' }}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Input placeholder="Ingresá el código manualmente" value={code} onChange={(e) => setCode(e.target.value)} />
                            <Button onClick={() => handleValidate()} disabled={loading}>Validar</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) {
                        // al cerrar, permitimos re-escanear el mismo código si aparece otra vez
                        setValidResult(null);
                        setLastScan('');
                        setCode('');
                    }
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Detalle de entrada</DialogTitle>
                    </DialogHeader>

                    {!validResult ? (
                        <div className="text-sm text-muted-foreground">Sin datos</div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                {validResult.valid ? (
                                    <Badge className="text-base">VÁLIDO</Badge>
                                ) : validResult.reason === 'already_redeemed' ? (
                                    <Badge variant="destructive" className="text-base">USADO</Badge>
                                ) : validResult.reason === 'wrong_event' ? (
                                    <Badge variant="outline" className="text-base">OTRO EVENTO</Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-base">NO VÁLIDO</Badge>
                                )}
                                <span className="text-xs text-muted-foreground">código: {validResult.code}</span>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-2 text-sm">
                                <div><b>Evento:</b> {validResult.eventTitle}</div>
                                <div><b>Tipo de ticket:</b> {validResult.ticketType}</div>
                                <div><b>Fecha:</b> {validResult.eventDate ?? '-'}</div>
                                <div><b>Hora:</b> {validResult.eventTime ?? '-'}</div>
                                <div><b>Precio:</b> {validResult.price != null ? `$ ${validResult.price}` : '-'}</div>
                                <div><b>Comprador:</b> {validResult.buyerEmail ?? '-'}</div>
                                <div><b>Redimido:</b> {validResult.redeemedAt ? new Date(validResult.redeemedAt).toLocaleString() : 'No'}</div>
                            </div>

                            <div className="pt-2 flex gap-2">
                                <Button
                                    onClick={async () => {
                                        try {
                                            const res = await redeemTicketForEvent(eventIdRef.current || eventId, validResult.code);
                                            toast.success('Ingreso registrado');
                                            setValidResult((prev: any) => ({ ...(prev ?? {}), valid: false, reason: 'already_redeemed', redeemedAt: res.redeemedAt }));
                                        } catch (e: any) {
                                            toast.error(e?.response?.data?.message ?? 'No se pudo registrar el ingreso');
                                        }
                                    }}
                                    disabled={!validResult.valid || loading}
                                >
                                    Confirmar ingreso
                                </Button>
                                <Button variant="outline" onClick={() => setModalOpen(false)}>Cerrar</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
