<?php
/**
 * Temporary reverse proxy for Ploi PHP vhosts until nginx is switched to Node.js.
 * Forwards all non-static requests to the Next.js server on port 3000.
 */
declare(strict_types=1);

$targetBase = 'http://127.0.0.1:3000';
$uri = $_SERVER['REQUEST_URI'] ?? '/';
$url = $targetBase . $uri;

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$body = in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)
    ? file_get_contents('php://input')
    : null;

$headers = [];
// Never ask Next.js for gzip — PHP/nginx will compress for the client once.
$skip = ['host', 'connection', 'content-length', 'transfer-encoding', 'accept-encoding'];
foreach ($_SERVER as $key => $value) {
    if (!str_starts_with($key, 'HTTP_')) {
        continue;
    }
    $name = strtolower(str_replace('_', '-', substr($key, 5)));
    if (in_array($name, $skip, true)) {
        continue;
    }
    $headers[] = str_replace(' ', '-', ucwords(str_replace('-', ' ', $name))) . ': ' . $value;
}
$headers[] = 'X-Forwarded-Proto: ' . ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http');
$headers[] = 'X-Forwarded-Host: ' . ($_SERVER['HTTP_HOST'] ?? 'salonora.eu');
$headers[] = 'X-Real-IP: ' . ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_TIMEOUT => 120,
    CURLOPT_ENCODING => '',
]);
if ($body !== null && $body !== '') {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

$response = curl_exec($ch);
if ($response === false) {
    http_response_code(502);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Bad Gateway: Next.js unreachable on port 3000';
    exit;
}

$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = (int) curl_getinfo($ch, CURLINFO_HEADER_SIZE);
curl_close($ch);

$rawHeaders = substr($response, 0, $headerSize);
$bodyOut = substr($response, $headerSize);

http_response_code($status);

$hopByHop = ['connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'transfer-encoding', 'upgrade', 'content-encoding'];
foreach (preg_split("/\r\n|\n|\r/", $rawHeaders) as $line) {
    if ($line === '' || str_starts_with($line, 'HTTP/')) {
        continue;
    }
    $parts = explode(':', $line, 2);
    if (count($parts) !== 2) {
        continue;
    }
    $name = strtolower(trim($parts[0]));
    if (in_array($name, $hopByHop, true)) {
        continue;
    }
    header(trim($parts[0]) . ': ' . trim($parts[1]), false);
}

echo $bodyOut;
