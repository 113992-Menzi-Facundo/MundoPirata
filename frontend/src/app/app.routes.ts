import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { NoticiasComponent } from './components/noticias/noticias.component';
import { MapaComponent } from './components/mapa/mapa.component';
import { DonacionesComponent } from './components/donaciones/donaciones.component';
import { EntradasComponent } from './components/entradas/entradas.component';
import { CalendarioComponent } from './components/calendario/calendario.component';
import { ProfileComponent } from './components/auth/profile/profile.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { FaqComponent } from './components/faq/faq.component';
import { TerminosComponent } from './components/terminos/terminos.component';
import { AdminComponent } from './components/admin/admin.component';

export const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent,
    title: 'Inicio - Club Atlético Belgrano'
  },
  {
    path: 'noticias',
    component: NoticiasComponent,
    title: 'Noticias - Club Atlético Belgrano'
  },
  {
    path: 'mapa',
    component: MapaComponent,
    title: 'Mapa del Estadio - Club Atlético Belgrano'
  },
  {
    path: 'donaciones',
    component: DonacionesComponent,
    title: 'Donaciones - Club Atlético Belgrano'
  },
  {
    path: 'entradas',
    component: EntradasComponent,
    title: 'Entradas - Club Atlético Belgrano'
  },
  {
    path: 'calendario',
    component: CalendarioComponent,
    title: 'Calendario - Club Atlético Belgrano'
  },
  {
    path: 'faq',
    component: FaqComponent,
    title: 'Preguntas Frecuentes - Club Atlético Belgrano'
  },
  {
    path: 'terminos',
    component: TerminosComponent,
    title: 'Términos y Condiciones - Club Atlético Belgrano'
  },
  {
    path: 'admin',
    component: AdminComponent,
    title: 'Panel de Administración - Club Atlético Belgrano'
  },
  {
    path: 'profile',
    component: ProfileComponent,
    title: 'Perfil - Club Atlético Belgrano'
  },
  {
    path: 'auth/login',
    component: LoginComponent,
    title: 'Iniciar Sesión - Club Atlético Belgrano'
  },
  {
    path: 'auth/register',
    component: RegisterComponent,
    title: 'Registro - Club Atlético Belgrano'
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];
