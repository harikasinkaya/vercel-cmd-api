const { exec } = require('child_process');

export default function handler(req, res) {
    // URL'den şifreyi ve çalıştırılacak komutu al
    // Örnek: /api/run?token=benimsifrem123&cmd=ls%20-la
    const { token, cmd } = req.query;

    // Basit güvenlik kontrolü
    if (token !== 'benimsifrem123') {
        return res.status(401).json({ error: 'Yetkisiz erişim!' });
    }

    // Eğer komut gönderilmediyse varsayılan olarak sistem bilgisini (uptime) göster
    const commandToRun = cmd || 'uptime';

    // Terminal komutunu Node.js üzerinden çalıştır
    exec(commandToRun, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ 
                status: 'error', 
                message: error.message, 
                stderr: stderr 
            });
        }
        
        // Komut başarılıysa terminal çıktısını (stdout) JSON olarak geri dön
        res.status(200).json({ 
            status: 'success', 
            command: commandToRun,
            output: stdout 
        });
    });
}
