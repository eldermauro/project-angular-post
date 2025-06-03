import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="modal-backdrop" (click)="onBackdropClick($event)">
      <div class="modal-content p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">
            {{ post ? 'Edit Post' : 'Create Post' }}
          </h2>
          <button 
            (click)="onCancel.emit()"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form [formGroup]="postForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              id="title" 
              formControlName="title"
              class="form-input"
              placeholder="Post title"
            >
            <div *ngIf="submitted && f['title'].errors" class="mt-1 text-sm text-error-500">
              <span *ngIf="f['title'].errors['required']">Title is required</span>
            </div>
          </div>
          
          <div class="mb-6">
            <label for="body" class="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea 
              id="body" 
              formControlName="body"
              class="form-input h-32"
              placeholder="Post content"
            ></textarea>
            <div *ngIf="submitted && f['body'].errors" class="mt-1 text-sm text-error-500">
              <span *ngIf="f['body'].errors['required']">Content is required</span>
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
              {{ post ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class PostFormComponent implements OnInit {
  @Input() post: Post | null = null;
  @Output() save = new EventEmitter<Post>();
  @Output() cancel = new EventEmitter<void>();
  
  postForm!: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.postForm = this.fb.group({
      title: [this.post?.title || '', [Validators.required]],
      body: [this.post?.body || '', [Validators.required]]
    });
  }
  
  get f() {
    return this.postForm.controls;
  }

  get onCancel() {
    return this.cancel;
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.postForm.invalid) {
      return;
    }
    
    const postData: Post = {
      ...this.postForm.value
    };
    
    if (this.post && this.post.id) {
      postData.id = this.post.id;
      postData.userId = this.post.userId;
    }
    
    this.save.emit(postData);
  }
  
  onBackdropClick(event: MouseEvent): void {
    // Only close if the backdrop itself was clicked, not its children
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.cancel.emit();
    }
  }
}