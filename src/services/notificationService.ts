
import { Task, User, UserPreferences } from '../types';

export const NotificationService = {
  
  // 1. WEBHOOK AUTOMATION (BACKEND-LIKE TRIGGER)
  triggerWebhook: async (payload: any, webhookUrl: string) => {
    if (!webhookUrl) return;
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            timestamp: new Date().toISOString(),
            source: 'OG-System Backend',
            data: payload
        })
      });
      console.log("[Webhook] Sent successfully to:", webhookUrl);
    } catch (error) {
      console.error('[Webhook Error]', error);
    }
  },

  // 2. WHATSAPP GATEWAY (FONNTE API)
  sendViaFonnte: async (message: string, token: string, target: string): Promise<{success: boolean, detail: string}> => {
    if (!token || !target) return { success: false, detail: "Missing Config" };

    try {
        const formData = new FormData();
        formData.append('target', target);
        formData.append('message', message);
        
        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: { Authorization: token },
            body: formData,
        });
        
        const result = await response.json();
        return { 
            success: result.status === true, 
            detail: result.status ? "Success" : (result.reason || "Fonnte API Rejected") 
        };
    } catch (error: any) {
        return { success: false, detail: "Connection Error" };
    }
  },

  // 3. DAILY REPORT GENERATOR
  sendDailyReport: async (tasks: Task[], user: User, prefs: UserPreferences) => {
      const completed = tasks.filter(t => t.isCompleted).length;
      const pending = tasks.filter(t => !t.isCompleted).length;
      
      const msg = `
📊 *REPORT ERP - ${user.name}*
Divisi: ${user.division}
✅ Selesai: ${completed}
⏳ Pending: ${pending}
_Generated automatically from OG-System_
      `.trim();

      if (prefs.fonnteToken && prefs.whatsappNumber) {
          return await NotificationService.sendViaFonnte(msg, prefs.fonnteToken, prefs.whatsappNumber);
      }
      return { success: false, detail: "WA Not Configured" };
  },

  // Helper untuk cek status device Fonnte
  validateFonnteToken: async (token: string) => {
      try {
          const res = await fetch('https://api.fonnte.com/device', {
              method: 'POST',
              headers: { Authorization: token }
          });
          return await res.json();
      } catch (e) { return { status: false }; }
  },

  // FIX: ADD sendToWhatsApp method
  sendToWhatsApp: (task: Task, preferences: UserPreferences) => {
    const targetNumber = preferences.whatsappNumber || ''; 
    const text = `*TUGAS: ${task.title}*\nPrioritas: ${task.priority.toUpperCase()}\nDivisi: ${task.targetDivisionId || '-'}`;
    const encodedText = encodeURIComponent(text);
    const url = targetNumber 
      ? `https://wa.me/${targetNumber}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank');
  },

  playSound: () => { /* Logic existing */ },
  requestPermission: async () => { return Notification.requestPermission(); }
};
