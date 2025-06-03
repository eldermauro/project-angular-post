import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../models/post.model';
import { CommentsService } from '../../services/comments.service';
import { CommentListComponent } from '../comment-list/comment-list.component';
import { LoadingSpinnerComponent } from '../ui/loading-spinner/loading-spinner.component';
import { AlertComponent } from '../ui/alert/alert.component';

@Component({
  selector: 'app-post-item',
  standalone: true,
  imports: [
    CommonModule,
    CommentListComponent,
    LoadingSpinnerComponent,
    AlertComponent
  ],
  template: `
    <div class="card p-6 animate-fade-in">
      <div class="flex justify-between items-start mb-4">
        <h2 class="text-xl font-semibold text-gray-800">{{ post.title }}</h2>
        <div class="flex gap-2">
          <button 
            (click)="onEdit.emit(post)"
            class="btn-secondary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button 
            (click)="onDelete.emit(post.id)"
            class="btn-danger"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <p class="text-gray-600 mb-4">{{ post.body }}</p>
      
      <div class="mt-6 border-t pt-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-700">Comments</h3>
          <button 
            (click)="toggleComments()"
            class="btn-secondary text-sm"
          >
            {{ showComments ? 'Hide Comments' : 'Show Comments' }}
          </button>
        </div>
        
        <app-alert 
          *ngIf="error" 
          [message]="error" 
          [type]="'error'"
          (dismiss)="error = ''"
        ></app-alert>

        <div *ngIf="loadingComments" class="py-4 flex justify-center">
          <app-loading-spinner></app-loading-spinner>
        </div>
        
        <app-comment-list 
          *ngIf="showComments && !loadingComments" 
          [postId]="post.id!"
        ></app-comment-list>
      </div>
    </div>
  `,
  styles: []
})
export class PostItemComponent implements OnInit {
  @Input() post!: Post;
  @Output() edit = new EventEmitter<Post>();
  @Output() delete = new EventEmitter<number>();
  
  showComments = false;
  loadingComments = false;
  error = '';

  constructor(private commentsService: CommentsService) {}

  ngOnInit(): void {}

  get onEdit() {
    return this.edit;
  }

  get onDelete() {
    return this.delete;
  }

  toggleComments(): void {
    this.showComments = !this.showComments;
    
    if (this.showComments && this.post.id) {
      this.loadComments();
    }
  }
  
  loadComments(): void {
    if (!this.post.id) return;
    
    this.loadingComments = true;
    this.error = '';
    
    this.commentsService.getCommentsByPost(this.post.id).subscribe({
      next: () => {
        this.loadingComments = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loadingComments = false;
      }
    });
  }
}