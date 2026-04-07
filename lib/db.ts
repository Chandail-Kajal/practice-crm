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
  
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      img_url TEXT NOT NULL,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  await conn.execute(createTableQuery);

  
  const [rows]: any = await conn.query(
    "SELECT COUNT(*) as count FROM images"
  );

  if (rows[0].count === 0) {
    const seedImages = [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759",
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    ];

    const insertQuery = `
      INSERT INTO images (img_url, sort_order)
      VALUES ?
    `;

    const values = seedImages.map((url, index) => [
      url,
      index,
    ]);

    await conn.query(insertQuery, [values]);

    console.log("✅ Seed images inserted");
  }
}


initDB().catch((err) => {
  console.error("DB Init Error:", err);
});