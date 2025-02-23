const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Create compound indexes for efficient querying
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1, chat: 1 });

// Update the last message reference in the chat
messageSchema.post('save', async function() {
    try {
        await this.model('Chat').findByIdAndUpdate(
            this.chat,
            { lastMessage: this._id }
        );
    } catch (error) {
        console.error('Error updating chat lastMessage:', error);
    }
});

module.exports = mongoose.model('Message', messageSchema); 