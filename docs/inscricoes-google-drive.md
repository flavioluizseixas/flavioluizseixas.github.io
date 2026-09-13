# Inscrições dos projetos no Google Drive institucional

O formulário está na própria página Astro. Ao enviar, ele chama um aplicativo Google Apps Script, que grava no Drive **com a autorização do professor**. O GitHub Pages continua servindo apenas arquivos estáticos. O aluno não precisa entrar no Google nem receber um código.

O endereço precisa terminar em `@id.uff.br`. Essa regra é conferida no navegador e no servidor, mas **não comprova que o aluno é titular do endereço**. O PDF é conferido por extensão, tipo, tamanho, cabeçalho e marcador de fim; a autenticidade do histórico do IdUFF precisa ser avaliada pela equipe. Não há análise antivírus nem autenticação do aluno.

## 1. Prepare a pasta e o aplicativo

1. Entre no [Google Drive](https://drive.google.com/) com a conta institucional **que será responsável pelas inscrições** (`seu_usuario@id.uff.br`).
2. Em **Meu Drive**, crie a pasta `Inscrições dos projetos`. Em **Compartilhar → Acesso geral**, mantenha **Restrito**. Não publique a pasta nem os históricos. Compartilhe nominalmente apenas com responsáveis pela seleção, se necessário.
3. Abra a pasta e copie o identificador que aparece depois de `/folders/` na URL. Esse é o `ROOT_FOLDER_ID`.
4. No repositório, execute:

   ```powershell
   npm run prepare:registrations
   ```

   Isso gera `integrations/google-apps-script/Config.gs` a partir de `data/registration.json`, `data/registration-copy.json`, `data/site.json` e dos projetos em `data/extension-projects/`. Não inclui credenciais.

5. Abra [Google Apps Script](https://script.google.com/) **na mesma conta institucional**, crie um **Novo projeto** e dê o nome `Inscrições — Projetos de extensão`.
6. Copie os arquivos de `integrations/google-apps-script/` para o editor:

   | Arquivo local     | Arquivo no editor Google                                                                                                   |
   | ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
   | `Code.gs`         | Substitua o conteúdo de `Código.gs`/`Code.gs`                                                                              |
   | `Config.gs`       | Adicione um arquivo **Script** chamado `Config`                                                                            |
   | `Bridge.html`     | Adicione um arquivo **HTML** chamado `Bridge`                                                                              |
   | `appsscript.json` | Substitua o manifesto, habilitando **Configurações do projeto → Mostrar o arquivo de manifesto appsscript.json no editor** |

7. Em **Configurações do projeto → Propriedades do script → Adicionar propriedade**, cadastre:

   | Propriedade      | Valor                                      |
   | ---------------- | ------------------------------------------ |
   | `ROOT_FOLDER_ID` | O identificador da pasta criada no passo 3 |

   Salve. Esse identificador fica no Google; não precisa colocá-lo no GitHub.

## 2. Autorize sua conta e prepare as pastas

No editor, selecione a função **`setupRegistrations_`** e clique em **Executar**. Na solicitação de autorização, escolha **Revisar permissões**, confira a conta `@id.uff.br` e autorize os acessos declarados pelo aplicativo que você acabou de criar:

| Permissão                      | Uso                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Google Drive (`drive`)         | Localizar a pasta configurada, criar subpastas e PDFs e mover as planilhas para as pastas dos projetos |
| Google Sheets (`spreadsheets`) | Criar planilhas e registrar as respostas                                                               |

Essas permissões OAuth são amplas na conta do professor; não ficam tecnicamente restritas a uma única pasta. O código direciona as gravações somente para a pasta configurada e seus projetos. O aluno recebe acesso apenas à operação de envio; não recebe tokens, acesso de leitura ao Drive ou permissão de compartilhamento. Não são solicitados acesso ao Gmail, envio de e-mail ou acesso ao Drive do aluno.

Se aparecer um aviso de aplicativo não verificado, confira o nome e a autoria do projeto que você criou. Se a política institucional bloquear a autorização ou a implantação pública, solicite à TI/UFF liberação do Apps Script, dos escopos acima e de um aplicativo web executado pelo proprietário e acessível sem login. Não há configuração no GitHub que supere esse bloqueio. Uma alternativa dependeria de outro servidor aprovado pela instituição.

A execução cria, para cada projeto, esta organização:

```text
Inscrições dos projetos/
  02-2026--acenf/
    Respostas                  ← planilha Google, uma linha por envio
    Históricos/
      EXT-<identificador>.pdf
  02-2026--ventilacao-mecanica-trajetorias-ml/
    Respostas
    Históricos/
  ...
```

Cada resposta registra protocolo, data UTC, projeto, semestre, nome, e-mail informado, texto de interesse, link privado do PDF e a versão do aviso de uso dos dados. Os IDs e hashes ao final da planilha permitem reconhecer uma repetição do mesmo envio.

Executar `setupRegistrations_` novamente reaproveita os recursos cadastrados. Não altere a ordem das colunas, a primeira aba ou as propriedades `PROJECT_*`. Use filtros e visualizações para organizar a seleção. Para outra pasta raiz, crie outro projeto Apps Script; assim o arquivo anterior permanece separado.

## 3. Publique a rotina no Google

1. Clique em **Implantar → Nova implantação**.
2. Na engrenagem, escolha **App da Web / Aplicativo da Web**.
3. Em **Executar como**, selecione **Eu**, conferindo a conta institucional.
4. Em **Quem pode acessar**, selecione **Qualquer pessoa**, a opção que permite acesso **sem login**. A opção restrita à organização ou a usuários conectados não atende a esta integração em iframe sem autenticação.
5. Clique em **Implantar** e copie a URL do aplicativo web, no formato `https://script.google.com/macros/s/IDENTIFICADOR/exec`.

Use a URL terminada em `/exec`, não `/dev`. O endereço é público e pode ficar no repositório. A pasta do Drive deve continuar **Restrita**. Abrir `/exec` sozinho mostra uma orientação para acessar a página do projeto; o formulário monta os parâmetros de conexão automaticamente.

O Apps Script oferece a execução como proprietário e controla o acesso ao aplicativo conforme a implantação e as políticas do domínio. Veja a [documentação oficial de aplicativos web](https://developers.google.com/apps-script/guides/web).

## 4. Teste antes de ativar no site

Em `data/registration.json`, acrescente temporariamente `http://127.0.0.1:4321` a `additionalAllowedOrigins`. Gere novamente `Config.gs`, copie-o para o Google e atualize a implantação: **Implantar → Gerenciar implantações → Editar → Nova versão → Implantar**.

Para exibir o formulário apenas no desenvolvimento local, mantenha `enabled: false` e inicie:

```powershell
$env:PUBLIC_REGISTRATION_WEB_APP_URL = 'https://script.google.com/macros/s/IDENTIFICADOR/exec'
npm run dev -- --host 127.0.0.1
```

Abra `http://127.0.0.1:4321/extensao/projetos/acenf/#inscricao`. Faça uma inscrição de teste com dados seus e um PDF que possa usar nesse teste. Confira:

- O site rejeita um e-mail de outro domínio e arquivos que não sejam PDFs ou tenham mais de 5 MB.
- O envio válido exibe um protocolo; a mesma referência aparece na planilha e no nome do PDF.
- A planilha contém o texto de interesse e o PDF abre pela conta autorizada.
- Ao abrir o link do PDF em janela anônima sem login, seu conteúdo não fica disponível.
- O formulário funciona no celular e em janela anônima. Bloqueadores ou políticas do navegador podem impedir o carregamento do aplicativo Google; nesse caso o site apresenta falha, sem afirmar que recebeu a inscrição.

Depois de parar o servidor local, remova a variável da sessão:

```powershell
Remove-Item Env:PUBLIC_REGISTRATION_WEB_APP_URL
```

O código foi preparado para essa integração, mas **a autorização, a implantação e este teste real dependem da sua conta Google**. Testes automatizados com respostas simuladas não substituem essa conferência.

## 5. Ative no GitHub Pages

Após conferir a gravação real, edite `data/registration.json`:

```json
{
  "enabled": true,
  "webAppUrl": "https://script.google.com/macros/s/IDENTIFICADOR/exec",
  "emailDomain": "id.uff.br",
  "maxPdfBytes": 5242880,
  "maxSubmissionsPerDay": 50,
  "maxSubmissionsPerEmailPerDay": 3,
  "additionalAllowedOrigins": [],
  "privacyVersion": "2026-09-13"
}
```

Remova a origem local, gere novamente a configuração e atualize a versão implantada no Google. Execute `npm run prepare:registrations`, `npm run check`, `npm test` e `npm run build`, depois publique as alterações pelo fluxo habitual do repositório. Em **Settings → Pages → Source**, mantenha **GitHub Actions**, para publicar a compilação Astro.

O formulário aparece automaticamente nos projetos com `status: inscricoes-abertas` e sem `link_inscricao` externo. Projetos com um link próprio continuam usando esse link. Enquanto `enabled` estiver `false`, o site mostra uma orientação de contato, sem aceitar envios. Um prazo de encerramento no Markdown também é validado pelo servidor, até o fim daquela data no fuso de São Paulo.

## Manutenção

- **Novo projeto, semestre, prazo ou mudança de status:** edite o Markdown em `data/extension-projects/`, execute `npm run prepare:registrations`, substitua `Config.gs` no Google, execute `setupRegistrations_` para preparar os recursos novos e publique uma **nova versão da mesma implantação**. Depois publique o site. A validação do repositório detecta uma configuração gerada desatualizada, mas não pode conferir a versão instalada no Google.
- **Textos e limites:** edite `data/registration-copy.json` e `data/registration.json`. Atualize tanto o site quanto a implantação Google. Os textos exibidos e os títulos das colunas ficam em `data/`. Alterar os títulos não renomeia colunas de planilhas existentes.
- **Pausar imediatamente:** nas propriedades do script, defina `REGISTRATIONS_PAUSED` como `true`. Para retomar, use `false`. Desativar só o formulário no site não desativa uma URL Google já publicada.
- **Proteção de capacidade:** o servidor limita a 50 tentativas válidas de gravação por dia e 3 por e-mail informado, somando os projetos. Os contadores reiniciam à meia-noite em São Paulo. Uma repetição idêntica, na mesma página, recebe o protocolo anterior sem consumir novamente o limite. Uma nova página ou dados alterados constituem outro envio; respostas anteriores não são sobrescritas.
- **Abuso:** por não exigir autenticação, a validação de domínio e os limites não impedem alguém de informar o e-mail de outra pessoa ou consumir a cota. A lista de origens protege a troca de mensagens do navegador, mas não é autenticação. Se houver abuso, pause o serviço e reavalie a necessidade de CAPTCHA ou autenticação com a instituição.
- **Falhas:** o site só confirma após resposta do servidor. Se houver erro de conexão, o aluno pode repetir sem alterar os campos. Uma falha excepcional entre Drive e Sheets pode deixar um PDF sem linha correspondente; os protocolos permitem reconciliar os arquivos. Consulte **Execuções** no Apps Script sem acrescentar logs de históricos ou dados pessoais ao código.
- **Privacidade:** revise o aviso em `data/registration-copy.json`, defina com a equipe o período de conservação e remova respostas e PDFs quando não forem mais necessários. Não mova inscrições reais para `data/`, `prompts/` ou qualquer pasta do repositório público.
- **Desativação definitiva:** arquive a implantação em **Gerenciar implantações** e revogue as permissões do aplicativo nas conexões da conta Google, se não for mais utilizado.

A comunicação usa [HtmlService e google.script.run](https://developers.google.com/apps-script/guides/html/communication), com uma ponte invisível que valida origem e canal de mensagens. A [permissão de incorporação](https://developers.google.com/apps-script/reference/html/x-frame-options-mode) permite usar essa ponte dentro da página Astro. Não são usados `fetch` com resposta opaca, credenciais no navegador ou um servidor Node no GitHub Pages.
