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
    let contatosCarregados = [];

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

    function calcularDiasRestantes(dataCriacao, enviado) {

        if (enviado) {
            return `
            <span class="status-icon sucesso"></span>
            E-mail de 7 dias enviado
            `;
        }

        const dataContato = new Date(dataCriacao);
        const dataEnvio = new Date(dataContato);

        dataEnvio.setDate(dataEnvio.getDate() + 7);

        const hoje = new Date();
        const diferenca = dataEnvio - hoje;

        if (diferenca <= 0) {
            return `
            <span class="status-icon pendente"></span>
            Será enviado no próximo ciclo
            `;
        }

        const dias = Math.ceil(
            diferenca / (1000 * 60 * 60 * 24)
        );

        return `
        <span class="status-icon pendente"></span>
        Faltam ${dias} dia(s) para o envio do E-mail.
        `;
    }

    function verificarExpiracaoContato(dataCriacao) {
        const dataContato = new Date(dataCriacao);
        const hoje = new Date();

        const diferenca = hoje - dataContato;
        const diasPassados = Math.floor(diferenca / (1000 * 60 * 60 * 24));

        if (diasPassados >= 15) {
            return {
                expirado: true,
                texto: `Atenção: este contato tem ${diasPassados} dias e já pode ser excluído.`
            };
        }

        return {
            expirado: false,
            texto: `Armazenamento: ${15 - diasPassados} dia(s) restante(s).`
        };
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

        contatosCarregados = data;

        listaContatos.innerHTML = "";

        data.forEach(contato => {
            const statusExpiracao = verificarExpiracaoContato(contato.created_at);
            listaContatos.innerHTML += `
    <article class="contato-card ${statusExpiracao.expirado ? "contato-expirado" : ""}">
        <div class="contato-topo">
            <h3>${contato.nome || "Sem nome"}</h3>

            <div class="contato-acoes">
        <button class="btn-editar" data-id="${contato.id}">
            Editar
        </button>

        <button class="btn-excluir" data-id="${contato.id}">
            Excluir
        </button>
    </div>
        </div>

        <div class="contato-info">
            <p><strong>E-mail:</strong> ${contato.email || "Não informado"}</p>
            <p><strong>Assunto:</strong> ${contato.assunto || "Não informado"}</p>

        <p class="status-email">
        ${calcularDiasRestantes(
                contato.created_at,
                contato.email_7_dias_enviado
            )}
    </p>

            <div class="mensagem">
                <p><strong>Mensagem:</strong></p>
                <p>${contato.mensagem || "Sem mensagem"}</p>
            </div>
        </div>

        <p class="data-contato">
            Recebido em: ${new Date(contato.created_at).toLocaleString("pt-BR")}
        </p>

        <p class="status-retencao">
        ${statusExpiracao.texto}
    </p>

    </article>
    `;
        });
    }

    let idParaExcluir = null;

    const modal = document.getElementById("modal-excluir");
    const btnConfirmar = document.getElementById("confirmar-excluir");
    const btnCancelar = document.getElementById("cancelar-excluir");
    const modalEditar = document.getElementById("modal-editar");
    const confirmarEditar = document.getElementById("confirmar-editar");
    const cancelarEditar = document.getElementById("cancelar-editar");
    const campoBusca = document.getElementById("buscar-contato");

    /* abrir modal */
    document.addEventListener("click", (e) => {

        /* EXCLUIR */
        if (e.target.classList.contains("btn-excluir")) {
            idParaExcluir = e.target.getAttribute("data-id");
            modal.classList.remove("oculto");
        }

        /* EDITAR */
        if (e.target.classList.contains("btn-editar")) {

            const idContato = e.target.getAttribute("data-id");

            const contato = contatosCarregados.find(item => String(item.id) === String(idContato));

            if (!contato) {
                console.log("Contato não encontrado.");
                return;
            }

            document.getElementById("editar-id").value = contato.id;
            document.getElementById("editar-nome").value = contato.nome || "";
            document.getElementById("editar-email").value = contato.email || "";
            document.getElementById("editar-assunto").value = contato.assunto || "";
            document.getElementById("editar-mensagem").value = contato.mensagem || "";

            modalEditar.classList.remove("oculto");
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

    cancelarEditar.addEventListener("click", () => {
        modalEditar.classList.add("oculto");
    });

    confirmarEditar.addEventListener("click", async () => {

        const id = document.getElementById("editar-id").value;

        const { error } = await banco
            .from("contatos")
            .update({
                nome: document.getElementById("editar-nome").value,
                email: document.getElementById("editar-email").value,
                assunto: document.getElementById("editar-assunto").value,
                mensagem: document.getElementById("editar-mensagem").value
            })
            .eq("id", id);

        if (error) {
            console.log(error);
            return;
        }

        modalEditar.classList.add("oculto");
        carregarContatos();
        mostrarToastSucesso();
    });

    verificarLogin();

    const btnVoltarSite = document.getElementById("btn-voltar-site");

    if (btnVoltarSite) {
        btnVoltarSite.addEventListener("click", async function () {
            await banco.auth.signOut();
            window.location.href = "./index.html";
        });
    }

    function mostrarToastSucesso() {
        const toast = document.getElementById("toast-sucesso");

        if (!toast) return;

        toast.classList.remove("ativo");

        void toast.offsetWidth;

        toast.classList.add("ativo");

        setTimeout(() => {
            toast.classList.remove("ativo");
        }, 3000);
    }

    campoBusca.addEventListener("input", function () {

        const termo = this.value.toLowerCase().trim();

        const cards = document.querySelectorAll(".contato-card");

        cards.forEach(card => {

            const nome = card.querySelector("h3").textContent.toLowerCase();

            const email = card
                .querySelector(".contato-info p")
                .textContent
                .toLowerCase();

            const encontrou =
                nome.includes(termo) ||
                email.includes(termo);

            card.style.display = encontrou ? "block" : "none";

        });

    });