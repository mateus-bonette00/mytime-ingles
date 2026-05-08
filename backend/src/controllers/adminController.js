import User from '../models/User.js';
import Purchase from '../models/Purchase.js';
import Progress from '../models/Progress.js';
import Phrase from '../models/Phrase.js';
import Module from '../models/Module.js';
import pool from '../config/database.js';
import securityLogger from '../services/securityLogger.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [totalStudents, salesStats, progressStats] = await Promise.all([
      User.countByRole('student').catch(() => 0),
      Purchase.getStats().catch(() => ({ total_revenue: 0, approved_count: 0 })),
      Progress.getGlobalStats().catch(() => ({ avg_completion: 0 })),
    ]);

    res.json({
      totalStudents,
      sales: salesStats,
      progress: progressStats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await User.findAllStudents();
    res.json({ students });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = parseInt(id);
    if (Number.isNaN(studentId)) {
      return res.status(400).json({ error: 'ID de aluno invalido' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Aluno nao encontrado' });
    }

    const updates = {};
    if (typeof req.body.name === 'string') {
      const trimmedName = req.body.name.trim();
      if (!trimmedName) {
        return res.status(400).json({ error: 'Nome nao pode ficar vazio' });
      }
      updates.name = trimmedName;
    }

    if (typeof req.body.email === 'string') {
      const trimmedEmail = req.body.email.trim();
      if (!trimmedEmail) {
        return res.status(400).json({ error: 'Email nao pode ficar vazio' });
      }
      updates.email = trimmedEmail;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo valido para atualizar' });
    }

    const updatedStudent = await User.update(studentId, updates);
    if (!updatedStudent) {
      return res.status(404).json({ error: 'Aluno nao encontrado' });
    }

    securityLogger.logAdminAction(
      req.user.id,
      req.user.email,
      'UPDATE_STUDENT',
      `${studentId}: ${student.email} -> ${updatedStudent.email}`
    );

    res.json({ message: 'Aluno atualizado com sucesso', student: updatedStudent });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }
    res.status(500).json({ error: 'Erro ao atualizar aluno' });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = parseInt(id);
    if (Number.isNaN(studentId)) {
      return res.status(400).json({ error: 'ID de aluno invalido' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Aluno nao encontrado' });
    }

    const deletedStudent = await User.delete(studentId);
    if (!deletedStudent) {
      return res.status(404).json({ error: 'Aluno nao encontrado' });
    }

    securityLogger.logAdminAction(req.user.id, req.user.email, 'DELETE_STUDENT', `${studentId}: ${student.email}`);
    res.json({ message: 'Aluno excluido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir aluno' });
  }
};

export const getAllPurchases = async (req, res) => {
  try {
    const { status, startDate, endDate, limit } = req.query;
    const purchases = await Purchase.findAll({
      status,
      startDate,
      endDate,
      limit: limit ? parseInt(limit) : undefined,
    });
    res.json({ purchases });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSalesByDay = async (req, res) => {
  try {
    const { days } = req.query;
    const sales = await Purchase.getSalesByDay(days ? parseInt(days) : 30);
    res.json({ sales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPhrase = async (req, res) => {
  try {
    const phrase = await Phrase.create(req.body);
    res.status(201).json({ message: 'Frase criada com sucesso', phrase });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePhrase = async (req, res) => {
  try {
    const { phraseNumber } = req.params;
    const phrase = await Phrase.update(parseInt(phraseNumber), req.body);
    res.json({ message: 'Frase atualizada', phrase });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePhrase = async (req, res) => {
  try {
    const { phraseNumber } = req.params;
    await Phrase.delete(parseInt(phraseNumber));
    res.json({ message: 'Frase deletada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createBulkPhrases = async (req, res) => {
  try {
    const { phrases } = req.body;
    const created = await Phrase.createBulk(phrases);
    res.status(201).json({ message: `${created.length} frases criadas/atualizadas`, phrases: created });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const reorderPhrases = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Array de items e obrigatorio' });
    }
    await Phrase.reorder(items);
    res.json({ message: 'Frases reordenadas' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllPhrases = async (req, res) => {
  try {
    const phrases = await Phrase.findAll();
    res.json({ phrases });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha sao obrigatorios' });
    }

    // Validate role - only allow 'student' or 'admin'
    const validRoles = ['student', 'admin'];
    const userRole = validRoles.includes(role) ? role : 'student';

    const user = await User.create({ name, email, password, role: userRole });

    // Criar compra gratuita com status approved para liberar acesso (apenas para alunos)
    if (userRole === 'student') {
      await pool.query(
        `INSERT INTO purchases (user_id, name, email, amount, payment_method, payment_status, mercadopago_id)
         VALUES ($1, $2, $3, 0, 'free', 'approved', $4)`,
        [user.id, name, email, `free_${Date.now()}`]
      );
    }

    securityLogger.logAdminAction(req.user.id, req.user.email, 'CREATE_USER', `${userRole}: ${email}`);

    const roleLabel = userRole === 'admin' ? 'Admin' : 'Aluno';
    res.status(201).json({ message: `${roleLabel} criado com sucesso`, user });
  } catch (error) {
    if (error.message === 'E-mail já cadastrado') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao criar usuario' });
  }
};

export const uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    const { phraseNumber } = req.params;
    const variant = req.query.variant === 'b' ? 'b' : '';
    const audio_url = `/audios/${req.file.filename}`;

    // Remover arquivo antigo com extensao diferente (ex: tinha .mp3, agora subiu .wav)
    const { default: fs } = await import('fs');
    const { default: path } = await import('path');
    const { fileURLToPath } = await import('url');
    const __fn = fileURLToPath(import.meta.url);
    const __dn = path.dirname(__fn);
    const audiosDir = path.join(__dn, '../../audios');
    const newFilename = req.file.filename;

    try {
      const files = fs.readdirSync(audiosDir);
      const prefix = `${phraseNumber}${variant}.`;
      files.filter(f => f.startsWith(prefix) && f !== newFilename)
        .forEach(f => {
          try { fs.unlinkSync(path.join(audiosDir, f)); } catch {}
        });
    } catch {}

    if (!variant) {
      await Phrase.update(parseInt(phraseNumber), { audio_url });
    }

    res.json({ message: 'Audio enviado com sucesso', audio_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAudio = async (req, res) => {
  try {
    const { phraseNumber } = req.params;
    const { default: fs } = await import('fs');
    const { default: path } = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const audiosDir = path.join(__dirname, '../../audios');

    // Buscar frase para saber o audio_url
    const phrase = await Phrase.findByNumber(parseInt(phraseNumber));
    if (phrase?.audio_url) {
      const filename = path.basename(phrase.audio_url);
      const filePath = path.join(audiosDir, filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    // Tambem tentar remover variante b
    const files = fs.readdirSync(audiosDir);
    files.filter(f => f.startsWith(`${phraseNumber}b.`) || f.startsWith(`${phraseNumber}.`))
      .forEach(f => {
        try { fs.unlinkSync(path.join(audiosDir, f)); } catch {}
      });

    await pool.query("UPDATE phrases SET audio_url = '' WHERE phrase_number = $1", [parseInt(phraseNumber)]);
    res.json({ message: 'Audio removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAllAudios = async (req, res) => {
  try {
    const { default: fs } = await import('fs');
    const { default: path } = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const audiosDir = path.join(__dirname, '../../audios');

    if (fs.existsSync(audiosDir)) {
      const files = fs.readdirSync(audiosDir);
      files.forEach(f => {
        try { fs.unlinkSync(path.join(audiosDir, f)); } catch {}
      });
    }

    // Limpar audio_url de todas as frases
    await pool.query("UPDATE phrases SET audio_url = ''");
    res.json({ message: 'Todos os audios removidos' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== MODULES ==========
export const getModules = async (req, res) => {
  try {
    const modules = await Module.findAllWithStats();
    res.json({ modules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createModule = async (req, res) => {
  try {
    const { name, sort_order } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome do modulo e obrigatorio' });
    const mod = await Module.create({ name, sort_order });
    res.status(201).json({ message: 'Modulo criado', module: mod });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const mod = await Module.update(parseInt(id), req.body);
    if (!mod) return res.status(404).json({ error: 'Modulo nao encontrado' });
    res.json({ message: 'Modulo atualizado', module: mod });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Module.delete(parseInt(id));
    if (!result) return res.status(404).json({ error: 'Modulo nao encontrado' });
    res.json({ message: 'Modulo deletado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadModuleImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    const { id } = req.params;
    const image_url = `/uploads/modules/${req.file.filename}`;
    await Module.update(parseInt(id), { image_url });
    res.json({ message: 'Imagem enviada', image_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getDashboardStats,
  getAllStudents,
  updateStudent,
  deleteStudent,
  getAllPurchases,
  getSalesByDay,
  getAllPhrases,
  createPhrase,
  updatePhrase,
  deletePhrase,
  reorderPhrases,
  createBulkPhrases,
  uploadAudio,
  deleteAudio,
  deleteAllAudios,
  createStudent,
  getModules,
  createModule,
  updateModule,
  deleteModule,
  uploadModuleImage,
};
