import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Comment } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private apiUrl = 'https://jsonplaceholder.typicode.com/comments';
  private commentsSubject = new BehaviorSubject<Comment[]>([]);
  public comments$ = this.commentsSubject.asObservable();

  // In-memory store
  private comments: Comment[] = [];
  private nextId = 0;
  
  // Cache for comments by postId
  private commentsByPost: { [key: number]: Comment[] } = {};

  constructor(private http: HttpClient) {}

  getCommentsByPost(postId: number): Observable<Comment[]> {
    // If we already have these comments cached, return them
    if (this.commentsByPost[postId]) {
      return of(this.commentsByPost[postId]);
    }

    // Otherwise fetch from API
    return this.http.get<Comment[]>(`${this.apiUrl}?postId=${postId}`).pipe(
      tap(comments => {
        // Update our local cache
        this.commentsByPost[postId] = comments;
        
        // Update overall comment cache
        comments.forEach(comment => {
          const index = this.comments.findIndex(c => c.id === comment.id);
          if (index === -1) {
            this.comments.push(comment);
          } else {
            this.comments[index] = comment;
          }
        });
        
        // Update nextId
        if (comments.length > 0) {
          this.nextId = Math.max(
            this.nextId,
            Math.max(...comments.map(comment => comment.id || 0)) + 1
          );
        }
        
        this.commentsSubject.next([...this.comments]);
      }),
      catchError(error => {
        console.error(`Error fetching comments for post ${postId}`, error);
        return throwError(() => new Error('Failed to fetch comments. Please try again later.'));
      })
    );
  }

  createComment(comment: Comment): Observable<Comment> {
    // Assign a temporary id (negative to avoid conflicts with API)
    const newComment: Comment = {
      ...comment,
      id: this.nextId++
    };

    // Optimistically update local cache
    this.comments.push(newComment);
    if (this.commentsByPost[comment.postId]) {
      this.commentsByPost[comment.postId].push(newComment);
    } else {
      this.commentsByPost[comment.postId] = [newComment];
    }
    this.commentsSubject.next([...this.comments]);

    // Send to API
    return this.http.post<Comment>(this.apiUrl, comment).pipe(
      map(response => {
        // If API returns a valid id, update our local copy
        if (response.id) {
          const index = this.comments.findIndex(c => c.id === newComment.id);
          if (index !== -1) {
            this.comments[index] = { ...newComment, id: response.id };
            
            // Update in the postId cache too
            if (this.commentsByPost[comment.postId]) {
              const postIndex = this.commentsByPost[comment.postId].findIndex(c => c.id === newComment.id);
              if (postIndex !== -1) {
                this.commentsByPost[comment.postId][postIndex] = { ...newComment, id: response.id };
              }
            }
            
            this.commentsSubject.next([...this.comments]);
          }
          return { ...newComment, id: response.id };
        }
        return newComment;
      }),
      catchError(error => {
        console.error('Error creating comment', error);
        // Remove from local cache on error
        this.comments = this.comments.filter(c => c.id !== newComment.id);
        if (this.commentsByPost[comment.postId]) {
          this.commentsByPost[comment.postId] = this.commentsByPost[comment.postId].filter(c => c.id !== newComment.id);
        }
        this.commentsSubject.next([...this.comments]);
        return throwError(() => new Error('Failed to create comment. Please try again later.'));
      })
    );
  }

  updateComment(comment: Comment): Observable<Comment> {
    if (!comment.id) {
      return throwError(() => new Error('Comment ID is required for update'));
    }

    // Optimistically update local cache
    const index = this.comments.findIndex(c => c.id === comment.id);
    if (index !== -1) {
      this.comments[index] = { ...comment };
      
      // Update in the postId cache too
      if (this.commentsByPost[comment.postId]) {
        const postIndex = this.commentsByPost[comment.postId].findIndex(c => c.id === comment.id);
        if (postIndex !== -1) {
          this.commentsByPost[comment.postId][postIndex] = { ...comment };
        }
      }
      
      this.commentsSubject.next([...this.comments]);
    }

    // Send to API
    return this.http.put<Comment>(`${this.apiUrl}/${comment.id}`, comment).pipe(
      map(() => comment), // JSONPlaceholder doesn't return the updated entity
      catchError(error => {
        console.error(`Error updating comment ${comment.id}`, error);
        // Revert local change on error
        if (index !== -1) {
          const originalComment = this.comments[index];
          this.comments[index] = originalComment;
          
          // Revert in the postId cache too
          if (this.commentsByPost[comment.postId]) {
            const postIndex = this.commentsByPost[comment.postId].findIndex(c => c.id === comment.id);
            if (postIndex !== -1) {
              this.commentsByPost[comment.postId][postIndex] = originalComment;
            }
          }
          
          this.commentsSubject.next([...this.comments]);
        }
        return throwError(() => new Error('Failed to update comment. Please try again later.'));
      })
    );
  }

  deleteComment(id: number, postId: number): Observable<void> {
    // Optimistically update local cache
    const index = this.comments.findIndex(c => c.id === id);
    const deletedComment = index !== -1 ? this.comments[index] : null;
    
    if (index !== -1) {
      this.comments.splice(index, 1);
      
      // Remove from postId cache too
      if (this.commentsByPost[postId]) {
        this.commentsByPost[postId] = this.commentsByPost[postId].filter(c => c.id !== id);
      }
      
      this.commentsSubject.next([...this.comments]);
    }

    // Send to API
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined),
      catchError(error => {
        console.error(`Error deleting comment ${id}`, error);
        // Revert local change on error
        if (deletedComment) {
          this.comments.splice(index, 0, deletedComment);
          
          // Revert in the postId cache too
          if (this.commentsByPost[postId]) {
            this.commentsByPost[postId].push(deletedComment);
          } else {
            this.commentsByPost[postId] = [deletedComment];
          }
          
          this.commentsSubject.next([...this.comments]);
        }
        return throwError(() => new Error('Failed to delete comment. Please try again later.'));
      })
    );
  }
}