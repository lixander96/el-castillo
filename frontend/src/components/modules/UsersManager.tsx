import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  CreateUserPayload,
  UpdateUserPayload,
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from '../../lib/api';
import type { User, UserRole } from '../../data/mockData';
import { toast } from 'sonner@2.0.3';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import {
  Loader2,
  UserPlus,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  KeyRound,
  Mail,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../ui/badge';

type FormMode = 'create' | 'edit';

type FormState = {
  id?: string | null;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  password: string;
};

const initialFormState: FormState = {
  id: null,
  email: '',
  firstName: '',
  lastName: '',
  role: 'visitante',
  password: '',
};

const roleLabels: Record<UserRole, string> = {
  publico: 'Publico',
  visitante: 'Visitante',
  acceso: 'Control de acceso',
  artista: 'Artista',
  cliente: 'Cliente',
  operaciones: 'Operaciones',
  admin: 'Admin',
  promotor: 'Promotor',
};

const roleOptions: UserRole[] = [
  'admin',
  'promotor',
  'cliente',
  'acceso',
  'visitante',
];

const UsersManager: React.FC = () => {
  const { currentRole } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null);
  const [passwordValue, setPasswordValue] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  const loadUsers = async (showSpinner = true) => {
    if (showSpinner) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const list = await fetchUsers();
      setUsers(list);
    } catch (error) {
      toast.error('No pudimos obtener la lista de usuarios.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentRole === 'admin') {
      loadUsers();
    }
  }, [currentRole]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter !== 'all' && user.role !== roleFilter) {
        return false;
      }
      if (!term) return true;
      return (
        user.email.toLowerCase().includes(term) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(term)
      );
    });
  }, [users, searchTerm, roleFilter]);

  const openCreateForm = () => {
    setFormMode('create');
    setFormState({
      ...initialFormState,
      role: 'cliente',
    });
    setFormOpen(true);
  };

  const openEditForm = (user: User) => {
    setFormMode('edit');
    setFormState({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      password: '',
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setTimeout(() => {
      setFormState(initialFormState);
    }, 200);
  };

  const openPasswordDialog = (user: User) => {
    setPasswordTarget(user);
    setPasswordValue('');
    setPasswordDialogOpen(true);
  };

  const closePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setPasswordTarget(null);
    setPasswordValue('');
    setPasswordSaving(false);
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwordTarget) {
      return;
    }
    if (passwordValue.trim().length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setPasswordSaving(true);
    try {
      await updateUser(passwordTarget.id, { password: passwordValue.trim() });
      toast.success('Contraseña actualizada correctamente.');
      closePasswordDialog();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        'No pudimos actualizar la contraseña.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.email.trim() || !formState.firstName.trim() || !formState.lastName.trim()) {
      toast.error('Completa email, nombre y apellido.');
      return;
    }
    if (
      formMode === 'create' &&
      (!formState.password || formState.password.trim().length < 6)
    ) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setSaving(true);
    try {
      if (formMode === 'create') {
        const payload: CreateUserPayload = {
          email: formState.email.trim(),
          firstName: formState.firstName.trim(),
          lastName: formState.lastName.trim(),
          password: formState.password,
          role: formState.role,
        };
        await createUser(payload);
        toast.success('Usuario creado correctamente.');
      } else if (formState.id) {
        const payload: UpdateUserPayload = {
          email: formState.email.trim(),
          firstName: formState.firstName.trim(),
          lastName: formState.lastName.trim(),
          role: formState.role,
        };
        await updateUser(formState.id, payload);
        toast.success('Usuario actualizado.');
      }
      closeForm();
      await loadUsers(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? 'No pudimos guardar los cambios.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    try {
      setDeletingId(user.id);
      await deleteUser(user.id);
      toast.success(`Usuario ${user.email} eliminado.`);
      await loadUsers(false);
    } catch (error) {
      toast.error('No pudimos eliminar el usuario.');
    } finally {
      setDeletingId(null);
    }
  };

  if (currentRole !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta sección solo está disponible para administradores.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gestión de usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Crea cuentas, actualiza roles y administra las credenciales desde un solo lugar.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => loadUsers(false)} disabled={refreshing}>
            {refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Actualizando
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Actualizar
              </>
            )}
          </Button>
          <Button onClick={openCreateForm}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo usuario
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <ShieldCheck className="h-4 w-4" />
            Usuarios registrados
          </CardTitle>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="w-[200px]">
                <Select
                  value={roleFilter}
                  onValueChange={(value) => setRoleFilter(value as typeof roleFilter)}
                >
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role}>
                        {roleLabels[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium">{filteredUsers.length}</span> de{' '}
              <span className="font-medium">{users.length}</span> usuarios
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Cargando usuarios...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Mail className="h-5 w-5" />
              <p className="text-sm">No encontramos usuarios con los filtros aplicados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead className="w-[200px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium leading-tight">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">ID #{user.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{user.email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {user.avatar ? 'OAuth' : 'Registro manual'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            title="Cambiar contraseña"
                            onClick={() => openPasswordDialog(user)}
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            title="Editar"
                            onClick={() => openEditForm(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                title="Eliminar"
                                disabled={deletingId === user.id}
                              >
                                {deletingId === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará la cuenta de{' '}
                                  <span className="font-semibold">{user.email}</span>. No se puede
                                  deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(user)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={(open) => (open ? setFormOpen(true) : closeForm())}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'create' ? 'Crear nuevo usuario' : 'Editar usuario'}
            </DialogTitle>
            <DialogDescription>
              Completa los datos del usuario y asigna el rol correspondiente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="user-firstname">Nombre</Label>
                <Input
                  id="user-firstname"
                  value={formState.firstName}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-lastname">Apellido</Label>
                <Input
                  id="user-lastname"
                  value={formState.lastName}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, email: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Rol</Label>
                <Select
                  value={formState.role}
                  onValueChange={(value) =>
                    setFormState((prev) => ({ ...prev, role: value as UserRole }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role}>
                        {roleLabels[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formMode === 'create' && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="user-password">Contraseña</Label>
                  <Input
                    id="user-password"
                    type="password"
                    value={formState.password}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, password: event.target.value }))
                    }
                    placeholder="Minimo 6 caracteres"
                    required
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : formMode === 'create' ? (
                  'Crear usuario'
                ) : (
                  'Guardar cambios'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={passwordDialogOpen}
        onOpenChange={(open) => (open ? setPasswordDialogOpen(true) : closePasswordDialog())}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>
              Define una nueva contraseña para {passwordTarget?.email}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-new-password">Nueva contraseña</Label>
              <Input
                id="user-new-password"
                type="password"
                value={passwordValue}
                onChange={(event) => setPasswordValue(event.target.value)}
                placeholder="Minimo 6 caracteres"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closePasswordDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={passwordSaving}>
                {passwordSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Actualizar contraseña'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManager;
