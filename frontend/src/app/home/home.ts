import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { LegoService } from '../lego.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  page: number = 1;
  pageSize: number = 10;
  legoData: any = [];
  searchOptions: any = [];
  resultOptions: any = [];
  selectedOption: string = '';

  @ViewChild('searchInput') searchInput!: ElementRef;
  
  constructor(private legoService: LegoService) {
    this.legoService.getColumns().subscribe((result) => {
      this.searchOptions = result.nombres_columnas
    })
  }

  getSelectedOption(event: any) {
    this.selectedOption = event.target.value;
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 1000);
  }

  getResultOptions(event: any) {
    this.legoService.getOptions(this.selectedOption.toLowerCase(), event.target.value).subscribe((result) => {
      console.log(result);
    })
  }
}
