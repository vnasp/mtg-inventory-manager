'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Button,
  Modal,
  Label,
  TextInput,
  Card,
} from 'flowbite-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Spinner from '@/components/Spinner';
import { HiPencil } from 'react-icons/hi';

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
}

export default function Users() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, role')
          .order('email', { ascending: true });

        if (error) throw error;
        setProfiles(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al cargar usuarios'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setEditEmail(profile.email);
    setEditFirstName(profile.first_name || '');
    setEditLastName(profile.last_name || '');
    setEditModal(true);
  };

  const handleSave = async () => {
    if (!editingProfile) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          email: editEmail,
          first_name: editFirstName,
          last_name: editLastName,
        })
        .eq('id', editingProfile.id);

      if (error) throw error;

      // Actualizar la lista local
      setProfiles(
        profiles.map((p) =>
          p.id === editingProfile.id
            ? {
                ...p,
                email: editEmail,
                first_name: editFirstName,
                last_name: editLastName,
              }
            : p
        )
      );

      setEditModal(false);
      setEditingProfile(null);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Error al actualizar el usuario. Verifica que tengas permisos de administrador.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1>Gestión de Usuarios</h1>
          <p className="backoffice-section-description">
            Administra los usuarios del sistema
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <div className="mb-6 flex flex-col items-start justify-center">
        <h1>Gestión de Usuarios</h1>
        <p className="backoffice-section-description">
          Administra los usuarios del sistema
        </p>
      </div>

      {profiles.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <p className="text-slate-600">No hay usuarios registrados.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Email</TableHeadCell>
                <TableHeadCell>Nombre Completo</TableHeadCell>
                <TableHeadCell>Rol</TableHeadCell>
                <TableHeadCell>Acciones</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-slate-200">
              {profiles.map((profile) => (
                <TableRow key={profile.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {profile.email}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {`${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
                      '-'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        profile.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {profile.role || 'user'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      color="default"
                      outline
                      onClick={() => handleEdit(profile)}
                    >
                      <HiPencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-6 text-sm text-slate-600">
        Total de usuarios:{' '}
        <span className="font-semibold">{profiles.length}</span>
      </div>

      {/* Modal de edición */}
      <Modal show={editModal} onClose={() => setEditModal(false)} size="xl">
        <div className="p-6">
          <h3 className="mb-4 text-xl font-semibold">Editar Usuario</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <TextInput
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-firstname">Nombre</Label>
              <TextInput
                id="edit-firstname"
                type="text"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                placeholder="Nombre del usuario"
              />
            </div>
            <div>
              <Label htmlFor="edit-lastname">Apellido</Label>
              <TextInput
                id="edit-lastname"
                type="text"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                placeholder="Apellido del usuario"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button
              color="default"
              outline
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button color="secondary" onClick={() => setEditModal(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
