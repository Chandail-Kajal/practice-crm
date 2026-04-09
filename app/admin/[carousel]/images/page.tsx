/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Image from "next/image";

type ImageType = {
  id: number;
  img_url: string;
  sort_order: number;
  is_active: number;
};

export default function CarouselImagesAdmin() {
  const { carousel: slug } = useParams();

  const [images, setImages] = useState<ImageType[]>([]);
  const [original, setOriginal] = useState<ImageType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<ImageType | null>(null);
  const [url, setUrl] = useState("");

  const fetchImages = async () => {
    const res = await fetch(`/api/carousels/images?slug=${slug}`);
    const data = await res.json();

    setImages(data.images || data.data?.images || []);
    setOriginal(data.images || data.data?.images || []);
  };

  useEffect(() => {
    if (slug) fetchImages();
  }, [slug]);

  const isChanged =
    JSON.stringify(images.map((i) => i.id)) !==
    JSON.stringify(original.map((i) => i.id));

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    const updated = items.map((item, idx) => ({
      ...item,
      sort_order: idx,
    }));

    setImages(updated);
  };

  const saveOrder = async () => {
    await fetch("/api/carousels/images/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: images.map((img, idx) => ({
          id: img.id,
          sort_order: idx,
        })),
      }),
    });

    fetchImages();
  };

  const toggleActive = async (item: ImageType) => {
    await fetch("/api/carousels/images", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        is_active: item.is_active ? 0 : 1,
      }),
    });

    fetchImages();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete image?")) return;

    await fetch(`/api/carousels/images?id=${id}`, {
      method: "DELETE",
    });

    fetchImages();
  };

  const handleSubmit = async () => {
    if (!url) return;

    if (editItem) {
      await fetch("/api/carousels/images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editItem.id,
          img_url: url,
        }),
      });
    } else {
      await fetch("/api/carousels/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          img_url: url,
          sort_order: images.length,
        }),
      });
    }

    closeModal();
    fetchImages();
  };

  const openAdd = () => {
    setEditItem(null);
    setUrl("");
    setShowModal(true);
  };

  const openEdit = (item: ImageType) => {
    setEditItem(item);
    setUrl(item.img_url);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setUrl("");
  };

  return (
    <div className="p-6  mx-auto w-full h-screen bg-white text-gray-800">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Images ({slug})</h1>

        <div className="flex gap-2">
          {isChanged && (
            <button
              onClick={saveOrder}
              className="text-sm bg-green-500 text-white px-4 py-1.5 rounded-xl disabled:opacity-95"
            >
              Save Order
            </button>
          )}

          <button
            onClick={openAdd}
            className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-xl disabled:opacity-95"
          >
            + Add Image
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="images">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {images.map((img, index) => (
                <Draggable
                  key={img.id}
                  draggableId={String(img.id)}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="bg-white rounded-xl shadow p-3 mb-4 flex items-center gap-3"
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-grab text-gray-400"
                      >
                        ☰
                      </div>

                      <img
                        alt={img.img_url}
                        src={img.img_url}
                        className="w-28 h-16 object-cover rounded"
                      />

                      <div>
                        <p className="text-sm">
                          ID: {img.id} | Order: {img.sort_order}
                        </p>
                      </div>
                      <div
                        onClick={() => toggleActive(img)}
                        className={`ml-auto w-10 h-5 flex items-center rounded-full p-1 cursor-pointer ${
                          img.is_active ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow transform ${
                            img.is_active ? "translate-x-5" : ""
                          }`}
                        />
                      </div>

                      <div className="flex gap-2 ml-3">
                        <button
                          onClick={() => openEdit(img)}
                          className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-xl disabled:opacity-95"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(img.id)}
                          className="text-sm bg-red-600 text-white px-4 py-1.5 rounded-xl disabled:opacity-95"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[320px]">
            <h2 className="mb-4 font-semibold">
              {editItem ? "Edit Image" : "Add Image"}
            </h2>

            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Image URL"
              className="w-full border px-3 py-2 mb-4 rounded"
            />

            <div className="flex justify-end gap-2">
              <button onClick={closeModal}>Cancel</button>
              <button
                onClick={handleSubmit}
                className="bg-black text-white px-3 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
