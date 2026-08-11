import { useEffect, useState } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';

// Komponen generic — dipakai ulang oleh semua halaman modul data
// (Sensus, Jompo, Anak, Inklusi, Perusahaan, Lingkungan, Infrastruktur, Aset).
// Perilaku baca/tulis otomatis menyesuaikan role user yang sedang login.
export default function DataModulePage({ config }) {
  const { title, apiPath, idField, columns, formFields } = config;
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const canWrite = user.role === 'rt_admin' || user.role === 'rw_admin';

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data: rows } = await client.get(`/${apiPath}`);
      setData(rows);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath]);

  function openCreate() {
    setEditing(null);
    setForm(user.role === 'rt_admin' ? { id_rt: user.id_rt } : {});
    setShowModal(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm(row);
    setShowModal(true);
  }

  async function handleDelete(row) {
    if (!confirm('Hapus data ini?')) return;
    try {
      await client.delete(`/${apiPath}/${row[idField]}`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus data');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await client.put(`/${apiPath}/${editing[idField]}`, form);
      } else {
        await client.post(`/${apiPath}`, form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan data');
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">{title}</h1>
        {canWrite && (
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
            + Tambah Data
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : (
        <DataTable columns={columns} data={data} canWrite={canWrite} onEdit={openEdit} onDelete={handleDelete} />
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Data' : 'Tambah Data'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            {formFields.map((field) => (
              <FormField
                key={field.key}
                field={field}
                value={form[field.key]}
                onChange={(k, v) => setForm((prev) => ({ ...prev, [k]: v }))}
              />
            ))}
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded mt-2">
              Simpan
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
