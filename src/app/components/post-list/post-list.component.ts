import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsService } from '../../services/posts.service';
import { Post } from '../../models/post.model';
import { PostItemComponent } from '../post-item/post-item.component';
import { PostFormComponent } from '../post-form/post-form.component';
import { LoadingSpinnerComponent } from '../ui/loading-spinner/loading-spinner.component';
import { AlertComponent } from '../ui/alert/alert.component';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    CommonModule,
    PostItemComponent,
    PostFormComponent,
    LoadingSpinnerComponent,
    AlertComponent
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Posts</h1>
        <button 
          (click)="openCreateModal()"
          class="btn-primary flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Create Post
        </button>
      </div>

      <app-alert 
        *ngIf="error" 
        [message]="error" 
        [type]="'error'"
        (dismiss)="error = ''"
      ></app-alert>

      <div *ngIf="loading" class="flex justify-center py-12">
        <app-loading-spinner></app-loading-spinner>
      </div>

      <div *ngIf="!loading && posts.length === 0" class="text-center py-12">
        <p class="text-gray-600 text-lg">No posts found. Create your first post!</p>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <app-post-item 
          *ngFor="let post of posts" 
          [post]="post"
          (edit)="openEditModal(post)"
          (delete)="deletePost(post.id!)"
        ></app-post-item>
      </div>

      <app-post-form
        *ngIf="showModal"
        [post]="selectedPost"
        (save)="savePost($event)"
        (cancel)="closeModal()"
      ></app-post-form>
    </div>
  `,
  styles: []
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  loading = true;
  error = '';
  showModal = false;
  selectedPost: Post | null = null;

  constructor(private postsService: PostsService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.error = '';
    
    this.postsService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.selectedPost = null;
    this.showModal = true;
  }

  openEditModal(post: Post): void {
    this.selectedPost = { ...post };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPost = null;
  }

  savePost(post: Post): void {
    if (this.selectedPost && this.selectedPost.id) {
      // Update existing post
      this.postsService.updatePost(post).subscribe({
        next: () => {
          this.closeModal();
        },
        error: (err) => {
          this.error = err.message;
        }
      });
    } else {
      // Create new post
      this.postsService.createPost(post).subscribe({
        next: () => {
          this.closeModal();
        },
        error: (err) => {
          this.error = err.message;
        }
      });
    }
  }

  deletePost(id: number): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postsService.deletePost(id).subscribe({
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