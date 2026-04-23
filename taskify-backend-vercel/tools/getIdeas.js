const Idea = require('../models/idea');

/**
 * Fetch all ideas for the user.
 * @param {string} userId - The user ID to fetch ideas for.
 */
async function getIdeas(userId) {
  try {
    const ideas = await Idea.find({ userId }).sort({ created_at: -1 });

    return {
      message: 'Ideas fetched successfully',
      ideas: ideas.map(idea => ({
        id: idea._id,
        title: idea.title,
        description: idea.description,
        created_at: idea.created_at
      }))
    };
  } catch (error) {
    console.error('Error in getIdeas tool:', error);
    return { error: error.message };
  }
}

const getIdeasDefinition = {
  type: 'function',
  function: {
    name: 'getIdeas',
    description: 'Fetch all ideas for the authenticated user.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  }
};

module.exports = {
  getIdeas,
  getIdeasDefinition
};
