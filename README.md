 # Integração ERP VENDAS (Syma Solutions) → Shopify 🚀

**Projeto da Syma Solutions para sincronização entre o ERP VENDAS e lojas Shopify.**

## 📋 Visão Geral

Este projeto implementa um serviço **Node.js** que sincroniza dados entre o ERP **VENDAS** (Syma Solutions) e a loja **Shopify**. O objetivo é manter o ERP como fonte da verdade, garantindo que a vitrine reflita os dados mais recentes.

**Principais responsabilidades:**
*   Criação e atualização de clientes (`cad_clie`)
*   Sincronização de catálogo de produtos (`cad_prod`)
*   Fluxos de pedidos (`integracao-pedido`) e orçamentos (`cad_orca`)
*   Gerenciamento de tokens de autenticação para chamadas da API Shopify
*   Registro detalhado de eventos de integração

---

## ✅ Funcionalidades Principais

*   **Sincronização**: VENDAS → Shopify (e vice-versa quando aplicável).
*   **Tipos Seguros**: Interfaces TypeScript em `src/interfaces/`.
*   **Robustez**: Tratamento de erros e logs estruturados (`logs-integracao.ts`).
*   **Renovação de Tokens**: Lógica centralizada em `tokens-integration.ts`.
*   **Configuração**: Totalmente via variáveis de ambiente.

---

## ⚙️ Regras de Negócio e Observações

### 📦 Produtos
*   O projeto envia um produto com sua respectiva variante, ou seja, **uma variante para cada produto enviado**.
*   Os SQLs dos produtos estão contidos no arquivo: `src/erp-data-acess/produto-repository.ts`.
*   > **Preços e saldo de estoque são enviados automaticamente.**
*   **Preços:** É verificado a data de ultimo envio dos preços da para obter os preços alterados após esta data em questão.
*   **Estoque** É verificado o ultimo saldo enviado e comparado com o saldo real do sistema, nos seus respectivos setores.   
    > **Atualização automatica de produto:**`Ocorre automaticamente de acordo com a data de ultimo envio, campo: ultimo_envio_produto, consulta os produtos do sistema que foram atualizados após esta data.`
      

### 📍 Locais (Estoques e Setores)
Os locais referem-se aos setores do sistema. Este projeto envia o saldo real do estoque dos produtos alocados nos setores conforme as regras abaixo:

| Local Shopify | ID | Regra de Setores no Sistema | Particularidade SQL |
| :--- | :---: | :--- | :--- |
| **LOJA** | 1 | Todos os setores da filial 2 com `EST_ATUAL = 'X'` | Exceto setores: 469, 471, 475 |
| **ESTOQUE SC** | 2 | Setores 469 e 471 da filial 2 com `EST_ATUAL = 'X'` | Apenas setores: 469, 471 |

> **Trecho SQL Base:** `.empresas_setor S on PS.SETOR = S.SETOR and S.FILIAL = 2 where S.EST_ATUAL = 'X'`

### 🛒 Pedidos
*   **Busca**: Realiza a busca dos pedidos a partir da data informada no service responsável. (Ex: Ao informar `2025-12-18`, serão consultados pedidos criados desta data em diante).
*   **Cliente do Pedido**: Ao consultar os pedidos, o cliente passa pela função `cad_clie_mapper`, onde os campos Shopify X ERP são mapeados.
*   **Validação**: Antes do cadastro, verifica-se se o CPF/CNPJ já existe no ERP para realizar a atualização em vez de um novo registro.
*   **Itens**:  Registra os itens do pedido com base no id da variante existente na tabela de variantes (enviado previamente pela aplicação). A tabela em questão contem o erp_sku ( CODIGO do erp ), onde é usado para obter o custo do produto. 
*   **Atualização do pedido na shopify** : Após o pedido ser faturado no sistema, é feito a atualização dos metafields (numero nfe, chave nfe ) com os dados do faturamento, junto a mesma mutation é enviado as tags ( 'Pedido faturado' e 'NFE N° numero_da_nota'), após a atualização na shopify é feito a atualização do status_atendimento 'FULFILLED' na tabela de pedidos.
*   **Para que o pedido seja atualizado na Shopify é necessario que o mesmo seja faturado no ERP e seu status_atendimento 'UNFULFILLED' na tabela de pedidos.**  
 >  SQL da função em questão contido na classe PedidoRepository, localizado em src/erp-data-acess/pedido-repositor.ts, função [ pedidosFaturados]
---

## 🏗️ Arquitetura

```text
src/
├─ interfaces/               # Interfaces TypeScript para modelos de dados
├─ services/                 # Lógica de negócio (sincronização, token)
├─ jobs/                     # Jobs de sincronização agendados
├─ erp-data-access/          # Acesso a dados do ERP
├─ integration-data-access/  # Acesso a dados da integração
├─ utils/                    # Funções auxiliares (HTTP, validadores)
├─ mapper/                   # Mapeamento e transformação de dados
├─ views/                    # Arquivos de visualização
├─ server.ts                 # Ponto de entrada da aplicação
└─ routes.ts                 # Definição de rotas

banco de dados  
 tabelas
├─ configuracoes           # Tabela  de configurações do projeto.                   
├─ fotos_produtos          # Armazena as fotos enviadas para shopify.
├─ locais                  # Locais registrados na shopify, usados nos envios de saldo dos produtos. 
├─ pedidos                 # pedidos recebidos da shopify.
├─ produtos                # produtos enviados.
├─ sync_logs               # logs da aplicação. 
├─ variantes               # variantes enviadas para shopify.
├─ variantes_locais        # tabela pivo, onde ficam as informações referente ao estoque de cada item enviado.
                              Ex: variante: 1 X local: 1 

 


## Configuração
1. **Pré-requisitos**
   - Node.js >= 18
   - npm (ou yarn)
   - Acesso ao banco de dadods do ERP e credenciais privadas/app da Shopify
2. **Clonar o repositório**
   ```bash
   git clone <repo-url>
   cd integracao-shopify-node
   ```
3. **Instalar dependências**
   ```bash
   npm install
   ```
4. **Configurar ambiente** – copie `.env.example` para `.env` e preencha:
   ```text
   SHOPIFY_API_KEY=seu_key
   SHOPIFY_PASSWORD=sua_senha
   SHOPIFY_STORE=meuloja.myshopify.com
   ERP_BASE_URL=https://erp.exemplo.com/api
   ``` 
5. **Executar o serviço**
   ```bash
   npm run build # gera o build 
   npm start # inicia o projeto em produção;
   ```
6. **Executar o serviço em ambiente de  desenvolvimento**
   npm run dev   # inicia o servidor de desenvolvimento

## Uso
- O serviço inicia um job em background que periodicamente busca alterações no ERP e as envia para a Shopify.
- Os logs são gravados em `logs/` e seguem a interface `logs_integracao` para fácil análise.

## Manutenção
- **Adicionar novos modelos de dados**: crie uma nova interface em `src/interfaces/` e referencie-a no serviço correspondente.
- **Atualizar lógica de sincronização**: modifique o arquivo de serviço em `src/services/`. Garanta que os contratos de interface sejam respeitados.
- **Monitoramento**: verifique os arquivos de log ou integre com ferramenta de agregação de logs (ex.: ELK, Datadog) usando o formato de log estruturado.
- **Versionamento**: aumente a versão em `package.json` após qualquer mudança quebradeira e atualize o changelog.

## Contribuindo
1. Fork o repositório.
2. Crie uma branch de feature (`git checkout -b feat/sua-feature`).
3. Escreva testes e assegure que os testes existentes passem (`npm test`).
4. Submeta um Pull Request com descrição clara das mudanças.

 
*Gerado em 2025‑12‑15*
