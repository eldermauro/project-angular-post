import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Comment } from '../../models/comment.model';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <form [formGroup]="commentForm" (ngSubmit)="onSubmit()" class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input 
          type="text" 
          id="name" 
          formControlName="name"
          class="form-input"
          placeholder="Your name"
        >
        <div *ngIf="submitted && f['name'].errors" class="mt-1 text-sm text-error-500">
          <span *ngIf="f['name'].errors['required']">Name is required</span>
        </div>
      </div>
      
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input 
          type="email" 
          id="email" 
          formControlName="email"
          class="form-input"
          placeholder="Your email"
        >
        <div *ngIf="submitted && f['email'].errors" class="mt-1 text-sm text-error-500">
          <span *ngIf="f['email'].errors['required']">Email is required</span>
          <span *ngIf="f['email'].errors['email']">Please enter a valid email</span>
        </div>
      </div>
      
      <div>
        <label for="body" class="block text-sm font-medium text-gray-700 mb-1">Comment</label>
        <textarea 
          id="body" 
          formControlName="body"
          class="form-input h-24"
          placeholder="Your comment"
        ></textarea>
        <div *ngIf="submitted && f['body'].errors" class="mt-1 text-sm text-error-500">
          <span *ngIf="f['body'].errors['required']">Comment is required</span>
        </div>
      </div>
      
      <div class="flex justify-end gap-3">
        <button 
          type="button"
          (click)="onCancel.emit()"
          class="btn-secondary"
        >
          Cancel
        </button>
        <button 
          type="submit"
          class="btn-primary"
        >
          {{ comment ? 'Update' : 'Post' }} Comment
        </button>
      </div>
    </form>
  `,
  styles: []
})
export class CommentFormComponent implements OnInit {
  @Input() comment: Comment | null = null;
  @Input() postId!: number;
  @Output() save = new EventEmitter<Comment>();
  @Output() cancel = new EventEmitter<void>();
  
  commentForm!: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.commentForm = this.fb.group({
      name: [this.comment?.name || '', [Validators.required]],
      email: [this.comment?.email || '', [Validators.required, Validators.email]],
      body: [this.comment?.body || '', [Validators.required]]
    });
  }
  
  get f() {
    return this.commentForm.controls;
  }

  get onCancel() {
    return this.cancel;
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.commentForm.invalid) {
      return;
    }
    
    const commentData: Comment = {
      ...this.commentForm.value,
      postId: this.postId
    };
    
    if (this.comment && this.comment.id) {
      commentData.id = this.comment.id;
    }
    
    this.save.emit(commentData);
  }
}