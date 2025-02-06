const { execSync } = require('child_process');

try {
    // Run npm run build in the client directory
//     console.log('Building client...');
//     execSync('cd ./client && npm run build1', { stdio: 'inherit' });

//    // Move back to the root directory
//    console.log('Moving back to the root directory...');
//    execSync('cd ..', { stdio: 'inherit' });

   // Add changes to Git
   console.log('Staging changes...');
   execSync('git add .', { stdio: 'inherit' });

   // Commit changes to Git
   console.log('Committing changes...');
   execSync('git commit -m "draft1.6"', { stdio: 'inherit' });

   // Push changes to the repository
   console.log('Pushing changes to the repository...');
   execSync('git push origin master', { stdio: 'inherit' });

} catch (error) {
    console.error('Error occurred:', error.message);
}
