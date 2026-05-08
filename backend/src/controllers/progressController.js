import Progress from '../models/Progress.js';
import Phrase from '../models/Phrase.js';
import Module from '../models/Module.js';

export const getUserProgress = async (req, res) => {
  try {
    const stats = await Progress.getUserStats(req.user.id);
    const progress = await Progress.getUserProgress(req.user.id);
    res.json({ stats, progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markPhraseCompleted = async (req, res) => {
  try {
    const { phraseNumber } = req.params;
    const updated = await Progress.markAsCompleted(req.user.id, parseInt(phraseNumber));
    res.json({ message: 'Frase marcada como concluída', progress: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markPhraseIncomplete = async (req, res) => {
  try {
    const { phraseNumber } = req.params;
    const updated = await Progress.markAsIncomplete(req.user.id, parseInt(phraseNumber));
    res.json({ message: 'Frase marcada como não concluída', progress: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPhrasesWithProgress = async (req, res) => {
  try {
    const phrases = await Phrase.findAllWithUserProgress(req.user.id);
    res.json({ phrases });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPhraseByNumber = async (req, res) => {
  try {
    const { phraseNumber } = req.params;
    const phrase = await Phrase.findByNumberWithUserProgress(parseInt(phraseNumber), req.user.id);

    if (!phrase) {
      return res.status(404).json({ error: 'Frase não encontrada' });
    }

    res.json({ phrase });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getModulesWithProgress = async (req, res) => {
  try {
    const modules = await Module.findAllWithUserProgress(req.user.id);
    res.json({ modules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getUserProgress,
  markPhraseCompleted,
  markPhraseIncomplete,
  getPhrasesWithProgress,
  getPhraseByNumber,
  getModulesWithProgress,
};
