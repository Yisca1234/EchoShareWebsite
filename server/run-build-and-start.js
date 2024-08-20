const { execSync } = require('child_process');

try {
    // Run npm run build in the client directory
    console.log('Building client...');
    execSync('cd ../client && npm run build1', { stdio: 'inherit' });

    // Run npm start in the server directory
    console.log('Starting server...');
    execSync('cd ../server && npm start', { stdio: 'inherit' });

    console.log('Build and start complete.');
} catch (error) {
    console.error('Error occurred:', error.message);
}
