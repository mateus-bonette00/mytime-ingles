import bcrypt from 'bcrypt';
import pool from '../src/config/database.js';

async function createAdmin() {
  try {
    // Gerar hash da senha "admin123"
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    console.log('🔐 Hash gerado:', passwordHash);

    // Verificar se admin já existe
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@mytimeingles.com']
    );

    if (checkResult.rows.length > 0) {
      // Atualizar senha do admin existente
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2',
        [passwordHash, 'admin@mytimeingles.com']
      );
      console.log('✅ Senha do admin atualizada!');
    } else {
      // Criar novo admin
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)`,
        ['Administrador', 'admin@mytimeingles.com', passwordHash, 'admin']
      );
      console.log('✅ Admin criado com sucesso!');
    }

    console.log('');
    console.log('📋 Credenciais:');
    console.log('   Email: admin@mytimeingles.com');
    console.log('   Senha: admin123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

createAdmin();
