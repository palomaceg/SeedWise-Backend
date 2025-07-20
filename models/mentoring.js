const mongoose = require('mongoose');

const MentoringSchema = new mongoose.Schema (
    {
        category:{
            type: String,
            required: [true, 'Porfavor, indicanos tu nombre'],
        },
        company: {
            type: String,
            required: [true, 'Por favor, indícanos el nombre de tu empresa'],
        },
        website: {
            type: String,
        },
        mentor: {
            type: Object,
        },
        logo: {
            type: String,
        },
         },
        {
            timestamps: true,
            collection: "mentorship",
        }
)

const mentoring = mongoose.model('mentoring', MentoringSchema);
module.exports = mentoring;