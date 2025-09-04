// netlify/functions/uploadPDF.js
const fetch = require("node-fetch");
const FormData = require("form-data");
const fs = require("fs");
const multiparty = require("multiparty");
const util = require("util");

exports.handler = async (event) => {
  // 🔹 Handle Preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: "Preflight OK",
    };
  }

  try {
    // 🔹 Parse multipart form using multiparty
    const form = new multiparty.Form();
    const parseForm = util.promisify(form.parse.bind(form));

    const { fields, files } = await parseForm({
      headers: event.headers,
      // convert body back from base64 to buffer
      body: Buffer.from(event.body, "base64"),
    });

    const filePath = files.file[0].path;
    const records = JSON.parse(fields.records[0]);

    // 🔹 Upload to Cloudinary
    const cloudName = "dgpesr4ys";
    const uploadPreset = "unsigned_pdfs";

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    formData.append("upload_preset", uploadPreset);

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      { method: "POST", body: formData }
    );

    const cloudJson = await cloudRes.json();
    if (!cloudJson.secure_url) {
      throw new Error("Failed to upload: " + JSON.stringify(cloudJson));
    }

    const pdfUrl = cloudJson.secure_url;

    // 🔹 Save PDF link in Airtable
    const AIRTABLE_API_KEY = "pat0n1jcAEI4sdSqx.daeb433bbb114a3e90d82b8b380b17e6f8f007426ea36aac6e15fdcc962994fb"; // 👈 move sensitive keys to Netlify env
    const BASE_ID = "appEr7aN5ctjnRYdM";
    const TABLE_A = "tbllSk56KZ9TA0ioI";

    for (let recordId of records) {
      await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_A}/${recordId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            "Generated PDF": [{ url: pdfUrl }],
          },
        }),
      });
    }

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ success: true, pdfUrl }),
    };
  } catch (err) {
    console.error("Upload error:", err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};

// 🔹 Helper for CORS
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "https://giovannis-marvelous-site-238521.webflow.io",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
  };
}


