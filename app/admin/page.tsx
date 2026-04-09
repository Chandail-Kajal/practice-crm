"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Carousel = {
  id: number;
  title: string;
  slug: string;
  is_active: number;
};

export default function CarouselAdmin() {
  const [data, setData] = useState<Carousel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Carousel | null>(null);
  const [form, setForm] = useState({ title: "", slug: "" });
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const fetchData = async () => {
    const res = await fetch("/api/carousels?active=false");
    const json = await res.json();
    setData(json.data || []);
  };

  useEffect(() => {
    fetchData();
  }, [loading]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const method = editItem ? "PUT" : "POST";

      await fetch("/api/carousels", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editItem?.id,
          ...form,
        }),
      });

      closeModal();
      fetchData();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await fetch(`/api/carousels?id=${id}`, { method: "DELETE" });
      fetchData();
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (item: Carousel) => {
    setLoading(true);
    try {
      await fetch("/api/carousels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          is_active: item.is_active ? 0 : 1,
        }),
      });

      fetchData();
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item?: Carousel) => {
    if (item) {
      setEditItem(item);
      setForm({ title: item.title, slug: item.slug });
    } else {
      setEditItem(null);
      setForm({ title: "", slug: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full h-screen bg-white text-gray-800">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Carousels</h1>
        <button
          disabled={loading}
          onClick={() => openModal()}
          className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-xl disabled:opacity-95"
        >
          {loading ? "Please wait..." : "+ Add Carousel"}
        </button>
      </div>

      <table className="w-full bg-white rounded-xl overflow-hidden shadow">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Title</th>
            <th className="p-3">Slug</th>
            <th className="p-3">Active</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-3">{item.title}</td>
              <td className="p-3 text-gray-500">{item.slug}</td>

              <td className="p-3">
                <input
                  type="checkbox"
                  checked={!!item.is_active}
                  onChange={() => toggleActive(item)}
                  className="w-4 h-4"
                />
              </td>

              <td className="p-3 flex gap-2">
                <button
                  onClick={() => router.push(`/admin/${item.slug}/images`)}
                  className="text-sm bg-green-500 text-white px-4 py-1.5 rounded-xl"
                >
                  Images
                </button>

                <button
                  onClick={() => openModal(item)}
                  className="text-sm bg-blue-500 text-white px-4 py-1.5 rounded-xl"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-sm bg-red-500 text-white px-4 py-1.5 rounded-xl"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[320px]">
            <h2 className="mb-4 font-semibold">
              {editItem ? "Edit Carousel" : "Add Carousel"}
            </h2>

            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border px-3 py-2 mb-3 rounded"
            />

            <input
              placeholder="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full border px-3 py-2 mb-4 rounded"
            />

            <div className="flex justify-end gap-2">
              <button onClick={closeModal}>Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-black text-white px-3 py-2 rounded disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
