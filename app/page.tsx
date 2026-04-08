"use client";

import { useEffect, useState } from "react";

type ImageType = {
  id: number;
  img_url: string;
  index: number;
};

export default function Home() {
  const [images, setImages] = useState<ImageType[]>([]);
  const [visibleCount, setVisibleCount] = useState(3); 
  const [currentIndex, setCurrentIndex] = useState(0);


  useEffect(() => {
    fetch("/api/carousel")
      .then((res) => res.json())
      .then((data) => setImages(data.data || []));
  }, []);

 
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
    <div style={{ padding: "20px" }}>
      

     
      <div style={{ marginBottom: "20px" }}>
        <label>Cards to show: </label>
        <select
          value={visibleCount}
          onChange={(e) => {
            setVisibleCount(Number(e.target.value));
            setCurrentIndex(0);
          }}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </div>

     
      <div style={{ display: "flex", alignItems: "center" }}>
        <button onClick={prev} disabled={currentIndex === 0}>
          ◀
        </button>

        <div
          style={{
            overflow: "hidden",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              transition: "transform 0.3s ease",
              transform: `translateX(-${
                (currentIndex * 100) / visibleCount
              }%)`,
            }}
          >
            {images.map((img) => (
              <div
                key={img.id}
                style={{
                  flex: `0 0 ${100 / visibleCount}%`,
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={img.img_url}
                    alt="img"
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={next}
          disabled={currentIndex >= images.length - visibleCount}
        >
          ▶
        </button>
      </div>
    </div>
  );
}