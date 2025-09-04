// netlify/functions/uploadPDF.js
const fetch = require("node-fetch");
const multiparty = require("multiparty");
const FormData = require("form-data");
const fs = require("fs");

exports.handler = async function (event) {
  try {
    const form = new multiparty.Form();

    const data = await new Promise((resolve, reject) => {
      form.parse(event, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const filePath = data.files.file[0].path;
    const records = JSON.parse(data.fields.records[0]);

    // 🔹 Upload PDF to Cloudinary
    const cloudName = "dgpesr4ys";
    const uploadPreset = "unsigned_pdfs";


    const fileStream = fs.createReadStream(filePath);
    const formData = new FormData();
    formData.append("file", fileStream);
    formData.append("upload_preset", uploadPreset);

    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body: formData
    });
    const cloudJson = await cloudRes.json();

    if (!cloudJson.secure_url) {
      throw new Error("Failed to upload PDF to Cloudinary");
    }

    const pdfUrl = cloudJson.secure_url;

    // 🔹 Save link in Airtable under "Generated PDF"
    const AIRTABLE_API_KEY = "pat0n1jcAEI4sdSqx.daeb433bbb114a3e90d82b8b380b17e6f8f007426ea36aac6e15fdcc962994fb";
    const BASE_ID = "appEr7aN5ctjnRYdM";
    const TABLE_A = "tbllSk56KZ9TA0ioI";

    for (let recordId of records) {
      await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_A}/${recordId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fields: {
            "Generated PDF": [{ url: pdfUrl }]
          }
        })
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, pdfUrl })
    };
  } catch (err) {
    console.error("Upload error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
