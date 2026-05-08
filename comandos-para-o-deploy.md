# Comandos para o Deploy - MyTime Inglês

## 1. Na sua máquina local (terminal do projeto)

```bash
cd ~/Documentos/Projetos/mytime-ingles
./deploy.sh
```
Escolha a **opção 3** (frontend + backend).

---

## 2. No servidor (via SSH)

Primeiro, conecte no servidor:
```bash
ssh root@167.71.90.3
```

Depois, rode a migração do banco de dados:
```bash
sudo -u postgres psql -d mytime_ingles -c "ALTER TABLE phrases ALTER COLUMN audio_url DROP NOT NULL;"
```

Por fim, reinicie o backend:
```bash
pm2 restart mytime-backend
```

---

## Verificação

Acesse no navegador:
- Site: https://teacherediane.com.br
- Admin: https://teacherediane.com.br/admin
