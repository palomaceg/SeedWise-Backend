const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

async function generateMentoringPDF(
  session,
  mentorCompany,
  startupCompany,
  mentorSignatureImage,
  startupSignatureImage
) {
  const doc = new PDFDocument();
  const fileName = `session_${session._id}.pdf`;

  const pdfsFolderPath = path.join(__dirname, "../pdfs");
  const filePath = path.join(pdfsFolderPath, fileName);

  if (!fs.existsSync(pdfsFolderPath)) {
    fs.mkdirSync(pdfsFolderPath, { recursive: true });
  }

  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  const headerImagePath = path.join(__dirname, "..", "assets", "cabecero.png");

  doc.image(headerImagePath, 0, 0, {
    width: doc.page.width, // ocupa todo el ancho
    height: 78, // o el alto que tenga tu cabecera
  });

  doc.moveDown(6);

  doc.fontSize(24).font("Helvetica").text("Informe de Sesión de Mentoría", { align: "center" });

  doc.moveDown();

  doc.fontSize(14).text(`Mentor: ${mentorCompany.company}`);
  doc.moveDown();
  doc.text(`Mentor: ${mentorCompany.mentor?.mentorName}`);
  doc.moveDown();
  doc.text(`Startup: ${startupCompany.company}`);
  doc.moveDown();
  doc.text(`Fecha: ${new Date(session.dateTime).toLocaleDateString()}`);
  doc.moveDown();
  doc.text(`Duración: ${session.duration} horas`);
  doc.moveDown();
  doc.text(`Tema: ${session.topic}`);
  doc.moveDown();
  doc.text(`Resumen: ${session.summary || "No disponible"}`);

  doc.moveDown();

  // --- Firmas Dibujadas ---
  doc.fontSize(12).text("Firmas:");
  doc.moveDown(1.5);

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
        align: "right",
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
      // La URL pública ahora es la URL de tu servidor Express sirviendo archivos estáticos
      const publicUrl = `http://localhost:8080/pdfs/${fileName}`;
      resolve(publicUrl);
    });
    writeStream.on("error", (err) => {
      console.error(`Error al escribir el archivo PDF localmente: ${err.message}`);
      reject(err);
    });
  });
}

module.exports = generateMentoringPDF;
