class CompanyManager {
    constructor() {
        this.companies = [];
        this.currentEditId = null;
        this.apiBaseUrl = '/api/companies';
        this.initializeEventListeners();
        this.loadCompanies();
    }

    initializeEventListeners() {
        // Modal controls
        const modal = document.getElementById('modal');
        const addCardBtn = document.getElementById('addCardBtn');
        const closeBtn = document.querySelector('.close');
        const cancelBtn = document.getElementById('cancelBtn');
        const companyForm = document.getElementById('companyForm');

        // Open modal for adding new company
        addCardBtn.addEventListener('click', () => {
            this.openModal();
        });

        // Close modal
        closeBtn.addEventListener('click', () => {
            this.closeModal();
        });

        cancelBtn.addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                this.closeModal();
            }
        });

        // Form submission
        companyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCompany();
        });
    }

    openModal(company = null) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('companyForm');

        if (company) {
            // Editing existing company
            modalTitle.textContent = 'Edit Company';
            this.currentEditId = company.id;
            document.getElementById('companyName').value = company.name;
            document.getElementById('telegramLink').value = company.telegram || '';
            document.getElementById('instagramLink').value = company.instagram || '';
            document.getElementById('websiteLink').value = company.website || '';
        } else {
            // Adding new company
            modalTitle.textContent = 'Add New Company';
            this.currentEditId = null;
            form.reset();
        }

        modal.style.display = 'block';
        setTimeout(() => {
            document.getElementById('companyName').focus();
        }, 100);
    }

    closeModal() {
        const modal = document.getElementById('modal');
        const form = document.getElementById('companyForm');
        
        modal.style.display = 'none';
        form.reset();
        this.currentEditId = null;
    }

    async saveCompany() {
        const formData = new FormData(document.getElementById('companyForm'));
        
        const company = {
            name: formData.get('companyName').trim(),
            telegram: formData.get('telegramLink').trim(),
            instagram: formData.get('instagramLink').trim(),
            website: formData.get('websiteLink').trim()
        };

        // Validation
        if (!company.name) {
            this.showNotification('Company name is required!', 'error');
            return;
        }

        // Validate URLs
        const urlFields = ['telegram', 'instagram', 'website'];
        for (const field of urlFields) {
            if (company[field] && !this.isValidUrl(company[field])) {
                this.showNotification(`Please enter a valid ${field} URL`, 'error');
                return;
            }
        }

        try {
            let response;
            
            if (this.currentEditId) {
                // Update existing company
                response = await fetch(`${this.apiBaseUrl}?id=${this.currentEditId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(company)
                });
                this.showNotification('Company updated successfully!', 'success');
            } else {
                // Add new company
                response = await fetch(this.apiBaseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(company)
                });
                this.showNotification('Company added successfully!', 'success');
            }

            if (!response.ok) {
                throw new Error('Failed to save company');
            }

            await this.loadCompanies();
            this.closeModal();
        } catch (error) {
            console.error('Error saving company:', error);
            this.showNotification('Error saving company. Please try again.', 'error');
        }
    }

    async deleteCompany(id) {
        const company = this.companies.find(c => c.id === id);
        
        if (confirm(`Are you sure you want to delete "${company.name}"?`)) {
            try {
                const response = await fetch(`${this.apiBaseUrl}?id=${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete company');
                }

                await this.loadCompanies();
                this.showNotification('Company deleted successfully!', 'success');
            } catch (error) {
                console.error('Error deleting company:', error);
                this.showNotification('Error deleting company. Please try again.', 'error');
            }
        }
    }

    renderCompanies() {
        const grid = document.getElementById('companiesGrid');
        const emptyState = document.getElementById('emptyState');

        if (this.companies.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        grid.style.display = 'grid';
        
        grid.innerHTML = this.companies.map(company => this.createCompanyCard(company)).join('');

        // Add event listeners to action buttons
        this.attachCardEventListeners();
    }

    createCompanyCard(company) {
        const socialLinks = this.createSocialLinks(company);
        
        return `
            <div class="company-card" data-id="${company.id}">
                <h3>
                    <i class="fas fa-building"></i>
                    ${this.escapeHtml(company.name)}
                </h3>
                
                <div class="social-links">
                    ${socialLinks}
                </div>
                
                <div class="card-actions">
                    <button class="btn-small btn-edit" onclick="companyManager.openModal(companyManager.companies.find(c => c.id === '${company.id}'))">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-small btn-delete" onclick="companyManager.deleteCompany('${company.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    createSocialLinks(company) {
        const links = [];

        if (company.telegram) {
            links.push(`
                <a href="${company.telegram}" target="_blank" rel="noopener noreferrer" class="social-link telegram">
                    <i class="fab fa-telegram-plane"></i>
                    <span>Telegram</span>
                </a>
            `);
        }

        if (company.instagram) {
            links.push(`
                <a href="${company.instagram}" target="_blank" rel="noopener noreferrer" class="social-link instagram">
                    <i class="fab fa-instagram"></i>
                    <span>Instagram</span>
                </a>
            `);
        }

        if (company.website) {
            links.push(`
                <a href="${company.website}" target="_blank" rel="noopener noreferrer" class="social-link website">
                    <i class="fas fa-globe"></i>
                    <span>Website</span>
                </a>
            `);
        }

        if (links.length === 0) {
            links.push(`
                <div class="social-link" style="opacity: 0.6; cursor: default;">
                    <i class="fas fa-info-circle"></i>
                    <span>No social links added</span>
                </div>
            `);
        }

        return links.join('');
    }

    attachCardEventListeners() {
        // Event listeners are already attached via onclick in the HTML
        // This method can be used for additional event handling if needed
    }

    // Utility methods
    generateId() {
        return 'company_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 2000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Data persistence methods
    async loadCompanies() {
        try {
            const response = await fetch(this.apiBaseUrl);
            
            if (!response.ok) {
                throw new Error('Failed to load companies');
            }
            
            this.companies = await response.json();
            this.renderCompanies();
        } catch (error) {
            console.error('Error loading companies:', error);
            this.showNotification('Error loading companies. Using offline mode.', 'error');
            
            // Fallback to localStorage if API fails
            try {
                const saved = localStorage.getItem('companies');
                this.companies = saved ? JSON.parse(saved) : this.getDefaultCompanies();
                this.renderCompanies();
            } catch (localError) {
                this.companies = this.getDefaultCompanies();
                this.renderCompanies();
            }
        }
    }

    // Backup save to localStorage (fallback)
    saveToLocalStorage() {
        try {
            localStorage.setItem('companies', JSON.stringify(this.companies));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    getDefaultCompanies() {
        // Return some example companies for demonstration
        return [
            {
                id: 'demo_1',
                name: 'Tech Solutions Inc.',
                telegram: 'https://t.me/techsolutions',
                instagram: 'https://instagram.com/techsolutions',
                website: 'https://techsolutions.com',
                createdAt: new Date().toISOString()
            },
            {
                id: 'demo_2',
                name: 'Creative Agency',
                telegram: '',
                instagram: 'https://instagram.com/creativeagency',
                website: 'https://creativeagency.com',
                createdAt: new Date().toISOString()
            }
        ];
    }

    // Export/Import functionality
    exportCompanies() {
        const dataStr = JSON.stringify(this.companies, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `companies_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Companies exported successfully!', 'success');
    }

    importCompanies(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedCompanies = JSON.parse(e.target.result);
                this.companies = [...this.companies, ...importedCompanies];
                this.saveCompanies();
                this.renderCompanies();
                this.showNotification('Companies imported successfully!', 'success');
            } catch (error) {
                this.showNotification('Error importing file', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.companyManager = new CompanyManager();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        document.getElementById('addCardBtn').click();
    }
    
    if (e.key === 'Escape') {
        const modal = document.getElementById('modal');
        if (modal.style.display === 'block') {
            companyManager.closeModal();
        }
    }
});

// Add search functionality (bonus feature)
function addSearchFunctionality() {
    const header = document.querySelector('header');
    const searchHTML = `
        <div class="search-container" style="margin-top: 20px;">
            <input type="text" id="searchInput" placeholder="Search companies..." 
                   style="padding: 10px; border-radius: 25px; border: none; width: 300px; max-width: 100%;">
        </div>
    `;
    header.insertAdjacentHTML('beforeend', searchHTML);

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.company-card');
        
        cards.forEach(card => {
            const companyName = card.querySelector('h3').textContent.toLowerCase();
            if (companyName.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Initialize search functionality
setTimeout(addSearchFunctionality, 100);