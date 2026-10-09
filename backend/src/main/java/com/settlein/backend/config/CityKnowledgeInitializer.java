package com.settlein.backend.config;

import com.settlein.backend.entity.CityKnowledgeChunk;
import com.settlein.backend.repository.CityKnowledgeChunkRepository;
import com.settlein.backend.service.EmbeddingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CityKnowledgeInitializer implements CommandLineRunner {

    private final CityKnowledgeChunkRepository knowledgeRepository;
    private final EmbeddingService embeddingService;

    @Override
    public void run(String... args) {
        if (knowledgeRepository.count() > 0) {
            log.info("City knowledge base already populated with {} chunks.", knowledgeRepository.count());
            return;
        }

        log.info("Initializing city knowledge base with RAG document chunks for Noida, Delhi, and Bengaluru...");

        List<CityKnowledgeChunk> chunks = new ArrayList<>();

        // --- NOIDA KNOWLEDGE CHUNKS ---
        chunks.add(createChunk(
                "Noida",
                "Transport",
                "Noida Metro & Connectivity Guide",
                "Noida is served by two main metro lines: the DMRC Blue Line (connecting Electronic City, Sector 62, City Centre directly to Central Delhi) and the NMRC Aqua Line (connecting Sector 51 Noida to Greater Noida Depot). Aqua Line and Blue Line are linked via an eco-friendly e-rickshaw walkway between Sector 51 and Sector 52 stations. For last-mile connectivity, Rapido, Uber Auto, and local shared e-rickshaws (₹10-20 per ride) operate frequently around Sector 62, 18, and 137."
        ));

        chunks.add(createChunk(
                "Noida",
                "Safety",
                "Noida Safety Tips & Emergency Helplines",
                "Noida Emergency Services can be reached at 112 (Single Emergency Helpline) and 1090 (Women Power Line). Safe residential hubs with 24/7 security & high PG density include Sector 62 (IT hub), Sector 18 (Commercial centre), Sector 137 (Gated high-rises), and Sector 50. Night travel tips: Stick to major well-lit main roads like Vishwakarma Road and Noida-Greater Noida Expressway. Avoid poorly lit isolated underpasses late at night without private or app-booked transit."
        ));

        chunks.add(createChunk(
                "Noida",
                "Area Guide",
                "Noida Neighborhood Breakdown & PG Hubs",
                "Sector 62 is Noida's primary IT and educational hub (near Jaypee Institute, Fortis Hospital, and major tech parks) with abundant PG accommodations and tiffin services. Sector 18 is the prime shopping & food hub featuring DLF Mall of India, Atta Market, and metro connectivity. Sector 137 offers modern high-rise apartments with landscaped parks and gated security."
        ));

        // --- DELHI KNOWLEDGE CHUNKS ---
        chunks.add(createChunk(
                "Delhi",
                "Transport",
                "Delhi Metro Network & Transit Systems",
                "Delhi features one of Asia's largest metro networks operated by DMRC. Key lines include the Yellow Line (Gurugram to Samaypur Badli via HUDA City, Hauz Khas, CP, & DU North Campus) and the Blue Line (Dwarka to Noida/Vaishali). Recharging a Metro Smart Card gives a 10% discount on all fares. The first coach in the direction of travel on every train is reserved exclusively for women. DTC AC electric buses can be tracked live using the One Delhi app."
        ));

        chunks.add(createChunk(
                "Delhi",
                "Safety",
                "Delhi Safety Protocols & Emergency Helplines",
                "Delhi Police Emergency Helpline is 112 and Women Helpline is 1091. When traveling late at night, use verified cab services like BluSmart (electric cabs with driver verification), Uber, or Metro until 11:00 PM. Popular safe neighborhoods for students and young professionals include Saket, Hauz Khas, Malviya Nagar, Lajpat Nagar, and GTB Nagar."
        ));

        chunks.add(createChunk(
                "Delhi",
                "Area Guide",
                "Delhi Flatmate & PG Hubs",
                "South Delhi (Malviya Nagar, Saket, Hauz Khas) is ideal for working professionals seeking flatmates, green parks, and vibrant cafes. GTB Nagar and Hudson Lane in North Delhi are famous student hubs near Delhi University with affordable PGs, libraries, and budget food joints."
        ));

        // --- BENGALURU KNOWLEDGE CHUNKS ---
        chunks.add(createChunk(
                "Bengaluru",
                "Transport",
                "Bengaluru Commute & Namma Metro Guide",
                "Bengaluru commute is powered by Namma Metro (Purple Line connecting KSR Bengaluru/Indiranagar to Whitefield, and Green Line connecting Nagasandra to Silk Board/Yelachenahalli). BMTC Volvo AC buses provide extensive city coverage (use Tummoc App for digital bus passes). For short auto rides, use Namma Yatri (zero-commission local auto app), Rapido bike taxis, or Uber/Ola."
        ));

        chunks.add(createChunk(
                "Bengaluru",
                "Safety",
                "Bengaluru Safety & Emergency Info",
                "Bengaluru City Police Helpline is 112 (Namma 112 App offers one-touch GPS emergency dispatch). Bengaluru is generally considered one of India's safest metros for women and working professionals. Safe, active tech hubs with round-the-clock activity include Koramangala, HSR Layout, Indiranagar, and Bellandur."
        ));

        chunks.add(createChunk(
                "Bengaluru",
                "Area Guide",
                "Bengaluru Residential & Startup Hubs",
                "Koramangala is Bengaluru's premier startup and nightlife hub with high density of co-living spaces, flatmate listings, and tiffin services. HSR Layout offers planned grid layouts, parks, and quiet residential streets popular among tech employees working in Outer Ring Road and Electronic City."
        ));

        knowledgeRepository.saveAll(chunks);
        log.info("Successfully seeded {} city knowledge base chunks with dense vector embeddings into database!", chunks.size());
    }

    private CityKnowledgeChunk createChunk(String city, String category, String title, String content) {
        String combinedText = city + " " + category + " " + title + " " + content;
        float[] embedding = embeddingService.generateEmbedding(combinedText);

        return CityKnowledgeChunk.builder()
                .city(city)
                .category(category)
                .title(title)
                .content(content)
                .embedding(embedding)
                .build();
    }
}
