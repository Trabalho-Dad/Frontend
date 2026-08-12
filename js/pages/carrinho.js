document.addEventListener("DOMContentLoaded", () => {

    const produtos = document.querySelectorAll(".produto");

    const subtotalElement = document.getElementById("subtotal");
    const freteElement = document.getElementById("frete");
    const totalElement = document.getElementById("total");

    const FRETE = 19.90;


    function formatarPreco(valor) {
        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }


    function atualizarCarrinho() {

        let subtotal = 0;

        document.querySelectorAll(".produto").forEach((produto) => {

            const preco = Number(produto.dataset.price);

            const quantidade = Number(
                produto.querySelector(".valor-quantidade").textContent
            );

            const precoFinal = preco * quantidade;

            subtotal += precoFinal;

            const precoElement = produto.querySelector(".produto-preco");

            precoElement.textContent = formatarPreco(precoFinal);
        });


        const quantidadeProdutos = document.querySelectorAll(".produto").length;

        if (quantidadeProdutos === 0) {

            subtotalElement.textContent = formatarPreco(0);
            freteElement.textContent = formatarPreco(0);
            totalElement.textContent = formatarPreco(0);

            return;
        }


        const total = subtotal + FRETE;

        subtotalElement.textContent = formatarPreco(subtotal);
        freteElement.textContent = formatarPreco(FRETE);
        totalElement.textContent = formatarPreco(total);
    }


    produtos.forEach((produto) => {

        const botaoDiminuir =
            produto.querySelector(".diminuir");

        const botaoAumentar =
            produto.querySelector(".aumentar");

        const quantidadeElement =
            produto.querySelector(".valor-quantidade");

        const botaoRemover =
            produto.querySelector(".btn-remover");


        /* AUMENTAR */

        botaoAumentar.addEventListener("click", () => {

            let quantidade =
                Number(quantidadeElement.textContent);

            quantidade++;

            quantidadeElement.textContent = quantidade;

            atualizarCarrinho();
        });


        /* DIMINUIR */

        botaoDiminuir.addEventListener("click", () => {

            let quantidade =
                Number(quantidadeElement.textContent);

            if (quantidade > 1) {
                quantidade--;

                quantidadeElement.textContent = quantidade;

                atualizarCarrinho();
            }
        });


        /* REMOVER */

        botaoRemover.addEventListener("click", () => {

            produto.remove();

            atualizarCarrinho();
        });

    });


    atualizarCarrinho();

});