// Alterna um painel controlado por botão (aria-expanded + hidden)
function alternarPainel(botao, aberto) {
    botao.setAttribute('aria-expanded', String(aberto));
    const painel = document.getElementById(botao.getAttribute('aria-controls'));
    if (painel.id === 'sacola') painel.hidden = !aberto;
}

// Menu do celular: o CSS esconde a navegação enquanto aria-expanded for "false"
const menuBotao = document.querySelector('.menu-botao');
const menu = document.getElementById('menu');

menuBotao.addEventListener('click', () => {
    alternarPainel(menuBotao, menuBotao.getAttribute('aria-expanded') !== 'true');
});

menu.addEventListener('click', (evento) => {
    if (evento.target.closest('a')) alternarPainel(menuBotao, false);
});

// Sacola de demonstração: vive só em memória, nada é salvo ou enviado
const sacolaBotao = document.querySelector('.sacola-botao');
const sacola = document.getElementById('sacola');
const lista = sacola.querySelector('.sacola-lista');
const vazia = sacola.querySelector('.sacola-vazia');
const total = sacola.querySelector('.sacola-total strong');
const contador = document.querySelector('.sacola-contador');
const contadorTexto = document.querySelector('.sacola-contador-texto');
const toast = document.querySelector('.toast');
const itens = new Map(); // nome -> { preco, quantidade }

const real = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
let toastTimer;

function avisar(mensagem) {
    toast.textContent = mensagem;
    toast.classList.add('visivel');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visivel'), 3500);
}

function renderizarSacola() {
    let quantidade = 0;
    let soma = 0;
    lista.replaceChildren();

    for (const [nome, item] of itens) {
        quantidade += item.quantidade;
        soma += item.preco * item.quantidade;
        const li = document.createElement('li');
        li.textContent = `${item.quantidade}× ${nome}`;
        const valor = document.createElement('span');
        valor.textContent = real.format(item.preco * item.quantidade);
        li.append(valor);
        lista.append(li);
    }

    contador.textContent = quantidade;
    contadorTexto.textContent = `${quantidade} ${quantidade === 1 ? 'item' : 'itens'}`;
    total.textContent = real.format(soma);
    vazia.hidden = quantidade > 0;
    sacola.querySelector('.sacola-rodape').hidden = quantidade === 0;
}

document.querySelectorAll('.botao-adicionar').forEach((botao) => {
    botao.addEventListener('click', () => {
        const produto = botao.closest('.produto');
        const nome = produto.dataset.nome;
        const item = itens.get(nome) ?? { preco: Number(produto.dataset.preco), quantidade: 0 };
        item.quantidade += 1;
        itens.set(nome, item);
        renderizarSacola();
        contador.classList.remove('pulo');
        void contador.offsetWidth; // reinicia a animação
        contador.classList.add('pulo');
        avisar(`${nome} entrou na sacola de demonstração. Esta página não vende produtos.`);
    });
});

sacolaBotao.addEventListener('click', () => {
    alternarPainel(sacolaBotao, sacolaBotao.getAttribute('aria-expanded') !== 'true');
});

sacola.querySelector('.sacola-limpar').addEventListener('click', () => {
    itens.clear();
    renderizarSacola();
    sacolaBotao.focus();
    avisar('Sacola esvaziada.');
});

// Esc fecha o que estiver aberto e devolve o foco ao botão
document.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape') return;
    for (const botao of [sacolaBotao, menuBotao]) {
        if (botao.getAttribute('aria-expanded') === 'true') {
            alternarPainel(botao, false);
            botao.focus();
        }
    }
});

renderizarSacola();
