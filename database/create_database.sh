#!/bin/bash

# Script para criar o banco de dados MyTime Inglês

echo "🎓 Criando banco de dados MyTime Inglês..."
echo ""

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não está instalado!"
    echo "📦 Instale com: sudo apt install postgresql postgresql-contrib"
    exit 1
fi

# Verificar se o serviço está rodando
if ! systemctl is-active --quiet postgresql; then
    echo "⚠️  PostgreSQL não está rodando. Iniciando..."
    sudo systemctl start postgresql
fi

# Criar banco de dados
echo "📊 Criando banco de dados..."
sudo -u postgres psql -c "CREATE DATABASE mytime_ingles;" 2>/dev/null

# Executar schema
echo "📋 Criando tabelas..."
sudo -u postgres psql -d mytime_ingles -f schema.sql

echo ""
echo "✅ Banco de dados criado com sucesso!"
echo ""
echo "📝 Credenciais padrão:"
echo "   Database: mytime_ingles"
echo "   User: postgres"
echo "   Password: postgres"
echo ""
echo "⚙️  Para conectar: psql -U postgres -d mytime_ingles"
echo ""
