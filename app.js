// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBqJL605EaVVPySHIT9fbK6xWm98fceUDE",
    authDomain: "crud-web-ee495.firebaseapp.com",
    projectId: "crud-web-ee495",
    storageBucket: "crud-web-ee495.firebasestorage.app",
    messagingSenderId: "159102500927",
    appId: "1:159102500927:web:0b14a450b3f5141aa2f88a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Selecionando elementos do DOM
const formularioCliente = document.getElementById('formularioCliente');
const nomeClienteInput = document.getElementById('nomeCliente');
const emailClienteInput = document.getElementById('emailCliente');
const clienteIdInput = document.getElementById('clienteId');
const corpoTabelaClientes = document.getElementById('corpoTabelaClientes');
const btnSubmit = formularioCliente.querySelector('button[type="submit"]');

// Variável para guardar clientes na memória local e facilitar a edição
let clientesNaMemoria = [];

// Carregar clientes em TEMPO REAL do Firestore
// Toda vez que o banco de dados alterar na nuvem, essa maravilha aqui atualiza a tela de todos automaticamente
onSnapshot(collection(db, "clientes"), (snapshot) => {
    clientesNaMemoria = [];
    corpoTabelaClientes.innerHTML = ''; // Limpa a tabela para recriar
    
    snapshot.forEach((documento) => {
        const cliente = {
            id: documento.id,
            ...documento.data()
        };
        clientesNaMemoria.push(cliente);
        adicionarClienteAoDOM(cliente);
    });
});

// Adicionar ou atualizar cliente (quando o formulário for enviado)
formularioCliente.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = nomeClienteInput.value.trim();
    const email = emailClienteInput.value.trim();
    const id = clienteIdInput.value;

    btnSubmit.disabled = true;
    btnSubmit.textContent = id ? 'Atualizando...' : 'Salvando...';

    try {
        if (id === '') {
            // CRIAR: Um documento novo na coleção 'clientes' (o Firestore gera um ID)
            await addDoc(collection(db, "clientes"), {
                nome: nome,
                email: email
            });
        } else {
            // ATUALIZAR: Editar o cliente que já tem um ID
            const clienteRef = doc(db, "clientes", id);
            await updateDoc(clienteRef, {
                nome: nome,
                email: email
            });
        }
        
        // Limpar os campos para a proxima vez
        formularioCliente.reset();
        clienteIdInput.value = '';
    } catch (error) {
        console.error("Erro ao salvar no Firebase: ", error);
        alert("Ocorreu um erro ao salvar o dado. Olhe o Console (F12)!");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Salvar Cliente';
    }
});

// Adicionar cliente ao DOM (HTML)
function adicionarClienteAoDOM(cliente) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', cliente.id);
    tr.innerHTML = `
        <td>${cliente.nome}</td>
        <td>${cliente.email}</td>
        <td class="acoes">
            <button class="botao-editar" data-id="${cliente.id}">Editar</button>
            <button class="botao-excluir" data-id="${cliente.id}">Excluir</button>
        </td>
    `;
    corpoTabelaClientes.appendChild(tr);
}

// Escutar cliques de 'Editar' e 'Excluir' na tabela (Delegação de Eventos para módulos JS)
corpoTabelaClientes.addEventListener('click', async (e) => {
    const target = e.target;
    // Pega o id gravado no atributo data-id do botao que foi clicado
    const id = target.getAttribute('data-id');

    if (!id) return; // Clicou em outro lugar aleatório da tabela

    // Clicou em Editar
    if (target.classList.contains('botao-editar')) {
        const cliente = clientesNaMemoria.find(c => c.id === id);
        if (cliente) {
            nomeClienteInput.value = cliente.nome;
            emailClienteInput.value = cliente.email;
            clienteIdInput.value = cliente.id;
        }
    }

    // Clicou em Excluir
    if (target.classList.contains('botao-excluir')) {
        const confirmou = confirm("Deletar este cliente para sempre da nuvem?");
        if (confirmou) {
            target.disabled = true;
            target.textContent = '...';
            try {
                await deleteDoc(doc(db, "clientes", id));
            } catch (error) {
                console.error("Erro ao excluir do Firebase: ", error);
                target.disabled = false;
                target.textContent = 'Excluir';
                alert("Erro ao tentar excluir! Abra o console F12 para ver o motivo.");
            }
        }
    }
});
