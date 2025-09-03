// import fetch from "node-fetch";
// import PDFDocument from "pdfkit";
// import { Buffer } from "buffer";

// export async function handler(event, context) {
//   try {
//     const { selected } = JSON.parse(event.body); // from Webflow
//     const doc = new PDFDocument();
//     let buffers = [];

//     doc.on("data", buffers.push.bind(buffers));
//     doc.on("end", async () => {
//       let pdfData = Buffer.concat(buffers);

//       // Upload back to Airtable (for example, into Table A)
//       // const baseId = process.env.AIRTABLE_BASE_ID;
//       // const apiKey = process.env.AIRTABLE_TOKEN;

//       const baseId = "appEr7aN5ctjnRYdM";
//       const apiKey = "pat0n1jcAEI4sdSqx.daeb433bbb114a3e90d82b8b380b17e6f8f007426ea36aac6e15fdcc962994fb"; // ✅ match .env

//       await fetch(`https://api.airtable.com/v0/${baseId}/tbllSk56KZ9TA0ioI`, {
//         method: "PATCH",
//         headers: {
//           Authorization: `Bearer ${apiKey}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           records: [{
//             id: selected[0].id, // attach to first selected record
//             fields: {
//               PDF: [
//                 {
//                   url: "data:application/pdf;base64," + pdfData.toString("base64")
//                 }
//               ]
//             }
//           }]
//         })
//       });
//     });

//     // Add images to PDF
//     for (let img of selected) {
//       doc.image(img.url, { fit: [500, 400], align: "center" });
//       doc.addPage();
//     }
//     doc.end();

//     return { statusCode: 200, body: "PDF generated & uploaded" };

//   } catch (err) {
//     return { statusCode: 500, body: err.toString() };
//   }
// }
