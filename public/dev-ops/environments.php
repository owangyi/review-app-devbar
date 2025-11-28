<?php
/**
 * GitLab Branches API
 * Fetches available branches for frontend and backend projects
 * Implements 60-second caching to reduce API calls
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Configuration from environment variables
$gitlabApiUrl = getenv('GITLAB_API_URL') ?: 'https://gitlab.com/api/v4';
$gitlabToken = getenv('GITLAB_ACCESS_TOKEN');
$frontendProjectId = getenv('FRONTEND_PROJECT_ID');
$backendProjectId = getenv('BACKEND_PROJECT_ID');

// Cache configuration
$cacheFile = '/tmp/env_cache.json';
$cacheLifetime = 60; // 60 seconds

/**
 * Check if cache is valid
 */
function isCacheValid($cacheFile, $cacheLifetime) {
    if (!file_exists($cacheFile)) {
        return false;
    }
    
    $cacheTime = filemtime($cacheFile);
    return (time() - $cacheTime) < $cacheLifetime;
}

/**
 * Fetch branches from GitLab API
 */
function fetchBranches($gitlabApiUrl, $projectId, $token) {
    $url = "{$gitlabApiUrl}/projects/{$projectId}/repository/branches";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "PRIVATE-TOKEN: {$token}",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        error_log("GitLab API error: HTTP {$httpCode} for project {$projectId}");
        return [];
    }
    
    return json_decode($response, true) ?: [];
}

/**
 * Categorize branches into main and feature
 */
function categorizeBranches($branches) {
    $mainBranches = ['main', 'master', 'staging', 'production'];
    $excludedBranches = ['master']; // 排除的分支
    $result = [
        'main' => [],
        'feature' => []
    ];
    
    foreach ($branches as $branch) {
        $branchName = $branch['name'] ?? '';
        
        // 跳过被排除的分支
        if (in_array($branchName, $excludedBranches)) {
            continue;
        }
        
        if (in_array($branchName, $mainBranches)) {
            $result['main'][] = $branchName;
        } else {
            $result['feature'][] = $branchName;
        }
    }
    
    return $result;
}

/**
 * Main execution
 */
try {
    // Validate configuration
    if (empty($gitlabToken)) {
        throw new Exception('GITLAB_ACCESS_TOKEN not configured');
    }
    
    if (empty($frontendProjectId) || empty($backendProjectId)) {
        throw new Exception('Project IDs not configured');
    }
    
    // Check cache
    if (isCacheValid($cacheFile, $cacheLifetime)) {
        $cachedData = file_get_contents($cacheFile);
        echo $cachedData;
        exit;
    }
    
    // Fetch branches for both projects
    $frontendBranches = fetchBranches($gitlabApiUrl, $frontendProjectId, $gitlabToken);
    $backendBranches = fetchBranches($gitlabApiUrl, $backendProjectId, $gitlabToken);
    
    // Categorize branches
    $response = [
        'frontend' => categorizeBranches($frontendBranches),
        'backend' => categorizeBranches($backendBranches),
        'cached' => false,
        'timestamp' => date('c')
    ];
    
    // Save to cache
    $jsonResponse = json_encode($response, JSON_PRETTY_PRINT);
    file_put_contents($cacheFile, $jsonResponse);
    
    echo $jsonResponse;
    
} catch (Exception $e) {
    // Return minimal fallback data on error
    http_response_code(200); // Still return 200 to prevent breaking the UI
    echo json_encode([
        'frontend' => [
            'main' => ['main'],
            'feature' => []
        ],
        'backend' => [
            'main' => ['main'],
            'feature' => []
        ],
        'error' => $e->getMessage()
    ]);
}

