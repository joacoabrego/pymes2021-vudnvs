import { Component, OnInit } from '@angular/core';
import { ContactosService } from '../../services/contactos.service';
import { Contacto } from '../../models/contacto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDialogService } from '../../services/modal-dialog.service';

@Component({
  selector: 'app-contactos',
  templateUrl: './contactos.component.html',
  styleUrls: ['./contactos.component.css'],
})
export class ContactosComponent implements OnInit {
  items: Contacto[] = null;
  TituloAccionABMC = {
    A: '(Agregar)',
    B: '(Eliminar)',
    M: '(Modificar)',
    C: '(Consultar)',
    L: '(Listado)',
  };
  Mensajes = {
    SD: ' No se encontraron registros...',
    RD: ' Revisar los datos ingresados...',
  };
  AccionABMC = 'L';
  FormRegistro: FormGroup;
  submitted = false;
  constructor(
    private contactosService: ContactosService,
    private modalDialogService: ModalDialogService,
    public formBuilder: FormBuilder
  ) {}
  ngOnInit() {
    this.FormRegistro = this.formBuilder.group({
      Nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(50),
        ],
      ],
      FechaNacimiento: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}'
          ),
        ],
      ],
      Telefono: [
        0,
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.maxLength(9),
        ],
      ],
    });
  }

  Buscar() {
    this.AccionABMC = 'L';
    this.contactosService.get().subscribe((res: any) => {
      this.items = res;
    });
  }
  Agregar() {
    this.AccionABMC = 'A';
    this.FormRegistro.reset({});
  }
  Grabar() {
    this.submitted = true;
    // verificar que los validadores esten OK
    if (this.FormRegistro.invalid) {
      return;
    }
    //hacemos una copia de los datos del formulario, para modificar la fecha y luego enviarlo al servidor
    const itemCopy = { ...this.FormRegistro.value };

    //convertir fecha de string dd/MM/yyyy a ISO para que la entienda webapi
    var arrFecha = itemCopy.FechaNacimiento.substr(0, 10).split('/');
    if (arrFecha.length == 3) {
      itemCopy.FechaNacimiento = new Date(
        arrFecha[2],
        arrFecha[1] - 1,
        arrFecha[0]
      ).toISOString();
    }
    if (this.AccionABMC == 'A') {
      this.contactosService.post(itemCopy).subscribe((res: any) => {
        this.Volver();
        this.modalDialogService.Alert('Registro agregado correctamente.');
        this.Buscar();
      });
    }
  }

  Volver() {
    this.AccionABMC = 'L';
  }

  Consultar(item) {
    this.FormRegistro.patchValue(item);
    var arrFecha = item.FechaNacimiento.substr(0, 10).split('-');
    this.FormRegistro.controls.FechaNacimiento.patchValue(
      arrFecha[2] + '/' + arrFecha[1] + '/' + arrFecha[0]
    );
    this.AccionABMC = 'C';
  }
}
