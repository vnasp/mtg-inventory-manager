'use client';
import {
  Card,
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
      <Card className="w-full">
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <h2 className="text-textDark mb-4 text-2xl font-bold">
          Gestión de Usuarios
        </h2>
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          Error: {error}
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <h2 className="text-textDark mb-4 text-2xl font-bold">
        Gestión de Usuarios
      </h2>

      {profiles.length === 0 ? (
        <div className="text-stone-600">
          <p>No hay usuarios registrados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table striped>
            <TableHead>
              <TableHeadCell>Email</TableHeadCell>
              <TableHeadCell>Nombre Completo</TableHeadCell>
              <TableHeadCell>Rol</TableHeadCell>
              <TableHeadCell>Acciones</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y">
              {profiles.map((profile) => (
                <TableRow
                  key={profile.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <TableCell className="font-medium text-gray-900 dark:text-white">
                    {profile.email}
                  </TableCell>
                  <TableCell>
                    {`${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
                      '-'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        profile.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {profile.role || 'user'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="xs"
                      color="light"
                      onClick={() => handleEdit(profile)}
                    >
                      <HiPencil className="mr-1 h-4 w-4" />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Total de usuarios: {profiles.length}
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
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button color="gray" onClick={() => setEditModal(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
