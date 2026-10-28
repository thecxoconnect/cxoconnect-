import Question from '../models/Question.js';

export const getQuestions = async (req, res) => {
  try {
    let questions = await Question.find().sort({ order: 1, createdAt: 1 });

    // Fallback default questions if not seeded yet
    if (!questions || questions.length === 0) {
      questions = [
        {
          _id: 'q1',
          questionText: 'When facing unexpected macroeconomic volatility or supply disruptions, your primary executive focus is:',
          category: 'Strategic Leadership',
          options: [
            { text: 'Pivot business model rapidly towards high-margin digital streams', trait: 'Agile Disruptor', points: 20 },
            { text: 'Reinforce cash reserves, freeze discretionary opex, and optimize supply chain', trait: 'Operational Maestro', points: 15 },
            { text: 'Communicate transparently with all stakeholders and protect talent morale', trait: 'Empathetic Leader', points: 15 },
            { text: 'Seek M&A opportunities and distressed asset acquisitions', trait: 'Visionary Strategist', points: 20 }
          ]
        },
        {
          _id: 'q2',
          questionText: 'In evaluating AI enterprise transformation across your business units, you prioritize:',
          category: 'Technology & Innovation',
          options: [
            { text: 'Radical redesign of customer-facing touchpoints with generative agents', trait: 'Visionary Strategist', points: 20 },
            { text: 'Robust governance, enterprise data security, and compliance rails', trait: 'Operational Maestro', points: 15 },
            { text: 'Continuous upskilling programs ensuring seamless employee adoption', trait: 'Empathetic Leader', points: 15 },
            { text: 'Fast, scrappy internal POCs to outpace competitors within 90 days', trait: 'Agile Disruptor', points: 20 }
          ]
        },
        {
          _id: 'q3',
          questionText: 'Your board of directors demands a 35% growth acceleration while maintaining EBITDA margins. You:',
          category: 'Corporate Governance',
          options: [
            { text: 'Champion cross-border expansion and strategic joint ventures', trait: 'Visionary Strategist', points: 20 },
            { text: 'Automate manual operational workflows and negotiate supplier contracts', trait: 'Operational Maestro', points: 15 },
            { text: 'Incentivize top sales and product leaders through high-impact equity grants', trait: 'Empathetic Leader', points: 15 },
            { text: 'Launch a new direct-to-enterprise SaaS division targeting untapped verticals', trait: 'Agile Disruptor', points: 20 }
          ]
        },
        {
          _id: 'q4',
          questionText: 'When high-performing C-suite peers disagree fundamentally on corporate strategy, you:',
          category: 'Executive Alignment',
          options: [
            { text: 'Convene an offsite workshop to synthesize shared long-term objectives', trait: 'Empathetic Leader', points: 20 },
            { text: 'Present audited data, financial simulations, and unit economics to decide', trait: 'Operational Maestro', points: 15 },
            { text: 'Break the tie definitively using your conviction and executive mandate', trait: 'Visionary Strategist', points: 20 },
            { text: 'Run parallel small-scale experiments to let market validation decide', trait: 'Agile Disruptor', points: 20 }
          ]
        }
      ];
    }

    return res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve assessment questions.',
      error: error.message
    });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // e.g. [{ questionId, selectedTrait, points }]

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide assessment answers.'
      });
    }

    const traitScores = {
      'Visionary Strategist': 0,
      'Agile Disruptor': 0,
      'Operational Maestro': 0,
      'Empathetic Leader': 0
    };

    let totalPoints = 0;

    answers.forEach((ans) => {
      const trait = ans.selectedTrait || ans.trait;
      const pts = Number(ans.points) || 15;
      if (trait && traitScores[trait] !== undefined) {
        traitScores[trait] += pts;
      }
      totalPoints += pts;
    });

    // Determine primary archetype
    let primaryTrait = 'Visionary Strategist';
    let maxScore = -1;
    for (const [trait, score] of Object.entries(traitScores)) {
      if (score > maxScore) {
        maxScore = score;
        primaryTrait = trait;
      }
    }

    const archetypes = {
      'Visionary Strategist': {
        title: 'The Visionary Strategist',
        tagline: 'Long-term enterprise architect with keen foresight and market positioning instinct.',
        strengths: ['Market forecasting & foresight', 'M&A and strategic alliances', 'Ecosystem capitalization'],
        recommendation: 'Join CXO Connect Strategic Roundtables and Global Market Expansion working groups to spar with peer visionaries.'
      },
      'Agile Disruptor': {
        title: 'The Agile Disruptor',
        tagline: 'Velocity-driven innovator who transforms market shifts into competitive advantages.',
        strengths: ['Rapid iteration & execution', 'Digital disruption', 'Challenging legacy paradigms'],
        recommendation: 'Engage in CXO Tech & Disruption masterclasses and seed innovation chapters across our metro networks.'
      },
      'Operational Maestro': {
        title: 'The Operational Maestro',
        tagline: 'Precision-first orchestrator maximizing capital efficiency, EBITDA, and governance.',
        strengths: ['Unit economics & capital efficiency', 'Process automation & scaling', 'Risk mitigation'],
        recommendation: 'Participate in the CXO CFO & COO Council to share benchmark governance metrics.'
      },
      'Empathetic Leader': {
        title: 'The Empathetic Catalyst',
        tagline: 'People-centric leader creating magnetic cultures that attract and retain world-class leaders.',
        strengths: ['Executive talent retention', 'Culture transformation', 'Stakeholder alignment'],
        recommendation: 'Contribute to the CXO Boardroom Talent Advisory and executive mentorship programs.'
      }
    };

    const result = {
      archetype: archetypes[primaryTrait] || archetypes['Visionary Strategist'],
      primaryTrait,
      totalPoints,
      breakdown: traitScores,
      assessmentDate: new Date()
    };

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[submitQuiz Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process assessment.',
      error: error.message
    });
  }
};
