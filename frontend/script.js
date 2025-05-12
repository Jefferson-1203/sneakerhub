document.addEventListener('DOMContentLoaded', function() {
  const sneakersContainer = document.getElementById('sneakersContainer');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const addBtn = document.getElementById('addBtn');
  const sneakerModal = document.getElementById('sneakerModal');
  const closeModal = document.getElementById('closeModal');
  const sneakerForm = document.getElementById('sneakerForm');
  const modalTitle = document.getElementById('modalTitle');
  
  let allSneakers = [];
  let isEditing = false;

  // Carrega todos os tênis
  async function loadSneakers() {
    try {
      const response = await fetch('http://localhost:3000/tenis');
      allSneakers = await response.json();
      displaySneakers(allSneakers);
    } catch (error) {
      console.error('Erro ao carregar tênis:', error);
    }
  }

  // Exibe os tênis no grid
  function displaySneakers(sneakers) {
    sneakersContainer.innerHTML = '';
    
    if (sneakers.length === 0) {
      sneakersContainer.innerHTML = '<p class="no-results">Nenhum tênis encontrado</p>';
      return;
    }
    
    sneakers.forEach(sneaker => {
      const sneakerCard = document.createElement('div');
      sneakerCard.className = 'sneaker-card';
      
      sneakerCard.innerHTML = `
        ${sneaker.imagem ? `<img src="${sneaker.imagem}" alt="${sneaker.marca} ${sneaker.modelo}" class="sneaker-img">` : 
          '<div class="sneaker-img no-image"><i class="fas fa-image"></i></div>'}
        <div class="sneaker-info">
          <h3 class="sneaker-title">${sneaker.modelo}</h3>
          <p class="sneaker-brand">${sneaker.marca}</p>
          <div class="sneaker-details">
            <span>Tamanho: ${sneaker.tamanho}</span>
            <span>${sneaker.anoLancamento}</span>
          </div>
          <p class="sneaker-price">R$ ${sneaker.preco.toFixed(2)}</p>
          <div class="sneaker-actions">
            <button class="btn-edit" data-id="${sneaker.id}">Editar</button>
            <button class="btn-delete" data-id="${sneaker.id}">Excluir</button>
          </div>
        </div>
        ${sneaker.disponivel ? '<span class="availability">Disponível</span>' : 
          '<span class="availability" style="background-color: var(--gray-color)">Indisponível</span>'}
      `;
      
      sneakersContainer.appendChild(sneakerCard);
    });
    
    // Adiciona eventos aos botões de editar e excluir
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => editSneaker(e.target.dataset.id));
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => deleteSneaker(e.target.dataset.id));
    });
  }

  // Pesquisa tênis
  function searchSneakers() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredSneakers = allSneakers.filter(sneaker => 
      sneaker.modelo.toLowerCase().includes(searchTerm) || 
      sneaker.marca.toLowerCase().includes(searchTerm) ||
      sneaker.cor.toLowerCase().includes(searchTerm)
    );
    displaySneakers(filteredSneakers);
  }

  // Abre o modal para adicionar/editar
  function openModal(editing = false, sneaker = null) {
    isEditing = editing;
    
    if (editing && sneaker) {
      modalTitle.textContent = 'Editar Tênis';
      document.getElementById('sneakerId').value = sneaker.id;
      document.getElementById('marca').value = sneaker.marca;
      document.getElementById('modelo').value = sneaker.modelo;
      document.getElementById('tamanho').value = sneaker.tamanho;
      document.getElementById('cor').value = sneaker.cor;
      document.getElementById('preco').value = sneaker.preco;
      document.getElementById('anoLancamento').value = sneaker.anoLancamento;
      document.getElementById('descricao').value = sneaker.descricao || '';
      document.getElementById('imagem').value = sneaker.imagem || '';
      document.getElementById('disponivel').checked = sneaker.disponivel;
    } else {
      modalTitle.textContent = 'Adicionar Novo Tênis';
      sneakerForm.reset();
    }
    
    sneakerModal.style.display = 'block';
  }

  // Fecha o modal
  function closeModalFunc() {
    sneakerModal.style.display = 'none';
  }

  // Edita um tênis
  async function editSneaker(id) {
    try {
      const response = await fetch(`http://localhost:3000/tenis/${id}`);
      const sneaker = await response.json();
      openModal(true, sneaker);
    } catch (error) {
      console.error('Erro ao carregar tênis para edição:', error);
    }
  }

  // Deleta um tênis
  async function deleteSneaker(id) {
    if (!confirm('Tem certeza que deseja excluir este tênis?')) return;
    
    try {
      await fetch(`http://localhost:3000/tenis/${id}`, {
        method: 'DELETE'
      });
      loadSneakers();
    } catch (error) {
      console.error('Erro ao excluir tênis:', error);
    }
  }

  // Envia o formulário (adicionar/editar)
  async function handleSubmit(e) {
    e.preventDefault();
    
    const sneakerData = {
      marca: document.getElementById('marca').value,
      modelo: document.getElementById('modelo').value,
      tamanho: parseFloat(document.getElementById('tamanho').value),
      cor: document.getElementById('cor').value,
      preco: parseFloat(document.getElementById('preco').value),
      anoLancamento: parseInt(document.getElementById('anoLancamento').value),
      descricao: document.getElementById('descricao').value,
      imagem: document.getElementById('imagem').value,
      disponivel: document.getElementById('disponivel').checked
    };
    
    try {
      if (isEditing) {
        const id = document.getElementById('sneakerId').value;
        // Para simplificar, estamos fazendo DELETE + POST
        // Em uma aplicação real, usaríamos PUT ou PATCH
        await fetch(`http://localhost:3000/tenis/${id}`, {
          method: 'DELETE'
        });
      }
      
      const response = await fetch('http://localhost:3000/tenis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sneakerData)
      });
      
      if (response.ok) {
        closeModalFunc();
        loadSneakers();
      }
    } catch (error) {
      console.error('Erro ao salvar tênis:', error);
    }
  }

  // Event Listeners
  searchBtn.addEventListener('click', searchSneakers);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') searchSneakers();
  });
  
  addBtn.addEventListener('click', () => openModal(false));
  closeModal.addEventListener('click', closeModalFunc);
  window.addEventListener('click', (e) => {
    if (e.target === sneakerModal) closeModalFunc();
  });
  
  sneakerForm.addEventListener('submit', handleSubmit);

  // Inicializa a aplicação
  loadSneakers();
});