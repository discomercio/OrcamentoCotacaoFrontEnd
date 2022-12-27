import { Component, OnInit } from '@angular/core';
import { lojaEstilo } from 'src/app/dto/lojas/lojaEstilo';

@Component({
  selector: 'app-publico-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class PublicoHeaderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  imagemLogotipo:string;
  corCabecalho:string;
}
