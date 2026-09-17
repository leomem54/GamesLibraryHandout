package ch.diethelm.backend.controller;

import ch.diethelm.backend.model.Game;
import ch.diethelm.backend.repository.GameRepository;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class GameControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private GameRepository gameRepository;

    @BeforeEach
    void clearDatabase() {
        gameRepository.deleteAll();
    }

    @Test
    void createGame_withValidData_returnsCreatedGameWithGeneratedId() throws Exception {
        Game game = game("Integration Test Game", "Beschreibung", LocalDate.of(2020, 5, 12));

        mockMvc.perform(post("/api/games")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(game)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value("Integration Test Game"));
    }

    @Test
    void createGame_withoutTitle_returnsValidationDetails() throws Exception {
        Game game = game(null, "Beschreibung", LocalDate.of(2020, 5, 12));

        mockMvc.perform(post("/api/games")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(game)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validierungsfehler"))
                .andExpect(jsonPath("$.details.title").value("Titel darf nicht leer sein"))
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    @Test
    void createGame_withFutureReleaseDate_returnsBadRequest() throws Exception {
        Game game = game("Future Game", "Beschreibung", LocalDate.now().plusDays(1));

        mockMvc.perform(post("/api/games")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(game)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validierungsfehler"))
                .andExpect(jsonPath("$.details.releaseDate")
                        .value("Erscheinungsdatum darf nicht in der Zukunft liegen"));
    }

    @Test
    void getGameById_withUnknownId_returnsNotFound() throws Exception {
        mockMvc.perform(get("/api/games/{id}", 999999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Spiel mit ID 999999 nicht gefunden"))
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    @Test
    void searchByTitle_findsGameIgnoringCase() throws Exception {
        gameRepository.save(game("Super Mario Odyssey", "Jump and Run", LocalDate.of(2017, 10, 27)));
        gameRepository.save(game("The Witcher 3", "Rollenspiel", LocalDate.of(2015, 5, 19)));

        mockMvc.perform(get("/api/games/search").param("title", "mArIo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Super Mario Odyssey"));
    }

    @Test
    void updateGame_updatesExistingGameAndChangeIsVisibleThroughGet() throws Exception {
        Game existing = gameRepository.save(
                game("Alter Titel", "Alte Beschreibung", LocalDate.of(2018, 1, 1)));
        Game update = game("Neuer Titel", "Neue Beschreibung", LocalDate.of(2021, 6, 15));
        update.setImageUrl("https://example.org/new-image.jpg");

        mockMvc.perform(put("/api/games/{id}", existing.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(existing.getId()))
                .andExpect(jsonPath("$.title").value("Neuer Titel"));

        mockMvc.perform(get("/api/games/{id}", existing.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Neuer Titel"))
                .andExpect(jsonPath("$.description").value("Neue Beschreibung"))
                .andExpect(jsonPath("$.imageUrl").value("https://example.org/new-image.jpg"))
                .andExpect(jsonPath("$.releaseDate").value("2021-06-15"));
    }

    @Test
    void deleteGame_deletesGame_andSecondAttemptReturnsNotFound() throws Exception {
        Game existing = gameRepository.save(
                game("Zu loeschendes Spiel", "Beschreibung", LocalDate.of(2019, 3, 4)));

        mockMvc.perform(delete("/api/games/{id}", existing.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/api/games/{id}", existing.getId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message")
                        .value("Spiel mit ID " + existing.getId() + " nicht gefunden"));
    }

    private Game game(String title, String description, LocalDate releaseDate) {
        return Game.builder()
                .title(title)
                .description(description)
                .imageUrl("https://example.org/image.jpg")
                .releaseDate(releaseDate)
                .build();
    }
}

