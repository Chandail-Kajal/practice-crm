/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";


import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

type ImageType = {
  id: number;
  img_url: string;
  sort_order: number;
};

export default function AdminPage() {
  const [images, setImages] = useState<ImageType[]>([]);
  const [originalImages, setOriginalImages] = useState<ImageType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newUrl, setNewUrl] = useState("");

  const fetchImages = async () => {
    const res = await fetch("/api/carousel");
    const data = await res.json();
    setImages(data.data || []);
    setOriginalImages(data.data || []);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  
  const isOrderChanged =
    JSON.stringify(images.map(i => i.id)) !==
    JSON.stringify(originalImages.map(i => i.id));

  
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
    await fetch("/api/carousel/reorder", {
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

  
  const handleSubmit = async () => {
    if (!newUrl) return;

    if (editMode && selectedId) {
      await fetch(`/api/carousel/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ img_url: newUrl }),
      });
    } else {
      await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          img_url: newUrl,
          sort_order: images.length,
        }),
      });
    }

    resetModal();
    fetchImages();
  };

  const openEdit = (img: ImageType) => {
    setEditMode(true);
    setSelectedId(img.id);
    setNewUrl(img.img_url);
    setShowModal(true);
  };

  const resetModal = () => {
    setShowModal(false);
    setNewUrl("");
    setEditMode(false);
    setSelectedId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">

        
        <div className="flex justify-between items-center mb-6">
          
          <h1 className="text-2xl font-bold">Admin Panel</h1>

          <div className="flex gap-2">
            {isOrderChanged && (
              <button
                onClick={saveOrder}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Save Order
              </button>
            )}

            <button
              onClick={() => setShowModal(true)}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              + Add
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
                        className="bg-white rounded-xl shadow p-3 mb-4 flex gap-3 items-center"
                      >
                       
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab text-gray-400"
                        >
                          ☰
                        </div>

                        <img
                          src={img.img_url}
                          className="w-32 h-20 object-cover rounded"
                        />
                        <span>
                            {img.id}-
                            {img.sort_order},
                            
                        </span>

                        <div className="ml-auto flex gap-2">
                          <button
                            onClick={() => openEdit(img)}
                            className="text-blue-600 text-sm"
                          >
                            Edit
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[320px]">
            <h2 className="mb-4 font-semibold">
              {editMode ? "Edit Image" : "Add Image"}
            </h2>

            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Image URL"
              className="w-full border px-3 py-2 mb-4 rounded"
            />

            <div className="flex justify-end gap-2">
              <button onClick={resetModal}>Cancel</button>
              <button
                onClick={handleSubmit}
                className="bg-black text-white px-3 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}