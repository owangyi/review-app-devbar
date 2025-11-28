<?php
/**
 * Statistics API
 * Provides dashboard statistics and metrics
 */

header('Content-Type: application/json');
// CORS headers are handled by Nginx, no need to set them here

/**
 * Generate statistics data based on backend branch
 * Different branches return significantly different data to demonstrate backend switching
 */
function generateStatistics() {
    // Get current backend branch from hostname or default
    $hostname = $_SERVER['HTTP_HOST'] ?? 'develop.api.discovery.wang';
    $branch = explode('.', $hostname)[0];
    
    // Define distinct data sets for each branch
    $branchData = [
        'develop' => [
            'total_users' => 1000,
            'active_users' => 750,
            'total_revenue' => 35000,
            'orders_today' => 85,
            'growth_rate' => 8.5,
            'server_status' => 'Healthy'
        ],
        'feature-dev-001' => [
            'total_users' => 1500,
            'active_users' => 1200,
            'total_revenue' => 52000,
            'orders_today' => 145,
            'growth_rate' => 15.3,
            'server_status' => 'Healthy'
        ],
        'feature-dev-002' => [
            'total_users' => 2200,
            'active_users' => 1850,
            'total_revenue' => 78000,
            'orders_today' => 235,
            'growth_rate' => 22.7,
            'server_status' => 'Healthy'
        ]
    ];
    
    // If branch has predefined data, use it with small random variation
    if (isset($branchData[$branch])) {
        $data = $branchData[$branch];
        // Add small random variation (±5%) to simulate real-time changes
        $data['total_users'] += mt_rand(-50, 50);
        $data['active_users'] += mt_rand(-30, 30);
        $data['total_revenue'] += mt_rand(-1000, 1000);
        $data['orders_today'] += mt_rand(-5, 10);
        $data['growth_rate'] = round($data['growth_rate'] + mt_rand(-10, 10) / 10, 1);
        
        return $data;
    }
    
    // For other branches, generate data based on branch name hash
    $seed = crc32($branch);
    mt_srand($seed);
    
    $baseUsers = 1000 + ($seed % 1000);
    $totalUsers = $baseUsers + mt_rand(-50, 50);
    $activeUsers = (int)($totalUsers * (0.7 + mt_rand(0, 20) / 100));
    $totalRevenue = ($baseUsers * 40) + mt_rand(-2000, 5000);
    $ordersToday = (int)($totalUsers / 10) + mt_rand(-10, 20);
    $growthRate = round(10 + mt_rand(-30, 50) / 10, 1);
    
    $statuses = ['Healthy', 'Healthy', 'Warning'];
    $serverStatus = $statuses[mt_rand(0, count($statuses) - 1)];
    
    return [
        'total_users' => $totalUsers,
        'active_users' => $activeUsers,
        'total_revenue' => $totalRevenue,
        'orders_today' => $ordersToday,
        'growth_rate' => $growthRate,
        'server_status' => $serverStatus
    ];
}

/**
 * Get additional metrics
 */
function getAdditionalMetrics() {
    return [
        'response_time_ms' => mt_rand(50, 200),
        'uptime_percentage' => round(99.5 + mt_rand(0, 50) / 100, 2),
        'error_rate' => round(mt_rand(1, 50) / 100, 2),
        'cache_hit_rate' => round(85 + mt_rand(0, 10), 1)
    ];
}

/**
 * Main execution
 */
try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'error' => 'Method not allowed'
        ]);
        exit;
    }
    
    $stats = generateStatistics();
    $metrics = getAdditionalMetrics();
    
    // Get current branch info for response
    $hostname = $_SERVER['HTTP_HOST'] ?? 'main.api.discovery.wang';
    $branch = explode('.', $hostname)[0];
    
    echo json_encode([
        'success' => true,
        'stats' => $stats,
        'metrics' => $metrics,
        'branch' => $branch,
        'timestamp' => date('c'),
        'server_time' => time()
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'stats' => [
            'total_users' => 0,
            'active_users' => 0,
            'total_revenue' => 0,
            'orders_today' => 0,
            'growth_rate' => 0,
            'server_status' => 'Error'
        ]
    ]);
}

