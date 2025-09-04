// netlify/functions/uploadPDF.js
exports.handler = async function (event) {
  try {
    const { recordId, pdfUrl } = JSON.parse(event.body);

    const AIRTABLE_API_KEY = "pat0n1jcAEI4sdSqx.daeb433bbb114a3e90d82b8b380b17e6f8f007426ea36aac6e15fdcc962994fb";
    const BASE_ID = "appEr7aN5ctjnRYdM";
    const TABLE_A = "tbllSk56KZ9TA0ioI";
    const TABLE_B = "tbl1r1HbYwHvAf9uA";

    // Choose the right table (optional: here I assume both tables have PDF field)
    const urlA = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_A}/${recordId}`;
    const urlB = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_B}/${recordId}`;

    // Try updating both tables (whichever matches recordId will succeed)
    let response = await fetch(urlA, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          PDF: [{ url: pdfUrl }], // <-- make sure "PDF" is the Airtable Attachment field name
        },
      }),
    });

    if (!response.ok) {
      response = await fetch(urlB, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            PDF: [{ url: pdfUrl }],
          },
        }),
      });
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
