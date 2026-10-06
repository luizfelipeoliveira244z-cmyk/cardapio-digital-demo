const botoes = document.querySelectorAll(".adicionar");
const contador = document.getElementById("contador-pedido");

const fecharPedido = document.getElementById("fechar-pedido");
const painelPedido = document.getElementById("painel-pedido");
const listaPedido = document.getElementById("lista-pedido");

const modalItem = document.getElementById("modal-item");
const fecharModal = document.getElementById("fechar-modal");
const confirmarItem = document.getElementById("confirmar-item");
const modalNome = document.getElementById("modal-nome");
const modalPreco = document.getElementById("modal-preco");
const observacaoItem = document.getElementById("observacao-item");

const enviarPedido = document.querySelector(".enviar-pedido");
const confirmacaoPedido = document.getElementById("confirmacao-pedido");
const fecharConfirmacao = document.getElementById("fechar-confirmacao");

const acompanharPedido = document.getElementById("acompanhar-pedido");
const voltarCardapio = document.getElementById("voltar-cardapio");
const historicoPedidos = document.getElementById("historico-pedidos");

const tituloBarraPedido = document.getElementById("titulo-barra-pedido");
const acaoBarraPedido = document.getElementById("acao-barra-pedido");

const modalCancelar = document.getElementById("modal-cancelar");
const textoCancelarPedido = document.getElementById("texto-cancelar-pedido");
const fecharModalCancelar = document.getElementById("fechar-modal-cancelar");
const confirmarCancelamento = document.getElementById("confirmar-cancelamento");
const avisoPedidoVazio = document.getElementById("aviso-pedido-vazio");

let pedidos = {};
let itemSelecionado = null;
let existePedidoEnviado = false;
let pedidosEnviados = [];
let numeroPedido = 1;
let ordemGrupos = [];
let pedidoParaCancelar = null;


// ==================================================
// CONTROLE DE ROLAGEM DOS MODAIS
// ==================================================
function bloquearRolagemPagina() {
    document.documentElement.classList.add("modal-aberto");
    document.body.classList.add("modal-aberto");
}

function liberarRolagemPagina() {
    document.documentElement.classList.remove("modal-aberto");
    document.body.classList.remove("modal-aberto");
}

// ==================================================
// ABRIR MODAL DO PRODUTO
// ==================================================

botoes.forEach(function (botao) {

    botao.addEventListener("click", function () {

        const nome = botao.dataset.nome;
        const preco = Number(botao.dataset.preco);

        if (!nome || !preco) {
            return;
        }

        itemSelecionado = {
            nome: nome,
            preco: preco
        };

        modalNome.textContent = nome;

        modalPreco.textContent =
            "R$ " + preco.toFixed(2).replace(".", ",");

        observacaoItem.value = "";

        bloquearRolagemPagina();
        modalItem.classList.add("aberto");

    });

});


// ==================================================
// FECHAR MODAL
// ==================================================

fecharModal.addEventListener("click", function () {

    modalItem.classList.remove("aberto");
    liberarRolagemPagina();

});


// ==================================================
// ADICIONAR NOVO ITEM AO PEDIDO
// ==================================================

confirmarItem.addEventListener("click", function () {

    if (!itemSelecionado) {
        return;
    }

    const nome = itemSelecionado.nome;
    const preco = itemSelecionado.preco;
    const observacao = observacaoItem.value.trim();


    if (!pedidos[nome]) {

        pedidos[nome] = [];

    }


    const grupoExiste = ordemGrupos.some(function (grupo) {

        return (
            grupo.nome === nome &&
            grupo.observacao === observacao
        );

    });


    if (!grupoExiste) {

        ordemGrupos.push({
            nome: nome,
            observacao: observacao
        });

    }


    pedidos[nome].push({

        preco: preco,
        observacao: observacao

    });


    atualizarPedido();

    observacaoItem.value = "";

    modalItem.classList.remove("aberto");
    liberarRolagemPagina();

});


// ==================================================
// ABRIR MEU PEDIDO / ACOMPANHAR PEDIDO
// ==================================================

acaoBarraPedido.addEventListener("click", function () {

    const totalItens = contarItensPendentes();


    if (totalItens > 0) {

        painelPedido.classList.add("aberto");

        return;

    }


    if (existePedidoEnviado) {

        atualizarHistoricoPedidos();

        acompanharPedido.classList.add("aberto");

    }

});


// ==================================================
// FECHAR MEU PEDIDO
// ==================================================

fecharPedido.addEventListener("click", function () {

    painelPedido.classList.remove("aberto");

});


// ==================================================
// FECHAR MEU PEDIDO CLICANDO FORA
// ==================================================

document.addEventListener("click", function (event) {

    if (
        painelPedido.classList.contains("aberto") &&
        !painelPedido.contains(event.target) &&
        !acaoBarraPedido.contains(event.target)
    ) {

        painelPedido.classList.remove("aberto");

    }

});


// ==================================================
// ATUALIZAR MEU PEDIDO
// ==================================================

function atualizarPedido() {

    listaPedido.innerHTML = "";

    let total = 0;
    let totalItens = 0;


    ordemGrupos.forEach(function (grupoOrdem) {

        const nome = grupoOrdem.nome;
        const observacao = grupoOrdem.observacao;

        const itens = pedidos[nome];


        if (!itens) {
            return;
        }


        const itensDoGrupo = itens.filter(function (item) {

            return item.observacao === observacao;

        });


        if (itensDoGrupo.length === 0) {
            return;
        }


        const preco = itensDoGrupo[0].preco;
        const quantidade = itensDoGrupo.length;

        total += preco * quantidade;

        totalItens += quantidade;


        const nomeSeguro = encodeURIComponent(nome);

        const observacaoSegura =
            encodeURIComponent(observacao);


        listaPedido.innerHTML += `

            <div class="item-pedido">

                <div>

                    <strong>
                        ${nome} ×${quantidade}
                    </strong>

                    <p>
                        R$ ${preco.toFixed(2).replace(".", ",")} cada
                    </p>

                    ${
                        observacao !== ""
                        ? `<p>Obs.: ${observacao}</p>`
                        : ""
                    }

                </div>


                <div class="quantidade-pedido">

                    <button
                        onclick="event.stopPropagation(); diminuirGrupo(decodeURIComponent('${nomeSeguro}'), decodeURIComponent('${observacaoSegura}'))">
                        −
                    </button>

                    <span>
                        ${quantidade}
                    </span>

                    <button
                        onclick="event.stopPropagation(); aumentarGrupo(decodeURIComponent('${nomeSeguro}'), decodeURIComponent('${observacaoSegura}'))">
                        +
                    </button>

                </div>

            </div>

        `;

    });


    // Se não houver nenhum item

    if (totalItens === 0) {

        listaPedido.innerHTML =
            "<p>Nenhum item adicionado.</p>";

    }


    // Atualizar total

    document.querySelector(
        ".total-pedido strong:last-child"
    ).textContent =
        "R$ " + total.toFixed(2).replace(".", ",");


    // Atualizar contador

    contador.textContent =
        totalItens +
        (totalItens === 1 ? " item" : " itens");


    atualizarBarraPedido(totalItens);

}


// ==================================================
// AUMENTAR QUANTIDADE
// ==================================================

function aumentarGrupo(nome, observacao) {

    const itens = pedidos[nome];


    if (!itens) {
        return;
    }


    const item = itens.find(function (item) {

        return item.observacao === observacao;

    });


    if (!item) {
        return;
    }


    pedidos[nome].push({

        preco: item.preco,
        observacao: item.observacao

    });


    atualizarPedido();

}


// ==================================================
// DIMINUIR QUANTIDADE
// ==================================================

function diminuirGrupo(nome, observacao) {

    const itens = pedidos[nome];


    if (!itens) {
        return;
    }


    const indice = itens.findIndex(function (item) {

        return item.observacao === observacao;

    });


    if (indice !== -1) {

        itens.splice(indice, 1);

    }


    if (itens.length === 0) {

        delete pedidos[nome];

    }


    atualizarPedido();

}


// ==================================================
// ENVIAR PEDIDO
// ==================================================

enviarPedido.addEventListener("click", function () {

    if (contarItensPendentes() === 0) {

    avisoPedidoVazio.style.display = "block";

    setTimeout(function () {
        avisoPedidoVazio.style.display = "none";
    }, 2500);

    return;

}


    const pedidoEnviado = {

        numero: numeroPedido,

        itens:
            JSON.parse(JSON.stringify(pedidos)),

        grupos:
            JSON.parse(JSON.stringify(ordemGrupos)),

        status: "Pedido enviado"

    };


    pedidosEnviados.push(pedidoEnviado);


    numeroPedido++;


    existePedidoEnviado = true;


    // Limpa somente o novo pedido

    pedidos = {};

    ordemGrupos = [];


    atualizarPedido();

    atualizarHistoricoPedidos();


    painelPedido.classList.remove("aberto");

    confirmacaoPedido.classList.add("aberta");

});


// ==================================================
// BOTÃO ACOMPANHAR PEDIDO DA CONFIRMAÇÃO
// ==================================================

fecharConfirmacao.addEventListener("click", function () {

    confirmacaoPedido.classList.remove("aberta");

    atualizarHistoricoPedidos();

    acompanharPedido.classList.add("aberto");

});


// ==================================================
// VOLTAR AO CARDÁPIO
// ==================================================

voltarCardapio.addEventListener("click", function () {

    acompanharPedido.classList.remove("aberto");

});


// ==================================================
// ATUALIZAR BARRA INFERIOR
// ==================================================

function atualizarBarraPedido(totalItens) {

    if (totalItens > 0) {

        tituloBarraPedido.textContent =
            "Meu pedido";

        acaoBarraPedido.textContent =
            "Ver pedido →";

    }

    else if (existePedidoEnviado) {

        tituloBarraPedido.textContent =
            "Pedido enviado";

        acaoBarraPedido.textContent =
            "Acompanhar pedido →";

    }

    else {

        tituloBarraPedido.textContent =
            "Meu pedido";

        acaoBarraPedido.textContent =
            "Ver pedido →";

    }

}


// ==================================================
// CONTAR ITENS QUE AINDA NÃO FORAM ENVIADOS
// ==================================================

function contarItensPendentes() {

    let totalItens = 0;


    Object.keys(pedidos).forEach(function (nome) {

        totalItens += pedidos[nome].length;

    });


    return totalItens;

}


// ==================================================
// HISTÓRICO DOS PEDIDOS ENVIADOS
// ==================================================

function atualizarHistoricoPedidos() {

    historicoPedidos.innerHTML = "";

    pedidosEnviados.forEach(function (pedido) {

        let itensHTML = "";

        pedido.grupos.forEach(function (grupo) {

            const itens = pedido.itens[grupo.nome] || [];

            const itensDoGrupo = itens.filter(function (item) {

                return item.observacao === grupo.observacao;

            });

            if (itensDoGrupo.length === 0) {
                return;
            }

            itensHTML += `

                <div class="item-historico">

                    <strong>
                        ${grupo.nome} ×${itensDoGrupo.length}
                    </strong>

                    ${
                        grupo.observacao !== ""
                        ? `<p>Obs.: ${grupo.observacao}</p>`
                        : ""
                    }

                </div>

            `;

        });


        historicoPedidos.innerHTML += `

            <div class="pedido-historico">

                <div class="cabecalho-pedido-historico">

                    <div>
                        <strong>
                            Pedido ${pedido.numero}
                        </strong>

                        <p>Mesa 12</p>
                    </div>

                </div>


                <div class="itens-historico">
                    ${itensHTML}
                </div>

                ${
                pedido.status === "Pedido enviado"
                     ? `
                <button
                    class="cancelar-pedido"
                    onclick="cancelarPedido(${pedido.numero})"
                >
                    🗑 Cancelar pedido
                </button>
            `
            : ""
}



                <div class="status-pedido">

    ${
        pedido.status === "Cancelado pelo cliente"
        ? `
            <div class="status cancelado ativo">

                <span>×</span>

                <div>
                    <strong>Pedido cancelado</strong>
                    <p>Este pedido foi cancelado pelo cliente.</p>
                </div>

            </div>
        `
        : `
            <div class="status ativo">

                <span>✓</span>

                <div>
                    <strong>Pedido enviado</strong>
                    <p>Seu pedido foi recebido.</p>
                </div>

            </div>
        `
    }


                    <div class="status">

                        <span>2</span>

                        <div>
                            <strong>Em preparação</strong>
                            <p>A cozinha está preparando seu pedido.</p>
                        </div>

                    </div>


                    <div class="status">

                        <span>3</span>

                        <div>
                            <strong>Pronto</strong>
                            <p>Seu pedido está pronto.</p>
                        </div>

                    </div>


                    <div class="status">

                        <span>4</span>

                        <div>
                            <strong>Entregue</strong>
                            <p>Pedido entregue à mesa.</p>
                        </div>

                    </div>

                </div>

            </div>

        `;

    });

}

// ==================================================
// CANCELAR PEDIDO
// ==================================================

function cancelarPedido(numero) {

    const pedido = pedidosEnviados.find(function(pedido) {

        return pedido.numero === numero;

    });


    if (!pedido) {
        return;
    }


    if (pedido.status !== "Pedido enviado") {

        alert("Este pedido não pode mais ser cancelado.");

        return;

    }


    pedidoParaCancelar = numero;


    textoCancelarPedido.textContent =
        "Deseja realmente cancelar o Pedido " + numero + "?";


    modalCancelar.classList.add("aberto");

}

fecharModalCancelar.addEventListener("click", function() {

    modalCancelar.classList.remove("aberto");

    pedidoParaCancelar = null;

});


confirmarCancelamento.addEventListener("click", function() {

    if (pedidoParaCancelar === null) {
        return;
    }


    const pedido = pedidosEnviados.find(function(pedido) {

        return pedido.numero === pedidoParaCancelar;

    });


    if (!pedido) {
        return;
    }


    pedido.status = "Cancelado pelo cliente";


    modalCancelar.classList.remove("aberto");

    pedidoParaCancelar = null;


    atualizarHistoricoPedidos();

});

const categorias = document.querySelectorAll(".categoria");
const titulosCategorias = Array.from(categorias)
    .map(function (categoria) {
        const destino = categoria.getAttribute("href");
        if (!destino || !destino.startsWith("#")) return null;
        const titulo = document.querySelector(destino);
        return titulo ? { categoria, titulo } : null;
    })
    .filter(Boolean);

let navegacaoProgramatica = false;
let categoriaDestino = null;
let frameNavegacao = null;
let ultimaPosicao = window.scrollY;
let framesParados = 0;

function ativarCategoria(categoria) {
    categorias.forEach(function (item) {
        item.classList.toggle("ativa", item === categoria);
    });
}

function centralizarCategoria(categoria, suave = true) {
    const barra = categoria.parentElement;
    const esquerda =
        categoria.offsetLeft -
        (barra.clientWidth / 2) +
        (categoria.offsetWidth / 2);

    barra.scrollTo({
        left: Math.max(0, esquerda),
        behavior: suave ? "smooth" : "auto"
    });
}

function aguardarFimDaNavegacao() {
    if (!navegacaoProgramatica || !categoriaDestino) return;

    const posicaoAtual = window.scrollY;

    if (Math.abs(posicaoAtual - ultimaPosicao) < 1) {
        framesParados++;
    } else {
        framesParados = 0;
    }

    ultimaPosicao = posicaoAtual;

    if (framesParados >= 5) {
        navegacaoProgramatica = false;
        ativarCategoria(categoriaDestino);
        centralizarCategoria(categoriaDestino, false);
        categoriaDestino = null;
        frameNavegacao = null;
        return;
    }

    frameNavegacao = requestAnimationFrame(aguardarFimDaNavegacao);
}

categorias.forEach(function (categoria) {
    categoria.addEventListener("click", function (event) {
        event.preventDefault();

        const alvo = document.querySelector(categoria.getAttribute("href"));
        if (!alvo) return;

        if (frameNavegacao) {
            cancelAnimationFrame(frameNavegacao);
            frameNavegacao = null;
        }

        navegacaoProgramatica = true;
        categoriaDestino = categoria;
        framesParados = 0;
        ultimaPosicao = window.scrollY;

        // Mantém SOMENTE a categoria clicada ativa durante todo o trajeto.
        ativarCategoria(categoria);
        centralizarCategoria(categoria, true);

        const barra = categoria.parentElement;
        const alturaBarra = barra.getBoundingClientRect().height;
        const y =
            alvo.getBoundingClientRect().top +
            window.scrollY -
            alturaBarra -
            12;

        // Transição vertical suave, sem trocar o destaque pelas categorias do caminho.
        window.scrollTo({
            top: Math.max(0, y),
            behavior: "smooth"
        });

        frameNavegacao = requestAnimationFrame(aguardarFimDaNavegacao);
    });
});

// Rolagem feita pelo dedo: atualiza o destaque normalmente.
// Durante navegação por clique, não interfere.
let atualizacaoAgendada = false;

window.addEventListener("scroll", function () {
    if (navegacaoProgramatica || atualizacaoAgendada) return;

    atualizacaoAgendada = true;

    requestAnimationFrame(function () {
        atualizacaoAgendada = false;

        const limite = 115;
        let atual = titulosCategorias[0];

        for (const item of titulosCategorias) {
            if (item.titulo.getBoundingClientRect().top <= limite) {
                atual = item;
            } else {
                break;
            }
        }

        if (atual) ativarCategoria(atual.categoria);
    });
}, { passive: true });

// Não deixa o gesto no fundo escuro arrastar a página atrás do modal.
[modalItem, modalCancelar].forEach(function (modal) {
    if (!modal) return;
    modal.addEventListener("touchmove", function (event) {
        if (event.target === modal) event.preventDefault();
    }, { passive: false });
});
