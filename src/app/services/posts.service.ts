import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private apiUrl = 'https://jsonplaceholder.typicode.com/posts';
  private postsSubject = new BehaviorSubject<Post[]>([]);
  public posts$ = this.postsSubject.asObservable();

  // In-memory store
  private posts: Post[] = [];
  private nextId = 0;

  constructor(private http: HttpClient) {}

  getPosts(): Observable<Post[]> {
    // If we already have posts, return them from memory
    if (this.posts.length > 0) {
      return of(this.posts);
    }

    // Otherwise fetch from API
    return this.http.get<Post[]>(this.apiUrl).pipe(
      tap(posts => {
        this.posts = posts;
        this.nextId = Math.max(...posts.map(post => post.id || 0)) + 1;
        this.postsSubject.next([...this.posts]);
      }),
      catchError(error => {
        console.error('Error fetching posts', error);
        return throwError(() => new Error('Failed to fetch posts. Please try again later.'));
      })
    );
  }

  getPost(id: number): Observable<Post> {
    // Try to find in local cache first
    const cachedPost = this.posts.find(post => post.id === id);
    if (cachedPost) {
      return of(cachedPost);
    }

    // Otherwise fetch from API
    return this.http.get<Post>(`${this.apiUrl}/${id}`).pipe(
      tap(post => {
        // Update cache if the post wasn't there
        const index = this.posts.findIndex(p => p.id === post.id);
        if (index === -1) {
          this.posts.push(post);
          this.postsSubject.next([...this.posts]);
        }
      }),
      catchError(error => {
        console.error(`Error fetching post ${id}`, error);
        return throwError(() => new Error('Failed to fetch post. Please try again later.'));
      })
    );
  }

  createPost(post: Post): Observable<Post> {
    // Assign a temporary id (negative to avoid conflicts with API)
    const newPost: Post = {
      ...post,
      id: this.nextId++,
      userId: 1 // Default userId
    };

    // Optimistically update local cache
    this.posts.unshift(newPost);
    this.postsSubject.next([...this.posts]);

    // Send to API
    return this.http.post<Post>(this.apiUrl, post).pipe(
      map(response => {
        // If API returns a valid id, update our local copy
        if (response.id) {
          const index = this.posts.findIndex(p => p.id === newPost.id);
          if (index !== -1) {
            this.posts[index] = { ...newPost, id: response.id };
            this.postsSubject.next([...this.posts]);
          }
          return { ...newPost, id: response.id };
        }
        return newPost;
      }),
      catchError(error => {
        console.error('Error creating post', error);
        // Remove from local cache on error
        this.posts = this.posts.filter(p => p.id !== newPost.id);
        this.postsSubject.next([...this.posts]);
        return throwError(() => new Error('Failed to create post. Please try again later.'));
      })
    );
  }

  updatePost(post: Post): Observable<Post> {
    if (!post.id) {
      return throwError(() => new Error('Post ID is required for update'));
    }

    // Optimistically update local cache
    const index = this.posts.findIndex(p => p.id === post.id);
    if (index !== -1) {
      this.posts[index] = { ...post };
      this.postsSubject.next([...this.posts]);
    }

    // Send to API
    return this.http.put<Post>(`${this.apiUrl}/${post.id}`, post).pipe(
      map(() => post), // JSONPlaceholder doesn't return the updated entity
      catchError(error => {
        console.error(`Error updating post ${post.id}`, error);
        // Revert local change on error
        if (index !== -1) {
          this.posts[index] = { ...this.posts[index], ...post };
          this.postsSubject.next([...this.posts]);
        }
        return throwError(() => new Error('Failed to update post. Please try again later.'));
      })
    );
  }

  deletePost(id: number): Observable<void> {
    // Optimistically update local cache
    const index = this.posts.findIndex(p => p.id === id);
    const deletedPost = index !== -1 ? this.posts[index] : null;
    
    if (index !== -1) {
      this.posts.splice(index, 1);
      this.postsSubject.next([...this.posts]);
    }

    // Send to API
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined),
      catchError(error => {
        console.error(`Error deleting post ${id}`, error);
        // Revert local change on error
        if (deletedPost) {
          this.posts.splice(index, 0, deletedPost);
          this.postsSubject.next([...this.posts]);
        }
        return throwError(() => new Error('Failed to delete post. Please try again later.'));
      })
    );
  }

  // Helper method to refresh posts from API
  refreshPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl).pipe(
      tap(posts => {
        this.posts = posts;
        this.nextId = Math.max(...posts.map(post => post.id || 0)) + 1;
        this.postsSubject.next([...this.posts]);
      }),
      catchError(error => {
        console.error('Error refreshing posts', error);
        return throwError(() => new Error('Failed to refresh posts. Please try again later.'));
      })
    );
  }
}