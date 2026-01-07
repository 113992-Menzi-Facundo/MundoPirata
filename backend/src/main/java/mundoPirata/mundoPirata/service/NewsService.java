package mundoPirata.mundoPirata.service;

import lombok.RequiredArgsConstructor;
import mundoPirata.mundoPirata.dto.NewsDTO;
import mundoPirata.mundoPirata.dto.NewsCreateDTO;
import mundoPirata.mundoPirata.dto.NewsUpdateDTO;
import mundoPirata.mundoPirata.entity.News;
import mundoPirata.mundoPirata.entity.NewsType;
import mundoPirata.mundoPirata.entity.User;
import mundoPirata.mundoPirata.repository.NewsRepository;
import mundoPirata.mundoPirata.repository.NewsTypeRepository;
import mundoPirata.mundoPirata.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NewsService {
    
    private final NewsRepository newsRepository;
    private final NewsTypeRepository newsTypeRepository;
    private final UserRepository userRepository;
    
    public NewsDTO createNews(NewsCreateDTO newsCreateDTO) {
        NewsType newsType = newsTypeRepository.findById(newsCreateDTO.getTypeId())
                .orElseThrow(() -> new RuntimeException("Tipo de noticia no encontrado"));
        
        User author = userRepository.findById(newsCreateDTO.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Autor no encontrado"));
        
        News news = new News();
        news.setType(newsType);
        news.setTitle(newsCreateDTO.getTitle());
        news.setContent(newsCreateDTO.getContent());
        news.setAuthor(author);
        news.setDate(newsCreateDTO.getDate() != null ? newsCreateDTO.getDate() : LocalDate.now());
        news.setState(true);
        
        News savedNews = newsRepository.save(news);
        return convertToDTO(savedNews);
    }
    
    public NewsDTO updateNews(Long newsId, NewsUpdateDTO newsUpdateDTO) {
        News news = newsRepository.findById(newsId)
                .orElseThrow(() -> new RuntimeException("Noticia no encontrada"));
        
        if (newsUpdateDTO.getTypeId() != null) {
            NewsType newsType = newsTypeRepository.findById(newsUpdateDTO.getTypeId())
                    .orElseThrow(() -> new RuntimeException("Tipo de noticia no encontrado"));
            news.setType(newsType);
        }
        
        if (newsUpdateDTO.getTitle() != null && !newsUpdateDTO.getTitle().trim().isEmpty()) {
            news.setTitle(newsUpdateDTO.getTitle());
        }
        
        if (newsUpdateDTO.getContent() != null && !newsUpdateDTO.getContent().trim().isEmpty()) {
            news.setContent(newsUpdateDTO.getContent());
        }
        
        if (newsUpdateDTO.getDate() != null) {
            news.setDate(newsUpdateDTO.getDate());
        }
        
        News updatedNews = newsRepository.save(news);
        return convertToDTO(updatedNews);
    }
    
    public Optional<NewsDTO> getNewsById(Long newsId) {
        return newsRepository.findById(newsId)
                .map(this::convertToDTO);
    }
    
    public List<NewsDTO> getAllActiveNews() {
        return newsRepository.findByStateTrueOrderByDateDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<NewsDTO> getAllNews() {
        return newsRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<NewsDTO> getNewsByType(Long typeId) {
        NewsType newsType = newsTypeRepository.findById(typeId)
                .orElseThrow(() -> new RuntimeException("Tipo de noticia no encontrado"));
        
        return newsRepository.findByType(newsType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<NewsDTO> searchNewsByTitle(String title) {
        return newsRepository.findByTitleContainingIgnoreCase(title).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public void toggleNewsState(Long newsId) {
        News news = newsRepository.findById(newsId)
                .orElseThrow(() -> new RuntimeException("Noticia no encontrada"));
        
        news.setState(!news.getState());
        newsRepository.save(news);
    }
    
    public void deleteNews(Long newsId) {
        News news = newsRepository.findById(newsId)
                .orElseThrow(() -> new RuntimeException("Noticia no encontrada"));
        
        news.setState(false);
        newsRepository.save(news);
    }
    
    private NewsDTO convertToDTO(News news) {
        NewsDTO dto = new NewsDTO();
        dto.setId(news.getId());
        dto.setTypeId(news.getType().getId());
        dto.setTypeDescription(news.getType().getType());
        dto.setTitle(news.getTitle());
        dto.setContent(news.getContent());
        dto.setAuthorId(news.getAuthor().getId());
        dto.setAuthorName(news.getAuthor().getName() + " " + news.getAuthor().getLastName());
        dto.setDate(news.getDate());
        dto.setState(news.getState());
        dto.setCreatedAt(news.getCreatedAt());
        dto.setUpdatedAt(news.getUpdatedAt());
        return dto;
    }
} 