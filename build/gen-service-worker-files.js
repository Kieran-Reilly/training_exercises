const ignoreFiles = ["robots.txt", "Caddyfile", "crs-applicaion-template-3.iml"];
const ignoreFolders = ["build", "dist", ".idea", ".git"];

/**
 * This is a deno function that generates a list of files to cache.
 * This function runs through the application and generates a list of files to cache.
 * The result is an array of strings that can be used in the service worker.
 * This will process the root folder and all other folders recursively but exclude the build and dist folders.
 * This function is recursive as it walks through the folders.
 */
function generateServiceWorkerFiles(folder) {
    // If the folder is not specified, use the current folder.
    if (!folder) {
        folder = "./";
    }

    // Get a list of files and folders in the current folder.
    const files = Deno.readDirSync(folder);

    // Create an array to store the files to cache.
    const result = [];

    // Loop through the files and folders.
    for (const file of files) {
        // If the file is a folder, process it recursively.
        if (file.isDirectory) {
            // If the folder is in the ignore list, skip it.
            if (ignoreFolders.includes(file.name)) {
                continue;
            }

            // Get the files in the folder.
            const folderFiles = generateServiceWorkerFiles(`${folder}${file.name}/`);

            // Add the files to the result.
            result.push(...folderFiles);
        } else {
            // If the file is in the ignore list, skip it.
            if (ignoreFiles.includes(file.name)) {
                continue;
            }

            // Add the file to the result.
            result.push(`${folder}${file.name}`.replace("./", "/"));
        }
    }

    // Return the result.
    return result;
}

/**
 * Generate the source code for the service worker files.
 * @type {string}
 */
const code = `
const urlsToCache = [
    "/",
    ${generateServiceWorkerFiles().map(file => {
        if (file.startsWith("/")) {
            return `"${file.substring(1)}"`;
        }
    }).join(",\n    ")}
];

const CACHE_NAME = 'your-cache-name';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    )
});

// Service Worker Activation
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    // Remove outdated caches
                    // Modify 'your-cache-name' if you change the cache name in the install event
                    return cacheName !== CACHE_NAME;
                }).map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

// Service Worker Fetch
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});
`

/**
 * Write the source code to the service worker files.
 */
Deno.writeTextFileSync("./service-worker.js", code);