
export const WhatsAppService = {
    /**
     * Membuka WhatsApp (Web/App) dengan pesan tertentu.
     * Karena API WhatsApp tidak mengizinkan kirim langsung ke Group ID tanpa berbayar,
     * kita gunakan Link Group untuk navigasi dan kirim teks via wa.me (jika ada nomor) 
     * atau instruksi copy-paste otomatis.
     */
    sendToGroup: (groupLink: string, message: string) => {
        // Encode pesan untuk URL
        const encodedMsg = encodeURIComponent(message);
        
        // Salin pesan ke clipboard agar user tinggal Paste (Ctrl+V) saat grup terbuka
        navigator.clipboard.writeText(message).then(() => {
            // Buka link grup
            window.open(groupLink, '_blank');
        });
    }
};
