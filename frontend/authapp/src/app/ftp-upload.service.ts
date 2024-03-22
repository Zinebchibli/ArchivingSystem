import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor() { }

  uploadFile(formData: FormData): Observable<number> {
    return new Observable<number>((observer: Observer<number>) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event: ProgressEvent) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          observer.next(progress);
        }
      });

      xhr.upload.addEventListener('load', () => {
        observer.complete(); 
      });

      xhr.upload.addEventListener('error', (error) => {
        observer.error(error); 
      });

      xhr.open('POST', 'http://localhost:2000/api/upload', true);
      xhr.withCredentials = true;
      xhr.send(formData);

      return () => {
        xhr.abort(); // Cancel upload if observable unsubscribed
      };
    });
  }
}
