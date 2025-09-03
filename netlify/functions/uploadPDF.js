import Airtable from "airtable";
import multiparty from "multiparty";
import fetch from "node-fetch";
import fs from "fs";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = "TableA"; // replace with your table name

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(BASE_ID);

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const form = new multiparty.Form();
  return new Promise((resolve, reject) => {
    form.parse(event, async (err, fields, files) => {
      if (err) reject({ statusCode: 500, body: err.toString() });

      const file = files.file[0];
      const fileContent = fs.readFileSync(file.path);

      try {
        // 1. Upload PDF to a free file hosting API (replace with your preferred service)
        const uploadRes = await fetch("https://api.upload.io/v2/accounts/YOUR_ID/uploads/form_data", {
          method: "POST",
          headers: { Authorization: "Bearer " + process.env.UPLOAD_API_KEY },
          body: (() => {
            const formData = new FormData();
            formData.append("file", fileContent, file.originalFilename);
            return formData;
          })()
        });
        const uploadData = await uploadRes.json();
        const fileUrl = uploadData.fileUrl;

        // 2. Store file URL in Airtable "Generated PDF"
        const record = await base(TABLE_NAME).create([
          {
            fields: {
              "Generated PDF": [{ url: fileUrl }],
            },
          },
        ]);

        resolve({
          statusCode: 200,
          body: JSON.stringify({ message: "Uploaded!", record }),
        });
      } catch (error) {
        resolve({ statusCode: 500, body: error.toString() });
      }
    });
  });
};
