//Atualização automática do ano

// a linha abaixo captura a tag <span> e armazena o "conteúdo" na variável ano
let ano = document.getElementById('copyrightYear')

// a linha a baixo obtem o ano do servidor e armazena a variável  anoAtual
let anoAtual = new Date().getFullYear()

//a linha abaixo insere o conteúdo da variável anoAtual em ano (variávelrelacionada a tah <span>)
ano.textContent = anoAtual


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

items.forEach(item => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    button.addEventListener("click", () => {
        const isOpen = item.classList.contains("active");

        items.forEach(i => {
            i.classList.remove("active");
            i.querySelector(".faq-answer").style.height = "0px";
        });

        if (!isOpen) {
            item.classList.add("active");
            answer.style.height = answer.scrollHeight + "px";
        }
    });
});


/** E-MAIL AUTOMATICO */

/** E-MAIL AUTOMATICO */

emailjs.init("4QFMaxt2Cj7nxtec1");

const formulario = document.getElementById("form-contato");

if (formulario) {

    formulario.addEventListener("submit", function (event) {

        event.preventDefault();

        const botao = formulario.querySelector("button");

        botao.innerText = "Enviando...";
        botao.disabled = true;

        Promise.all([

            /* EMAIL PARA CLIENTE */
            emailjs.sendForm(
                "service_6fbips8",
                "template_aay06d1",
                formulario
            ),

            /* EMAIL PARA SHIELD */
            emailjs.sendForm(
                "service_6fbips8",
                "template_swxvjbd",
                formulario
            )

        ])

        .then(function () {

            formulario.reset();

            botao.innerText = "✓ Mensagem enviada";

            setTimeout(function () {
                botao.innerText = "Enviar mensagem";
                botao.disabled = false;
            }, 3000);

        })

        .catch(function (error) {

            console.log(error);

            botao.innerText = "Erro ao enviar";

            setTimeout(function () {
                botao.innerText = "Enviar mensagem";
                botao.disabled = false;
            }, 3000);

        });

    });

}