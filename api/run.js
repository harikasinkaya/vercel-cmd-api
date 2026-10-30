const { exec } = require('child_process');
const util = require('util');
const path = require('path');

const execPromise = util.promisify(exec);

export default async function handler(req, res) {
    const token = req.query.token || (req.body && req.body.token);
    const cmd = req.query.cmd || (req.body && req.body.cmd);

    if (token !== 'benimsifrem123') {
        return res.status(401).json({ success: false, error: 'Yetkisiz erişim!' });
    }

    if (!cmd) {
        return res.status(400).json({ success: false, error: 'Çalıştırılacak komut (cmd) eksik.' });
    }

    const startTime = Date.now();

    // Vercel'in ana dizinindeki 'dosyalar' klasörünün tam yolunu belirliyoruz
    const targetDir = path.join(process.cwd(), 'dosyalar');

    try {
        // cwd (Current Working Directory) parametresi ile komutu dosyalar klasörü içinde çalıştır
        const { stdout, stderr } = await execPromise(cmd, { 
            timeout: 8000, 
            cwd: targetDir 
        });
        
        // Ortam bilgilerini de aynı klasör içinde çalıştırarak doğru lokasyonu al
        const { stdout: pwdOut } = await execPromise('pwd', { cwd: targetDir });
        const { stdout: whoamiOut } = await execPromise('whoami');

        const executionTime = Date.now() - startTime;

        return res.status(200).json({
            success: true,
            command: cmd,
            execution_time_ms: executionTime,
            environment: {
                user: whoamiOut.trim(),
                current_directory: pwdOut.trim(),
            },
            output: stdout ? stdout.trim() : null,
            warnings: stderr ? stderr.trim() : null
        });

    } catch (error) {
        const executionTime = Date.now() - startTime;

        return res.status(500).json({
            success: false,
            command: cmd,
            execution_time_ms: executionTime,
            error_details: {
                message: error.message,
                exit_code: error.code || null,
                killed_by_timeout: error.killed || false
            },
            output: error.stdout ? error.stdout.trim() : null,
            error_output: error.stderr ? error.stderr.trim() : null
        });
    }
}
