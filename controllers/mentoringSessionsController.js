// mentoringSessionsController.js

const { Double } = require("mongodb");
const MentoringSession = require("../models/mentoringSession");
const Startup = require("../models/startup");
const Mentoring = require("../models/mentoring"); // Modelo para la colección 'mentorship'
const generateMentoringPDF = require("../utils/pdfGenerator");
const path = require("path"); // Necesario para res.sendFile en getPDF

const mentoringSessionController = {
  // El mentor puede crear una sesión
  async create(req, res) {
    try {
      const { mentor, startup, date, hour, duration, topic, summary, mentorSignature } = req.body;

      if (!date || !hour) {
        return res.status(400).send({ msg: "Debes enviar tanto fecha como hora" });
      }

      const durationParsed = parseFloat(duration);
      if (isNaN(durationParsed) || durationParsed < 0.5 || durationParsed > 8) {
        return res.status(400).send({ msg: "Duración inválida, debe ser un número entre 0.5 y 8" });
      }

      const durationDouble = new Double(durationParsed);
      const dateTimeString = `${date}T${hour}`;
      const dateTime = new Date(dateTimeString);

      if (isNaN(dateTime)) {
        return res.status(400).send({ msg: "Fecha u hora inválidas" });
      }

      const newSession = new MentoringSession({
        mentor, // Este es el _id de la compañía de mentoría
        startup, // Este es el _id de la compañía de startup
        date: new Date(date),
        dateTime,
        duration: durationDouble,
        topic,
        summary,
        mentorSigned: {
          signed: true,
          timestamp: new Date(),
          signatureImage: mentorSignature,
        },
        status: "pending", // Sigue siendo pendiente hasta que la startup firme
      });

      await newSession.save();

      // Después de guardar, poblamos la nueva sesión para devolver los detalles completos
      const populatedSession = await MentoringSession.findById(newSession._id)
        .populate("startup") // Popula el documento completo de la startup
        .populate("mentor"); // Popula el documento completo de la compañía de mentoría

      const sessionObject = populatedSession.toObject();
      const mentorCompanyDetails = await Mentoring.findById(sessionObject.mentor._id);
      const startupCompanyDetails = await Startup.findById(sessionObject.startup._id);

      const finalSessionResponse = {
        ...sessionObject,
        mentor: {
          _id: mentorCompanyDetails._id,
          name: mentorCompanyDetails.mentor?.mentorName || "Mentor Desconocido",
          companyName: mentorCompanyDetails.company || "Compañía de Mentoría Desconocida",
        },
        startup: {
          _id: startupCompanyDetails._id,
          company: startupCompanyDetails.company || "Startup Desconocida",
        },
      };

      res.status(201).send({ msg: "Sesión creada correctamente", session: finalSessionResponse });
    } catch (error) {
      console.error("Error al crear sesión:", error);
      res.status(500).send({ msg: "Error al crear la sesión de mentoría" });
    }
  },

  // Obtener todas las sesiones (para admin)
  async getAll(req, res) {
    try {
      // --- ¡CAMBIO CLAVE AQUÍ! ---
      // Popula el documento completo de mentor y startup
      let sessions = await MentoringSession.find()
        .populate("mentor") // Popula el documento completo de la compañía de mentoría
        .populate("startup") // Popula el documento completo de la compañía de startup
        .sort({ dateTime: -1 });

      // Mapeamos las sesiones para construir los objetos mentor y startup
      // con la misma estructura que en 'create', 'signByStartup', 'signByMentor'
      const sessionsWithDetails = sessions.map((session) => {
        const sessionObject = session.toObject(); // Convierte el documento Mongoose a un objeto JS plano

        // Aseguramos que mentorDetails y startupDetails existan antes de acceder a sus propiedades
        const mentorCompanyDetails = sessionObject.mentor; // Ya populado
        const startupCompanyDetails = sessionObject.startup; // Ya populado

        return {
          ...sessionObject,
          mentor: {
            _id: mentorCompanyDetails?._id,
            name: mentorCompanyDetails?.mentor?.mentorName || "Mentor Desconocido",
            companyName: mentorCompanyDetails?.company || "Compañía de Mentoría Desconocida",
          },
          startup: {
            _id: startupCompanyDetails?._id,
            company: startupCompanyDetails?.company || "Startup Desconocida",
          },
        };
      });

      res.status(200).send({ sessions: sessionsWithDetails });
    } catch (error) {
      console.error("Error al obtener sesiones:", error);
      res.status(500).send({ msg: "Error al obtener las sesiones" });
    }
  },

  // Obtener sesiones por mentor (filtra por ID de la compañía de mentoría)
  async getByMentor(req, res) {
    try {
      const companyId = req.params.mentorId;

      const mentoringCompany = await Mentoring.findById(companyId);

      if (!mentoringCompany) {
        console.error("DEBUG (Mentor): Compañía de mentoría no encontrada:", companyId);
        return res.status(404).send({ msg: "Compañía de mentoría no encontrada con ese ID." });
      }

      const individualMentorDetails = mentoringCompany.mentor;
      const mentorDisplayName = individualMentorDetails?.mentorName || "Mentor Desconocido";
      const mentorCompanyName = mentoringCompany.company || "Compañía de Mentoría Desconocida";

      let sessions = await MentoringSession.find({ mentor: companyId })
        .populate("startup", "company")
        .sort({ dateTime: -1 });

      const sessionsWithMentorDetails = sessions.map((session) => {
        const sessionObject = session.toObject();
        return {
          ...sessionObject,
          mentor: {
            _id: companyId,
            name: mentorDisplayName,
            companyName: mentorCompanyName,
          },
        };
      });

      res.status(200).send({ sessions: sessionsWithMentorDetails });
    } catch (error) {
      console.error("Error al obtener sesiones por mentor:", error);
      res.status(500).send({ msg: "Error al buscar sesiones del mentor." });
    }
  },

  // Obtener sesiones por startup (filtra por ID de la compañía de la startup)
  async getByStartup(req, res) {
    try {
      const startupCompanyId = req.params.startupId;

      const startupCompany = await Startup.findById(startupCompanyId);

      if (!startupCompany) {
        return res.status(404).send({ msg: "Compañía de startup no encontrada con ese ID." });
      }

      const startupCompanyName = startupCompany.company || "Startup Desconocida";

      let sessions = await MentoringSession.find({ startup: startupCompanyId }).sort({
        dateTime: -1,
      });

      const sessionsWithDetails = await Promise.all(
        sessions.map(async (session) => {
          const sessionObject = session.toObject();

          const mentoringCompany = await Mentoring.findById(session.mentor);

          let mentorDisplayName = "Mentor Desconocido";
          let mentorCompanyName = "Compañía de Mentoría Desconocida";

          if (mentoringCompany) {
            mentorDisplayName = mentoringCompany.mentor?.mentorName || "Mentor Desconocido";
            mentorCompanyName = mentoringCompany.company || "Compañía de Mentoría Desconocida";
          }

          return {
            ...sessionObject,
            mentor: {
              _id: session.mentor,
              name: mentorDisplayName,
              companyName: mentorCompanyName,
            },
            startup: {
              _id: startupCompanyId,
              company: startupCompanyName,
            },
          };
        })
      );

      res.status(200).send({ sessions: sessionsWithDetails });
    } catch (error) {
      console.error("Error al obtener sesiones por startup:", error);
      res.status(500).send({ msg: "Error al buscar sesiones de la startup." });
    }
  },

  // Obtener y mostrar el PDF de una sesión (TU VERSIÓN ORIGINAL)
  async getPDF(req, res) {
    try {
      const sessionId = req.params.id;
      const session = await MentoringSession.findById(sessionId);

      if (!session) {
        return res.status(404).send({ msg: "Sesión no encontrada." });
      }

      if (!session.pdfUrl) {
        return res.status(404).send({
          msg: "PDF no disponible para esta sesión. Asegúrate de que ambas partes hayan firmado.",
        });
      }

      // Extraer el nombre del archivo del pdfUrl
      const fileName = session.pdfUrl.split("/").pop(); // Obtiene "session_ID.pdf"

      // Define el directorio raíz para res.sendFile
      const rootDir = path.join(__dirname, "../pdfs");
      const absoluteFilePath = path.join(rootDir, fileName); // Esta es la ruta completa para el logging

      // Usar res.sendFile para enviar el archivo directamente
      res.sendFile(
        fileName,
        {
          root: rootDir, // ¡Especifica el directorio raíz!
          headers: {
            "Content-Type": "application/pdf", // ¡Establece explícitamente el tipo de contenido!
            "Content-Disposition": `inline; filename="${fileName}"`, // Sugiere que se muestre en línea
          },
        },
        (err) => {
          if (err) {
            console.error(`Error al enviar el archivo PDF:`, err);
            if (err.code === "ENOENT") {
              return res
                .status(404)
                .send({ msg: "Archivo PDF no encontrado en el servidor en la ruta especificada." });
            }
            res.status(500).send({ msg: `Error interno al servir el PDF: ${err.message}` });
          }
        }
      );
    } catch (error) {
      console.error("Error general al obtener el PDF de la sesión:", error);
      res.status(500).send({ msg: "Error interno al intentar obtener el PDF." });
    }
  },

  // Firma por la startup
  async signByStartup(req, res) {
    try {
      const sessionId = req.params.id;
      const { signature } = req.body; // firma dibujada de la startup

      const session = await MentoringSession.findById(sessionId);
      if (!session) {
        return res.status(404).send({ msg: "Sesión no encontrada" });
      }

      session.startupSigned = {
        signed: true,
        timestamp: new Date(),
        signatureImage: signature, // ¡GUARDAMOS LA FIRMA DIBUJADA DE LA STARTUP!
      };

      // Si ambas partes han firmado, cambiar el estado y generar PDF
      if (session.mentorSigned.signed) {
        session.status = "signed";

        try {
          const mentorCompany = await Mentoring.findById(session.mentor);
          const startupCompany = await Startup.findById(session.startup);

          // Pasamos AMBAS firmas al generador de PDF
          const pdfUrl = await generateMentoringPDF(
            session,
            mentorCompany,
            startupCompany,
            session.mentorSigned.signatureImage, // Firma del mentor (si existe)
            session.startupSigned.signatureImage // Firma de la startup
          );

          session.pdfUrl = pdfUrl;
        } catch (pdfError) {
          console.error("Error al generar PDF:", pdfError);
        }
      }

      await session.save(); // Guardar la sesión con la firma y/o pdfUrl

      // --- ¡CAMBIO CLAVE AQUÍ! ---
      // Después de guardar, poblamos la sesión para devolver los detalles completos
      const populatedSession = await MentoringSession.findById(session._id)
        .populate("startup")
        .populate("mentor");

      // Construimos el objeto de sesión con detalles completos para el frontend
      const sessionObject = populatedSession.toObject();
      const mentorCompanyDetails = await Mentoring.findById(sessionObject.mentor._id);
      const startupCompanyDetails = await Startup.findById(sessionObject.startup._id);

      const finalSessionResponse = {
        ...sessionObject,
        mentor: {
          _id: mentorCompanyDetails._id,
          name: mentorCompanyDetails.mentor?.mentorName || "Mentor Desconocido",
          companyName: mentorCompanyDetails.company || "Compañía de Mentoría Desconocida",
        },
        startup: {
          _id: startupCompanyDetails._id,
          company: startupCompanyDetails.company || "Startup Desconocida",
        },
      };

      res.status(200).send({ msg: "Sesión firmada por startup", session: finalSessionResponse });
    } catch (error) {
      console.error("Error general al firmar como startup:", error);
      res.status(500).send({ msg: "Error al firmar la sesión" });
    }
  },

  // Firma por el mentor (si no se firmó al crear o para refirmar)
  async signByMentor(req, res) {
    try {
      const sessionId = req.params.id;
      const { signature } = req.body; // Recibimos la firma dibujada del mentor

      const session = await MentoringSession.findById(sessionId);
      if (!session) {
        return res.status(404).send({ msg: "Sesión no encontrada" });
      }

      session.mentorSigned = {
        signed: true,
        timestamp: new Date(),
        signatureImage: signature, // ¡GUARDAMOS LA FIRMA DIBUJADA DEL MENTOR!
      };

      // Si ambas partes han firmado, cambiar el estado y generar PDF
      if (session.startupSigned.signed) {
        session.status = "signed";

        try {
          const mentorCompany = await Mentoring.findById(session.mentor);
          const startupCompany = await Startup.findById(session.startup);

          // Pasamos AMBAS firmas al generador de PDF
          const pdfUrl = await generateMentoringPDF(
            session,
            mentorCompany,
            startupCompany,
            session.mentorSigned.signatureImage, // Firma del mentor
            session.startupSigned.signatureImage // Firma de la startup (si existe)
          );

          session.pdfUrl = pdfUrl;
        } catch (pdfError) {
          console.error("Error al generar PDF:", pdfError);
        }
      }

      await session.save(); // Guardar la sesión con la firma y/o pdfUrl

      // --- ¡CAMBIO CLAVE AQUÍ! ---
      // Después de guardar, poblamos la sesión para devolver los detalles completos
      const populatedSession = await MentoringSession.findById(session._id)
        .populate("startup")
        .populate("mentor");

      // Construimos el objeto de sesión con detalles completos para el frontend
      const sessionObject = populatedSession.toObject();
      const mentorCompanyDetails = await Mentoring.findById(sessionObject.mentor._id);
      const startupCompanyDetails = await Startup.findById(sessionObject.startup._id);

      const finalSessionResponse = {
        ...sessionObject,
        mentor: {
          _id: mentorCompanyDetails._id,
          name: mentorCompanyDetails.mentor?.mentorName || "Mentor Desconocido",
          companyName: mentorCompanyDetails.company || "Compañía de Mentoría Desconocida",
        },
        startup: {
          _id: startupCompanyDetails._id,
          company: startupCompanyDetails.company || "Startup Desconocida",
        },
      };

      res.status(200).send({ msg: "Sesión firmada por mentor", session: finalSessionResponse });
    } catch (error) {
      console.error("Error general al firmar como mentor:", error);
      res.status(500).send({ msg: "Error al firmar la sesión" });
    }
  },
};

module.exports = mentoringSessionController;
