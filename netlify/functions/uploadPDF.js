import Airtable from "airtable";
import multiparty from "multiparty";
import fs from "fs";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = "YourTableName"; // replace with your Airtable table

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
      const base64 = fileContent.toString("base64");

      try {
        const record = await base(TABLE_NAME).create([
          {
            fields: {
              "Generated PDF": [
                {
                  filename: file.originalFilename,
                  data: base64,
                  contentType: "application/pdf",
                },
              ],
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
