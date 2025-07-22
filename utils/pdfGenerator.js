// utils/pdfGenerator.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path"); // Importar 'path' para rutas absolutas

async function generateMentoringPDF(
  session,
  mentorCompany,
  startupCompany,
  mentorSignatureImage,
  startupSignatureImage
) {
  const doc = new PDFDocument();

  // Usar path.join para construir una ruta absoluta y robusta
  // __dirname aquí es el directorio actual de utils/pdfGenerator.js
  const pdfsFolderPath = path.join(__dirname, "../pdfs"); // Asume que 'pdfs' está un nivel arriba de 'utils'
  const fileName = `session_${session._id}.pdf`;
  const filePath = path.join(pdfsFolderPath, fileName); // Ruta donde se guarda el PDF

  // Asegurarse de que la carpeta 'pdfs' existe
  if (!fs.existsSync(pdfsFolderPath)) {
    fs.mkdirSync(pdfsFolderPath, { recursive: true });
    console.log(`DEBUG (PDF Gen): Carpeta 'pdfs' creada en: ${pdfsFolderPath}`);
  }

  console.log(`DEBUG (PDF Gen): Intentando guardar PDF en: ${filePath}`); // Log de la ruta de guardado
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  doc.fontSize(25).text("Informe de Sesión de Mentoría", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Mentoría: ${mentorCompany.company}`);
  doc.text(`Mentor: ${mentorCompany.mentor?.mentorName}`);
  doc.text(`Startup: ${startupCompany.company}`);
  doc.text(`Fecha: ${new Date(session.dateTime).toLocaleDateString()}`);
  doc.text(`Duración: ${session.duration} horas`);
  doc.text(`Tema: ${session.topic}`);
  doc.text(`Resumen: ${session.summary || "No disponible"}`);
  doc.moveDown();

  // --- Firmas Dibujadas ---
  doc.fontSize(10).text("Firmas:");
  doc.moveDown(0.5);

  // Firma del Mentor
  doc.text("Firma del Mentor:");
  if (mentorSignatureImage) {
    try {
      doc.image(mentorSignatureImage, {
        fit: [150, 75],
        align: "left",
        valign: "top",
      });
    } catch (imageError) {
      console.error("Error al añadir imagen de firma del mentor al PDF:", imageError);
      doc.text("(Error al cargar la firma dibujada del mentor)");
    }
  } else {
    doc.text("(Firma del mentor no disponible o no dibujada)");
  }
  doc.moveDown(1);

  // Firma de la Startup
  doc.text("Firma de la Startup:");
  if (startupSignatureImage) {
    try {
      doc.image(startupSignatureImage, {
        fit: [150, 75],
        align: "left",
        valign: "top",
      });
    } catch (imageError) {
      console.error("Error al añadir imagen de firma de la startup al PDF:", imageError);
      doc.text("(Error al cargar la firma dibujada de la startup)");
    }
  } else {
    doc.text("(Firma de la startup no disponible o no dibujada)");
  }
  doc.moveDown();

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on("finish", () => {
      const publicUrl = `http://localhost:8080/pdfs/${fileName}`; // Usar fileName para consistencia
      console.log(`DEBUG (PDF Gen): PDF generado y URL pública: ${publicUrl}`); // Log de la URL pública
      resolve(publicUrl);
    });
    writeStream.on("error", (err) => {
      console.error(`DEBUG (PDF Gen): Error al escribir el archivo PDF: ${err.message}`);
      reject(err);
    });
  });
}

module.exports = generateMentoringPDF;
