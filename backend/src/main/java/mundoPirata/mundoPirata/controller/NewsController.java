package mundoPirata.mundoPirata.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mundoPirata.mundoPirata.dto.NewsDTO;
import mundoPirata.mundoPirata.dto.NewsCreateDTO;
import mundoPirata.mundoPirata.dto.NewsUpdateDTO;
import mundoPirata.mundoPirata.service.NewsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Noticias", description = "Gestión de noticias del club")
public class NewsController {
    
    private final NewsService newsService;
    
    // Endpoints públicos
    @GetMapping("/public")
    @Operation(summary = "Obtener noticias activas", description = "Retorna todas las noticias activas ordenadas por fecha descendente")
    @ApiResponse(responseCode = "200", description = "Lista de noticias activas")
    public ResponseEntity<List<NewsDTO>> getAllActiveNews() {
        List<NewsDTO> news = newsService.getAllActiveNews();
        return ResponseEntity.ok(news);
    }
    
    @GetMapping("/public/{id}")
    @Operation(summary = "Obtener noticia por ID", description = "Retorna una noticia específica por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Noticia encontrada"),
        @ApiResponse(responseCode = "404", description = "Noticia no encontrada")
    })
    public ResponseEntity<NewsDTO> getNewsById(@Parameter(description = "ID de la noticia") @PathVariable Long id) {
        return newsService.getNewsById(id)
                .map(news -> ResponseEntity.ok(news))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/public/search")
    @Operation(summary = "Buscar noticias por título", description = "Busca noticias que contengan el texto en el título")
    public ResponseEntity<List<NewsDTO>> searchNews(@Parameter(description = "Texto a buscar en el título") @RequestParam String title) {
        List<NewsDTO> news = newsService.searchNewsByTitle(title);
        return ResponseEntity.ok(news);
    }
    
    // Endpoints administrativos
    @PostMapping
    @Operation(summary = "Crear nueva noticia", description = "Crea una nueva noticia en el sistema. Solo requiere typeId, title, content y authorId.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Noticia creada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Error en los datos de la noticia")
    })
    public ResponseEntity<NewsDTO> createNews(@Valid @RequestBody NewsCreateDTO newsCreateDTO) {
        try {
            NewsDTO createdNews = newsService.createNews(newsCreateDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdNews);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar noticia", description = "Actualiza una noticia existente. Todos los campos son opcionales.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Noticia actualizada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Noticia no encontrada")
    })
    public ResponseEntity<NewsDTO> updateNews(@Parameter(description = "ID de la noticia") @PathVariable Long id, @Valid @RequestBody NewsUpdateDTO newsUpdateDTO) {
        try {
            NewsDTO updatedNews = newsService.updateNews(id, newsUpdateDTO);
            return ResponseEntity.ok(updatedNews);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping
    @Operation(summary = "Obtener todas las noticias", description = "Retorna todas las noticias (activas e inactivas) - Solo administradores")
    public ResponseEntity<List<NewsDTO>> getAllNews() {
        List<NewsDTO> news = newsService.getAllNews();
        return ResponseEntity.ok(news);
    }
    
    @GetMapping("/type/{typeId}")
    @Operation(summary = "Obtener noticias por tipo", description = "Retorna todas las noticias de un tipo específico")
    public ResponseEntity<List<NewsDTO>> getNewsByType(@Parameter(description = "ID del tipo de noticia") @PathVariable Long typeId) {
        try {
            List<NewsDTO> news = newsService.getNewsByType(typeId);
            return ResponseEntity.ok(news);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/toggle-state")
    @Operation(summary = "Cambiar estado de noticia", description = "Activa o desactiva una noticia")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Estado cambiado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Noticia no encontrada")
    })
    public ResponseEntity<Void> toggleNewsState(@Parameter(description = "ID de la noticia") @PathVariable Long id) {
        try {
            newsService.toggleNewsState(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar noticia", description = "Marca una noticia como inactiva (eliminación lógica)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Noticia eliminada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Noticia no encontrada")
    })
    public ResponseEntity<Void> deleteNews(@Parameter(description = "ID de la noticia") @PathVariable Long id) {
        try {
            newsService.deleteNews(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 