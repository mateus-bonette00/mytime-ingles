#!/bin/bash

# ================================================
# SCRIPT DE DEPLOY - Teacher Ediane
# ================================================
# Como usar: abra o terminal na pasta do projeto
# e rode: ./deploy.sh
# ================================================

SERVIDOR="root@167.71.90.3"
PROJETO_LOCAL="/home/mateus/Documentos/Projetos/mytime-ingles/"
PROJETO_REMOTO="/var/www/mytime-ingles/"

echo ""
echo "========================================"
echo "   DEPLOY - teacherediane.com.br"
echo "========================================"
echo ""
echo "O que voce alterou?"
echo ""
echo "  1) So o FRONTEND (paginas, CSS, React)"
echo "  2) So o BACKEND (rotas, logica, banco)"
echo "  3) OS DOIS (frontend e backend)"
echo ""
read -p "Digite 1, 2 ou 3: " OPCAO

echo ""
echo "Enviando arquivos para o servidor..."
rsync -avz --exclude 'node_modules' --exclude '.env' --exclude '.git' --exclude 'backend/audios/*.wav' --exclude 'backend/audios/*.mp3' --exclude 'backend/audios/*.m4a' --exclude 'backend/audios/*.aac' --exclude 'backend/audios/*.ogg' --exclude 'backend/audios/*.webm' --exclude 'backend/audios/*.flac' --exclude 'uploads/' "$PROJETO_LOCAL" "$SERVIDOR:$PROJETO_REMOTO"

if [ $? -ne 0 ]; then
  echo ""
  echo "ERRO ao enviar arquivos. Verifique sua conexao."
  exit 1
fi

echo ""
echo "Arquivos enviados! Atualizando no servidor..."
echo ""

RUN_MIGRATIONS="for f in $PROJETO_REMOTO/database/migrations/*.sql; do echo \"Rodando migration: \$f\"; sudo -u postgres psql -d mytime_ingles -f \"\$f\"; done"

if [ "$OPCAO" = "1" ]; then
  ssh "$SERVIDOR" "cd $PROJETO_REMOTO/frontend && npm install && npm run build && echo 'FRONTEND ATUALIZADO COM SUCESSO!'"

elif [ "$OPCAO" = "2" ]; then
  ssh "$SERVIDOR" "$RUN_MIGRATIONS && cd $PROJETO_REMOTO/backend && npm install && pm2 restart mytime-backend && echo 'BACKEND ATUALIZADO COM SUCESSO!'"

elif [ "$OPCAO" = "3" ]; then
  ssh "$SERVIDOR" "$RUN_MIGRATIONS && cd $PROJETO_REMOTO/backend && npm install && pm2 restart mytime-backend && cd $PROJETO_REMOTO/frontend && npm install && npm run build && echo 'FRONTEND E BACKEND ATUALIZADOS COM SUCESSO!'"

else
  echo "Opcao invalida. Digite 1, 2 ou 3."
  exit 1
fi

echo ""
echo "========================================"
echo "   DEPLOY CONCLUIDO!"
echo "   Site: https://teacherediane.com.br"
echo "========================================"
echo ""
