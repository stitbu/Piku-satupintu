
import { Task, User, UserPreferences } from '../types';

// Simple beep sound (Base64 MP3)
const NOTIFICATION_SOUND = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTSSEAAAAAAAABAAAB//5QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIwAXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcX//5QAAAAAABAAAABAAAAEQAAAf//lAAAAAAAIAAAAEAAAAIAAAH//lAAAAAAAEAAAAQAAAAgAAAB//5QAAAAAAAQAAAAQAAAAwAAAf//lAAAAAAACAAAAEAAAAMAAAH//lAAAAAAAEAAAAQAAAAwAAAf//lAAAAAAACAAAAEAAAAQAAAH';

export const NotificationService = {
  
  // 1. Request Permission
  requestPermission: async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    
    const result = await Notification.requestPermission();
    return result === 'granted';
  },

  // 2. Play Sound
  playSound: () => {
    try {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.volume = 0.5;
      audio.play();
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  },

  // 3. Show Browser Notification
  showBrowserNotification: (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3233/3233497.png' // Generic Bell Icon
      });
      NotificationService.playSound();
    }
  },

  // 4. Send to WhatsApp (Open Link)
  sendToWhatsApp: (task: Task, preferences: UserPreferences) => {
    const targetNumber = preferences.whatsappNumber || ''; 
    
    // Formatting Message
    const text = `
*TUGAS BARU: ${task.title}*
---------------------------
🚨 Prioritas: ${task.priority.toUpperCase()}
📅 Due Date: ${task.dueDate || '-'}
📂 Divisi: ${task.targetDivisionId || task.originDivisionId || '-'}

Mohon segera ditindaklanjuti. Terima kasih.
    `.trim();

    const encodedText = encodeURIComponent(text);
    // Use stored number or let user pick contact if empty
    const url = targetNumber 
      ? `https://wa.me/${targetNumber}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;

    window.open(url, '_blank');
  },

  // 5. Check Reminders (Run this in App.tsx Interval)
  checkReminders: (tasks: Task[], onTaskReminded: (taskId: string) => void) => {
    const now = Date.now();
    
    tasks.forEach(task => {
      // Check if task has reminder, is NOT completed, and hasn't been reminded yet
      if (task.reminderAt && !task.isCompleted && !task.isReminded) {
        // If current time is past the reminder time (within a reasonable 5 min window to avoid old tasks spamming)
        if (now >= task.reminderAt && now <= task.reminderAt + (5 * 60 * 1000)) {
          
          NotificationService.showBrowserNotification(
            "🔔 PENGINGAT TUGAS",
            `Waktunya mengerjakan: ${task.title}`
          );
          
          // Mark as reminded so it doesn't loop
          onTaskReminded(task.id);
        }
      }
    });
  },

  // 6. Webhook Trigger (Automation)
  triggerWebhook: async (task: Task, action: 'created' | 'completed', webhookUrl: string) => {
    if (!webhookUrl) return;

    try {
      const payload = {
        event: action === 'created' ? 'NEW_TASK' : 'TASK_COMPLETED',
        task_id: task.id,
        title: task.title,
        priority: task.priority,
        division: task.targetDivisionId || task.originDivisionId,
        assignee: task.assigneeId,
        timestamp: new Date().toISOString(),
        message: action === 'created' 
          ? `🔥 *Tugas Penting Baru*\n${task.title}\nPrioritas: ${task.priority}` 
          : `✅ *Tugas Selesai*\n${task.title}`
      };

      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => {
          console.error("Webhook failed", err);
      });
      
    } catch (error) {
      console.error('Webhook trigger error:', error);
    }
  },

  // 7. Direct Fonnte API Integration (Improved)
  sendViaFonnte: async (task: Task | string, token: string, targetNumber: string): Promise<{success: boolean, detail: string}> => {
    if (!token || !targetNumber) {
        return { success: false, detail: "Token Fonnte atau Nomor Tujuan kosong." };
    }

    let message = "";

    if (typeof task === 'string') {
        // Direct text message (Used for Daily Report)
        message = task;
    } else {
        // Task Object message
        message = `
*NOTIFIKASI SISTEM PINTU KULIAH*
---------------------------
🔔 Status: ${task.isCompleted ? '✅ SELESAI' : '🔥 TUGAS BARU (URGENT)'}
📝 Judul: ${task.title}
📅 Due Date: ${task.dueDate || '-'}
👤 Assignee: ${task.assigneeId || 'Unassigned'}
📂 Divisi: ${task.targetDivisionId || '-'}

_Pesan otomatis dari Sistem Satu Pintu_
`.trim();
    }

    try {
        const formData = new FormData();
        formData.append('target', targetNumber);
        formData.append('message', message);
        
        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                Authorization: token,
            },
            body: formData,
        });
        
        const result = await response.json();
        console.log('Fonnte Result:', result);

        if (result.status) {
            return { success: true, detail: `Berhasil dikirim! ID: ${result.id || 'OK'}` };
        } else {
            return { success: false, detail: `Gagal: ${result.reason || 'Unknown Fonnte Error'}` };
        }

    } catch (error: any) {
        console.error('Fonnte API Error:', error);
        if (error.message === 'Failed to fetch') {
             return { success: false, detail: "Network/CORS Error. Browser memblokir request langsung ke Fonnte." };
        }
        return { success: false, detail: error.message || "Error Koneksi" };
    }
  },

  // 8. Generate Daily Report
  sendDailyReport: async (tasks: Task[], user: User, preferences: UserPreferences): Promise<{success: boolean, detail: string}> => {
      const token = preferences.fonnteToken;
      const targetNumber = preferences.whatsappNumber;

      if (!token || !targetNumber) {
          return { success: false, detail: "Konfigurasi WhatsApp (Token/Nomor) belum diisi di Pengaturan." };
      }

      // Filter tasks for today or active
      const now = new Date();
      const todayString = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      
      const completed = tasks.filter(t => t.isCompleted);
      const pending = tasks.filter(t => !t.isCompleted);
      
      // Calculate progress
      const total = tasks.length;
      const progress = total > 0 ? Math.round((completed.length / total) * 100) : 0;

      const reportMessage = `
🌟 *LAPORAN HARIAN - ${todayString.toUpperCase()}* 🌟
👤 Nama: ${user.name}
🏢 Divisi: ${user.division}

📊 *Progres Hari Ini: ${progress}%*

✅ *Tugas Selesai (${completed.length}):*
${completed.length > 0 ? completed.map((t, i) => `${i+1}. ${t.title}`).join('\n') : '- Belum ada'}

⏳ *Pending / To-Do (${pending.length}):*
${pending.length > 0 ? pending.map((t, i) => `${i+1}. ${t.title} ${t.priority === 'high' ? '🔥' : ''}`).join('\n') : '- Aman terkendali'}

_Dikirim via Aplikasi Pintu Kuliah_
      `.trim();

      return await NotificationService.sendViaFonnte(reportMessage, token, targetNumber);
  },

  // 9. Check Fonnte Token Validity / Device Status
  validateFonnteToken: async (token: string): Promise<any> => {
      try {
          const response = await fetch('https://api.fonnte.com/device', {
              method: 'POST',
              headers: {
                  Authorization: token,
              },
          });
          
          if (!response.ok) {
              return { status: false, reason: `HTTP Error: ${response.status}` };
          }

          const data = await response.json();
          // API Fonnte returns { status: true, ... } or { status: false, reason: "..." }
          
          if (data.status) {
              return {
                  status: true,
                  name: data.name || "Fonnte Device",
                  device: data.device || "Unknown ID",
                  expired: data.expired || "Unknown",
                  quota: data.quota || "Unknown"
              };
          } else {
              return { status: false, reason: data.reason || "Token valid tapi device disconnected/error." };
          }

      } catch (e: any) {
          console.error("Fonnte Validation Error:", e);
          return { status: false, reason: "Gagal menghubungi server Fonnte (Network/CORS Error)" };
      }
  }
};
