// mentoringSessionsController.js

const { Double } = require("mongodb");
const MentoringSession = require("../models/mentoringSession");
const Startup = require("../models/startup");
const Mentoring = require("../models/mentoring");
const generateMentoringPDF = require("../utils/pdfGenerator");

const mentoringSessionController = {
  // Crear una nueva sesión
  // Ahora el mentor puede firmar (dibujar) al crear la sesión
  async create(req, res) {
    try {
      const { mentor, startup, date, hour, duration, topic, summary, mentorSignature } = req.body; // Recibe mentorSignature

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
        mentor,
        startup,
        date: new Date(date),
        dateTime,
        duration: durationDouble,
        topic,
        summary,
        mentorSigned: {
          signed: true, // El mentor firma al crear
          timestamp: new Date(),
          signatureImage: mentorSignature, // Guarda la firma dibujada del mentor
        },
        status: "pending", // Sigue siendo pendiente hasta que la startup firme
      });

      await newSession.save();
      res.status(201).send({ msg: "Sesión creada correctamente", session: newSession });
    } catch (error) {
      console.error("Error al crear sesión:", error);
      res.status(500).send({ msg: "Error al crear la sesión de mentoría" });
    }
  },

  // Obtener todas las sesiones (para admin)
  async getAll(req, res) {
    try {
      const sessions = await MentoringSession.find()
        .populate("mentor", "name email company")
        .populate("startup", "company contact email")
        .sort({ dateTime: -1 });

      res.status(200).send({ sessions });
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

          console.log(session.mentor);

          const mentoringCompany = await Mentoring.findById(session.mentor);

          console.log(mentoringCompany ? mentoringCompany._id : "NO ENCONTRADO");

          let mentorDisplayName = "Mentor Desconocido";
          let mentorCompanyName = "Compañía de Mentoría Desconocida";

          if (mentoringCompany) {
            mentorDisplayName = mentoringCompany.mentor?.mentorName || "Mentor Desconocido";
            mentorCompanyName = mentoringCompany.company || "Compañía de Mentoría Desconocida";
            console.log(mentoringCompany.company);
          } else {
            console.error(session.mentor);
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

  // Obtener y mostrar el PDF de una sesión
  async getPDF(req, res) {
    try {
      const sessionId = req.params.id;
      const session = await MentoringSession.findById(sessionId);

      if (!session) {
        console.log(`DEBUG (getPDF): Sesión ${sessionId} no encontrada.`);
        return res.status(404).send({ msg: "Sesión no encontrada." });
      }

      if (!session.pdfUrl) {
        console.log(
          `DEBUG (getPDF): PDF no disponible para sesión ${sessionId}. pdfUrl es nulo/vacío.`
        );
        return res.status(404).send({
          msg: "PDF no disponible para esta sesión. Asegúrate de que ambas partes hayan firmado.",
        });
      }

      console.log(`DEBUG (getPDF): Redirigiendo a: ${session.pdfUrl}`); // Log de la URL de redirección
      res.redirect(session.pdfUrl);
    } catch (error) {
      console.error("Error al obtener el PDF de la sesión:", error);
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
        console.log(" (Backend - signByStartup): Ambas partes han firmado. Generando PDF...");

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
          console.log("DEBUG (Backend - signByStartup): PDF generado y URL asignada:", pdfUrl);
        } catch (pdfError) {
          console.error("DEBUG (Backend - signByStartup): Error al generar PDF:", pdfError);
        }
      }

      try {
        await session.save();
        console.log(session._id);
        res.status(200).send({ msg: "Sesión firmada por startup", session });
      } catch (saveError) {
        console.error("DEBUG (Backend - signByStartup): Error al guardar la sesión:", saveError);
        res.status(500).send({ msg: "Error al guardar la sesión después de la firma." });
      }
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
          console.log("DEBUG (Backend - signByMentor): PDF generado y URL asignada:", pdfUrl);
        } catch (pdfError) {
          console.error("DEBUG (Backend - signByMentor): Error al generar PDF:", pdfError);
        }
      }

      try {
        await session.save();
        res.status(200).send({ msg: "Sesión firmada por mentor", session });
      } catch (saveError) {
        console.error("DEBUG (Backend - signByMentor): Error al guardar la sesión:", saveError);
        res.status(500).send({ msg: "Error al guardar la sesión después de la firma." });
      }
    } catch (error) {
      console.error("Error general al firmar como mentor:", error);
      res.status(500).send({ msg: "Error al firmar la sesión" });
    }
  },
};

module.exports = mentoringSessionController;
