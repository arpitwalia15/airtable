import Airtable from "airtable";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

export async function handler(event) {
  try {
    const formData = await parseMultipartForm(event); // custom parser for FormData
    const recordId = formData.recordId;
    const dummyText = formData.dummy || "PDF placeholder";

    // ✅ Update Airtable with dummy text
    const updated = await base(process.env.AIRTABLE_TABLE_A_ID).update([
      {
        id: recordId,
        fields: {
          "Generated PDF": dummyText
        }
      }
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, updated })
    };
  } catch (err) {
    console.error("Upload error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}

// Helper: parse multipart/form-data
async function parseMultipartForm(event) {
  const busboy = await import("busboy");
  return new Promise((resolve, reject) => {
    const bb = busboy.default({ headers: event.headers });
    const fields = {};

    bb.on("field", (name, val) => {
      fields[name] = val;
    });

    bb.on("finish", () => {
      resolve(fields);
    });

    bb.on("error", reject);

    bb.end(Buffer.from(event.body, "base64"));
  });
}
