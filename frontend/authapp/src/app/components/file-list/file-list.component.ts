import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit {
  fileNames: string[] = [];
  searchText: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchFileNames();
  }
 
  fetchFileNames(): void {
    this.http.get<any[]>('http://localhost:2000/api/files',{
      withCredentials:true
    }).subscribe(
      (files: any[]) => {
        this.fileNames = files.map(file => file.name);
      },
      error => {
        console.error('Error fetching file names:', error);
      }
    );
  }

  filterFiles(): string[] {
    const searchTerm = this.searchText.toLowerCase().trim();
    return this.fileNames.filter(fileName => fileName.toLowerCase().includes(searchTerm));
  }
  
}
