import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="file-upload">
      <input 
        type="file" 
        #fileInput
        (change)="onFileSelected($event)"
        accept=".geojson,.json"
        class="file-input"
        id="file-upload"
      >
      <label for="file-upload" class="file-label">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10,9 9,9 8,9"></polyline>
        </svg>
        Import GeoJSON
      </label>
    </div>
  `,
  styles: [`
    .file-upload {
      position: relative;
      display: inline-block;
    }
    
    .file-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .file-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background-color: #3b82f6;
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    
    .file-label:hover {
      background-color: #2563eb;
    }
    
    .file-label svg {
      width: 20px;
      height: 20px;
    }
  `]
})
export class FileUploadComponent {
  @Output() fileSelected = new EventEmitter<File>();

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.fileSelected.emit(file);
    }
  }
}
