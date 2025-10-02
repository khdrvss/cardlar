export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const fs = require('fs').promises;
  const path = require('path');
  const dataPath = path.join(process.cwd(), 'api', 'companies.json');

  try {
    // Helper function to read data
    const readData = async () => {
      const data = await fs.readFile(dataPath, 'utf8');
      return JSON.parse(data);
    };

    // Helper function to write data
    const writeData = async (data) => {
      await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
    };

    switch (req.method) {
      case 'GET':
        // Get all companies
        const data = await readData();
        return res.status(200).json(data.companies);

      case 'POST':
        // Add new company
        const newCompany = req.body;
        newCompany.id = 'company_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        newCompany.createdAt = new Date().toISOString();
        
        const postData = await readData();
        postData.companies.push(newCompany);
        await writeData(postData);
        
        return res.status(201).json(newCompany);

      case 'PUT':
        // Update company
        const { id } = req.query;
        const updatedCompany = req.body;
        
        const putData = await readData();
        const index = putData.companies.findIndex(c => c.id === id);
        
        if (index === -1) {
          return res.status(404).json({ error: 'Company not found' });
        }
        
        putData.companies[index] = { ...putData.companies[index], ...updatedCompany };
        await writeData(putData);
        
        return res.status(200).json(putData.companies[index]);

      case 'DELETE':
        // Delete company
        const { id: deleteId } = req.query;
        
        const deleteData = await readData();
        const initialLength = deleteData.companies.length;
        deleteData.companies = deleteData.companies.filter(c => c.id !== deleteId);
        
        if (deleteData.companies.length === initialLength) {
          return res.status(404).json({ error: 'Company not found' });
        }
        
        await writeData(deleteData);
        return res.status(200).json({ message: 'Company deleted successfully' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}