/*
 * Scripta - Storage & Serialization Engine (.scripta format)
 */

const SETTINGS_KEY = 'scripta_user_settings';
const AUTO_RECOVERY_KEY = 'scripta_auto_recovery';

export class StorageEngine {
  constructor() {
    this.fileHandle = null;
  }

  serializeState(appState) {
    return JSON.stringify({
      version: '1.0',
      metadata: {
        created: appState.metadata?.created || new Date().toISOString(),
        modified: new Date().toISOString(),
        futureNote: appState.metadata?.futureNote || '',
        workingQuestion: appState.workingQuestion || ''
      },
      sandbox: {
        rawText: appState.sandbox?.rawText || '',
        sessionDuration: appState.sandbox?.sessionDuration || 900,
        sessionCount: appState.sandbox?.sessionCount || 1
      },
      cuttingRoom: {
        cards: appState.cuttingRoom?.cards || []
      },
      sculptor: {
        finalText: appState.sculptor?.finalText || '',
        hemingwayUsed: appState.sculptor?.hemingwayUsed || false,
        readAloudUsed: appState.sculptor?.readAloudUsed || false
      },
      settings: appState.settings || {
        fontSize: 18,
        soundEnabled: true,
        volume: 0.35,
        timerDuration: 900,
        highContrast: false,
        dyslexiaFont: false
      }
    }, null, 2);
  }

  saveAutoRecovery(appState) {
    try {
      const data = this.serializeState(appState);
      localStorage.setItem(AUTO_RECOVERY_KEY, data);
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
  }

  getAutoRecovery() {
    try {
      const data = localStorage.getItem(AUTO_RECOVERY_KEY);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      return null;
    }
  }

  clearAutoRecovery() {
    localStorage.removeItem(AUTO_RECOVERY_KEY);
  }

  saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (err) {
      console.warn('Failed to save settings:', err);
    }
  }

  loadSettings() {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      return null;
    }
  }

  async saveProject(appState) {
    const jsonContent = this.serializeState(appState);
    const dateStr = new Date().toISOString().slice(0, 10);
    const cleanQuestion = (appState.workingQuestion || 'manuscript').replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 24);
    const filename = `${cleanQuestion}-${dateStr}.scripta`;

    if ('showSaveFilePicker' in window) {
      try {
        if (!this.fileHandle) {
          const options = {
            suggestedName: filename,
            types: [{
              description: 'Scripta Project File (*.scripta)',
              accept: { 'application/json': ['.scripta'] }
            }]
          };
          this.fileHandle = await window.showSaveFilePicker(options);
        }

        const writable = await this.fileHandle.createWritable();
        await writable.write(jsonContent);
        await writable.close();
        return { success: true, method: 'fileSystem' };
      } catch (err) {
        if (err.name === 'AbortError') return { success: false, aborted: true };
        console.warn('File System Access failed, falling back to download:', err);
      }
    }

    this.downloadBlob(jsonContent, filename, 'application/json');
    return { success: true, method: 'download' };
  }

  async openProject() {
    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [{
            description: 'Scripta Project File (*.scripta)',
            accept: { 'application/json': ['.scripta', '.json'] }
          }]
        });
        this.fileHandle = handle;
        const file = await handle.getFile();
        const text = await file.text();
        return JSON.parse(text);
      } catch (err) {
        if (err.name === 'AbortError') return null;
        console.warn('File picker error:', err);
      }
    }

    // Fallback file input
    return new Promise((resolve) => {
      let fileInput = document.getElementById('file-import-input');
      if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'file-import-input';
        fileInput.accept = '.scripta,.json';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
      }

      fileInput.value = '';
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            resolve(data);
          } catch (err) {
            alert('Invalid .scripta project file format.');
            resolve(null);
          }
        };
        reader.readAsText(file);
      };
      fileInput.click();
    });
  }

  /**
   * Export as Microsoft Word (.doc / .docx compatible) Document
   */
  exportToWord(title, content, question = '', colophon = null) {
    const cleanTitle = (title || 'Manuscript').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const formattedParagraphs = (content || '')
      .split(/\n\s*\n|\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => `<p style="margin-bottom: 16pt; line-height: 1.8; text-align: justify; font-size: 12pt;">${p}</p>`)
      .join('\n');

    let colophonHtml = '';
    if (colophon) {
      colophonHtml = `
        <div style="margin-top: 40pt; padding-top: 20pt; border-top: 1pt solid #cccccc; font-size: 10pt; color: #555555; font-family: sans-serif;">
          <h3 style="font-size: 11pt; color: #333333; margin-bottom: 8pt; text-transform: uppercase; letter-spacing: 0.05em;">Manuscript Provenance & Writing Receipt</h3>
          <ul style="line-height: 1.6; margin: 0; padding-left: 18pt;">
            <li><strong>Active Writing Time:</strong> ${colophon.timeSpentFormatted || 'N/A'}</li>
            <li><strong>Session Days:</strong> ${colophon.sessionDays || 1} day(s)</li>
            <li><strong>Structural Blocks & Revisions:</strong> ${colophon.revisionsCount || 0} edits</li>
            <li><strong>Deletions:</strong> ${colophon.deletionsCount || 0} deletions</li>
            ${colophon.customNote ? `<li><strong>Writer Note:</strong> ${colophon.customNote}</li>` : ''}
            <li><strong>Drafted In:</strong> Scripta — Cognitive Writing Environment</li>
          </ul>
        </div>
      `;
    }

    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: letter portrait;
            margin: 1.0in 1.0in 1.0in 1.0in;
          }
          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            color: #1a1a1a;
            max-width: 6.5in;
            margin: 0 auto;
          }
          h1 {
            font-size: 20pt;
            font-weight: bold;
            color: #111111;
            margin-bottom: 8pt;
            text-align: center;
          }
          .subtitle {
            font-size: 11pt;
            font-style: italic;
            color: #666666;
            margin-bottom: 28pt;
            text-align: center;
          }
          hr {
            border: 0;
            border-top: 1pt solid #dddddd;
            margin: 20pt 0 28pt 0;
          }
        </style>
      </head>
      <body>
        <h1>${question || title || 'Scripta Manuscript'}</h1>
        <div class="subtitle">Drafted with Scripta · ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <hr />
        ${formattedParagraphs}
        ${colophonHtml}
      </body>
      </html>
    `;

    this.downloadBlob(wordHtml, `${cleanTitle}.doc`, 'application/msword');
  }

  /**
   * Export / Print as PDF
   */
  exportToPDF() {
    window.print();
  }

  downloadBlob(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}

export const storageEngine = new StorageEngine();


