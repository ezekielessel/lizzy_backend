const express = require("express");
const pg = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config();


const router = express.Router();

const pool = new pg.Pool({
  connectionString: process.env.DB_URL,
  ssl: true
});

// Registration
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      "INSERT INTO user_account (user_name, user_email, password_hash) VALUES ($1, $2, $3)",
      [username, email, hashedPassword]
    );
    res.status(201).send("Registration successful");
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("An error occurred");
  }
});

//Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM user_account WHERE user_email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).send("Invalid email ");
    }

    const user = result.rows[0];
    console.log("user", user);

    const check = await bcrypt.compare(password, user.password_hash);
    console.log("-----check", check);

    if (!check) {
      res.status(500).send({ message: "Password incorrect", payload: null });
      return;
    }
    delete user.password_hash;

    const responsePayLoad = {
      message: "Login successful. Redirect to the next page.",
      username: user.user_name,
      role: user.role,
      payload: user,
    };

    res.status(201).send(responsePayLoad);
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send({ message: "An error occurred", payload: null });
  }
});


const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDY_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

router.post("/add_data", upload.single("pdfData"), async (req, res) => {
  const { text, text_description } = req.body;
  const pdfData = req.file;

  console.log("text", text);
  console.log("text_description", text_description);
  console.log("pdfData", pdfData);

  try {
    // Upload the PDF to Cloudinary
    const result = await cloudinary.uploader.upload(pdfData.path, {
      resource_type: "auto",
    });

    // Store the Cloudinary URL in the database
    const insertQuery = `
     INSERT INTO add_pdf (text_info, text_des, pdf_file, download_count)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;

    const resultDb = await pool.query(insertQuery, [
      text,
      text_description,
      download_count,
      result.url,
    ]);

    if (resultDb.rowCount === 1) {
      res.status(201).json({
        message: "Data inserted successfully",
        insertedId: resultDb.rows[0].id,
      });
    } else {
      res.status(500).json({ message: "Data insertion failed" });
    }
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

//  route for fetching text and a PDF file
router.get("/fetch_data", async (req, res) => {
  try {
    // Query to retrieve text and PDF data from the database
    const query = "SELECT id, text_info, text_des, pdf_file, download_count FROM add_pdf";

    const result = await pool.query(query);

    const data = result.rows.map((row) => ({
      id: row.id,
      text: row.text_info,
      text_description: row.text_des,
      pdfData: row.pdf_file,
      downloads: row.download_count,

    }));
    res.setHeader("Content-Type", "application/pdf");

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// route for download count 
router.get("/download_count/:id", async (req, res) => {
  const id = req.params.id;
  const updateDownloadCountQuery = `
    UPDATE add_pdf
    SET download_count = download_count + 1
    WHERE id = $1
  `;

  try {
    await pool.query(updateDownloadCountQuery, [id]);
    res.status(200).send("Download count updated successfully");
  } catch (error) {
    console.error("Error updating download count:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});


// Delete route for Text
router.delete("/delete_data/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const deleteQuery = "DELETE FROM add_pdf WHERE id = $1";
    const result = await pool.query(deleteQuery, [id]);

    if (result.rowCount === 1) {
      res.status(200).json({ message: "Data deleted successfully" });
    } else {
      res.status(404).json({ message: "Data not found" });
    }
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

//Sending  Email
router.post("/add_email", async (req, res) => {
  const { email_address, email_message } = req.body;

  try {
    await pool.query(
      "INSERT INTO add_email (email_address, email_message) VALUES ($1, $2)",
      [email_address, email_message]
    );
    res.status(201).send("Email Sent successful");
  } catch (error) {
    console.error("Error during email:", error);
    res.status(500).send("An error occurred");
  }
});

// route for fetching email and message
router.get("/fetch_email", async (req, res) => {
  try {
    // Query to retrieve text and PDF data from the database
    const query = "SELECT id, email_address, email_message FROM add_email";

    const result = await pool.query(query);

    const data = result.rows.map((row) => ({
      id: row.id,
      emailAddress: row.email_address,
      emailMessage: row.email_message,
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a Delete route to email and message Admin
router.delete("/delete_email/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // Query to delete a specific email by ID
    const deleteQuery = "DELETE FROM add_email WHERE id = $1";
    const result = await pool.query(deleteQuery, [id]);

    if (result.rowCount === 1) {
      res.status(200).json({ message: "Email deleted successfully" });
    } else {
      res.status(404).json({ message: "Email not found" });
    }
  } catch (error) {
    console.error("Error deleting email:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});
module.exports = router;
