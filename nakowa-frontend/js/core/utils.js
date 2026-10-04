export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0
    }).format(amount);
};

export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
};

export const calculatePaymentStatus = (total, paid) => {
    if (paid === 0) return { label: 'NON PAYÉ', class: 'status-danger', color: 'red' };
    if (paid < total) return { label: 'PARTIEL', class: 'status-warning', color: 'orange' };
    return { label: 'PAYÉ', class: 'status-success', color: 'green' };
};

export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};
