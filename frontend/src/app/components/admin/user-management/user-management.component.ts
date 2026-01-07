import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { User, UserAdminCreate, UserAdminUpdate } from '../../../services/auth.interface';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  selectedRole: string = 'all';
  isLoading = false;
  isSubmitting = false;
  
  // Formularios
  userForm!: FormGroup;
  isEditMode = false;
  editingUserId: number | null = null;
  showUserModal = false;
  
  // Usuario actual para evitar auto-eliminación
  currentUser: User | null = null;

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserValue();
    this.loadUsers();
  }

  initializeForm() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user', Validators.required],
      dni: ['']
    });
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.notificationService.error(
          'Error al cargar usuarios',
          'No se pudieron cargar los usuarios. Intenta nuevamente.'
        );
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.users];

    // Filtrar por búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    // Filtrar por rol
    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === this.selectedRole);
    }

    this.filteredUsers = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onRoleFilterChange() {
    this.applyFilters();
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editingUserId = null;
    this.userForm.reset({
      role: 'user'
    });
    // En modo crear, password es requerido
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('email')?.enable();
    this.showUserModal = true;
  }

  openEditModal(user: User) {
    this.isEditMode = true;
    this.editingUserId = user.id;
    
    this.userForm.patchValue({
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      dni: user.dni || ''
    });
    
    // En modo editar, password no es requerido y email no es editable
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('email')?.disable();
    
    this.showUserModal = true;
  }

  closeModal() {
    this.showUserModal = false;
    this.userForm.reset();
    this.isEditMode = false;
    this.editingUserId = null;
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.notificationService.formError(['Por favor, completa todos los campos requeridos correctamente.']);
      return;
    }

    if (this.isEditMode) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser() {
    const userData: UserAdminCreate = this.userForm.value;
    
    this.notificationService.showLoading();
    this.userService.createUser(userData).subscribe({
      next: (newUser) => {
        this.notificationService.hideLoading();
        this.notificationService.actionSuccess(
          'Usuario creado',
          `El usuario ${newUser.name} ${newUser.lastName} ha sido creado exitosamente.`
        );
        this.loadUsers();
        this.closeModal();
      },
      error: (error) => {
        this.notificationService.hideLoading();
        console.error('Error creando usuario:', error);
        if (error.status === 400) {
          this.notificationService.error(
            'Error al crear usuario',
            'El email ya está registrado o los datos son inválidos.'
          );
        } else {
          this.notificationService.error(
            'Error al crear usuario',
            'No se pudo crear el usuario. Intenta nuevamente.'
          );
        }
      }
    });
  }

  updateUser() {
    if (!this.editingUserId) return;

    const userData: UserAdminUpdate = {
      name: this.userForm.get('name')?.value,
      lastName: this.userForm.get('lastName')?.value,
      role: this.userForm.get('role')?.value,
      dni: this.userForm.get('dni')?.value || undefined
    };

    this.notificationService.showLoading();
    this.userService.updateUser(this.editingUserId, userData).subscribe({
      next: (updatedUser) => {
        this.notificationService.hideLoading();
        this.notificationService.actionSuccess(
          'Usuario actualizado',
          `Los datos de ${updatedUser.name} ${updatedUser.lastName} han sido actualizados.`
        );
        this.loadUsers();
        this.closeModal();
      },
      error: (error) => {
        this.notificationService.hideLoading();
        console.error('Error actualizando usuario:', error);
        this.notificationService.error(
          'Error al actualizar usuario',
          'No se pudieron actualizar los datos del usuario.'
        );
      }
    });
  }

  deleteUser(user: User) {
    // Verificar que no se elimine a sí mismo
    if (this.currentUser && user.id === this.currentUser.id) {
      this.notificationService.warning(
        'Acción no permitida',
        'No puedes eliminar tu propia cuenta.'
      );
      return;
    }

    this.notificationService.confirmDelete(
      `¿Eliminar usuario?`,
      `¿Estás seguro de que quieres eliminar al usuario <strong>${user.name} ${user.lastName}</strong>?<br>
       <small class="text-muted">Email: ${user.email}</small><br>
       <small class="text-danger">Esta acción no se puede deshacer.</small>`
    ).then((result) => {
      if (result.isConfirmed) {
        this.notificationService.showLoading();
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.notificationService.hideLoading();
            this.notificationService.actionSuccess(
              'Usuario eliminado',
              `El usuario ${user.name} ${user.lastName} ha sido eliminado del sistema.`
            );
            this.loadUsers();
          },
          error: (error) => {
            this.notificationService.hideLoading();
            console.error('Error eliminando usuario:', error);
            if (error.status === 400) {
              this.notificationService.error(
                'No se puede eliminar',
                'No se puede eliminar el último administrador del sistema.'
              );
            } else {
              this.notificationService.error(
                'Error al eliminar usuario',
                'No se pudo eliminar el usuario. Intenta nuevamente.'
              );
            }
          }
        });
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    return role === 'admin' ? 'bg-warning text-dark' : 'bg-primary';
  }

  getRoleText(role: string): string {
    return role === 'admin' ? 'Administrador' : 'Usuario';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = 'all';
    this.applyFilters();
  }
} 