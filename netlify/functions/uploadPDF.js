import Airtable from "airtable";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    const recordId = body.recordId;
    const dummyText = body.dummy || "PDF placeholder";

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
