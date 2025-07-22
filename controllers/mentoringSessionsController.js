// mentoringSessionsController.js

const { Double } = require("mongodb");
const MentoringSession = require("../models/mentoringSession");
const Startup = require("../models/startup");
const Mentoring = require("../models/mentoring");
const generateMentoringPDF = require("../utils/pdfGenerator");

const mentoringSessionController = {
  // Crear una nueva sesión
  async create(req, res) {
    try {
      const { mentor, startup, date, hour, duration, topic, summary } = req.body;

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
        mentorSigned: { signed: true, timestamp: new Date() },
        status: "pending",
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
        .populate("startup", "participant email")
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

          const mentoringCompany = await Mentoring.findById(session.mentor);

          let mentorDisplayName = "Mentor Desconocido";
          let mentorCompanyName = "Compañía de Mentoría Desconocida";

          if (mentoringCompany) {
            mentorDisplayName = mentoringCompany.mentor?.mentorName || "Mentor Desconocido";
            mentorCompanyName = mentoringCompany.company || "Compañía de Mentoría Desconocida";
          } else {
            console.error(
              "DEBUG (Startup): ¡Advertencia! Compañía de mentoría no encontrada para el ID:",
              session.mentor
            );
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

  // Firma por la startup
  async signByStartup(req, res) {
    try {
      const session = await MentoringSession.findById(req.params.id);
      if (!session) return res.status(404).send({ msg: "Sesión no encontrada" });

      session.startupSigned = {
        signed: true,
        timestamp: new Date(),
      };

      if (session.mentorSigned.signed) {
        session.status = "signed";

        const mentor = await Mentoring.findById(session.mentor);
        const startup = await Startup.findById(session.startup);
        const pdfUrl = await generateMentoringPDF(session, mentor, startup);
        session.pdfUrl = pdfUrl;
      }

      await session.save();
      res.status(200).send({ msg: "Sesión firmada por startup", session });
    } catch (error) {
      console.error("Error al firmar como startup:", error);
      res.status(500).send({ msg: "Error al firmar la sesión" });
    }
  },

  // Firma por el mentor
  async signByMentor(req, res) {
    try {
      const session = await MentoringSession.findById(req.params.id);
      if (!session) return res.status(404).send({ msg: "Sesión no encontrada" });

      session.mentorSigned = {
        signed: true,
        timestamp: new Date(),
      };

      if (session.startupSigned.signed) {
        session.status = "signed";

        const mentor = await Mentoring.findById(session.mentor);
        const startup = await Startup.findById(session.startup);
        const pdfUrl = await generateMentoringPDF(session, mentor, startup);
        session.pdfUrl = pdfUrl;
      }

      await session.save();
      res.status(200).send({ msg: "Sesión firmada por mentor", session });
    } catch (error) {
      console.error("Error al firmar como mentor:", error);
      res.status(500).send({ msg: "Error al firmar la sesión" });
    }
  },
};

module.exports = mentoringSessionController;
