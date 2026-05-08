/**
 * Script para testar o fluxo completo de pagamento
 * Simula um pagamento aprovado e testa o envio de email
 */

import 'dotenv/config';
import pg from 'pg';
import emailService from './src/services/emailService.js';
import SignupToken from './src/models/SignupToken.js';

const { Pool } = pg;

// Criar conexão com o banco
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function testPaymentFlow() {
  try {
    console.log('🧪 Iniciando teste do fluxo de pagamento...\n');

    // 1. Verificar conexão com banco
    console.log('1️⃣ Verificando conexão com banco...');
    await pool.query('SELECT NOW()');
    console.log('   ✅ Conectado ao PostgreSQL\n');

    // 2. Buscar última compra criada
    console.log('2️⃣ Buscando última compra...');
    const purchaseResult = await pool.query(
      'SELECT * FROM purchases ORDER BY created_at DESC LIMIT 1'
    );

    if (purchaseResult.rows.length === 0) {
      console.log('   ❌ Nenhuma compra encontrada no banco de dados');
      console.log('   💡 Dica: Faça uma compra pelo site primeiro\n');
      process.exit(1);
    }

    const purchase = purchaseResult.rows[0];
    console.log('   ✅ Compra encontrada:');
    console.log(`      ID: ${purchase.id}`);
    console.log(`      Nome: ${purchase.name}`);
    console.log(`      Email: ${purchase.email}`);
    console.log(`      Status: ${purchase.payment_status}`);
    console.log(`      Valor: R$ ${purchase.amount}\n`);

    // 3. Atualizar status para aprovado (simular webhook)
    console.log('3️⃣ Simulando aprovação do pagamento...');
    await pool.query(
      'UPDATE purchases SET payment_status = $1, payment_method = $2 WHERE id = $3',
      ['approved', 'credit_card', purchase.id]
    );
    console.log('   ✅ Status atualizado para: approved\n');

    // 4. Criar token de cadastro
    console.log('4️⃣ Criando token de cadastro...');
    const token = await SignupToken.create({
      email: purchase.email,
      name: purchase.name,
      purchase_id: purchase.id,
      expiresInHours: 48,
    });
    console.log('   ✅ Token criado:');
    console.log(`      Token: ${token.token}`);
    console.log(`      Válido até: ${token.expires_at}\n`);

    // 5. Verificar configuração de email
    console.log('5️⃣ Verificando configuração de email...');
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER}`);
    console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST}`);

    if (process.env.EMAIL_USER === 'seu_email@gmail.com') {
      console.log('   ⚠️  ATENÇÃO: Email ainda não configurado!');
      console.log('   📝 Configure EMAIL_USER e EMAIL_PASSWORD no arquivo .env\n');

      console.log('📋 Link de cadastro gerado:');
      console.log(`   ${process.env.FRONTEND_URL}/cadastro?token=${token.token}\n`);

      console.log('💡 Para testar o cadastro:');
      console.log('   1. Copie o link acima');
      console.log('   2. Abra no navegador');
      console.log('   3. Crie sua senha e faça login\n');

      process.exit(0);
    }

    // 6. Enviar email
    console.log('6️⃣ Enviando email de boas-vindas...');
    try {
      await emailService.sendWelcomeEmail({
        name: purchase.name,
        email: purchase.email,
        token: token.token,
      });
      console.log('   ✅ Email enviado com sucesso!\n');

      console.log('🎉 TESTE COMPLETO!');
      console.log(`   Verifique o email: ${purchase.email}\n`);
    } catch (emailError) {
      console.log('   ❌ Erro ao enviar email:', emailError.message);
      console.log('\n📋 Link de cadastro (use este link para testar):');
      console.log(`   ${process.env.FRONTEND_URL}/cadastro?token=${token.token}\n`);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Executar teste
testPaymentFlow();
