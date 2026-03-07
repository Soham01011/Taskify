const mongoose = require('mongoose');


// Each thread entry is a quick note or progress update on the idea
const ThreadEntrySchema = new mongoose.Schema({
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
});

const IdeaSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: String,
    // Optional thread of notes/progress updates. If null, idea has no thread yet.
    thread: { type: [ThreadEntrySchema], default: null },
    syncSent: { type: Boolean, default: false },
}, { 
    timestamps: { 
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    } 
});

module.exports = mongoose.model('Idea', IdeaSchema);
