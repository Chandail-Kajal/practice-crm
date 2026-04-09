"use client";

import { useState } from "react";

type ImageType = {
  id: number;
  img_url: string;
};

export default function Carousel({
  images,
  visibleCount = 1,
  title,
}: {
  images: ImageType[];
  visibleCount: number;
  title: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    if (currentIndex < images.length - visibleCount) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center gap-3 justify-center">
        <label className="font-medium text-gray-700">{title}</label>
      </div>

      {/* Carousel */}
      <div className="flex items-center gap-3">
        {/* Prev Button */}
        <button
          onClick={prev}
          disabled={currentIndex === 0}
          className="px-3 py-2 rounded-full bg-blue-500 hover:bg-blue-200 disabled:opacity-40"
        >
          ◀
        </button>

        {/* Slider */}
        <div className="overflow-hidden w-full">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${(currentIndex * 100) / visibleCount}%)`,
            }}
          >
            {images.length > 0 ? (
              images.map((img) => (
                <div
                  key={img.id}
                  className="p-2"
                  style={{
                    flex: `0 0 ${100 / visibleCount}%`,
                  }}
                >
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                      src={img.img_url}
                      alt="carousel"
                      className="w-full h-48 object-cover"
                    />

                    {/* Optional footer */}
                    <div className="p-3">
                      <p className="text-sm text-gray-600">Image #{img.id}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xl text-gray-700 p-10 rounded-2xl bg-gray-300">
                <span>No images in this carouel</span>
              </div>
            )}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={next}
          disabled={currentIndex >= images.length - visibleCount}
          className="px-3 py-2 rounded-full bg-blue-500 hover:bg-blue-200 disabled:opacity-40"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
