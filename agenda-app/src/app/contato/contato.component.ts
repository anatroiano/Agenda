import { Component, OnInit } from '@angular/core';
import { ContatoService } from '../contato.service';
import { Contato } from './Contato';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { ContatoDetalheComponent } from '../contato-detalhe/contato-detalhe.component';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contato',
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.css']
})
export class ContatoComponent implements OnInit {

  formulario: FormGroup;
  contatos: Contato[] = [];
  colunas = ['foto','id', 'nome', 'email', 'favorito'];
  
  totalElementos = 0;
  pagina = 0;
  tamanho = 5;
  pageSizeOptions : number[] = [5];

  constructor(
    private service : ContatoService,
    private fb : FormBuilder,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.montarFormulário();
    this.listarContatos(this.pagina, this.tamanho);
  }

  montarFormulário() {
    this.formulario = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]]
    })
  }

  listarContatos(pagina = 0, tamanho = 5) {
    this.service.list(pagina, tamanho).subscribe(response => {
      this.contatos = response.content;
      this.totalElementos = response.totalElements;
      this.pagina = response.number;
    })
  }

  favoritarContato(contato: Contato) {
    this.service.favorite(contato).subscribe(response => {
      contato.favorito = !contato.favorito;
    })
  }

  adicionarContato() {
    const formValues = this.formulario.value; 
    const contato : Contato = new Contato(formValues.nome, formValues.email)
    
    this.service.adicionar(contato).subscribe(
      response => {
        this.listarContatos();
        this.snackbar.open('O contato foi adicionado!', 'Sucesso!', {
          duration: 2000
        })
        this.formulario.reset();
      })
  }

  uploadFoto(event, contato) {
    console.log("passou")
    const files = event.target.files; 
    if(files) {
      const foto = files[0];
      const formData: FormData = new FormData();
      formData.append("foto", foto);
      this.service.upload(contato, formData)
                  .subscribe( response => this.listarContatos());
    }
  }

  visualizarContato(contato: Contato) {
    this.dialog.open(ContatoDetalheComponent, {
      width: '400px',
      height: '450px',
      data: contato
    })
  }

  removerFoto(contato: Contato) {
    contato.foto = null;
  }

  paginar(event: PageEvent) {
    console.log(event.pageIndex)
    this.pagina = event.pageIndex;
    this.listarContatos(this.pagina, this.tamanho)
  }

}