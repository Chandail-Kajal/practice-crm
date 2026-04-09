/* eslint-disable @typescript-eslint/no-explicit-any */
import mysql from "mysql2/promise";

export const conn = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "crm",
  waitForConnections: true,
  connectionLimit: 10,
});


export async function initDB() {
  const TABLE_DEFS = {
    carousel: `
    CREATE TABLE IF NOT EXISTS carousel (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      visible_count INT NOT NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by INT NULL,
      updated_by INT NULL
    );
  `,
    images: `
    CREATE TABLE IF NOT EXISTS images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      carousel_id INT,
      img_url TEXT NOT NULL,
      sort_order INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by INT NULL,
      updated_by INT NULL,
      FOREIGN KEY (carousel_id) REFERENCES carousel(id) ON DELETE CASCADE
    );
  `,
  };
  for (const [table, query] of Object.entries(TABLE_DEFS)) {
    await conn.execute(query);
    console.log("CREATED TABLE ", `[${table}]`)
  }

  const [carouselRows]: any = await conn.query(
    "SELECT COUNT(*) as count FROM carousel"
  );

  if (carouselRows[0].count === 0) {
    await conn.query(`INSERT INTO carousel (title, slug, is_active, visible_count) VALUES ?`,
      [
        [
          ["Homepage Carousel", "homepage-carousel", 1, 2],
          ["Featured Products", "featured-products", 1, 3],
        ],
      ]
    );
    console.log("✅ Carousel seeded");
  }


  const [rows]: any = await conn.query(
    "SELECT COUNT(*) as count FROM images"
  );

  const [carousel]: any = await conn.query(
    "SELECT id FROM carousel WHERE slug = 'homepage-carousel' LIMIT 1"
  );

  const carouselId = carousel[0]?.id;

  if (rows[0].count === 0 && carouselId) {
    const seedImages = [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759",
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    ];

    const insertQuery = `
    INSERT INTO images (img_url, sort_order, is_active, carousel_id)
    VALUES ?
  `;

    const values = seedImages.map((url, index) => [
      url,
      index,
      1,
      carouselId,
    ]);

    await conn.query(insertQuery, [values]);

    console.log("✅ Seed images inserted");
  }
}


initDB().catch((err) => {
  console.error("DB Init Error:", err);
});