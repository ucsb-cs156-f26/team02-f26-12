package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import com.microsoft.playwright.Page;
import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class ArticleWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_article() throws Exception {
    setupUser(true);

    page.getByText("Articles", new Page.GetByTextOptions().setExact(true)).click();

    page.getByText("Create Article", new Page.GetByTextOptions().setExact(true)).click();
    assertThat(page.getByTestId("ArticlesForm-title")).isVisible();
    page.getByTestId("ArticlesForm-title").fill("Spring Boot Guide");
    page.getByTestId("ArticlesForm-url").fill("https://example.com/spring");
    page.getByTestId("ArticlesForm-explanation").fill("A good intro");
    page.getByTestId("ArticlesForm-email").fill("student@ucsb.edu");
    page.getByTestId("ArticlesForm-dateAdded").fill("2022-01-03T12:00");
    page.getByTestId("ArticlesForm-submit").click();

    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title")).hasText("Spring Boot Guide");

    page.getByTestId("ArticlesTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Article", new Page.GetByTextOptions().setExact(true)))
        .isVisible();
    page.getByTestId("ArticlesForm-title").fill("Updated Title");
    page.getByTestId("ArticlesForm-submit").click();

    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title")).hasText("Updated Title");

    page.getByTestId("ArticlesTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_article() throws Exception {
    setupUser(false);

    page.getByText("Articles", new Page.GetByTextOptions().setExact(true)).click();

    assertThat(page.getByText("Create Article", new Page.GetByTextOptions().setExact(true)))
        .not()
        .isVisible();
    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title")).not().isVisible();
  }
}
