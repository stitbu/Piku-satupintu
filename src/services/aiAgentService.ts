
import { GoogleGenAI } from "@google/genai";
import { BillingLog, Student } from "../types/schema";

interface CollectionTarget {
    studentName: string;
    phone: string;
    totalDebt: number;
    lateLevel: number;
    generatedMessage: string;
}

export const AiAgentService = {

    /**
     * Generate a specific reminder for a single student (On-Demand)
     */
    generateSingleReminder: async (
        studentName: string,
        amount: number,
        lateLevel: number
    ): Promise<string> => {
        const apiKey = process.env.API_KEY;
        const formattedAmount = new Intl.NumberFormat('id-ID').format(amount);

        if (!apiKey) {
            return `Yth. Sdr/i ${studentName}, kami mengingatkan kembali mengenai tagihan sebesar Rp ${formattedAmount} (Level Telat: ${lateLevel}). Mohon segera diselesaikan. Terima kasih.`;
        }

        try {
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `
                Buatkan pesan WhatsApp penagihan yang sopan namun tegas (Bahasa Indonesia) untuk mahasiswa.
                Nama: ${studentName}
                Total Tunggakan: Rp ${formattedAmount}
                Tingkat Keterlambatan: ${lateLevel} (Skala 1-5, 5 sangat kritis).
                
                Instruksi:
                - Pendek, langsung pada inti, profesional.
                - Jangan pakai salam pembuka berlebihan.
                - Jika level 4 atau 5, sebutkan potensi pemblokiran akses akademik.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            
            return response.text?.trim() || "";
        } catch (e) {
            console.error("AI Gen Error", e);
            return `Yth. ${studentName}, Mohon segera lunasi tunggakan Rp ${formattedAmount}. Terima kasih.`;
        }
    },

    /**
     * Scans billing logs for high-risk accounts (Level > 3) and generates AI messages.
     */
    runCollectionAgent: async (
        billingLogs: (BillingLog & { student_name: string; student_phone: string })[]
    ): Promise<CollectionTarget[]> => {
        
        console.log("🤖 [AI Agent] Starting Collection Run...");

        const highRisk = billingLogs.filter(log => log.late_level > 3 && log.remaining_balance > 0);
        
        if (highRisk.length === 0) {
            return [];
        }

        const targets: CollectionTarget[] = [];
        const apiKey = process.env.API_KEY;

        for (const log of highRisk) {
            let message = "";

            if (apiKey) {
                try {
                    const ai = new GoogleGenAI({ apiKey });
                    const prompt = `
                        Role: Collection Agent for a University.
                        Task: Create a WhatsApp reminder message for a student.
                        Tone: Firm, Formal, Urgent, but Polite.
                        Context:
                        - Student Name: ${log.student_name}
                        - Debt Amount: Rp ${new Intl.NumberFormat('id-ID').format(log.remaining_balance)}
                        - Late Level: ${log.late_level} (Scale 1-5, 5 is worst)
                        
                        Instructions:
                        - Do not use greetings like "Selamat Pagi". Use "Yth."
                        - Mention the consequence of administration block if level is 5.
                        - Keep it under 50 words.
                        - Language: Indonesian.
                    `;

                    const response = await ai.models.generateContent({
                        model: 'gemini-3-flash-preview',
                        contents: prompt
                    });
                    
                    message = response.text || "Mohon segera lunasi tagihan Anda.";
                } catch (e) {
                    message = `Yth. ${log.student_name}, Mohon segera melunasi tunggakan sebesar Rp ${new Intl.NumberFormat('id-ID').format(log.remaining_balance)} untuk menghindari sanksi akademik. Terima kasih.`;
                }
            } else {
                message = `Yth. ${log.student_name}, Mohon segera melunasi tunggakan sebesar Rp ${new Intl.NumberFormat('id-ID').format(log.remaining_balance)} untuk menghindari sanksi akademik. Terima kasih.`;
            }

            targets.push({
                studentName: log.student_name,
                phone: log.student_phone,
                totalDebt: log.remaining_balance,
                lateLevel: log.late_level,
                generatedMessage: message.trim()
            });
        }

        return targets;
    }
};
