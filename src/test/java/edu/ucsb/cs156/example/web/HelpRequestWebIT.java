package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

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
public class HelpRequestWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_and_delete_helprequest() throws Exception {
    setupUser(true);

    page.getByText("HelpRequest").click();

    page.getByText("Create HelpRequest").click();
    assertThat(page.getByText("Create New HelpRequest")).isVisible();

    page.getByTestId("HelpRequestForm-requesterEmail").fill("cgaucho@ucsb.edu");
    page.getByTestId("HelpRequestForm-teamId").fill("f26-12");
    page.getByTestId("HelpRequestForm-tableOrBreakoutRoom").fill("Table 5");
    page.getByTestId("HelpRequestForm-requestTime").fill("2026-11-02T12:00");
    page.getByTestId("HelpRequestForm-explanation").fill("Need help with tests");
    page.getByTestId("HelpRequestForm-submit").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation"))
        .hasText("Need help with tests");

    page.getByTestId("HelpRequestTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_helprequest() throws Exception {
    setupUser(false);

    page.getByText("HelpRequest").click();

    assertThat(page.getByText("Create HelpRequest")).not().isVisible();
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation")).not().isVisible();
  }
}
