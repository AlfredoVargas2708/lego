import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
  
  constructor(private legoService: LegoService) {}
}
