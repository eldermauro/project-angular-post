import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsService } from '../../services/comments.service';
import { Comment } from '../../models/comment.model';
import { CommentItemComponent } from '../comment-item/comment-item.component';
import { CommentFormComponent } from '../comment-form/comment-form.component';
import { AlertComponent } from '../ui/alert/alert.component';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [
    CommonModule,
    CommentItemComponent,
    CommentFormComponent,
    AlertComponent
  ],
  template: `
    <div>
      <app-alert 
        *ngIf="error" 
        [message]="error" 
        [type]="'error'"
        (dismiss)="error = ''"
      ></app-alert>
      
      <div *ngIf="comments.length === 0" class="text-center py-4">
        <p class="text-gray-500">No comments yet. Be the first to comment!</p>
      </div>
      
      <div class="space-y-4">
        <app-comment-item 
          *ngFor="let comment of comments"
          [comment]="comment"
          (edit)="openEditModal(comment)"
          (delete)="deleteComment(comment.id!)"
        ></app-comment-item>
      </div>
      
      <div class="mt-6 pt-4 border-t border-gray-100">
        <button 
          *ngIf="!showForm"
          (click)="showForm = true"
          class="btn-accent"
        >
          Add Comment
        </button>
        
        <app-comment-form
          *ngIf="showForm"
          [comment]="selectedComment"
          [postId]="postId"
          (save)="saveComment($event)"
          (cancel)="cancelForm()"
        ></app-comment-form>
      </div>
    </div>
  `,
  styles: []
})
export class CommentListComponent implements OnInit {
  @Input() postId!: number;
  
  comments: Comment[] = [];
  showForm = false;
  selectedComment: Comment | null = null;
  error = '';

  constructor(private commentsService: CommentsService) {}

  ngOnInit(): void {
    this.loadComments();
    
    // Subscribe to comment updates
    this.commentsService.comments$.subscribe(allComments => {
      this.comments = allComments.filter(comment => comment.postId === this.postId);
    });
  }

  loadComments(): void {
    this.commentsService.getCommentsByPost(this.postId).subscribe({
      next: (comments) => {
        this.comments = comments;
      },
      error: (err) => {
        this.error = err.message;
      }
    });
  }

  openEditModal(comment: Comment): void {
    this.selectedComment = { ...comment };
    this.showForm = true;
  }
  
  cancelForm(): void {
    this.showForm = false;
    this.selectedComment = null;
  }

  saveComment(comment: Comment): void {
    if (this.selectedComment && this.selectedComment.id) {
      // Update existing comment
      this.commentsService.updateComment(comment).subscribe({
        next: () => {
          this.cancelForm();
        },
        error: (err) => {
          this.error = err.message;
        }
      });
    } else {
      // Create new comment
      this.commentsService.createComment(comment).subscribe({
        next: () => {
          this.cancelForm();
        },
        error: (err) => {
          this.error = err.message;
        }
      });
    }
  }

  deleteComment(id: number): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentsService.deleteComment(id, this.postId).subscribe({
        next: () => {
          // UI already updated optimistically in service
        },
        error: (err) => {
          this.error = err.message;
        }
      });
    }
  }
}