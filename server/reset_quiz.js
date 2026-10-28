import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Question from './models/Question.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cxoconnect';

async function resetQuiz() {
  try {
    console.log('[Reset Quiz] Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('[Reset Quiz] Resetting Question collection...');
    await Question.deleteMany({});

    const questions = [
      {
        questionText: 'When facing unexpected macroeconomic volatility or supply disruptions, your primary executive focus is:',
        category: 'Strategic Leadership',
        options: [
          { text: 'Pivot business model rapidly towards high-margin digital streams', trait: 'Agile Disruptor', points: 20 },
          { text: 'Reinforce cash reserves, freeze discretionary opex, and optimize supply chain', trait: 'Operational Maestro', points: 15 },
          { text: 'Communicate transparently with all stakeholders and protect talent morale', trait: 'Empathetic Leader', points: 15 },
          { text: 'Seek M&A opportunities and distressed asset acquisitions', trait: 'Visionary Strategist', points: 20 }
        ],
        order: 1
      },
      {
        questionText: 'In evaluating AI enterprise transformation across your business units, you prioritize:',
        category: 'Technology & Innovation',
        options: [
          { text: 'Radical redesign of customer-facing touchpoints with generative agents', trait: 'Visionary Strategist', points: 20 },
          { text: 'Robust governance, enterprise data security, and compliance rails', trait: 'Operational Maestro', points: 15 },
          { text: 'Continuous upskilling programs ensuring seamless employee adoption', trait: 'Empathetic Leader', points: 15 },
          { text: 'Fast, scrappy internal POCs to outpace competitors within 90 days', trait: 'Agile Disruptor', points: 20 }
        ],
        order: 2
      },
      {
        questionText: 'Your board of directors demands a 35% growth acceleration while maintaining EBITDA margins. You:',
        category: 'Corporate Governance',
        options: [
          { text: 'Champion cross-border expansion and strategic joint ventures', trait: 'Visionary Strategist', points: 20 },
          { text: 'Automate manual operational workflows and negotiate supplier contracts', trait: 'Operational Maestro', points: 15 },
          { text: 'Incentivize top sales and product leaders through high-impact equity grants', trait: 'Empathetic Leader', points: 15 },
          { text: 'Launch a new direct-to-enterprise SaaS division targeting untapped verticals', trait: 'Agile Disruptor', points: 20 }
        ],
        order: 3
      },
      {
        questionText: 'When high-performing C-suite peers disagree fundamentally on corporate strategy, you:',
        category: 'Executive Alignment',
        options: [
          { text: 'Convene an offsite workshop to synthesize shared long-term objectives', trait: 'Empathetic Leader', points: 20 },
          { text: 'Present audited data, financial simulations, and unit economics to decide', trait: 'Operational Maestro', points: 15 },
          { text: 'Break the tie definitively using your conviction and executive mandate', trait: 'Visionary Strategist', points: 20 },
          { text: 'Run parallel small-scale experiments to let market validation decide', trait: 'Agile Disruptor', points: 20 }
        ],
        order: 4
      }
    ];

    await Question.insertMany(questions);
    console.log('[Reset Quiz] Successfully seeded 4 executive assessment questions.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Reset Quiz Error]', error);
    process.exit(1);
  }
}

resetQuiz();
