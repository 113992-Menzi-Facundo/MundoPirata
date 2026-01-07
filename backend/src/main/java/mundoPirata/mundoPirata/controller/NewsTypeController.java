package mundoPirata.mundoPirata.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import mundoPirata.mundoPirata.entity.NewsType;
import mundoPirata.mundoPirata.repository.NewsTypeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news-types")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Tipos de Noticias", description = "Gestión de tipos de noticias")
public class NewsTypeController {
    
    private final NewsTypeRepository newsTypeRepository;
    
    @GetMapping
    @Operation(summary = "Obtener todos los tipos de noticias", description = "Retorna todos los tipos de noticias disponibles")
    @ApiResponse(responseCode = "200", description = "Lista de tipos de noticias")
    public ResponseEntity<List<NewsType>> getAllNewsTypes() {
        List<NewsType> newsTypes = newsTypeRepository.findAll();
        return ResponseEntity.ok(newsTypes);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Obtener tipo de noticia por ID", description = "Retorna un tipo de noticia específico por su ID")
    public ResponseEntity<NewsType> getNewsTypeById(@PathVariable Long id) {
        return newsTypeRepository.findById(id)
                .map(newsType -> ResponseEntity.ok(newsType))
                .orElse(ResponseEntity.notFound().build());
    }
} 