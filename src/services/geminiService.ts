
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Task, User } from "../types";

export const GeminiService = {
    // --- CORE ENGINE ---
    async getAIResponse(prompt: string, systemInstruction: string = "", isJson: boolean = false) {
        if (!process.env.API_KEY) return isJson ? "{}" : "API Key is missing.";
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    systemInstruction,
                    responseMimeType: isJson ? "application/json" : "text/plain"
                }
            });
            return response.text || (isJson ? "{}" : "");
        } catch (e) {
            console.error("Gemini Error:", e);
            return isJson ? "{}" : "Error processing AI request.";
        }
    },

    // --- MARKETING: LEAD SCORING ---
    async scoreLead(leadData: any): Promise<{ score: number, reason: string }> {
        const prompt = `Analisis lead berikut dan berikan skor potensi closing (0-100) serta alasan singkat:
        Nama: ${leadData.name}, Sumber: ${leadData.source}, Catatan: ${leadData.notes || 'Kosong'}.
        Output JSON: { "score": number, "reason": string }`;
        const res = await this.getAIResponse(prompt, "Anda adalah Analis Sales Proaktif.", true);
        try { return JSON.parse(res); } catch { return { score: 50, reason: "Manual Review Required" }; }
    },

    // --- ADMIN: OCR / QUICK INGEST ---
    async parseAdmissionText(rawText: string): Promise<any> {
        const prompt = `Ekstrak data mahasiswa dari teks acak ini: "${rawText}". 
        Data yang dicari: full_name, nik, phone, address, mother_name. 
        Output JSON (hanya field yang ditemukan).`;
        const res = await this.getAIResponse(prompt, "Parser Data Administrasi Kampus.", true);
        try { return JSON.parse(res); } catch { return {}; }
    },

    // --- DASHBOARD: STRATEGIC BRIEFING V2 ---
    async getStrategicBriefing(tasks: Task[], leads: any[]): Promise<string> {
        const context = `Tugas: ${JSON.stringify(tasks.slice(0,5))}, Leads: ${JSON.stringify(leads.slice(0,5))}`;
        const prompt = `Berdasarkan data operasional ini: ${context}.
        Berikan briefing dalam 3 kategori: 
        1. 🚨 ALERT KRITIS (Tugas urgent/terlambat)
        2. ⚡ QUICK WINS (Leads panas yang bisa diclosing hari ini)
        3. 💡 STRATEGI (Saran perbaikan efisiensi).
        Gunakan Bahasa Indonesia yang elegan dan profesional.`;
        return this.getAIResponse(prompt, "Anda adalah Chief of Operations AI.");
    },

    // --- EXISTING METHODS (STABLE) ---
    async generateMarketingDraft(leadName: string, source: string, notes: string): Promise<string> {
        const prompt = `Buatkan 3 draf pesan WhatsApp (Formal, Ramah, Mendesak) untuk calon mahasiswa bernama ${leadName}. 
        Dia datang dari sumber ${source}. Catatan minat: ${notes}. 
        Pisahkan dengan garis pembatas.`;
        return this.getAIResponse(prompt, "Marketing Copywriter.");
    },

    async summarizeChat(messages: ChatMessage[]): Promise<string> {
        const conversation = messages.map(m => `${m.senderName}: ${m.content}`).join('\n');
        const prompt = `Ringkas diskusi berikut menjadi poin keputusan:\n\n${conversation}`;
        return this.getAIResponse(prompt, "Sekretaris Digital.");
    },

    async extractTaskFromMessage(messageContent: string): Promise<any> {
        const prompt = `Ekstrak tugas dari: "${messageContent}". JSON: { "title": string, "priority": "high"|"medium"|"low" }`;
        const res = await this.getAIResponse(prompt, "Task AI.", true);
        return JSON.parse(res);
    },

    async suggestRecoveryStrategy(name: string, balance: number, lateLevel: number): Promise<string> {
        const prompt = `Siswa ${name} telat bayar Rp ${balance} (Level ${lateLevel}). Berikan saran penagihan.`;
        return this.getAIResponse(prompt, "Debt Specialist.");
    },

    async intelligentIngest(rawText: string): Promise<any> {
        const prompt = `Proses teks menjadi JSON: "${rawText}"`;
        const res = await this.getAIResponse(prompt, "Parser ERP.", true);
        return JSON.parse(res);
    },

    async parseBulkTasks(text: string): Promise<any[]> {
        const prompt = `Ekstrak daftar tugas dari: "${text}". Output JSON array.`;
        const res = await this.getAIResponse(prompt, "AI Task Manager.", true);
        return JSON.parse(res);
    },

    async generateSubtasks(title: string, description: string): Promise<{title: string}[]> {
        const prompt = `Pecah menjadi sub-tugas: ${title}. JSON array of {title}.`;
        const res = await this.getAIResponse(prompt, "Efficiency AI.", true);
        return JSON.parse(res);
    },

    // FIX: ADD polishMessage method for BroadcastModal to refine messages for professional tone
    async polishMessage(message: string): Promise<string> {
        const prompt = `Rapikan dan poles pesan berikut agar terdengar lebih profesional, sopan, dan formal dalam Bahasa Indonesia tanpa mengubah inti informasinya: "${message}"`;
        return this.getAIResponse(prompt, "Anda adalah Sekretaris Eksekutif yang ahli dalam komunikasi korporat.");
    },

    // FIX: ADD parseWaChat method for WaSyncModal to extract structured tasks from WhatsApp chat logs
    async parseWaChat(rawText: string): Promise<any[]> {
        const prompt = `Ekstrak daftar tugas atau informasi penting dari percakapan WhatsApp berikut. 
        Untuk setiap item, tentukan: 
        1. "title" (judul singkat)
        2. "priority" ("high", "medium", atau "low")
        3. "divisionId" (pilih yang paling cocok: 'Direksi', 'Marketing', 'Administrasi', 'Keuangan', 'IT Support', 'Kebersihan & Keamanan', 'Mitra Kampus'). 
        Percakapan: "${rawText}"
        Output JSON array of objects.`;
        const res = await this.getAIResponse(prompt, "AI Parser WhatsApp.", true);
        try {
            return JSON.parse(res);
        } catch (e) {
            return [];
        }
    }
};
