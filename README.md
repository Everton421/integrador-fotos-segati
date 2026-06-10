# Integrador de Fotos — ComprePeças

Serviço em Node.js que integra automaticamente fotos de produtos ao sistema ERP da ComprePeças.

## Visão Geral

O sistema monitora uma pasta com imagens de produtos, vincula cada foto ao produto correspondente no banco de dados ERP (tabela `fotos_prod`) utilizando o código `OUTRO_COD` como chave de correspondência, e remove os registros do banco quando o arquivo é excluído da pasta.

## Funcionalidades

- Leitura da pasta de fotos configurada no ERP (tabela `parametros`, campo `FOTOS`)
- Vinculação automática de fotos a produtos ativos por `OUTRO_COD`
- Inserção incremental na tabela `fotos_prod` (evita duplicatas)
- Verificação periódica de fotos deletadas com remoção automática do banco
- Agendamento via cron (configurável via `CRON_ADD_PHOTO`)
- API REST com Express
- Gerenciamento de processo via PM2

## Fluxo de Funcionamento

1. O servidor Express é iniciado na porta configurada (`PORT_API`)
2. O `JobPhotos` agenda duas tarefas no cron:
   - **Adição de fotos** — `ScriptAddPhoto` busca o caminho da pasta no ERP, então `AddPhotoProduct.add()` varre todos os produtos ativos, faz correspondência pelo `OUTRO_COD` com os arquivos da pasta e insere os registros em `fotos_prod`
   - **Verificação de exclusão** — `ScriptDeletePhotos` lista produtos com foto registrada, e para cada uma verifica se o arquivo ainda existe na pasta; se não existir, remove o registro do banco
3. O cron executa dentro do horário configurado (padrão: a cada 30 min, 6h–20h, seg–sáb)

## Tecnologias

- **Runtime:** Node.js ≥ 18
- **Linguagem:** TypeScript
- **Framework:** Express
- **Banco:** MySQL (mysql2)
- **Agendador:** node-cron
- **Gerenciador de processo:** PM2
- **Dev/execução:** tsx

## Pré-requisitos

- Node.js >= 18
- MySQL
- npm ou yarn

## Configuração

```bash
# 1. Clone o repositório
git clone <repo-url>
cd integrador-fotos-segati

# 2. Instale as dependências
npm install

# 3. Configure o ambiente
cp .env.example .env
# Edite o .env com as credenciais do banco ERP e ajuste o cron se necessário

# 4. Execute em desenvolvimento
npm run dev

# 5. Para produção com PM2
pm2 start ecosystem.config.cjs
```

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `PORT_API` | Porta do servidor HTTP | `8000` |
| `HOST` | Host do banco MySQL | `localhost` |
| `PORT_DB` | Porta do banco MySQL | `3306` |
| `USER` | Usuário do banco | |
| `PASSWORD` | Senha do banco | |
| `DB_ESTOQUE` | Nome do banco de estoque | `estoque` |
| `DB_VENDAS` | Nome do banco de vendas | `vendas` |
| `DB_PUBLICO` | Nome do banco público | `publico` |
| `DB_FINANCEIRO` | Nome do banco financeiro | `financeiro` |
| `CRON_ADD_PHOTO` | Expressão cron para o job | `*/30 6-20 * * 1-6` |

## Nomenclatura dos Arquivos

As imagens devem começar com o `OUTRO_COD` do produto correspondente. Exemplo:

- `COD1234_foto01.jpg`
- `COD1234_foto02.jpg`
- `COD5678_principal.png`

## Estrutura do Projeto

```
src/
├── class/
│   ├── add-photo-product.ts       # Lógica de vinculação de fotos
│   └── check-deleted-photo.ts     # Lógica de verificação de exclusão
├── scripts/
│   ├── add-photo-script.ts        # Orquestrador de adição
│   └── check-deleted-photos-script.ts  # Orquestrador de exclusão
├── job/
│   └── photo-job.ts               # Agendador cron
├── database/
│   └── mysql-connection.ts        # Pool de conexão MySQL
├── server.ts                      # Ponto de entrada da aplicação
└── routes.ts                      # Definição de rotas Express
imgs/                              # Pasta de fotos (exemplo/local)
logs/                              # Logs do PM2
```

## Manutenção

- **Logs:** em produção os logs são capturados pelo PM2 nos arquivos em `logs/`
- **Monitoramento:** acompanhe o console do processo para ver o progresso das tarefas
- **Novos formatos de imagem:** o sistema trabalha com qualquer formato suportado pelo sistema de arquivos; a validação é feita pela presença do arquivo na pasta
- **Ajuste do cron:** altere a variável `CRON_ADD_PHOTO` no `.env` conforme a necessidade de frequência
