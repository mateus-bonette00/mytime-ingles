# Guia Completo: Compra Aprovada -> Cadastro Seguro (Sem depender de e-mail)

## 1) O que foi implementado

Agora o aluno consegue criar conta logo após o pagamento aprovado, sem precisar esperar e-mail.

Fluxo novo:

1. Aluna preenche checkout com `nome + e-mail + CPF`.
2. Faz o pagamento no Mercado Pago.
3. Volta para `https://teacherediane.com.br/pagamento/sucesso`.
4. Na própria tela de sucesso, informa `e-mail + CPF` da compra e cria a senha.
5. Entra automaticamente na área de aulas.

## 2) Segurança aplicada

1. Só libera cadastro se a compra estiver `approved`.
2. Só libera se `purchase_id + e-mail + CPF` baterem exatamente com a compra.
3. Cada compra só pode criar conta uma vez (`purchase.user_id` é vinculado e bloqueia novo uso).
4. Endpoint protegido por rate limit (`/api/auth/claim-purchase`).
5. Se alguém compartilhar apenas o link da tela de sucesso, sem e-mail+CPF da compra não consegue criar conta.

## 3) Arquivos alterados

1. `backend/src/controllers/authController.js`
2. `backend/src/controllers/paymentController.js`
3. `backend/src/models/Purchase.js`
4. `backend/src/routes/auth.js`
5. `backend/src/server.js`
6. `backend/src/services/mercadoPagoService.js`
7. `backend/src/utils/validators.js`
8. `frontend/src/pages/CheckoutPage.jsx`
9. `frontend/src/pages/PaymentSuccess.jsx`
10. `frontend/src/pages/PaymentPending.jsx`
11. `frontend/src/pages/PaymentFailure.jsx`
12. `frontend/src/pages/PaymentStatus.css`
13. `frontend/src/services/auth.js`

## 4) Como subir em produção (deploy)

No terminal local do projeto:

```bash
cd ~/Documentos/Projetos/mytime-ingles
./deploy.sh
```

Na pergunta do script:

1. Digite `3` se alterou frontend + backend.
2. Aguarde finalizar.

Site final:

- https://teacherediane.com.br/

## 5) Teste completo (sem gastar nada com e-mail)

1. Acesse https://teacherediane.com.br/checkout
2. Preencha nome, e-mail e CPF reais de teste.
3. Conclua o pagamento de teste no Mercado Pago.
4. Ao voltar para `pagamento/sucesso`, preencha:
- mesmo e-mail da compra
- mesmo CPF da compra
- senha + confirmar senha
5. Clique em `CRIAR CONTA E ENTRAR`.
6. Resultado esperado: entrar em `/meus-cursos` automaticamente.

## 6) Teste de bloqueio de compartilhamento

1. Copie a URL da tela de sucesso e abra em outro navegador/dispositivo.
2. Tente cadastrar com e-mail/CPF diferentes.
3. Resultado esperado: erro `Dados da compra não conferem`.
4. Só passa usando os dados exatos da compra aprovada.

## 7) Fluxo antigo por e-mail continua?

Sim. O fluxo de token por e-mail continua no projeto (`/cadastro?token=...`).
Mas agora você não fica dependente do SMTP para liberar o acesso da compra.

