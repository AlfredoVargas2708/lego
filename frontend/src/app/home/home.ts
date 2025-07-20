import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
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
  totalPages: number = 1;
  legoData: any = [];
  imagesData: any = [];
  searchOptions: any = [];
  resultOptions: any = [];
  selectedOption: string = '';

  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(private legoService: LegoService, private cdr: ChangeDetectorRef) {
    this.legoService.getColumns().subscribe((result) => {
      this.searchOptions = result.nombres_columnas
    })
  }

  getSelectedOption(event: any) {
    this.selectedOption = event.target.value;
    this.searchInput.nativeElement.value = '';
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 1000);
  }

  getResultOptions(event: any) {
    this.legoService.getOptions(this.selectedOption.toLowerCase(), event.target.value).subscribe({
      next: (result) => {
        this.resultOptions = result.data;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al obtener los resultados:', error.error.message);
        this.resultOptions = [];
        this.cdr.markForCheck();
      }
    })
  }

  getLegoPieces(selected: any) {
    this.legoService.getResults(this.selectedOption.toLowerCase(), selected, this.page, this.pageSize).subscribe({
      next: (response) => {
        this.legoData = response.data;
        this.imagesData = response.imgData;
        this.pageSize = response.pagination.pageSize;
        this.totalPages = response.pagination.totalPages;
        this.resultOptions = [];
        this.selectedOption = '';
        this.searchInput.nativeElement.value = '';
        this.cdr.markForCheck();
        console.log(this.legoData, this.imagesData);
      },
      error: (error) => {
        console.error('Error al obtener las piezas de Lego:', error.error.message);
      }
    });
  }
}
