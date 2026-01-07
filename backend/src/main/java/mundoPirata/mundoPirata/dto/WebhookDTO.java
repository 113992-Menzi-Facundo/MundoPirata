package mundoPirata.mundoPirata.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WebhookDTO {
    
    private String id;
    private String type;
    private String data;
    private String action;
    private String date;
    private String userId;
    private String apiVersion;
    private String liveMode;
} 