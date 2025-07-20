const MentoringSession = require("../models/mentoringSession");
const Startup = require("../models/startup");
const Mentoring = require("../models/mentoring");
const generateMentoringPDF = require("../utils/pdfGenerator");

const mentoringSessionController = {
  // Crear una nueva sesión
  async create(req, res) {
    try {
      const { mentor, startup, dateTime, duration, topic, summary } = req.body;

      const newSession = new MentoringSession({
        mentor,
        startup,
        dateTime,
        duration,
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
        .populate("mentor", "name email")
        .populate("startup", "participant email")
        .sort({ dateTime: -1 });

      res.status(200).send({ sessions });
    } catch (error) {
      console.error("Error al obtener sesiones:", error);
      res.status(500).send({ msg: "Error al obtener las sesiones" });
    }
  },

  // Obtener sesiones por mentor
  async getByMentor(req, res) {
    try {
      const sessions = await MentoringSession.find({ mentor: req.params.mentorId })
        .populate("startup", "participant")
        .sort({ dateTime: -1 });

      res.status(200).send({ sessions });
    } catch (error) {
      console.error("Error al obtener sesiones por mentor:", error);
      res.status(500).send({ msg: "Error al buscar sesiones del mentor" });
    }
  },

  // Obtener sesiones por startup
  async getByStartup(req, res) {
    try {
      const sessions = await MentoringSession.find({ startup: req.params.startupId })
        .populate("mentor", "name")
        .sort({ dateTime: -1 });

      res.status(200).send({ sessions });
    } catch (error) {
      console.error("Error al obtener sesiones por startup:", error);
      res.status(500).send({ msg: "Error al buscar sesiones de la startup" });
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

        // Generar PDF cuando ambas firmas estén
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

  // Firma por el mentor (si no se firmó al crear)
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

        // Generar PDF cuando ambas firmas estén
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
