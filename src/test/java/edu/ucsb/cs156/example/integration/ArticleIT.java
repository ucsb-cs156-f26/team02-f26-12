package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.Articles;
import edu.ucsb.cs156.example.repositories.ArticlesRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class ArticleIT {

  @Autowired ArticlesRepository articlesRepository;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_article() throws Exception {
    // arrange
    // id is 1 because @DirtiesContext gives each test a fresh database
    Articles expected =
        Articles.builder()
            .id(1L)
            .title("Spring Boot Guide")
            .url("https://example.com/spring")
            .explanation("A good intro")
            .email("student@ucsb.edu")
            .dateAdded(LocalDateTime.parse("2022-01-03T00:00:00"))
            .build();

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/Articles/post")
                    .param("title", "Spring Boot Guide")
                    .param("url", "https://example.com/spring")
                    .param("explanation", "A good intro")
                    .param("email", "student@ucsb.edu")
                    .param("dateAdded", "2022-01-03T00:00:00")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert: response body
    String expectedJson = mapper.writeValueAsString(expected);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);

    // assert: it was actually saved in the database
    assertEquals(1, articlesRepository.count());
    Articles inDb = articlesRepository.findById(1L).orElseThrow();
    assertEquals("Spring Boot Guide", inDb.getTitle());
    assertEquals("https://example.com/spring", inDb.getUrl());
    assertEquals("A good intro", inDb.getExplanation());
    assertEquals("student@ucsb.edu", inDb.getEmail());
    assertEquals(LocalDateTime.parse("2022-01-03T00:00:00"), inDb.getDateAdded());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_delete_an_article() throws Exception {
    // arrange
    Articles article =
        Articles.builder()
            .title("Old Article")
            .url("https://example.com/old")
            .explanation("Not needed anymore")
            .email("student@ucsb.edu")
            .dateAdded(LocalDateTime.parse("2022-01-03T00:00:00"))
            .build();
    Articles saved = articlesRepository.save(article);
    assertEquals(1, articlesRepository.count());

    // act and assert: the endpoint says it deleted the article
    mockMvc
        .perform(delete("/api/Articles?id=" + saved.getId()).with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Articles with id " + saved.getId() + " deleted"));

    // assert: it is really gone from the database
    assertFalse(articlesRepository.findById(saved.getId()).isPresent());
    assertEquals(0, articlesRepository.count());
  }
}
