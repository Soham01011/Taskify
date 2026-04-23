const Idea = require('../models/idea');

/**
 * Create a new idea for the user.
 * @param {string} userId - The user ID to create the idea for.
 * @param {string} title - The title of the idea.
 * @param {string} description - A detailed description of the idea.
 */
async function createIdea(userId, title, description) {
  try {
    const ideaData = {
      userId,
      title,
      description,
      created_at: new Date(),
      updated_at: new Date()
    };

    const idea = new Idea(ideaData);
    await idea.save();

    return {
      message: 'Idea created successfully',
      ideaId: idea._id,
      title: idea.title
    };
  } catch (error) {
    console.error('Error in createIdea tool:', error);
    return { error: error.message };
  }
}

const createIdeaDefinition = {
  type: 'function',
  function: {
    name: 'createIdea',
    description: 'Create a new idea for the user.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The title of the idea.' },
        description: { type: 'string', description: 'Detailed description of the idea.' }
      },
      required: ['title', 'description']
    }
  }
};

module.exports = {
  createIdea,
  createIdeaDefinition
};
