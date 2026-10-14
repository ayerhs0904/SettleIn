package com.settlein.backend;

import com.settlein.backend.dto.*;
import com.settlein.backend.entity.*;
import com.settlein.backend.repository.*;
import com.settlein.backend.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SmokeTest {

    // --- Auth Mocks ---
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private com.settlein.backend.config.JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;
    @InjectMocks private AuthService authService;

    // --- Listing Mocks ---
    @Mock private ListingRepository listingRepository;
    @Mock private TrustScoreService trustScoreService;
    @InjectMocks private ListingService listingService;
    private AiSearchService aiSearchService;

    // --- Matching Mocks ---
    @Mock private FlatmatePreferenceRepository preferenceRepository;
    @Mock private FlatmateInteractionRepository interactionRepository;
    @InjectMocks private FlatmateMatchingService matchingService;

    // --- Tiffin Mocks ---
    @Mock private TiffinProviderRepository providerRepository;
    @Mock private TiffinReviewRepository reviewRepository;
    @Mock private SentimentAnalysisService sentimentAnalysisService;
    @InjectMocks private TiffinService tiffinService;

    // --- Chatbot Mocks ---
    @Mock private CityKnowledgeChunkRepository knowledgeRepository;
    private CityChatbotService chatbotService;

    private EmbeddingService embeddingService;

    @BeforeEach
    void setUp() {
        embeddingService = new EmbeddingService();
        aiSearchService = new AiSearchService(listingRepository);
        chatbotService = new CityChatbotService(knowledgeRepository, embeddingService);
    }

    // ==========================================
    // 1. FLOW: SIGNUP & AUTHENTICATION
    // ==========================================
    @Test
    @DisplayName("Smoke Test Flow 1: User Signup & Registration")
    void testUserSignupFlow() {
        RegisterRequest registerReq = RegisterRequest.builder()
                .name("Test Seeker")
                .email("seeker.test@settlein.com")
                .password("password123")
                .role(Role.SEEKER)
                .build();

        when(userRepository.existsByEmail("seeker.test@settlein.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_pass");
        when(jwtService.generateToken(any(User.class))).thenReturn("mock_jwt_token_xyz");

        AuthResponse response = authService.register(registerReq);

        assertNotNull(response);
        assertEquals("mock_jwt_token_xyz", response.getToken());
        assertEquals("Test Seeker", response.getName());
        assertEquals(Role.SEEKER, response.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    // ==========================================
    // 2. FLOW: LISTING CREATION
    // ==========================================
    @Test
    @DisplayName("Smoke Test Flow 2: Property Listing Creation with AI Trust Heuristics")
    void testListingCreationFlow() {
        User owner = User.builder().id(2L).name("Owner John").email("owner@settlein.com").role(Role.OWNER).build();

        ListingRequest request = ListingRequest.builder()
                .title("Sunny 2BHK Balcony Apartment")
                .description("Spacious 2BHK near metro with covered parking and high-speed fiber.")
                .rent(22000.0)
                .location("Sector 62")
                .city("Noida")
                .listingType(ListingType.FLAT)
                .amenities(List.of("WiFi", "AC", "Parking"))
                .images(List.of("https://example.com/flat.jpg"))
                .build();

        Listing savedListing = Listing.builder()
                .id(101L)
                .title(request.getTitle())
                .description(request.getDescription())
                .rent(request.getRent())
                .location(request.getLocation())
                .city(request.getCity())
                .listingType(request.getListingType())
                .amenities(request.getAmenities())
                .images(request.getImages())
                .owner(owner)
                .trustScore(96)
                .trustBadge("VERIFIED")
                .viewCount(0L)
                .build();

        doNothing().when(trustScoreService).evaluateTrustScore(any(Listing.class));
        when(listingRepository.save(any(Listing.class))).thenReturn(savedListing);

        ListingResponse response = listingService.createListing(request, owner);

        assertNotNull(response);
        assertEquals(101L, response.getId());
        assertEquals("Sunny 2BHK Balcony Apartment", response.getTitle());
        assertEquals(22000.0, response.getRent());
        assertEquals("Noida", response.getCity());
        assertTrue(response.getTrustScore() >= 90);
    }

    // ==========================================
    // 3. FLOW: AI NATURAL LANGUAGE SEARCH
    // ==========================================
    @Test
    @DisplayName("Smoke Test Flow 3: Natural Language AI Property Search")
    void testAiSearchFlow() {
        User owner = User.builder().id(2L).name("Owner John").build();

        Listing matchingListing = Listing.builder()
                .id(101L)
                .title("Cozy PG with AC and High Speed WiFi")
                .description("Comfortable paying guest with food included")
                .rent(12000.0)
                .location("Sector 62")
                .city("Noida")
                .listingType(ListingType.PG)
                .amenities(List.of("AC", "WiFi", "Food"))
                .images(Collections.emptyList())
                .owner(owner)
                .build();

        Page<Listing> page = new PageImpl<>(List.of(matchingListing));
        when(listingRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        AiSearchResponse searchResult = aiSearchService.searchWithAi("Need a PG in Sector 62 under 15k with AC", PageRequest.of(0, 10));

        assertNotNull(searchResult);
        assertNotNull(searchResult.getParsedFilters());
        assertEquals(ListingType.PG, searchResult.getParsedFilters().getListingType());
        assertEquals(15000.0, searchResult.getParsedFilters().getMaxRent());
        assertEquals(1, searchResult.getListings().getContent().size());
        assertEquals(101L, searchResult.getListings().getContent().get(0).getId());
    }

    // ==========================================
    // 4. FLOW: FLATMATE MATCHING & VECTOR EMBEDDINGS
    // ==========================================
    @Test
    @DisplayName("Smoke Test Flow 4: Roommate Matching with Vector Cosine Similarity")
    void testFlatmateMatchingFlow() {
        User user1 = User.builder().id(10L).name("Alice").build();
        User user2 = User.builder().id(20L).name("Bob").build();

        // 16-dimensional normalized vectors
        float[] vectorA = embeddingService.generateEmbedding("Night owl software engineer remote clean");
        float[] vectorB = embeddingService.generateEmbedding("Night owl software developer hybrid clean");

        FlatmatePreference pref1 = FlatmatePreference.builder()
                .id(1L).user(user1).sleepSchedule("Night Owl").cleanliness("Clean").embedding(vectorA).build();
        FlatmatePreference pref2 = FlatmatePreference.builder()
                .id(2L).user(user2).sleepSchedule("Night Owl").cleanliness("Clean").embedding(vectorB).build();

        when(preferenceRepository.findByUserId(10L)).thenReturn(Optional.of(pref1));
        when(interactionRepository.findInteractedUserIdsByFromUser(user1)).thenReturn(Collections.emptyList());
        when(preferenceRepository.findAll()).thenReturn(List.of(pref1, pref2));

        List<FlatmateMatchResponse> matches = matchingService.findTopMatches(user1, 5);

        assertNotNull(matches);
        assertEquals(1, matches.size());
        assertEquals(20L, matches.get(0).getMatchUserId());
        assertTrue(matches.get(0).getCompatibilityScore() >= 60.0, "Compatibility score should be calculated from embedding similarity");
    }

    // ==========================================
    // 5. FLOW: TIFFIN MARKETPLACE & BROWSING
    // ==========================================
    @Test
    @DisplayName("Smoke Test Flow 5: Tiffin Meal Provider Marketplace")
    void testTiffinBrowsingFlow() {
        User owner = User.builder().id(2L).name("Chef Sunita").build();

        TiffinProvider provider = TiffinProvider.builder()
                .id(50L)
                .name("Shree Krishna Pure Veg Tiffin")
                .cuisineType("North Indian")
                .pricePerMonth(3500.0)
                .area("Sector 62")
                .city("Noida")
                .dietaryOptions(List.of("Pure Veg", "Jain Available"))
                .owner(owner)
                .reviews(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();

        when(providerRepository.filterProviders(eq("Sector 62"), eq("Noida"), eq(4000.0)))
                .thenReturn(List.of(provider));

        List<TiffinProviderResponse> results = tiffinService.getAllProviders("Sector 62", "Noida", 4000.0);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Shree Krishna Pure Veg Tiffin", results.get(0).getName());
        assertEquals(3500.0, results.get(0).getPricePerMonth());
    }

    // ==========================================
    // 6. FLOW: HYPERLOCAL CITY CHATBOT
    // ==========================================
    @Test
    @DisplayName("Smoke Test Flow 6: Local City Guide RAG Chatbot")
    void testCityChatbotFlow() {
        float[] chunkVector = embeddingService.generateEmbedding("Noida Metro Blue Line Aqua Line Sector 62");

        CityKnowledgeChunk chunk = CityKnowledgeChunk.builder()
                .id(1L)
                .city("Noida")
                .category("Transport")
                .title("Noida Metro Network")
                .content("Noida is connected via DMRC Blue Line and NMRC Aqua Line with e-rickshaw links.")
                .embedding(chunkVector)
                .build();

        when(knowledgeRepository.findByCityIgnoreCase("Noida")).thenReturn(List.of(chunk));

        CityChatRequest chatReq = CityChatRequest.builder()
                .city("Noida")
                .message("How is the metro connectivity in Noida?")
                .build();

        CityChatResponse chatResp = chatbotService.askCityQuestion(chatReq);

        assertNotNull(chatResp);
        assertEquals("NOIDA", chatResp.getCity());
        assertTrue(chatResp.getAnswer().contains("Noida Metro Network"));
        assertFalse(chatResp.getSources().isEmpty());
        assertTrue(chatResp.getConfidenceScore() > 50.0);
    }
}
