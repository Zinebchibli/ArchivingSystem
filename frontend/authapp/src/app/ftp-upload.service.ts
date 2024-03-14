import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private http: HttpClient) { }

  uploadFile(formData: FormData) {
    return this.http.post<any>('http://localhost:2000/api/upload', formData,{
      withCredentials:true
    });
  }

  getUploadedFiles() {
    return this.http.get<any>('http://localhost:2000/api/files',{
      withCredentials:true
    });
  }
}
