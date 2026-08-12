const THEME_STORAGE_KEY = "astra-theme";
const THEME_SCRIPT_URL = document.currentScript?.src ?? window.location.href;

function readTheme() {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
    } catch (_) {
        return "dark";
    }
}

function applyTheme(theme) {
    const normalizedTheme = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = normalizedTheme;

    try {
        localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
    } catch (_) {
        // A página continua funcionando mesmo quando o navegador bloqueia o storage.
    }

    const toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;

    const isLight = normalizedTheme === "light";
    toggle.textContent = isLight ? "☾" : "☀";
    toggle.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
    toggle.title = isLight ? "Ativar tema escuro" : "Ativar tema claro";
}

// Executa no head para restaurar o tema salvo antes da primeira pintura da página.
applyTheme(readTheme());

function createThemeToggle() {
    if (document.querySelector(".theme-toggle")) return;

    const toggle = document.createElement("button");
    toggle.className = "theme-toggle";
    toggle.type = "button";
    toggle.addEventListener("click", () => {
        const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
        applyTheme(nextTheme);
    });

    const navActions = document.querySelector(".nav-actions");
    if (navActions) {
        navActions.appendChild(toggle);
    } else {
        toggle.classList.add("theme-toggle--floating");
        document.body.appendChild(toggle);
    }

    applyTheme(document.documentElement.dataset.theme);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createThemeToggle, { once: true });
} else {
    createThemeToggle();
}

// O tema já está presente em todas as telas, então ele inicializa também
// os controles compartilhados de acessibilidade sem repetir tags em cada HTML.
const accessibilityStyle = document.createElement("link");
accessibilityStyle.rel = "stylesheet";
accessibilityStyle.href = new URL("../css/accessibility.css", THEME_SCRIPT_URL).href;
document.head.appendChild(accessibilityStyle);

const accessibilityScript = document.createElement("script");
accessibilityScript.type = "module";
accessibilityScript.src = new URL("./accessibility.js", THEME_SCRIPT_URL).href;
document.head.appendChild(accessibilityScript);
