const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateMentoringPDF = async (session, mentor, startup) => {
  return new Promise((resolve, reject) => {
    const pdfDir = path.join(__dirname, "..", "public", "pdfs");
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

    const filename = `mentoring_${session._id}.pdf`;
    const filepath = path.join(pdfDir, filename);

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filepath);
    doc.pipe(writeStream);

    doc.fontSize(18).text("Informe de sesión de mentoría", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Mentor: ${mentor.name}`);
    doc.text(`Startup: ${startup.participant}`);
    doc.text(`Fecha: ${session.dateTime.toLocaleDateString()}`);
    doc.text(
      `Hora: ${session.dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    );
    doc.text(`Duración: ${session.duration} horas`);
    doc.moveDown();
    doc.text(`Tema tratado: ${session.topic}`);
    doc.moveDown();
    doc.text(`Resumen: ${session.summary || "Sin resumen"}`);

    doc.end();

    writeStream.on("finish", () => {
      resolve(`/pdfs/${filename}`); // Ruta accesible desde frontend
    });

    writeStream.on("error", reject);
  });
};

module.exports = generateMentoringPDF;
