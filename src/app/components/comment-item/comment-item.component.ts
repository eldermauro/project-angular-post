import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Comment } from '../../models/comment.model';

@Component({
  selector: 'app-comment-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gray-50 rounded-lg p-4 animate-fade-in">
      <div class="flex justify-between items-start mb-2">
        <div>
          <h4 class="font-medium text-gray-800">{{ comment.name }}</h4>
          <p class="text-sm text-gray-500">{{ comment.email }}</p>
        </div>
        <div class="flex gap-2">
          <button 
            (click)="onEdit.emit(comment)"
            class="text-gray-500 hover:text-primary-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button 
            (click)="onDelete.emit(comment.id)"
            class="text-gray-500 hover:text-error-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      <p class="text-gray-700">{{ comment.body }}</p>
    </div>
  `,
  styles: []
})
export class CommentItemComponent {
  @Input() comment!: Comment;
  @Output() edit = new EventEmitter<Comment>();
  @Output() delete = new EventEmitter<number>();
  
  get onEdit() {
    return this.edit;
  }
  
  get onDelete() {
    return this.delete;
  }
}