const { exec } = require('child_process');

const port = 5002;
// Use netstat to find the PID listening on the port
const command = `netstat -ano | findstr :${port}`;

console.log(`Checking port ${port}...`);

exec(command, (err, stdout, stderr) => {
    if (err || !stdout) {
        console.log(`Port ${port} seems free (or command failed).`);
        return;
    }

    // Parse output to find PID
    // Output format: TCP    0.0.0.0:5002           0.0.0.0:0              LISTENING       1234
    const lines = stdout.trim().split('\n');
    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];

        // Ensure PID is a number and not 0
        if (pid && !isNaN(pid) && pid !== '0') {
            console.log(`Found process ${pid} on port ${port}. Killing...`);
            exec(`taskkill /F /PID ${pid}`, (kErr, kOut, kStderr) => {
                if (kErr) {
                    console.error(`Failed to kill PID ${pid}:`, kErr.message);
                } else {
                    console.log(`Successfully killed PID ${pid}.`);
                }
            });
        }
    });
});
