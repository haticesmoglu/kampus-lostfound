const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "kampus_db",
  password: "1234",
  port: 5432,
});

const initDb = async () => {
  try {
    // 1. Kullanıcılar
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'user'
      );
    `);

    // 2. Kategoriler
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );
    `);

    // 3. Konumlar
    await pool.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        building_name VARCHAR(100) NOT NULL,
        floor VARCHAR(50) NOT NULL,
        description TEXT
      );
    `);

    // 4. İlanlar
    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        image_url VARCHAR(255),
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        user_id INTEGER REFERENCES users(id),
        category_id INTEGER REFERENCES categories(id),
        location_id INTEGER REFERENCES locations(id)
      );
    `);

    // 5. Bildirimler
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE
      );
    `);

    // Seed Verileri
    const catCheck = await pool.query("SELECT COUNT(*) FROM categories");
    if (parseInt(catCheck.rows[0].count) === 0) {
      await pool.query(
        "INSERT INTO categories (name) VALUES ('Elektronik'), ('Kıyafet'), ('Çanta'), ('Kırtasiye')",
      );
    }

    const locCheck = await pool.query("SELECT COUNT(*) FROM locations");
    if (parseInt(locCheck.rows[0].count) === 0) {
      await pool.query(
        "INSERT INTO locations (building_name, floor, description) VALUES ('Mühendislik Fakültesi', 'Kat 1', 'A Blok Koridoru'), ('Merkez Kütüphane', 'Kat 2', 'Çalışma Salonu'), ('Öğrenci Yemekhanesi', 'Zemin Kat', 'Turnikelerin Yanı')",
      );
    }

    const userCheck = await pool.query("SELECT COUNT(*) FROM users");
    if (parseInt(userCheck.rows[0].count) === 0) {
      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ('Süper Admin', 'admin@edu.tr', '123', 'admin'), ('Kampüs Güvenlik', 'guvenlik@edu.tr', '123', 'security'), ('Ahmet Öğrenci', 'ahmet@ogrenci.edu.tr', '123', 'user')",
      );
    }

    console.log("PostgreSQL Veritabanı ve Tablolar Başarıyla Oluşturuldu!");
  } catch (err) {
    console.error("Veritabanı oluşturma hatası:", err);
  }
};

initDb();

module.exports = pool;
