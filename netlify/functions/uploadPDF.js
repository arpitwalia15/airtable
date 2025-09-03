// netlify/functions/uploadPDF.js
import fetch from "node-fetch";
import multiparty from "multiparty";
import fs from "fs";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const BASE_ID = "appEr7aN5ctjnRYdM";
    const TABLE_A = "tbllSk56KZ9TA0ioI";

    // Parse incoming form-data
    const form = new multiparty.Form();
    const data = await new Promise((resolve, reject) => {
      form.parse(event, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const recordId = data.fields.recordId[0];
    const file = data.files.file[0];

    // ⚠️ You need to upload the file somewhere publicly accessible (S3, Cloudinary, or Netlify file serving)
    // For demo, let's assume you upload file to Cloudinary and get back a URL
    const pdfUrl = "https://your-public-storage.com/" + file.originalFilename;

    // Update Airtable record with PDF URL
    const updateRes = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_A}/${recordId}`,
      {
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
      }
    );

    const airtableResp = await updateRes.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, airtable: airtableResp }),
    };
  } catch (err) {
    console.error("Upload failed:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
