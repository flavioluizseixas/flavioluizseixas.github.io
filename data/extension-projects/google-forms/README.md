# Google Forms dos projetos de extensão

Pacote preparado para criar um formulário por projeto em **Meu Drive → extension-projects → google-forms**, na mesma ordem do catálogo. Os arquivos locais ainda não representam formulários criados na conta Google.

O cabeçalho de cada formulário recebe o nome completo do projeto. A descrição inclui o resumo, a dedicação semanal e um link para a página do projeto.

| Ordem | Projeto                                                                           |
| ----- | --------------------------------------------------------------------------------- |
| 1     | Liberação da Ventilação Mecânica: trajetórias com Machine Learning                |
| 2     | Trajetórias funcionais e predição da capacidade de deambulação na alta da UTI     |
| 3     | Assinaturas biológicas em doenças orais: predição do risco cardiovascular         |
| 4     | ACEnf — Aplicativo para Auditoria Clínica de Enfermagem                           |
| 5     | Sistema para Qualificação de Denúncias na Fiscalização Profissional de Enfermagem |
| 6     | Tecnologia Digital de Apoio à Auditoria em Saúde Suplementar                      |
| 7     | Sistema de Acompanhamento de Egressos                                             |

## Campos de cada formulário

Todos os campos devem ser obrigatórios e aparecer nesta ordem:

| Título exato                                 | Tipo              | Configuração                                  |
| -------------------------------------------- | ----------------- | --------------------------------------------- |
| Nome completo                                | Resposta curta    | Obrigatória                                   |
| E-mail                                       | Resposta curta    | Obrigatória, com validação de e-mail          |
| Histórico escolar da UFF                     | Upload de arquivo | Obrigatória; apenas PDF; 1 arquivo; até 10 MB |
| O que despertou seu interesse nesse projeto? | Parágrafo         | Obrigatória                                   |

No campo de histórico, use a descrição: **Anexe seu histórico escolar da UFF, gerado pelo IdUFF, em PDF.**

O e-mail pode ser qualquer endereço válido para contato. Para enviar o histórico, o estudante precisa entrar em uma conta Google, conforme a [regra de upload do Google Forms](https://support.google.com/docs/answer/7322334?hl=pt-BR). Os arquivos de upload ficam nas pastas criadas pelo próprio Forms no Drive do proprietário; o script organiza os formulários, sem mover históricos ou respostas existentes.

## Criar os formulários na conta institucional

1. Entre na conta Google que será responsável pelas inscrições. Abra [Google Apps Script](https://script.google.com/) e crie um projeto independente chamado **Formulários — Projetos de extensão**.
2. Copie [Code.gs](Code.gs) para o arquivo `Código.gs` do editor. Adicione um arquivo de script chamado `Config` e copie [Config.gs](Config.gs).
3. Em **Configurações do projeto**, habilite a exibição do manifesto `appsscript.json`. Substitua seu conteúdo por [appsscript.json](appsscript.json).
4. Execute **`prepararModelo`** pelo editor e autorize os acessos a Forms e Drive. Essa função cria a pasta solicitada e um modelo com nome, e-mail e interesse. Abra a URL **Modelo** exibida no registro de execução.
5. No modelo, adicione **Upload de arquivo** com o título **Histórico escolar da UFF**. Marque **Obrigatória**, permita apenas **PDF**, configure **1 arquivo**, **10 MB** e arraste a pergunta para a terceira posição. Mantenha o modelo sem publicar.
6. Execute **`criarFormularios`**. A função copia o modelo para os sete projetos, personaliza os cabeçalhos e grava `links-formularios.json` na pasta do Drive. As URLs de edição e resposta também aparecem no registro de execução.
7. Abra cada cópia, confira o upload e publique pelo botão **Publicar** do Google Forms, definindo quem poderá responder. Faça um envio de teste com dados seus antes de divulgar o link de resposta.

Não é necessário implantar um aplicativo web nem alterar a integração de inscrições já existente no site. Os formulários criados ficam como rascunhos até serem publicados no editor. Os links de resposta só devem ser divulgados depois da publicação.

A etapa manual de upload é necessária porque a [API do Google Forms não permite criar esse tipo de pergunta](https://developers.google.com/workspace/forms/api/reference/rest/v1/forms#FileUploadQuestion). A automação verifica a presença, o título e a posição do campo, mas o serviço FormApp não expõe a configuração de obrigatoriedade, tipo, quantidade ou tamanho do upload; confira esses ajustes no modelo e nas cópias. Formulários com upload devem ficar em **Meu Drive**, pois esse recurso não funciona em drives compartilhados.

## Reexecutar ou atualizar

Execute novamente `criarFormularios` no **mesmo projeto Apps Script** para obter os links ou concluir uma execução interrompida. Os IDs ficam nas propriedades do script. Formulários já preparados são reaproveitados, sem apagar respostas, alterar perguntas ou despublicá-los. Edições posteriores no modelo não são aplicadas automaticamente aos formulários existentes.

Para atualizar os dados locais dos projetos:

```powershell
npm run prepare:google-forms
```

Copie novamente o `Config.gs` gerado para o editor do Google. O comando local só prepara a configuração; não acessa sua conta nem cria arquivos remotos. Para verificar se a configuração está atualizada:

```powershell
npm run prepare:google-forms -- --check
```

## Usar os links no site

Após publicar e conferir os formulários, o campo `link_inscricao` de cada Markdown em `data/extension-projects/` pode receber a URL de resposta correspondente. Use a URL retornada em `responseUrl`, nunca a URL de edição. O site já reconhece esse campo para direcionar a inscrição ao formulário externo.
