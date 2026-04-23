//Atualização automática do ano
 
// a linha abaixo captura a tag <span> e armazena o "conteúdo" na variável ano
let ano = document.getElementById ('copyrightYear')
 
// a linha a baixo obtem o ano do servidor e armazena a variável  anoAtual
let anoAtual = new Date().getFullYear()
 
//a linha abaixo insere o conteúdo da variável anoAtual em ano (variávelrelacionada a tah <span>)
ano.textContent = anoAtual
 
 
/**  Recolher menu na rolagem **/
// Capturar o evento de rolagem diretamente no JS
 
window.addEventListener('scroll', function (){
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

