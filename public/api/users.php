<?php
/**
 * User Management API
 * Provides user list and status toggle functionality
 */

header('Content-Type: application/json');
// CORS headers are handled by Nginx, no need to set them here

// Mock user data storage file
$dataFile = '/tmp/users_data.json';

/**
 * Get current backend branch from hostname
 */
function getCurrentBranch() {
    $hostname = $_SERVER['HTTP_HOST'] ?? 'develop.api.discovery.wang';
    // Handle both "branch.api.discovery.wang" and "branch.discovery.wang" formats
    $parts = explode('.', $hostname);
    return $parts[0];
}

/**
 * Initialize default user data based on backend branch
 * Different branches return different user sets to demonstrate backend switching
 */
function getDefaultUsers() {
    // Get current backend branch from hostname
    $branch = getCurrentBranch();
    
    // Base user data
    $baseUsers = [
        'develop' => [
            ['id' => 1, 'name' => 'Alice Johnson (Dev)', 'email' => 'alice@dev.com', 'role' => 'Admin', 'status' => 'Active'],
            ['id' => 2, 'name' => 'Bob Smith (Dev)', 'email' => 'bob@dev.com', 'role' => 'User', 'status' => 'Active'],
            ['id' => 3, 'name' => 'Charlie Brown (Dev)', 'email' => 'charlie@dev.com', 'role' => 'Moderator', 'status' => 'Inactive'],
            ['id' => 4, 'name' => 'Diana Prince (Dev)', 'email' => 'diana@dev.com', 'role' => 'User', 'status' => 'Active'],
            ['id' => 5, 'name' => 'Edward Norton (Dev)', 'email' => 'edward@dev.com', 'role' => 'User', 'status' => 'Active']
        ],
        'feature-dev-001-say-hello-world' => [
            ['id' => 1, 'name' => 'Alex Chen (F001)', 'email' => 'alex@f001.com', 'role' => 'Admin', 'status' => 'Active'],
            ['id' => 2, 'name' => 'Barbara Lee (F001)', 'email' => 'barbara@f001.com', 'role' => 'User', 'status' => 'Active'],
            ['id' => 3, 'name' => 'Carlos Rodriguez (F001)', 'email' => 'carlos@f001.com', 'role' => 'User', 'status' => 'Active'],
            ['id' => 4, 'name' => 'Diana Martinez (F001)', 'email' => 'diana@f001.com', 'role' => 'Moderator', 'status' => 'Active'],
            ['id' => 5, 'name' => 'Eric Wang (F001)', 'email' => 'eric@f001.com', 'role' => 'Admin', 'status' => 'Active'],
            ['id' => 6, 'name' => 'Fiona O\'Brien (F001)', 'email' => 'fiona@f001.com', 'role' => 'User', 'status' => 'Inactive'],
            ['id' => 7, 'name' => 'George Park (F001)', 'email' => 'george@f001.com', 'role' => 'User', 'status' => 'Active']
        ],
        'feature-dev-002-update-hello-world' => [
            ['id' => 1, 'name' => 'Anna Schmidt (F002)', 'email' => 'anna@f002.com', 'role' => 'Admin', 'status' => 'Active'],
            ['id' => 2, 'name' => 'Benjamin Kim (F002)', 'email' => 'benjamin@f002.com', 'role' => 'User', 'status' => 'Active'],
            ['id' => 3, 'name' => 'Catherine Liu (F002)', 'email' => 'catherine@f002.com', 'role' => 'Admin', 'status' => 'Active'],
            ['id' => 4, 'name' => 'David Anderson (F002)', 'email' => 'david@f002.com', 'role' => 'User', 'status' => 'Inactive'],
            ['id' => 5, 'name' => 'Emma Taylor (F002)', 'email' => 'emma@f002.com', 'role' => 'User', 'status' => 'Active'],
            ['id' => 6, 'name' => 'Frank Zhang (F002)', 'email' => 'frank@f002.com', 'role' => 'Moderator', 'status' => 'Active'],
            ['id' => 7, 'name' => 'Grace Wilson (F002)', 'email' => 'grace@f002.com', 'role' => 'User', 'status' => 'Active'],
            ['id' => 8, 'name' => 'Henry Davis (F002)', 'email' => 'henry@f002.com', 'role' => 'User', 'status' => 'Active'],
            ['id' => 9, 'name' => 'Iris Johnson (F002)', 'email' => 'iris@f002.com', 'role' => 'Admin', 'status' => 'Active']
        ]
    ];
    
    // Return users for the specific branch, or default set
    if (isset($baseUsers[$branch])) {
        return $baseUsers[$branch];
    }
    
    // For other feature branches, generate a generic set with branch identifier
    return [
        ['id' => 1, 'name' => "User A ($branch)", 'email' => "usera@$branch.com", 'role' => 'Admin', 'status' => 'Active'],
        ['id' => 2, 'name' => "User B ($branch)", 'email' => "userb@$branch.com", 'role' => 'User', 'status' => 'Active'],
        ['id' => 3, 'name' => "User C ($branch)", 'email' => "userc@$branch.com", 'role' => 'User', 'status' => 'Active'],
        ['id' => 4, 'name' => "User D ($branch)", 'email' => "userd@$branch.com", 'role' => 'Moderator', 'status' => 'Inactive'],
        ['id' => 5, 'name' => "User E ($branch)", 'email' => "usere@$branch.com", 'role' => 'User', 'status' => 'Active'],
        ['id' => 6, 'name' => "User F ($branch)", 'email' => "userf@$branch.com", 'role' => 'User', 'status' => 'Active']
    ];
}

/**
 * Clean up old data files from previous branch naming scheme
 * This helps when branch names change (e.g., feature-dev-001 -> feature-dev-001-say-hello-world)
 */
function cleanupOldDataFiles() {
    $oldBranchNames = ['feature-dev-001', 'feature-dev-002'];
    foreach ($oldBranchNames as $oldBranch) {
        $oldFile = "/tmp/users_data_{$oldBranch}.json";
        if (file_exists($oldFile)) {
            @unlink($oldFile);
        }
    }
}

/**
 * Load users from storage
 * Each backend branch has its own data file
 */
function loadUsers($dataFile) {
    // Get current backend branch
    $branch = getCurrentBranch();
    
    // Use branch-specific data file
    $branchDataFile = "/tmp/users_data_{$branch}.json";
    
    // Clean up old data files on first load (one-time cleanup)
    static $cleanupDone = false;
    if (!$cleanupDone) {
        cleanupOldDataFiles();
        $cleanupDone = true;
    }
    
    if (!file_exists($branchDataFile)) {
        $users = getDefaultUsers();
        saveUsers($branchDataFile, $users);
        return $users;
    }
    
    $content = file_get_contents($branchDataFile);
    if ($content === false || trim($content) === '') {
        // File exists but is empty, reinitialize with default data
        $users = getDefaultUsers();
        saveUsers($branchDataFile, $users);
        return $users;
    }
    
    $users = json_decode($content, true);
    
    // Check if JSON decode failed (null) or returned invalid data (not an array)
    // Note: We allow empty arrays as valid data (though unlikely in this use case)
    if ($users === null || !is_array($users)) {
        // JSON decode failed or invalid data, reinitialize with default data
        $users = getDefaultUsers();
        saveUsers($branchDataFile, $users);
        return $users;
    }
    
    return $users;
}

/**
 * Save users to storage
 */
function saveUsers($dataFile, $users) {
    file_put_contents($dataFile, json_encode($users, JSON_PRETTY_PRINT));
}

/**
 * Handle GET request - return user list
 */
function handleGet($dataFile) {
    $users = loadUsers($dataFile);
    
    // Get current backend branch info
    $branch = getCurrentBranch();
    
    echo json_encode([
        'success' => true,
        'users' => $users,
        'count' => count($users),
        'backend_branch' => $branch,
        'timestamp' => date('c')
    ], JSON_PRETTY_PRINT);
}

/**
 * Handle POST request - toggle user status
 */
function handlePost($dataFile) {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!isset($data['action']) || $data['action'] !== 'toggle_status') {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid action'
        ]);
        return;
    }
    
    if (!isset($data['user_id'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'user_id is required'
        ]);
        return;
    }
    
    $userId = (int)$data['user_id'];
    
    // Get current backend branch
    $branch = getCurrentBranch();
    $branchDataFile = "/tmp/users_data_{$branch}.json";
    
    $users = loadUsers($dataFile);
    
    // Find and toggle the user status
    $found = false;
    foreach ($users as &$user) {
        if ($user['id'] === $userId) {
            $user['status'] = ($user['status'] === 'Active') ? 'Inactive' : 'Active';
            $found = true;
            break;
        }
    }
    
    if (!$found) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'User not found'
        ]);
        return;
    }
    
    saveUsers($branchDataFile, $users);
    
    echo json_encode([
        'success' => true,
        'message' => 'User status updated',
        'backend_branch' => $branch,
        'timestamp' => date('c')
    ], JSON_PRETTY_PRINT);
}

/**
 * Main execution
 */
try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            handleGet($dataFile);
            break;
            
        case 'POST':
            handlePost($dataFile);
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Method not allowed'
            ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

