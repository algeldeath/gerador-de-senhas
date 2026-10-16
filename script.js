
const tamanho = document.getElementById("tamanho");
const valorTamanho = document.getElementById("valorTamanho");
const resultadoSenha = document.getElementById("resultadoSenha");
const forca = document.getElementById("forca");

// Alternar entre as duas ferramentas
const abas = document.querySelectorAll(".aba");

abas.forEach((aba) => {
    aba.addEventListener("click", () => {
        abas.forEach((item) => item.classList.remove("ativa"));
        aba.classList.add("ativa");

        document.getElementById("gerador").classList.add("escondido");
        document.getElementById("hash").classList.add("escondido");

        document.getElementById(aba.dataset.tela)
            .classList.remove("escondido");
    });
});

// Atualizar o tamanho escolhido
tamanho.addEventListener("input", () => {
    valorTamanho.textContent = tamanho.value;
});

// Número aleatório seguro sem viés de módulo
function numeroAleatorio(maximo) {
    const limite = Math.floor(4294967296 / maximo) * maximo;
    const array = new Uint32Array(1);

    do {
        crypto.getRandomValues(array);
    } while (array[0] >= limite);

    return array[0] % maximo;
}

// Embaralhar uma sequência
function embaralhar(lista) {
    for (let i = lista.length - 1; i > 0; i--) {
        const j = numeroAleatorio(i + 1);
        [lista[i], lista[j]] = [lista[j], lista[i]];
    }

    return lista;
}

// Gerar senha aleatória
document.getElementById("gerar").addEventListener("click", () => {
    if (!crypto.getRandomValues) {
        forca.textContent = "Seu navegador não oferece geração aleatória segura.";
        return;
    }

    const grupos = [];

    if (document.getElementById("maiusculas").checked) {
        grupos.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    }

    if (document.getElementById("minusculas").checked) {
        grupos.push("abcdefghijklmnopqrstuvwxyz");
    }

    if (document.getElementById("numeros").checked) {
        grupos.push("0123456789");
    }

    if (document.getElementById("simbolos").checked) {
        grupos.push("!@#$%&*?+-_=.");
    }

    if (grupos.length === 0) {
        forca.textContent = "Selecione pelo menos um tipo de caractere.";
        resultadoSenha.value = "";
        return;
    }

    const comprimento = Number(tamanho.value);

    if (comprimento < grupos.length) {
        forca.textContent =
            "Aumente o tamanho para incluir pelo menos um caractere de cada tipo selecionado.";
        resultadoSenha.value = "";
        return;
    }

    const todos = grupos.join("");
    const senha = [];

    // Garantir pelo menos um caractere de cada grupo selecionado
    grupos.forEach((grupo) => {
        senha.push(grupo[numeroAleatorio(grupo.length)]);
    });

    // Completar o tamanho da senha
    while (senha.length < comprimento) {
        senha.push(todos[numeroAleatorio(todos.length)]);
    }

    // Misturar as posições
    embaralhar(senha);

    resultadoSenha.value = senha.join("");

    forca.textContent =
        `Senha criada com ${comprimento} caracteres. Guarde-a em local seguro.`;
});

// Copiar texto
async function copiarTexto(texto) {
    if (!texto) {
        return false;
    }

    try {
        await navigator.clipboard.writeText(texto);
        return true;
    } catch (erro) {
        const campo = document.createElement("textarea");
        campo.value = texto;
        campo.style.position = "fixed";
        campo.style.opacity = "0";

        document.body.appendChild(campo);
        campo.select();

        let sucesso = false;

        try {
            sucesso = document.execCommand("copy");
        } finally {
            campo.remove();
        }

        return sucesso;
    }
}

document.getElementById("copiarSenha").addEventListener("click", async () => {
    const sucesso = await copiarTexto(resultadoSenha.value);

    forca.textContent = sucesso
        ? "Senha copiada!"
        : "Não foi possível copiar. Selecione a senha manualmente.";
});

// Gerar hash SHA-256
document.getElementById("gerarHash").addEventListener("click", async () => {
    const texto = document.getElementById("textoHash").value;
    const resultado = document.getElementById("resultadoHash");
    const botao = document.getElementById("gerarHash");

    if (texto.length === 0) {
        resultado.value = "";
        resultado.placeholder = "Digite um texto primeiro.";
        return;
    }

    if (!crypto.subtle) {
        resultado.value = "";
        resultado.placeholder =
            "SHA-256 requer HTTPS ou localhost em um navegador compatível.";
        return;
    }

    botao.disabled = true;
    botao.textContent = "Calculando...";

    try {
        const dados = new TextEncoder().encode(texto);
        const hash = await crypto.subtle.digest("SHA-256", dados);

        resultado.value = Array.from(new Uint8Array(hash))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    } catch (erro) {
        resultado.value = "Não foi possível calcular o hash.";
    } finally {
        botao.disabled = false;
        botao.textContent = "Gerar hash SHA-256";
    }
});

// Copiar hash
document.getElementById("copiarHash").addEventListener("click", async () => {
    const resultado = document.getElementById("resultadoHash");

    if (!resultado.value) {
        alert("Gere um hash primeiro.");
        return;
    }

    const sucesso = await copiarTexto(resultado.value);

    alert(sucesso ? "Hash copiado!" : "Não foi possível copiar o hash.");
});
