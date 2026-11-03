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
public class MenuItemReviewWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_menuitemreview() throws Exception {
    setupUser(true);

    page.getByText("MenuItemReview", new Page.GetByTextOptions().setExact(true)).click();

    page.getByText("Create MenuItemReview", new Page.GetByTextOptions().setExact(true)).click();
    assertThat(page.getByText("Create New MenuItemReview")).isVisible();
    page.getByTestId("MenuItemReviewForm-itemId").fill("27");
    page.getByTestId("MenuItemReviewForm-reviewerEmail").fill("cgaucho@ucsb.edu");
    page.getByTestId("MenuItemReviewForm-stars").fill("4");
    page.getByTestId("MenuItemReviewForm-dateReviewed").fill("2026-01-01T12:00");
    page.getByTestId("MenuItemReviewForm-comments").fill("The apple pie was great");
    page.getByTestId("MenuItemReviewForm-submit").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-comments"))
        .hasText("The apple pie was great");

    page.getByTestId("MenuItemReviewTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit MenuItemReview")).isVisible();
    page.getByTestId("MenuItemReviewForm-itemId").fill("27");
    page.getByTestId("MenuItemReviewForm-reviewerEmail").fill("cgaucho@ucsb.edu");
    page.getByTestId("MenuItemReviewForm-stars").fill("5");
    page.getByTestId("MenuItemReviewForm-dateReviewed").fill("2026-01-01T12:00");
    page.getByTestId("MenuItemReviewForm-comments").fill("Even better the second time");
    page.getByTestId("MenuItemReviewForm-submit").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-comments"))
        .hasText("Even better the second time");

    page.getByTestId("MenuItemReviewTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-comments")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_menuitemreview() throws Exception {
    setupUser(false);

    page.getByText("MenuItemReview", new Page.GetByTextOptions().setExact(true)).click();

    assertThat(page.getByText("Create MenuItemReview", new Page.GetByTextOptions().setExact(true)))
        .not()
        .isVisible();
    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-comments")).not().isVisible();
  }
}
