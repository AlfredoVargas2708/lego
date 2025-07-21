import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LegoService } from '../lego.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  page: number = 1;
  pageSize: number = 6;
  totalPages: number = 0;
  totalLegos: number = 0;
  maxPagesToShow: number = 6;
  valueSelected: string = '';
  isLoading: boolean = false;
  legoData: any = [];
  searchOptions: any = [];
  resultOptions: any = [];
  selectedOption: string = '';
  isAdding: boolean = true;

  addLegoForm: FormGroup = new FormGroup({});
  editLegoForm: FormGroup = new FormGroup({})

  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(private legoService: LegoService, private cdr: ChangeDetectorRef, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.legoService.getColumns().subscribe((result) => {
      this.searchOptions = result.nombres_columnas
      this.searchOptions.forEach((option: any) => {
        this.addLegoForm.addControl(option.toLowerCase(), new FormControl(''));
        this.editLegoForm.addControl(option.toLowerCase(), new FormControl(''));
      });
      this.cdr.markForCheck();
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
    this.valueSelected = selected;
    this.resultOptions = [];
    this.searchInput.nativeElement.value = selected;
    this.isLoading = true;
    this.legoService.getResults(this.selectedOption.toLowerCase(), selected, this.page, this.pageSize).subscribe({
      next: (response) => {
        this.legoData = response.data;
        this.legoData = this.legoData.map((lego: any) => {
          return {
            ...lego,
            imgPiece: response.imgData.codeImage ? response.imgData.codeImage : response.imgData.codeImages.find((img: any) => img.piece === lego.pieza) ? response.imgData.codeImages.find((img: any) => img.piece === lego.pieza).img : '',
            imgLego: response.imgData.legoImage ? response.imgData.legoImage : response.imgData.legoImages.find((img: any) => img.lego === lego.lego) ? response.imgData.legoImages.find((img: any) => img.lego === lego.lego).img : ''
          }
        })
        this.pageSize = response.pagination.pageSize;
        this.totalPages = response.pagination.totalPages;
        this.totalLegos = response.pagination.totalLegos;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al obtener las piezas de Lego:', error.error.message);
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.page) {
      this.page = page;
      this.getLegoPieces(this.valueSelected)
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    let startPage = 1;
    let endPage = this.totalPages;

    if (this.totalPages > this.maxPagesToShow) {
      const half = Math.floor(this.maxPagesToShow / 2);
      startPage = Math.max(1, this.page - half);
      endPage = startPage + this.maxPagesToShow - 1;

      if (endPage > this.totalPages) {
        endPage = this.totalPages;
        startPage = Math.max(1, endPage - this.maxPagesToShow + 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  agregarLego() {
    this.isAdding = true;
  }

  editarLego(piece: any) {
    this.isAdding = false;
    this.editLegoForm.patchValue(piece);
  }
}
