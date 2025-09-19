import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PointFeature } from '../../models/geojson.interface';

@Component({
  selector: 'app-point-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="point-editor" *ngIf="feature">
      <h3>{{ isEditing ? 'Edit Point' : 'New Point' }}</h3>
      
      <div class="form-group">
        <label for="name">Name *</label>
        <input 
          id="name"
          type="text" 
          [(ngModel)]="editableFeature!.properties.name" 
          placeholder="Enter point name"
          class="form-control"
        >
      </div>
      
      <div class="form-group">
        <label for="category">Category *</label>
        <select 
          id="category"
          [(ngModel)]="editableFeature!.properties.category" 
          class="form-control"
        >
          <option value="">Select category</option>
          <option value="landmark">Landmark</option>
          <option value="park">Park</option>
          <option value="restaurant">Restaurant</option>
          <option value="shopping">Shopping</option>
          <option value="transport">Transport</option>
          <option value="hospital">Hospital</option>
          <option value="school">School</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div class="coordinates">
        <div class="coord-group">
          <label>Longitude</label>
          <input 
            type="number" 
            [value]="getFormattedCoordinate(0)"
            (input)="onCoordinateChange(0, $event)"
            step="any"
            class="form-control"
            readonly
          >
        </div>
        <div class="coord-group">
          <label>Latitude</label>
          <input 
            type="number" 
            [value]="getFormattedCoordinate(1)"
            (input)="onCoordinateChange(1, $event)"
            step="any"
            class="form-control"
            readonly
          >
        </div>
      </div>
      
      <div class="actions">
        <button 
          type="button" 
          (click)="onSave()" 
          [disabled]="!isValid()"
          class="btn btn-primary"
        >
          {{ isEditing ? 'Update' : 'Add' }}
        </button>
        <button 
          type="button" 
          (click)="onCancel()" 
          class="btn btn-secondary"
        >
          Cancel
        </button>
        <button 
          type="button" 
          (click)="onDelete()" 
          *ngIf="isEditing"
          class="btn btn-danger"
        >
          Delete
        </button>
      </div>
    </div>
  `,
  styles: [`
    .point-editor {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      max-width: 100%;
      overflow: hidden;
      box-sizing: border-box;
    }
    
    .point-editor h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    
    .form-group {
      margin-bottom: 15px;
      width: 100%;
      box-sizing: border-box;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #555;
    }
    
    .form-control {
      width: 100%;
      max-width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }
    
    .coordinates {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
      width: 100%;
      box-sizing: border-box;
    }
    
    .coord-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #555;
    }
    
    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background-color: #3b82f6;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: #2563eb;
    }
    
    .btn-secondary {
      background-color: #6b7280;
      color: white;
    }
    
    .btn-secondary:hover {
      background-color: #4b5563;
    }
    
    .btn-danger {
      background-color: #ef4444;
      color: white;
    }
    
    .btn-danger:hover {
      background-color: #dc2626;
    }
  `]
})
export class PointEditorComponent implements OnChanges {
  @Input() feature: PointFeature | null = null;
  @Input() isEditing: boolean = false;
  
  @Output() save = new EventEmitter<PointFeature>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<string>();

  editableFeature: PointFeature | null = null;

  ngOnChanges(): void {
    if (this.feature) {
      this.editableFeature = JSON.parse(JSON.stringify(this.feature));
    } else {
      this.editableFeature = null;
    }
  }

  isValid(): boolean {
    if (!this.editableFeature) return false;
    
    const { name, category } = this.editableFeature.properties;
    return !!(name && name.trim() && category && category.trim());
  }

  onSave(): void {
    if (this.editableFeature && this.isValid()) {
      this.save.emit(this.editableFeature);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onDelete(): void {
    if (this.editableFeature?.id) {
      this.delete.emit(this.editableFeature.id);
    }
  }

  getFormattedCoordinate(index: number): number {
    if (!this.editableFeature) return 0;
    return parseFloat(this.editableFeature.geometry.coordinates[index].toFixed(4));
  }

  onCoordinateChange(index: number, event: Event): void {
    if (!this.editableFeature) return;
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);
    if (!isNaN(value)) {
      this.editableFeature.geometry.coordinates[index] = value;
    }
  }
}
