# Astra

![Logo do Astra](./assets/images/logoAstra.png)

O **Astra** é um e-commerce de figures colecionáveis desenvolvido como projeto escolar da disciplina de Desenvolvimento de Aplicações Dinâmicas. A plataforma reúne catálogo, favoritos, carrinho, checkout, perfil do usuário e uma área administrativa para gerenciamento da loja.

Este repositório contém o **frontend** da aplicação, construído com HTML, CSS e JavaScript vanilla e integrado aos serviços do backend por meio de APIs REST.

## Funcionalidades

### Cliente

- Cadastro, login, logout e recuperação de senha;
- catálogo com pesquisa, filtros e paginação;
- página de detalhes de cada figure;
- favoritos vinculados ao usuário autenticado;
- carrinho com controle de quantidade;
- cálculo e exibição do resumo da compra;
- checkout com dados pessoais e endereço cadastrado;
- escolha da forma de pagamento;
- confirmação e histórico de pedidos;
- perfil com dados pessoais, endereços e pedidos;
- tema claro e escuro;
- layout responsivo para computador, tablet e celular.

### Administração

A área administrativa é exibida somente para usuários com permissão de administrador e permite:

- visualizar indicadores gerais;
- cadastrar e editar bonecos;
- enviar e selecionar imagens dos produtos;
- gerenciar personagens;
- gerenciar categorias;
- gerenciar cupons de desconto;
- controlar estoque e disponibilidade dos produtos.

## Acessibilidade

O site possui um painel próprio de acessibilidade com:

- aumento do tamanho do texto;
- fonte com maior legibilidade;
- alto contraste;
- paleta de cores adequada para diferentes tipos de daltonismo;
- tradução da interface entre português e inglês;
- leitura do conteúdo da página por síntese de voz;
- link para pular diretamente ao conteúdo principal;
- navegação e mensagens compatíveis com tecnologias assistivas.

## Tecnologias utilizadas

- **HTML5** — estrutura e semântica das páginas;
- **CSS3** — componentes, temas e responsividade;
- **JavaScript ES Modules** — comportamento e integração com as APIs;
- **Fetch API** — comunicação com o backend;
- **Local Storage e Session Storage** — preferências e dados temporários da navegação;
- **Cloudinary** — armazenamento das imagens cadastradas na área administrativa;
- **Google Fonts e Material Symbols** — tipografia e ícones.

Não é necessário instalar dependências ou executar um processo de build.


## Integrações

As URLs utilizadas pelo frontend estão centralizadas em [`js/api/config.js`](./js/api/config.js):

- API principal: autenticação, usuários, endereços, produtos, categorias, carrinho e pedidos;
- serviço de engajamento: favoritos e avaliações;
- Cloudinary: upload das imagens dos produtos.

As requisições autenticadas usam cookies com `credentials: "include"`. Portanto, o backend precisa permitir a origem usada pelo frontend e aceitar credenciais na configuração de CORS.

## Estrutura do projeto

```text
Frontend/
├── assets/
│   ├── icons/                 # Ícones SVG e favicon
│   └── images/                # Logos, figures, caixas e acessórios
├── css/
│   ├── base/                  # Reset, variáveis e estilos globais
│   ├── components/            # Header, footer, cards, modais e loading
│   ├── pages/                 # Estilos específicos de cada página
│   ├── accessibility.css      # Recursos visuais de acessibilidade
│   └── theme.css              # Tema claro e demais adaptações
├── js/
│   ├── api/                   # Funções de comunicação com as APIs
│   ├── components/            # Componentes compartilhados
│   ├── pages/                 # Controladores das páginas
│   ├── utils/                 # Formatação, validação, header e armazenamento
│   ├── accessibility.js       # Painel e preferências de acessibilidade
│   └── theme.js               # Inicialização do tema
├── pages/
│   ├── admin/                 # Telas administrativas
│   ├── auth/                  # Login e recuperação de senha
│   └── me/                    # Perfil do usuário
├── index.html                 # Página inicial
├── catalogo.html              # Catálogo de produtos
├── figure.html                # Detalhes da figure
├── favorites.html             # Produtos favoritos
├── carrinho.html              # Carrinho
├── checkout.html              # Finalização da compra
└── pedido-finalizado.html     # Confirmação do pedido
```

## Fluxo da aplicação

1. O usuário cria uma conta ou entra com suas credenciais.
2. Os produtos são carregados da API na página inicial e no catálogo.
3. Ao selecionar **Comprar**, o usuário acessa os detalhes da figure.
4. A figure pode ser adicionada aos favoritos ou ao carrinho.
5. No carrinho, o usuário ajusta as quantidades e segue para o checkout.
6. O checkout consulta os dados do usuário e finaliza o pedido pelo backend.
7. Após a confirmação, o pedido aparece no histórico do perfil.

Ações como favoritar, adicionar ao carrinho e comprar exigem autenticação. Quando necessário, o usuário é direcionado ao login e pode retornar ao fluxo anterior depois de entrar.

## Equipe

- Ana Blefari
- Nanda Nagata
- Caio Marcos
- Edu Amex
- Pedro Casarini

## Licença

Este projeto está disponível sob a licença MIT. Consulte o arquivo [`LICENSE`](./LICENSE) para mais informações.
