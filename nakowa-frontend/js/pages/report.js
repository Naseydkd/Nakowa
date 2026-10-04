export const reportPage = {
    render() {
        return `
            <div class="page-header">
                <div class="page-title">
                    <h1>Sales Report</h1>
                    <div class="page-subtitle">Friday, October 12th 2025</div>
                </div>
                <div class="page-controls">
                    <select class="stat-badge" style="padding: 5px; border: 1px solid var(--border-color); border-radius: 4px;">
                        <option>Today</option>
                        <option>Yesterday</option>
                        <option>Last 7 Days</option>
                    </select>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon"><i class="fa-solid fa-wallet"></i></div>
                        <span class="stat-badge badge-success">+20.9%</span>
                    </div>
                    <div class="stat-value">$619,000</div>
                    <div class="stat-label">Total Sales <span style="font-size: 11px; color: var(--text-muted);">Products vs Last Month</span></div>
                </div>
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon"><i class="fa-solid fa-cart-shopping"></i></div>
                        <span class="stat-badge badge-success">+10.9%</span>
                    </div>
                    <div class="stat-value">1,000</div>
                    <div class="stat-label">Total Orders <span style="font-size: 11px; color: var(--text-muted);">Orders vs Last Month</span></div>
                </div>
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon"><i class="fa-solid fa-user"></i></div>
                        <span class="stat-badge badge-danger">-10.2%</span>
                    </div>
                    <div class="stat-value">2003.67</div>
                    <div class="stat-label">Total Visitors <span style="font-size: 11px; color: var(--text-muted);">Users vs Last Month</span></div>
                </div>
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon"><i class="fa-solid fa-box-open"></i></div>
                        <span class="stat-badge badge-success">+20.9%</span>
                    </div>
                    <div class="stat-value">3,000</div>
                    <div class="stat-label">Total Products Sold <span style="font-size: 11px; color: var(--text-muted);">Products vs Last Month</span></div>
                </div>
            </div>

            <div class="dashboard-main-grid">
                <div class="chart-card">
                    <h3>Customer Habits</h3>
                    <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">Track your customers habit</p>
                    <div style="display: flex; gap: 10px; margin-bottom: 20px; font-size: 12px;">
                        <span style="display: flex; align-items: center; gap: 5px;"><span style="width: 8px; height: 8px; background: var(--primary-color); border-radius: 50%;"></span> Seen Products</span>
                        <span style="display: flex; align-items: center; gap: 5px;"><span style="width: 8px; height: 8px; background: #a0c4ff; border-radius: 50%;"></span> Sales</span>
                    </div>
                    <canvas id="habitsChart"></canvas>
                </div>
                <div class="chart-card">
                    <h3>Product Statistic</h3>
                    <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">Track your product sales</p>
                    <canvas id="productChart"></canvas>
                    <div class="customer-growth-list">
                        <div class="growth-item">
                            <span style="font-size: 14px;">Electronics</span>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <span style="font-weight: 600;">2,487</span>
                                <span class="stat-badge badge-success" style="font-size: 10px;">+1.9%</span>
                            </div>
                        </div>
                        <div class="growth-item">
                            <span style="font-size: 14px;">Games</span>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <span style="font-weight: 600;">1,828</span>
                                <span class="stat-badge badge-success" style="font-size: 10px;">+2.9%</span>
                            </div>
                        </div>
                        <div class="growth-item">
                            <span style="font-size: 14px;">Furniture</span>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <span style="font-weight: 600;">1,463</span>
                                <span class="stat-badge badge-danger" style="font-size: 10px;">-3.0%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="dashboard-main-grid" style="grid-template-columns: 1fr 2fr;">
                 <div class="upgrade-card">
                    <h3>Upgrade Pro</h3>
                    <p>Discover the benefit of an upgraded account</p>
                    <a href="#" class="btn-upgrade">Upgrade $580</a>
                </div>
                <div class="chart-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div>
                            <h3>Customer Growth</h3>
                            <p style="color: var(--text-muted); font-size: 13px;">Track your customers by location</p>
                        </div>
                        <select class="stat-badge" style="padding: 5px; border: 1px solid var(--border-color); border-radius: 4px;">
                            <option>Today</option>
                        </select>
                    </div>
                    <div style="display: flex; align-items: center; gap: 40px;">
                        <canvas id="growthChart" style="max-width: 300px;"></canvas>
                        <div class="customer-growth-list" style="flex: 1; border: none;">
                            <div class="growth-item" style="border: none;">
                                <div class="growth-info">
                                    <span class="country-dot" style="background: #006d44;"></span>
                                    <span>United States</span>
                                </div>
                                <span style="font-weight: 600;">17%</span>
                            </div>
                            <div class="growth-item" style="border: none;">
                                <div class="growth-info">
                                    <span class="country-dot" style="background: #2d3436;"></span>
                                    <span>Germany</span>
                                </div>
                                <span style="font-weight: 600;">87%</span>
                            </div>
                            <div class="growth-item" style="border: none;">
                                <div class="growth-info">
                                    <span class="country-dot" style="background: #a0c4ff;"></span>
                                    <span>Australia</span>
                                </div>
                                <span style="font-weight: 600;">57%</span>
                            </div>
                            <div class="growth-item" style="border: none;">
                                <div class="growth-info">
                                    <span class="country-dot" style="background: #ffc107;"></span>
                                    <span>France</span>
                                </div>
                                <span style="font-weight: 600;">37%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    afterRender() {
        this.initCharts();
    },
    initCharts() {
        // Customer Habits Chart
        const habitsCtx = document.getElementById('habitsChart')?.getContext('2d');
        if (habitsCtx) {
            new Chart(habitsCtx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Seen Products',
                        data: [15, 30, 25, 10, 40, 20],
                        backgroundColor: '#006d44',
                        borderRadius: 20
                    }, {
                        label: 'Sales',
                        data: [10, 20, 15, 5, 25, 12],
                        backgroundColor: '#a0c4ff',
                        borderRadius: 20
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { display: false }, ticks: { callback: v => v + 'K' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // Product Statistic Chart
        const productCtx = document.getElementById('productChart')?.getContext('2d');
        if (productCtx) {
            new Chart(productCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Electronics', 'Games', 'Furniture'],
                    datasets: [{
                        data: [2487, 1828, 1463],
                        backgroundColor: ['#006d44', '#2d3436', '#a0c4ff'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    cutout: '70%'
                }
            });
        }

        // Growth Chart
        const growthCtx = document.getElementById('growthChart')?.getContext('2d');
        if (growthCtx) {
            new Chart(growthCtx, {
                type: 'doughnut',
                data: {
                    labels: ['USA', 'Germany', 'Australia', 'France'],
                    datasets: [{
                        data: [17, 87, 57, 37],
                        backgroundColor: ['#006d44', '#2d3436', '#a0c4ff', '#ffc107'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    cutout: '70%'
                }
            });
        }
    }
};
