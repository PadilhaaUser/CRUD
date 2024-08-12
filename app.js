// Selecionando elementos do DOM
const formularioCliente = document.getElementById('formularioCliente');
const nomeClienteInput = document.getElementById('nomeCliente');
const emailClienteInput = document.getElementById('emailCliente');
const clienteIdInput = document.getElementById('clienteId');
const corpoTabelaClientes = document.getElementById('corpoTabelaClientes');

// Carregar clientes salvos no Local Storage
document.addEventListener('DOMContentLoaded', carregarClientes);

// Adicionar ou atualizar cliente
formularioCliente.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nome = nomeClienteInput.value.trim();
    const email = emailClienteInput.value.trim();
    const id = clienteIdInput.value;

    if (id === '') {
        const novoCliente = {
            id: Date.now(),
            nome: nome,
            email: email
        };
        adicionarClienteAoDOM(novoCliente);
        salvarClienteNoLocalStorage(novoCliente);
    } else {
        atualizarClienteNoDOM(id, nome, email);
        atualizarClienteNoLocalStorage(id, nome, email);
    }
    
    formularioCliente.reset();
    clienteIdInput.value = '';
});

// Carregar clientes do Local Storage e exibir no DOM
function carregarClientes() {
    const clientes = obterClientesDoLocalStorage();
    clientes.forEach(cliente => adicionarClienteAoDOM(cliente));
}

// Adicionar cliente ao DOM
function adicionarClienteAoDOM(cliente) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', cliente.id);
    tr.innerHTML = `
        <td>${cliente.nome}</td>
        <td>${cliente.email}</td>
        <td class="acoes">
            <button onclick="editarCliente(${cliente.id})">Editar</button>
            <button class="botao-excluir" onclick="excluirCliente(${cliente.id})">Excluir</button>
        </td>
    `;
    corpoTabelaClientes.appendChild(tr);
}

// Salvar cliente no Local Storage
function salvarClienteNoLocalStorage(cliente) {
    const clientes = obterClientesDoLocalStorage();
    clientes.push(cliente);
    localStorage.setItem('clientes', JSON.stringify(clientes));
}

// Obter clientes do Local Storage
function obterClientesDoLocalStorage() {
    return localStorage.getItem('clientes') ? JSON.parse(localStorage.getItem('clientes')) : [];
}

// Editar cliente
function editarCliente(id) {
    const clientes = obterClientesDoLocalStorage();
    const cliente = clientes.find(cliente => cliente.id == id);

    nomeClienteInput.value = cliente.nome;
    emailClienteInput.value = cliente.email;
    clienteIdInput.value = cliente.id;
}

// Atualizar cliente no DOM
function atualizarClienteNoDOM(id, nome, email) {
    const tr = document.querySelector(`[data-id="${id}"]`);
    tr.innerHTML = `
        <td>${nome}</td>
        <td>${email}</td>
        <td class="acoes">
            <button onclick="editarCliente(${id})">Editar</button>
            <button class="botao-excluir" onclick="excluirCliente(${id})">Excluir</button>
        </td>
    `;
}

// Atualizar cliente no Local Storage
function atualizarClienteNoLocalStorage(id, nome, email) {
    const clientes = obterClientesDoLocalStorage();
    const index = clientes.findIndex(cliente => cliente.id == id);
    clientes[index].nome = nome;
    clientes[index].email = email;
    localStorage.setItem('clientes', JSON.stringify(clientes));
}

// Excluir cliente
function excluirCliente(id) {
    const clientes = obterClientesDoLocalStorage();
    const clientesAtualizados = clientes.filter(cliente => cliente.id !== id);
    localStorage.setItem('clientes', JSON.stringify(clientesAtualizados));
    document.querySelector(`[data-id="${id}"]`).remove();
}
