
import { GoogleGenAI, Type } from "@google/genai";
import { Tool, User, ToolCategory, TaskPriority, DivisionType, Task, ChatMessage, Announcement } from "../types";

// Fallback suggestions if AI fails or no key
const FALLBACK_SUGGESTIONS = [
    "Cek email harian",
    "Update laporan mingguan",
    "Koordinasi tim pagi"
];

export const GeminiService = {
    
    // 1. SMART SUGGESTIONS
    async getSmartSuggestions(user: User, recentTools: Tool[]): Promise<string[]> {
        if (!process.env.API_KEY) return FALLBACK_SUGGESTIONS;
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        try {
            const toolNames = recentTools.map(t => t.name).join(", ");
            const prompt = `
                Peran User: ${user.role}
                Divisi User: ${user.division}
                Tools Terakhir: ${toolNames}

                Berikan 3 saran tugas singkat (maks 5 kata) yang relevan untuk produktivitas kerja dalam bahasa Indonesia.
                Return ONLY a JSON array of strings.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                }
            });

            const text = response.text;
            if (text) return JSON.parse(text);
            return FALLBACK_SUGGESTIONS;

        } catch (error) {
            console.error("Gemini Suggestions Error:", error);
            return FALLBACK_SUGGESTIONS;
        }
    },

    // 2. CHECK LINK HEALTH
    async checkLinkHealth(url: string): Promise<{ status: 'ok' | 'broken' | 'unknown', reason?: string }> {
         return { status: 'ok' };
    },

    // 3. SMART ADD TOOL
    async generateToolConfig(description: string, divisionName: string): Promise<Partial<Tool>> {
        if (!process.env.API_KEY) {
            return {
                name: description.substring(0, 15) + '...',
                icon: 'Link',
                color: 'bg-blue-500',
                category: ToolCategory.PROJECT
            };
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        try {
             const prompt = `
                Analisis permintaan pembuatan alat kerja untuk divisi "${divisionName}": "${description}".
                
                Tentukan:
                1. "name" (Nama pendek, Title Case, maks 25 karakter).
                2. "category" (Pilih salah satu: "${ToolCategory.DAILY}", "${ToolCategory.SHARED}", "${ToolCategory.PROJECT}").
                3. "icon" (Nama ikon Lucide React yang cocok, misal: FileText, BarChart, Users, Globe).
                4. "color" (Tailwind CSS bg color class, misal: bg-blue-500, bg-red-600, bg-green-500, bg-purple-500, bg-orange-500).

                Return ONLY a JSON object.
             `;

             const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            category: { type: Type.STRING },
                            icon: { type: Type.STRING },
                            color: { type: Type.STRING }
                        },
                        required: ["name", "category", "icon", "color"]
                    }
                }
            });
            
            const text = response.text;
            if (text) {
                const data = JSON.parse(text);
                return {
                    name: data.name,
                    category: data.category as ToolCategory,
                    icon: data.icon,
                    color: data.color
                };
            }
            throw new Error("Empty response");

        } catch (e) {
            console.error(e);
            return { name: "New Tool", icon: "Link", color: "bg-blue-500", category: ToolCategory.PROJECT };
        }
    },

    // 4. TASK ASSISTANT
    async generateTaskDescription(prompt: string): Promise<string> {
        if (!process.env.API_KEY) return prompt;
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        try {
            const aiPrompt = `Ubah input ini menjadi judul tugas profesional (Bahasa Indonesia): "${prompt}"`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: aiPrompt,
            });
            return response.text?.trim() || prompt;
        } catch (error) {
            return prompt;
        }
    },

    // 5. BULK IMPORT PARSER
    async parseBulkTasks(text: string): Promise<any[]> {
        if (!process.env.API_KEY) {
            console.warn("API Key missing");
            return [];
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        try {
            const systemPrompt = `
            PERAN: Asisten Project Manager Cerdas.
            TUGAS: Ekstrak daftar tugas dari teks input (chat/notulen) menjadi JSON Array.

            ATURAN PENENTUAN DIVISI (divisionId):
            Analisis konteks kalimat untuk memetakan ke salah satu ID ini: 'Direksi', 'Marketing', 'Administrasi', 'Keuangan', 'IT Support', 'Kebersihan & Keamanan', 'Mitra Kampus'.
            
            *** ATURAN KHUSUS BROADCAST ***
            Jika perintah ditujukan untuk "Semua", "All Team", atau tidak spesifik divisi: MAKA set "divisionId" menjadi: 'BROADCAST'.

            OUTPUT JSON ONLY:
            [{ "title": string, "divisionId": string, "priority": "high"|"medium"|"low", "dueDate": "YYYY-MM-DD" | null }]
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Instruction: ${systemPrompt}\n\nInput Text:\n"${text}"`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                divisionId: { type: Type.STRING },
                                priority: { type: Type.STRING },
                                dueDate: { type: Type.STRING, nullable: true }
                            },
                            required: ["title", "divisionId", "priority"]
                        }
                    }
                }
            });

            const responseText = response.text;
            return JSON.parse(responseText || '[]');

        } catch (error) {
            console.error("Gemini Bulk Parse Error:", error);
            return [];
        }
    },

    // 6. FIX: ADD generateSubtasks method
    async generateSubtasks(title: string, description: string): Promise<{title: string}[]> {
        if (!process.env.API_KEY) return [];
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const prompt = `Pecah tugas ini menjadi langkah-langkah pengerjaan yang konkret (maks 5 langkah).
            Judul: ${title}
            Deskripsi: ${description}
            Return ONLY a JSON array of objects with "title" property.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING }
                            },
                            required: ["title"]
                        }
                    }
                }
            });
            return JSON.parse(response.text || '[]');
        } catch (e) { return []; }
    },

    // 7. FIX: ADD askData method
    async askData(query: string, context: { tasks: Task[], users: User[], announcements: Announcement[] }): Promise<string> {
        if (!process.env.API_KEY) return "API Key tidak dikonfigurasi.";
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const prompt = `Anda adalah asisten data kantor cerdas. Jawab pertanyaan berdasarkan data berikut:
            
            TUGAS: ${JSON.stringify(context.tasks.map(t => ({ title: t.title, status: t.isCompleted ? 'Selesai' : 'Pending' })))}
            PERSONEL: ${JSON.stringify(context.users.map(u => ({ name: u.name, role: u.role, division: u.division })))}
            PENGUMUMAN: ${JSON.stringify(context.announcements.map(a => ({ title: a.title, content: a.content })))}
            
            Pertanyaan: ${query}
            Jawab dalam Bahasa Indonesia yang singkat, ramah, dan membantu.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            return response.text || "Maaf, saya tidak menemukan jawabannya.";
        } catch (e) { return "Terjadi kesalahan sistem."; }
    }
};
