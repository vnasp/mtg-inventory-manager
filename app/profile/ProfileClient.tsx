'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Profile } from '@/utils/db/types';
import Link from 'next/link';

interface ProfileClientProps {
  profile: Profile | null;
}

export default function ProfileClient({ profile }: ProfileClientProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    comuna: profile?.comuna || '',
    city: profile?.city || '',
    region: profile?.region || '',
    country: profile?.country || 'Chile',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profile?.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      setEditing(false);

      // Recargar después de 1 segundo
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona tu información personal y preferencias
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Volver al catálogo
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Navegación */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button className="border-b-2 border-purple-500 px-1 pb-4 text-sm font-medium text-purple-600">
              Información Personal
            </button>
            <button className="border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
              Mis Pedidos
            </button>
          </nav>
        </div>

        {/* Contenido */}
        <div className="rounded-lg bg-white p-8 shadow">
          {message && (
            <div
              className={`mb-6 rounded-md p-4 ${
                message.type === 'error'
                  ? 'border border-red-200 bg-red-50 text-red-800'
                  : 'border border-green-200 bg-green-50 text-green-800'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Email (solo lectura) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  El correo no puede modificarse
                </p>
              </div>

              {/* Nombre */}
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              {/* Apellido */}
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Apellido *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Dirección
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Calle, número, depto"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              {/* Comuna */}
              <div>
                <label
                  htmlFor="comuna"
                  className="block text-sm font-medium text-gray-700"
                >
                  Comuna
                </label>
                <input
                  type="text"
                  id="comuna"
                  name="comuna"
                  value={formData.comuna}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Ej: Providencia, Las Condes"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              {/* Ciudad */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  Ciudad
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Ej: Santiago, Valparaíso"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              {/* Región */}
              <div className="md:col-span-2">
                <label
                  htmlFor="region"
                  className="block text-sm font-medium text-gray-700"
                >
                  Región
                </label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value })
                  }
                  disabled={!editing}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Selecciona una región</option>
                  <option value="Región de Arica y Parinacota">
                    Región de Arica y Parinacota
                  </option>
                  <option value="Región de Tarapacá">Región de Tarapacá</option>
                  <option value="Región de Antofagasta">
                    Región de Antofagasta
                  </option>
                  <option value="Región de Atacama">Región de Atacama</option>
                  <option value="Región de Coquimbo">Región de Coquimbo</option>
                  <option value="Región de Valparaíso">
                    Región de Valparaíso
                  </option>
                  <option value="Región Metropolitana de Santiago">
                    Región Metropolitana de Santiago
                  </option>
                  <option value="Región del Libertador General Bernardo O'Higgins">
                    Región del Libertador General Bernardo O'Higgins
                  </option>
                  <option value="Región del Maule">Región del Maule</option>
                  <option value="Región de Ñuble">Región de Ñuble</option>
                  <option value="Región del Biobío">Región del Biobío</option>
                  <option value="Región de La Araucanía">
                    Región de La Araucanía
                  </option>
                  <option value="Región de Los Ríos">Región de Los Ríos</option>
                  <option value="Región de Los Lagos">
                    Región de Los Lagos
                  </option>
                  <option value="Región de Aysén">Región de Aysén</option>
                  <option value="Región de Magallanes y de la Antártica Chilena">
                    Región de Magallanes y de la Antártica Chilena
                  </option>
                </select>
              </div>

              {/* País */}
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700"
                >
                  País
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="mt-6 flex justify-end gap-3">
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-lg bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-700"
                >
                  Editar perfil
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        first_name: profile?.first_name || '',
                        last_name: profile?.last_name || '',
                        phone: profile?.phone || '',
                        address: profile?.address || '',
                        comuna: profile?.comuna || '',
                        city: profile?.city || '',
                        region: profile?.region || '',
                        country: profile?.country || 'Chile',
                      });
                    }}
                    className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </>
              )}
            </div>
          </form>

          {/* Información de cuenta */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900">
              Información de la cuenta
            </h3>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600">Rol:</dt>
                <dd className="font-medium text-gray-900">
                  {profile?.role === 'admin' ? 'Administrador' : 'Cliente'}
                </dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600">Fecha de registro:</dt>
                <dd className="font-medium text-gray-900">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '-'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
