import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  Shield,
  Search,
  Filter,
  Edit2,
  Key,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminUsuario } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { APP_ROUTES } from '../../constants/routes';

export const AdminUsersPage: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUsuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('TODOS');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  // Modal Editar Usuario
  const [editingUser, setEditingUser] = useState<AdminUsuario | null>(null);
  const [editForm, setEditForm] = useState({ nombre: '', apellido: '', correo: '', telefono: '' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Modal Cambiar Roles
  const [roleUser, setRoleUser] = useState<AdminUsuario | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isSavingRoles, setIsSavingRoles] = useState(false);

  // Modal Cambiar Estado
  const [statusUser, setStatusUser] = useState<AdminUsuario | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  // Modal Reset Password
  const [resetModalData, setResetModalData] = useState<{ user: AdminUsuario; pass: string } | null>(null);
  const [isResettingPass, setIsResettingPass] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.listUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Error cargando usuarios:', err);
      showToast('Error cargando lista de usuarios', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenEdit = (u: AdminUsuario) => {
    setEditingUser(u);
    setEditForm({
      nombre: u.nombre || '',
      apellido: u.apellido || '',
      correo: u.correo || '',
      telefono: u.telefono || '',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSavingEdit(true);
    try {
      await adminService.updateUser(editingUser.id, editForm);
      showToast('Datos de usuario actualizados correctamente', 'success');
      setEditingUser(null);
      await loadUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al actualizar usuario';
      showToast(msg, 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleOpenRoles = (u: AdminUsuario) => {
    setRoleUser(u);
    setSelectedRoles(u.roles ? [...u.roles] : u.rolPrincipal ? [u.rolPrincipal] : []);
  };

  const handleToggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSaveRoles = async () => {
    if (!roleUser) return;
    if (selectedRoles.length === 0) {
      showToast('El usuario debe tener al menos un rol asignado', 'warning');
      return;
    }
    setIsSavingRoles(true);
    try {
      await adminService.changeUserRoles(roleUser.id, selectedRoles);
      showToast('Roles de usuario actualizados', 'success');
      setRoleUser(null);
      await loadUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al actualizar roles';
      showToast(msg, 'error');
    } finally {
      setIsSavingRoles(false);
    }
  };

  const handleOpenStatus = (u: AdminUsuario) => {
    setStatusUser(u);
    setStatusReason('');
  };

  const handleSaveStatus = async () => {
    if (!statusUser) return;
    setIsSavingStatus(true);
    try {
      await adminService.changeUserStatus(statusUser.id, !statusUser.estado, statusReason);
      showToast(`Estado de usuario cambiado a ${!statusUser.estado ? 'Activo' : 'Inactivo'}`, 'success');
      setStatusUser(null);
      await loadUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al cambiar estado de usuario';
      showToast(msg, 'error');
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleResetPassword = async (u: AdminUsuario) => {
    if (!window.confirm(`¿Estás seguro de restablecer la contraseña para "${u.nombre} ${u.apellido}"?`)) return;
    setIsResettingPass(true);
    try {
      const res = await adminService.resetUserPassword(u.id);
      setResetModalData({ user: u, pass: res.temporalPassword });
      setCopied(false);
      showToast('Contraseña restablecida exitosamente', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al restablecer contraseña';
      showToast(msg, 'error');
    } finally {
      setIsResettingPass(false);
    }
  };

  const handleCopyPassword = () => {
    if (resetModalData?.pass) {
      navigator.clipboard.writeText(resetModalData.pass);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (u.nombre && u.nombre.toLowerCase().includes(q)) ||
      (u.apellido && u.apellido.toLowerCase().includes(q)) ||
      (u.correo && u.correo.toLowerCase().includes(q)) ||
      (u.telefono && u.telefono.toLowerCase().includes(q));

    const matchesRole =
      roleFilter === 'TODOS' ||
      (u.roles && u.roles.includes(roleFilter)) ||
      u.rolPrincipal === roleFilter;

    const matchesStatus =
      statusFilter === 'TODOS' ||
      (statusFilter === 'ACTIVO' && u.estado) ||
      (statusFilter === 'INACTIVO' && !u.estado);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const ALL_ROLES = ['CLIENTE', 'COMERCIO', 'DOMICILIARIO', 'ADMIN'];

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link to={APP_ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Volver al panel de administración
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Gestión de Usuarios del Sistema</h1>
          <p className="text-xs text-gray-500">
            Administración centralizada de usuarios, roles, estados y credenciales con protección estricta.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, correo o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filtrar por Rol"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="TODOS">Todos los Roles</option>
            <option value="ADMIN">Administrador</option>
            <option value="COMERCIO">Comercio</option>
            <option value="DOMICILIARIO">Domiciliario</option>
            <option value="CLIENTE">Cliente</option>
          </select>

          <select
            aria-label="Filtrar por Estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="ACTIVO">Solo Activos</option>
            <option value="INACTIVO">Solo Inactivos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0 border border-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-black tracking-wider">
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Roles Asignados</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No se encontraron usuarios coincidentes con los filtros.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{u.nombre} {u.apellido}</div>
                      <div className="text-[11px] font-mono text-gray-400">ID #{u.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-700 font-medium">{u.correo}</div>
                      <div className="text-[11px] text-gray-400">{u.telefono || 'Sin teléfono'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(u.roles && u.roles.length > 0 ? u.roles : [u.rolPrincipal || 'CLIENTE']).map((r) => (
                          <Badge
                            key={r}
                            variant={
                              r === 'ADMIN'
                                ? 'danger'
                                : r === 'COMERCIO'
                                ? 'info'
                                : r === 'DOMICILIARIO'
                                ? 'warning'
                                : 'secondary'
                            }
                          >
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-bold ${u.estado ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {u.estado ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {u.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenEdit(u)}
                          className="text-[11px] py-1 px-2 flex items-center gap-1"
                          title="Editar información del usuario"
                        >
                          <Edit2 className="w-3 h-3" /> Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenRoles(u)}
                          className="text-[11px] py-1 px-2 flex items-center gap-1"
                          title="Gestionar roles"
                        >
                          <Shield className="w-3 h-3" /> Roles
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenStatus(u)}
                          className={`text-[11px] py-1 px-2 flex items-center gap-1 ${
                            u.estado ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                          }`}
                          title={u.estado ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          {u.estado ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleResetPassword(u)}
                          isLoading={isResettingPass}
                          className="text-[11px] py-1 px-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 flex items-center gap-1"
                          title="Restablecer contraseña"
                        >
                          <Key className="w-3 h-3" /> Clave
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL 1: Editar Datos Usuario */}
      {editingUser && (
        <Modal
          isOpen={true}
          onClose={() => setEditingUser(null)}
          title={`Editar Usuario: ${editingUser.nombre} ${editingUser.apellido}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre</label>
                <Input
                  type="text"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Apellido</label>
                <Input
                  type="text"
                  value={editForm.apellido}
                  onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
              <Input
                type="email"
                value={editForm.correo}
                onChange={(e) => setEditForm({ ...editForm, correo: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono</label>
              <Input
                type="tel"
                value={editForm.telefono}
                onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="secondary" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" isLoading={isSavingEdit}>
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Cambiar Roles */}
      {roleUser && (
        <Modal
          isOpen={true}
          onClose={() => setRoleUser(null)}
          title={`Gestionar Roles: ${roleUser.nombre} ${roleUser.apellido}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-600">
              Selecciona los roles asignados a este usuario. Un usuario puede tener múltiples roles en la plataforma.
            </p>

            <div className="space-y-2 border border-gray-200 p-3 rounded-xl bg-gray-50">
              {ALL_ROLES.map((role) => (
                <label key={role} className="flex items-center gap-2.5 text-xs font-medium text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => handleToggleRole(role)}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <span>
                    <strong>{role}</strong>
                    {role === 'ADMIN' && ' — Acceso total al panel de administración'}
                    {role === 'COMERCIO' && ' — Gestión de tiendas, sucursales y productos'}
                    {role === 'DOMICILIARIO' && ' — Reparto de pedidos y encomiendas'}
                    {role === 'CLIENTE' && ' — Realizar compras y envíos'}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="secondary" onClick={() => setRoleUser(null)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSaveRoles} isLoading={isSavingRoles}>
                Actualizar Roles
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: Cambiar Estado */}
      {statusUser && (
        <Modal
          isOpen={true}
          onClose={() => setStatusUser(null)}
          title={`Confirmar Cambio de Estado`}
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-600">
              ¿Estás seguro de que deseas <strong>{statusUser.estado ? 'desactivar' : 'activar'}</strong> al usuario{' '}
              <strong>"{statusUser.nombre} {statusUser.apellido}"</strong> ({statusUser.correo})?
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Motivo del cambio de estado (quedará registrado en auditoría):
              </label>
              <Input
                type="text"
                placeholder="Ej. Solicitud del usuario / Suspensión temporal / Regularización..."
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="secondary" onClick={() => setStatusUser(null)}>
                Cancelar
              </Button>
              <Button
                variant={statusUser.estado ? 'danger' : 'primary'}
                onClick={handleSaveStatus}
                isLoading={isSavingStatus}
              >
                Confirmar {statusUser.estado ? 'Desactivación' : 'Activación'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 4: Contraseña Temporal Generada */}
      {resetModalData && (
        <Modal
          isOpen={true}
          onClose={() => setResetModalData(null)}
          title="Contraseña Temporal Generada"
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Copia y entrega esta credencial al usuario
              </div>
              <p>
                Por motivos de seguridad, esta clave se muestra <strong>únicamente en esta ventana</strong> y nunca queda guardada en texto claro en logs ni auditoría.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">Usuario:</label>
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-200">
                {resetModalData.user.nombre} {resetModalData.user.apellido} ({resetModalData.user.correo})
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">Nueva Contraseña Temporal:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={resetModalData.pass}
                  className="flex-1 px-3 py-2 text-sm font-mono font-bold bg-slate-900 text-emerald-400 rounded-xl border border-slate-800 select-all"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCopyPassword}
                  className="flex items-center gap-1 px-3 py-2 text-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiada' : 'Copiar'}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="primary" onClick={() => setResetModalData(null)}>
                Entendido y Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
