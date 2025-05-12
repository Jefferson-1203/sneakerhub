const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'tenis.json');

app.use(cors());
app.use(express.json());

// Garantir que o arquivo de dados existe
async function initializeData() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([]));
  }
}

// GET /tenis - Lista todos os tênis
app.get('/tenis', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const tenis = JSON.parse(data);
    res.json(tenis);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler os dados' });
  }
});

// GET /tenis/:id - Obtém um tênis específico
app.get('/tenis/:id', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const tenis = JSON.parse(data);
    const tenisEncontrado = tenis.find(t => t.id === req.params.id);
    
    if (tenisEncontrado) {
      res.json(tenisEncontrado);
    } else {
      res.status(404).json({ error: 'Tênis não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler os dados' });
  }
});

// POST /tenis - Adiciona um novo tênis
app.post('/tenis', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const tenis = JSON.parse(data);
    
    const novoTenis = {
      id: Date.now().toString(),
      ...req.body
    };
    
    tenis.push(novoTenis);
    await fs.writeFile(DATA_FILE, JSON.stringify(tenis, null, 2));
    
    res.status(201).json(novoTenis);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar os dados' });
  }
});

// DELETE /tenis/:id - Remove um tênis
app.delete('/tenis/:id', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    let tenis = JSON.parse(data);
    const index = tenis.findIndex(t => t.id === req.params.id);
    
    if (index !== -1) {
      const [tenisRemovido] = tenis.splice(index, 1);
      await fs.writeFile(DATA_FILE, JSON.stringify(tenis, null, 2));
      res.json(tenisRemovido);
    } else {
      res.status(404).json({ error: 'Tênis não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar os dados' });
  }
});

// Inicializa o servidor
async function startServer() {
  await initializeData();
  
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();