const STORAGE_KEY = "astra-accessibility";

const DEFAULTS = {
  fontSize: "normal",
  readableFont: false,
  highContrast: false,
  colorVision: false,
  language: "pt-BR",
};

const TRANSLATIONS = new Map([
  ["Início", "Home"], ["Catálogo", "Catalog"], ["Sobre nós", "About us"],
  ["Entrar", "Sign in"], ["Perfil", "Profile"], ["Favoritos", "Favorites"],
  ["Carrinho", "Cart"], ["Comprar", "Buy"], ["Comprar agora", "Buy now"],
  ["Adicionar ao carrinho", "Add to cart"], ["Continuar comprando", "Continue shopping"],
  ["Finalizar compra", "Checkout"], ["Dados pessoais", "Personal information"],
  ["Endereços cadastrados", "Saved addresses"], ["Histórico de pedidos", "Order history"],
  ["Editar perfil", "Edit profile"], ["Sair", "Sign out"], ["Subtotal", "Subtotal"],
  ["Frete", "Shipping"], ["Total", "Total"], ["Quantidade", "Quantity"],
  ["Filtros", "Filters"], ["Limpar Filtro", "Clear filters"], ["Loja", "Store"],
  ["Ajuda", "Help"], ["Entregas", "Deliveries"], ["Suporte", "Support"],
  ["Administrativo", "Administration"], ["Meu perfil", "My profile"],
  ["Acessibilidade", "Accessibility"], ["Página inicial", "Home page"],
  ["Toda a Coleção astra", "The complete Astra collection"],
  ["Todos", "All"], ["Categoria", "Category"], ["Categorias", "Categories"],
  ["Produtos", "Products"], ["Produto", "Product"], ["Colecionável", "Collectible"],
  ["Descrição", "Description"], ["Preço", "Price"], ["Valor", "Price"],
  ["Nome completo", "Full name"], ["Nome", "Name"], ["Telefone", "Phone"],
  ["Documento (CPF)", "Document (CPF)"], ["E-mail", "Email"],
  ["Suas informações de cadastro", "Your registration information"],
  ["Selecione a forma de pagamento", "Choose a payment method"], ["Editar boneco", "Edit figure"],
  ["Cartão crédito/débito", "Credit/debit card"], ["Pagar", "Pay"],
  ["Dados pessoais", "Personal details"], ["Entrega", "Delivery"],
  ["Endereço", "Address"], ["Cidade", "City"], ["Complemento", "Additional information"], ["Número", "Number"],
  ["Bairro", "Neighborhood"], ["Estado", "State"], ["Novo boneco", "New figure"],
  ["Resumo do pedido", "Order summary"], ["Seu carrinho está vazio.", "Your cart is empty."],
  ["Nenhum produto encontrado", "No products found"], ["Imagens do boneco (a primeira selecionada vira a imagem principal)",
    "Figure's images (the first is the main one)"],
  ["Você ainda não tem produtos favoritos.", "You do not have favorite products yet."],
  ["Você ainda não adicionou nenhum produto aos favoritos.", "You have not added any favorite products yet."],
  ["Remover dos favoritos", "Remove from favorites"], ["Favoritar", "Add to favorites"],
  ["Remover produto", "Remove product"], ["Aumentar quantidade", "Increase quantity"],
  ["Diminuir quantidade", "Decrease quantity"], ["Voltar", "Back"],
  ["Próxima página", "Next page"], ["Página anterior", "Previous page"],
  ["Trocas e devoluções", "Returns and exchanges"], ["Mais Vendidos", "Best sellers"],
  ["Lançamentos", "New releases"], ["Exclusivos", "Exclusives"],
  ["Compra segura", "Secure purchase"], ["Frete rápido", "Fast shipping"],
  ["Produtos relacionados", "Related products"], ["Avaliações", "Reviews"],
  ["Editar perfil", "Edit profile"], ["Não informado", "Not provided"],
  ["Nenhum destaque disponível no momento.", "No featured products available right now."],
  ["Busque pelo seu funko pop predileto", "Search for your favorite Funko Pop"],
  ["Digite seu e-mail aqui", "Enter your email"], ["Digite sua senha aqui", "Enter your password"],
  ["Senha", "Password"], ["Confirmar senha", "Confirm password"],
  ["Cadastre-se", "Sign up"], ["Não tem uma conta?", "Don't have an account?"],
  ["Esqueceu sua senha?", "Forgot your password?"], ["Clique aqui", "Click here"],
  ["Opções de acessibilidade", "Accessibility options"],
  ["Abrir opções de acessibilidade", "Open accessibility options"],
  ["Fechar opções de acessibilidade", "Close accessibility options"],
  ["Pular para o conteúdo", "Skip to content"], ["Tamanho do texto", "Text size"],
  ["Texto normal", "Normal text"], ["Texto grande", "Large text"],
  ["Texto maior", "Larger text"], ["Visual", "Visual"],
  ["Alto contraste", "High contrast"], ["Cores para daltonismo", "Color-blind friendly colors"],
  ["Fonte legível", "Readable font"], ["Idioma", "Language"],
  ["Leitura em voz alta", "Read aloud"], ["Ler página", "Read page"],
  ["Parar leitura", "Stop reading"], ["Restaurar opções", "Reset options"],
  ["Qual será o", "What will be"], ["próximo da", "the next item in"],
  ["sua coleção?", "your collection?"], ["Os mais cobiçados", "The most wanted"],
  ["desta semana", "this week"], ["Ver catálogo", "Browse catalog"],
  ["Conheça a Astra", "Discover Astra"], ["Todos os que você", "Everything you"],
  ["amou", "loved"], ["Finalize sua", "Complete your"], ["compra", "purchase"],
  ["C A T A L O G O", "C A T A L O G"], ["CATEGORIA", "CATEGORY"],
  ["Toda a Coleção", "The Complete"], ["Salvar boneco","Save figure"],
  ["Construído por", "Built by"], ["colecionadores", "collectors"],
  [", para outros colecionadores.", ", for fellow collectors."],
  ["O astra nasceu da obsessão em transformar uma paixão geek em um espaço onde cada Funko Pop fosse tratado como uma peça rara. Aqui, colecionar é experiência.",
    "Astra was born from the drive to turn a geek passion into a place where every Funko Pop is treated as a rare piece. Here, collecting is an experience."],
  ["Explorar catálogo", "Explore catalog"], ["Conheça o time", "Meet the team"], ["Quantidade em estoque", "Quantity in stock"], ["Preço (R$)", "Price(R$)"], ["Personagem","Character"],
  ["Os últimos lançamentos e mais aguardados, incluindo peças que representam quem você é.", "The latest and most anticipated releases, including pieces that reflect who you are."],
  ["Você ainda não possui endereços cadastrados.", "You don't have any addresses saved yet."], ["Buscar por nome...", "Find by name..."], ["Todos os status", "All status"],
  ["Você ainda não realizou nenhum pedido.","You haven't placed any orders yet."], ["Ativa", "Active"], ["Salvar categoria", "Save category"],
  ["satisfeitos", "collectors"], ["Desconto (%)", "Discount (%)"], ["Limite de uso", "Usage Limit"], ["Nova categoria", "New category"],
  ["+5000 colecionadores", "+5,000 satisfied "], ["Novo personagem", "New character"], ["Editar personagem", "Edit Character"], ["Ativos", "Actives"],
  ["O universo", "The universe of"], ["Personagens", "Characters"], ["Visão geral","Overview"], ["Salvar personagem", "Save character"], ["Inativos", "Inactives"],
  ["O Astra nasceu da união de cinco estudantes da área de Tecnologia da Informação com o objetivo de desenvolver uma experiência moderna e intuitiva para colecionadores de Funko Pop. Criado como parte do projeto da disciplina de Desenvolvimento de Aplicações Dinâmicas, o site representa a aplicação prática dos conhecimentos adquiridos ao longo do curso.",
    "Astra was created by five Information Technology students to build a modern and intuitive experience for Funko Pop collectors. Developed as part of the Dynamic Application Development course, the website puts into practice the knowledge acquired throughout the program."],
  ["Nosso foco é oferecer uma plataforma de e-commerce que combine organização, acessibilidade e uma navegação simples, tornando a busca pelos itens favorites dos colecionadores mais fácil e agradável.",
    "Our goal is to offer an e-commerce platform that combines organization, accessibility and simple navigation, making it easier and more enjoyable for collectors to find their favorite items."],
  ["Mais do que um trabalho acadêmico, o Astra reflete nosso compromisso com a qualidade, a inovação e o desenvolvimento de soluções que unem tecnologia e uma boa experiência para o usuário.",
    "More than an academic project, Astra reflects our commitment to quality, innovation and solutions that combine technology with a great user experience."],
  ["O que nos move", "What drives us"], ["Qualidade", "Quality"], ["Código", "Code"], ["Novo cupom","New Coupon"], ["Editar categoria", "Edit category"],
  ["Buscamos desenvolver uma plataforma pensada pela excelência em cada detalhe.",
    "We strive to build a platform designed for excellence in every detail."], ["+ Novo cupom", "+ New Coupon"], ["Criar cupom", "Create coupon"],
  ["Compromisso", "Commitment"], ["+ Novo boneco", "+ New figure"], ["+ Novo personagem", "+ New Character"],
  ["Trabalhamos para oferecer uma experiência segura, transparente e satisfatória.",
    "We work to provide a secure, transparent and satisfying experience."], ["Começo", "Start"], ["Fim", "End"],
  ["Inovação", "Innovation"], ["Cupons de desconto", "Coupons"], ["Estoque", "Stock"],
  ["Estamos sempre em busca de novas ideias que tornem a experiência mais eficiente.",
    "We are always looking for new ideas that make the experience more efficient."],
  ["Paixão", "Passion"], ["Desconto", "Discount"], ["Código", "Code"], ["Uso", "Usage"], ["Validade", "Validity"],
  ["Desenvolvemos o Astra pensando em quem possui a paixão por colecionar.",
    "We built Astra for people who are passionate about collecting."], ["Total recebido (24h)", "Total Received (24h)"],
  ["Por trás do Astra", "Behind Astra"], ["Dev back", "Back-end developer"], ["Pedidos (24h)", "Orders (24h)"],
  ["Analista de dados", "Data analyst"], ["Ações", "Actions"], ["+ Nova categoria", "+ New category"], ["Ativo", "Active"], ["Pendente", "Pending"],
  ["A loja definitiva para colecionadores.", "The ultimate store for collectors."],
  ["Edições raras, exclusivas globais e drops semanais.", "Rare editions, global exclusives and weekly drops."],
  ["Bonecos", "Figures"],["Categorias", "Categories"],["Cupons", "Coupons"], ["Gestão", "Management"], ["Bonecos ativos", "Actived Figures"]
]);

let settings = readSettings();
const originalTexts = new WeakMap();
const originalAttributes = new WeakMap();
const originalTitle = document.title;
let translating = false;

function readSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch (_) {
    return { ...DEFAULTS };
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function applySettings() {
  const root = document.documentElement;
  root.dataset.fontSize = settings.fontSize;
  root.toggleAttribute("data-readable-font", settings.readableFont);
  root.toggleAttribute("data-high-contrast", settings.highContrast);
  if (settings.colorVision) root.dataset.colorVision = "safe";
  else delete root.dataset.colorVision;
  root.lang = settings.language;
  translatePage(settings.language);
  updatePressedStates();
}

function translatePage(language) {
  if (translating || !document.body) return;
  translating = true;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(node => {
    const parent = node.parentElement;
    if (!parent || parent.closest("script, style")) return;
    if (!originalTexts.has(node)) originalTexts.set(node, node.nodeValue);
    const original = originalTexts.get(node);
    if (language === "pt-BR") {
      node.nodeValue = original;
      return;
    }
    const trimmed = original.trim();
    const translated = TRANSLATIONS.get(trimmed);
    if (translated) node.nodeValue = original.replace(trimmed, translated);
  });

  const catalogBrand = document.querySelector(".catalog-title .texto-roxo")?.firstChild;
  if (catalogBrand && language !== "pt-BR") catalogBrand.nodeValue = "Astra Collection";

  document.querySelectorAll("[placeholder], [title], [aria-label]").forEach(element => {
    if (!originalAttributes.has(element)) {
      originalAttributes.set(element, {
        placeholder: element.getAttribute("placeholder"),
        title: element.getAttribute("title"),
        ariaLabel: element.getAttribute("aria-label"),
      });
    }

    const originals = originalAttributes.get(element);
    [["placeholder", originals.placeholder], ["title", originals.title], ["aria-label", originals.ariaLabel]]
      .forEach(([attribute, original]) => {
        if (original == null) return;
        element.setAttribute(attribute, language === "pt-BR" ? original : (TRANSLATIONS.get(original.trim()) ?? original));
      });
  });

  document.title = language === "pt-BR"
    ? originalTitle
    : originalTitle.replace("Astra Store", "Astra Store")
      .replace("Catálogo", "Catalog")
      .replace("Colecionáveis", "Collectibles")
      .replace("Carrinho", "Cart")
      .replace("Favoritos", "Favorites")
      .replace("Meu perfil", "My profile")
      .replace("Login", "Sign in")
      .replace("Cadastro", "Sign up")
      .replace("Sobre nós", "About us")
      .replace("Sobre nÃ³s", "About us")
      .replace("Finalizar Pedido", "Checkout");

  translating = false;
}

function button(label, action, pressedKey) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = "accessibility-option";
  element.textContent = label;
  if (pressedKey) element.dataset.setting = pressedKey;
  element.addEventListener("click", action);
  return element;
}

function group(title, buttons) {
  const section = document.createElement("section");
  section.className = "accessibility-group";
  const heading = document.createElement("h3");
  heading.textContent = title;
  const options = document.createElement("div");
  options.className = "accessibility-options";
  options.append(...buttons);
  section.append(heading, options);
  return section;
}

function toggleSetting(key) {
  settings[key] = !settings[key];
  saveSettings();
  applySettings();
}

function updatePressedStates() {
  document.querySelectorAll("[data-setting]").forEach(element => {
    const key = element.dataset.setting;
    element.setAttribute("aria-pressed", String(Boolean(settings[key])));
  });
  document.querySelectorAll("[data-font]").forEach(element => {
    element.setAttribute("aria-pressed", String(settings.fontSize === element.dataset.font));
  });
  document.querySelectorAll("[data-language]").forEach(element => {
    element.setAttribute("aria-pressed", String(settings.language === element.dataset.language));
  });
}

function speakPage() {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const main = document.querySelector("main") ?? document.body;
  const text = main.innerText.replace(/\s+/g, " ").trim();
  const speech = new SpeechSynthesisUtterance(text.slice(0, 12000));
  speech.lang = settings.language;
  speech.rate = .95;
  window.speechSynthesis.speak(speech);
}

function createPanel() {
  if (document.querySelector(".accessibility-toggle")) return;

  const main = document.querySelector("main");
  if (main && !main.id) main.id = "main-content";
  if (main) main.tabIndex = -1;

  const skip = document.createElement("a");
  skip.className = "skip-link";
  skip.href = "#main-content";
  skip.textContent = "Pular para o conteúdo";
  document.body.prepend(skip);

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "accessibility-toggle";
  toggle.textContent = "♿";
  toggle.setAttribute("aria-label", "Abrir opções de acessibilidade");
  toggle.setAttribute("aria-expanded", "false");

  const panel = document.createElement("aside");
  panel.className = "accessibility-panel";
  panel.id = "accessibility-panel";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Opções de acessibilidade");
  toggle.setAttribute("aria-controls", panel.id);

  const header = document.createElement("div");
  header.className = "accessibility-panel__header";
  const title = document.createElement("h2");
  title.textContent = "Acessibilidade";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "accessibility-close";
  close.textContent = "×";
  close.setAttribute("aria-label", "Fechar opções de acessibilidade");
  header.append(title, close);

  const normalFont = button("Texto normal", () => { settings.fontSize = "normal"; saveSettings(); applySettings(); });
  normalFont.dataset.font = "normal";
  const largeFont = button("Texto grande", () => { settings.fontSize = "large"; saveSettings(); applySettings(); });
  largeFont.dataset.font = "large";
  const largerFont = button("Texto maior", () => { settings.fontSize = "larger"; saveSettings(); applySettings(); });
  largerFont.dataset.font = "larger";

  const portuguese = button("Português", () => { settings.language = "pt-BR"; saveSettings(); applySettings(); });
  portuguese.dataset.language = "pt-BR";
  const english = button("English", () => { settings.language = "en-US"; saveSettings(); applySettings(); });
  english.dataset.language = "en-US";

  panel.append(
    header,
    group("Tamanho do texto", [normalFont, largeFont, largerFont]),
    group("Visual", [
      button("Alto contraste", () => toggleSetting("highContrast"), "highContrast"),
      button("Cores para daltonismo", () => toggleSetting("colorVision"), "colorVision"),
      button("Fonte legível", () => toggleSetting("readableFont"), "readableFont"),
    ]),
    group("Idioma", [portuguese, english]),
    group("Leitura em voz alta", [
      button("Ler página", speakPage),
      button("Parar leitura", () => window.speechSynthesis?.cancel()),
    ])
  );

  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "accessibility-reset";
  reset.textContent = "Restaurar opções";
  reset.addEventListener("click", () => {
    settings = { ...DEFAULTS };
    saveSettings();
    applySettings();
  });
  panel.appendChild(reset);

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) close.focus();
    else toggle.focus();
  }

  toggle.addEventListener("click", () => setOpen(panel.hidden));
  close.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });

  document.body.append(panel, toggle);
  applySettings();

  const observer = new MutationObserver(() => {
    if (settings.language !== "pt-BR") translatePage(settings.language);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createPanel, { once: true });
} else {
  createPanel();
}
