// BANCO DE DADOS
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = "https://tjcqfgqosnacpehnpntv.supabase.co";
const supabaseKey = "sb_publishable_5G0uE57ffsDSRd5XPKpC6w_74TUQJmu";

const banco = createClient(supabaseUrl, supabaseKey);

//Atualização automática do ano

// a linha abaixo captura a tag <span> e armazena o "conteúdo" na variável ano
let ano = document.getElementById('copyrightYear')

// a linha a baixo obtem o ano do servidor e armazena a variável  anoAtual
let anoAtual = new Date().getFullYear()

//a linha abaixo insere o conteúdo da variável anoAtual em ano (variávelrelacionada a tah <span>)
if (ano) {
    ano.textContent = anoAtual;
}


/**  Recolher menu na rolagem **/
// Capturar o evento de rolagem diretamente no JS

window.addEventListener('scroll', function () {
    // a linha abaixo captura a tag <input type="checkbox" id="check"> identificada como 'check' e armazena na variável menuCheck
    let menuCheck = this.document.getElementById('check')
    // Se a caixa input check estiver marcada, desmarcar
    menuCheck.checked = false
})

const links = document.querySelectorAll("nav ul li a");

links.forEach(link => {
    link.addEventListener("click", () => {
        links.forEach(item => item.classList.remove("ativo"));
        link.classList.add("ativo");
    });
});


/** PERGUNTAS FREQUENTES */

const items = document.querySelectorAll(".faq-item");

if (items.length > 0) {
    items.forEach(item => {
        const button = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");

        if (button && answer) {
            button.addEventListener("click", () => {
                const isOpen = item.classList.contains("active");

                items.forEach(i => {
                    i.classList.remove("active");

                    const resposta = i.querySelector(".faq-answer");
                    if (resposta) {
                        resposta.style.maxHeight = "0px";
                    }
                });

                if (!isOpen) {
                    item.classList.add("active");
                    answer.style.maxHeight = answer.scrollHeight + "px";
                }
            });
        }
    });
}


/** E-MAIL AUTOMATICO */

/** E-MAIL AUTOMATICO */

if (typeof emailjs !== "undefined") {
    emailjs.init("4QFMaxt2Cj7nxtec1");
}

const formulario = document.getElementById("form-contato");
const mensagemFormulario = document.getElementById("mensagem-formulario");

/* ANTI-SPAM - horário que abriu a página */
const tempoAbertura = Date.now();

if (formulario) {

    formulario.addEventListener("submit", async function (event) {

        event.preventDefault();

        /* ANTI-SPAM */

        // Honeypot invisível
        if (formulario.elements["website"].value !== "") {
            return;
        }

        // Espera mínima de 3 segundos
        if (Date.now() - tempoAbertura < 3000) {
            mensagemFormulario.innerText = "Aguarde alguns segundos antes de enviar.";
            return;
        }

        // Limite de 1 minuto entre envios
        const ultimoEnvio = localStorage.getItem("ultimoEnvio");

        if (ultimoEnvio && Date.now() - ultimoEnvio < 60000) {
            mensagemFormulario.innerText = "Você acabou de enviar uma mensagem. Por gentileza aguardar 1 minuto.";
            mensagemFormulario.style.height = "auto";
            mensagemFormulario.style.height =
                mensagemFormulario.scrollHeight + "px";
            return;
        }

        const botao = formulario.querySelector("button");

        mensagemFormulario.innerText = "";
        mensagemFormulario.style.height = "0";
        mensagemFormulario.style.marginBottom = "0";
        try {

            botao.innerText = "Enviando...";
            botao.disabled = true;

            const nome = formulario.elements["name"].value;
            const email = formulario.elements["email"].value;
            const assunto = formulario.elements["title"].value;
            const mensagem = formulario.elements["message"].value;

            const { data, error } = await banco
                .from("contatos")
                .insert([
                    {
                        nome,
                        email,
                        assunto,
                        mensagem
                    }
                ]);

            console.log("DATA:", data);
            console.log("ERROR:", error);

            if (error) {
                throw error;
            }

            await Promise.all([

                emailjs.sendForm(
                    "service_6fbips8",
                    "template_aay06d1",
                    formulario
                ),

                emailjs.sendForm(
                    "service_6fbips8",
                    "template_swxvjbd",
                    formulario
                )

            ]);

            formulario.reset();

            botao.innerText = "✓ Mensagem enviada";

            /* salva horário do envio */
            localStorage.setItem("ultimoEnvio", Date.now());

            setTimeout(() => {
                botao.innerText = "Enviar mensagem";
                botao.disabled = false;
            }, 3000);

        } catch (erro) {

            console.log(erro);

            botao.innerText = "Erro ao enviar";

            setTimeout(() => {
                botao.innerText = "Enviar mensagem";
                botao.disabled = false;
            }, 3000);

        }

    });

}