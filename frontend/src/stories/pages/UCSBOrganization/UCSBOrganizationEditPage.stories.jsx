import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import { http, HttpResponse } from "msw";
import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";

export default {
  title: "pages/UCSBOrganization/UCSBOrganizationEditPage",
  component: UCSBOrganizationEditPage,
};

const Template = () => <UCSBOrganizationEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.adminUser),
    ),
    http.get("/api/systemInfo", () =>
      HttpResponse.json(systemInfoFixtures.showingNeither),
    ),
    http.get("/api/UCSBOrganization", () =>
      HttpResponse.json(ucsbOrganizationFixtures.oneOrganization[0]),
    ),
    http.put("/api/UCSBOrganization", async ({ request }) =>
      HttpResponse.json(await request.json()),
    ),
  ],
};
