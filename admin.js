import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = "https://tjcqfgqosnacpehnpntv.supabase.co";
const supabaseKey = "sb_publishable_5G0uE57ffsDSRd5XPKpC6w_74TUQJmu";

const banco = createClient(
    "https://tjcqfgqosnacpehnpntv.supabase.co",
    "sb_publishable_5G0uE57ffsDSRd5XPKpC6w_74TUQJmu",
    {
        global: {
            headers: {
                apikey: "sb_publishable_5G0uE57ffsDSRd5XPKpC6w_74TUQJmu"
            }
        },
        auth: {
            storage: sessionStorage,
            persistSession: true,
            autoRefreshToken: true
        }
    }
);

const loginBox = document.getElementById("login");
const painel = document.getElementById("painel");
const listaContatos = document.getElementById("lista-contatos");
const formAdmin = document.getElementById("form-admin");
const btnLogout = document.getElementById("btn-logout");
const mensagemLogin = document.getElementById("mensagem-login");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");

formAdmin.addEventListener("submit", async function (event) {
    event.preventDefault();
    await login();
});

btnLogout.addEventListener("click", async function () {
    await logout();
});

async function login() {
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    const { error } = await banco.auth.signInWithPassword({
        email: email,
        password: senha
    });

    if (error) {
        mensagemLogin.textContent = "E-mail ou senha inválidos. Verifique os dados e tente novamente.";
        mensagemLogin.classList.add("ativo");

        // limpa senha
        senhaInput.value = "";
        senhaInput.focus();

        // remove classe antes pra reiniciar animação
        emailInput.classList.remove("input-erro");
        senhaInput.classList.remove("input-erro");

        // força reflow pra reiniciar animação
        void emailInput.offsetWidth;
        void senhaInput.offsetWidth;

        // aplica erro
        emailInput.classList.add("input-erro");
        senhaInput.classList.add("input-erro");

        console.log(error);
        return;
    }

    mensagemLogin.textContent = "";
    mensagemLogin.classList.remove("ativo");
    emailInput.classList.remove("input-erro");
    senhaInput.classList.remove("input-erro");

    mostrarPainel();
    carregarContatos();
}

async function logout() {
    await banco.auth.signOut();

    const emailInput = document.getElementById("email");
    const senhaInput = document.getElementById("senha");

    emailInput.value = "";
    senhaInput.value = "";

    mensagemLogin.textContent = "";
    mensagemLogin.classList.remove("ativo");

    emailInput.classList.remove("input-erro");
    senhaInput.classList.remove("input-erro");

    painel.classList.add("oculto");
    loginBox.classList.remove("oculto");

    emailInput.focus();
}

function mostrarPainel() {
    loginBox.classList.add("oculto");
    painel.classList.remove("oculto");
}

async function carregarContatos() {
    listaContatos.innerHTML = `<div class="mensagem-vazia">Carregando contatos...</div>`;

    const { data, error } = await banco
        .from("contatos")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        listaContatos.innerHTML = `<div class="mensagem-vazia">Erro ao carregar contatos.</div>`;
        console.log(error);
        return;
    }

    if (!data || data.length === 0) {
        listaContatos.innerHTML = `<div class="mensagem-vazia">Nenhum contato recebido ainda.</div>`;
        return;
    }

    listaContatos.innerHTML = "";

    data.forEach(contato => {
        listaContatos.innerHTML += `
<article class="contato-card">
    <div class="contato-topo">
        <h3>${contato.nome || "Sem nome"}</h3>

        <button class="btn-excluir" data-id="${contato.id}">
            Excluir
        </button>
    </div>

    <div class="contato-info">
        <p><strong>E-mail:</strong> ${contato.email || "Não informado"}</p>
        <p><strong>Assunto:</strong> ${contato.assunto || "Não informado"}</p>

        <div class="mensagem">
            <p><strong>Mensagem:</strong></p>
            <p>${contato.mensagem || "Sem mensagem"}</p>
        </div>
    </div>

    <p class="data-contato">
        Recebido em: ${new Date(contato.created_at).toLocaleString("pt-BR")}
    </p>
</article>
`;
    });
}

let idParaExcluir = null;

const modal = document.getElementById("modal-excluir");
const btnConfirmar = document.getElementById("confirmar-excluir");
const btnCancelar = document.getElementById("cancelar-excluir");

/* abrir modal */
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-excluir")) {
        idParaExcluir = e.target.getAttribute("data-id");
        modal.classList.remove("oculto");
    }
});

/* cancelar */
btnCancelar.addEventListener("click", () => {
    modal.classList.add("oculto");
    idParaExcluir = null;

    document.querySelector(".modal-box p").textContent = "Tem certeza que deseja excluir este contato?";
    btnConfirmar.textContent = "Excluir";
});

/* confirmar exclusão */
btnConfirmar.addEventListener("click", async () => {
    if (!idParaExcluir) return;

    await banco.auth.getSession();

    const { error } = await banco
        .from("contatos")
        .delete()
        .eq("id", idParaExcluir);

    if (error) {
        console.log(error);

        const textoModal = document.querySelector(".modal-box p");
        textoModal.textContent = "Não foi possível excluir este contato. Verifique a permissão de exclusão no Supabase.";

        btnConfirmar.textContent = "Tentar novamente";
        return;
    }

    const card = document.querySelector(`[data-id="${idParaExcluir}"]`)
        .closest(".contato-card");

    card.style.maxHeight = card.scrollHeight + "px";

    setTimeout(() => {
        card.classList.add("removendo");
    }, 10);

    setTimeout(() => {
        card.remove();

        modal.classList.add("oculto");
        idParaExcluir = null;
    }, 450);
});

async function verificarLogin() {
    const { data } = await banco.auth.getSession();

    if (data.session) {
        mostrarPainel();
        carregarContatos();
    }
}

verificarLogin();

const btnVoltarSite = document.getElementById("btn-voltar-site");

if (btnVoltarSite) {
    btnVoltarSite.addEventListener("click", async function () {
        await banco.auth.signOut();
        window.location.href = "./index.html";
    });
}